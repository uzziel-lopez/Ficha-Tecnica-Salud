#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automatización de descarga de Productividad desde Tableau IMSS
Filtra por Tabasco y descarga tabulación cruzada
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import os
import time
import glob
import shutil
from datetime import datetime
from pathlib import Path

# ============================================
# CONFIGURACIÓN
# ============================================

# Cambiar al directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_INPUT_DIR = BASE_DIR / "data" / "input"

# Ruta a ChromeDriver (puede resolverse por PATH)
CHROME_DRIVER_PATH = os.getenv("CHROME_DRIVER_PATH", "chromedriver")

# URL del dashboard Tableau
TABLEAU_URL = os.getenv(
    "FT_TABLEAU_URL",
    "https://example.invalid/tableau/views/demo",
)

# Carpeta de descarga
DOWNLOAD_FOLDER = str(DATA_INPUT_DIR / "PRODUCTIVIDAD_TRATAMIENTO")
OUTPUT_FILENAME = "Productividad.csv"

print(" AUTOMATIZACIÓN DESCARGA TABLEAU - PRODUCTIVIDAD")
print("=" * 60)

# ============================================
# FUNCIONES AUXILIARES
# ============================================


def setup_download_folder():
    """Crear carpeta de descarga si no existe"""
    if not os.path.exists(DOWNLOAD_FOLDER):
        os.makedirs(DOWNLOAD_FOLDER)
        print(f" Carpeta creada: {DOWNLOAD_FOLDER}")
    else:
        print(f" Usando carpeta existente: {DOWNLOAD_FOLDER}")


def wait_for_download(download_dir, timeout=60):
    """Espera a que se complete la descarga"""
    print(f"Esperando descarga en: {download_dir}")

    start_time = time.time()
    files_before = set(os.listdir(download_dir))

    while time.time() - start_time < timeout:
        time.sleep(1)

        files_after = set(os.listdir(download_dir))
        new_files = files_after - files_before

        # Buscar archivos nuevos que no sean temporales
        for file in new_files:
            file_path = os.path.join(download_dir, file)

            # Ignorar archivos temporales de Chrome
            if file.endswith(".crdownload") or file.endswith(".tmp"):
                continue

            # Verificar que sea un archivo de datos
            if any(
                file.lower().endswith(ext) for ext in [".csv", ".txt", ".xls", ".xlsx"]
            ):
                # Esperar a que el archivo se complete (tamaño estable)
                time.sleep(2)
                print(f" Archivo descargado: {file}")
                return file_path

    print(" Timeout esperando descarga")
    return None


