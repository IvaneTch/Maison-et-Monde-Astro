import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { randomUUID } from 'node:crypto';
import { enregistrerDevisAvecClient } from '../src/lib/clients-devis.ts';
import { validerConciergerie } from '../src/lib/conciergerie.ts';
const fields = {
  type_devis: 'conciergerie',
  logement: 'Studio',
  adresse: 'Adresse de test',
  code_postal: '75001',
  ville: 'Paris',
  surface: '35',
  chambres: '0',
  bains: '1',
  capacite: '2',
  formule: 'Services à la carte',
  activite: 'Nouveau projet',
  frequence: 'À définir',
  periode: 'Saisonnière',
  cles: 'À définir',
  date_debut: '2027-01-01',
  prenom: 'Test',
  nom: 'Conciergerie',
  telephone: '0600000000',
  email: 'test@example.com',
  contact: 'E-mail',
  confidentialite: 'on',
  message: 'Message\nsur deux lignes',
};
function payload() {
  const d = new FormData();
  Object.entries(fields).forEach(([k, v]) => d.set(k, v));
  d.append('services', 'Ménage et préparation');
  return d;
}
test('ménage seul : plateformes facultatives, studio sans chambre accepté', () =>
  assert.equal(validerConciergerie(payload()), null));
test('services complémentaires : texte obligatoire, multiligne et limite', () => {
  const d = payload();
  d.append('services', 'Services complémentaires');
  d.append('plateformes', 'Airbnb');
  assert.match(validerConciergerie(d), /complémentaires/);
  d.set('details_services', 'Courses\nCafé et thé');
  assert.equal(validerConciergerie(d), null);
  d.set('details_services', 'x'.repeat(2001));
  assert.match(validerConciergerie(d), /complémentaires/);
});
test('rejeter coordonnées, dates, nombres, services et consentement invalides', () => {
  for (const [k, v] of [
    ['email', 'faux'],
    ['telephone', '----------'],
    ['capacite', '0'],
    ['chambres', '-1'],
    ['surface', '1.5'],
    ['nom', '   '],
    ['date_debut', '2027-02-31'],
    ['confidentialite', 'false'],
    ['services', 'Inconnu'],
    ['formule', 'Inconnue'],
  ]) {
    const d = payload();
    d.set(k, v);
    assert.ok(validerConciergerie(d), k);
  }
});
const source = stripTypeScriptTypes(
  readFileSync(new URL('../src/pages/api/devis.ts', import.meta.url), 'utf8'),
)
  .replace(/^import[\s\S]*?;\s*/gm, '')
  .replaceAll('export const ', 'const ')
  .replaceAll('import.meta.env', 'env');
