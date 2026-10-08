// sitemap.xml com alternates hreflang PT/EN/ES (xhtml:link) para cada URL.
import type { APIRoute } from 'astro';
import { allPages } from '../lib/pages';
import { LOCALE, LANGS, DEFAULT_LANG } from '../i18n/routes';
import { SITE } from '../lib/content';

export const GET: APIRoute = async () => {
  const abs = (p: string) => new URL(p, SITE.url).href;
  const pages = (await allPages()).filter((p) => !p.noindex);
  const urls = pages.map((p) => {
    const alts = LANGS.filter((l) => p.alternates[l])
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${LOCALE[l]}" href="${abs(p.alternates[l]!)}"/>`);
    if (p.alternates[DEFAULT_LANG]) alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(p.alternates[DEFAULT_LANG]!)}"/>`);
    return `  <url>\n    <loc>${abs(p.path)}</loc>\n${alts.join('\n')}\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
