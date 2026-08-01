# Conector de terminología clínica (SNOMED CT / NANDA-NIC-NOC)

Codifica los diagnósticos enfermeros de las fichas contra terminologías
estándar sin inventar nunca un código. Si no hay conector disponible o no
hay coincidencia exacta, el campo se marca visible como `unvalidated` con
el motivo.

## Piezas

- `sources/terminology-connector.mjs` — `validarTerminologia(valor, via)`
  con `via: "nnn" | "snomed"`.
- `data/nnn_codes.json` — tabla NNN generada, solo términos verificados.
- `data/codigos_NNN_curados_iNurse.xlsx` — origen editorial: Juanky
  verifica cada término en NNNConsult (Elsevier) y lo marca `Verificado`
  cuando NANDA + NIC + NOC están rellenados.
- `scripts/build_nnn_json.py` — regenera `nnn_codes.json` a partir del
  Excel, descartando cualquier fila `Pendiente`.
- Endpoint `POST /api/terminology/validate` — `{ valor, via }` →
  `{ code_status: "validated" | "unvalidated", ... }`.

## Flujo NNN (NANDA-NIC-NOC)

1. Juanky añade o edita filas en `codigos_NNN_curados_iNurse.xlsx`
   (pestaña "Códigos NNN"), verificando cada código en NNNConsult.
2. Se ejecuta `python3 scripts/build_nnn_json.py` para regenerar
   `data/nnn_codes.json`.
3. Se commitea el JSON regenerado junto al Excel actualizado.
4. En despliegue (Render), `data/nnn_codes.json` se sirve tal cual desde
   el repo — no hay build step adicional, el conector lo lee en caliente
   (con caché por `mtime`, así que un redeploy siempre recoge la última
   versión).

NNNConsult no expone una API pública conocida, así que este flujo manual
con verificación humana es la fuente de verdad; no se hace scraping ni se
inventan códigos.

## Flujo SNOMED CT

Pendiente de licencia (trámite en
`snomed-ct.sanidad.gob.es/snomed-ct/solicitudLicencia.do`). Cuando haya
servidor de terminología (p. ej. Snowstorm con API FHIR):

1. Desplegar/apuntar el servidor y definir `SNOMED_TERMINOLOGY_URL` como
   variable de entorno en Render.
2. Descomentar el cuerpo real de `snomedLookup()` en
   `sources/terminology-connector.mjs` (usa `$expand`/`$lookup` de FHIR).

Hasta entonces, `via: "snomed"` siempre devuelve `unvalidated` con el
motivo explícito.
