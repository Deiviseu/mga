// Gera a lista de todas as páginas do site (com alternates hreflang).
// Usada pela rota catch-all, pelo sitemap e pelo validador de conteúdo.
import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGS, path, type Lang, type RouteKey } from '../i18n/routes';
import { categories, products, type Category, type Product } from './content';

export interface PageEntry {
  key: RouteKey;
  lang: Lang;
  path: string;
  alternates: Partial<Record<Lang, string>>;
  noindex?: boolean;
  category?: Category;
  product?: Product;
  post?: CollectionEntry<'blog'>;
}

const STATIC: RouteKey[] = [
  'home', 'about', 'certificates', 'principles', 'environment', 'social', 'timeline', 'units',
  'products', 'applications', 'downloads', 'blog', 'contact', 'quote', 'whistleblower', 'privacy', 'terms',
];

const NOINDEX: RouteKey[] = ['quote'];

export async function publishedPosts() {
  return (await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export async function allPages(): Promise<PageEntry[]> {
  const out: PageEntry[] = [];
  for (const key of STATIC) {
    const alternates = Object.fromEntries(LANGS.map((l) => [l, path(key, l)])) as Record<Lang, string>;
    for (const lang of LANGS) out.push({ key, lang, path: alternates[lang], alternates, noindex: NOINDEX.includes(key) });
  }
  for (const category of categories) {
    const alternates = Object.fromEntries(LANGS.map((l) => [l, path('category', l, category.slug[l])])) as Record<Lang, string>;
    for (const lang of LANGS) out.push({ key: 'category', lang, path: alternates[lang], alternates, category });
  }
  for (const product of products) {
    const alternates = Object.fromEntries(LANGS.map((l) => [l, path('product', l, product.slug[l])])) as Record<Lang, string>;
    for (const lang of LANGS) out.push({ key: 'product', lang, path: alternates[lang], alternates, product });
  }
  for (const post of await publishedPosts()) {
    const lang = post.data.lang;
    const p = path('post', lang, post.id);
    out.push({ key: 'post', lang, path: p, alternates: { [lang]: p }, post, noindex: post.data.draft });
  }
  return out;
}
