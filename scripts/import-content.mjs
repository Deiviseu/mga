// Importa o conteúdo do site atual (www.mga.com.br) para revisão.
// NÃO sobrescreve o /content curado: grava o material bruto em content/_import/
// para ser conferido e copiado para content/products/*.json.
//
// Uso (precisa de acesso à internet):
//   npm run import:content                → páginas institucionais + 67 produtos
//   npm run import:content -- --sizes     → preenche "size" em content/downloads.json via HEAD
//
// Imagens e PDFs NÃO são baixados: apenas as URLs de mga.com.br/storage/... são registradas.
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';

const BASE = 'https://www.mga.com.br';
const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'content/_import');
mkdirSync(join(out, 'products'), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  const res = await fetch(new URL(path, BASE), { headers: { 'User-Agent': 'MGA-site-migration/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.text();
}
const abs = (u) => (u ? new URL(u, BASE).href.replace(/^http:/, 'https:') : u);
const text = (el) => el?.text.replace(/\s+/g, ' ').trim() ?? '';

function extract(html, path) {
  const doc = parse(html);
  const main = doc.querySelector('main') ?? doc.querySelector('body');
  return {
    path,
    title: text(doc.querySelector('title')),
    description: doc.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
    h1: text(main.querySelector('h1')),
    headings: main.querySelectorAll('h2, h3').map(text).filter(Boolean),
    paragraphs: main.querySelectorAll('p, li').map(text).filter((t) => t.length > 2),
    images: main.querySelectorAll('img').map((i) => ({ src: abs(i.getAttribute('src')), alt: i.getAttribute('alt') ?? '', width: i.getAttribute('width'), height: i.getAttribute('height') })),
    downloads: main.querySelectorAll('a[href*="arquivo-download"], a[href$=".pdf"], a[href*="/storage/"]').map((a) => ({ label: text(a), href: abs(a.getAttribute('href')) })),
    tables: main.querySelectorAll('table').map((t) => t.querySelectorAll('tr').map((tr) => tr.querySelectorAll('th, td').map(text))),
    options: main.querySelectorAll('select option').map(text).filter(Boolean),
    links: main.querySelectorAll('a[href]').map((a) => a.getAttribute('href')),
  };
}

async function pages() {
  const list = ['/', '/sobre', '/certificados', '/fundamentos', '/ambiente', '/responsabilidade-social', '/timeline', '/produtos', '/aplicacoes', '/downloads', '/blog', '/contato'];
  const result = {};
  for (const p of list) {
    try { result[p] = extract(await get(p), p); console.log('ok', p); } catch (e) { console.warn('falhou', p, e.message); }
    await sleep(400);
  }
  writeFileSync(join(out, 'pages.json'), JSON.stringify(result, null, 2));
  return result;
}

async function products(listing) {
  const slugs = [...new Set((listing?.links ?? []).map((h) => h?.match(/\/produtos\/([^/?#]+)$/)?.[1]).filter(Boolean))];
  console.log(`${slugs.length} produtos encontrados em /produtos`);
  const known = new Set(readdirSync(join(root, 'content/products')).map((f) => JSON.parse(readFileSync(join(root, 'content/products', f), 'utf8')).slug.pt));
  const unmapped = [];
  for (const s of slugs) {
    try {
      const data = extract(await get(`/produtos/${s}`), `/produtos/${s}`);
      writeFileSync(join(out, 'products', `${s}.json`), JSON.stringify(data, null, 2));
      if (!known.has(s)) unmapped.push(s);
      console.log('ok', s);
    } catch (e) { console.warn('falhou', s, e.message); }
    await sleep(400);
  }
  writeFileSync(join(out, 'unmapped-slugs.txt'),
    '# Slugs antigos sem produto correspondente em content/products. Para cada um, crie o produto\n# ou adicione o slug em "legacySlugs" do produto equivalente (gera redirect 301).\n' + unmapped.join('\n') + '\n');
}

async function sizes() {
  const file = join(root, 'content/downloads.json');
  const d = JSON.parse(readFileSync(file, 'utf8'));
  for (const item of d.items) {
    if (!item.url || !item.url.startsWith('http')) continue;
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      const len = Number(res.headers.get('content-length'));
      if (len) { item.size = len; console.log(item.id, len); }
    } catch (e) { console.warn('falhou', item.id, e.message); }
  }
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
}

if (process.argv.includes('--sizes')) await sizes();
else {
  const p = await pages();
  await products(p['/produtos']);
  console.log(`\nPronto. Revise content/_import/ e transfira os dados para content/products/*.json (remova "seed": true).`);
}
