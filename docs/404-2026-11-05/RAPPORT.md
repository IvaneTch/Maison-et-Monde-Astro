# Page 404 animée — 5 novembre 2026

Remplacement de la page 404 simple par une présentation Maison & Monde : bleu marine et or, mots « 404 / page / introuvable » défilant sur un canvas en arrière-plan, réseau de points et lignes sur un second canvas devant, message et liens au premier plan.

Effets recréés localement en Canvas à partir des références fournies, sans dépendance à particles.js ni chargement depuis un CDN. Survol : liaisons vers le pointeur ; clic hors des liens et boutons : ajout plafonné de particules. Les liens Accueil, Nos services et Contact restent accessibles au clavier et utilisables sans animation ou sans JavaScript.

Pause/reprise explicite, démarrage immobile avec prefers-reduced-motion, suspension quand l’onglet est masqué, densité réduite sur mobile et résolution plafonnée pour limiter le coût d’animation. Les deux canvas sont décoratifs et masqués aux lecteurs d’écran.

## Vérifications

- Compilation Astro et démo statique réussies ; contrôle de la démo : 71 pages HTML.
- Une adresse inexistante renvoie HTTP 404 avec la présentation personnalisée et la directive noindex.
- 320, 390, 768 et 1440 pixels : un H1, deux canvas et aucun débordement horizontal.
- Pause/reprise et retour à l’accueil testés dans le navigateur.
- La 404 n’est pas ajoutée au sitemap. GitHub Pages utilise le fichier 404.html généré par Astro.

Fichiers : src/pages/404.astro, src/styles/not-found.css, src/scripts/not-found.ts.
