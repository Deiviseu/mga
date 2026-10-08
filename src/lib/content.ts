// Camada única de acesso ao conteúdo em /content. As views nunca importam
// JSON diretamente: assim a troca por um CMS no futuro fica localizada aqui.
import site from '../../content/site.json';
import unitsRaw from '../../content/units.json';
import categoriesRaw from '../../content/categories.json';
import vocab from '../../content/vocab.json';
import timeline from '../../content/timeline.json';
import certificates from '../../content/certificates.json';
import downloads from '../../content/downloads.json';
import applications from '../../content/applications.json';
import home from '../../content/home.json';
import { path, type Lang, LANGS } from '../i18n/routes';
import { tr } from '../i18n/ui';

export type I18n = { pt: string; en?: string; es?: string };

export interface Category {
  id: string;
  code: string;
  group: 'esfera' | 'outras' | 'complementos' | 'servicos';
  slug: Record<Lang, string>;
  name: I18n;
  description: I18n;
  image: string | null;
  todo?: string;
}

export interface ImageRef {
  src: string;
  width: number;
  height: number;
  alt: I18n;
}

export interface Product {
  id: string;
  code: string;
  category: string;
  seed?: boolean;
  legacySlugs?: string[];
  slug: Record<Lang, string>;
  name: I18n;
  summary: I18n;
  description: I18n;
  attributes: { pressureClass: string[]; material: string[]; connection: string[]; sizes: string[] };
  specs: { label: I18n; value: I18n | string }[];
  norms: string[];
  dimensions: null | { illustrative?: boolean; unit: string; columns: string[]; rows: string[][] };
  images: ImageRef[];
  datasheet: string | null;
  manual: string | null;
  models3d: { size: string; files: { format: string; url: string | null }[] }[];
  related: string[];
}

export interface Unit {
  id: string;
  name: I18n;
  role: I18n;
  street: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  phoneDisplay: string;
  geo: { lat: number; lng: number; approx?: boolean };
}

const productModules = import.meta.glob<Product>('../../content/products/*.json', { eager: true, import: 'default' });
const pageModules = import.meta.glob<any>('../../content/pages/*.json', { eager: true, import: 'default' });

export const SITE = site;
export const VOCAB = vocab as Record<'pressureClass' | 'material' | 'connection', Record<string, I18n>>;
export const TIMELINE = timeline;
export const CERTIFICATES = certificates;
export const DOWNLOADS = downloads;
export const APPLICATIONS = applications;
export const HOME = home;

export const categories = categoriesRaw as Category[];
export const units = unitsRaw as Unit[];
export const products: Product[] = Object.values(productModules).sort((a, b) =>
  categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category) ||
  a.name.pt.localeCompare(b.name.pt, 'pt'),
);

export const GROUPS = ['esfera', 'outras', 'complementos', 'servicos'] as const;

export function getPage(id: string) {
  const p = pageModules[`../../content/pages/${id}.json`];
  if (!p) throw new Error(`Página de conteúdo não encontrada: ${id}`);
  return p;
}

export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const productById = (id: string) => products.find((p) => p.id === id);
export const productsIn = (catId: string) => products.filter((p) => p.category === catId);

export const productUrl = (p: Product, lang: Lang) => path('product', lang, p.slug[lang]);
export const categoryUrl = (c: Category, lang: Lang) => path('category', lang, c.slug[lang]);

export const isTodo = (v: unknown) => typeof v === 'string' && v.trim().toUpperCase().startsWith('TODO');
export const hasPhone = (phone: string) => /^\+\d{10,15}$/.test(phone);

/** Texto do produto: descrição oficial se já importada, senão o resumo. */
export function productDescription(p: Product, lang: Lang) {
  const d = tr(p.description, lang);
  return isTodo(d) ? tr(p.summary, lang) : d;
}

export function vocabLabel(kind: keyof typeof VOCAB, id: string, lang: Lang) {
  return tr(VOCAB[kind][id], lang) || id;
}

/** Rótulo técnico curto, ex.: "VET 300 · CLASSE 300 · ASME B16.34". */
export function productTag(p: Product, lang: Lang) {
  const parts = [p.code];
  if (p.attributes.pressureClass[0]) parts.push(vocabLabel('pressureClass', p.attributes.pressureClass[0], lang));
  if (p.norms[0]) parts.push(p.norms[0]);
  return parts.join(' · ');
}

export function unitAddress(u: Unit) {
  const street = isTodo(u.street) ? '' : u.street;
  return [street, u.district, `${isTodo(u.city) ? '' : u.city}${u.city && !isTodo(u.city) ? ' – ' : ''}${u.state}`, u.postalCode]
    .filter(Boolean)
    .join(' · ');
}

export function directionsUrl(u: Unit) {
  const q = isTodo(u.street) ? `${u.geo.lat},${u.geo.lng}` : `${u.street}, ${u.city} - ${u.state}, Brasil`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

export function whatsappUrl(lang: Lang) {
  const n = String(SITE.whatsapp.number);
  if (!/^\d{10,15}$/.test(n)) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(tr(SITE.whatsapp.message, lang))}`;
}

/** Mini renderizador de Markdown para os campos de texto do /content (parágrafos, listas, negrito, links). */
export function md(src: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((\/[^)\s]*|https:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  return src
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*-\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*-\s+/, ''))}</li>`).join('')}</ul>`;
      }
      return `<p>${inline(lines.join(' '))}</p>`;
    })
    .join('');
}

export { LANGS };

/** Mensagens de formulário como data-* (consumidas por src/scripts/forms.ts). */
export function formData(t: (k: any) => string) {
  return {
    'data-err-required': t('form.err.required'),
    'data-err-email': t('form.err.email'),
    'data-err-phone': t('form.err.phone'),
    'data-err-consent': t('form.err.consent'),
    'data-err-summary': t('form.err.summary'),
    'data-sending': t('form.sending'),
    'data-success': t('form.success'),
    'data-error': t('form.error'),
    'data-not-configured': t('form.notConfigured'),
  };
}
