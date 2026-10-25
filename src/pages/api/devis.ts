import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';

export const prerender = false;

const str = (data: FormData, key: string, max = 255) => String(data.get(key) ?? '').trim().slice(0, max);
const all = (data: FormData, key: string, max = 30) => data.getAll(key).map(v => String(v).slice(0, 120)).slice(0, max);
const fail = (error: string, status = 400) => new Response(JSON.stringify({ ok: false, error }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) return fail('Format invalide.');
  if (Number(request.headers.get('content-length') ?? 0) > 30000) return fail('Demande trop volumineuse.', 413);
  let data: FormData;
  try { data = await request.formData(); } catch { return fail('Formulaire invalide.'); }
  const nom = str(data, 'nom', 100), prenom = str(data, 'prenom', 100);
  const email = str(data, 'email', 255), telephone = str(data, 'telephone', 30);
  const adresse = str(data, 'adresse', 255), codePostal = str(data, 'code_postal', 10), ville = str(data, 'ville', 100);
  const logement = str(data, 'logement', 50), animaux = str(data, 'animaux', 10);
  const surface = Number(str(data, 'surface', 15)), pieces = Number(str(data, 'pieces', 5)), bains = Number(str(data, 'bains', 5));
  const typePrestation = str(data, 'type_prestation', 30), frequence = str(data, 'frequence', 100), duree = str(data, 'duree', 100);
  const services = all(data, 'services'), disponibilites = all(data, 'disponibilites');
  if (!nom || !prenom || !adresse || !ville || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[0-9]{5}$/.test(codePostal) || telephone.replace(/\D/g,'').length < 10) return fail('Vérifiez vos coordonnées.');
  if (!['Appartement','Maison','Bureau / local pro','Autre'].includes(logement) || !['Oui','Non'].includes(animaux) || !Number.isInteger(surface) || surface < 1 || surface > 10000 || !Number.isInteger(pieces) || pieces < 1 || pieces > 100 || !Number.isInteger(bains) || bains < 0 || bains > 30) return fail('Vérifiez les informations du logement.');
  if (!services.length || !disponibilites.length || !['Régulière','Ponctuelle'].includes(typePrestation) || (typePrestation === 'Régulière' && !frequence) || !duree || data.get('confidentialite') === null) return fail('Complétez les champs obligatoires et le consentement.');
  const notes = [
    ['Type de prestation', typePrestation], ['Animaux', all(data, 'type_animaux').join(', ')],
    ['Précisions services', str(data, 'details_services', 2000)], ['Date de début', str(data, 'date_debut', 30)],
    ['Adresse de prestation', adresse], ['Complément adresse', str(data, 'complement', 255)], ['Message', str(data, 'message', 3000)],
    ['Avance immédiate', data.get('avance_immediate') !== null ? 'Oui' : 'Non'],
    ['Flexibilité', str(data, 'flexible', 100)], ['Horaires', str(data, 'horaires', 100)]
  ].filter(([,value]) => value).map(([key,value]) => `${key} : ${value}`).join('\n').slice(0, 12000);
  const reference = `MM-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`;
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection({ host: import.meta.env.DB_HOST || '127.0.0.1', port: Number(import.meta.env.DB_PORT || 8889), user: import.meta.env.DB_USER, password: import.meta.env.DB_PASSWORD, database: import.meta.env.DB_NAME || 'maison_monde', connectTimeout: 5000 });
    await connection.execute(`INSERT INTO demandes_devis
      (reference_devis,type_devis,nom,prenom,email,telephone,code_postal,ville,type_logement,surface_m2,nombre_pieces,nombre_salles_bain,animaux_presents,prestations,frequence,duree_souhaitee,disponibilites,commentaires)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [reference,'detaille',nom,prenom,email,telephone,codePostal,ville,logement,surface,pieces,bains,animaux === 'Oui' ? 1 : 0,JSON.stringify(services),typePrestation === 'Régulière' ? frequence : 'Ponctuelle',duree,JSON.stringify(disponibilites),notes]);
    return new Response(JSON.stringify({ ok: true, reference }), { status: 201, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Échec enregistrement devis:', error);
    return fail('Le serveur ne peut pas enregistrer la demande pour le moment.', 500);
  } finally { await connection?.end().catch(() => {}); }
};
