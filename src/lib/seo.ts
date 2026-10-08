// Dados estruturados schema.org (JSON-LD).
import { SITE, units, categoryById, hasPhone, isTodo, productDescription, vocabLabel, type Product, type Unit } from './content';
import { tr } from '../i18n/ui';
import type { Lang } from '../i18n/routes';

const ORG_ID = `${SITE.url}/#organization`;

export function organizationLd(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: SITE.logo,
    foundingDate: String(SITE.foundingYear),
    description: tr(SITE.summary, lang),
    telephone: SITE.phone,
    parentOrganization: { '@type': 'Organization', name: 'KITZ Corporation', url: 'https://www.kitz.com' },
    sameAs: Object.values(SITE.social).filter((u) => typeof u === 'string' && u.startsWith('https://')),
    address: postalAddress(units[0]),
  };
}

function postalAddress(u: Unit) {
  return {
    '@type': 'PostalAddress',
    ...(isTodo(u.street) ? {} : { streetAddress: u.street }),
    addressLocality: isTodo(u.city) ? undefined : u.city,
    addressRegion: u.state,
    postalCode: u.postalCode || undefined,
    addressCountry: u.country,
  };
}

export function localBusinessLd(lang: Lang) {
  return units.map((u) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#unit-${u.id}`,
    name: `${SITE.name} – ${tr(u.name, lang)}`,
    description: tr(u.role, lang),
    parentOrganization: { '@id': ORG_ID },
    url: SITE.url,
    image: SITE.defaultOgImage,
    ...(hasPhone(u.phone) ? { telephone: u.phone } : {}),
    address: postalAddress(u),
    ...(u.geo.approx ? {} : { geo: { '@type': 'GeoCoordinates', latitude: u.geo.lat, longitude: u.geo.lng } }),
  }));
}

export function productLd(p: Product, lang: Lang, url: string) {
  const cat = categoryById(p.category);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tr(p.name, lang),
    sku: p.code,
    mpn: p.code,
    description: productDescription(p, lang),
    url,
    category: cat ? tr(cat.name, lang) : undefined,
    brand: { '@type': 'Brand', name: 'MGA' },
    manufacturer: { '@id': ORG_ID },
    image: p.images.length ? p.images.map((i) => i.src) : [SITE.defaultOgImage],
    material: p.attributes.material.map((m) => vocabLabel('material', m, lang)).join(', ') || undefined,
    additionalProperty: [
      ...p.attributes.pressureClass.map((c) => ({ '@type': 'PropertyValue', name: 'Pressure class', value: vocabLabel('pressureClass', c, 'en') })),
      ...p.norms.map((n) => ({ '@type': 'PropertyValue', name: 'Standard', value: n })),
    ],
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** "Título da página | MGA Válvulas" (padrão de <title> do site). */
export function fullTitle(title: string, lang: Lang) {
  return `${title} | ${lang === 'en' ? 'MGA Valves' : 'MGA Válvulas'}`;
}
