import type { Calculator } from '../engine/types'
import { riesgo } from './riesgo'
import { dolor } from './dolor'
import { viaAerea } from './viaaerea'
import { respiratorio } from './respiratorio'
import { hemodinamica } from './hemodinamica'
import { neuro } from './neuro'
import { alcohol } from './alcohol'
import { infecciones } from './infecciones'
import { farmacologia } from './farmacologia'
import { cardioFA } from './cardio-fa'
import { cardioSCA } from './cardio-sca'
import { cardioTEV } from './cardio-tev'
import { cardioICSincope } from './cardio-ic-sincope'
import { cardioVarios } from './cardio-varios'
import { formulas } from './formulas'
import { neurocritico } from './neurocritico'
import { uciGravedad } from './uci-gravedad'
import { respiratorioCritico } from './respiratorio-critico'
import { renalMetabolico } from './renal-metabolico'
import { hepatoDigestivo } from './hepato-digestivo'
import { hematoTrauma } from './hemato-trauma'
import { antropometria } from './antropometria'
import { farmaciaFormulas } from './farmacia-formulas'
import { farmaciaOpioides } from './farmacia-opioides'
import { pediatria } from './pediatria'
import { pediatria2 } from './pediatria-2'
import { primaryCare } from './primary-care'
import { familyPractice } from './family-practice'
import { neuroCritica } from './neuro-critica'
import { urgencias } from './urgencias'
import { medicinaFamilia } from './medicina-familia'
import { cardiotoracica } from './cardiotoracica'

/** Orden de las categorías en la pantalla principal. */
export const CATEGORIES = [
  'Gravedad en UCI y sepsis',
  'Neurocrítico e ictus',
  'Respiratorio crítico y ventilación',
  'Renal, iones y equilibrio ácido-base',
  'Hepatología y digestivo',
  'Hematología y oncología',
  'Trauma y quemados',
  'Riesgo perioperatorio',
  'Vía aérea',
  'Fibrilación auricular y anticoagulación',
  'Síndrome coronario agudo y dolor torácico',
  'Insuficiencia cardíaca',
  'Síncope',
  'Tromboembolismo venoso',
  'Criterios diagnósticos',
  'Gravedad y pronóstico',
  'Dolor',
  'Respiratorio y ventilación',
  'Hemodinámica y fluidos',
  'Neurológico, sedación y gravedad',
  'Alcohol y abstinencia',
  'Infecciones',
  'Endocrino y tóxicos',
  'Antropometría y metabolismo',
  'Función renal y ajuste de dosis',
  'Fluidos, electrolitos e infusiones',
  'Opioides, benzodiacepinas y controlados',
  'Neonatología y pediatría',
  'Obstetricia y ginecología',
  'Neurología crítica e ictus',
  'Urgencias y decisión clínica',
  'Medicina interna y familiar',
  'Geriatría, fragilidad y salud mental',
  'Endocrino, obesidad y diabetes',
  'Hepato-digestivo y nutrición',
  'Cirugía cardiotorácica y perioperatorio',
  'Enfermedad pleural',
  'Soporte extracorpóreo',
  'Aorta y grandes vasos',
  'Farmacología y dosificación',
  'Fórmulas y cálculos clínicos',
]

export const SPECIALTIES = [
  'Anestesiología',
  'Cardiología',
  'Medicina Intensiva',
  'Farmacia',
  'Pediatría',
  'Cuidados Críticos Neonatales',
  'Neurología crítica',
  'Emergencias',
  'Medicina Familiar',
  'Cirugía Cardiotorácica',
  'Obstetricia',
]

/**
 * Escalas que aparecen en la biblioteca de más de una especialidad; se les añade
 * la etiqueta correspondiente para que aparezcan al filtrar por cualquiera de ellas.
 */
