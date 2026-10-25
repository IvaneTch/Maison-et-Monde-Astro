import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';
import { createHash } from 'node:crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const retour = (url: string) => redirect(url, 303);
  // Les formulaires de l'espace privé ne doivent pas accepter de requêtes cross-origin.
  const origine = request.headers.get('origin');
  const destination = new URL(request.url);
  if (!origine || origine !== destination.origin) return new Response('Origine non autorisée', { status: 403 });
  const token = cookies.get('mm_admin_session')?.value;
  if (!token) return retour('/admin/connexion/');
  const form = await request.formData();
  const id = Number(form.get('id'));
  const action = String(form.get('action') ?? '');
  const statut = String(form.get('statut') ?? '');
  if (!['statut','supprimer','restaurer','vider_corbeille'].includes(action) || (action !== 'vider_corbeille' && (!Number.isSafeInteger(id) || id <= 0))) {
    return new Response('Requête invalide', { status: 400 });
  }
  const statuts = ['nouvelle','en_cours','devis_envoye','acceptee'];
  if (action === 'statut' && !statuts.includes(statut)) return new Response('Statut invalide', { status: 400 });
  let connexion: mysql.Connection | undefined;
  try {
    connexion = await mysql.createConnection({
      host: import.meta.env.DB_HOST || '127.0.0.1',
      port: Number(import.meta.env.DB_PORT || 8889),
      user: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASSWORD,
      database: import.meta.env.DB_NAME,
    });
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const [sessions] = await connexion.execute<mysql.RowDataPacket[]>(
      `SELECT s.id FROM sessions_admin s INNER JOIN administrateurs a
       ON a.id=s.administrateur_id
       WHERE s.token_hash=? AND s.date_expiration>NOW() AND a.actif=1 LIMIT 1`, [tokenHash]
    );
    if (!sessions.length) {
      cookies.delete('mm_admin_session', { path: '/' });
      return retour('/admin/connexion/');
    }
    if (action === 'vider_corbeille') {
      // Ne supprimer que les demandes déjà placées dans la corbeille.
      await connexion.execute('DELETE FROM demandes_devis WHERE date_suppression IS NOT NULL');
      return retour('/admin/#corbeille');
    }
    if (action === 'statut') {
      await connexion.execute('UPDATE demandes_devis SET statut=? WHERE id=? AND date_suppression IS NULL', [statut,id]);
      return retour(`/admin/demandes/${id}/`);
    }
    if (action === 'supprimer') {
      await connexion.execute('UPDATE demandes_devis SET date_suppression=NOW() WHERE id=? AND date_suppression IS NULL', [id]);
      return retour('/admin/#demandes');
    }
    await connexion.execute('UPDATE demandes_devis SET date_suppression=NULL WHERE id=? AND date_suppression IS NOT NULL', [id]);
    return retour('/admin/#corbeille');
  } catch (e) {
    console.error('Erreur de gestion de demande', e);
    return new Response('Erreur serveur', { status: 500 });
  } finally {
    await connexion?.end();
  }
};