function api(mysql, enregistrer = enregistrerDevisAvecClient) {
  const adapter = {
    createConnection: async (...args) => {
      const connection = await mysql.createConnection(...args);
      const execute = connection.execute.bind(connection);
      connection.beginTransaction = async () => {};
      connection.commit = async () => {};
      connection.rollback = async () => {};
      connection.execute = async (sql, values) => {
        if (sql.includes('GET_LOCK')) return [[{ acquis: 1 }]];
        if (sql.includes('RELEASE_LOCK')) return [[{ released: 1 }]];
        if (sql.startsWith('SELECT id, prenom')) return [[]];
        if (sql.startsWith('INSERT INTO notifications')) return [{ insertId: 100 }];
        if (sql.startsWith('INSERT INTO clients')) return [{ insertId: 99 }];
        if (sql.startsWith('UPDATE demandes_devis')) return [{ affectedRows: 1 }];
        return (await execute(sql, values)) ?? [{ insertId: 1 }];
      };
      return connection;
    },
  };
  return new Function(
    'mysql',
    'randomUUID',
    'validerConciergerie',
    'enregistrerDevisAvecClient',
    'env',
    source + '\nreturn POST;',
  )(adapter, randomUUID, validerConciergerie, enregistrer, {});
}
test('API : enregistrement complet, catégorie et fermeture de connexion', async () => {
  let row,
    closed = false;
  const post = api({
    createConnection: async () => ({
      execute: async (sql, values) => {
        row = { sql, values };
      },
      end: async () => {
        closed = true;
      },
    }),
  });
  const d = payload();
  d.append('services', 'Services complémentaires');
  d.append('plateformes', 'Airbnb');
  d.set('details_services', 'Courses\nCafé et thé');
  const r = await post({ request: new Request('http://localhost/api/devis', { method: 'POST', body: d }) });
  assert.equal(r.status, 201);
  assert.match((await r.json()).reference, /^CC-/);
  assert.equal(row.values.at(-1), 'Conciergerie');
  const notes = JSON.parse(row.values.at(-2)).conciergerie;
  assert.equal(notes['Services complémentaires'].replaceAll('\r\n', '\n'), 'Courses\nCafé et thé');
  assert.equal(notes.Message.replaceAll('\r\n', '\n'), fields.message);
  assert.equal(notes.Chambres, '0');
  assert.equal(closed, true);
});
test('API : un devis professionnel a sa référence, son client pro et sa catégorie de notification', async () => {
  const writes = [];
  let closed = false;
  const post = api(
    {
      createConnection: async () => ({
        execute: async (sql, values) => {
          writes.push({ sql, values });
          if (sql.startsWith('INSERT INTO clients')) return [{ insertId: 78 }];
          if (sql.startsWith('INSERT INTO demandes_devis')) return [{ insertId: 52 }];
          return [{ affectedRows: 1 }];
        },
        end: async () => {
          closed = true;
        },
      }),
    },
    async (connection, ...args) => {
      const execute = connection.execute.bind(connection);
      connection.execute = async (sql, values) => {
        writes.push({ sql, values });
        return execute(sql, values);
      };
      return enregistrerDevisAvecClient(connection, ...args);
    },
  );
  const d = new FormData();
  Object.entries({
    type_devis: 'professionnel',
    entreprise: 'Atelier Paris',
    prenom: 'Alice',
    nom: 'Durand',
    email: 'alice@atelier.example',
    telephone: '0612345678',
    type_site: 'Cabinet',
    service: 'Nettoyage de cabinet',
    code_postal: '75014',
    ville: 'Paris',
    surface: '120',
    frequence: 'Régulière',
    confidentialite: 'on',
    message: 'Intervention en soirée',
  }).forEach(([key, value]) => d.set(key, value));
  const response = await post({
    request: new Request('http://localhost/api/devis', { method: 'POST', body: d }),
  });
  assert.equal(response.status, 201);
  assert.match((await response.json()).reference, /^PR-/);
  const quote = writes.find(({ sql }) => sql.startsWith('INSERT INTO demandes_devis'));
  assert.equal(quote.values.at(-1), 'Professionnel');
  assert.equal(JSON.parse(quote.values.at(-2)).professionnel.message, 'Intervention en soirée');
  assert.equal(
    writes.find(({ sql }) => sql.includes('INSERT INTO notifications')).values[1],
    'professionnel',
  );
  assert.equal(closed, true);
});
test('API : données invalides rejetées avant connexion', async () => {
  const post = api({ createConnection: () => assert.fail('Ne doit pas se connecter') });
  const d = payload();
  d.delete('confidentialite');
  assert.equal(
    (await post({ request: new Request('http://localhost/api/devis', { method: 'POST', body: d }) })).status,
    400,
  );
});
test('API : panne MySQL signalée sans confirmation trompeuse', async () => {
  const post = api({
    createConnection: async () => {
      throw new Error('MySQL simulé indisponible');
    },
  });
  const old = console.error;
  console.error = () => {};
  try {
    const r = await post({
      request: new Request('http://localhost/api/devis', { method: 'POST', body: payload() }),
    });
    assert.equal(r.status, 500);
    assert.equal((await r.json()).ok, false);
  } finally {
    console.error = old;
  }
});
test('régression : les devis ménage simple et détaillé conservent leur enregistrement', async () => {
  for (const type of ['simple', 'detaille']) {
    let storedType;
    const post = api({
      createConnection: async () => ({
        execute: async (sql, values) => {
          storedType = values[1];
        },
        end: async () => {},
      }),
    });
    const d = payload();
    d.set('type_devis', type);
    if (type === 'simple') {
      d.set('prestation', 'Menage a domicile');
      d.set('frequence', 'Occasionnelle');
    } else {
      d.set('logement', 'Appartement');
      d.set('animaux', 'Non');
      d.set('pieces', '2');
      d.set('type_prestation', 'Ponctuelle');
      d.set('duree', '3 h');
      d.append('disponibilites', 'Lundi matin');
    }
    const response = await post({
      request: new Request('http://localhost/api/devis', { method: 'POST', body: d }),
    });
    assert.equal(response.status, 201, type);
    assert.equal(storedType, type);
  }
});

test('références ménage : préfixe MM conservé', async () => {
  const post = api({ createConnection: async () => ({ execute: async () => {}, end: async () => {} }) });
  const d = payload();
  d.set('type_devis', 'simple');
  d.set('prestation', 'Menage a domicile');
  d.set('frequence', 'Occasionnelle');
  const r = await post({ request: new Request('http://localhost/api/devis', { method: 'POST', body: d }) });
  assert.match((await r.json()).reference, /^MM-/);
});
