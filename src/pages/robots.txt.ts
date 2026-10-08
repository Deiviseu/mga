import type { APIRoute } from 'astro';
import { SITE } from '../lib/content';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /orcamento
Disallow: /en/quote
Disallow: /es/cotizacion

Sitemap: ${SITE.url}/sitemap.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
