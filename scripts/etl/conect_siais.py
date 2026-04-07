#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
conect_siais.py - Sistema inteligente de descarga histórica SIAIS
Mantiene un JSON con datos de enero a la fecha actual
Solo descarga meses faltantes y actualiza el mes en curso
"""

import pymssql
import pymysql
import sys
import json
import os
from pathlib import Path
from decimal import Decimal
from datetime import datetime, date

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_OUTPUT_DIR = BASE_DIR / "data" / "output"


def read_env(name, default=""):
    return os.getenv(name, default).strip()


SIAIS_DB_CONFIG = {
    "user": read_env("FT_SIAIS_DB_USER"),
    "password": read_env("FT_SIAIS_DB_PASSWORD"),
    "database": read_env("FT_SIAIS_DB_NAME", "DEMO_DB"),
    "port": int(read_env("FT_SIAIS_DB_PORT", "15433")),
}

LOCAL_MYSQL_CONFIG = {
    "host": read_env("FT_LOCAL_DB_HOST", "localhost"),
    "user": read_env("FT_LOCAL_DB_USER"),
    "password": read_env("FT_LOCAL_DB_PASSWORD"),
    "database": read_env("FT_LOCAL_DB_NAME", "ciae"),
    "port": int(read_env("FT_LOCAL_DB_PORT", "3306")),
}


def get_siais_servers():
    raw_servers = read_env("FT_SIAIS_SERVER_LIST", "")
    if raw_servers:
        return [item.strip() for item in raw_servers.split(",") if item.strip()]
    return [
        "192.0.2.10",
        "192.0.2.11",
    ]


def convert_decimal(value):
    """Convierte valores Decimal a float para serialización JSON"""
    if isinstance(value, Decimal):
        return float(value)
    elif isinstance(value, datetime):
        return value.isoformat()
    return value


def generar_periodos_requeridos():
    """Genera lista de periodos desde enero del año actual hasta el mes actual"""
    año_actual = date.today().year
    mes_actual = date.today().month

    periodos = []
    for mes in range(1, mes_actual + 1):
        periodo = int(f"{año_actual}{mes:02d}")  # Formato YYYYMM (202501, 202502, etc.)
        periodos.append(periodo)

    return periodos, mes_actual, año_actual


def cargar_datos_existentes(archivo_json):
    """Carga datos existentes del archivo JSON histórico"""
    if os.path.exists(archivo_json):
        try:
            with open(archivo_json, "r", encoding="utf-8") as f:
                datos = json.load(f)
            print(
                f" Archivo histórico encontrado: {len(datos.get('periodos', {}))} periodo(s) existente(s)"
            )
            return datos
        except Exception as e:
            print(f" Error leyendo archivo existente: {e}")
            return crear_estructura_base()
    else:
        print(" No se encontró archivo histórico, creando nuevo")
        return crear_estructura_base()


def crear_estructura_base():
    """Crea la estructura base del JSON histórico"""
    return {
        "metadatos": {
            "fecha_creacion": datetime.now().isoformat(),
            "ultima_actualizacion": datetime.now().isoformat(),
            "año": date.today().year,
            "version": "1.0",
            "descripcion": "Datos históricos SIAIS de enero a la fecha",
        },
        "periodos": {},
        "resumen_anual": {
            "Total de Consultas de la Unidad": 0,
            "Consultas de Medicina Familiar": 0,
            "Consultas de M.F. fin de semana": 0,
            "Consultas Aten 1ra. Vez": 0,
            "Consultas de M.F. Subsecuentes": 0,
            "ESTOMATOLOGIA": 0,
            "SALUD EN EL TRABAJO": 0,
            "ATENCION MEDICA CONTINUA - URGENCIAS": 0,
            "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)": 0,
            "PLANIFICACION FAMILIAR": 0,
            "NUTRICION Y DIETETICA": 0,
            "TRABAJO SOCIAL": 0,
            "MEDICINA PREVENTIVA": 0,
            "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR": 0,
        },
    }


def detectar_periodos_faltantes(datos_existentes, periodos_requeridos, mes_actual):
    """Detecta qué periodos faltan o necesitan actualización"""
    periodos_existentes = set(map(int, datos_existentes.get("periodos", {}).keys()))
    periodos_requeridos_set = set(periodos_requeridos)

    # Periodos que faltan completamente
    periodos_faltantes = periodos_requeridos_set - periodos_existentes

    # El mes actual siempre se actualiza
    periodo_mes_actual = int(f"{date.today().year}{mes_actual:02d}")
    periodos_a_actualizar = periodos_faltantes.copy()
    if periodo_mes_actual in periodos_requeridos_set:
        periodos_a_actualizar.add(periodo_mes_actual)

    return list(periodos_a_actualizar), list(periodos_faltantes)


def ejecutar_consulta_periodo(servidor_ip, periodo, matricula=999999999999):
    """Ejecuta consultas para un periodo específico en un servidor"""

    categorias = {
        "Total de Consultas de la Unidad": {
            "especial": 0,
            "servicio": "TT",
            "campo": "TotalConsul",
        },
        "Consultas de Medicina Familiar": {
            "especial": 0,
            "servicio": "04",
            "campo": "TotalConsul",
        },
        "Consultas de M.F. fin de semana": {
            "especial": 6,
            "servicio": "04",
            "campo": "TotalConsul",
        },
        "Consultas Aten 1ra. Vez": {
            "especial": 6,
            "servicio": "04",
            "campo": "Aten1aVez",
        },
        "ESTOMATOLOGIA": {"especial": 0, "servicio": "17", "campo": "TotalConsul"},
        "SALUD EN EL TRABAJO": {
            "especial": 0,
            "servicio": "56",
            "campo": "TotalConsul",
        },
        "ATENCION MEDICA CONTINUA - URGENCIAS": {
            "especial": 0,
            "servicio": "5A",
            "campo": "TotalConsul",
        },
        "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)": {
            "especial": 0,
            "servicio": "DM",
            "campo": "TotalConsul",
        },
        "PLANIFICACION FAMILIAR": {
            "especial": 0,
            "servicio": "PF",
            "campo": "TotalConsul",
        },
        "NUTRICION Y DIETETICA": {
            "especial": 1,
            "servicio": "66",
            "campo": "TotalConsul",
        },
        "TRABAJO SOCIAL": {"especial": 1, "servicio": "69", "campo": "TotalConsul"},
        "MEDICINA PREVENTIVA": {
            "especial": 1,
            "servicio": "80",
            "campo": "TotalConsul",
        },
        "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR": {
            "especial": 1,
            "servicio": "87",
            "campo": "TotalConsul",
        },
    }

    try:
        if not SIAIS_DB_CONFIG["user"] or not SIAIS_DB_CONFIG["password"]:
            raise RuntimeError(
                "Faltan variables de entorno FT_SIAIS_DB_USER y FT_SIAIS_DB_PASSWORD"
            )

        # Conexión a SQL Server
        conn = pymssql.connect(
            server=f"{servidor_ip}:{SIAIS_DB_CONFIG['port']}",
            user=SIAIS_DB_CONFIG["user"],
            password=SIAIS_DB_CONFIG["password"],
            database=SIAIS_DB_CONFIG["database"],
            timeout=30,
        )
        cursor = conn.cursor(as_dict=True)

        # Conexión a base local MySQL
        try:
            local_conn = pymysql.connect(
                host=LOCAL_MYSQL_CONFIG["host"],
                user=LOCAL_MYSQL_CONFIG["user"],
                password=LOCAL_MYSQL_CONFIG["password"],
                database=LOCAL_MYSQL_CONFIG["database"],
                port=LOCAL_MYSQL_CONFIG["port"],
            )
            local_cursor = local_conn.cursor()
        except:
            local_conn = None
            local_cursor = None

        # Obtener servidor info
        cursor.execute("SELECT @@SERVERNAME as servidor")
        servidor_info = cursor.fetchone()
        nombre_servidor = servidor_info["servidor"] if servidor_info else servidor_ip

        resultado_servidor = {
            "servidor_ip": servidor_ip,
            "servidor_nombre": nombre_servidor,
            "periodo": periodo,
            "matricula": matricula,
            "fecha_consulta": datetime.now().isoformat(),
            "categorias": {},
            "claves_presupuestales": {},
        }

        # Obtener claves presupuestales - USAR PERIODO DIRECTO
        cursor.execute(
            """
            SELECT DISTINCT CvePresup 
            FROM tb_Parte_Uno_UM 
            WHERE Periodo = %s AND Matricula = %s
        """,
            (periodo, matricula),
        )

        claves_presup = cursor.fetchall()

        for clave_row in claves_presup:
            cve_presup = clave_row["CvePresup"]

            # Buscar nombre de unidad
            nombre_unidad = "Desconocida"
            if local_cursor:
                try:
                    local_cursor.execute(
                        "SELECT unidad FROM claves_up WHERE clave = %s", (cve_presup,)
                    )
                    unidad_result = local_cursor.fetchone()
                    nombre_unidad = unidad_result[0] if unidad_result else "Desconocida"
                except:
                    pass

            resultado_servidor["claves_presupuestales"][cve_presup] = {
                "nombre_unidad": nombre_unidad,
                "categorias": {},
            }

            # Consultas por categoría
            for categoria, config in categorias.items():
                query = f"""
                SELECT {config["campo"]}, Servicio, Especial, CvePresup
                FROM tb_Parte_Uno_UM 
                WHERE Periodo = %s AND Matricula = %s AND CvePresup = %s
                AND Especial = %s AND Servicio = %s
                """

                cursor.execute(
                    query,
                    (
                        periodo,
                        matricula,
                        cve_presup,
                        config["especial"],
                        config["servicio"],
                    ),
                )
                resultado = cursor.fetchone()

                if resultado:
                    valor = convert_decimal(resultado[config["campo"]])
                    resultado_servidor["claves_presupuestales"][cve_presup][
                        "categorias"
                    ][categoria] = {
                        "valor": valor,
                        "servicio": resultado["Servicio"],
                        "especial": resultado["Especial"],
                    }

                    if categoria not in resultado_servidor["categorias"]:
                        resultado_servidor["categorias"][categoria] = 0
                    resultado_servidor["categorias"][categoria] += valor
                else:
                    resultado_servidor["claves_presupuestales"][cve_presup][
                        "categorias"
                    ][categoria] = {
                        "valor": 0,
                        "servicio": config["servicio"],
                        "especial": config["especial"],
                    }

        # Calcular subsecuentes
        if (
            "Consultas de M.F. fin de semana" in resultado_servidor["categorias"]
            and "Consultas Aten 1ra. Vez" in resultado_servidor["categorias"]
        ):
            subsecuentes = (
                resultado_servidor["categorias"]["Consultas de M.F. fin de semana"]
                - resultado_servidor["categorias"]["Consultas Aten 1ra. Vez"]
            )
            resultado_servidor["categorias"]["Consultas de M.F. Subsecuentes"] = (
                subsecuentes
            )

        # Cerrar conexiones
        conn.close()
        if local_conn:
            local_conn.close()

        return resultado_servidor

    except Exception as e:
        return {"servidor_ip": servidor_ip, "error": str(e), "status": "error"}


def procesar_periodo(periodo, servidores):
    """Procesa todos los servidores para un periodo específico"""
    print(f"\n Procesando periodo: {periodo}")

    resultados_periodo = {
        "periodo": periodo,
        "fecha_procesamiento": datetime.now().isoformat(),
        "servidores": [],
        "resumen_periodo": {
            "Total de Consultas de la Unidad": 0,
            "Consultas de Medicina Familiar": 0,
            "Consultas de M.F. fin de semana": 0,
            "Consultas Aten 1ra. Vez": 0,
            "Consultas de M.F. Subsecuentes": 0,
            "ESTOMATOLOGIA": 0,
            "SALUD EN EL TRABAJO": 0,
            "ATENCION MEDICA CONTINUA - URGENCIAS": 0,
            "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)": 0,
            "PLANIFICACION FAMILIAR": 0,
            "NUTRICION Y DIETETICA": 0,
            "TRABAJO SOCIAL": 0,
            "MEDICINA PREVENTIVA": 0,
            "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR": 0,
        },
    }

    for i, servidor in enumerate(servidores, 1):
        print(f"   [{i}/{len(servidores)}] Servidor: {servidor}")

        resultado_servidor = ejecutar_consulta_periodo(servidor, periodo)
        resultados_periodo["servidores"].append(resultado_servidor)

        if "error" not in resultado_servidor and "categorias" in resultado_servidor:
            for categoria, valor in resultado_servidor["categorias"].items():
                if categoria in resultados_periodo["resumen_periodo"]:
                    resultados_periodo["resumen_periodo"][categoria] += valor

    return resultados_periodo


def recalcular_resumen_anual(datos_historicos):
    """Recalcula el resumen anual basado en todos los periodos"""
    resumen = {
        "Total de Consultas de la Unidad": 0,
        "Consultas de Medicina Familiar": 0,
        "Consultas de M.F. fin de semana": 0,
        "Consultas Aten 1ra. Vez": 0,
        "Consultas de M.F. Subsecuentes": 0,
        "ESTOMATOLOGIA": 0,
        "SALUD EN EL TRABAJO": 0,
        "ATENCION MEDICA CONTINUA - URGENCIAS": 0,
        "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)": 0,
        "PLANIFICACION FAMILIAR": 0,
        "NUTRICION Y DIETETICA": 0,
        "TRABAJO SOCIAL": 0,
        "MEDICINA PREVENTIVA": 0,
        "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR": 0,
    }

    for periodo_data in datos_historicos["periodos"].values():
        if "resumen_periodo" in periodo_data:
            for categoria, valor in periodo_data["resumen_periodo"].items():
                if categoria in resumen:
                    resumen[categoria] += valor

    return resumen


def main():
    """Función principal del sistema inteligente"""
    print(" SISTEMA INTELIGENTE DE DESCARGA HISTÓRICA SIAIS")
    print("Enero a la fecha - Solo descarga lo necesario")
    print("=" * 70)

    # Configuración
    archivo_json = str(DATA_OUTPUT_DIR / "siais_historico_completo.json")
    os.makedirs(DATA_OUTPUT_DIR, exist_ok=True)
    servidores = get_siais_servers()

    # Generar periodos requeridos
    periodos_requeridos, mes_actual, año_actual = generar_periodos_requeridos()
    print(f" Año: {año_actual}, Mes actual: {mes_actual}")
    print(f" Periodos requeridos: {periodos_requeridos}")

    # Cargar datos existentes
    datos_historicos = cargar_datos_existentes(archivo_json)

    # Detectar qué necesita descargarse
    periodos_a_procesar, periodos_faltantes = detectar_periodos_faltantes(
        datos_historicos, periodos_requeridos, mes_actual
    )

    print(f"\n ANÁLISIS:")
    print(f"    Periodos faltantes: {periodos_faltantes}")
    print(f"    Periodos a procesar: {periodos_a_procesar}")

    if not periodos_a_procesar:
        print(" Todos los datos están actualizados")

        # Mostrar resumen actual
        print(f"\n RESUMEN ANUAL {año_actual}:")
        for categoria, total in datos_historicos["resumen_anual"].items():
            if total > 0:
                print(f"   {categoria}: {total:,}")
        return

    # Procesar periodos necesarios
    for periodo in sorted(periodos_a_procesar):
        resultado_periodo = procesar_periodo(periodo, servidores)
        datos_historicos["periodos"][str(periodo)] = resultado_periodo

        # Guardar después de cada periodo (backup automático)
        datos_historicos["metadatos"]["ultima_actualizacion"] = (
            datetime.now().isoformat()
        )
        with open(archivo_json, "w", encoding="utf-8") as f:
            json.dump(datos_historicos, f, ensure_ascii=False, indent=2)

        print(f"    Periodo {periodo} guardado")

    # Recalcular resumen anual
    datos_historicos["resumen_anual"] = recalcular_resumen_anual(datos_historicos)

    # Guardar archivo final
    with open(archivo_json, "w", encoding="utf-8") as f:
        json.dump(datos_historicos, f, ensure_ascii=False, indent=2)

    print(f"\n PROCESO COMPLETADO")
    print(f" Archivo: {archivo_json}")
    print(f" Periodos en archivo: {len(datos_historicos['periodos'])}")
    print(f" Resumen anual actualizado")

    # Mostrar resumen
    print(f"\n RESUMEN ANUAL {año_actual}:")
    for categoria, total in datos_historicos["resumen_anual"].items():
        if total > 0:
            print(f"   {categoria}: {total:,}")


if __name__ == "__main__":
    main()
