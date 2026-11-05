# Démonstration GitHub Pages

Cette solution est conservée sur la branche `demo`. Ne pas fusionner cette branche dans `main` : la production garde sa configuration SSR Node, MySQL et ses API.

Adresse prévue après déploiement : https://ivanetch.github.io/Maison-et-Monde-Astro/

## Construire et vérifier

Avec Node 24 et les dépendances installées (`npm ci`) :

```sh
npm run build:demo
npm run check:demo
```

Le script recopie les sources dans `.demo/src`, retire les routes admin/API, le middleware et les bibliothèques serveur, puis adapte les chemins au sous-dossier GitHub Pages. Seuls les modules de données/validation contact et conciergerie sont conservés pour afficher les choix des formulaires. Les fichiers de production dans `src` et `astro.config.mjs` restent inchangés. Le résultat statique est dans `dist-demo`, sans accès MySQL ni secret nécessaire.

Les formulaires restent visibles pour explorer les étapes et les choix, mais les boutons d'envoi sont désactivés et les événements de soumission bloqués. Aucun devis ni message n'est enregistré ou envoyé. L'administration, l'authentification, les notifications, les téléchargements privés et les API ne sont pas disponibles. Un bandeau et des notices expliquent ces limites. Ne pas saisir de données personnelles. Les liens téléphone et email peuvent ouvrir les applications du visiteur.

La démo est publique et porte `noindex,nofollow` ainsi qu'un robots.txt bloquant l'exploration. Ces indications ne constituent pas un contrôle d'accès. Aucun domaine personnalisé ni CNAME n'est ajouté.

## Publication et mises à jour

GitHub Pages doit utiliser la source **GitHub Actions**. Le workflow `.github/workflows/demo-pages.yml` construit, vérifie puis publie uniquement lors d'un push sur `demo`. Le job de publication utilise l'environnement `github-pages`, qui doit autoriser la branche `demo`.

Pour actualiser le contenu, récupérer les changements de `origin/main` dans `demo`, résoudre les conflits éventuels, relancer les deux commandes ci-dessus puis pousser uniquement `demo`. Un push sur `main` ne republie pas cette démo. Aucun réglage de production ni donnée de base n'est requis pour ce déploiement.
