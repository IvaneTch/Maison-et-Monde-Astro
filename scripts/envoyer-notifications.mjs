import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
const requis = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM', 'MAIL_TO'];
if (process.env.EMAIL_ENABLED !== 'true') {
  console.log(
    'Notifications non envoyées : EMAIL_ENABLED doit être true après configuration de la messagerie.',
  );
  process.exit(0);
}
for (const key of requis) if (!process.env[key]) throw new Error(`Configuration manquante : ${key}`);
const site = new URL(process.env.PUBLIC_SITE_URL || 'https://maisonetmonde.fr');
const c = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 8889),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
let verrou = false;
try {
  const [lock] = await c.execute("SELECT GET_LOCK('mm-notifications-v1',0) AS acquis");
  verrou = Number(lock[0]?.acquis) === 1;
  if (verrou) {
    const [rows] = await c.query(
      "SELECT id,reference,categorie FROM notifications WHERE etat='en_attente' ORDER BY id LIMIT 50",
    );
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000,
      socketTimeout: 15000,
    });
    let envoyees = 0;
    for (const row of rows) {
      await c.execute('UPDATE notifications SET tentatives=tentatives+1 WHERE id=?', [row.id]);
      try {
        const lien = new URL(
          ['contact', 'rappel'].includes(row.categorie) ? '/admin/messages/' : '/admin/',
          site,
        ).href;
        await transport.sendMail({
          from: process.env.MAIL_FROM,
          to: process.env.MAIL_TO,
          subject: `Maison & Monde · Nouvelle demande ${row.reference}`,
          text: `Une nouvelle demande (${row.categorie}) a été enregistrée.\nRéférence : ${row.reference}\nConsultez l’espace privé : ${lien}`,
          messageId: `<${row.reference.toLowerCase()}.${row.categorie}@${site.hostname}>`,
        });
        await c.execute("UPDATE notifications SET etat='envoyee',date_envoi=NOW() WHERE id=?", [row.id]);
        envoyees++;
      } catch {
        console.error(`Notification ${row.id} non envoyée. Elle reste en attente.`);
      }
    }
    console.log({ notificationsEnvoyees: envoyees });
  }
} finally {
  if (verrou) await c.execute("SELECT RELEASE_LOCK('mm-notifications-v1')");
  await c.end();
}
