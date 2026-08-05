# Panel clínico editorial — Bitácora de revisiones

Registro de revisiones del contenido clínico de iNurse (fármacos, algoritmos,
calculadoras, Biblioteca Virtual y respuestas de Javny). Cada entrada nueva se
añade en la tabla siguiente y se cierra con un commit que referencia su fila,
por ejemplo `docs: revisión REVISIONES.md#3`.

## Niveles de riesgo

| Nivel | Contenido | Cadencia |
|---|---|---|
| 1 | Dosificación de fármacos, interacciones, algoritmos clínicos críticos (PCR, shock, vía aérea, anafilaxia) | Antes de publicar |
| 2 | Calculadoras clínicas (scores, perfusiones, goteos) | Antes de publicar |
| 3 | Algoritmos y guías por patología no críticos | Cada 4 semanas |
| 4 | Biblioteca Virtual (1.676 fichas) | Por lotes, priorizando fichas más consultadas |
| 5 | Respuestas de Javny (asistente IA) | Auditoría muestral mensual |

## Checklist mínima por revisión

- **Fuente**: identificada, fechada y vigente (ficha CIMA, guía de sociedad
  científica, protocolo hospitalario).
- **Exactitud**: dosis, unidades y vía coinciden con la fuente; contraindicaciones
  y ajustes especiales presentes si la fuente los incluye.
- **Presentación**: sin ambigüedad bajo lectura rápida; unidades siempre visibles;
  disclaimer de apoyo profesional presente en el contexto correspondiente.
- **Trazabilidad**: entrada registrada abajo y commit de git asociado.

## Gestión de discrepancias

- Nivel 1-2 con error confirmado: se retira o marca "en revisión" de inmediato,
  antes de investigar la causa; se corrige y republica solo tras verificación.
- Nivel 3-4 sin riesgo de dosificación: se corrige en el siguiente ciclo de
  mantenimiento.
- Nivel 5: si la auditoría detecta una cita incorrecta, se revisa primero el
  prompt del sistema (`sources/orchestrator.mjs`) antes de tratarlo como caso
  aislado.
- Toda discrepancia se anota abajo, resuelta o no, con el motivo si no se corrige.

## Registro

| Fecha | Contenido | Nivel | Fuente | Resultado |
|---|---|---|---|---|
| _(sin entradas todavía)_ | | | | |
