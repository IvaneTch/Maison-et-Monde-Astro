# Mise en ligne Maison & Monde

## Ce qui est préparé

Le site fonctionne avec Node 24 et MySQL 8. Le serveur est `dist/server/entry.mjs`, lancé avec `npm start`. Il doit être placé derrière un reverse proxy HTTPS. Un hébergement exclusivement PHP/WordPress ou statique ne suffit pas pour les formulaires et l’administration actuels.

Les changements restent locaux. Ni le domaine, ni le site WordPress, ni les accès d’hébergement n’ont été modifiés.

## Avant le déploiement

1. Confirmer l’offre d’hébergement, son support de Node 24, MySQL 8 et des tâches planifiées. Les anciennes mentions indiquent IONOS ; actualiser les coordonnées d’hébergement si le fournisseur change.
2. Relire les informations SASU / SIRET 98203903400011, le directeur de publication et le médiateur ANM. La forme juridique, les horaires (lundi–samedi 9 h–20 h) et les nouveaux tarifs ont été confirmés par le propriétaire. La convention de médiation et les conditions contractuelles remises avec les devis doivent être validées par l’entreprise avant publication.
3. Déterminer et documenter les durées de conservation concrètes des demandes et les opérations de suppression/archivage. La politique publique ne doit pas annoncer une suppression automatique inexistante.
4. Sauvegarder les fichiers et la base de l’ancien site, puis prévoir un retour arrière. Conserver les sauvegardes en dehors de la racine publique et avec un accès restreint.
5. Préparer une base distincte et un utilisateur MySQL dédié à l’application, sans exposer MySQL sur Internet.

## Installer et vérifier sur une préproduction

- Copier les sources et `public/` ; exclure `.local`, `.git`, `.env` local, `node_modules` local et toute sauvegarde.
- Installer les dépendances avec `npm ci`.
- Créer la structure dans une base vide à partir de `database/schema.sql`. Sur une base existante, sauvegarder d’abord, puis exécuter `npm run db:init` pour les seules tables supplémentaires.
- Renseigner les variables d’environnement d’après `.env.example`, avec les véritables secrets conservés sur le serveur. Garder `PUBLIC_INDEXABLE=false` en préproduction.
- Créer l’administrateur initial avec `node --env-file=.env scripts/creer-admin.mjs` depuis un terminal sécurisé. La saisie du mot de passe est masquée ; le script ne remplace aucun compte existant.
- Exécuter `npm test`, `npm run format:check`, puis `npm run build`.
- Démarrer `npm start` avec un gestionnaire de service et un utilisateur non privilégié. Le proxy doit transmettre correctement l’hôte et le protocole de la requête d’origine afin que les contrôles d’origine des formulaires restent cohérents.
- Vérifier `/api/health`, les routes, le rendu mobile et les parcours complets. Contrôler HTTPS, la connexion administrateur, la sauvegarde/restauration et les erreurs réseau.

## Messages et notifications

Les contacts et rappels sont enregistrés dans `demandes_contact`, accessibles dans `/admin/messages/`. Chaque devis, contact et rappel ajoute une notification en base. L’application ne prétend jamais qu’un e-mail a été envoyé pour confirmer un enregistrement.

Pour les alertes internes, configurer `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` et `MAIL_TO`, puis activer `EMAIL_ENABLED=true`. Prévoir l’exécution régulière de `node --env-file=.env scripts/envoyer-notifications.mjs` avec le répertoire du projet comme dossier de travail. Un verrou empêche deux exécutions simultanées ; les échecs restent en attente. En cas de panne après livraison SMTP et avant mise à jour en base, une notification peut être reçue à nouveau : il s’agit d’un traitement au moins une fois, pas d’une garantie de livraison unique.

Les alertes contiennent la référence et un lien privé, sans le message ni les coordonnées du client. Elles n’envoient pas automatiquement un devis commercial au client. Vérifier la délivrabilité depuis le domaine de l’entreprise avant activation publique.

## Indexation, liens et bascule

Après validation de la préproduction, renseigner le domaine HTTPS définitif et `PUBLIC_INDEXABLE=true`, puis reconstruire le site. Le sitemap et les balises canoniques proviennent du même domaine ; `robots.txt` exclut l’administration et l’API. La protection de l’administration repose sur l’authentification, pas sur robots.txt.

Les liens internes vers les anciens formulaires locaux sont redirigés. Les anciennes URL de photos sont redirigées vers les versions WebP. Inventorier aussi les URL WordPress réellement indexées avant la bascule et compléter le plan de redirection : ne pas rediriger toutes les anciennes pages vers l’accueil.

Le limiteur de tentatives applicatif est en mémoire. Pour plusieurs processus, plusieurs serveurs ou un proxy partagé, compléter la limitation au niveau du proxy ou par un stockage partagé avec une configuration explicite des adresses de confiance.

## À conserver après lancement

Sauvegardes régulières de MySQL et des fichiers, contrôle des erreurs de notification, mises à jour des dépendances, vérification périodique des formulaires, gestion des comptes administrateurs et revue des données à supprimer. Une sauvegarde n’est validée qu’après un essai de restauration.

## Orientation retrouvée dans « XARAXURA »

Le 31 octobre 2026, le projet envisagé était « Maison & Monde — Équipe » : application iPhone en Swift/SwiftUI, plannings, pointages, messagerie interne et notifications, avec une interface direction. La réalisation de l’application était reportée après la finalisation du site.

La piste de travail était un VPS OVHcloud de 8 Go de RAM en France pour héberger le site Node, l’administration, MySQL et, ultérieurement, les services de l’application. L’estimation historique de 20–25 € TTC par mois pour l’ensemble doit être revalidée au moment de choisir l’offre ; aucune commande ni migration n’a été réalisée.

Les noms envisagés étaient `maisonetmonde.fr`, `admin.maisonetmonde.fr` et `api.maisonetmonde.fr`. Ils constituent une organisation possible, pas des sous-domaines déjà configurés. Le domaine et la messagerie peuvent rester temporairement chez IONOS pendant la préparation d’une migration.

L’API mobile nécessitera une authentification et des autorisations propres aux rôles direction/salariée, sans réutiliser les formulaires publics comme accès aux données internes. Les notifications Apple, la messagerie et le pointage ne sont pas implémentés par la finalisation du site web. Les modules actuels de validation et de gestion des clients forment une base réutilisable.

Les paramètres MySQL peuvent être fournis par les variables d’environnement du processus sur le futur serveur ; les fichiers `.env` Astro restent disponibles comme secours pour le développement local. Garder les bases de développement et de production distinctes.
