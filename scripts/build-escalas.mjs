// Compila las fuentes TS de las calculadoras clínicas (src/engine + src/calculators)
// a un único bundle IIFE plano que expone
//   window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS }
// mismo contrato de runtime que consume public/js/calculadoras/inurse-escalas-clinicas-js.js.
//
// Uso:
//   npm run build:escalas               → escribe public/data/escalas-clinicas.js
//   node scripts/build-escalas.mjs --out=/tmp/x.js
//
// El fichero de salida se commitea al repo tal y como está hoy: Render no
// ejecuta esta compilación en cada deploy (ver docs/README).

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const outArg = process.argv.find(a => a.startsWith('--out='));
const outfile = outArg
  ? path.resolve(process.cwd(), outArg.slice('--out='.length))
  : path.join(ROOT, 'public', 'data', 'escalas-clinicas.js');

const banner = `/* =========================================================================
   Enferix · Índices y escalas clínicas
   Bundle generado automáticamente por scripts/build-escalas.mjs desde las
   fuentes TypeScript modulares en src/calculators/. NO EDITAR A MANO:
   los cambios se pierden en la próxima compilación. Para modificar una
   calculadora, edita su fichero .ts y ejecuta \`npm run build:escalas\`.
   Contrato de runtime: define
     window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS }
   consumido por /public/js/calculadoras/inurse-escalas-clinicas-js.js.
   ========================================================================= */`;

const footer =
  'window.ENFERIX_ESCALAS_DATA = { CATEGORIES: __enferix_escalas.CATEGORIES, SPECIALTIES: __enferix_escalas.SPECIALTIES, CALCULATORS: __enferix_escalas.CALCULATORS };';

await build({
  entryPoints: [path.join(ROOT, 'src', 'calculators', 'index.ts')],
  bundle: true,
  format: 'iife',
  globalName: '__enferix_escalas',
  target: ['es2020'],
  outfile,
  legalComments: 'none',
  banner: { js: banner },
  footer: { js: footer },
  logLevel: 'info',
});

console.log(`escalas bundle → ${path.relative(process.cwd(), outfile)}`);
