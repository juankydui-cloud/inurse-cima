const DILUCIONES = {
  noradrenalina: {
    n: "Noradrenalina",
    dosis: { unidad: "mcg/kg/min", min: 0.01, max: 3, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "10 mg / 100 mL SF (100 mcg/mL)", cMcgMl: 100, volMl: 100 },
      { l: "20 mg / 100 mL SF (doble, 200 mcg/mL)", cMcgMl: 200, volMl: 100 },
      { l: "50 mg / 250 mL SF (200 mcg/mL)", cMcgMl: 200, volMl: 250 }
    ],
    ppw: true
  },
  adrenalina: {
    n: "Adrenalina",
    dosis: { unidad: "mcg/kg/min", min: 0.01, max: 2, def: 0.05, step: 0.01 },
    diluciones: [
      { l: "5 mg / 100 mL SF (50 mcg/mL)", cMcgMl: 50, volMl: 100 },
      { l: "10 mg / 100 mL SF (100 mcg/mL)", cMcgMl: 100, volMl: 100 }
    ],
    ppw: true,
    bolo: { desc: "1 mg IV (PCR) cada 3-5 min", dosis: 1, unidad: "mg" }
  },
  dobutamina: {
    n: "Dobutamina",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 20, def: 5, step: 0.5 },
    diluciones: [
      { l: "250 mg / 250 mL SG5% (1000 mcg/mL)", cMcgMl: 1000, volMl: 250 },
      { l: "500 mg / 250 mL SG5% (2000 mcg/mL)", cMcgMl: 2000, volMl: 250 }
    ],
    ppw: true
  },
  dopamina: {
    n: "Dopamina",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 20, def: 5, step: 0.5 },
    diluciones: [
      { l: "400 mg / 250 mL SG5% (1600 mcg/mL)", cMcgMl: 1600, volMl: 250 }
    ],
    ppw: true
  },
  fentanilo: {
    n: "Fentanilo",
    dosis: { unidad: "mcg/kg/h", min: 0.5, max: 10, def: 2, step: 0.5 },
    diluciones: [
      { l: "500 mcg / 100 mL SF (5 mcg/mL)", cMcgMl: 5, volMl: 100 },
      { l: "1000 mcg / 100 mL SF (10 mcg/mL)", cMcgMl: 10, volMl: 100 }
    ],
    ppw: true, tiempo: "h",
    bolo: { desc: "1-2 mcg/kg IV lento", dosisPorKg: 1.5, unidad: "mcg" }
  },
  remifentanilo: {
    n: "Remifentanilo",
    dosis: { unidad: "mcg/kg/min", min: 0.05, max: 2, def: 0.1, step: 0.05 },
    diluciones: [
      { l: "5 mg / 50 mL SF (100 mcg/mL)", cMcgMl: 100, volMl: 50 },
      { l: "2 mg / 50 mL SF (40 mcg/mL)", cMcgMl: 40, volMl: 50 }
    ],
    ppw: true
  },
  midazolam: {
    n: "Midazolam",
    dosis: { unidad: "mg/kg/h", min: 0.03, max: 0.3, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "100 mg / 100 mL SF (1 mg/mL)", cMgMl: 1, volMl: 100 },
      { l: "50 mg / 50 mL (1 mg/mL, sin diluir)", cMgMl: 1, volMl: 50 }
    ],
    ppw: true, tiempo: "h", mg: true,
    bolo: { desc: "0.03-0.05 mg/kg IV lento", dosisPorKg: 0.04, unidad: "mg" }
  },
  propofol: {
    n: "Propofol",
    dosis: { unidad: "mg/kg/h", min: 0.5, max: 5, def: 2, step: 0.1 },
    diluciones: [
      { l: "10 mg/mL (1%)", cMgMl: 10, volMl: 50 },
      { l: "20 mg/mL (2%)", cMgMl: 20, volMl: 50 }
    ],
    ppw: true, tiempo: "h", mg: true,
    bolo: { desc: "1-2 mg/kg IV (inducción)", dosisPorKg: 1.5, unidad: "mg" }
  },
  ketamina: {
    n: "Ketamina",
    dosis: { unidad: "mg/kg/h", min: 0.5, max: 4, def: 1, step: 0.1 },
    diluciones: [
      { l: "500 mg / 100 mL SF (5 mg/mL)", cMgMl: 5, volMl: 100 }
    ],
    ppw: true, tiempo: "h", mg: true,
    bolo: { desc: "0.5-1 mg/kg IV (analgesia subdisociativa)", dosisPorKg: 0.5, unidad: "mg" }
  },
  cisatracurio: {
    n: "Cisatracurio",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 5, def: 3, step: 0.5 },
    diluciones: [
      { l: "20 mg / 100 mL SF (200 mcg/mL)", cMcgMl: 200, volMl: 100 }
    ],
    ppw: true,
    bolo: { desc: "0.15-0.2 mg/kg IV (intubación)", dosisPorKg: 0.15, unidad: "mg" }
  },
  nitroglicerina: {
    n: "Nitroglicerina",
    dosis: { unidad: "mcg/min", min: 5, max: 200, def: 20, step: 5 },
    diluciones: [
      { l: "50 mg / 250 mL SG5% (200 mcg/mL)", cMcgMl: 200, volMl: 250 },
      { l: "25 mg / 250 mL SG5% (100 mcg/mL)", cMcgMl: 100, volMl: 250 }
    ],
    ppw: false
  },
  nitroprusiato: {
    n: "Nitroprusiato",
    dosis: { unidad: "mcg/kg/min", min: 0.3, max: 8, def: 1, step: 0.1 },
    diluciones: [
      { l: "50 mg / 250 mL SG5% (200 mcg/mL) — proteger de la luz", cMcgMl: 200, volMl: 250 }
    ],
    ppw: true
  },
  labetalol: {
    n: "Labetalol",
    dosis: { unidad: "mg/h", min: 20, max: 160, def: 40, step: 10 },
    diluciones: [
      { l: "100 mg / 100 mL SF (1 mg/mL)", cMgMl: 1, volMl: 100 },
      { l: "200 mg / 200 mL SF (1 mg/mL)", cMgMl: 1, volMl: 200 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "20 mg IV en 2 min, repetir cada 10 min", dosis: 20, unidad: "mg" }
  },
  insulina: {
    n: "Insulina rápida",
    dosis: { unidad: "UI/h", min: 0.5, max: 20, def: 4, step: 0.5 },
    diluciones: [
      { l: "50 UI / 50 mL SF (1 UI/mL) — purgar sistema", cUIMl: 1, volMl: 50 }
    ],
    ppw: false, tiempo: "h", ui: true
  },
  heparina: {
    n: "Heparina Na",
    dosis: { unidad: "UI/kg/h", min: 5, max: 30, def: 18, step: 1 },
    diluciones: [
      { l: "25 000 UI / 250 mL SF (100 UI/mL)", cUIMl: 100, volMl: 250 }
    ],
    ppw: true, tiempo: "h", ui: true,
    bolo: { desc: "80 UI/kg IV (bolo inicial anticoagulación)", dosisPorKg: 80, unidad: "UI" }
  },
  furosemida: {
    n: "Furosemida",
    dosis: { unidad: "mg/h", min: 2, max: 40, def: 5, step: 1 },
    diluciones: [
      { l: "250 mg / 250 mL SF (1 mg/mL)", cMgMl: 1, volMl: 250 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "20-40 mg IV directo", dosis: 40, unidad: "mg" }
  },
  amiodarona: {
    n: "Amiodarona",
    dosis: { unidad: "mg/h", min: 20, max: 60, def: 40, step: 5 },
    diluciones: [
      { l: "900 mg / 500 mL SG5% mantenimiento (1.8 mg/mL)", cMgMl: 1.8, volMl: 500 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "300 mg IV en 20-60 min (carga)", dosis: 300, unidad: "mg" }
  },

  dexmedetomidina: {
    n: "Dexmedetomidina",
    dosis: { unidad: "mcg/kg/h", min: 0.2, max: 1.4, def: 0.5, step: 0.1 },
    diluciones: [
      { l: "200 mcg / 50 mL SF (4 mcg/mL)", cMcgMl: 4, volMl: 50 },
      { l: "400 mcg / 100 mL SF (4 mcg/mL)", cMcgMl: 4, volMl: 100 }
    ],
    ppw: true, tiempo: "h",
    bolo: { desc: "1 mcg/kg IV en 10 min (opcional)", dosisPorKg: 1, unidad: "mcg" }
  },
  vasopresina: {
    n: "Vasopresina",
    dosis: { unidad: "UI/h", min: 0.5, max: 6, def: 1.8, step: 0.3 },
    diluciones: [
      { l: "20 UI / 100 mL SF (0.2 UI/mL)", cUIMl: 0.2, volMl: 100 },
      { l: "40 UI / 100 mL SF (0.4 UI/mL)", cUIMl: 0.4, volMl: 100 }
    ],
    ppw: false, tiempo: "h", ui: true
  },
  milrinona: {
    n: "Milrinona",
    dosis: { unidad: "mcg/kg/min", min: 0.125, max: 0.75, def: 0.375, step: 0.025 },
    diluciones: [
      { l: "10 mg / 100 mL SG5% (100 mcg/mL)", cMcgMl: 100, volMl: 100 },
      { l: "20 mg / 100 mL SG5% (200 mcg/mL)", cMcgMl: 200, volMl: 100 }
    ],
    ppw: true,
    bolo: { desc: "50 mcg/kg IV en 10 min (carga)", dosisPorKg: 50, unidad: "mcg" }
  },
  levosimendan: {
    n: "Levosimendán",
    dosis: { unidad: "mcg/kg/min", min: 0.05, max: 0.2, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "12.5 mg / 500 mL SG5% (25 mcg/mL)", cMcgMl: 25, volMl: 500 }
    ],
    ppw: true,
    bolo: { desc: "6-12 mcg/kg IV en 10 min (carga opcional)", dosisPorKg: 10, unidad: "mcg" }
  },
  esmolol: {
    n: "Esmolol",
    dosis: { unidad: "mcg/kg/min", min: 25, max: 300, def: 50, step: 25 },
    diluciones: [
      { l: "2500 mg / 250 mL SF (10 mg/mL = 10000 mcg/mL)", cMcgMl: 10000, volMl: 250 }
    ],
    ppw: true,
    bolo: { desc: "500 mcg/kg IV en 1 min", dosisPorKg: 500, unidad: "mcg" }
  },
  fenilefrina: {
    n: "Fenilefrina",
    dosis: { unidad: "mcg/min", min: 40, max: 360, def: 100, step: 10 },
    diluciones: [
      { l: "10 mg / 250 mL SF (40 mcg/mL)", cMcgMl: 40, volMl: 250 },
      { l: "20 mg / 250 mL SF (80 mcg/mL)", cMcgMl: 80, volMl: 250 }
    ],
    ppw: false,
    bolo: { desc: "100-200 mcg IV directo", dosis: 100, unidad: "mcg" }
  },
  sulfatoMg: {
    n: "Sulfato de magnesio",
    dosis: { unidad: "mg/h", min: 500, max: 3000, def: 1000, step: 250 },
    diluciones: [
      { l: "4 g / 250 mL SF (16 mg/mL) — eclampsia/arritmias", cMgMl: 16, volMl: 250 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "2 g IV en 15-20 min (eclampsia/arritmia)", dosis: 2000, unidad: "mg" }
  },
  morfina: {
    n: "Morfina (perfusión continua)",
    dosis: { unidad: "mg/h", min: 0.5, max: 10, def: 2, step: 0.5 },
    diluciones: [
      { l: "40 mg / 100 mL SF (0.4 mg/mL)", cMgMl: 0.4, volMl: 100 },
      { l: "60 mg / 100 mL SF (0.6 mg/mL)", cMgMl: 0.6, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "2-4 mg IV lento cada 5-10 min", dosis: 3, unidad: "mg" }
  },
  oxitocina: {
    n: "Oxitocina",
    dosis: { unidad: "UI/h", min: 1, max: 40, def: 6, step: 1 },
    diluciones: [
      { l: "10 UI / 500 mL SF (20 mUI/mL = 0.02 UI/mL)", cUIMl: 0.02, volMl: 500 },
      { l: "10 UI / 1000 mL SF (10 mUI/mL = 0.01 UI/mL)", cUIMl: 0.01, volMl: 1000 }
    ],
    ppw: false, tiempo: "h", ui: true
  },
  clevidipino: {
    n: "Clevidipino",
    dosis: { unidad: "mg/h", min: 1, max: 32, def: 2, step: 0.5 },
    diluciones: [
      { l: "Emulsión 0.5 mg/mL (listo para uso)", cMgMl: 0.5, volMl: 50 }
    ],
    ppw: false, tiempo: "h", mg: true
  },
  dexketoprofeno: {
    n: "Dexketoprofeno (perfusión)",
    dosis: { unidad: "mg/h", min: 12.5, max: 50, def: 50, step: 12.5 },
    diluciones: [
      { l: "50 mg / 100 mL SF (0.5 mg/mL) — pasar en 10-30 min", cMgMl: 0.5, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true
  },
  metamizol: {
    n: "Metamizol (perfusión)",
    dosis: { unidad: "mg/h", min: 1000, max: 2000, def: 2000, step: 500 },
    diluciones: [
      { l: "2 g / 100 mL SF (20 mg/mL) — pasar en 15-20 min", cMgMl: 20, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true
  },
  pantoprazol: {
    n: "Pantoprazol (perfusión continua)",
    dosis: { unidad: "mg/h", min: 4, max: 8, def: 8, step: 1 },
    diluciones: [
      { l: "80 mg / 100 mL SF (0.8 mg/mL) — HDA", cMgMl: 0.8, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "80 mg IV en 15 min (HDA)", dosis: 80, unidad: "mg" }
  },
  rocuronio: {
    n: "Rocuronio",
    dosis: { unidad: "mcg/kg/min", min: 5, max: 20, def: 10, step: 1 },
    diluciones: [
      { l: "200 mg / 100 mL SF (2000 mcg/mL)", cMcgMl: 2000, volMl: 100 },
      { l: "500 mg / 250 mL SF (2000 mcg/mL)", cMcgMl: 2000, volMl: 250 }
    ],
    ppw: true,
    bolo: { desc: "0.6-1.2 mg/kg IV (ISR)", dosisPorKg: 1.2, unidad: "mg" }
  }
};
