## Ficha_Tecnica - Estructura y flujo operativo

### Estructura actual

- `app/public/`: frontend (`index.php`, `ficha_tec.php`)
- `app/assets/css/`: estilos (`style.css`)
- `app/assets/img/`: imagenes de unidades, recursos y logos
- `scripts/etl/`: scripts de carga/integracion de datos
- `scripts/run_pipeline.py`: ejecutor secuencial del pipeline
- `data/input/`: archivos fuente (xlsx/csv)
- `data/output/`: json finales para la web
- `config/`: reservado para configuraciones locales

### Archivos clave de salida

- `data/output/fichas_completas_con_recursos.json` (principal para `ficha_tec.php`)
- `data/output/fichas_completas_tabasco.json`
- `data/output/claves_ifu_extraidas.json`
- `data/output/siais_historico_completo.json`
- `data/output/ficha_ooad_tabasco.json`

### Flujo ETL recomendado

1. `python scripts/etl/conect_siais.py`
2. `python scripts/etl/main.py`
3. `python scripts/etl/ifu_recursos.py`
4. `python scripts/etl/integrador_recursos_fichas.py`
5. (opcional) `python scripts/etl/consolidar_productividad_ooad.py`

Tambien puedes usar:

- `python scripts/run_pipeline.py`
- `python scripts/run_pipeline.py --skip-siais`
- `python scripts/run_pipeline.py --with-tableau`

### Insumos esperados

- `data/input/Base_Ficha_Tabasco_2025.xlsx`
- `data/input/Diagnosticos y Procedimientos.xlsx`
- `data/input/PRODUCTIVIDAD_TRATAMIENTO/Productividad.csv`
- (si aplica) `data/input/Consulta_Externa_Diaria_2025.xlsx`
- (si aplica) `data/input/PARTEII_2025.xlsx`
- (si aplica) `data/input/Egresos_Pacientes_2025.xlsx`
- (si aplica) `data/input/Intervenciones_Quirurgicas_2025.xlsx`

### Web y compatibilidad de rutas

- Entrada publica tradicional:
  - `Consolidado/Ficha_Tecnica/index.php`
  - `Consolidado/Ficha_Tecnica/ficha_tec.php`
- Ambos archivos redirigen a `app/public/` para mantener compatibilidad.

### Dependencias Python

Instala con:

`pip install -r requirements.txt`
