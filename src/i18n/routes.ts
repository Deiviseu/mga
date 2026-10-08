// Tabela de rotas com slug por idioma. PT é o idioma padrão (sem prefixo);
// EN e ES ficam em /en e /es. Toda URL do site deve ser montada por path().
export const LANGS = ['pt', 'en', 'es'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'pt';
export const LOCALE: Record<Lang, string> = { pt: 'pt-BR', en: 'en', es: 'es' };
export const OG_LOCALE: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' };

export const SEGMENTS = {
  home: { pt: '', en: '', es: '' },
  about: { pt: 'sobre', en: 'about', es: 'sobre-nosotros' },
  certificates: { pt: 'certificados', en: 'certifications', es: 'certificaciones' },
  principles: { pt: 'fundamentos', en: 'principles', es: 'fundamentos' },
  environment: { pt: 'ambiente', en: 'environment', es: 'medio-ambiente' },
  social: { pt: 'responsabilidade-social', en: 'social-responsibility', es: 'responsabilidad-social' },
  timeline: { pt: 'linha-do-tempo', en: 'timeline', es: 'linea-de-tiempo' },
  units: { pt: 'unidades', en: 'locations', es: 'unidades' },
  products: { pt: 'produtos', en: 'products', es: 'productos' },
  category: { pt: 'produtos/categoria', en: 'products/category', es: 'productos/categoria' },
  product: { pt: 'produtos', en: 'products', es: 'productos' },
  applications: { pt: 'aplicacoes', en: 'applications', es: 'aplicaciones' },
  downloads: { pt: 'downloads', en: 'downloads', es: 'descargas' },
  blog: { pt: 'blog', en: 'blog', es: 'blog' },
  post: { pt: 'blog', en: 'blog', es: 'blog' },
  contact: { pt: 'contato', en: 'contact', es: 'contacto' },
  quote: { pt: 'orcamento', en: 'quote', es: 'cotizacion' },
  whistleblower: { pt: 'canal-de-denuncia', en: 'whistleblower-channel', es: 'canal-de-denuncias' },
  privacy: { pt: 'politica-de-privacidade', en: 'privacy-policy', es: 'politica-de-privacidad' },
  terms: { pt: 'termos-de-uso', en: 'terms-of-use', es: 'terminos-de-uso' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof SEGMENTS;

/** Monta o caminho absoluto (sem domínio) de uma rota. */
export function path(key: RouteKey, lang: Lang, param?: string): string {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  const seg = SEGMENTS[key][lang];
  const parts = [prefix, seg, param].filter(Boolean).join('/').replace(/\/+/g, '/');
  const out = parts.startsWith('/') ? parts : `/${parts}`;
  return out === '' ? '/' : out;
}

export function isLang(x: unknown): x is Lang {
  return typeof x === 'string' && (LANGS as readonly string[]).includes(x);
}
