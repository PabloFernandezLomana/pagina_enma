// Copia site.config.js y tokens.css (raíz) a la tienda y al panel.
// Uso (desde la raíz):  node scripts/sync-shared.mjs
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  ['site.config.js', 'moda-enma-tienda/src/site.config.js'],
  ['site.config.js', 'pagina_inma/src/site.config.js'],
  ['tokens.css', 'moda-enma-tienda/src/app/tokens.css'],
  ['tokens.css', 'pagina_inma/src/tokens.css'],
];
for (const [from, to] of targets) {
  const dest = join(root, to);
  if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(root, from), dest);
  console.log(`✔ ${from} → ${to}`);
}