const EXTRA_SPECIALTIES: Record<string, string[]> = {
  // Anestesiología ↔ Cardiología
  pam: ['Cardiología', 'Medicina Intensiva'],
  rcri: ['Cardiología'],
  dasi: ['Cardiología', 'Medicina Intensiva'],
  charlson: ['Cardiología', 'Medicina Intensiva'],
  care: ['Cardiología'],
  cage: ['Cardiología'],
  vexus: ['Cardiología'],
  // Compartidas con Medicina Intensiva
  'fluidos-mantenimiento': ['Anestesiología', 'Medicina Intensiva', 'Farmacia'],
  'calcio-corregido': ['Anestesiología', 'Medicina Intensiva'],
  qtc: ['Anestesiología'],
  diuresis: ['Anestesiología', 'Medicina Intensiva'],
  light: ['Anestesiología', 'Medicina Intensiva'],
  mews: ['Anestesiología', 'Medicina Intensiva'],
  mmrc: ['Anestesiología', 'Medicina Intensiva'],
  fick: ['Medicina Intensiva'],
  cpo: ['Medicina Intensiva'],
  ariscat: ['Medicina Intensiva'],
  heart: ['Medicina Intensiva'],
  'has-bled': ['Medicina Intensiva'],
  'cha2ds2-vasc': ['Medicina Intensiva'],
  chads2: ['Medicina Intensiva'],
  'atria-hemorragia': ['Medicina Intensiva'],
  hemorr2hages: ['Medicina Intensiva'],
  'brugada-tv': ['Medicina Intensiva'],
  sgarbossa: ['Medicina Intensiva'],
  nyha: ['Medicina Intensiva'],
  'ccs-angina': ['Medicina Intensiva'],
  'framingham-ic': ['Medicina Intensiva'],
  'duke-endocarditis': ['Medicina Intensiva'],
  ginebra: ['Medicina Intensiva'],
  hestia: ['Medicina Intensiva'],
  padua: ['Medicina Intensiva'],
  'improve-tev': ['Medicina Intensiva'],
  'dimero-edad': ['Medicina Intensiva'],
  perc: ['Medicina Intensiva'],
  'wells-ep': ['Medicina Intensiva'],
  'wells-tvp': ['Medicina Intensiva'],
  nhfs: ['Medicina Intensiva'],
  'el-ganzouri': ['Medicina Intensiva'],
  heaven: ['Medicina Intensiva'],
  mallampati: ['Medicina Intensiva'],
  bps: ['Medicina Intensiva'],
  nvps: ['Medicina Intensiva'],
  abbey: ['Medicina Intensiva'],
  flacc: ['Medicina Intensiva'],
  rdos: ['Medicina Intensiva'],
  baws: ['Medicina Intensiva'],
  drip: ['Medicina Intensiva'],
  'masa-libre-grasa': ['Medicina Intensiva'],
  'anestesicos-locales': ['Medicina Intensiva'],
  mabl: ['Medicina Intensiva'],
  'fluidos-intraoperatorios': ['Medicina Intensiva'],
  reticulocitos: ['Medicina Intensiva'],
  sofa: ['Medicina Intensiva'],
  'spo2-fio2': ['Medicina Intensiva'],
  // Compartidas con Farmacia
  'cockcroft-gault': ['Anestesiología', 'Medicina Intensiva', 'Farmacia'],
  mdrd: ['Farmacia'],
  'imc-sc': ['Farmacia', 'Medicina Intensiva'],
  'peso-ideal': ['Farmacia', 'Medicina Intensiva'],
  'gasto-energetico': ['Farmacia', 'Medicina Intensiva'],
  'masa-libre-grasa-farm': ['Farmacia'],
  'anestesicos-locales-farm': ['Farmacia'],
  'fluidos-intraoperatorios-farm': ['Farmacia'],
  crioprecipitado: ['Farmacia'],
  'etanol-estimado': ['Farmacia'],
  'deficit-agua-libre': ['Farmacia'],
  'deficit-bicarbonato': ['Farmacia'],
  'tpa-ictus': ['Farmacia'],
  'ritmo-goteo': ['Farmacia'],
}

const ALL: Calculator[] = [
  ...uciGravedad,
  ...neurocritico,
  ...respiratorioCritico,
  ...renalMetabolico,
  ...hepatoDigestivo,
  ...hematoTrauma,
  ...riesgo,
  ...viaAerea,
  ...cardioFA,
  ...cardioSCA,
  ...cardioICSincope,
  ...cardioTEV,
  ...cardioVarios,
  ...dolor,
  ...respiratorio,
  ...hemodinamica,
  ...neuro,
  ...alcohol,
  ...infecciones,
  ...antropometria,
  ...farmacologia,
  ...farmaciaFormulas,
  ...farmaciaOpioides,
  ...pediatria,
  ...pediatria2,
  ...primaryCare,
  ...familyPractice,
  ...neuroCritica,
  ...urgencias,
  ...medicinaFamilia,
  ...cardiotoracica,
  ...formulas,
]

export const CALCULATORS: Calculator[] = ALL.map((c) => {
  const extra = EXTRA_SPECIALTIES[c.id]
  return extra ? { ...c, specialty: [...new Set([...c.specialty, ...extra])] } : c
})
