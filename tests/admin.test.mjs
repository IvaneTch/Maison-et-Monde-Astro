import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
const source = stripTypeScriptTypes(
  readFileSync(new URL('../src/pages/api/admin/gerer-demande.ts', import.meta.url), 'utf8'),
)
  .replace(/^import[\s\S]*?;\s*/gm, '')
  .replaceAll('export const ', 'const ')
  .replaceAll('import.meta.env', 'env');
function api(execute) {
  return new Function('mysql', 'createHash', 'env', source + '\nreturn POST;')(
    { createConnection: async () => ({ execute, end: async () => {} }) },
    createHash,
    {},
  );
}
const redirect = (location, status) => new Response(null, { status, headers: { Location: location } });
const cookies = { get: () => ({ value: 'jeton-fictif' }), delete: () => {} };
function request(origin = 'http://localhost', statut = 'refusee') {
  const d = new FormData();
  d.set('id', '1');
  d.set('action', 'statut');
  d.set('statut', statut);
  return new Request('http://localhost/api/admin/gerer-demande', {
    method: 'POST',
    headers: { origin },
    body: d,
  });
}
test('Administration : statut Refusée accepté pour une session valide', async () => {
  let update;
  const post = api(async (sql, values) => {
    if (sql.startsWith('SELECT')) return [[{ id: 1 }]];
    update = { sql, values };
    return [{}];
  });
  const r = await post({ request: request(), cookies, redirect });
  assert.equal(r.status, 303);
  assert.equal(update.values[0], 'refusee');
});
test('Administration : origine extérieure refusée avant accès MySQL', async () => {
  const post = api(() => assert.fail('Aucun accès MySQL autorisé'));
  const r = await post({ request: request('https://autre.invalid'), cookies, redirect });
  assert.equal(r.status, 403);
});
test('Administration : session invalide ne permet aucune modification', async () => {
  const post = api(async (sql) => {
    assert.ok(sql.startsWith('SELECT'));
    return [[]];
  });
  const r = await post({ request: request(), cookies, redirect });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('Location'), '/admin/connexion/');
});
