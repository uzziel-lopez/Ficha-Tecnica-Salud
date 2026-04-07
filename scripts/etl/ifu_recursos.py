#!/usr/bin/env python3
"""
Script simple para extraer claves del IFU más actual usando denominacion_completa
"""

import pandas as pd
import json
import os
import glob
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_OUTPUT_DIR = BASE_DIR / "data" / "output"
DEFAULT_IFU_SOURCE_DIR = os.getenv(
    "IFU_SOURCE_DIR",
    str((BASE_DIR / "data" / "input").resolve()),
)


def encontrar_ifu_mas_actual(carpeta=DEFAULT_IFU_SOURCE_DIR):
    """Encuentra el archivo IFU más reciente"""
    patrones = [
        os.path.join(carpeta, "IFU_nacional_*.xlsb"),
        os.path.join(carpeta, "IFU_nacional_*.xlsx"),
    ]

    archivos = []
    for patron in patrones:
        archivos.extend(glob.glob(patron))

    if not archivos:
        print(f" No se encontraron archivos IFU en {carpeta}")
        return None

    # Ordenar por fecha de modificación (más reciente primero)
    archivos.sort(key=os.path.getmtime, reverse=True)

    print(f" Seleccionado: {os.path.basename(archivos[0])}")
    return archivos[0]


def cargar_ifu(archivo_path):
    """Carga el archivo IFU"""
    print(f" Cargando archivo IFU...")

    motor = "pyxlsb" if archivo_path.endswith(".xlsb") else "openpyxl"

    # Cargar hoja 'Unidad' con encabezados en fila 23 (índice 22)
    df = pd.read_excel(archivo_path, sheet_name="Unidad", header=22, engine=motor)

    # Limpiar nombres de columnas
    df.columns = [
        str(col).strip() if col else f"Col_{i}" for i, col in enumerate(df.columns)
    ]

    # Filtrar filas vacías
    df = df.dropna(how="all")

    print(f" IFU cargado: {len(df)} filas, {len(df.columns)} columnas")
    return df


def cargar_fichas(archivo=str(DATA_OUTPUT_DIR / "fichas_completas_tabasco.json")):
    """Carga el JSON de fichas"""
    print(f" Cargando fichas...")

    with open(archivo, "r", encoding="utf-8") as f:
        fichas = json.load(f)

    unidades = fichas.get("unidades", [])
    print(f" Fichas cargadas: {len(unidades)} unidades")
    return unidades


