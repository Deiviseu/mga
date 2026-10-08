// Gera os redirects 301 a partir de content/redirects.json (+ legacySlugs dos produtos)
// em dois formatos: public/_redirects (Netlify) e vercel.json (Vercel).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const { rules } = JSON.parse(readFileSync(join(root, 'content/redirects.json'), 'utf8'));

// Produtos podem declarar "legacySlugs": ["slug-antigo"] → /produtos/slug-antigo
const prodDir = join(root, 'content/products');
for (const f of readdirSync(prodDir).filter((f) => f.endsWith('.json'))) {
  const p = JSON.parse(readFileSync(join(prodDir, f), 'utf8'));
  for (const old of p.legacySlugs ?? []) rules.push({ from: `/produtos/${old}`, to: `/produtos/${p.slug.pt}` });
}

const seen = new Set();
const list = rules.filter((r) => {
  if (!r.from || !r.to || r.from === r.to || seen.has(r.from)) return false;
  seen.add(r.from);
  return true;
});

writeFileSync(
  join(root, 'public/_redirects'),
  '# GERADO por scripts/build-redirects.mjs a partir de content/redirects.json. Não editar à mão.\n' +
    list.map((r) => `${r.from}  ${r.to}  301`).join('\n') + '\n',
);

const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  _comment: 'GERADO por scripts/build-redirects.mjs. Edite content/redirects.json e rode npm run build.',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  cleanUrls: true,
  trailingSlash: false,
  build: { env: { OPTIMIZE_REMOTE_IMAGES: '1' } },
  redirects: list.map((r) => ({ source: r.from, destination: r.to, permanent: true })),
  headers: [
    { source: '/_astro/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] },
  ],
};
writeFileSync(join(root, 'vercel.json'), JSON.stringify(vercel, null, 2) + '\n');
console.log(`redirects: ${list.length} regras → public/_redirects, vercel.json`);
