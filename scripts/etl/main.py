import pandas as pd
import json
import os
from pathlib import Path
from typing import Dict, List, Any

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_INPUT_DIR = BASE_DIR / "data" / "input"
DATA_OUTPUT_DIR = BASE_DIR / "data" / "output"


class ExtractorFichasCompleto:
    def __init__(self, archivo_excel: str):
        """
        Inicializa el extractor con la ruta del archivo Excel
        """
        self.archivo_excel = archivo_excel
        self.datos_pamf = None
        self.datos_cuumsp = None

    def cargar_datos(self):
        """
        Carga los datos de ambas hojas: PAMF y CUUMSP
        """
        try:
            print(" Cargando datos del archivo Excel...")

            # Cargar hoja PAMF (datos poblacionales)
            print(" Cargando hoja PAMF...")
            self.datos_pamf = pd.read_excel(
                self.archivo_excel, sheet_name="PAMF", header=3, engine="openpyxl"
            )

            # Limpiar datos PAMF
            self.datos_pamf.columns = [
                str(col).strip() for col in self.datos_pamf.columns
            ]
            self.datos_pamf = self.datos_pamf[
                (self.datos_pamf["ZONA"].notna())
                & (self.datos_pamf["ZONA"].str.contains("ZONA", na=False))
            ]

            # Convertir columnas numéricas PAMF
            columnas_numericas_pamf = [
                "Población Adscrita a la Unidad Total",
                "Población Adscrita a la Unidad Titulares",
                "Población Adscrita a la Unidad Beneficiarios",
                "Población Adscrita a Médico Familiar",
                "Población Asegurada a la Unidad para el ramo de seguro de Riesgos de Trabajo /1",
                "Población Asegurada a la Unidad para el ramo de Enfermedad General y Materna/2",
                "Población Asegurada a la Unidad para el ramo de Invalidez /3",
                "Población de Trabajadores IMSS Asegurada a la Unidad /4",
            ]

            for col in columnas_numericas_pamf:
                if col in self.datos_pamf.columns:
                    self.datos_pamf[col] = pd.to_numeric(
                        self.datos_pamf[col], errors="coerce"
                    ).fillna(0)

            print(f" PAMF cargado: {len(self.datos_pamf)} registros")

            # Cargar hoja CUUMSP (datos administrativos)
            print(" Cargando hoja CUUMSP...")
            print(" Headers en fila 10, datos desde fila 11")

            try:
                # Cargar CUUMSP con header en fila 10 (índice 9)
                self.datos_cuumsp = pd.read_excel(
                    self.archivo_excel,
                    sheet_name="CUUMSP",
                    header=9,  # Fila 10 = índice 9
                    engine="openpyxl",
                )

                # Limpiar nombres de columnas
                self.datos_cuumsp.columns = [
                    str(col).strip() for col in self.datos_cuumsp.columns
                ]

                # Filtrar filas válidas (eliminar filas completamente vacías)
                self.datos_cuumsp = self.datos_cuumsp.dropna(how="all")

                # Buscar y mostrar columnas importantes
                print(
                    f" Total de columnas en CUUMSP: {len(self.datos_cuumsp.columns)}"
                )
                print(
                    f" Primeras 10 columnas: {list(self.datos_cuumsp.columns[:10])}"
                )

                # Buscar columnas clave
                columnas_importantes = []
                for col in self.datos_cuumsp.columns:
                    col_upper = str(col).upper()
                    if any(
                        keyword in col_upper
                        for keyword in [
                            "CLUES",
                            "CLAVE",
                            "PRESUPUESTAL",
                            "DIRECTOR",
                            "UNIDAD",
                            "MUNICIPIO",
                        ]
                    ):
                        columnas_importantes.append(col)

                if columnas_importantes:
                    print(
                        f" Columnas importantes encontradas: {columnas_importantes[:10]}"
                    )
                else:
                    print(" No se encontraron columnas con nombres esperados")

                # Filtrar filas que tengan datos válidos en alguna columna clave
                if columnas_importantes:
                    # Mantener filas que tengan al menos un valor válido en columnas importantes
                    mask_validas = pd.Series([False] * len(self.datos_cuumsp))
                    for col in columnas_importantes[
                        :5
                    ]:  # Verificar las primeras 5 columnas importantes
                        if col in self.datos_cuumsp.columns:
                            mask_validas |= self.datos_cuumsp[col].notna()

                    self.datos_cuumsp = self.datos_cuumsp[mask_validas]

                print(
                    f" CUUMSP cargado exitosamente: {len(self.datos_cuumsp)} registros"
                )

                # Mostrar muestra de datos para verificar
                if len(self.datos_cuumsp) > 0:
                    print(f"\n Muestra de datos CUUMSP (primera fila):")
                    primera_fila = self.datos_cuumsp.iloc[0]
                    for i, (col, valor) in enumerate(primera_fila.items()):
                        if pd.notna(valor) and str(valor).strip() != "":
                            print(f"  {col}: {valor}")
                        if i >= 10:  # Mostrar solo las primeras 10 columnas con datos
                            break

            except Exception as e:
                print(f" Error cargando CUUMSP: {str(e)}")
                print(" Continuando solo con datos de PAMF")
                self.datos_cuumsp = pd.DataFrame()

            return True

        except FileNotFoundError:
            print(f" Error: No se encontró el archivo {self.archivo_excel}")
            return False
        except Exception as e:
            print(f" Error al cargar los datos: {str(e)}")
            import traceback

            traceback.print_exc()
            return False

    def mostrar_resumen(self):
        """
        Muestra un resumen de los datos cargados de ambas hojas
        """
        if self.datos_pamf is None:
            print(" Primero debe cargar los datos de PAMF")
            return

        print("\n" + "=" * 60)
        print(" RESUMEN DE DATOS COMBINADOS")
        print("=" * 60)

        # Información general
        print(f" PAMF: {len(self.datos_pamf)} unidades con datos poblacionales")

        if self.datos_cuumsp is not None and len(self.datos_cuumsp) > 0:
            print(
                f" CUUMSP: {len(self.datos_cuumsp)} unidades con datos administrativos"
            )
        else:
            print(
                f" CUUMSP: No disponible (se continuará solo con datos poblacionales)"
            )

        # Zonas de PAMF
        zonas_unicas = self.datos_pamf["ZONA"].dropna().unique()
        print(f"\n Zonas encontradas:")
        for zona in sorted(zonas_unicas):
            cantidad = len(self.datos_pamf[self.datos_pamf["ZONA"] == zona])
            print(f"  - {zona}: {cantidad} unidades")

        # Población total
        poblacion_total = self.datos_pamf["Población Adscrita a la Unidad Total"].sum()
        print(f"\n Población total adscrita: {poblacion_total:,.0f}")

        # Verificar coincidencias entre hojas (solo si CUUMSP está disponible)
        if self.datos_cuumsp is not None and len(self.datos_cuumsp) > 0:
            claves_pamf = set(self.datos_pamf["Cve Presupuestal"].astype(str))

            # Buscar columnas de clave en CUUMSP
            posibles_columnas_clave = []
            for col in self.datos_cuumsp.columns:
                col_upper = str(col).upper()
                if any(
                    keyword in col_upper
                    for keyword in ["PRESUPUESTAL", "PERSONAL", "PREI", "CLAVE"]
                ):
                    posibles_columnas_clave.append(col)

            claves_cuumsp = set()
            for col_clave in posibles_columnas_clave:
                if col_clave in self.datos_cuumsp.columns:
                    claves_col = set(self.datos_cuumsp[col_clave].astype(str))
                    claves_cuumsp.update(claves_col)

            if claves_cuumsp and posibles_columnas_clave:
                coincidencias = claves_pamf.intersection(claves_cuumsp)
                print(f"\n Coincidencias entre hojas:")
                print(f"  - Columnas de clave encontradas: {posibles_columnas_clave}")
                print(f"  - Unidades con datos completos: {len(coincidencias)}")
                print(f"  - Unidades solo en PAMF: {len(claves_pamf - claves_cuumsp)}")
            else:
                print(f"\n No se encontraron columnas de clave válidas en CUUMSP")
        else:
            print(f"\n No se pueden verificar coincidencias (CUUMSP no disponible)")

        # Muestra de datos
        print(f"\n PRIMERAS 3 UNIDADES:")
        for i, (_, fila) in enumerate(self.datos_pamf.head(3).iterrows()):
            clave = str(fila["Cve Presupuestal"])

            print(f"\n{i + 1}. {fila['Unidad']}")
            print(f"   Clave: {clave}")
            print(f"   Zona: {fila['ZONA']}")
            print(f"   Municipio: {fila['Municipio']}")
            print(f"   Población: {fila['Población Adscrita a la Unidad Total']:,.0f}")

            # Verificar si tiene datos administrativos
            if self.datos_cuumsp is not None and len(self.datos_cuumsp) > 0:
                datos_admin = self.buscar_datos_administrativos(clave)
                tiene_admin = bool(datos_admin)
                print(
                    f"   Datos administrativos: {' Sí' if tiene_admin else ' No'}"
                )
            else:
                print(f"   Datos administrativos:  No disponibles")

    def buscar_datos_administrativos(
        self, clave_presupuestal: str, nombre_unidad: str = None
    ) -> Dict:
        """
        Busca los datos administrativos de una unidad en CUUMSP
        Busca tanto por clave presupuestal como por nombre de unidad
        """
        if self.datos_cuumsp is None or len(self.datos_cuumsp) == 0:
            return {}

        clave_str = str(clave_presupuestal)
        nombre_str = str(nombre_unidad) if nombre_unidad else ""

        print(f" Buscando datos administrativos para:")
        print(f"   Clave: {clave_str}")
        print(f"   Nombre: {nombre_str}")

        # ESTRATEGIA 1: Buscar por clave presupuestal
        unidad_admin = pd.DataFrame()

        # Buscar columnas que contengan claves presupuestales
        posibles_columnas_clave = []
        for col in self.datos_cuumsp.columns:
            col_upper = str(col).upper()
            if any(
                keyword in col_upper
                for keyword in ["PRESUPUESTAL", "PERSONAL", "PREI", "CLAVE", "CLUES"]
            ):
                posibles_columnas_clave.append(col)

        # Intentar búsqueda por clave presupuestal
        for col_clave in posibles_columnas_clave:
            if col_clave in self.datos_cuumsp.columns:
                resultado = self.datos_cuumsp[
                    self.datos_cuumsp[col_clave]
                    .astype(str)
                    .str.contains(clave_str, na=False, case=False)
                ]
                if not resultado.empty:
                    unidad_admin = resultado
                    print(f" Encontrado por clave en columna: {col_clave}")
                    break

        # ESTRATEGIA 2: Si no se encontró por clave, buscar por nombre de unidad
        if unidad_admin.empty and nombre_str:
            print(f" No encontrado por clave, buscando por nombre...")

            # Buscar columnas que contengan nombres de unidades
            posibles_columnas_nombre = []
            for col in self.datos_cuumsp.columns:
                col_upper = str(col).upper()
                if any(
                    keyword in col_upper
                    for keyword in ["UNIDAD", "DENOMINACION", "NOMBRE", "HOSPITAL"]
                ):
                    posibles_columnas_nombre.append(col)

            print(f" Columnas de nombre encontradas: {posibles_columnas_nombre}")

            # Buscar por nombre exacto o parcial
            for col_nombre in posibles_columnas_nombre:
                if col_nombre in self.datos_cuumsp.columns:
                    # Primero intentar coincidencia exacta
                    resultado_exacto = self.datos_cuumsp[
                        self.datos_cuumsp[col_nombre]
                        .astype(str)
                        .str.strip()
                        .str.upper()
                        == nombre_str.upper()
                    ]

                    if not resultado_exacto.empty:
                        unidad_admin = resultado_exacto
                        print(
                            f" Encontrado por nombre exacto en columna: {col_nombre}"
                        )
                        break

                    # Si no hay coincidencia exacta, intentar coincidencia parcial
                    resultado_parcial = self.datos_cuumsp[
                        self.datos_cuumsp[col_nombre]
                        .astype(str)
                        .str.contains(nombre_str, na=False, case=False)
                    ]

                    if not resultado_parcial.empty:
                        unidad_admin = resultado_parcial
                        print(
                            f" Encontrado por nombre parcial en columna: {col_nombre}"
                        )
                        break

        # ESTRATEGIA 3: Búsqueda flexible por palabras clave del nombre
        if unidad_admin.empty and nombre_str:
            print(f" Intentando búsqueda flexible por palabras clave...")

            # Extraer palabras clave del nombre (HGZ, números, nombres de ciudad)
            import re

            palabras_clave = re.findall(r"\b\w+\b", nombre_str.upper())

            # Filtrar palabras significativas (más de 2 caracteres o números)
            palabras_significativas = [
                p for p in palabras_clave if len(p) > 2 or p.isdigit()
            ]

            print(f" Palabras clave extraídas: {palabras_significativas}")

            for col_nombre in posibles_columnas_nombre:
                if col_nombre in self.datos_cuumsp.columns:
                    for palabra in palabras_significativas:
                        resultado = self.datos_cuumsp[
                            self.datos_cuumsp[col_nombre]
                            .astype(str)
                            .str.contains(palabra, na=False, case=False)
                        ]
                        if not resultado.empty:
                            unidad_admin = resultado
                            print(
                                f" Encontrado por palabra clave '{palabra}' en columna: {col_nombre}"
                            )
                            break
                    if not unidad_admin.empty:
                        break

        # Si no se encontró nada
        if unidad_admin.empty:
            print(f" No se encontraron datos administrativos")
            return {}

        # Si se encontraron múltiples resultados, tomar el primero
        if len(unidad_admin) > 1:
            print(
                f" Se encontraron {len(unidad_admin)} coincidencias, tomando la primera"
            )

        admin_data = unidad_admin.iloc[0].to_dict()

        # Limpiar datos administrativos
        datos_limpios = {}
        for key, value in admin_data.items():
            if pd.notna(value) and str(value).strip() != "" and str(value) != "nan":
                datos_limpios[key] = value

        print(f" Datos administrativos encontrados: {len(datos_limpios)} campos")
        return datos_limpios

    def construir_domicilio(self, datos_admin: Dict) -> str:
        """
        Construye el domicilio completo a partir de los datos administrativos
        """
        if not datos_admin:
            return "Domicilio no disponible"

        componentes = []

        # Buscar componentes del domicilio con nombres flexibles
        for col, valor in datos_admin.items():
            col_upper = str(col).upper()

            # Tipo y nombre de vialidad
            if "VIALIDAD" in col_upper and "TIPO" in col_upper:
                tipo_vialidad = str(valor)
            elif "VIALIDAD" in col_upper and "NOMBRE" in col_upper:
                nombre_vialidad = str(valor)

        # Construcción básica del domicilio
        domicilio_parts = []
        for col, valor in datos_admin.items():
            col_str = str(col)
            if pd.notna(valor) and str(valor).strip():
                # Si es una columna que parece contener dirección
                if any(
                    keyword in col_str.upper()
                    for keyword in ["DIRECCION", "DOMICILIO", "CALLE", "AVENIDA"]
                ):
                    domicilio_parts.append(str(valor))

        if domicilio_parts:
            return ", ".join(domicilio_parts)
        else:
            return "Domicilio no disponible"

    def determinar_tipo_unidad(self, nombre_unidad: str) -> str:
        """
        Determina el tipo de unidad basándose en su nombre
        """
        if pd.isna(nombre_unidad):
            return "No especificado"

        nombre = str(nombre_unidad).upper()

        if "UMF" in nombre:
            return "Unidad de Medicina Familiar"
        elif "HGZ" in nombre:
            return "Hospital General de Zona"
        elif "HGS" in nombre:
            return "Hospital General de Subzona"
        elif "HGSMF" in nombre:
            return "Hospital General de Subzona con Medicina Familiar"
        else:
            return "Otra unidad médica"

    def determinar_nivel_atencion(self, nombre_unidad: str) -> str:
        """
        Determina el nivel de atención basándose en el tipo de unidad
        """
        if pd.isna(nombre_unidad):
            return "No especificado"

        nombre = str(nombre_unidad).upper()

        if "UMF" in nombre:
            return "Primer Nivel"
        elif any(x in nombre for x in ["HGZ", "HGS", "HGSMF"]):
            return "Segundo Nivel"
        else:
            return "No especificado"

    def obtener_columnas_demograficas(self):
        """
        Identifica las columnas que contienen datos demográficos por edad
        """
        columnas = list(self.datos_pamf.columns)

        # Grupos de edad específicos
        grupos_edad = [
            "<1",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10 a 14",
            "15 a 19",
            "20 a 24",
            "25  a 29",
            "30 a 34",
            "35 a 39",
            "40 a 44",
            "45 a 49",
            "50 a 54",
            "55 a 59",
            "60 a 64",
            "65 a 69",
            "70 a 74",
            "75 a 79",
            "80 a 84",
            "85 y más",
            "No especificada",
        ]

        cols_total = []
        cols_hombres = []
        cols_mujeres = []

        for col in columnas:
            col_str = str(col).strip()

            # Columnas de total (sin sufijo)
            if col_str in grupos_edad:
                cols_total.append(col)
            # Columnas de hombres (con .1)
            elif col_str.endswith(".1") and col_str[:-2] in grupos_edad:
                cols_hombres.append(col)
            # Columnas de mujeres (con .2)
            elif col_str.endswith(".2") and col_str[:-2] in grupos_edad:
                cols_mujeres.append(col)

        return {"total": cols_total, "hombres": cols_hombres, "mujeres": cols_mujeres}

    def extraer_datos_demograficos(self, fila, cols_demograficas):
        """
        Extrae los datos demográficos de una fila específica
        """
        piramide = {
            "total_poblacion": {},
            "poblacion_hombres": {},
            "poblacion_mujeres": {},
        }

        # Extraer datos totales
        for col in cols_demograficas["total"]:
            if col in fila and pd.notna(fila[col]):
                try:
                    valor = fila[col]
                    if isinstance(valor, (int, float)) and not isinstance(valor, bool):
                        grupo_edad = str(col).strip()
                        piramide["total_poblacion"][grupo_edad] = int(valor)
                except (ValueError, TypeError):
                    continue

        # Extraer datos de hombres
        for col in cols_demograficas["hombres"]:
            if col in fila and pd.notna(fila[col]):
                try:
                    valor = fila[col]
                    if isinstance(valor, (int, float)) and not isinstance(valor, bool):
                        grupo_edad = str(col).replace(".1", "").strip()
                        piramide["poblacion_hombres"][grupo_edad] = int(valor)
                except (ValueError, TypeError):
                    continue

        # Extraer datos de mujeres
        for col in cols_demograficas["mujeres"]:
            if col in fila and pd.notna(fila[col]):
                try:
                    valor = fila[col]
                    if isinstance(valor, (int, float)) and not isinstance(valor, bool):
                        grupo_edad = str(col).replace(".2", "").strip()
                        piramide["poblacion_mujeres"][grupo_edad] = int(valor)
                except (ValueError, TypeError):
                    continue

        return piramide

    def generar_ficha_unidad(self, fila_pamf, datos_admin: Dict = None) -> Dict:
        """
        Genera la ficha técnica de una unidad individual
        """
        clave_presupuestal = (
            str(fila_pamf["Cve Presupuestal"])
            if pd.notna(fila_pamf["Cve Presupuestal"])
            else ""
        )
        nombre_unidad = fila_pamf["Unidad"] if pd.notna(fila_pamf["Unidad"]) else ""
        municipio = fila_pamf["Municipio"] if pd.notna(fila_pamf["Municipio"]) else ""
        zona = fila_pamf["ZONA"] if pd.notna(fila_pamf["ZONA"]) else ""

        #  BUSCAR DATOS ADMINISTRATIVOS CON AMBOS CRITERIOS
        if datos_admin is None:
            datos_admin = self.buscar_datos_administrativos(
                clave_presupuestal, nombre_unidad
            )

        # Información general básica
        ficha = {
            "informacion_general": {
                "zona": zona,
                "municipio": municipio,
                "clave_presupuestal": clave_presupuestal,
                "nombre_unidad": nombre_unidad,
                "tipo_unidad": self.determinar_tipo_unidad(nombre_unidad),
                "nivel_atencion": self.determinar_nivel_atencion(nombre_unidad),
                "ubicacion": municipio,
                "jurisdiccion": f"Zona {zona.replace('ZONA ', '') if zona else ''}",
                "datos_administrativos_disponibles": bool(
                    datos_admin
                ),  #  ESTO AHORA DEBERÍA SER TRUE
            },
            "poblacion_adscrita": {
                "total": int(fila_pamf["Población Adscrita a la Unidad Total"])
                if pd.notna(fila_pamf["Población Adscrita a la Unidad Total"])
                else 0,
                "titulares": int(fila_pamf["Población Adscrita a la Unidad Titulares"])
                if pd.notna(fila_pamf["Población Adscrita a la Unidad Titulares"])
                else 0,
                "beneficiarios": int(
                    fila_pamf["Población Adscrita a la Unidad Beneficiarios"]
                )
                if pd.notna(fila_pamf["Población Adscrita a la Unidad Beneficiarios"])
                else 0,
                "medico_familiar": int(
                    fila_pamf["Población Adscrita a Médico Familiar"]
                )
                if pd.notna(fila_pamf["Población Adscrita a Médico Familiar"])
                else 0,
            },
            "poblacion_asegurada": {
                "riesgos_trabajo": int(
                    fila_pamf[
                        "Población Asegurada a la Unidad para el ramo de seguro de Riesgos de Trabajo /1"
                    ]
                )
                if pd.notna(
                    fila_pamf[
                        "Población Asegurada a la Unidad para el ramo de seguro de Riesgos de Trabajo /1"
                    ]
                )
                else 0,
                "enfermedad_maternidad": int(
                    fila_pamf[
                        "Población Asegurada a la Unidad para el ramo de Enfermedad General y Materna/2"
                    ]
                )
                if pd.notna(
                    fila_pamf[
                        "Población Asegurada a la Unidad para el ramo de Enfermedad General y Materna/2"
                    ]
                )
                else 0,
                "invalidez": int(
                    fila_pamf[
                        "Población Asegurada a la Unidad para el ramo de Invalidez /3"
                    ]
                )
                if pd.notna(
                    fila_pamf[
                        "Población Asegurada a la Unidad para el ramo de Invalidez /3"
                    ]
                )
                else 0,
                "trabajadores_imss": int(
                    fila_pamf["Población de Trabajadores IMSS Asegurada a la Unidad /4"]
                )
                if pd.notna(
                    fila_pamf["Población de Trabajadores IMSS Asegurada a la Unidad /4"]
                )
                else 0,
            },
        }

        # Agregar datos administrativos si están disponibles
        if datos_admin:
            # Buscar información específica con nombres flexibles
            responsable = ""
            cargo = ""
            clues = ""
            domicilio = ""

            for col, valor in datos_admin.items():
                col_upper = str(col).upper()
                if "DIRECTOR" in col_upper or "RESPONSABLE" in col_upper:
                    responsable = str(valor)
                elif "CARGO" in col_upper:
                    cargo = str(valor)
                elif "CLUES" in col_upper:
                    clues = str(valor)
                elif any(
                    keyword in col_upper for keyword in ["DIRECCION", "DOMICILIO"]
                ):
                    domicilio = str(valor)

            #  EXTRAER MÁS CAMPOS ESPECÍFICOS BASADOS EN LOS DATOS QUE MOSTRASTE
            denominacion_completa = ""
            municipio_admin = ""
            estado = ""

            for col, valor in datos_admin.items():
                col_str = str(col)
                if "Denominación Unidad" in col_str:
                    denominacion_completa = str(valor)
                elif col_str == "Municipio" or "MUNICIPIO" in col_str.upper():
                    municipio_admin = str(valor)
                elif col_str == "Estado" or "ESTADO" in col_str.upper():
                    estado = str(valor)

            datos_administrativos = {
                "responsable": responsable or "Por definir",
                "cargo": cargo or "Director(a) Médico(a)",
                "clues": clues,
                "domicilio": domicilio or self.construir_domicilio(datos_admin),
                "denominacion_completa": denominacion_completa,
                "municipio_administrativo": municipio_admin,
                "estado": estado,
                "datos_administrativos_completos": datos_admin,
            }
            ficha["informacion_general"].update(datos_administrativos)

        # Agregar datos demográficos si están disponibles
        try:
            cols_demograficas = self.obtener_columnas_demograficas()
            if (
                cols_demograficas["total"]
                or cols_demograficas["hombres"]
                or cols_demograficas["mujeres"]
            ):
                datos_demograficos = self.extraer_datos_demograficos(
                    fila_pamf, cols_demograficas
                )
                if (
                    datos_demograficos["total_poblacion"]
                    or datos_demograficos["poblacion_hombres"]
                    or datos_demograficos["poblacion_mujeres"]
                ):
                    ficha["piramide_poblacional"] = datos_demograficos
        except Exception as e:
            print(
                f" Error procesando datos demográficos para {nombre_unidad}: {str(e)}"
            )

        return ficha

    def generar_todas_las_fichas(self) -> Dict:
        """
        Genera el JSON completo con todas las unidades
        """
        if self.datos_pamf is None:
            print(" Primero debe cargar los datos")
            return None

        print("\n Generando fichas de todas las unidades...")

        # Estructura principal
        resultado = {
            "metadatos": {
                "fecha_generacion": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
                "fuente": "Base_Ficha_Tabasco_2025.xlsx - Hojas PAMF y CUUMSP",
                "total_unidades": len(self.datos_pamf),
                "unidades_con_datos_admin": 0,
                "descripcion": "Fichas técnicas completas de todas las unidades médicas de Tabasco",
            },
            "resumen_general": {
                "por_zona": {},
                "por_tipo_unidad": {},
                "por_nivel_atencion": {},
            },
            "unidades": [],
        }

        unidades_con_admin = 0
        contadores_tipo = {}
        contadores_nivel = {}

        # Procesar cada unidad
        for index, fila_pamf in self.datos_pamf.iterrows():
            clave_presupuestal = (
                str(fila_pamf["Cve Presupuestal"])
                if pd.notna(fila_pamf["Cve Presupuestal"])
                else ""
            )
            nombre_unidad = (
                fila_pamf["Unidad"]
                if pd.notna(fila_pamf["Unidad"])
                else f"Unidad {index + 1}"
            )

            print(f"    Procesando: {nombre_unidad}")

            #  BUSCAR DATOS ADMINISTRATIVOS CON AMBOS CRITERIOS
            datos_admin = self.buscar_datos_administrativos(
                clave_presupuestal, nombre_unidad
            )
            if datos_admin:
                unidades_con_admin += 1
                print(f"    Datos administrativos encontrados")
            else:
                print(f"    Sin datos administrativos")

            # Generar ficha de la unidad (ya no necesita buscar datos_admin porque ya los tenemos)
            ficha_unidad = self.generar_ficha_unidad(fila_pamf, datos_admin)

            # Actualizar contadores
            tipo_unidad = ficha_unidad["informacion_general"]["tipo_unidad"]
            nivel_atencion = ficha_unidad["informacion_general"]["nivel_atencion"]

            contadores_tipo[tipo_unidad] = contadores_tipo.get(tipo_unidad, 0) + 1
            contadores_nivel[nivel_atencion] = (
                contadores_nivel.get(nivel_atencion, 0) + 1
            )

            resultado["unidades"].append(ficha_unidad)

        # Actualizar metadatos
        resultado["metadatos"]["unidades_con_datos_admin"] = unidades_con_admin

        # Generar resumen por zona
        for zona in self.datos_pamf["ZONA"].unique():
            if pd.notna(zona):
                unidades_zona = self.datos_pamf[self.datos_pamf["ZONA"] == zona]
                resultado["resumen_general"]["por_zona"][zona] = {
                    "total_unidades": len(unidades_zona),
                    "poblacion_total": int(
                        unidades_zona["Población Adscrita a la Unidad Total"].sum()
                    ),
                    "municipios": list(unidades_zona["Municipio"].unique()),
                }

        # Agregar contadores de tipo y nivel
        resultado["resumen_general"]["por_tipo_unidad"] = contadores_tipo
        resultado["resumen_general"]["por_nivel_atencion"] = contadores_nivel

        print(f" Procesadas {len(resultado['unidades'])} unidades")
        print(f" {unidades_con_admin} con datos administrativos completos")

        return resultado

    def exportar_json(
        self,
        archivo_salida: str = str(DATA_OUTPUT_DIR / "fichas_completas_tabasco.json"),
    ):
        """
        Exporta todas las fichas a formato JSON
        """
        todas_las_fichas = self.generar_todas_las_fichas()

        if not todas_las_fichas:
            print(" No se pudieron generar las fichas")
            return False

        try:
            # Convertir objetos no serializables a string
            def convertir_tipos(obj):
                if isinstance(obj, pd.Timestamp):
                    return obj.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(obj, (pd.Series, pd.DataFrame)):
                    return str(obj)
                elif hasattr(obj, "isoformat"):  # datetime objects
                    return obj.isoformat()
                elif isinstance(obj, (int, float)) and pd.isna(obj):
                    return None
                return obj

            # Aplicar conversión recursivamente
            def limpiar_datos(data):
                if isinstance(data, dict):
                    return {k: limpiar_datos(v) for k, v in data.items()}
                elif isinstance(data, list):
                    return [limpiar_datos(item) for item in data]
                else:
                    return convertir_tipos(data)

            # Limpiar los datos antes de exportar
            datos_limpios = limpiar_datos(todas_las_fichas)
            os.makedirs(Path(archivo_salida).parent, exist_ok=True)

            with open(archivo_salida, "w", encoding="utf-8") as f:
                json.dump(datos_limpios, f, indent=2, ensure_ascii=False)

            print(f"\n Fichas exportadas exitosamente a: {archivo_salida}")
            print(f" Resumen del archivo generado:")
            print(
                f"   - Total de unidades: {todas_las_fichas['metadatos']['total_unidades']}"
            )
            print(
                f"   - Con datos administrativos: {todas_las_fichas['metadatos']['unidades_con_datos_admin']}"
            )

            print(f"\n Por zona:")
            for zona, datos in todas_las_fichas["resumen_general"]["por_zona"].items():
                print(
                    f"   - {zona}: {datos['total_unidades']} unidades, {datos['poblacion_total']:,} habitantes"
                )

            print(f"\n Por tipo de unidad:")
            for tipo, cantidad in todas_las_fichas["resumen_general"][
                "por_tipo_unidad"
            ].items():
                print(f"   - {tipo}: {cantidad} unidades")

            return True

        except Exception as e:
            print(f" Error al exportar: {str(e)}")
            import traceback

            traceback.print_exc()
            return False


# Función principal
def main():
    # Ruta al archivo Excel
    archivo_excel = str(DATA_INPUT_DIR / "Base_Ficha_Tabasco_2025.xlsx")

    # Crear instancia del extractor
    extractor = ExtractorFichasCompleto(archivo_excel)

    print(" GENERADOR DE FICHAS TÉCNICAS IMSS TABASCO")
    print("=" * 50)

    # Cargar datos
    if extractor.cargar_datos():
        # Mostrar resumen
        extractor.mostrar_resumen()

        # Generar y exportar JSON
        print(f"\n Generando archivo JSON completo...")
        if extractor.exportar_json():
            print(f"\n ¡Proceso completado exitosamente!")
            print(f" El archivo contiene fichas técnicas completas con:")
            print(f"    Información general y administrativa")
            print(f"    Datos de población adscrita")
            print(f"    Datos de población asegurada")
            print(f"    Pirámides poblacionales (cuando disponibles)")
            print(f"    Información de responsables y domicilios")
        else:
            print(" Error al generar el archivo JSON")
    else:
        print(" Error al cargar los datos del Excel")


if __name__ == "__main__":
    main()
