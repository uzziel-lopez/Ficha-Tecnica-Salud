#!/usr/bin/env python3
"""
Script para consolidar datos de productividad SIAIS para OOAD
Consolida datos de todas las unidades de Tabasco por periodo
"""

import json
from datetime import datetime
from pathlib import Path

# Importar funciones del integrador para reutilizarlas
import sys
import os

# Agregar path del integrador
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_INPUT_DIR = BASE_DIR / "data" / "input"
DATA_OUTPUT_DIR = BASE_DIR / "data" / "output"


def cargar_siais_historico():
    """Carga el archivo SIAIS histórico"""
    try:
        with open(
            DATA_OUTPUT_DIR / "siais_historico_completo.json", "r", encoding="utf-8"
        ) as f:
            return json.load(f)
    except Exception as e:
        print(f" Error cargando SIAIS histórico: {e}")
        return None


def cargar_fichas_completas():
    """Carga las fichas completas para obtener claves presupuestales de Tabasco"""
    try:
        with open(
            DATA_OUTPUT_DIR / "fichas_completas_con_recursos.json",
            "r",
            encoding="utf-8",
        ) as f:
            data = json.load(f)
            return data["unidades"]
    except Exception as e:
        print(f" Error cargando fichas completas: {e}")
        return []


def obtener_claves_tabasco(unidades):
    """Obtiene todas las claves presupuestales de las 36 unidades de Tabasco"""
    claves = []
    for unidad in unidades:
        if "datos_administrativos_completos" in unidad["informacion_general"]:
            clave = unidad["informacion_general"][
                "datos_administrativos_completos"
            ].get("Clave Presupuestal") or unidad["informacion_general"][
                "datos_administrativos_completos"
            ].get("Clave Personal")
            if clave:
                claves.append(str(clave))
    return claves


def consolidar_productividad_medicina_familiar(siais_data, claves_tabasco):
    """Consolida productividad de medicina familiar para OOAD"""

    indicadores = [
        "Total de Consultas de la Unidad",
        "Consultas de Medicina Familiar",
        "Consultas de M.F. fin de semana",
        "Consultas Aten 1ra. Vez",
        "Consultas de M.F. Subsecuentes",
    ]

    # Estructura: {indicador: {mes: total}}
    consolidado = {ind: {} for ind in indicadores}

    # Procesar cada periodo
    for periodo_key, periodo_data in siais_data.get("periodos", {}).items():
        # Extraer año y mes del periodo (formato: YYYYMM)
        año = int(str(periodo_key)[:4])
        mes_num = int(str(periodo_key)[4:6])

        # Solo periodos del año actual
        año_actual = datetime.now().year
        if año != año_actual:
            continue

        meses_nombres = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ]
        mes_nombre = meses_nombres[mes_num - 1]

        # Sumar valores de todas las unidades de Tabasco
        for servidor in periodo_data.get("servidores", []):
            for clave in claves_tabasco:
                if clave in servidor.get("claves_presupuestales", {}):
                    unidad_data = servidor["claves_presupuestales"][clave]
                    categorias = unidad_data.get("categorias", {})

                    for indicador in indicadores:
                        if indicador in categorias:
                            valor = categorias[indicador].get("valor", 0)
                            if mes_nombre not in consolidado[indicador]:
                                consolidado[indicador][mes_nombre] = 0
                            consolidado[indicador][mes_nombre] += valor

    # Calcular totales acumulados
    resultado = {}
    for indicador in indicadores:
        meses_data = consolidado[indicador]
        total_acumulado = sum(meses_data.values())
        resultado[indicador] = {"meses": meses_data, "total_acumulado": total_acumulado}

    # Calcular Consultas de M.F. Subsecuentes = Medicina Familiar - Aten 1ra. Vez
    if (
        "Consultas de Medicina Familiar" in resultado
        and "Consultas Aten 1ra. Vez" in resultado
    ):
        mf_meses = resultado["Consultas de Medicina Familiar"]["meses"]
        primera_vez_meses = resultado["Consultas Aten 1ra. Vez"]["meses"]

        subsecuentes_meses = {}
        for mes in mf_meses:
            mf_valor = mf_meses.get(mes, 0)
            primera_vez_valor = primera_vez_meses.get(mes, 0)
            subsecuentes_meses[mes] = max(
                0, mf_valor - primera_vez_valor
            )  # No permitir negativos

        total_subsecuentes = sum(subsecuentes_meses.values())
        resultado["Consultas de M.F. Subsecuentes"] = {
            "meses": subsecuentes_meses,
            "total_acumulado": total_subsecuentes,
        }

    return resultado