def rename_and_move_file(source_file, destination_folder, new_name):
    """Renombra y mueve el archivo descargado"""
    if not source_file or not os.path.exists(source_file):
        print(" Archivo fuente no existe")
        return False

    try:
        # Determinar extensión del archivo original
        _, ext = os.path.splitext(source_file)

        # Si new_name no tiene extensión, usar la del archivo original
        if not os.path.splitext(new_name)[1]:
            new_name = new_name + ext

        destination_path = os.path.join(destination_folder, new_name)

        # Si ya existe, hacer backup
        if os.path.exists(destination_path):
            backup_name = (
                f"{new_name}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            backup_path = os.path.join(destination_folder, backup_name)
            shutil.move(destination_path, backup_path)
            print(f" Backup creado: {backup_name}")

        # Mover y renombrar
        shutil.move(source_file, destination_path)

        file_size = os.path.getsize(destination_path)
        print(f" Archivo guardado: {destination_path} ({file_size:,} bytes)")
        return True

    except Exception as e:
        print(f" Error moviendo archivo: {e}")
        return False


# ============================================
# FUNCIÓN PRINCIPAL DE DESCARGA
# ============================================


def download_productividad_tableau():
    """Función principal que automatiza la descarga de Tableau"""

    # Configurar carpeta de descarga
    setup_download_folder()

    # Carpeta temporal de descargas de Chrome
    download_dir = os.path.abspath(".")

    # Configuración de Chrome
    chrome_options = ChromeOptions()

    # Configurar descargas
    prefs = {
        "download.default_directory": download_dir,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
        "profile.default_content_settings.popups": 0,
        "profile.default_content_setting_values.automatic_downloads": 1,
    }
    chrome_options.add_experimental_option("prefs", prefs)

    # Opciones adicionales
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)

    # Inicializar driver
    service = ChromeService(executable_path=CHROME_DRIVER_PATH)
    driver = None

    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        wait = WebDriverWait(driver, 30)

        print(" Chrome iniciado...")

        # PASO 1: Abrir página Tableau
        print(f"\n PASO 1: Abriendo Tableau Dashboard...")
        driver.get(TABLEAU_URL)
        time.sleep(5)  # Espera inicial

        # Esperar a que desaparezca el spinner de carga
        print("Esperando a que termine de cargar (spinner)...")
        try:
            spinner_xpath = "//div[@id='loadingSpinner']"
            # Esperar a que el spinner esté presente primero
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, spinner_xpath))
            )
            print("   Spinner detectado, esperando...")

            # Ahora esperar a que desaparezca (display: none o no visible)
            WebDriverWait(driver, 60).until(
                EC.invisibility_of_element_located((By.XPATH, spinner_xpath))
            )
            print(" Spinner desaparecido, dashboard listo")
            time.sleep(2)  # Espera adicional de seguridad

        except Exception as e:
            print(f" No se detectó spinner, continuando... ({str(e)[:50]})")
            time.sleep(3)

        print(" Dashboard cargado completamente")

        # PASO 2: Buscar y hacer click en el combobox de OOAD/UMAE
        print("\n PASO 2: Buscando filtro OOAD/UMAE...")

        try:
            # Intentar encontrar el combobox por su clase característica
            combobox = wait.until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, "span.tabComboBox.tab-ctrl-formatted-widget")
                )
            )

            print(" Filtro encontrado, haciendo click...")
            driver.execute_script("arguments[0].scrollIntoView(true);", combobox)
            time.sleep(1)
            combobox.click()
            time.sleep(2)

        except Exception as e:
            print(f" Método 1 falló, intentando método alternativo...")
            # Método alternativo: buscar por el contenedor del combobox
            try:
                combobox = wait.until(
                    EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, "div.CFContent span.tabComboBox")
                    )
                )
                driver.execute_script("arguments[0].click();", combobox)
                time.sleep(2)
            except:
                print(f" Método 2 falló, intentando método 3...")
                # Tercer intento: buscar cualquier combobox visible
                combobox = wait.until(
                    EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, "span.tabComboBoxNameContainer")
                    )
                )
                driver.execute_script("arguments[0].click();", combobox)
                time.sleep(2)

        # PASO 3: Deseleccionar "(Todos)" para poder filtrar
        print("\n PASO 3: Configurando filtro...")

        try:
            # Esperar a que aparezca el menú desplegable
            menu_container = wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "div.CFOuterContainer.tabMenuComboDropdownTheme")
                )
            )

            print(" Menú desplegado")
            time.sleep(1)

            # PASO 3.1: Hacer click en el CHECKBOX de "(Todos)" para SELECCIONAR TODO primero
            print("    Paso 3.1: Seleccionando '(Todos)'...")

            # Buscar el checkbox de "(Todos)" - usar el input directamente
            todos_checkbox_xpath = (
                "//input[@class='FICheckRadio'][@name[contains(., '(Todos)')]]"
            )
            todos_checkbox = wait.until(
                EC.presence_of_element_located((By.XPATH, todos_checkbox_xpath))
            )

            driver.execute_script("arguments[0].scrollIntoView(true);", todos_checkbox)
            time.sleep(0.5)

            # Hacer click usando JavaScript para asegurar que funcione
            driver.execute_script("arguments[0].click();", todos_checkbox)
            time.sleep(1)

            print("    Todos los estados seleccionados")

            # PASO 3.2: Volver a hacer click en el CHECKBOX de "(Todos)" para DESELECCIONAR TODO
            print("    Paso 3.2: Deseleccionando '(Todos)'...")
            driver.execute_script("arguments[0].click();", todos_checkbox)
            time.sleep(1)

            print("    Todos los estados deseleccionados")

            # PASO 3.3: Ahora sí, buscar y hacer click en el CHECKBOX de "Tabasco"
            print("    Paso 3.3: Seleccionando 'Tabasco'...")

            # Buscar el checkbox de Tabasco por su name que termina en _29
            tabasco_checkbox_xpath = (
                "//input[@class='FICheckRadio'][@name[contains(., '_29')]]"
            )
            tabasco_checkbox = wait.until(
                EC.presence_of_element_located((By.XPATH, tabasco_checkbox_xpath))
            )

            # Hacer click en el checkbox de Tabasco
            driver.execute_script(
                "arguments[0].scrollIntoView(true);", tabasco_checkbox
            )
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", tabasco_checkbox)
            time.sleep(1)

            print(" 'Tabasco' seleccionado correctamente")

        except Exception as e:
            print(f" Error en el proceso de filtrado: {e}")
            print(" Intentando método alternativo...")

            # Método alternativo: buscar checkbox por el contenedor padre
            try:
                # Buscar el contenedor FIItem de "(Todos)"
                todos_item = driver.find_element(
                    By.XPATH,
                    "//div[contains(@id, '(Todos)')]/div[@class='facetOverflow']/input[@type='checkbox']",
                )
                driver.execute_script("arguments[0].click();", todos_item)
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", todos_item)
                time.sleep(0.5)

                # Buscar el checkbox de Tabasco por índice 29
                tabasco_item = driver.find_element(
                    By.XPATH,
                    "//div[contains(@id, '_29')]/div[@class='facetOverflow']/input[@type='checkbox']",
                )
                driver.execute_script("arguments[0].click();", tabasco_item)
                time.sleep(1)
                print(" 'Tabasco' seleccionado (método alternativo)")
            except Exception as e2:
                print(f" No se pudo seleccionar Tabasco: {e2}")
                return False

        # PASO 4: Hacer click en botón "Aplicar"
        print("\n PASO 4: Aplicando filtro...")

        try:
            # Buscar botón "Aplicar" por texto
            apply_button_xpath = (
                "//button[.//span[@class='label' and text()='Aplicar']]"
            )
            apply_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, apply_button_xpath))
            )

            driver.execute_script("arguments[0].scrollIntoView(true);", apply_button)
            time.sleep(0.5)
            apply_button.click()

            print(" Filtro aplicado, esperando actualización...")
            time.sleep(6)

        except Exception as e:
            print(f" Error aplicando filtro: {e}")
            print(" Intentando método alternativo...")

            # Método alternativo: buscar por clase
            try:
                apply_button = driver.find_element(
                    By.CSS_SELECTOR, "button.tab-button.tab-widget"
                )
                if "Aplicar" in apply_button.text:
                    apply_button.click()
                    print(" Filtro aplicado (método alternativo)")
                    time.sleep(6)
            except:
                print(" No se pudo aplicar el filtro")
                return False

        # PASO 5: Cerrar el dropdown haciendo click afuera (en el dashboard)
        print("\n PASO 5: Cerrando dropdown de filtro...")

        try:
            # Buscar el dashboard principal y hacer click en él para cerrar el dropdown
            dashboard_xpath = "//div[@class='tab-dashboard tab-widget lightBackground']"
            dashboard = wait.until(
                EC.presence_of_element_located((By.XPATH, dashboard_xpath))
            )

            # Hacer click en el dashboard para cerrar dropdown
            driver.execute_script("arguments[0].click();", dashboard)
            time.sleep(2)

            print(" Dropdown cerrado")

        except Exception as e:
            print(f" No se pudo cerrar dropdown: {e}")
            print(" Continuando de todas formas...")
            time.sleep(1)

        # PASO 6: Hacer click en la tabla (tab-tvYLabel)
        print("\n PASO 6: Haciendo click en la tabla para activarla...")

        try:
            # Buscar específicamente el elemento tab-tvYLabel que contiene la imagen de la tabla
            table_label_xpath = "//div[@class='tab-tvYLabel tvimagesNS']"
            table_label = wait.until(
                EC.presence_of_element_located((By.XPATH, table_label_xpath))
            )

            driver.execute_script("arguments[0].scrollIntoView(true);", table_label)
            time.sleep(1)

            # Click en la tabla usando JavaScript
            driver.execute_script("arguments[0].click();", table_label)

            print(" Click en tabla (tab-tvYLabel), esperando 5 segundos...")
            time.sleep(5)

        except Exception as e:
            print(f" Método 1 falló: {e}")
            print(" Intentando método alternativo...")

            # Método alternativo: buscar cualquier tvimagesContainer
            try:
                table_container = driver.find_element(
                    By.CSS_SELECTOR, "div.tvimagesContainer"
                )
                driver.execute_script(
                    "arguments[0].scrollIntoView(true);", table_container
                )
                time.sleep(1)
                driver.execute_script("arguments[0].click();", table_container)
                print(" Click en tabla (método alternativo)")
                time.sleep(5)
            except Exception as e2:
                print(f" No se pudo hacer click en tabla: {e2}")
                print(" Continuando de todas formas...")
                time.sleep(3)

        # PASO 7: Esperar a que desaparezca el overlay de carga
        print("\nPASO 7: Esperando a que desaparezca overlay de carga...")

        try:
            # Esperar a que desaparezca el overlay "tab-glass"
            glass_xpath = "//div[@class='tab-glass clear-glass tab-widget']"

            # Verificar si existe el overlay
            try:
                driver.find_element(By.XPATH, glass_xpath)
                print("   Overlay detectado, esperando...")

                # Esperar hasta que el overlay sea invisible o tenga display: none
                WebDriverWait(driver, 30).until(
                    EC.invisibility_of_element_located((By.XPATH, glass_xpath))
                )
                print(" Overlay desaparecido")
                time.sleep(2)

            except:
                print(" No hay overlay, continuando...")
                time.sleep(1)

        except Exception as e:
            print(f" Error verificando overlay: {e}")
            time.sleep(2)

        # PASO 8: Click en botón "Descargar"
        print("\n PASO 8: Buscando botón 'Descargar'...")

        try:
            # Buscar botón de descarga por clase
            download_button_xpath = "//div[@class='tabToolbarButton tab-widget']//span[@class='tab-icon-download']"
            download_button = wait.until(
                EC.presence_of_element_located((By.XPATH, download_button_xpath))
            )

            # Hacer click en el botón padre usando JavaScript para evitar overlays
            parent_button = download_button.find_element(By.XPATH, "..")
            driver.execute_script("arguments[0].scrollIntoView(true);", parent_button)
            time.sleep(1)

            # Usar JavaScript para hacer click y evitar el overlay
            driver.execute_script("arguments[0].click();", parent_button)

            print(" Menú de descarga abierto")
            time.sleep(2)

        except Exception as e:
            print(f" Error abriendo menú de descarga: {e}")
            print(" Intentando método alternativo...")

            # Método alternativo: buscar por texto y usar JavaScript
            try:
                download_button = driver.find_element(
                    By.XPATH,
                    "//span[contains(@class, 'tabToolbarButtonText') and contains(text(), 'Descargar')]/..",
                )
                driver.execute_script("arguments[0].click();", download_button)
                print(" Menú de descarga abierto (método alternativo)")
                time.sleep(2)
            except Exception as e2:
                print(f" No se pudo abrir menú de descarga: {e2}")
                return False

        # PASO 9: Seleccionar "Tabulación cruzada"
        print("\n PASO 9: Seleccionando 'Tabulación cruzada'...")

        try:
            # Buscar opción de tabulación cruzada
            crosstab_xpath = "//div[@class='tabMenuItem tabMenuItemUnificationTheme tabDownloadCrosstab tabMenuMenuItem']"
            crosstab_option = wait.until(
                EC.element_to_be_clickable((By.XPATH, crosstab_xpath))
            )

            crosstab_option.click()

            print(" Tabulación cruzada seleccionada")
            time.sleep(3)

        except Exception as e:
            print(f" Error seleccionando tabulación cruzada: {e}")
            print(" Intentando método alternativo...")

            # Método alternativo: buscar por texto
            try:
                crosstab_option = driver.find_element(
                    By.XPATH, "//span[contains(text(), 'Tabulación cruzada')]/.."
                )
                crosstab_option.click()
                print(" Tabulación cruzada seleccionada (método alternativo)")
                time.sleep(3)
            except:
                print(" No se pudo seleccionar tabulación cruzada")
                return False

        # PASO 10: Hacer click en "Descargar" del modal
        print("\n PASO 10: Descargando archivo...")

        try:
            # Buscar el enlace de descarga en el modal
            download_link_xpath = "//a[@name='ok'][.//span[text()='Descargar']]"
            download_link = wait.until(
                EC.element_to_be_clickable((By.XPATH, download_link_xpath))
            )

            # Hacer click en el enlace de descarga
            download_link.click()

            print(" Descarga iniciada...")

            # Esperar a que se complete la descarga
            downloaded_file = wait_for_download(download_dir, timeout=60)

            if downloaded_file:
                # Renombrar y mover archivo
                success = rename_and_move_file(
                    downloaded_file, DOWNLOAD_FOLDER, OUTPUT_FILENAME
                )

                if success:
                    print(f"\n ¡DESCARGA COMPLETADA!")
                    print(f" Archivo: {DOWNLOAD_FOLDER}/{OUTPUT_FILENAME}")
                    return True
                else:
                    print(" Error procesando archivo")
                    return False
            else:
                print(" No se detectó archivo descargado")
                return False

        except Exception as e:
            print(f" Error en descarga final: {e}")
            print(" Intentando método alternativo...")

            # Método alternativo: buscar cualquier enlace con "Descargar"
            try:
                download_link = driver.find_element(
                    By.XPATH, "//a[contains(@class, 'tabStyledTextButton')]"
                )
                download_link.click()
                print(" Descarga iniciada (método alternativo)")

                downloaded_file = wait_for_download(download_dir, timeout=60)

                if downloaded_file:
                    success = rename_and_move_file(
                        downloaded_file, DOWNLOAD_FOLDER, OUTPUT_FILENAME
                    )

                    if success:
                        print(f"\n ¡DESCARGA COMPLETADA!")
                        print(f" Archivo: {DOWNLOAD_FOLDER}/{OUTPUT_FILENAME}")
                        return True

                return False
            except:
                print(" No se pudo descargar el archivo")
                return False

    except Exception as e:
        print(f" Error general: {e}")
        import traceback

        traceback.print_exc()
        return False

    finally:
        if driver:
            print("\nCerrando navegador en 3 segundos...")
            time.sleep(3)
            try:
                driver.quit()
                print(" Navegador cerrado")
            except:
                pass


# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================

if __name__ == "__main__":
    print(" INICIANDO DESCARGA DE PRODUCTIVIDAD TABLEAU")
    print("=" * 60)

    # Verificar ChromeDriver
    if not os.path.isfile(CHROME_DRIVER_PATH):
        print(" ChromeDriver no encontrado en:")
        print(f"   {CHROME_DRIVER_PATH}")
        print("\n Descárgalo desde:")
        print("   https://chromedriver.chromium.org/downloads")
        print("   https://googlechromelabs.github.io/chrome-for-testing/")
        print("\n O usa: brew install chromedriver (macOS)")
        exit(1)

    print(f" ChromeDriver encontrado")
    print(f" URL: {TABLEAU_URL[:80]}...")
    print(f" Carpeta destino: {DOWNLOAD_FOLDER}/")
    print(f" Archivo salida: {OUTPUT_FILENAME}")
    print("\n" + "=" * 60)

    # Confirmar ejecución
    print("\n  El navegador Chrome se abrirá automáticamente")
    print("  NO cierres el navegador manualmente")
    print("\n¿Deseas continuar? (s/n): ", end="")

    respuesta = input().strip().lower()

    if respuesta != "s":
        print(" Operación cancelada por el usuario")
        exit(0)

    # Ejecutar descarga
    print("\n" + "=" * 60)
    print(" INICIANDO PROCESO...")
    print("=" * 60)

    success = download_productividad_tableau()

    if success:
        print("\n" + "=" * 60)
        print(" PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 60)

        # Mostrar archivo resultante
        output_path = os.path.join(DOWNLOAD_FOLDER, OUTPUT_FILENAME)
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f" Archivo final: {output_path}")
            print(f" Tamaño: {file_size:,} bytes")
            print(f" Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

            # Mostrar primeras líneas del archivo
            try:
                print(f"\n Primeras líneas del archivo:")
                with open(output_path, "r", encoding="utf-8") as f:
                    for i, line in enumerate(f):
                        if i >= 3:
                            break
                        print(f"   {line.rstrip()}")
            except:
                pass
    else:
        print("\n" + "=" * 60)
        print(" EL PROCESO NO SE COMPLETÓ CORRECTAMENTE")
        print("=" * 60)
        print(" Revisa los mensajes anteriores para identificar el error")
        print("\n Posibles soluciones:")
        print("   1. Verifica tu conexión a internet")
        print("   2. Asegúrate de que el URL sea accesible")
        print("   3. Verifica que ChromeDriver sea compatible con tu versión de Chrome")
        print("   4. Revisa que no haya popups o alertas bloqueando")
