// Export de structure uniquement : aucun contact, devis, mot de passe ou jeton n’est exporté.
import mysql from 'mysql2/promise';
import { writeFileSync } from 'node:fs';
const c = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 8889),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
try {
  const tables = [
    'administrateurs',
    'sessions_admin',
    'clients',
    'demandes_devis',
    'demandes_contact',
    'notifications',
  ];
  const parts = [
    '-- Structure Maison & Monde. Importer dans une base vide. Aucune donnée personnelle.',
    'SET NAMES utf8mb4;',
  ];
  for (const table of tables) {
    const [rows] = await c.query(`SHOW CREATE TABLE \`${table}\``);
    parts.push(String(rows[0]['Create Table']).replace(/ AUTO_INCREMENT=\d+/g, '') + ';');
  }
  writeFileSync('database/schema.sql', parts.join('\n\n') + '\n');
  console.log('Structure exportée sans données.');
} finally {
  await c.end();
}
