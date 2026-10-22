#!/usr/bin/env python3
"""Registro de funcionalidades del Oráculo de Caja Transparente.

Solo biblioteca estándar. Tres comandos:

  validar  REGISTRO [--id ID]          Revisa campos, demanda, dependencias y ciclos.
  resumen  REGISTRO                    Tabla de todas las funcionalidades + alertas.
  figma    REGISTRO [--todas] [--out]  Genera el diagrama Mermaid y el spec de estilos.

Una funcionalidad está "definida" cuando validar no devuelve ningún error.
Solo las definidas van a Figma (salvo que uses --todas).
Los pesos, techos, colores y tamaños viven en assets/config.json.
"""
import argparse
import json
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
CONFIG_DEFECTO = AQUI.parent / "assets" / "config.json"


# ---------------------------------------------------------------- carga ----
def leer_json(ruta):
    try:
        with open(ruta, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        sys.exit(f"ERROR: no existe el archivo {ruta}")
    except json.JSONDecodeError as e:
        sys.exit(f"ERROR: JSON roto en {ruta}: línea {e.lineno}, columna {e.colno}: {e.msg}")


def cargar_registro(ruta):
    data = leer_json(ruta)
    if not isinstance(data, dict) or not isinstance(data.get("funcionalidades"), list):
        sys.exit('ERROR: el registro debe ser un objeto con la lista "funcionalidades".')
    return data["funcionalidades"]


def vacio(x):
    return x is None or x == "" or x == [] or x == {}


# ------------------------------------------------------------- demanda ----
def calcular_demanda(f, cfg):
    """Devuelve (total, errores). Aplica el techo según la etiqueta de evidencia."""
    d = f.get("demanda")
    errores = []
    if not isinstance(d, dict):
        return None, ["demanda: falta el bloque completo (expresa, frustracion, conviene)"]
    techos = cfg["demanda"]["techo_por_evidencia"]
    total = 0.0
    for clave, spec in cfg["demanda"]["criterios"].items():
        c = d.get(clave)
        if not isinstance(c, dict):
            errores.append(f"demanda.{clave}: falta")
            continue
        p, et = c.get("puntos"), c.get("etiqueta")
        if not isinstance(p, (int, float)) or isinstance(p, bool):
            errores.append(f"demanda.{clave}.puntos: debe ser un número")
            continue
        if et not in techos:
            errores.append(f"demanda.{clave}.etiqueta: '{et}' no es válida ({', '.join(techos)})")
            continue
        if p < 0 or p > spec["max"]:
            errores.append(f"demanda.{clave}.puntos: {p} fuera de 0..{spec['max']}")
            continue
        techo = spec["max"] * techos[et]
        if p > techo + 1e-9:
            errores.append(
                f"demanda.{clave}: {p:g} puntos superan el techo {techo:g} que permite la evidencia '{et}'. "
                f"Baja la nota o consigue evidencia de nivel Hecho."
            )
        if p > 0 and vacio(c.get("fuente")):
            errores.append(f"demanda.{clave}: tiene puntos pero no dice de dónde sale (campo 'fuente')")
        total += p
    if errores:
        return None, errores
    guardado = d.get("total")
    if guardado is not None and abs(guardado - total) > 1e-9:
        errores.append(f"demanda.total: guardaste {guardado} pero la suma real es {total:g}")
    return total, errores


# ----------------------------------------------------------- validación ----
def validar_funcionalidad(f, ids, cfg):
    errores, avisos = [], []
    fid = f.get("id")

    for campo in ("id", "nombre", "resumen"):
        if vacio(f.get(campo)):
            errores.append(f"{campo}: falta")
    if not vacio(fid) and not re.fullmatch(r"[a-z0-9][a-z0-9_-]*", str(fid)):
        errores.append(f"id '{fid}': usa minúsculas, números, guion o guion bajo (sin espacios)")

    if vacio(f.get("que_permite")) or not isinstance(f.get("que_permite"), list):
        errores.append("que_permite: falta la lista de cosas concretas que te permite hacer")

    if f.get("estado") not in cfg["estados"]:
        errores.append(f"estado: '{f.get('estado')}' no es válido ({', '.join(cfg['estados'])})")
    if f.get("sistema") not in cfg["sistemas"]:
        errores.append(f"sistema: '{f.get('sistema')}' no es válido ({', '.join(cfg['sistemas'])})")
    pa = f.get("parte_arquitectura")
    if pa is not None and (not isinstance(pa, list) or not all(isinstance(x, str) for x in pa)):
        errores.append("parte_arquitectura: debe ser una lista de textos (nombres de nodos de la arquitectura)")

    # Meta: regla central del proyecto. Sin meta no vale nada.
    meta = f.get("meta_principal")
    if meta not in cfg["metas"]:
        errores.append(f"meta_principal: '{meta}' no es válida ({', '.join(cfg['metas'])})")
    elif meta == "sin_meta":
        errores.append("meta_principal: sin meta definida. Si no contribuye a ninguna meta, asígnale una o descártala")
    for m in f.get("metas_secundarias") or []:
        if m not in cfg["metas"] or m == "sin_meta":
            errores.append(f"metas_secundarias: '{m}' no es una meta válida")
        elif m == meta:
            avisos.append(f"metas_secundarias: '{m}' ya es la meta principal")

    # Métrica de éxito
    me = f.get("metrica_exito")
    if not isinstance(me, dict) or vacio(me.get("que_medir")):
        errores.append("metrica_exito.que_medir: falta (cómo sabrás que contribuyó a la meta)")
    elif vacio(me.get("umbral")):
        avisos.append("metrica_exito.umbral: sin umbral; no sabrás cuándo declarar éxito")

    # UI: indispensable
    ui = f.get("ui")
    if not isinstance(ui, dict) or ui.get("donde") not in cfg["ui_donde"]:
        errores.append(f"ui.donde: falta o no es válido ({', '.join(cfg['ui_donde'])})")
    elif ui["donde"] == "ninguna_justificada":
        if vacio(ui.get("justificacion")):
            errores.append("ui: elegiste 'ninguna_justificada' pero no escribiste la justificación")
        else:
            avisos.append("ui: sin interfaz. Revisa que la justificación siga siendo válida")
    elif vacio(ui.get("pantallas")):
        errores.append("ui.pantallas: lista qué pantallas o componentes lleva")

    # Demanda
    total, errs = calcular_demanda(f, cfg)
    errores += errs
    if total is not None and total >= cfg["demanda"]["alerta_demanda_alta"]:
        d = f["demanda"]
        hechos = sum(1 for k in cfg["demanda"]["criterios"] if d[k]["etiqueta"] == "Hecho")
        if hechos == 0:
            avisos.append(f"demanda {total:g}/10 sin ningún criterio en nivel Hecho: revisa la evidencia")

    # Dependencias
    for dep in f.get("depende_de") or []:
        if dep not in ids:
            errores.append(f"depende_de: '{dep}' no existe en el registro")
        elif dep == fid:
            errores.append("depende_de: no puede depender de sí misma")

    # Modelo LLM
    mo = f.get("modelo")
    if not isinstance(mo, dict) or vacio(mo.get("planificador")) or vacio(mo.get("ejecutor")):
        errores.append("modelo: falta planificador y ejecutor")
    elif mo.get("etiqueta") != "Hipótesis":
        avisos.append("modelo.etiqueta: mientras no lo pruebes con datos, debe decir 'Hipótesis'")

    # Avisos suaves
    if vacio(f.get("plan")):
        avisos.append("plan: aún no hay plan de implementación")
    if "por_investigar" not in f:
        avisos.append("por_investigar: falta el campo (puede ir vacío solo si todo es Hecho)")
    elif vacio(f["por_investigar"]) and isinstance(f.get("demanda"), dict):
        flojas = [k for k, c in f["demanda"].items()
                  if isinstance(c, dict) and c.get("etiqueta") not in (None, "Hecho")]
        if flojas:
            avisos.append("por_investigar vacío, pero hay criterios de demanda sin evidencia de nivel Hecho")
    if f.get("monetizacion") not in cfg["monetizacion_valores"]:
        avisos.append(f"monetizacion: pon uno de {', '.join(cfg['monetizacion_valores'])}")
    return errores, avisos


def detectar_ciclos(funcs):
    grafo = {f["id"]: [d for d in (f.get("depende_de") or []) if isinstance(d, str)]
             for f in funcs if f.get("id")}
    visitando, hechos, ciclos = set(), set(), []

    def dfs(n, ruta):
        if n in hechos or n not in grafo:
            return
        if n in visitando:
            ciclos.append(" -> ".join(ruta[ruta.index(n):] + [n]))
            return
        visitando.add(n)
        for m in grafo[n]:
            dfs(m, ruta + [n])
        visitando.discard(n)
        hechos.add(n)

    for n in grafo:
        dfs(n, [])
    return ciclos


def avisos_cruzados(funcs):
    por_id = {f.get("id"): f for f in funcs}
    avisos = []
    for f in funcs:
        for dep in f.get("depende_de") or []:
            g = por_id.get(dep)
            if not g:
                continue
            if g.get("estado") == "descartada" and f.get("estado") != "descartada":
                avisos.append(f"{f['id']} depende de '{dep}', que está descartada")
            if f.get("estado") == "terminada" and g.get("estado") != "terminada":
                avisos.append(f"{f['id']} está terminada pero depende de '{dep}', que no lo está")
    return avisos


# --------------------------------------------------------------- comandos ----
def cmd_validar(args, cfg):
    funcs = cargar_registro(args.registro)
    ids = {f.get("id") for f in funcs}
    duplicados = {i for i in ids if sum(1 for f in funcs if f.get("id") == i) > 1}
    seleccion = [f for f in funcs if args.id in (None, f.get("id"))]
    if args.id and not seleccion:
        sys.exit(f"ERROR: no existe la funcionalidad '{args.id}'")
    hay_error = False
    for f in seleccion:
        errores, avisos = validar_funcionalidad(f, ids, cfg)
        if f.get("id") in duplicados:
            errores.append("id duplicado en el registro")
        estado = "DEFINIDA" if not errores else "INCOMPLETA"
        print(f"\n[{estado}] {f.get('id')} - {f.get('nombre')}")
        for e in errores:
            print(f"  ERROR : {e}")
        for a in avisos:
            print(f"  aviso : {a}")
        hay_error |= bool(errores)
    for c in detectar_ciclos(funcs):
        print(f"\nERROR global: dependencia circular: {c}")
        hay_error = True
    for a in avisos_cruzados(funcs):
        print(f"aviso global: {a}")
    sys.exit(1 if hay_error else 0)


def cmd_resumen(args, cfg):
    funcs = cargar_registro(args.registro)
    ids = {f.get("id") for f in funcs}
    filas, conteo = [], {}
    for f in funcs:
        errores, _ = validar_funcionalidad(f, ids, cfg)
        total, _ = calcular_demanda(f, cfg)
        filas.append((
            total if total is not None else -1,
            f.get("id", "?"), cfg["estados"].get(f.get("estado"), {}).get("nombre", "?"),
            cfg["metas"].get(f.get("meta_principal"), {}).get("nombre", "?"),
            "sin evidencia" if total is None else f"{total:g}/10",
            len(f.get("depende_de") or []),
            (f.get("ui") or {}).get("donde", "falta"),
            "sí" if not errores else "no",
        ))
        conteo[f.get("estado")] = conteo.get(f.get("estado"), 0) + 1
    filas.sort(key=lambda r: -r[0])
    cab = ("id", "estado", "meta principal", "demanda", "dep.", "UI", "definida")
    tabla = [cab] + [r[1:] for r in filas]
    anchos = [max(len(str(r[i])) for r in tabla) for i in range(len(cab))]
    for i, r in enumerate(tabla):
        print("  ".join(str(c).ljust(anchos[j]) for j, c in enumerate(r)))
        if i == 0:
            print("  ".join("-" * a for a in anchos))
    print("\nTrabajo en curso:",
          ", ".join(f"{cfg['estados'][k]['nombre']}: {v}" for k, v in conteo.items() if k in cfg["estados"]))
    sin_meta = [f["id"] for f in funcs if f.get("meta_principal") in (None, "sin_meta")]
    if sin_meta:
        print("Sin meta (no valen nada hasta que la tengan):", ", ".join(sin_meta))
    for c in detectar_ciclos(funcs):
        print("Dependencia circular:", c)


def _id_mermaid(s):
    return re.sub(r"[^A-Za-z0-9_]", "_", s)


def _tamano(n_dep, cfg):
    for t in cfg["tamano_por_dependencias"]:
        if n_dep <= t["hasta"]:
            return t
    return cfg["tamano_por_dependencias"][-1]


def cmd_figma(args, cfg):
    funcs = cargar_registro(args.registro)
    ids = {f.get("id") for f in funcs}
    incluidas = []
    for f in funcs:
        errores, _ = validar_funcionalidad(f, ids, cfg)
        if args.todas or not errores:
            incluidas.append(f)
    if not incluidas:
        sys.exit("No hay funcionalidades definidas para dibujar. Corre 'validar' y completa lo que falta.")
    ids_inc = {f["id"] for f in incluidas}
    sc = cfg["formas_mermaid"]

    lineas = [
        "%% Mapa de funcionalidades. Color = meta principal. Forma = estado.",
        "%% Tamaño = número de dependencias. Línea continua = depende de. Línea punteada = alimenta una meta.",
        "flowchart LR",
    ]
    spec = {"leyenda": {
        "color": {k: v["color"] for k, v in cfg["metas"].items()},
        "forma": {k: v["forma_mermaid"] for k, v in cfg["estados"].items()},
        "tamano": cfg["tamano_por_dependencias"],
    }, "nodos": [], "conexiones": [], "avisos": []}

    clases, usadas_meta = {}, set()
    nodos, aristas, asignaciones = [], [], []
    por_sistema = {k: [] for k in cfg["sistemas"]}
    for f in incluidas:
        n_dep = len(f.get("depende_de") or [])
        t = _tamano(n_dep, cfg)
        meta = f.get("meta_principal", "sin_meta")
        total, _ = calcular_demanda(f, cfg)
        demanda_txt = "sin evidencia" if total is None else f"{total:g}/10"
        # Una sola línea: la herramienta de FigJam no admite saltos de línea en el texto.
        etiqueta = f"{f['nombre']} | demanda {demanda_txt} | {n_dep} dep.".replace('"', "'")
        forma = sc[cfg["estados"][f["estado"]]["forma_mermaid"]]
        nid = _id_mermaid(f["id"])
        por_sistema.setdefault(f.get("sistema") or "sin_sistema", []).append(
            f'        {nid}{forma[0]}"{etiqueta}"{forma[1]}')
        cname = f"c_{meta}_{t['nombre']}"
        clases[cname] = (f"fill:{cfg['metas'][meta]['color']},stroke:#222,color:#000,"
                         f"font-size:{t['font_px']}px")
        asignaciones.append(f"    class {nid} {cname}")
        spec["nodos"].append({
            "id": f["id"], "nombre": f["nombre"], "color": cfg["metas"][meta]["color"],
            "meta_principal": meta, "forma": cfg["estados"][f["estado"]]["forma_mermaid"],
            "estado": f["estado"], "tamano": t["nombre"], "dependencias": n_dep, "demanda": demanda_txt,
            "sistema": f.get("sistema"),
            # Se registra, pero solo se dibuja si config.figma.conectar_arquitectura es true.
            "parte_arquitectura": f.get("parte_arquitectura") or [],
        })
        for dep in f.get("depende_de") or []:
            if dep in ids_inc:
                aristas.append(f"    {nid} --> {_id_mermaid(dep)}")
                spec["conexiones"].append({"tipo": "depende_de", "de": f["id"], "a": dep})
            else:
                spec["avisos"].append(f"{f['id']} depende de '{dep}', que no está definida: conexión omitida")
        for m in [meta] + list(f.get("metas_secundarias") or []):
            if m in cfg["metas"]:
                usadas_meta.add(m)
                aristas.append(f"    {nid} -.-> meta_{m}")
                spec["conexiones"].append({"tipo": "alimenta_meta", "de": f["id"], "a": m,
                                           "principal": m == meta})

    for m in sorted(usadas_meta):
        forma = sc["meta"]
        nodos.append(f'    meta_{m}{forma[0]}"{cfg["metas"][m]["nombre"]}"{forma[1]}')
        clases[f"m_{m}"] = f"fill:{cfg['metas'][m]['color']},stroke:#222,color:#000,stroke-width:4px"
        asignaciones.append(f"    class meta_{m} m_{m}")

    # Una sección por sistema. Si no tiene fichas definidas, queda reservada con un nodo vacío.
    secciones = []
    for k, contenido in por_sistema.items():
        nombre = cfg["sistemas"].get(k, {}).get("nombre", k).replace('"', "'")
        if not contenido:
            contenido = [f'        vacio_{_id_mermaid(k)}["Reservado: sin funcionalidades definidas"]']
        secciones += [f'    subgraph sec_{_id_mermaid(k)}["{nombre}"]'] + contenido + ["    end"]
    lineas += secciones + nodos + aristas
    lineas += [f"    classDef {k} {v}" for k, v in clases.items()] + asignaciones

    salida = Path(args.out)
    salida.mkdir(parents=True, exist_ok=True)
    (salida / "mapa.mmd").write_text("\n".join(lineas) + "\n", encoding="utf-8")
    (salida / "figma-spec.json").write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Escribí {salida / 'mapa.mmd'} y {salida / 'figma-spec.json'} ({len(incluidas)} funcionalidades).")
    for a in spec["avisos"]:
        print("aviso:", a)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--config", default=str(CONFIG_DEFECTO), help="ruta a config.json")
    sub = p.add_subparsers(dest="cmd", required=True)
    v = sub.add_parser("validar"); v.add_argument("registro"); v.add_argument("--id")
    r = sub.add_parser("resumen"); r.add_argument("registro")
    g = sub.add_parser("figma"); g.add_argument("registro")
    g.add_argument("--todas", action="store_true", help="incluye también las incompletas")
    g.add_argument("--out", default="figma-salida")
    args = p.parse_args()
    cfg = leer_json(args.config)
    {"validar": cmd_validar, "resumen": cmd_resumen, "figma": cmd_figma}[args.cmd](args, cfg)


if __name__ == "__main__":
    main()