def consolidar_productividad_servicios(siais_data, claves_tabasco):
    """Consolida productividad de servicios para OOAD"""

    servicios = [
        "ESTOMATOLOGIA",
        "SALUD EN EL TRABAJO",
        "ATENCION MEDICA CONTINUA - URGENCIAS",
        "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)",
        "PLANIFICACION FAMILIAR",
        "NUTRICION Y DIETETICA",
        "TRABAJO SOCIAL",
        "MEDICINA PREVENTIVA",
        "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR",
    ]

    consolidado = {serv: {} for serv in servicios}

    for periodo_key, periodo_data in siais_data.get("periodos", {}).items():
        año = int(str(periodo_key)[:4])
        mes_num = int(str(periodo_key)[4:6])

        año_actual = datetime.now().year
        if año != año_actual:
            continue

        meses_nombres = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ]
        mes_nombre = meses_nombres[mes_num - 1]

        for servidor in periodo_data.get("servidores", []):
            for clave in claves_tabasco:
                if clave in servidor.get("claves_presupuestales", {}):
                    unidad_data = servidor["claves_presupuestales"][clave]
                    categorias = unidad_data.get("categorias", {})

                    for servicio in servicios:
                        if servicio in categorias:
                            valor = categorias[servicio].get("valor", 0)
                            if mes_nombre not in consolidado[servicio]:
                                consolidado[servicio][mes_nombre] = 0
                            consolidado[servicio][mes_nombre] += valor

    resultado = {}
    for servicio in servicios:
        meses_data = consolidado[servicio]
        total_acumulado = sum(meses_data.values())
        resultado[servicio] = {"meses": meses_data, "total_acumulado": total_acumulado}

    return resultado


def consolidar_diagnosticos_egresos_ooad(datos_egresos_hospital, claves_hospitales):
    """Consolida diagnósticos de egreso de todos los hospitales de Tabasco"""

    # Diccionario para acumular conteos: {diagnostico: total}
    diagnosticos_consolidados = {}

    # Sumar diagnósticos de todos los hospitales
    for clave in claves_hospitales:
        if clave in datos_egresos_hospital:
            for diagnostico, total in datos_egresos_hospital[clave].items():
                if diagnostico not in diagnosticos_consolidados:
                    diagnosticos_consolidados[diagnostico] = 0
                diagnosticos_consolidados[diagnostico] += total

    # Ordenar por total y tomar top 25
    top_diagnosticos = sorted(
        diagnosticos_consolidados.items(), key=lambda x: x[1], reverse=True
    )[:25]

    return [{"codigo": codigo, "total": total} for codigo, total in top_diagnosticos]


def consolidar_procedimientos_quirurgicos_ooad(
    datos_intervenciones_hospital, claves_hospitales
):
    """Consolida procedimientos quirúrgicos de todos los hospitales de Tabasco"""

    # Diccionario para acumular conteos: {procedimiento: total}
    procedimientos_consolidados = {}

    # Sumar procedimientos de todos los hospitales
    for clave in claves_hospitales:
        if clave in datos_intervenciones_hospital:
            for procedimiento, total in datos_intervenciones_hospital[clave].items():
                if procedimiento not in procedimientos_consolidados:
                    procedimientos_consolidados[procedimiento] = 0
                procedimientos_consolidados[procedimiento] += total

    # Ordenar por total y tomar top 25
    top_procedimientos = sorted(
        procedimientos_consolidados.items(), key=lambda x: x[1], reverse=True
    )[:25]

    return [{"codigo": codigo, "total": total} for codigo, total in top_procedimientos]


