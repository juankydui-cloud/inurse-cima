const DILUCIONES = {
  noradrenalina: {
    n: "Noradrenalina",
    dosis: { unidad: "mcg/kg/min", min: 0.01, max: 3, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "10 mg / 100 mL SF (100 mcg/mL)", cMcgMl: 100, volMl: 100 },
      { l: "20 mg / 100 mL SF (doble, 200 mcg/mL)", cMcgMl: 200, volMl: 100 },
      { l: "50 mg / 250 mL SF (200 mcg/mL)", cMcgMl: 200, volMl: 250 }
    ],
    ppw: true,
    info: { inicio: "1-2 min", vida: "2-3 min", notas: "Vía central obligatoria. Vigilar extravasación. Efecto α₁ predominante." }
  },
  adrenalina: {
    n: "Adrenalina",
    dosis: { unidad: "mcg/kg/min", min: 0.01, max: 2, def: 0.05, step: 0.01 },
    diluciones: [
      { l: "5 mg / 100 mL SF (50 mcg/mL)", cMcgMl: 50, volMl: 100 },
      { l: "10 mg / 100 mL SF (100 mcg/mL)", cMcgMl: 100, volMl: 100 }
    ],
    ppw: true,
    bolo: { desc: "1 mg IV (PCR) cada 3-5 min", dosis: 1, unidad: "mg" },
    info: { inicio: "1-2 min", vida: "2-3 min", notas: "β a dosis bajas (<0.1), α a dosis altas. Puede causar arritmias y acidosis láctica." }
  },
  dobutamina: {
    n: "Dobutamina",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 20, def: 5, step: 0.5 },
    diluciones: [
      { l: "250 mg / 250 mL SG5% (1000 mcg/mL)", cMcgMl: 1000, volMl: 250 },
      { l: "500 mg / 250 mL SG5% (2000 mcg/mL)", cMcgMl: 2000, volMl: 250 }
    ],
    ppw: true,
    info: { inicio: "2-5 min", vida: "2-3 min", notas: "Inotrópico β₁. Puede causar hipotensión y taquicardia. No mezclar con bicarbonato." }
  },
  dopamina: {
    n: "Dopamina",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 20, def: 5, step: 0.5 },
    diluciones: [
      { l: "400 mg / 250 mL SG5% (1600 mcg/mL)", cMcgMl: 1600, volMl: 250 }
    ],
    ppw: true,
    info: { inicio: "2-5 min", vida: "2 min", notas: "Dopa <5: renal. β 5-10: inotrópico. α >10: vasopresor. Vía central." }
  },
  fentanilo: {
    n: "Fentanilo",
    dosis: { unidad: "mcg/kg/h", min: 0.5, max: 10, def: 2, step: 0.5 },
    diluciones: [
      { l: "500 mcg / 100 mL SF (5 mcg/mL)", cMcgMl: 5, volMl: 100 },
      { l: "1000 mcg / 100 mL SF (10 mcg/mL)", cMcgMl: 10, volMl: 100 }
    ],
    ppw: true, tiempo: "h",
    bolo: { desc: "1-2 mcg/kg IV lento", dosisPorKg: 1.5, unidad: "mcg" },
    info: { inicio: "1-2 min IV", vida: "2-4 h", notas: "Opioide sintético. 100× más potente que morfina. Rigidez torácica a dosis altas." }
  },
  remifentanilo: {
    n: "Remifentanilo",
    dosis: { unidad: "mcg/kg/min", min: 0.05, max: 2, def: 0.1, step: 0.05 },
    diluciones: [
      { l: "5 mg / 50 mL SF (100 mcg/mL)", cMcgMl: 100, volMl: 50 },
      { l: "2 mg / 50 mL SF (40 mcg/mL)", cMcgMl: 40, volMl: 50 }
    ],
    ppw: true,
    info: { inicio: "1 min", vida: "3-5 min", notas: "Metabolismo por esterasas plasmáticas. Sin acumulación. Requiere analgesia de transición al retirar." }
  },
  midazolam: {
    n: "Midazolam",
    dosis: { unidad: "mg/kg/h", min: 0.03, max: 0.3, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "100 mg / 100 mL SF (1 mg/mL)", cMgMl: 1, volMl: 100 },
      { l: "50 mg / 50 mL (1 mg/mL, sin diluir)", cMgMl: 1, volMl: 50 }
    ],
    ppw: true, tiempo: "h", mg: true,
    bolo: { desc: "0.03-0.05 mg/kg IV lento", dosisPorKg: 0.04, unidad: "mg" },
    info: { inicio: "2-3 min IV", vida: "1.5-2.5 h", notas: "Benzodiacepina. Acumulación en IR/IH. Antídoto: flumazenilo. Monitorizar sedación (RASS)." }
  },
  propofol: {
    n: "Propofol",
    dosis: { unidad: "mg/kg/h", min: 0.5, max: 5, def: 2, step: 0.1 },
    diluciones: [
      { l: "10 mg/mL (1%)", cMgMl: 10, volMl: 50 },
      { l: "20 mg/mL (2%)", cMgMl: 20, volMl: 50 }
    ],
    ppw: true, tiempo: "h", mg: true,
    bolo: { desc: "1-2 mg/kg IV (inducción)", dosisPorKg: 1.5, unidad: "mg" },
    info: { inicio: "30-60 seg", vida: "5-10 min", notas: "Síndrome de infusión (PRIS) si >5 mg/kg/h o >48h. Contar lípidos (1.1 kcal/mL al 1%). Cambiar jeringa cada 12h." }
  },
  ketamina: {
    n: "Ketamina",
    dosis: { unidad: "mg/kg/h", min: 0.5, max: 4, def: 1, step: 0.1 },
    diluciones: [
      { l: "500 mg / 100 mL SF (5 mg/mL)", cMgMl: 5, volMl: 100 }
    ],
    ppw: true, tiempo: "h", mg: true,
    bolo: { desc: "0.5-1 mg/kg IV (analgesia subdisociativa)", dosisPorKg: 0.5, unidad: "mg" },
    info: { inicio: "1 min IV", vida: "10-15 min", notas: "Disociativo. Broncodilatador. Mantiene reflejos vía aérea. Alucinaciones (asociar BZD). Contraindicado en HTA grave." }
  },
  cisatracurio: {
    n: "Cisatracurio",
    dosis: { unidad: "mcg/kg/min", min: 1, max: 5, def: 3, step: 0.5 },
    diluciones: [
      { l: "20 mg / 100 mL SF (200 mcg/mL)", cMcgMl: 200, volMl: 100 }
    ],
    ppw: true,
    bolo: { desc: "0.15-0.2 mg/kg IV (intubación)", dosisPorKg: 0.15, unidad: "mg" },
    info: { inicio: "3-5 min", vida: "25-30 min", notas: "BNM no despolarizante. Degradación de Hofmann (no depende de IR/IH). Monitorizar TOF." }
  },
  nitroglicerina: {
    n: "Nitroglicerina",
    dosis: { unidad: "mcg/min", min: 5, max: 200, def: 20, step: 5 },
    diluciones: [
      { l: "50 mg / 250 mL SG5% (200 mcg/mL)", cMcgMl: 200, volMl: 250 },
      { l: "25 mg / 250 mL SG5% (100 mcg/mL)", cMcgMl: 100, volMl: 250 }
    ],
    ppw: false,
    info: { inicio: "1-2 min", vida: "3-5 min", notas: "Vasodilatador venoso predominante. Se adsorbe al PVC: usar conexiones de polietileno. Cefalea frecuente." }
  },
  nitroprusiato: {
    n: "Nitroprusiato",
    dosis: { unidad: "mcg/kg/min", min: 0.3, max: 8, def: 1, step: 0.1 },
    diluciones: [
      { l: "50 mg / 250 mL SG5% (200 mcg/mL) — proteger de la luz", cMcgMl: 200, volMl: 250 }
    ],
    ppw: true,
    info: { inicio: "Segundos", vida: "2 min", notas: "Proteger de la luz. Toxicidad por cianuro si >2 mcg/kg/min >72h. Monitorizar tiosulfato y lactato." }
  },
  labetalol: {
    n: "Labetalol",
    dosis: { unidad: "mg/h", min: 20, max: 160, def: 40, step: 10 },
    diluciones: [
      { l: "100 mg / 100 mL SF (1 mg/mL)", cMgMl: 1, volMl: 100 },
      { l: "200 mg / 200 mL SF (1 mg/mL)", cMgMl: 1, volMl: 200 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "20 mg IV en 2 min, repetir cada 10 min", dosis: 20, unidad: "mg" },
    info: { inicio: "5 min IV", vida: "3-4 h", notas: "α/β-bloqueante (ratio 1:7). Seguro en embarazo y ACV. CI en asma, BAV >1º, IC descompensada." }
  },
  insulina: {
    n: "Insulina rápida",
    dosis: { unidad: "UI/h", min: 0.5, max: 20, def: 4, step: 0.5 },
    diluciones: [
      { l: "50 UI / 50 mL SF (1 UI/mL) — purgar sistema", cUIMl: 1, volMl: 50 }
    ],
    ppw: false, tiempo: "h", ui: true,
    info: { inicio: "15-30 min IV", vida: "30-60 min", notas: "Purgar sistema 30 min antes. Monitorizar glucemia horaria y K⁺ cada 4-6h. Protocolo de hipoglucemia preparado." }
  },
  heparina: {
    n: "Heparina Na",
    dosis: { unidad: "UI/kg/h", min: 5, max: 30, def: 18, step: 1 },
    diluciones: [
      { l: "25 000 UI / 250 mL SF (100 UI/mL)", cUIMl: 100, volMl: 250 }
    ],
    ppw: true, tiempo: "h", ui: true,
    bolo: { desc: "80 UI/kg IV (bolo inicial anticoagulación)", dosisPorKg: 80, unidad: "UI" },
    info: { inicio: "Inmediato IV", vida: "1-2 h", notas: "Control TTPa cada 6h (objetivo 1.5-2.5×). Antídoto: protamina 1 mg/100 UI. Riesgo TIH: controlar plaquetas." }
  },
  furosemida: {
    n: "Furosemida",
    dosis: { unidad: "mg/h", min: 2, max: 40, def: 5, step: 1 },
    diluciones: [
      { l: "250 mg / 250 mL SF (1 mg/mL)", cMgMl: 1, volMl: 250 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "20-40 mg IV directo", dosis: 40, unidad: "mg" },
    info: { inicio: "5 min IV", vida: "2 h", notas: "Diurético de asa. Máx bolo 4 mg/min (ototoxicidad). Vigilar K⁺, Mg²⁺, Na⁺. Proteger de la luz." }
  },
  amiodarona: {
    n: "Amiodarona",
    dosis: { unidad: "mg/h", min: 20, max: 60, def: 40, step: 5 },
    diluciones: [
      { l: "900 mg / 500 mL SG5% mantenimiento (1.8 mg/mL)", cMgMl: 1.8, volMl: 500 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "300 mg IV en 20-60 min (carga)", dosis: 300, unidad: "mg" },
    info: { inicio: "Horas (efecto completo días)", vida: "40-55 días", notas: "Antiarrítmico clase III. Fototoxicidad. QTc, TSH, PFH periódicos. Solo SG5% (precipita con SF). Flebitis en periférica." }
  },

  dexmedetomidina: {
    n: "Dexmedetomidina",
    dosis: { unidad: "mcg/kg/h", min: 0.2, max: 1.4, def: 0.5, step: 0.1 },
    diluciones: [
      { l: "200 mcg / 50 mL SF (4 mcg/mL)", cMcgMl: 4, volMl: 50 },
      { l: "400 mcg / 100 mL SF (4 mcg/mL)", cMcgMl: 4, volMl: 100 }
    ],
    ppw: true, tiempo: "h",
    bolo: { desc: "1 mcg/kg IV en 10 min (opcional)", dosisPorKg: 1, unidad: "mcg" },
    info: { inicio: "5-10 min", vida: "2 h", notas: "Agonista α₂. Sedación cooperativa. Bradicardia e hipotensión frecuentes. No deprime respiración significativamente." }
  },
  vasopresina: {
    n: "Vasopresina",
    dosis: { unidad: "UI/h", min: 0.5, max: 6, def: 1.8, step: 0.3 },
    diluciones: [
      { l: "20 UI / 100 mL SF (0.2 UI/mL)", cUIMl: 0.2, volMl: 100 },
      { l: "40 UI / 100 mL SF (0.4 UI/mL)", cUIMl: 0.4, volMl: 100 }
    ],
    ppw: false, tiempo: "h", ui: true,
    info: { inicio: "Inmediato", vida: "10-20 min", notas: "No titular según TA (dosis fija habitual). Asociar a noradrenalina en shock séptico. Isquemia digital y esplácnica." }
  },
  milrinona: {
    n: "Milrinona",
    dosis: { unidad: "mcg/kg/min", min: 0.125, max: 0.75, def: 0.375, step: 0.025 },
    diluciones: [
      { l: "10 mg / 100 mL SG5% (100 mcg/mL)", cMcgMl: 100, volMl: 100 },
      { l: "20 mg / 100 mL SG5% (200 mcg/mL)", cMcgMl: 200, volMl: 100 }
    ],
    ppw: true,
    bolo: { desc: "50 mcg/kg IV en 10 min (carga)", dosisPorKg: 50, unidad: "mcg" },
    info: { inicio: "5-15 min", vida: "1-2 h", notas: "Inhibidor PDE-3. Inotrópico + vasodilatador. Ajustar en IR. Puede causar arritmias y trombocitopenia." }
  },
  levosimendan: {
    n: "Levosimendán",
    dosis: { unidad: "mcg/kg/min", min: 0.05, max: 0.2, def: 0.1, step: 0.01 },
    diluciones: [
      { l: "12.5 mg / 500 mL SG5% (25 mcg/mL)", cMcgMl: 25, volMl: 500 }
    ],
    ppw: true,
    bolo: { desc: "6-12 mcg/kg IV en 10 min (carga opcional)", dosisPorKg: 10, unidad: "mcg" },
    info: { inicio: "5-10 min", vida: "~1 h (metabolito activo 80 h)", notas: "Sensibilizador al Ca²⁺. Efecto persiste 7-9 días por metabolito OR-1896. Infusión 24h. Hipotensión con bolo de carga." }
  },
  esmolol: {
    n: "Esmolol",
    dosis: { unidad: "mcg/kg/min", min: 25, max: 300, def: 50, step: 25 },
    diluciones: [
      { l: "2500 mg / 250 mL SF (10 mg/mL = 10000 mcg/mL)", cMcgMl: 10000, volMl: 250 }
    ],
    ppw: true,
    bolo: { desc: "500 mcg/kg IV en 1 min", dosisPorKg: 500, unidad: "mcg" },
    info: { inicio: "1-2 min", vida: "9 min", notas: "β₁-selectivo ultracorto. Ideal para taquiarritmias perioperatorias. Metabolizado por esterasas eritrocitarias." }
  },
  fenilefrina: {
    n: "Fenilefrina",
    dosis: { unidad: "mcg/min", min: 40, max: 360, def: 100, step: 10 },
    diluciones: [
      { l: "10 mg / 250 mL SF (40 mcg/mL)", cMcgMl: 40, volMl: 250 },
      { l: "20 mg / 250 mL SF (80 mcg/mL)", cMcgMl: 80, volMl: 250 }
    ],
    ppw: false,
    bolo: { desc: "100-200 mcg IV directo", dosis: 100, unidad: "mcg" },
    info: { inicio: "Inmediato", vida: "15-20 min", notas: "Agonista α₁ puro. Sin efecto inotrópico. Bradicardia refleja. Útil en hipotensión con taquicardia (anestesia espinal)." }
  },
  sulfatoMg: {
    n: "Sulfato de magnesio",
    dosis: { unidad: "mg/h", min: 500, max: 3000, def: 1000, step: 250 },
    diluciones: [
      { l: "4 g / 250 mL SF (16 mg/mL) — eclampsia/arritmias", cMgMl: 16, volMl: 250 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "2 g IV en 15-20 min (eclampsia/arritmia)", dosis: 2000, unidad: "mg" },
    info: { inicio: "Inmediato IV", vida: "Variable", notas: "Antídoto: gluconato cálcico. Vigilar reflejos rotulianos, FR y diuresis. Objetivo Mg sérico 4-7 mEq/L en eclampsia." }
  },
  morfina: {
    n: "Morfina (perfusión continua)",
    dosis: { unidad: "mg/h", min: 0.5, max: 10, def: 2, step: 0.5 },
    diluciones: [
      { l: "40 mg / 100 mL SF (0.4 mg/mL)", cMgMl: 0.4, volMl: 100 },
      { l: "60 mg / 100 mL SF (0.6 mg/mL)", cMgMl: 0.6, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "2-4 mg IV lento cada 5-10 min", dosis: 3, unidad: "mg" },
    info: { inicio: "5-10 min IV", vida: "3-4 h", notas: "Metabolito activo M6G se acumula en IR. Libera histamina: hipotensión y broncoespasmo. Antídoto: naloxona." }
  },
  oxitocina: {
    n: "Oxitocina",
    dosis: { unidad: "UI/h", min: 1, max: 40, def: 6, step: 1 },
    diluciones: [
      { l: "10 UI / 500 mL SF (20 mUI/mL = 0.02 UI/mL)", cUIMl: 0.02, volMl: 500 },
      { l: "10 UI / 1000 mL SF (10 mUI/mL = 0.01 UI/mL)", cUIMl: 0.01, volMl: 1000 }
    ],
    ppw: false, tiempo: "h", ui: true,
    info: { inicio: "3-5 min IV", vida: "5-10 min", notas: "Aumentar progresivamente cada 15-30 min. Vigilar hipertonía uterina. Efecto antidiurético a dosis altas: vigilar balance hídrico." }
  },
  clevidipino: {
    n: "Clevidipino",
    dosis: { unidad: "mg/h", min: 1, max: 32, def: 2, step: 0.5 },
    diluciones: [
      { l: "Emulsión 0.5 mg/mL (listo para uso)", cMgMl: 0.5, volMl: 50 }
    ],
    ppw: false, tiempo: "h", mg: true,
    info: { inicio: "2-4 min", vida: "1 min", notas: "Calcioantagonista IV ultracorto. Emulsión lipídica: contar calorías (2 kcal/mL). Desechar a las 12h de abrir. Max 1000 mL/24h." }
  },
  dexketoprofeno: {
    n: "Dexketoprofeno (perfusión)",
    dosis: { unidad: "mg/h", min: 12.5, max: 50, def: 50, step: 12.5 },
    diluciones: [
      { l: "50 mg / 100 mL SF (0.5 mg/mL) — pasar en 10-30 min", cMgMl: 0.5, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true,
    info: { inicio: "30 min IV", vida: "1.5-2.5 h", notas: "AINE. Máx 150 mg/día. CI en IR grave, úlcera activa, tercer trimestre. Máx 2 días IV." }
  },
  metamizol: {
    n: "Metamizol (perfusión)",
    dosis: { unidad: "mg/h", min: 1000, max: 2000, def: 2000, step: 500 },
    diluciones: [
      { l: "2 g / 100 mL SF (20 mg/mL) — pasar en 15-20 min", cMgMl: 20, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true,
    info: { inicio: "30 min", vida: "2-4 h", notas: "Pasar lento (hipotensión si rápido). Agranulocitosis rara pero grave. Máx 8 g/día." }
  },
  pantoprazol: {
    n: "Pantoprazol (perfusión continua)",
    dosis: { unidad: "mg/h", min: 4, max: 8, def: 8, step: 1 },
    diluciones: [
      { l: "80 mg / 100 mL SF (0.8 mg/mL) — HDA", cMgMl: 0.8, volMl: 100 }
    ],
    ppw: false, tiempo: "h", mg: true,
    bolo: { desc: "80 mg IV en 15 min (HDA)", dosis: 80, unidad: "mg" },
    info: { inicio: "15-30 min", vida: "1-2 h", notas: "IBP IV. Pauta HDA: bolo 80 mg + perfusión 8 mg/h × 72h. Estable solo 12h una vez preparado." }
  },
  rocuronio: {
    n: "Rocuronio",
    dosis: { unidad: "mcg/kg/min", min: 5, max: 20, def: 10, step: 1 },
    diluciones: [
      { l: "200 mg / 100 mL SF (2000 mcg/mL)", cMcgMl: 2000, volMl: 100 },
      { l: "500 mg / 250 mL SF (2000 mcg/mL)", cMcgMl: 2000, volMl: 250 }
    ],
    ppw: true,
    bolo: { desc: "0.6-1.2 mg/kg IV (ISR)", dosisPorKg: 1.2, unidad: "mg" },
    info: { inicio: "60-90 seg", vida: "30-40 min", notas: "BNM no despolarizante. ISR: 1.2 mg/kg. Reversión: sugammadex 2-4-16 mg/kg. Monitorizar TOF. Conservar 2-8°C." }
  }
};
