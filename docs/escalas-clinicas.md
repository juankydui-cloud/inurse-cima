# Índices y escalas clínicas — motor modular TypeScript

Las 320 calculadoras que sirve la sección «Escalas» de Enferix viven en
`src/calculators/*.ts`, agrupadas por temática (una calculadora es un objeto
`Calculator` que declara sus entradas y una `compute()`). El motor de tipos y los
helpers están en `src/engine/types.ts`.

## Estructura

```
src/
  engine/
    types.ts               ← Calculator, CalcInput, CalcResult, Values, sum(), fmt()
  calculators/
    index.ts               ← CATEGORIES, SPECIALTIES, EXTRA_SPECIALTIES, CALCULATORS
    riesgo.ts              ← una calculadora por objeto en un array por fichero
    cardio-fa.ts
    cardio-sca.ts
    pediatria.ts
    …
```

Cada `.ts` exporta `export const <nombre>: Calculator[] = [ … ]` y se importa
en `src/calculators/index.ts`. Añadir una calculadora nueva son dos ediciones:
1. añadir el objeto al fichero de su temática (o crear uno nuevo si no encaja),
2. importarlo en `index.ts` y, si toca a más de una especialidad, añadirlo a
   `EXTRA_SPECIALTIES`.

## Bundle publicado

El bundle público `public/data/escalas-clinicas.js` es el **artefacto de build**
generado por `scripts/build-escalas.mjs` (esbuild, `--format=iife`,
`--target=es2020`). Expone en runtime:

```js
window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS }
```

que es lo que consume el overlay `public/js/calculadoras/inurse-escalas-clinicas-js.js`.
El bundle está **commiteado** al repo: Render no lo regenera en cada deploy, así
que los cambios en `src/calculators/*.ts` se acompañan siempre de un
`npm run build:escalas` que actualice el fichero publicado.

## Flujo de trabajo

```bash
# Editar una calculadora
$EDITOR src/calculators/cardio-fa.ts

# Chequeo de tipos
npm run typecheck

# Regenerar el bundle publicado
npm run build:escalas

# Verificar que ninguna otra calculadora cambia (320/320, sin duplicados)
npm run verify:escalas

# Commit del cambio + del bundle regenerado
git add src/calculators/cardio-fa.ts public/data/escalas-clinicas.js
git commit
```

## Renombres locales

Dos calculadoras del catálogo se renombran para evitar colisiones de id con
escalas ya presentes:

- `pediatria-2.ts` → `kawasaki-ped` (la de `cardio-varios.ts` mantiene `kawasaki`).
- `family-practice.ts` → `duke-treadmill-mf` (la de `cardio-sca.ts` mantiene `duke-treadmill`).

## Escalas de enfermería (Norton, Barthel, RASS, Morse, dolor)

Viven aparte en `public/data/escalas.js` como objeto `CALCS` global. El overlay
de escalas las adapta al motor genérico con `adaptarLegado()` en
`public/js/calculadoras/inurse-escalas-clinicas-js.js`. **No se han migrado**
al motor TS a propósito, para no cambiar el comportamiento de la pestaña
«Cálculo» que también las usa.
