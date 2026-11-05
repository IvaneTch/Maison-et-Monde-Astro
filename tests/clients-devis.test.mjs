import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  memeContact,
  trouverOuCreerClient,
  enregistrerDevisAvecClient,
  contactDepuisFormulaire,
} from '../src/lib/clients-devis.ts';
import { planifierRattachements } from '../src/lib/reparer-clients.ts';
const contact = { prenom: 'Alice', nom: 'Durand', email: 'alice@example.com', telephone: '0612345678' };
test('identité : e-mail et nom/prénom, sans fusion sur le seul téléphone', () => {
  assert.ok(memeContact(contact, { ...contact, prenom: ' ALICE ', email: ' ALICE@EXAMPLE.COM ' }));
  assert.equal(memeContact(contact, { ...contact, email: 'autre@example.com' }), false);
  assert.equal(memeContact(contact, { ...contact, prenom: 'Bob' }), false);
  assert.equal(
    memeContact({ ...contact, email: '' }, { ...contact, email: '', telephone: '+33 6 12 34 56 78' }),
    true,
  );
  assert.equal(memeContact({ ...contact, email: '' }, { ...contact, email: '', prenom: 'Bob' }), false);
});
test('une fiche existante est réutilisée sans écraser ses coordonnées', async () => {
  const c = {
    execute: async (sql) => {
      assert.ok(sql.startsWith('SELECT'));
      return [[{ ...contact, id: 12 }]];
    },
  };
  assert.deepEqual(await trouverOuCreerClient(c, contact), { id: 12, cree: false });
});
test('une nouvelle demande professionnelle crée un client professionnel avec son entreprise', async () => {
  const data = new FormData();
  Object.entries({ ...contact, type_devis: 'professionnel', entreprise: 'Atelier Paris' }).forEach(([k, v]) =>
    data.set(k, v),
  );
  let inserted;
  const c = {
    execute: async (sql, values) => {
      if (sql.startsWith('SELECT')) return [[]];
      if (sql.startsWith('INSERT INTO clients')) {
        inserted = values;
        return [{ insertId: 24 }];
      }
      return [[]];
    },
  };
  assert.deepEqual(await trouverOuCreerClient(c, contactDepuisFormulaire(data)), { id: 24, cree: true });
  assert.equal(inserted[0], 'professionnel');
  assert.equal(inserted[1], 'Atelier Paris');
});
test('les fiches ambiguës sont signalées avant toute écriture', async () => {
  const c = {
    execute: async () => [
      [
        { ...contact, id: 1 },
        { ...contact, id: 2 },
      ],
    ],
  };
  await assert.rejects(() => trouverOuCreerClient(c, contact), /Plusieurs fiches/);
});
test('plan de réparation : devis orphelins, mauvais lien, regroupement et relance idempotente', () => {
  const bob = { ...contact, prenom: 'Bob' };
  const devis = [
    { ...contact, id: 1, client_id: 7 },
    { ...bob, id: 2, client_id: 7 },
    { ...bob, id: 3, client_id: null },
    { ...contact, email: 'autre@example.com', id: 4, client_id: null },
  ];
  const fiches = [{ ...contact, id: 7 }];
  const plan = planifierRattachements(devis, fiches);
  assert.equal(plan.nouveaux.length, 2);
  assert.equal(plan.liens.length, 3);
  assert.equal(plan.liens[0].clientId, plan.liens[1].clientId);
  const apres = devis.map((d) => ({
    ...d,
    client_id: plan.liens.find((l) => l.devisId === d.id)?.clientId ?? d.client_id,
  }));
  assert.equal(planifierRattachements(apres, [...fiches, ...plan.nouveaux]).liens.length, 0);
});
test('échec de rattachement : annulation de la transaction et libération du verrou', async () => {
  const calls = [];
  const c = {
    beginTransaction: async () => calls.push('begin'),
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    execute: async (sql) => {
      if (sql.includes('GET_LOCK')) return [[{ acquis: 1 }]];
      if (sql.includes('RELEASE_LOCK')) {
        calls.push('release');
        return [[]];
      }
      if (sql.startsWith('SELECT')) return [[{ ...contact, id: 12 }]];
      if (sql.startsWith('INSERT')) return [{ insertId: 42 }];
      if (sql.startsWith('UPDATE')) throw new Error('Erreur de rattachement');
    },
  };
  const data = new FormData();
  Object.entries(contact).forEach(([k, v]) => data.set(k, v));
  await assert.rejects(
    () => enregistrerDevisAvecClient(c, data, 'INSERT INTO demandes_devis ...', []),
    /rattachement/,
  );
  assert.deepEqual(calls, ['begin', 'rollback', 'release']);
});
