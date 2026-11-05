import type { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type ContactDevis = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  type_client?: 'particulier' | 'professionnel';
  entreprise?: string;
};
export const normaliserIdentite = (valeur: unknown) =>
  String(valeur ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('fr');
export const normaliserTelephone = (valeur: unknown) => {
  let numero = String(valeur ?? '').replace(/\D/g, '');
  if (numero.startsWith('0033')) numero = '0' + numero.slice(4);
  else if (numero.startsWith('33') && numero.length === 11) numero = '0' + numero.slice(2);
  return numero;
};
export function memeContact(a: ContactDevis, b: ContactDevis): boolean {
  const email = normaliserIdentite(a.email);
  const coordonnees = email
    ? email === normaliserIdentite(b.email)
    : !normaliserIdentite(b.email) &&
      normaliserTelephone(a.telephone).length >= 10 &&
      normaliserTelephone(a.telephone) === normaliserTelephone(b.telephone);
  return Boolean(
    coordonnees &&
    normaliserIdentite(a.nom) &&
    normaliserIdentite(a.prenom) &&
    normaliserIdentite(a.nom) === normaliserIdentite(b.nom) &&
    normaliserIdentite(a.prenom) === normaliserIdentite(b.prenom),
  );
}
export function contactDepuisFormulaire(data: FormData): ContactDevis {
  const lire = (key: string, max: number) =>
    String(data.get(key) ?? '')
      .trim()
      .slice(0, max);
  return {
    prenom: lire('prenom', 100),
    nom: lire('nom', 100),
    email: lire('email', 255),
    telephone: lire('telephone', 30),
    adresse: lire('adresse', 255),
    code_postal: lire('code_postal', 10),
    ville: lire('ville', 100),
    type_client: lire('type_devis', 20) === 'professionnel' ? 'professionnel' : 'particulier',
    entreprise: lire('entreprise', 200),
  };
}
/** Verrou commun : empêche deux envois simultanés de créer deux fois la même fiche. */
export async function transactionClients<T>(connection: Connection, action: () => Promise<T>): Promise<T> {
  const [locks] = await connection.execute<RowDataPacket[]>(
    "SELECT GET_LOCK('mm-clients-devis-v1', 5) AS acquis",
  );
  if (Number(locks[0]?.acquis) !== 1) throw new Error('Rattachement client occupé. Réessayez.');
  try {
    await connection.beginTransaction();
    try {
      const result = await action();
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    await connection.execute("SELECT RELEASE_LOCK('mm-clients-devis-v1')");
  }
}
/** Ne modifie jamais une fiche existante avec les données non vérifiées d’un formulaire public. */
export async function trouverOuCreerClient(
  connection: Connection,
  contact: ContactDevis,
): Promise<{ id: number; cree: boolean }> {
  const email = normaliserIdentite(contact.email);
  if (
    !normaliserIdentite(contact.nom) ||
    !normaliserIdentite(contact.prenom) ||
    (!email && normaliserTelephone(contact.telephone).length < 10)
  ) {
    throw new Error('Contact incomplet : rattachement manuel nécessaire.');
  }
  const [candidats] = await connection.execute<(RowDataPacket & ContactDevis & { id: number })[]>(
    email
      ? 'SELECT id, prenom, nom, email, telephone FROM clients WHERE LOWER(TRIM(email)) = ? AND date_suppression IS NULL FOR UPDATE'
      : "SELECT id, prenom, nom, email, telephone FROM clients WHERE NULLIF(TRIM(email), '') IS NULL AND date_suppression IS NULL FOR UPDATE",
    email ? [email] : [],
  );
  const correspondants = candidats.filter((c) => memeContact(contact, c));
  if (correspondants.length > 1)
    throw new Error('Plusieurs fiches correspondent au contact : vérification nécessaire.');
  if (correspondants.length === 1) {
    if (contact.type_client === 'professionnel') {
      await connection.execute(
        "UPDATE clients SET type_client='professionnel', entreprise=COALESCE(NULLIF(?, ''), entreprise) WHERE id=?",
        [contact.entreprise || '', correspondants[0].id],
      );
    }
    return { id: Number(correspondants[0].id), cree: false };
  }
  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO clients (type_client, entreprise, prenom, nom, email, telephone, adresse, code_postal, ville)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      contact.type_client || 'particulier',
      contact.entreprise || null,
      contact.prenom,
      contact.nom,
      contact.email || null,
      contact.telephone || null,
      contact.adresse || null,
      contact.code_postal || null,
      contact.ville || null,
    ],
  );
  return { id: result.insertId, cree: true };
}
/** Le devis et son client sont validés ensemble : aucun devis orphelin en cas d’échec. */
export async function enregistrerDevisAvecClient(
  connection: Connection,
  data: FormData,
  sql: string,
  valeurs: unknown[],
): Promise<void> {
  await transactionClients(connection, async () => {
    const client = await trouverOuCreerClient(connection, contactDepuisFormulaire(data));
    const [result] = await connection.execute<ResultSetHeader>(sql, valeurs);
    await connection.execute('UPDATE demandes_devis SET client_id = ? WHERE id = ?', [
      client.id,
      result.insertId,
    ]);
    await connection.execute('INSERT INTO notifications (reference,categorie) VALUES (?,?)', [
      String(valeurs[0]),
      data.get('type_devis') === 'conciergerie'
        ? 'conciergerie'
        : data.get('type_devis') === 'professionnel'
          ? 'professionnel'
          : 'menage',
    ]);
  });
}