def extraer_datos(df_ifu, unidades_fichas):
    """Extrae los datos del IFU para cada unidad"""

    # Códigos a extraer
    codigos = [
        # Consultorios (originales)
        "70000",
        "70101",
        "71200",
        "70900",
        "71000",
        "70105",
        "70106",
        "77050",
        "70107",
        "70150",
        "70200",
        "70400",
        "70500",
        "70600",
        "70700",
        "70800",
        "75400",
        # Camas Censables
        "50100",  # Total Censables
        "56000",  # Medicina Interna
        "55000",  # Cirugia
        "51200",  # Gineco Obstetricia
        "53620",  # Pediatría
        "53600",  # Cuna Cirugía Pediátrica
        # Camas No Censables
        "60000",  # No Censables
        "60300",  # Camillas de AMC
        "60301",  # Observación Adulto
        "60302",  # Observación Pediatrica
        # Servicios Especiales
        "80151",  # PrevenIMSS
        "70104",  # Enf. Esp. En Med. Familiar
        "80101",  # Atención Orientación DH
        # Quirófanos y Salas
        "80364",  # Quirófanos
        "80403",  # Sala de Expulsión
        "80402",  # Mixta Cirugía -Tococirugía
        "80361",  # Urgencias
        "80407",  # Tococirugía
        "80354",  # Hibrida
        # Equipos de Laboratorio y Diagnóstico
        "81402",  # Peine de Laboratorio Clínico
        "80602",  # Tomógrafos
        "80658",  # Rayos X Fijos
        "80659",  # Rayos X Transportable
        "80661",  # Mastógrafo Digital
        "80751",  # Electrocardiógrafo
        "80753",  # Electromiógrafo
        "80752",  # Electroencefalógrafo
        "80754",  # Ecocardiógrafo
        # Procedimientos
        "80408",  # Procedimientos Quirúrgicos
        "80451",  # Endoscopia Altas
        "80452",  # Endoscopia Bajas
        "80651",  # Radiodiagnóstico
        # Hemodiálisis
        "81301",  # Máquinas Hemodiálisis
        "81303",  # Areas de Hemodiálisis
        # Ambulancias
        "81900",  # Ambulancias
        "81901",  # Ambulancias Equipadas
        # Camas de Urgencias
        "60100",  # Total Camas en Urgencias
        "60202",  # Cama Observ. Adulto
        "60201",  # Cama Observ. Pediatrica
        "60104",  # Cama de Corta Estancia
        "60105",  # Reanimación Adulto (nota: 60300 ya está arriba como Atención Médica Contínua)
    ]

    # Encontrar columnas que empiecen con estos códigos
    columnas_encontradas = {}
    for codigo in codigos:
        for col in df_ifu.columns:
            if str(col).strip().startswith(codigo):
                columnas_encontradas[codigo] = col
                break

    print(f" Códigos encontrados: {len(columnas_encontradas)}")
    for codigo, columna in columnas_encontradas.items():
        print(f"   - {codigo}: {columna}")

    # Buscar columna de nombres
    nombre_col = None
    for col in df_ifu.columns:
        if "nombre" in str(col).lower() and "unidad" in str(col).lower():
            nombre_col = col
            break

    if not nombre_col:
        print(" No se encontró columna de nombres en IFU")
        return {}

    print(f" Columna de nombres: {nombre_col}")

    resultado = {
        "metadatos": {
            "fecha_extraccion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "codigos_extraidos": list(columnas_encontradas.keys()),
            "total_unidades_fichas": len(unidades_fichas),
        },
        "unidades": [],
    }

    encontradas = 0
    no_encontradas = 0
    unidades_no_encontradas = []  # Lista para guardar las no encontradas

    print(f"\n Procesando unidades...")

    for i, unidad in enumerate(unidades_fichas):
        info = unidad.get("informacion_general", {})
        denominacion = info.get("denominacion_completa", "")
        nombre = info.get("nombre_unidad", "")

        if not denominacion:
            print(f"    {nombre}: Sin denominación completa")
            unidades_no_encontradas.append(
                {"nombre": nombre, "razon": "Sin denominación completa"}
            )
            no_encontradas += 1
            continue

        # Buscar en IFU por denominación exacta
        mask = df_ifu[nombre_col].astype(str).str.strip() == denominacion.strip()
        matches = df_ifu[mask]

        # Si no encuentra exacta, intentar búsqueda flexible (02 vs 2, etc.)
        if matches.empty:
            # Normalizar el nombre para búsqueda flexible
            denominacion_normalizada = (
                denominacion.replace(" 02 ", " 2 ")
                .replace(" 03 ", " 3 ")
                .replace(" 04 ", " 4 ")
                .replace(" 05 ", " 5 ")
                .replace(" 06 ", " 6 ")
                .replace(" 07 ", " 7 ")
                .replace(" 08 ", " 8 ")
                .replace(" 09 ", " 9 ")
            )

            if denominacion_normalizada != denominacion:
                mask_flexible = (
                    df_ifu[nombre_col].astype(str).str.strip()
                    == denominacion_normalizada.strip()
                )
                matches = df_ifu[mask_flexible]

                if not matches.empty and i < 3:
                    print(
                        f"    {nombre}: Encontrada con normalización '{denominacion}' -> '{denominacion_normalizada}'"
                    )

        if matches.empty:
            if i < 3:  # Debug para las primeras 3
                print(f"    {nombre}: No encontrada '{denominacion}'")
            unidades_no_encontradas.append(
                {
                    "nombre": nombre,
                    "denominacion": denominacion,
                    "razon": "No encontrada en IFU",
                }
            )
            no_encontradas += 1
            continue

        # Extraer datos
        fila_ifu = matches.iloc[0]
        datos_extraidos = {}

        for codigo, columna in columnas_encontradas.items():
            valor = fila_ifu[columna]
            if pd.isna(valor):
                datos_extraidos[codigo] = None
            else:
                datos_extraidos[codigo] = valor

        unidad_resultado = {
            "nombre_unidad": nombre,
            "denominacion_completa": denominacion,
            "clave_presupuestal": info.get("clave_presupuestal", ""),
            "clues": info.get("clues", ""),
            "municipio": info.get("municipio", ""),
            "zona": info.get("zona", ""),
            "datos_ifu": datos_extraidos,
        }

        resultado["unidades"].append(unidad_resultado)
        encontradas += 1

        if i < 3:  # Debug para las primeras 3
            print(f"    {nombre}: Encontrada y datos extraídos")

    print(f"\n Resumen:")
    print(f"    Encontradas: {encontradas}")
    print(f"    No encontradas: {no_encontradas}")
    print(f"    Tasa de éxito: {(encontradas / len(unidades_fichas) * 100):.1f}%")

    # Mostrar las unidades no encontradas
    if unidades_no_encontradas:
        print(f"\n UNIDADES NO ENCONTRADAS:")
        for unidad in unidades_no_encontradas:
            print(f"   - {unidad['nombre']}")
            print(f"     Denominación: {unidad.get('denominacion', 'N/A')}")
            print(f"     Razón: {unidad['razon']}")
            print()

    resultado["metadatos"]["encontradas"] = encontradas
    resultado["metadatos"]["no_encontradas"] = no_encontradas
    resultado["metadatos"]["unidades_no_encontradas"] = unidades_no_encontradas

    return resultado


def guardar_resultado(resultado):
    """Guarda el resultado en JSON"""
    archivo_salida = str(DATA_OUTPUT_DIR / "claves_ifu_extraidas.json")
    os.makedirs(DATA_OUTPUT_DIR, exist_ok=True)

    with open(archivo_salida, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False, default=str)

    tamaño = os.path.getsize(archivo_salida)
    print(f" Resultado guardado: {archivo_salida} ({tamaño:,} bytes)")

    return archivo_salida


def main():
    print(" EXTRACTOR DE CLAVES IFU - VERSIÓN SIMPLE")
    print("=" * 60)

    # 1. Encontrar IFU más actual
    archivo_ifu = encontrar_ifu_mas_actual()
    if not archivo_ifu:
        return

    # 2. Cargar IFU
    try:
        df_ifu = cargar_ifu(archivo_ifu)
    except Exception as e:
        print(f" Error cargando IFU: {e}")
        return

    # 3. Cargar fichas
    try:
        unidades = cargar_fichas()
    except Exception as e:
        print(f" Error cargando fichas: {e}")
        return

    # 4. Extraer datos
    resultado = extraer_datos(df_ifu, unidades)

    if not resultado.get("unidades"):
        print(" No se extrajeron datos")
        return

    # 5. Guardar resultado
    archivo_guardado = guardar_resultado(resultado)

    print(f"\n Proceso completado exitosamente")
    print(f" Archivo generado: {archivo_guardado}")


if __name__ == "__main__":
    main()