def consolidar_consulta_externa_ooad(archivo_excel, claves_hospitales, catalogo_cie10):
    """
    Consolida motivos de consulta externa de todos los hospitales de Tabasco
    Retorna especialidades y urgencias consolidadas
    """
    from integrador_recursos_fichas import procesar_consulta_externa_motivos_hospital

    print(f"\n    Consolidando motivos de consulta externa para OOAD...")

    # Diccionarios para acumular
    diagnosticos_especialidades = {}
    diagnosticos_urgencias = {}

    # Procesar cada hospital
    for clave in claves_hospitales:
        motivos = procesar_consulta_externa_motivos_hospital(
            archivo_excel, clave, catalogo_cie10
        )

        if motivos:
            # Sumar especialidades
            for item in motivos.get("especialidades", []):
                codigo = item["clave"]
                total = item["total"]
                if codigo not in diagnosticos_especialidades:
                    diagnosticos_especialidades[codigo] = 0
                diagnosticos_especialidades[codigo] += total

            # Sumar urgencias
            for item in motivos.get("urgencias", []):
                codigo = item["clave"]
                total = item["total"]
                if codigo not in diagnosticos_urgencias:
                    diagnosticos_urgencias[codigo] = 0
                diagnosticos_urgencias[codigo] += total

    # Ordenar y tomar top 25
    top_especialidades = sorted(
        diagnosticos_especialidades.items(), key=lambda x: x[1], reverse=True
    )[:25]
    top_urgencias = sorted(
        diagnosticos_urgencias.items(), key=lambda x: x[1], reverse=True
    )[:25]

    # Agregar descripciones
    especialidades_con_desc = []
    for codigo, total in top_especialidades:
        especialidades_con_desc.append(
            {
                "clave": codigo,
                "descripcion": catalogo_cie10.get(codigo, "Sin descripción"),
                "total": total,
            }
        )

    urgencias_con_desc = []
    for codigo, total in top_urgencias:
        urgencias_con_desc.append(
            {
                "clave": codigo,
                "descripcion": catalogo_cie10.get(codigo, "Sin descripción"),
                "total": total,
            }
        )

    print(
        f"    Consolidadas {len(especialidades_con_desc)} especialidades y {len(urgencias_con_desc)} urgencias"
    )

    return {
        "especialidades_consulta": especialidades_con_desc,
        "urgencias_consulta": urgencias_con_desc,
    }


