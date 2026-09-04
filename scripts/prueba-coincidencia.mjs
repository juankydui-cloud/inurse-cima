/* Prueba de P3.5 · coincidencia clínica (public/js/ui-shared/p35-coincidencia-clinica.js)
   ---------------------------------------------------------------------------
   Node puro, sin navegador: el módulo no toca el DOM. Comprueba las dos reglas
   que decidieron el arreglo y, sobre los TÍTULOS REALES del corpus, que el
   vocabulario engancha una ficha existente en vez de suponerlo.

     node scripts/prueba-coincidencia.mjs
*/
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

globalThis.window = globalThis.window || {};
new Function(readFileSync(join(raiz, 'public/js/ui-shared/p35-coincidencia-clinica.js'), 'utf8'))
  .call(globalThis);
const CO = globalThis.window.EnferixCoincidencia;

let fallos = 0;
function comprueba(descripcion, condicion) {
  if (!condicion) fallos++;
  console.log(`  ${condicion ? '✓' : '✗'} ${descripcion}`);
}

console.log('\nLa coincidencia empieza en principio de palabra');
comprueba('"presion" NO casa dentro de "Inmunosupresión en trasplante hepático"',
  !CO.casa(CO.indice('Inmunosupresión en trasplante hepático'), 'presion'));
comprueba('"st" NO casa dentro de "Algoritmo de emergencia de traqueostomía"',
  !CO.casa(CO.indice('Algoritmo de emergencia de traqueostomía'), 'st'));
/* La coincidencia es por PRINCIPIO de palabra, no por palabra entera: hace
   falta para la morfología ("cuidado" → "cuidados"). Por eso "con" sigue
   casando dentro de "consentimiento", y de ahí venía "Cinco elementos del
   consentimiento informado" en una pregunta sobre traqueostomía. Lo que impide
   ese resultado es que "con" y "del" nunca llegan a ser términos de búsqueda. */
comprueba('"con" y "del" no llegan a ser términos de búsqueda',
  (() => { const t = CO.terminos('cuidados del paciente con traqueostomía');
           return !t.todos.includes('con') && !t.todos.includes('del') && t.clinicos.includes('traqueostomia'); })());
comprueba('"quemadura" casa donde está, y "quema" también (morfología)',
  CO.casa(CO.indice('Clasificación de la profundidad de una quemadura'), 'quemadura') &&
  CO.casa(CO.indice('Clasificación de la profundidad de una quemadura'), 'quema'));
comprueba('"cuidado" casa "Cuidados de traqueostomía" (morfología)',
  CO.casa(CO.indice('Cuidados de traqueostomía'), 'cuidado'));
comprueba('"parada" casa "Cuidados post-parada cardíaca (RCE)" (el guion separa palabras)',
  CO.casa(CO.indice('Cuidados post-parada cardíaca (RCE)'), 'parada'));

console.log('\nEl término clínico se separa de la palabra de proceso');
const t1 = CO.terminos('qué cuidados lleva una sonda vesical permanente');
comprueba('"cuidados" es proceso y "sonda/vesical" son clínicos',
  t1.proceso.includes('cuidados') && t1.clinicos.includes('sonda') && t1.clinicos.includes('vesical'));
const t2 = CO.terminos('manejo de la hiperpotasemia');
comprueba('"manejo" es proceso, "hiperpotasemia" es clínico',
  t2.proceso.includes('manejo') && t2.clinicos.join(' ') === 'hiperpotasemia');
const t3 = CO.terminos('qué cuidados generales lleva');
comprueba('una pregunta SÓLO de proceso no se queda sin términos con los que buscar',
  t3.hayClinicos === false && t3.clinicos.length > 0);

console.log('\nEl vocabulario engancha una ficha real del corpus');
function titulos(archivo, expresion) {
  const texto = readFileSync(join(raiz, archivo), 'utf8');
  return [...texto.matchAll(expresion)].map(m => m[1]);
}
const deGuias = titulos('public/data/guias.js', /"title": "([^"]+)"/g);
const deBiblioteca = titulos('public/data/biblioteca.js', /titulo\\":\\"([^\\]{3,120})/g);
console.log(`  (${deGuias.length} títulos de guías · ${deBiblioteca.length} de la Biblioteca)`);

const upp = CO.terminos('protocolo de úlceras por presión');
comprueba('"úlceras por presión" añade el término del corpus ("lesiones")',
  upp.clinicos.includes('lesiones'));
const enganchadas = deGuias.concat(deBiblioteca).filter(t => {
  const i = CO.indice(t);
  return CO.casa(i, 'lesiones') && CO.casa(i, 'presion');
});
comprueba(`el término añadido engancha ${enganchadas.length} ficha(s) real(es): ${enganchadas.slice(0, 2).join(' | ') || '(ninguna)'}`,
  enganchadas.length > 0);

console.log(fallos ? `\n${fallos} comprobación(es) fallida(s)\n` : '\nTodo correcto\n');
process.exit(fallos ? 1 : 0);
