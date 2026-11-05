import { existsSync, readFileSync } from 'node:fs';
const manquants = [];
for (const k of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PUBLIC_SITE_URL'])
  if (!process.env[k]) manquants.push(k);
try {
  const site = new URL(process.env.PUBLIC_SITE_URL);
  if (site.protocol !== 'https:') manquants.push('PUBLIC_SITE_URL doit utiliser HTTPS');
} catch {
  manquants.push('PUBLIC_SITE_URL invalide');
}
if (process.env.PUBLIC_INDEXABLE !== 'true')
  manquants.push('Indexation désactivée (normal en préproduction)');
if (process.env.EMAIL_ENABLED !== 'true') manquants.push('Notifications e-mail non activées');
else
  for (const k of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM', 'MAIL_TO'])
    if (!process.env[k]) manquants.push(k);
if (!existsSync('dist/server/entry.mjs')) manquants.push('Compilation manquante');
console.log(
  manquants.length
    ? 'Points restant à préparer :\n- ' + manquants.join('\n- ')
    : 'Configuration présente. Vérifier ensuite HTTPS, la connexion MySQL et un envoi SMTP de test sur l’hébergement.',
);
if (manquants.length) process.exitCode = 1;
