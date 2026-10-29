"""INEGI state codes (entidades federativas) and a tolerant name resolver."""
import unicodedata

ESTADOS = {
    "01": "Aguascalientes", "02": "Baja California", "03": "Baja California Sur",
    "04": "Campeche", "05": "Coahuila de Zaragoza", "06": "Colima", "07": "Chiapas",
    "08": "Chihuahua", "09": "Ciudad de México", "10": "Durango", "11": "Guanajuato",
    "12": "Guerrero", "13": "Hidalgo", "14": "Jalisco", "15": "México",
    "16": "Michoacán de Ocampo", "17": "Morelos", "18": "Nayarit", "19": "Nuevo León",
    "20": "Oaxaca", "21": "Puebla", "22": "Querétaro", "23": "Quintana Roo",
    "24": "San Luis Potosí", "25": "Sinaloa", "26": "Sonora", "27": "Tabasco",
    "28": "Tamaulipas", "29": "Tlaxcala", "30": "Veracruz de Ignacio de la Llave",
    "31": "Yucatán", "32": "Zacatecas",
}

# "México" alone is the Estado de México (15), so the usual shortcuts are explicit.
_ALIAS = {"cdmx": "09", "df": "09", "edomex": "15", "estado de mexico": "15", "mexico": "15"}


def _norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.strip().lower())
    return "".join(c for c in text if not unicodedata.combining(c))


def resolver_estado(valor: str) -> str:
    """Return the two-digit INEGI code for a code, name, shortcut or unambiguous prefix."""
    v = _norm(str(valor))
    if v.isdigit() and v.zfill(2) in ESTADOS:
        return v.zfill(2)
    if v in _ALIAS:
        return _ALIAS[v]
    nombres = {_norm(n): c for c, n in ESTADOS.items()}
    if v in nombres:
        return nombres[v]
    candidatos = {c for n, c in nombres.items() if n.startswith(v)} if v else set()
    if len(candidatos) == 1:
        return candidatos.pop()
    raise ValueError(f"estado no reconocido o ambiguo: {valor!r}")
