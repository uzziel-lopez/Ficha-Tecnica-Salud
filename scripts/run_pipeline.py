#!/usr/bin/env python3

import argparse
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ETL_DIR = BASE_DIR / "scripts" / "etl"


def run_step(script_name: str) -> None:
    script_path = ETL_DIR / script_name
    print(f"\n==> Ejecutando {script_path}")
    result = subprocess.run([sys.executable, str(script_path)], cwd=str(BASE_DIR))
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def main() -> None:
    parser = argparse.ArgumentParser(description="Runner del pipeline de Ficha_Tecnica")
    parser.add_argument(
        "--skip-siais",
        action="store_true",
        help="Omite conect_siais.py",
    )
    parser.add_argument(
        "--with-tableau",
        action="store_true",
        help="Incluye descargar_productividad_tableau.py",
    )
    args = parser.parse_args()

    if not args.skip_siais:
        run_step("conect_siais.py")

    if args.with_tableau:
        run_step("descargar_productividad_tableau.py")

    run_step("main.py")
    run_step("ifu_recursos.py")
    run_step("integrador_recursos_fichas.py")

    print("\nPipeline finalizado.")


if __name__ == "__main__":
    main()
