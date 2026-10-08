// Extrai a paleta real do site atual: cores mais frequentes no CSS e
// cores dominantes da logo (/assets/site/logo_mga.png).
// Uso: npm run palette   → copie as cores da marca para --brand-* em src/styles/global.css
import { PNG } from 'pngjs';
import { parse } from 'node-html-parser';

const BASE = 'https://www.mga.com.br';
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const norm = (c) => {
  c = c.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(c)) return '#' + [...c.slice(1)].map((x) => x + x).join('');
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? hex(+m[1], +m[2], +m[3]) : c.slice(0, 7);
};
const isNeutral = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return Math.max(r, g, b) - Math.min(r, g, b) < 18;
};

const html = await (await fetch(BASE)).text();
const css = parse(html).querySelectorAll('link[rel=stylesheet]').map((l) => new URL(l.getAttribute('href'), BASE).href);
const counts = new Map();
for (const url of [...css, null]) {
  const src = url ? await (await fetch(url)).text() : html;
  for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]+\)/g)) {
    const c = norm(m[0]);
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
}
const sorted = [...counts].sort((a, b) => b[1] - a[1]);
console.log('\nCores cromáticas mais usadas no CSS:');
sorted.filter(([c]) => !isNeutral(c)).slice(0, 12).forEach(([c, n]) => console.log(`  ${c}  ×${n}`));
console.log('\nNeutros mais usados:');
sorted.filter(([c]) => isNeutral(c)).slice(0, 6).forEach(([c, n]) => console.log(`  ${c}  ×${n}`));

const buf = Buffer.from(await (await fetch(`${BASE}/assets/site/logo_mga.png`)).arrayBuffer());
const png = PNG.sync.read(buf);
const bins = new Map();
for (let i = 0; i < png.data.length; i += 4) {
  if (png.data[i + 3] < 200) continue;
  const q = (v) => Math.round(v / 8) * 8;
  const h = hex(Math.min(255, q(png.data[i])), Math.min(255, q(png.data[i + 1])), Math.min(255, q(png.data[i + 2])));
  bins.set(h, (bins.get(h) ?? 0) + 1);
}
console.log('\nCores dominantes da logo:');
[...bins].sort((a, b) => b[1] - a[1]).filter(([c]) => !isNeutral(c)).slice(0, 6).forEach(([c, n]) => console.log(`  ${c}  ${n}px`));
