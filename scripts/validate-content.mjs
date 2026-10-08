// Valida o /content antes do build. Erros param o build; avisos só informam.
// Uso: npm run validate   (roda também no prebuild)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const errors = [];
const warnings = [];
const LANGS = ['pt', 'en', 'es'];

const vocab = read('content/vocab.json');
const categories = read('content/categories.json');
const catIds = new Set(categories.map((c) => c.id));
const products = readdirSync(join(root, 'content/products')).filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, ...read(`content/products/${f}`) }));
const ids = new Set(products.map((p) => p.id));

// i18n completo em todos os objetos {pt,...}
const walk = (obj, where) => {
  if (Array.isArray(obj)) return obj.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.includes('pt') && keys.every((k) => LANGS.includes(k))) {
      for (const l of LANGS) if (!obj[l]) errors.push(`${where}: falta tradução "${l}"`);
      return;
    }
    for (const [k, v] of Object.entries(obj)) if (!k.startsWith('_')) walk(v, `${where}.${k}`);
  }
};

for (const p of products) {
  const w = `products/${p.file}`;
  if (`${p.id}.json` !== p.file) errors.push(`${w}: id "${p.id}" diferente do nome do arquivo`);
  if (!catIds.has(p.category)) errors.push(`${w}: categoria inexistente "${p.category}"`);
  for (const k of ['pressureClass', 'material', 'connection'])
    for (const v of p.attributes?.[k] ?? []) if (!vocab[k][v]) errors.push(`${w}: ${k} "${v}" não existe em vocab.json`);
  for (const r of p.related ?? []) if (!ids.has(r)) errors.push(`${w}: related "${r}" não existe`);
  for (const img of p.images ?? []) {
    if (!img.width || !img.height) errors.push(`${w}: imagem sem width/height (${img.src})`);
    if (!img.alt?.pt) errors.push(`${w}: imagem sem alt (${img.src})`);
    if (img.src?.startsWith('http://')) errors.push(`${w}: imagem sem https (${img.src})`);
  }
  walk(p, w);
}
for (const l of LANGS) {
  const seen = new Map();
  for (const p of products) {
    const s = p.slug?.[l];
    if (!s) errors.push(`products/${p.file}: sem slug ${l}`);
    else if (seen.has(s)) errors.push(`slug ${l} duplicado: "${s}" (${seen.get(s)} e ${p.file})`);
    else seen.set(s, p.file);
  }
}
for (const f of ['site.json', 'units.json', 'categories.json', 'timeline.json', 'certificates.json', 'downloads.json', 'applications.json', 'home.json', 'vocab.json'])
  walk(read(`content/${f}`), f);
for (const f of readdirSync(join(root, 'content/pages'))) walk(read(`content/pages/${f}`), `pages/${f}`);

const seeds = products.filter((p) => p.seed).length;
if (seeds) warnings.push(`${seeds} produto(s) com dados de exemplo (seed: true) — rodar npm run import:content`);

// Aplicações: fluidos duplicados e nomes cortados
const apps = read('content/applications.json');
const names = new Map();
for (const fl of apps.fluids) {
  const n = fl.name.pt.toLowerCase().trim();
  if (names.has(n)) errors.push(`applications.json: fluido duplicado "${fl.name.pt}"`);
  names.set(n, true);
  if (/[(…]$|\.\.\.$|\($/.test(fl.name.pt) || (fl.name.pt.match(/\(/g)?.length ?? 0) !== (fl.name.pt.match(/\)/g)?.length ?? 0))
    errors.push(`applications.json: nome possivelmente cortado "${fl.name.pt}"`);
  if (fl.ratings.length !== apps.materials.length) errors.push(`applications.json: "${fl.name.pt}" com ${fl.ratings.length} notas para ${apps.materials.length} materiais`);
}

// Unidades: UF válida, telefones tel: válidos
const UF = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));
for (const u of read('content/units.json')) {
  if (!UF.has(u.state)) errors.push(`units.json: ${u.id} com UF inválida "${u.state}"`);
  if (u.phone === 'TODO') warnings.push(`units.json: ${u.id} sem telefone (TODO)`);
  else if (!/^\+\d{10,15}$/.test(u.phone)) errors.push(`units.json: ${u.id} telefone fora do formato +55...: "${u.phone}"`);
}

// Links locais precisam existir em public/
const scanUrls = (obj) => JSON.stringify(obj).match(/"url":\s*"(\/[^"]+)"/g) ?? [];
for (const m of scanUrls(read('content/downloads.json'))) {
  const p = m.match(/"(\/[^"]+)"$/)[1].split('?')[0];
  if (/\.[a-z0-9]{2,4}$/i.test(p) && !existsSync(join(root, 'public', p))) warnings.push(`downloads.json: arquivo local ausente em public${p}`);
}
// Nada servido de host de desenvolvimento / http
const all = readdirSync(join(root, 'content'), { recursive: true }).filter((f) => /\.(json|md)$/.test(f));
for (const f of all) {
  const txt = readFileSync(join(root, 'content', f), 'utf8');
  if (/cloudezapp\.io|ip-\d+-\d+-\d+-\d+/.test(txt)) errors.push(`${f}: referência a host de desenvolvimento`);
  if (/"(src|url|image|pdf|logo)":\s*"http:\/\//.test(txt)) errors.push(`${f}: URL sem https`);
}

const todos = all.reduce((n, f) => n + (readFileSync(join(root, 'content', f), 'utf8').match(/TODO/g)?.length ?? 0), 0);
warnings.forEach((w) => console.warn(`  aviso: ${w}`));
console.log(`content: ${products.length} produtos, ${categories.length} categorias, ${todos} marcações TODO, ${warnings.length} avisos`);
if (errors.length) {
  errors.forEach((e) => console.error(`  ERRO: ${e}`));
  console.error(`\n${errors.length} erro(s) no conteúdo.`);
  process.exit(1);
}
