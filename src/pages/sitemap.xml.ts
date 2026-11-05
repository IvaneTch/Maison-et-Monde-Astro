import type { APIRoute } from 'astro';
import { pagesPubliques } from '../data/pages';
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pagesPubliques.map(([url]) => `<url><loc>${new URL(url, import.meta.env.PUBLIC_SITE_URL || 'https://maisonetmonde.fr').href.replaceAll('&', '&amp;')}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
