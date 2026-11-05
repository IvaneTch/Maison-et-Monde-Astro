import type { APIRoute } from 'astro';
export const GET: APIRoute = () =>
  new Response(
    import.meta.env.PUBLIC_INDEXABLE === 'true'
      ? `User-agent: *\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${new URL('/sitemap.xml', import.meta.env.PUBLIC_SITE_URL || 'https://maisonetmonde.fr').href}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
