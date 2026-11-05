// À exécuter uniquement pour créer un accès initial sur une nouvelle base. Ne modifie aucun compte existant.
import mysql from 'mysql2/promise';
import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline/promises';
if (!process.stdin.isTTY)
  throw new Error('Ouvrez un terminal interactif pour saisir le mot de passe sans l’afficher.');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question('E-mail du nouvel administrateur : ')).trim().toLowerCase();
rl.close();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail invalide.');
async function secret() {
  process.stdout.write('Mot de passe (12 caractères minimum, saisie masquée) : ');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return await new Promise((resolve, reject) => {
    let value = '';
    const lire = (chunk) => {
      for (const char of chunk) {
        if (char === '\u0003') {
          fin();
          reject(new Error('Création annulée.'));
          return;
        }
        if (char === '\r' || char === '\n') {
          fin();
          resolve(value);
          return;
        }
        if (char === '\u007f') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    function fin() {
      process.stdin.removeListener('data', lire);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    }
    process.stdin.on('data', lire);
  });
}
const password = await secret();
if (password.length < 12 || password.length > 1024) throw new Error('Longueur du mot de passe invalide.');
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const c = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 8889),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
try {
  await c.execute('INSERT INTO administrateurs (email,mot_de_passe) VALUES (?,?)', [
    email,
    `${salt.toString('hex')}:${hash.toString('hex')}`,
  ]);
  console.log('Compte créé. Aucun mot de passe n’est affiché ni conservé en clair.');
} finally {
  await c.end();
}
