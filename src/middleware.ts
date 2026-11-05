import { anciennesPages } from './data/redirections';
import imagesAnciennes from './data/images-anciennes.json';
import { defineMiddleware } from 'astro:middleware';
import { autoriserRequete } from './lib/limites';
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const anciennePage = anciennesPages[path.replace(/\/+$/, '')];
  if (anciennePage) return context.redirect(anciennePage + context.url.search, 301);
  const image = imagesAnciennes[path as keyof typeof imagesAnciennes];
  if (image) return context.redirect(image, 301);
  if (
    context.request.method === 'POST' &&
    ['/api/devis', '/api/contact', '/api/admin/connexion'].includes(path.replace(/\/$/, ''))
  ) {
    let adresse = 'local';
    try {
      adresse = context.clientAddress || 'local';
    } catch {}
    const origine = context.request.headers.get('origin');
    if (origine && origine !== context.url.origin)
      return new Response(JSON.stringify({ ok: false, error: 'Origine non autorisée.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    if (!autoriserRequete(adresse, path.includes('connexion') ? 'connexion' : 'formulaires'))
      return new Response(
        JSON.stringify({ ok: false, error: 'Trop de tentatives. Veuillez patienter avant de réessayer.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } },
      );
  }
  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (path.startsWith('/admin') || path.startsWith('/api/'))
    response.headers.set('Cache-Control', 'private, no-store');
  if (path.startsWith('/admin') || import.meta.env.PUBLIC_INDEXABLE !== 'true')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
});
