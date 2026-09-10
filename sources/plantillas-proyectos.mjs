/* ═══════════════════════════════════════════════════════════════════════════
   Plantillas de estructura · Proyectos con Javny
   ---------------------------------------------------------------------------
   Un tipo de documento = una lista de apartados base, en el orden habitual de
   ese tipo de trabajo. El endpoint /api/proyectos/estructura le pasa esta
   plantilla al modelo y le pide que la ADAPTE a la descripción del usuario
   (puede añadir, quitar o renombrar apartados si el caso lo justifica), nunca
   que la invente desde cero: así un TFM siempre parte de "Marco teórico" y
   "Metodología", aparezca lo que aparezca en la descripción.

   Añadir un tipo nuevo: una entrada en TIPOS_DOCUMENTO (id + etiqueta que ve
   el usuario) y su lista en PLANTILLAS con la misma id. Si falta la plantilla,
   se usa la de "libre".

   Este archivo es la única fuente de los tipos: el cliente los pide a
   GET /api/proyectos/tipos en vez de llevar su propia copia del listado, para
   que no puedan desincronizarse.
   ═══════════════════════════════════════════════════════════════════════════ */

export const TIPOS_DOCUMENTO = [
  { id: "protocolo", label: "Protocolo asistencial" },
  { id: "procedimiento", label: "Procedimiento de enfermería" },
  { id: "cuidados", label: "Plan de cuidados (NANDA·NOC·NIC)" },
  { id: "mejora", label: "Proyecto de mejora" },
  { id: "sesion", label: "Sesión clínica" },
  { id: "investigacion", label: "Proyecto de investigación" },
  { id: "tfg", label: "Trabajo de fin de grado (TFG)" },
  { id: "tfm", label: "Trabajo de fin de máster (TFM)" },
  { id: "revision", label: "Revisión bibliográfica" },
  { id: "evento_adverso", label: "Informe de evento adverso" },
  { id: "libre", label: "Libre" }
];

// Compartida por TFG, TFM y revisión bibliográfica: es la misma estructura
// académica clásica para los tres, tal como la pidió el usuario.
const ACADEMICA = [
  "Resumen y palabras clave",
  "Introducción",
  "Marco teórico",
  "Metodología",
  "Resultados",
  "Discusión",
  "Conclusiones",
  "Bibliografía",
  "Anexos"
];

export const PLANTILLAS = {
  protocolo: [
    "Justificación",
    "Objetivos",
    "Ámbito de aplicación",
    "Población",
    "Procedimiento",
    "Registro",
    "Indicadores",
    "Bibliografía",
    "Anexos"
  ],
  procedimiento: [
    "Objetivo",
    "Alcance",
    "Definiciones",
    "Responsabilidades",
    "Material y recursos",
    "Procedimiento paso a paso",
    "Precauciones y criterios de seguridad",
    "Registro",
    "Indicadores de cumplimiento",
    "Bibliografía",
    "Anexos"
  ],
  cuidados: [
    "Valoración inicial",
    "Problemas y necesidades detectadas",
    "Diagnósticos de enfermería (NANDA)",
    "Objetivos (NOC)",
    "Intervenciones (NIC)",
    "Plan de cuidados",
    "Educación sanitaria",
    "Evaluación y seguimiento",
    "Bibliografía"
  ],
  mejora: [
    "Resumen ejecutivo",
    "Introducción",
    "Justificación",
    "Análisis de la situación",
    "Objetivo general",
    "Objetivos específicos",
    "Metodología y plan de acción",
    "Cronograma",
    "Recursos necesarios",
    "Indicadores de evaluación",
    "Riesgos y medidas preventivas",
    "Conclusiones",
    "Bibliografía",
    "Anexos"
  ],
  sesion: [
    "Presentación del caso o tema",
    "Objetivos de la sesión",
    "Antecedentes y contexto clínico",
    "Desarrollo",
    "Discusión y evidencia actual",
    "Puntos clave y conclusiones",
    "Bibliografía"
  ],
  investigacion: [
    "Resumen",
    "Antecedentes y estado de la cuestión",
    "Justificación",
    "Hipótesis o pregunta de investigación",
    "Objetivo general",
    "Objetivos específicos",
    "Diseño y metodología",
    "Población y muestra",
    "Variables e instrumentos",
    "Plan de análisis",
    "Consideraciones éticas",
    "Cronograma",
    "Presupuesto y recursos",
    "Resultados esperados",
    "Plan de difusión",
    "Bibliografía",
    "Anexos"
  ],
  tfg: ACADEMICA,
  tfm: ACADEMICA,
  revision: ACADEMICA,
  evento_adverso: [
    "Descripción del evento",
    "Cronología de los hechos",
    "Personas y servicios implicados",
    "Análisis de causas",
    "Factores contribuyentes",
    "Consecuencias para el paciente",
    "Medidas inmediatas adoptadas",
    "Plan de acción y mejoras",
    "Seguimiento y cierre",
    "Bibliografía",
    "Anexos"
  ],
  libre: [
    "Introducción",
    "Desarrollo",
    "Conclusiones",
    "Bibliografía"
  ]
};

const TIPOS_VALIDOS = new Set(TIPOS_DOCUMENTO.map(t => t.id));

export function tipoValido(id) {
  return TIPOS_VALIDOS.has(String(id || ""));
}

export function etiquetaDeTipo(id) {
  return TIPOS_DOCUMENTO.find(t => t.id === id)?.label || "Documento";
}

export function plantillaDe(id) {
  return PLANTILLAS[id] || PLANTILLAS.libre;
}
