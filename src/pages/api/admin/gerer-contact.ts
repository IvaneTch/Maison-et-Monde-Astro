import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';
import { sessionAdminValide } from '../../../lib/admin-session';
export const prerender = false;
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return new Response('Origine non autorisée', { status: 403 });
  const token = cookies.get('mm_admin_session')?.value;
  if (!token) return redirect('/admin/connexion/', 303);
  const data = await request.formData();
  const id = Number(data.get('id'));
  const statut = String(data.get('statut'));
  if (!Number.isSafeInteger(id) || id < 1 || !['nouvelle', 'traitee', 'archivee'].includes(statut))
    return new Response('Demande invalide', { status: 400 });
  let c: mysql.Connection | undefined;
  try {
    c = await mysql.createConnection({
      host: process.env.DB_HOST || import.meta.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || import.meta.env.DB_PORT || 8889),
      user: process.env.DB_USER || import.meta.env.DB_USER,
      password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD,
      database: process.env.DB_NAME || import.meta.env.DB_NAME,
    });
    if (!(await sessionAdminValide(c, token))) return redirect('/admin/connexion/', 303);
    await c.execute('UPDATE demandes_contact SET statut=? WHERE id=?', [statut, id]);
    return redirect('/admin/messages/', 303);
  } catch {
    return new Response('Enregistrement impossible', { status: 500 });
  } finally {
    await c?.end();
  }
};
