import mysql from 'mysql2/promise';
export async function initialiserBase(connection) {
  await connection.execute(`CREATE TABLE IF NOT EXISTS demandes_contact (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, reference VARCHAR(30) NOT NULL UNIQUE,
 type_demande ENUM('contact','rappel') NOT NULL, prenom VARCHAR(100) NOT NULL, nom VARCHAR(100),
 email VARCHAR(255), telephone VARCHAR(30) NOT NULL, objet VARCHAR(100), message TEXT,
 disponibilite VARCHAR(100), consentement TINYINT NOT NULL DEFAULT 1,
 statut ENUM('nouvelle','traitee','archivee') NOT NULL DEFAULT 'nouvelle',
 date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX(statut)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await connection.execute(`CREATE TABLE IF NOT EXISTS notifications (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, reference VARCHAR(30) NOT NULL, categorie VARCHAR(30) NOT NULL,
 etat ENUM('en_attente','envoyee') NOT NULL DEFAULT 'en_attente', tentatives INT NOT NULL DEFAULT 0,
 date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, date_envoi DATETIME NULL,
 UNIQUE KEY notification_unique(reference,categorie), INDEX(etat)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}
if (process.argv[1]?.endsWith('initialiser-base.mjs')) {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 8889),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    await initialiserBase(c);
    console.log('Tables contacts et notifications prêtes. Les données existantes sont conservées.');
  } finally {
    await c.end();
  }
}
