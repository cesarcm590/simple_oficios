"""Directory of unregistered shops (INEGI DENUE) with a mandatory state filter.

Contact data stays in the database for claim verification; this tool never returns it,
because clients only get contact details after a mechanic approves an appointment.
"""
import sqlite3
from math import cos, radians
from pathlib import Path

from strands import tool

from tools.estados import ESTADOS, resolver_estado
from tools.mecanicos_db import _km
from tools.scian import CATEGORIAS_POR_DEFECTO

_DATOS = Path(__file__).resolve().parent.parent / "data"
# Development database first (all columns, git-ignored); then the slim file that ships to production.
RUTAS = [_DATOS / "denue" / "denue_talleres.sqlite", _DATOS / "prod" / "denue_cdmx.sqlite"]


def _ruta_db() -> Path:
    for ruta in RUTAS:
        if ruta.exists():
            return ruta
    raise FileNotFoundError("no hay base del directorio DENUE; ver tools/build_prod_data.py")


def estados_con_datos() -> set[str]:
    """State codes that have shops loaded; empty when no database is available."""
    try:
        db = sqlite3.connect(f"file:{_ruta_db()}?mode=ro", uri=True)
    except (FileNotFoundError, sqlite3.OperationalError):
        return set()
    try:
        return {fila[0] for fila in db.execute("select distinct entidad from talleres")}
    finally:
        db.close()


@tool
def buscar_talleres_directorio(estado: str, lat: float, lng: float, radio_km: float = 5,
                               limite: int = 10, categorias: list[str] | None = None,
                               especialidad: str | None = None) -> list[dict]:
    """Busca talleres del directorio público (no registrados) cerca de unas coordenadas.

    Solo devuelve talleres del estado indicado. Estos talleres no se pueden agendar todavía.
    Por defecto busca mecánica y llantas. Para incluir hojalatería y pintura agrega
    'carroceria' a las categorías.

    Args:
        estado: estado de México (nombre, código de 2 dígitos o 'cdmx').
        lat: latitud del usuario.
        lng: longitud del usuario.
        radio_km: radio máximo de búsqueda en kilómetros.
        limite: máximo de resultados.
        categorias: lista con 'mecanica', 'llantas', 'carroceria' y/o 'servicios'.
        especialidad: opcional: mecanica_general, electrico, motor, transmision, suspension,
            alineacion_balanceo, llantas, hojalateria_pintura, tapiceria, etc.
    """
    entidad = resolver_estado(estado)
    cats = list(categorias) if categorias else list(CATEGORIAS_POR_DEFECTO)
    dlat = radio_km / 111.0
    dlng = radio_km / (111.0 * max(cos(radians(lat)), 0.01))
    sql = ("select clee, nombre, clase, categoria, especialidad, colonia, lat, lng from talleres "
           "where entidad = ? and lat between ? and ? and lng between ? and ? "
           f"and categoria in ({','.join('?' * len(cats))})")
    params = [entidad, lat - dlat, lat + dlat, lng - dlng, lng + dlng, *cats]
    if especialidad:
        sql += " and especialidad = ?"
        params.append(especialidad)
    db = sqlite3.connect(f"file:{_ruta_db()}?mode=ro", uri=True)
    try:
        filas = db.execute(sql, params).fetchall()
    finally:
        db.close()
    resultados = []
    for clee, nombre, clase, categoria, esp, colonia, tlat, tlng in filas:
        distancia = _km(lat, lng, tlat, tlng)
        if distancia <= radio_km:
            resultados.append({"clee": clee, "nombre": nombre, "clase": clase, "categoria": categoria,
                               "especialidad": esp, "colonia": colonia, "estado": ESTADOS[entidad],
                               "distancia_km": round(distancia, 2), "lat": tlat, "lng": tlng,
                               "registrado": False})
    return sorted(resultados, key=lambda r: r["distancia_km"])[:limite]
