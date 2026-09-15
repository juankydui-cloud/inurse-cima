import type { Calculator } from '../engine/types'
import { sum } from '../engine/types'

// Escalas de uso diario que faltaban en el catálogo. Ítems y puntos de corte
// tal como están publicados; donde los autores no coinciden se dice en la
// interpretación en lugar de elegir uno en silencio.

const GERIATRIA = 'Geriatría, fragilidad y salud mental'
const ENF = ['Enfermería']

/** Sí/no que aporta `p` puntos. */
const si = (id: string, label: string, p = 1) =>
  ({ id, type: 'boolean', label, points: p }) as const

export const escalas2026: Calculator[] = [
  {
    id: 'braden-q',
    name: 'Braden Q (riesgo de UPP pediátrica)',
    shortName: 'Braden Q',
    description:
      'Riesgo de úlceras por presión en el paciente pediátrico. A menor puntuación, mayor riesgo.',
    category: 'Neonatología y pediatría',
    specialty: ['Pediatría', 'Enfermería'],
    inputs: [
      { id: 'mov', type: 'select', label: 'Movilidad', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Completamente inmóvil' }, { value: 2, label: '2 — Muy limitada' },
        { value: 3, label: '3 — Ligeramente limitada' }, { value: 4, label: '4 — Sin limitaciones' } ] },
      { id: 'act', type: 'select', label: 'Actividad', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Encamado' }, { value: 2, label: '2 — En silla' },
        { value: 3, label: '3 — Deambula ocasionalmente' }, { value: 4, label: '4 — Deambula con frecuencia' } ] },
      { id: 'sen', type: 'select', label: 'Percepción sensorial', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Completamente limitada' }, { value: 2, label: '2 — Muy limitada' },
        { value: 3, label: '3 — Ligeramente limitada' }, { value: 4, label: '4 — Sin alteraciones' } ] },
      { id: 'hum', type: 'select', label: 'Humedad', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Piel constantemente húmeda' }, { value: 2, label: '2 — Muy húmeda' },
        { value: 3, label: '3 — Ocasionalmente húmeda' }, { value: 4, label: '4 — Raramente húmeda' } ] },
      { id: 'fri', type: 'select', label: 'Fricción y cizallamiento', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Problema significativo' }, { value: 2, label: '2 — Problema' },
        { value: 3, label: '3 — Problema potencial' }, { value: 4, label: '4 — Sin problema aparente' } ] },
      { id: 'nut', type: 'select', label: 'Nutrición', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Muy pobre' }, { value: 2, label: '2 — Inadecuada' },
        { value: 3, label: '3 — Adecuada' }, { value: 4, label: '4 — Excelente' } ] },
      { id: 'per', type: 'select', label: 'Perfusión tisular y oxigenación', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Extremadamente comprometida' }, { value: 2, label: '2 — Comprometida' },
        { value: 3, label: '3 — Adecuada' }, { value: 4, label: '4 — Excelente' } ] },
    ],
    compute: (v) => {
      const t = sum(v, ['mov', 'act', 'sen', 'hum', 'fri', 'nut', 'per'])
      return {
        main: String(t),
        mainUnit: 'puntos (7–28)',
        interpretation:
          t <= 16
            ? '🔴 Riesgo de UPP — medidas de prevención activas.'
            : t <= 22
              ? '🟠 Riesgo moderado — reforzar prevención y reevaluar.'
              : '🟢 Riesgo bajo — mantener vigilancia.',
        level: t <= 16 ? 'danger' : t <= 22 ? 'warn' : 'ok',
        details: [
          'Al revés que Norton o EMINA: aquí a MENOR puntuación, MAYOR riesgo.',
          'El corte más difundido es ≤16; algunos centros usan ≤22 para no perder casos.',
        ],
      }
    },
  },

  {
    id: 'downton',
    name: 'Escala de Downton (riesgo de caídas)',
    shortName: 'Downton',
    description: 'Riesgo de caída. Cada factor presente suma un punto.',
    category: GERIATRIA,
    specialty: ENF,
    inputs: [
      si('cai', 'Caídas previas'),
      si('m1', 'Toma tranquilizantes o sedantes'),
      si('m2', 'Toma diuréticos'),
      si('m3', 'Toma hipotensores (no diuréticos)'),
      si('m4', 'Toma antiparkinsonianos'),
      si('m5', 'Toma antidepresivos'),
      si('m6', 'Otros medicamentos'),
      si('s1', 'Déficit visual'),
      si('s2', 'Déficit auditivo'),
      si('s3', 'Afectación de extremidades (ictus, amputación…)'),
      si('men', 'Estado mental confuso'),
      si('dea', 'Deambulación insegura (con ayuda) o imposible'),
    ],
    compute: (v) => {
      const t = sum(v, ['cai', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 's1', 's2', 's3', 'men', 'dea'])
      return {
        main: String(t),
        mainUnit: 'puntos',
        interpretation:
          t >= 3
            ? '🔴 Alto riesgo de caída — activar medidas de prevención según el protocolo del centro.'
            : '🟢 Bajo riesgo — vigilancia habitual; reevaluar si cambia la medicación o la movilidad.',
        level: t >= 3 ? 'danger' : 'ok',
        details: ['Punto de corte de referencia: 3 o más puntos = alto riesgo.'],
      }
    },
  },

  {
    id: 'tinetti',
    name: 'Escala de Tinetti (equilibrio y marcha)',
    shortName: 'Tinetti',
    description: 'Riesgo de caídas por alteración del equilibrio y de la marcha (POMA).',
    category: GERIATRIA,
    specialty: ENF,
    inputs: [
      { id: 'e1', type: 'select', label: 'Equilibrio sentado', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Se inclina o desliza' }, { value: 1, label: '1 — Firme y seguro' } ] },
      { id: 'e2', type: 'select', label: 'Levantarse', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Incapaz sin ayuda' }, { value: 1, label: '1 — Capaz usando los brazos' }, { value: 2, label: '2 — Capaz sin usar los brazos' } ] },
      { id: 'e3', type: 'select', label: 'Intentos de levantarse', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Incapaz sin ayuda' }, { value: 1, label: '1 — Capaz en más de un intento' }, { value: 2, label: '2 — Capaz a la primera' } ] },
      { id: 'e4', type: 'select', label: 'Equilibrio inmediato de pie (primeros 5 s)', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Inestable' }, { value: 1, label: '1 — Estable con apoyo' }, { value: 2, label: '2 — Estable sin apoyo' } ] },
      { id: 'e5', type: 'select', label: 'Equilibrio de pie', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Inestable' }, { value: 1, label: '1 — Estable con base amplia o apoyo' }, { value: 2, label: '2 — Base estrecha sin apoyo' } ] },
      { id: 'e6', type: 'select', label: 'Empujón en el esternón (3 veces)', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Empieza a caerse' }, { value: 1, label: '1 — Se tambalea, se agarra' }, { value: 2, label: '2 — Firme' } ] },
      { id: 'e7', type: 'select', label: 'Ojos cerrados', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Inestable' }, { value: 1, label: '1 — Estable' } ] },
      { id: 'e8', type: 'select', label: 'Giro de 360°', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Pasos discontinuos e inestable' }, { value: 1, label: '1 — Pasos continuos o estable' }, { value: 2, label: '2 — Continuos y estable' } ] },
      { id: 'e9', type: 'select', label: 'Sentarse', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Inseguro, calcula mal la distancia' }, { value: 1, label: '1 — Usa los brazos o movimiento brusco' }, { value: 2, label: '2 — Seguro y suave' } ] },
      { id: 'm1', type: 'select', label: 'Inicio de la marcha', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Duda o titubea' }, { value: 1, label: '1 — Sin titubeo' } ] },
      si('m2a', 'Pie derecho: sobrepasa al izquierdo en el balanceo'),
      si('m2b', 'Pie derecho: se despega completamente del suelo'),
      si('m2c', 'Pie izquierdo: sobrepasa al derecho en el balanceo'),
      si('m2d', 'Pie izquierdo: se despega completamente del suelo'),
      { id: 'm3', type: 'select', label: 'Simetría del paso', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Longitud desigual' }, { value: 1, label: '1 — Simétrica' } ] },
      { id: 'm4', type: 'select', label: 'Continuidad de los pasos', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Paradas o discontinuidad' }, { value: 1, label: '1 — Continuos' } ] },
      { id: 'm5', type: 'select', label: 'Trayectoria', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Desviación marcada' }, { value: 1, label: '1 — Desviación leve o usa ayuda' }, { value: 2, label: '2 — Recta sin ayuda' } ] },
      { id: 'm6', type: 'select', label: 'Tronco', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Balanceo marcado o usa ayuda' }, { value: 1, label: '1 — Flexiona rodillas o abre brazos' }, { value: 2, label: '2 — Sin balanceo ni ayuda' } ] },
      { id: 'm7', type: 'select', label: 'Postura al caminar', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Talones separados' }, { value: 1, label: '1 — Talones casi se tocan' } ] },
    ],
    compute: (v) => {
      const eq = sum(v, ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9'])
      const ma = sum(v, ['m1', 'm2a', 'm2b', 'm2c', 'm2d', 'm3', 'm4', 'm5', 'm6', 'm7'])
      const t = eq + ma
      return {
        main: String(t),
        mainUnit: 'puntos (0–28)',
        secondary: `Equilibrio ${eq}/16 · Marcha ${ma}/12`,
        interpretation:
          t < 19
            ? '🔴 Riesgo alto de caídas.'
            : t <= 23
              ? '🟠 Riesgo moderado de caídas.'
              : '🟢 Riesgo bajo de caídas.',
        level: t < 19 ? 'danger' : t <= 23 ? 'warn' : 'ok',
        details: ['<19 alto · 19-23 moderado · ≥24 bajo.', 'La longitud y altura del paso son cuatro observaciones (dos por pie), no una.'],
      }
    },
  },

  {
    id: 'pfeiffer',
    name: 'Cuestionario de Pfeiffer (SPMSQ)',
    shortName: 'Pfeiffer',
    description: 'Cribado de deterioro cognitivo. Se cuentan los ERRORES, no los aciertos.',
    category: GERIATRIA,
    specialty: ENF,
    inputs: [
      si('p1', '1. ¿Qué día es hoy? (día, mes, año) — falla'),
      si('p2', '2. ¿Qué día de la semana es hoy? — falla'),
      si('p3', '3. ¿Dónde estamos ahora? — falla'),
      si('p4', '4. ¿Cuál es su número de teléfono o dirección? — falla'),
      si('p5', '5. ¿Cuántos años tiene? — falla'),
      si('p6', '6. ¿Dónde nació? — falla'),
      si('p7', '7. ¿Cómo se llama el rey / presidente actual? — falla'),
      si('p8', '8. ¿Cómo se llamaba el anterior? — falla'),
      si('p9', '9. Primer apellido de su madre — falla'),
      si('p10', '10. Reste de 3 en 3 desde 20 — falla'),
      { id: 'esc', type: 'select', label: 'Ajuste por nivel de estudios', dropdown: true, noPoints: true, options: [
        { value: 0, label: 'Estudios primarios o medios (sin ajuste)' },
        { value: -1, label: 'Baja escolarización (se permite 1 error más)' },
        { value: 1, label: 'Estudios superiores (se permite 1 error menos)' } ] },
    ],
    compute: (v) => {
      const e = sum(v, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'])
      const aj = e + (v.esc ?? 0)
      return {
        main: String(e),
        mainUnit: 'errores (0–10)',
        secondary: (v.esc ?? 0) !== 0 ? `Ajustado: ${aj} errores` : undefined,
        secondaryLabel: (v.esc ?? 0) !== 0 ? 'Por escolarización' : undefined,
        interpretation:
          aj <= 2
            ? '🟢 Función intelectual normal.'
            : aj <= 4
              ? '🟡 Deterioro cognitivo leve.'
              : aj <= 7
                ? '🟠 Deterioro cognitivo moderado.'
                : '🔴 Deterioro cognitivo severo.',
        level: aj <= 2 ? 'ok' : aj <= 4 ? 'info' : aj <= 7 ? 'warn' : 'danger',
        details: ['Marca cada pregunta que el paciente FALLE.', 'Es un cribado, no un diagnóstico.'],
      }
    },
  },

  {
    id: 'lawton-brody',
    name: 'Índice de Lawton-Brody (AIVD)',
    shortName: 'Lawton-Brody',
    description: 'Autonomía en las actividades instrumentales de la vida diaria.',
    category: GERIATRIA,
    specialty: ENF,
    inputs: [
      { id: 'sex', type: 'select', label: 'Sexo (determina los ítems que puntúan)', dropdown: true, noPoints: true, options: [
        { value: 1, label: 'Mujer — puntúan los 8 ítems' },
        { value: 0, label: 'Hombre — versión clásica de 5 ítems' } ] },
      si('tel', 'Usa el teléfono de forma autónoma'),
      si('com', 'Hace la compra'),
      si('cui', 'Prepara la comida'),
      si('cas', 'Cuida la casa'),
      si('rop', 'Lava la ropa'),
      si('tra', 'Usa transportes'),
      si('med', 'Maneja su medicación'),
      si('din', 'Maneja el dinero'),
    ],
    compute: (v) => {
      const mujer = (v.sex ?? 1) === 1
      const t = mujer
        ? sum(v, ['tel', 'com', 'cui', 'cas', 'rop', 'tra', 'med', 'din'])
        : sum(v, ['tel', 'com', 'tra', 'med', 'din'])
      const max = mujer ? 8 : 5
      const pct = t / max
      return {
        main: String(t),
        mainUnit: `puntos (0–${max})`,
        interpretation:
          pct >= 1
            ? '🟢 Independiente para las actividades instrumentales.'
            : pct >= 0.75
              ? '🟡 Dependencia ligera.'
              : pct >= 0.5
                ? '🟠 Dependencia moderada.'
                : pct >= 0.25
                  ? '🔴 Dependencia severa.'
                  : '🔴 Dependencia total.',
        level: pct >= 1 ? 'ok' : pct >= 0.75 ? 'info' : pct >= 0.5 ? 'warn' : 'danger',
        details: mujer
          ? ['Marca cada actividad que realice de forma autónoma.']
          : [
              'La versión masculina original no puntúa cocinar, cuidar la casa ni lavar la ropa.',
              'Es un criterio de los años 60 y hoy se discute; si en tu centro se puntúan los 8 ítems, usa la opción «Mujer».',
            ],
      }
    },
  },

  {
    id: 'ramsay',
    name: 'Escala de Ramsay (nivel de sedación)',
    shortName: 'Ramsay',
    description: 'Profundidad de la sedación, de ansioso a sin respuesta.',
    category: 'Neurológico, sedación y gravedad',
    specialty: ['Medicina Intensiva', 'Enfermería'],
    inputs: [
      { id: 'r', type: 'select', label: 'Nivel observado', dropdown: true, noPoints: true, options: [
        { value: 1, label: '1 — Ansioso, agitado o inquieto' },
        { value: 2, label: '2 — Colaborador, orientado y tranquilo' },
        { value: 3, label: '3 — Dormido, responde solo a órdenes' },
        { value: 4, label: '4 — Dormido, respuesta rápida a estímulo glabelar o auditivo intenso' },
        { value: 5, label: '5 — Dormido, respuesta perezosa a estímulo glabelar o auditivo intenso' },
        { value: 6, label: '6 — Sin respuesta' } ] },
    ],
    compute: (v) => {
      const r = v.r ?? 1
      return {
        main: String(r),
        mainUnit: '/ 6',
        interpretation:
          r === 1
            ? '🟠 Sedación insuficiente.'
            : r <= 3
              ? '🟢 Nivel de sedación adecuado para la mayoría de situaciones.'
              : r <= 5
                ? '🟠 Sedación profunda — revisar si está indicada.'
                : '🔴 Sedación excesiva — replantear la pauta.',
        level: r === 1 ? 'warn' : r <= 3 ? 'ok' : r <= 5 ? 'warn' : 'danger',
      }
    },
  },

  {
    id: 'escid',
    name: 'ESCID (dolor en paciente no comunicativo)',
    shortName: 'ESCID',
    description:
      'Conductas indicadoras de dolor en el paciente crítico no comunicativo con ventilación mecánica.',
    category: 'Dolor',
    specialty: ['Medicina Intensiva', 'Enfermería'],
    inputs: [
      { id: 'fac', type: 'select', label: 'Musculatura facial', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Relajada' }, { value: 1, label: '1 — En tensión, ceño fruncido' }, { value: 2, label: '2 — Ceño fruncido habitual, dientes apretados' } ] },
      { id: 'tra', type: 'select', label: 'Tranquilidad', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Tranquilo, movimientos normales' }, { value: 1, label: '1 — Movimientos ocasionales de inquietud' }, { value: 2, label: '2 — Movimientos frecuentes, cabeza o extremidades' } ] },
      { id: 'ton', type: 'select', label: 'Tono muscular', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Normal' }, { value: 1, label: '1 — Aumentado, flexión de dedos' }, { value: 2, label: '2 — Rígido' } ] },
      { id: 'vm', type: 'select', label: 'Adaptación a la ventilación mecánica', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Tolera la ventilación' }, { value: 1, label: '1 — Tose, pero tolera' }, { value: 2, label: '2 — Lucha contra el respirador' } ] },
      { id: 'con', type: 'select', label: 'Confortabilidad', dropdown: true, noPoints: true, options: [
        { value: 0, label: '0 — Confortable, tranquilo' }, { value: 1, label: '1 — Se tranquiliza al tacto o la voz' }, { value: 2, label: '2 — Difícil de confortar' } ] },
    ],
    compute: (v) => {
      const t = sum(v, ['fac', 'tra', 'ton', 'vm', 'con'])
      return {
        main: String(t),
        mainUnit: 'puntos (0–10)',
        interpretation:
          t === 0
            ? '🟢 Sin dolor.'
            : t <= 3
              ? '🟡 Dolor leve.'
              : t <= 6
                ? '🟠 Dolor moderado — valorar analgesia.'
                : '🔴 Dolor intenso — analgesia y reevaluar.',
        level: t === 0 ? 'ok' : t <= 3 ? 'info' : t <= 6 ? 'warn' : 'danger',
        details: ['Adaptación española de la escala de Campbell para pacientes con ventilación mecánica: sustituye la respuesta verbal por la adaptación al respirador.'],
      }
    },
  },

  {
    id: 'eat-10',
    name: 'EAT-10 (cribado de disfagia)',
    shortName: 'EAT-10',
    description: 'Cribado de alteración de la deglución. Lo responde el propio paciente.',
    category: 'Valoración enfermera',
    specialty: ENF,
    inputs: [
      'Mi problema para tragar me ha llevado a perder peso',
      'Interfiere con mi capacidad para comer fuera de casa',
      'Tragar líquidos me supone un esfuerzo extra',
      'Tragar sólidos me supone un esfuerzo extra',
      'Tragar pastillas me supone un esfuerzo extra',
      'Tragar es doloroso',
      'El placer de comer se ve afectado',
      'Cuando trago, la comida se pega en mi garganta',
      'Toso cuando como',
      'Tragar es estresante',
    ].map((label, i) => ({
      id: `q${i + 1}`,
      type: 'select' as const,
      label: `${i + 1}. ${label}`,
      dropdown: true,
      noPoints: true,
      options: [
        { value: 0, label: '0 — Ningún problema' },
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4 — Problema serio' },
      ],
    })),
    compute: (v) => {
      const t = sum(v, ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'])
      return {
        main: String(t),
        mainUnit: 'puntos (0–40)',
        interpretation:
          t >= 3
            ? '🔴 Posible alteración de la deglución — valorar con exploración clínica (MECV-V) o derivar.'
            : '🟢 Sin datos de disfagia en el cribado.',
        level: t >= 3 ? 'danger' : 'ok',
        details: ['Punto de corte: 3 o más puntos.', 'Es un cribado; no sustituye a la exploración.'],
      }
    },
  },

  {
    id: 'cormack-lehane',
    name: 'Cormack-Lehane (visión laringoscópica)',
    shortName: 'Cormack-Lehane',
    description: 'Grado de visión de la glotis en la laringoscopia directa.',
    category: 'Vía aérea',
    specialty: ['Anestesiología'],
    inputs: [
      { id: 'c', type: 'select', label: 'Grado observado', dropdown: true, noPoints: true, options: [
        { value: 1, label: 'I — Se ve toda la glotis' },
        { value: 2, label: 'II — Parte posterior de la glotis o solo aritenoides' },
        { value: 3, label: 'III — Solo se ve la epiglotis' },
        { value: 4, label: 'IV — No se ve la epiglotis ni la glotis' } ] },
    ],
    compute: (v) => {
      const c = v.c ?? 1
      const rom = ['', 'I', 'II', 'III', 'IV'][c] ?? '—'
      return {
        main: rom,
        mainUnit: 'grado',
        interpretation:
          c <= 2
            ? '🟢 Intubación habitualmente sin dificultad.'
            : c === 3
              ? '🟠 Intubación difícil — considerar guía, videolaringoscopio o cambio de dispositivo.'
              : '🔴 Intubación muy difícil — algoritmo de vía aérea difícil y pedir ayuda.',
        level: c <= 2 ? 'ok' : c === 3 ? 'warn' : 'danger',
        details: ['Es un hallazgo de la laringoscopia, no una predicción previa: para eso está el Mallampati.'],
      }
    },
  },
]
