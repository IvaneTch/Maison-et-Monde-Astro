import type { Connection, RowDataPacket } from 'mysql2/promise';
import { memeContact, trouverOuCreerClient, type ContactDevis } from './clients-devis.ts';
export type Fiche = ContactDevis & { id: number };
export type AncienDevis = ContactDevis & { id: number; client_id: number | null };
/** Prépare une réparation sans écriture et refuse les doublons ambigus. */
export function planifierRattachements(demandes: AncienDevis[], fiches: Fiche[]) {
  const candidats = [...fiches];
  const nouveaux: Fiche[] = [];
  const liens: { devisId: number; ancienClientId: number | null; clientId: number }[] = [];
  for (const d of demandes) {
    const actuel = candidats.find((c) => c.id === d.client_id);
    if (actuel && memeContact(d, actuel)) continue;
    const correspondants = candidats.filter((c) => memeContact(d, c));
    if (correspondants.length > 1)
      throw new Error(`Demande ${d.id} : plusieurs fiches identiques, vérification nécessaire.`);
    let cible = correspondants[0];
    if (!cible) {
      // Les identifiants négatifs représentent uniquement les fiches à créer dans le plan.
      cible = { ...d, id: -(nouveaux.length + 1) };
      if (!memeContact(cible, cible)) throw new Error(`Demande ${d.id} : coordonnées insuffisantes.`);
      nouveaux.push(cible);
      candidats.push(cible);
    }
    liens.push({ devisId: d.id, ancienClientId: d.client_id, clientId: cible.id });
  }
  return { nouveaux, liens };
}
export async function lirePlanClients(connection: Connection) {
  const [devis] = await connection.execute<(RowDataPacket & AncienDevis)[]>(
    'SELECT id, client_id, prenom, nom, email, telephone, adresse, code_postal, ville FROM demandes_devis WHERE date_suppression IS NULL ORDER BY date_creation, id',
  );
  const [clients] = await connection.execute<(RowDataPacket & Fiche)[]>(
    'SELECT id, prenom, nom, email, telephone, adresse, code_postal, ville FROM clients WHERE date_suppression IS NULL ORDER BY id',
  );
  return { plan: planifierRattachements(devis, clients), devis };
}
/** À appeler dans transactionClients, après validation du plan. */
export async function appliquerPlanClients(connection: Connection) {
  const { plan, devis } = await lirePlanClients(connection);
  const liens = [];
  const clientsCrees: number[] = [];
  for (const lien of plan.liens) {
    const d = devis.find((d) => d.id === lien.devisId)!;
    const client = await trouverOuCreerClient(connection, d);
    if (client.cree) clientsCrees.push(client.id);
    await connection.execute(
      'UPDATE demandes_devis SET client_id = ?, date_modification = date_modification WHERE id = ? AND client_id <=> ?',
      [client.id, d.id, lien.ancienClientId],
    );
    liens.push({ ...lien, clientId: client.id });
  }
  return { liens, clientsCrees };
}
