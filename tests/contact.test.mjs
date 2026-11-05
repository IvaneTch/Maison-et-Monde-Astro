import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { randomUUID } from 'node:crypto';
import { validerContact } from '../src/lib/contact.ts';
import { autoriserRequete } from '../src/lib/limites.ts';
function payload(type = 'contact') {
  const d = new FormData();
  Object.entries({
    type_demande: type,
    prenom: 'Test',
    nom: 'Contact',
    telephone: '0600000000',
    email: 'test@example.invalid',
    objet: 'Ménage',
    message: 'Une demande de test.',
    disponibilite: 'Le matin',
    confidentialite: 'on',
  }).forEach(([k, v]) => d.set(k, v));
  return d;
}
test('Contact : message et rappel ont leurs champs adaptés', () => {
  assert.equal(validerContact(payload()), null);
  const rappel = payload('rappel');
  rappel.delete('nom');
  rappel.delete('email');
  rappel.delete('message');
  assert.equal(validerContact(rappel), null);
});
test('Contact : consentement, coordonnées, taille et piège antispam sont vérifiés', () => {
  for (const [k, v] of [
    ['prenom', ''],
    ['telephone', '----------'],
    ['email', 'invalide'],
    ['message', 'x'.repeat(3001)],
    ['objet', 'Inconnu'],
    ['website', 'https://robot.invalid'],
    ['confidentialite', 'false'],
  ]) {
    const d = payload();
    d.set(k, v);
    assert.ok(validerContact(d), k);
  }
});
const source = stripTypeScriptTypes(
  readFileSync(new URL('../src/pages/api/contact.ts', import.meta.url), 'utf8'),
)
  .replace(/^import[\s\S]*?;\s*/gm, '')
  .replaceAll('export const ', 'const ')
  .replaceAll('import.meta.env', 'env');
function api(connection) {
  return new Function('mysql', 'randomUUID', 'validerContact', 'env', source + '\nreturn POST;')(
    { createConnection: async () => connection },
    randomUUID,
    validerContact,
    {},
  );
}
test('Contact API : message, notification et confirmation dans une seule transaction', async () => {
  const calls = [];
  const c = {
    beginTransaction: async () => calls.push('begin'),
    execute: async (sql, v) => calls.push({ sql, v }),
    commit: async () => calls.push('commit'),
    end: async () => calls.push('end'),
  };
  const r = await api(c)({
    request: new Request('http://localhost/api/contact', { method: 'POST', body: payload() }),
  });
  assert.equal(r.status, 201);
  assert.match((await r.json()).reference, /^CT-/);
  assert.equal(calls[1].v[3], 'Contact');
  assert.ok(calls[2].sql.includes('notifications'));
  assert.deepEqual(
    calls.filter((x) => typeof x === 'string'),
    ['begin', 'commit', 'end'],
  );
});
test('Contact API : panne MySQL annule la demande et permet de réessayer', async () => {
  const calls = [];
  const c = {
    beginTransaction: async () => {},
    execute: async () => {
      throw new Error('panne');
    },
    rollback: async () => calls.push('rollback'),
    end: async () => calls.push('end'),
  };
  const r = await api(c)({
    request: new Request('http://localhost/api/contact', { method: 'POST', body: payload() }),
  });
  assert.equal(r.status, 500);
  assert.equal((await r.json()).ok, false);
  assert.deepEqual(calls, ['rollback', 'end']);
});
test('Contact API : demande invalide refusée avant connexion', async () => {
  const d = payload();
  d.delete('confidentialite');
  const r = await api(null)({
    request: new Request('http://localhost/api/contact', { method: 'POST', body: d }),
  });
  assert.equal(r.status, 400);
});
test('Protection : limite des tentatives et nouvelle fenêtre après expiration', () => {
  for (let i = 0; i < 5; i++) assert.ok(autoriserRequete('test-connexion', 'connexion', 100));
  assert.equal(autoriserRequete('test-connexion', 'connexion', 101), false);
  assert.ok(autoriserRequete('test-connexion', 'connexion', 100 + 15 * 60 * 1000));
  assert.ok(autoriserRequete('autre-adresse', 'connexion', 101));
});