def main():
    print(" CONSOLIDADOR DE PRODUCTIVIDAD OOAD DESDE SIAIS")
    print("=" * 60)

    # 1. Cargar datos
    print("\n Cargando datos...")
    siais_data = cargar_siais_historico()
    if not siais_data:
        return

    unidades = cargar_fichas_completas()
    if not unidades:
        return

    # 2. Obtener claves presupuestales
    print(" Obteniendo claves presupuestales de Tabasco...")
    claves_tabasco = obtener_claves_tabasco(unidades)
    print(f"   Encontradas {len(claves_tabasco)} claves presupuestales")

    # 3. Consolidar productividad medicina familiar
    print("\n Consolidando Productividad Medicina Familiar...")
    prod_mf = consolidar_productividad_medicina_familiar(siais_data, claves_tabasco)
    print(f"    {len(prod_mf)} indicadores consolidados")

    # 4. Consolidar productividad servicios
    print(" Consolidando Productividad Servicios...")
    prod_servicios = consolidar_productividad_servicios(siais_data, claves_tabasco)
    print(f"    {len(prod_servicios)} servicios consolidados")

    # 5. Obtener claves de hospitales (para motivos hospitalarios)
    claves_hospitales = []
    for unidad in unidades:
        tipo = unidad.get("informacion_general", {}).get("tipo_unidad", "")
        if tipo in [
            "Hospital General de Zona",
            "Hospital General de Subzona",
            "Hospital General de Subzona con Medicina Familiar",
        ]:
            datos_admin = unidad.get("informacion_general", {}).get(
                "datos_administrativos_completos", {}
            )
            clave = datos_admin.get("Clave Presupuestal")
            if clave:
                claves_hospitales.append(str(clave))

    print(f"\n Encontrados {len(claves_hospitales)} hospitales en Tabasco")

    # 6. Cargar datos de egresos e intervenciones (importar funciones)
    try:
        from integrador_recursos_fichas import (
            cargar_egresos_pacientes_hospital,
            cargar_intervenciones_quirurgicas_hospital,
            cargar_catalogo_descripciones,
        )

        print("\n Cargando catálogo de descripciones...")
        catalogo_cie10, catalogo_cie9 = cargar_catalogo_descripciones()

        print("\n Cargando datos de egresos de pacientes...")
        datos_egresos = cargar_egresos_pacientes_hospital(
            str(DATA_INPUT_DIR / "Egresos_Pacientes_2025.xlsx")
        )

        print("\n Cargando datos de intervenciones quirúrgicas...")
        datos_intervenciones = cargar_intervenciones_quirurgicas_hospital(
            str(DATA_INPUT_DIR / "Intervenciones_Quirurgicas_2025.xlsx")
        )

        # 7. Consolidar motivos hospitalarios
        print("\n Consolidando diagnósticos de egreso...")
        diagnosticos_consolidados = consolidar_diagnosticos_egresos_ooad(
            datos_egresos, claves_hospitales
        )

        #  Agregar descripciones
        for diag in diagnosticos_consolidados:
            diag["descripcion"] = catalogo_cie10.get(diag["codigo"], "Sin descripción")

        print(f"    Top 25 diagnósticos consolidados")

        print("\n Consolidando procedimientos quirúrgicos...")
        procedimientos_consolidados = consolidar_procedimientos_quirurgicos_ooad(
            datos_intervenciones, claves_hospitales
        )

        # Agregar descripciones
        for proc in procedimientos_consolidados:
            proc["descripcion"] = catalogo_cie9.get(proc["codigo"], "Sin descripción")

        print(f"    Top 25 procedimientos consolidados")

        motivos_hospitalarios_consolidados = {
            "diagnosticos_egreso": diagnosticos_consolidados,
            "procedimientos_quirurgicos": procedimientos_consolidados,
        }

    except Exception as e:
        print(f"\n  Error cargando motivos hospitalarios: {e}")
        print("   Continuando sin motivos hospitalarios...")
        motivos_hospitalarios_consolidados = None

    # 7b. Consolidar motivos de CONSULTA EXTERNA para OOAD
    try:
        print(f"\n Consolidando motivos de Consulta Externa OOAD...")
        archivo_consulta_externa = str(
            DATA_INPUT_DIR / "Consulta_Externa_Diaria_2025.xlsx"
        )

        motivos_consulta_consolidados = consolidar_consulta_externa_ooad(
            archivo_consulta_externa, claves_hospitales, catalogo_cie10
        )

        # Agregar a los motivos hospitalarios consolidados
        if motivos_hospitalarios_consolidados and motivos_consulta_consolidados:
            motivos_hospitalarios_consolidados["especialidades_consulta"] = (
                motivos_consulta_consolidados["especialidades_consulta"]
            )
            motivos_hospitalarios_consolidados["urgencias_consulta"] = (
                motivos_consulta_consolidados["urgencias_consulta"]
            )

            print(f"    Motivos consulta externa consolidados agregados")

    except Exception as e:
        print(f"\n  Error consolidando consulta externa: {e}")
        print("   Continuando sin motivos de consulta externa...")

    # 8. Cargar OOAD JSON existente
    print("\n Actualizando ficha_ooad_tabasco.json...")
    with open(DATA_OUTPUT_DIR / "ficha_ooad_tabasco.json", "r", encoding="utf-8") as f:
        ficha_ooad = json.load(f)

    # 6. Agregar datos de productividad
    ficha_ooad["productividad_medicina_familiar_consolidada"] = prod_mf
    ficha_ooad["productividad_servicios_consolidada"] = prod_servicios

    # 6b. Agregar motivos hospitalarios consolidados (si existen)
    if motivos_hospitalarios_consolidados:
        ficha_ooad["motivos_atencion_hospital_consolidados"] = (
            motivos_hospitalarios_consolidados
        )
        print(
            f"    Motivos hospitalarios consolidados agregados ({len(motivos_hospitalarios_consolidados['diagnosticos_egreso'])} diagnósticos, {len(motivos_hospitalarios_consolidados['procedimientos_quirurgicos'])} procedimientos)"
        )

    # 7. Guardar
    os.makedirs(DATA_OUTPUT_DIR, exist_ok=True)
    with open(DATA_OUTPUT_DIR / "ficha_ooad_tabasco.json", "w", encoding="utf-8") as f:
        json.dump(ficha_ooad, f, indent=2, ensure_ascii=False)

    print(
        "\n Datos de productividad consolidados agregados a ficha_ooad_tabasco.json"
    )
    print(f"\n Ejemplo - Total de Consultas:")
    if "Total de Consultas de la Unidad" in prod_mf:
        total = prod_mf["Total de Consultas de la Unidad"]["total_acumulado"]
        print(f"   Total acumulado: {total:,.0f}")


if __name__ == "__main__":
    main()
