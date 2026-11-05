import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { validerContact } from '../../lib/contact';
export const prerender = false;
const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
export const POST: APIRoute = async ({ request }) => {
  if (
    !request.headers.get('content-type')?.includes('multipart/form-data') ||
    Number(request.headers.get('content-length') || 0) > 20000
  )
    return json({ ok: false, error: 'Formulaire invalide ou trop volumineux.' }, 400);
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ ok: false, error: 'Formulaire invalide.' }, 400);
  }
  if ([...data.values()].reduce((n, v) => n + String(v).length, 0) > 10000)
    return json({ ok: false, error: 'Demande trop volumineuse.' }, 413);
  const erreur = validerContact(data);
  if (erreur) return json({ ok: false, error: erreur }, 400);
  const lire = (k: string, max = 255) =>
    String(data.get(k) ?? '')
      .trim()
      .slice(0, max);
  const type = lire('type_demande');
  const reference = `${type === 'rappel' ? 'RP' : 'CT'}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
  let c: mysql.Connection | undefined;
  try {
    c = await mysql.createConnection({
      host: process.env.DB_HOST || import.meta.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || import.meta.env.DB_PORT || 8889),
      user: process.env.DB_USER || import.meta.env.DB_USER,
      password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD,
      database: process.env.DB_NAME || import.meta.env.DB_NAME,
      connectTimeout: 5000,
    });
    await c.beginTransaction();
    await c.execute(
      `INSERT INTO demandes_contact (reference,type_demande,prenom,nom,email,telephone,objet,message,disponibilite) VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        reference,
        type,
        lire('prenom', 100),
        type === 'contact' ? lire('nom', 100) : null,
        type === 'contact' ? lire('email') : null,
        lire('telephone', 30),
        type === 'contact' ? lire('objet', 100) : 'Demande de rappel',
        type === 'contact' ? lire('message', 3000) : null,
        type === 'rappel' ? lire('disponibilite', 100) : null,
      ],
    );
    await c.execute('INSERT INTO notifications (reference,categorie) VALUES (?,?)', [reference, type]);
    await c.commit();
    return json({ ok: true, reference }, 201);
  } catch {
    await c?.rollback().catch(() => {});
    return json(
      { ok: false, error: 'Votre demande n’a pas pu être enregistrée. Veuillez réessayer ou nous appeler.' },
      500,
    );
  } finally {
    await c?.end().catch(() => {});
  }
};
