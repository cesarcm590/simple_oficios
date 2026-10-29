"""Build the slim DENUE file that ships to production (no phone, email or website).

The development database keeps every column; production only needs what the directory tool
returns, so contact data stays out of the repository.

Run from mapas/:
    python tools/build_prod_data.py
"""
import sqlite3
from pathlib import Path

DATOS = Path(__file__).resolve().parent.parent / "data"
ORIGEN = DATOS / "denue" / "denue_talleres.sqlite"
DESTINO = DATOS / "prod" / "denue_cdmx.sqlite"
ENTIDADES = ("09",)  # pilot: CDMX only; add state codes as they are loaded

COLUMNAS = "clee, nombre, clase, categoria, especialidad, entidad, colonia, lat, lng"


def main() -> None:
    if not ORIGEN.exists():
        raise SystemExit(f"Falta {ORIGEN}; cárgala con tools/denue_load.py")
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.unlink(missing_ok=True)
    src = sqlite3.connect(f"file:{ORIGEN}?mode=ro", uri=True)
    out = sqlite3.connect(DESTINO)
    out.execute("create table talleres (clee text primary key, nombre text, clase text, categoria text, "
                "especialidad text, entidad text, colonia text, lat real, lng real)")
    marcas = ",".join("?" * len(ENTIDADES))
    filas = src.execute(f"select {COLUMNAS} from talleres where entidad in ({marcas})", ENTIDADES).fetchall()
    out.executemany("insert into talleres values (?,?,?,?,?,?,?,?,?)", filas)
    out.execute("create index talleres_entidad_lat on talleres (entidad, lat)")
    out.commit()
    out.execute("vacuum")
    out.close()
    print(f"{len(filas)} talleres en {DESTINO} ({DESTINO.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
