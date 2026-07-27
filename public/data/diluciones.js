const DILUCIONES = {
  noradrenalina: {
    n: "Noradrenalina",
    dosis: { unidad: "mcg/kg/min", min: 0.01, max: 3, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "10 mg / 100 mL SF (100 mcg/mL)", cMcgMl: 100 },
      { l: "20 mg / 100 mL SF (doble, 200 mcg/mL)", cMcgMl: 200 },
      { l: "50 mg / 250 mL SF (200 mcg/mL)", cMcgMl: 200 }
    ],
    ppw: true // por kg peso
  },
  adrenalina: {
    n: "Adrenalina",
    dosis: { unidad: "mcg/kg/min", min: 0.01, max: 2, def: 0.05, step: 0.01 },
    diluciones: [
      { l: "5 mg / 100 mL SF (50 mcg/mL)", cMcgMl: 50 },
      { l: "10 mg / 100 mL SF (100 mcg/mL)", cMcgMl: 100 }
    ],
    ppw: true
  },
  dobutamina: {
    n: "Dobutamina",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 20, def: 5, step: 0.5 },
    diluciones: [
      { l: "250 mg / 250 mL SG5% (1000 mcg/mL)", cMcgMl: 1000 },
      { l: "500 mg / 250 mL SG5% (2000 mcg/mL)", cMcgMl: 2000 }
    ],
    ppw: true
  },
  dopamina: {
    n: "Dopamina",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 20, def: 5, step: 0.5 },
    diluciones: [
      { l: "400 mg / 250 mL SG5% (1600 mcg/mL)", cMcgMl: 1600 }
    ],
    ppw: true
  },
  fentanilo: {
    n: "Fentanilo",
    dosis: { unidad: "mcg/kg/h", min: 0.5, max: 10, def: 2, step: 0.5 },
    diluciones: [
      { l: "500 mcg / 100 mL SF (5 mcg/mL)", cMcgMl: 5 },
      { l: "1000 mcg / 100 mL SF (10 mcg/mL)", cMcgMl: 10 }
    ],
    ppw: true, tiempo: "h"
  },
  remifentanilo: {
    n: "Remifentanilo",
    dosis: { unidad: "mcg/kg/min", min: 0.05, max: 2, def: 0.1, step: 0.05 },
    diluciones: [
      { l: "5 mg / 50 mL SF (100 mcg/mL)", cMcgMl: 100 },
      { l: "2 mg / 50 mL SF (40 mcg/mL)", cMcgMl: 40 }
    ],
    ppw: true
  },
  midazolam: {
    n: "Midazolam",
    dosis: { unidad: "mg/kg/h", min: 0.03, max: 0.3, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "100 mg / 100 mL SF (1 mg/mL)", cMgMl: 1 },
      { l: "50 mg / 50 mL (1 mg/mL, sin diluir)", cMgMl: 1 }
    ],
    ppw: true, tiempo: "h", mg: true
  },
  propofol: {
    n: "Propofol",
    dosis: { unidad: "mg/kg/h", min: 0.5, max: 5, def: 2, step: 0.1 },
    diluciones: [
      { l: "10 mg/mL (1%)", cMgMl: 10 },
      { l: "20 mg/mL (2%)", cMgMl: 20 }
    ],
    ppw: true, tiempo: "h", mg: true
  },
  ketamina: {
    n: "Ketamina",
    dosis: { unidad: "mg/kg/h", min: 0.5, max: 4, def: 1, step: 0.1 },
    diluciones: [
      { l: "500 mg / 100 mL SF (5 mg/mL)", cMgMl: 5 }
    ],
    ppw: true, tiempo: "h", mg: true
  },
  cisatracurio: {
    n: "Cisatracurio",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 5, def: 3, step: 0.5 },
    diluciones: [
      { l: "20 mg / 100 mL SF (200 mcg/mL)", cMcgMl: 200 }
    ],
    ppw: true
  },
  nitroglicerina: {
    n: "Nitroglicerina",
    dosis: { unidad: "mcg/min", min: 5, max: 200, def: 20, step: 5 },
    diluciones: [
      { l: "50 mg / 250 mL SG5% (200 mcg/mL)", cMcgMl: 200 },
      { l: "25 mg / 250 mL SG5% (100 mcg/mL)", cMcgMl: 100 }
    ],
    ppw: false
  },
  nitroprusiato: {
    n: "Nitroprusiato",
    dosis: { unidad: "mcg/kg/min", min: 0.3, max: 8, def: 1, step: 0.1 },
    diluciones: [
      { l: "50 mg / 250 mL SG5% (200 mcg/mL) — proteger de la luz", cMcgMl: 200 }
    ],
    ppw: true
  },
  labetalol: {
    n: "Labetalol",
    dosis: { unidad: "mg/h", min: 20, max: 160, def: 40, step: 10 },
    diluciones: [
      { l: "100 mg / 100 mL SF (1 mg/mL)", cMgMl: 1 },
      { l: "200 mg / 200 mL SF (1 mg/mL)", cMgMl: 1 }
    ],
    ppw: false, tiempo: "h", mg: true
  },
  insulina: {
    n: "Insulina rápida",
    dosis: { unidad: "UI/h", min: 0.5, max: 20, def: 4, step: 0.5 },
    diluciones: [
      { l: "50 UI / 50 mL SF (1 UI/mL) — purgar sistema", cUIMl: 1 }
    ],
    ppw: false, tiempo: "h", ui: true
  },
  heparina: {
    n: "Heparina Na",
    dosis: { unidad: "UI/kg/h", min: 5, max: 30, def: 18, step: 1 },
    diluciones: [
      { l: "25 000 UI / 250 mL SF (100 UI/mL)", cUIMl: 100 }
    ],
    ppw: true, tiempo: "h", ui: true
  },
  furosemida: {
    n: "Furosemida",
    dosis: { unidad: "mg/h", min: 2, max: 40, def: 5, step: 1 },
    diluciones: [
      { l: "250 mg / 250 mL SF (1 mg/mL)", cMgMl: 1 }
    ],
    ppw: false, tiempo: "h", mg: true
  },
  amiodarona: {
    n: "Amiodarona",
    dosis: { unidad: "mg/h", min: 20, max: 60, def: 40, step: 5 },
    diluciones: [
      { l: "900 mg / 500 mL SG5% mantenimiento (1.8 mg/mL)", cMgMl: 1.8 }
    ],
    ppw: false, tiempo: "h", mg: true
  }
};
