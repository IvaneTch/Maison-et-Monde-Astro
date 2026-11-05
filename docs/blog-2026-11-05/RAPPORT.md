# Conseils & guides — 5 novembre 2026

Création de `/conseils/` et de quatre articles originaux : estimation du nombre d’heures, choix des formules, préparation d’un grand ménage et ménage entre deux locations.

Trois catégories, cartes illustrées avec les images WebP déjà optimisées du projet, sommaire par article, liste pratique, liens vers les prestations et lectures complémentaires. Aucun texte ni visuel repris du concurrent. Le contenu respecte les limites des prestations existantes, notamment les vitres simples en complément du ménage.

Accès par le pied de page. Les cinq routes sont ajoutées au plan du site et au sitemap. Chaque page possède un titre et une description propres. Les articles utilisent leur image de partage et comportent les données structurées BlogPosting et BreadcrumbList, avec Maison & Monde comme auteur, sans date de publication inventée avant lancement.

## Fichiers

- `src/data/articles.json` : textes et informations éditoriales.
- `src/components/GuideArticle.astro` : présentation des articles.
- `src/components/GuideCards.astro` : cartes illustrées.
- `src/pages/conseils/` : index et quatre routes.
- `src/styles/conseils.css` : présentation responsive.
- `src/components/Footer.astro`, `src/components/SeoHead.astro`, `src/data/pages.ts` : intégration au site.

## Validation

- Compilation Astro réussie.
- Démo vérifiée : 56 pages HTML, liens et images présents, aucun envoi de formulaire.
- Audit HTTP global sans erreur : voir `audit.json`.
- 15 contrôles sur les cinq nouvelles pages à 320, 768 et 1440 pixels : aucun débordement horizontal, un H1 et une description par page. Résultats dans `responsive.json`.
- Vérification visuelle des cartes et d’un article, navigation par catégorie et sommaire testées dans le navigateur.

La rubrique est préparée en local, sans déploiement. Les images sont des illustrations déjà utilisées dans le projet. Aucun résultat de positionnement Google ne peut être mesuré avant lancement. Les prochains articles pourront être ajoutés dans le même format ; aucune interface d’administration éditoriale n’a été ajoutée.
