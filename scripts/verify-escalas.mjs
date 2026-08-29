// Verifica el bundle compilado de escalas clínicas:
//   - se puede cargar en un window sintético,
//   - expone CATEGORIES, SPECIALTIES y CALCULATORS,
//   - no hay ids duplicados,
//   - compute() no lanza en las 320 calculadoras con inputs por defecto.
//
// Uso:
//   npm run verify:escalas                                           (bundle publicado)
//   node scripts/verify-escalas.mjs --file=<path>                    (bundle alternativo)
//   node scripts/verify-escalas.mjs --snapshot=<out.json>            (además vuelca snapshot canónico)
//   node scripts/verify-escalas.mjs --file=A --snapshot-baseline=B   (diff contra baseline)
//
// El snapshot es la firma que usamos para asegurar que la migración de las
// fuentes al patrón TypeScript modular no cambia la salida clínica de
// ninguna calculadora: cero diffs = migración segura.

import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function getArg(name, fallback) {
  const a = process.argv.find(x => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : fallback;
}

const bundlePath = getArg('file', path.join(ROOT, 'public', 'data', 'escalas-clinicas.js'));
const snapshotOut = getArg('snapshot', null);
const baselinePath = getArg('snapshot-baseline', null);

function loadBundle(p) {
  const src = readFileSync(p, 'utf8');
  const win = {};
  const ctx = { window: win, globalThis: win };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: p });
  return win.ENFERIX_ESCALAS_DATA;
}

function defaultsFor(calc) {
  const v = {};
  for (const inp of calc.inputs) {
    if (inp.type === 'number') v[inp.id] = inp.min != null ? inp.min : 0;
    else if (inp.type === 'boolean') v[inp.id] = 0;
    else if (inp.type === 'select') v[inp.id] = inp.default != null ? inp.default : inp.options[0].value;
  }
  return v;
}

function stable(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}

const data = loadBundle(bundlePath);
if (!data) {
  console.error(`FAIL: ${bundlePath} does not expose window.ENFERIX_ESCALAS_DATA`);
  process.exit(1);
}
const { CATEGORIES, SPECIALTIES, CALCULATORS } = data;

const problems = [];
const seen = new Set();
const dupes = [];
for (const c of CALCULATORS) {
  if (seen.has(c.id)) dupes.push(c.id);
  seen.add(c.id);
}
if (dupes.length) problems.push(`DUPLICATE ids: ${dupes.join(', ')}`);

const snapshot = {
  meta: {
    calculators: CALCULATORS.length,
    categories: CATEGORIES.length,
    specialties: SPECIALTIES.length,
  },
  CATEGORIES,
  SPECIALTIES,
  ids: CALCULATORS.map(c => c.id).sort(),
  compute: {},
};

let computeErrors = 0;
for (const c of CALCULATORS) {
  const v = defaultsFor(c);
  try {
    const r = c.compute(v);
    snapshot.compute[c.id] = r == null ? null : {
      main: r.main,
      mainUnit: r.mainUnit ?? null,
      secondary: r.secondary ?? null,
      secondaryLabel: r.secondaryLabel ?? null,
      interpretation: r.interpretation ?? null,
      level: r.level ?? null,
      details: r.details ?? null,
    };
  } catch (e) {
    computeErrors++;
    snapshot.compute[c.id] = { error: String((e && e.message) || e) };
    problems.push(`compute() threw on ${c.id}: ${e && e.message}`);
  }
}

console.log(`Bundle:       ${path.relative(ROOT, bundlePath) || bundlePath}`);
console.log(`Calculators:  ${CALCULATORS.length}`);
console.log(`Categories:   ${CATEGORIES.length}`);
console.log(`Specialties:  ${SPECIALTIES.length}`);
console.log(`Compute OK:   ${CALCULATORS.length - computeErrors}/${CALCULATORS.length}`);

if (snapshotOut) {
  writeFileSync(snapshotOut, stable(snapshot));
  console.log(`Snapshot:     ${path.relative(process.cwd(), snapshotOut)}`);
}

if (baselinePath) {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const ba = new Set(baseline.ids);
  const na = new Set(snapshot.ids);
  const missing = [...ba].filter(x => !na.has(x));
  const extra = [...na].filter(x => !ba.has(x));
  const common = [...ba].filter(x => na.has(x));
  const changed = common.filter(id =>
    stable(baseline.compute[id]) !== stable(snapshot.compute[id])
  );
  console.log('');
  console.log('--- diff vs baseline ---');
  console.log(`Missing in new:  ${missing.length}${missing.length ? '  ' + missing.slice(0, 10).join(', ') : ''}`);
  console.log(`Extra in new:    ${extra.length}${extra.length ? '  ' + extra.slice(0, 10).join(', ') : ''}`);
  console.log(`Compute changed: ${changed.length}${changed.length ? '  ' + changed.slice(0, 10).join(', ') : ''}`);
  if (missing.length || changed.length) problems.push(`diff against baseline: missing=${missing.length} changed=${changed.length}`);
}

if (problems.length) {
  console.error('');
  console.error('FAIL:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('');
console.log('OK');
