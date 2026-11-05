# Maison & Monde

Site Astro avec serveur Node et base MySQL. Les prestations et le design sont propres à Maison & Monde ; aucune publication automatique n’est réalisée par ces scripts.

## Démarrer en local

Utiliser Node 24 (`nvm use`), puis :

```sh
npm ci
npm run db:init
npm run dev -- --background
```

Le fichier `.env` local existant contient la connexion MySQL. Pour une nouvelle installation, copier `.env.example` vers `.env` et renseigner les valeurs sans les partager ni les versionner. MAMP utilise ici le port MySQL 8889 ; la valeur dépend de votre installation.

## Vérifier

```sh
npm test
npm run format:check
npm run build
npm run audit
```

L’audit HTTP attend par défaut un site à `http://localhost:4321`. Pour une autre adresse : `python3 scripts/auditer-site.py http://localhost:4325`.

## Organisation

- `src/pages` : routes publiques, administration et API.
- `src/layouts` : cadre public commun et cadre des nouveaux écrans administrateur.
- `src/components` : en-tête, pied de page, formulaires et blocs réutilisables.
- `src/styles` : base minimale et styles séparés par page.
- `src/data` : coordonnées, pages publiques et images optimisées.
- `src/lib` : validations, rapprochement des clients, protection des accès.
- `database/schema.sql` : structure MySQL sans données personnelles.
- `scripts` : initialisation, diagnostic, traitement des notifications et audit.
- `tests` : validation, transactions, rapprochement et protections.

Les fichiers `.local`, `.env`, les sauvegardes et les originaux des images ne doivent pas être publiés. Le dossier `.local` contient notamment une sauvegarde antérieure à la finalisation et les originaux des photos.

## Production

Lire [le guide de déploiement](docs/deploiement.md) avant de remplacer l’ancien site. L’indexation et les notifications SMTP sont désactivées tant que leur configuration n’est pas explicitement validée. Aucun compte administrateur n’est exporté avec le schéma.
