// Node 24 : node --env-file=.env scripts/reparer-clients.mjs [--apply]
import mysql from 'mysql2/promise';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { transactionClients } from '../src/lib/clients-devis.ts';
import { lirePlanClients, appliquerPlanClients } from '../src/lib/reparer-clients.ts';
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 8889),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
try {
  const { plan } = await lirePlanClients(connection);
  console.log({
    fichesACreer: plan.nouveaux.length,
    liensACorriger: plan.liens.length,
    anciensLiensIncoherents: plan.liens.filter((l) => l.ancienClientId !== null).length,
  });
  if (process.argv.includes('--apply')) {
    const journal = await transactionClients(connection, async () => {
      const [avant] = await connection.query('SELECT * FROM demandes_devis ORDER BY id');
      const result = await appliquerPlanClients(connection);
      const [apres] = await connection.query('SELECT * FROM demandes_devis ORDER BY id');
      const contenu = (lignes) => lignes.map(({ client_id, ...reste }) => reste);
      assert.deepEqual(contenu(apres), contenu(avant), 'Le contenu des devis doit rester identique.');
      const { plan: verification } = await lirePlanClients(connection);
      assert.equal(verification.liens.length, 0, 'Tous les rattachements doivent être cohérents.');
      mkdirSync('.local', { recursive: true });
      const path = `.local/rattachement-clients-${Date.now()}.json`;
      writeFileSync(path, JSON.stringify({ date: new Date().toISOString(), ...result }, null, 2), {
        mode: 0o600,
      });
      return { ...result, path };
    });
    console.log({
      fichesCreees: journal.clientsCrees.length,
      liensCorriges: journal.liens.length,
      journal: journal.path,
    });
  }
} finally {
  await connection.end();
}
