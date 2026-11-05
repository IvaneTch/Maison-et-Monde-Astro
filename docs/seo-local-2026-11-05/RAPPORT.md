# Pages locales et préparation SEO — 5 novembre 2026

## Réalisation

Création de 21 pages de secteurs : les 20 arrondissements de Paris et Antony. Une page « Zones d’intervention » les regroupe. Paris 14, Paris 12, Paris 13 et Antony restent mis en avant dans les blocs de secteurs et le pied de page ; tous les autres arrondissements sont accessibles depuis le répertoire complet.

Ces pages décrivent des zones de prestation, et non 21 établissements. Deux bureaux ont été confirmés par le propriétaire et sont présentés dans les coordonnées publiques :

- Bureau Paris 14 : 53 rue Boulard, 75014 Paris.
- Bureau Paris 12 : 19 rue Lamblardie, 75012 Paris.

Les données légales existantes du siège social n’ont pas été remplacées. Aucun autre bureau, équipe locale, délai garanti ou témoignage n’a été inventé. La présence de plusieurs clients à Antony est une information fournie par le propriétaire.

## Pages

- `/zones-intervention/`
- `/menage-paris-1/` à `/menage-paris-20/`
- `/menage-antony/`

Les pages initiales Paris 14, Paris 12 et Paris 13 comportent des informations sur leurs secteurs et des questions distinctes. Les autres pages abordent des situations de préparation de ménage différentes : premier passage, pièces occupées, matériaux fragiles, organisation du linge, accès, rythme ou passage d’un grand ménage à un entretien suivi. La structure de présentation et les liens de services sont communs ; ces pages ne constituent pas des études de cas d’interventions effectivement réalisées.

Chaque page dispose d’un titre et d’une description propres, d’un H1, d’une URL canonique, d’un fil d’Ariane, de questions/réponses, de liens vers les prestations et d’un devis contextualisé. Les données structurées Service et BreadcrumbList complètent les données d’entreprise partagées. Les deux bureaux sont déclarés comme lieux de l’entreprise ; aucune nouvelle fiche Google n’a été créée.

## Images

Une illustration principale est intégrée à chaque page de secteur, à partir des photos existantes. Dimensions réelles, variantes WebP `srcset`, texte alternatif descriptif et taille responsive sont renseignés. Les illustrations sont explicitement présentées comme telles et ne sont pas attribuées à des clients de l’arrondissement.

Les images sont différentes sur les quatre pages prioritaires. Certaines illustrations sont réutilisées entre les autres pages ; elles ne sont pas répétées dans le contenu d’une même page. Les aperçus sociaux des pages locales reprennent leur photo principale.

Les vraies photos des bureaux et de prestations locales, si disponibles et autorisées, permettront de renforcer ces contenus après validation. Aucun achat, téléchargement ou remplacement massif de visuels effectué.

## Vitres simples

Aucune page autonome de vitrerie créée. Les textes et choix de devis présentent les vitres simples accessibles comme un complément au ménage, avec le matériel convenu. La vitrerie professionnelle et les interventions en hauteur ne sont pas annoncées.

Le lien existant `?service=vitres` présélectionne désormais ménage et vitres simples. Les demandes de vitres seules sont refusées dans l’API des devis simple et détaillé. Le formulaire rapide et le devis détaillé donnent aussi cette indication avant l’envoi. Les valeurs de formulaire historiques sont conservées pour rester compatibles avec les données et l’administration.

## Liens et coordonnées

Les pages de secteurs sont reliées au menu « Nos services », à la page des prestations, à l’accueil, aux principales pages de services et au pied de page. Le sitemap et le plan HTML utilisent la liste des pages publiques mise à jour.

La page Contact présente les deux bureaux et leurs liens d’itinéraire. Le pied de page présente également les deux adresses. Le préremplissage du code postal et de la ville fonctionne pour les codes 75001 à 75020 et 92160 ; aucune donnée de suivi cachée n’a été ajoutée.

## Vérifications

- Compilation serveur Astro réussie.
- 30 tests automatisés réussis, dont un nouveau test : vitres seules refusées avant connexion MySQL, complément avec ménage accepté dans les deux types de devis.
- Démo statique reconstruite et contrôlée : 51 pages HTML ; liens et ressources présents ; formulaires de démo toujours désactivés.
- Audit HTTP : 48 pages publiques, 49 destinations et 87 références d’images, zéro erreur.
- Contrôle supplémentaire : aucun titre ou description dupliqué, un H1 et un main par page, JSON-LD analysable, aucune image locale manquante.
- 88 contrôles responsive pour les 21 pages locales et le répertoire, à 320, 375, 768 et 1440 px : aucun débordement.
- Avant extension aux 20 arrondissements, les 31 pages avaient également passé 124 contrôles de largeur.
- Préremplissage des devis vérifié dans le navigateur pour 75001, 75012, 75014, 75020 et 92160 ; ville Paris ou Antony conforme.
- Présélection conjointe ménage/vitres vérifiée dans le navigateur. Aucun formulaire réellement envoyé et aucune écriture dans une base ou messagerie.
- `git diff --check` sans erreur.

## Fichiers principaux

- `src/data/secteurs.ts` : textes et métadonnées des secteurs.
- `src/components/LocalServicePage.astro` : présentation des pages locales et données structurées.
- `src/components/InterventionAreas.astro` : liens de secteurs prioritaires ou répertoire complet.
- `src/styles/secteurs.css` : présentation et responsive.
- `src/pages/menage-paris-*/index.astro`, `src/pages/menage-antony/index.astro`, `src/pages/zones-intervention/index.astro` : routes.
- `src/data/entreprise.ts`, Contact et Footer : deux bureaux.
- `src/data/pages.ts`, `src/components/SeoHead.astro` : découverte et métadonnées.
- Formulaires et API devis : périmètre des vitres et préremplissage géographique.

## Avant publication

L’environnement local et la démonstration restent volontairement non indexés. L’activation et la vérification du domaine définitif, des redirections, de robots.txt, du sitemap et de Search Console devront être faites au lancement. Aucune publication ni modification de Google Business Profile effectuée.

La création de pages ne garantit pas leur indexation ni un classement. Les contenus devront évoluer avec les demandes reçues et les informations vérifiables de l’entreprise : vraies photos, exemples autorisés, prestations réellement demandées et questions des clients. Aucun volume de recherche ni résultat de positionnement n’a été mesuré ici.

## Sources des informations géographiques

Noms de secteurs du 12e vérifiés sur la [mairie du 12e](https://mairie12.paris.fr/pages/coordonnees-et-horaires-des-services-en-mairie-10275), et du 14e sur la [mairie du 14e](https://mairie14.paris.fr/pages/conseils-de-quartier-dates-et-ordre-du-jour-11299). Les textes des autres arrondissements n’attribuent pas de caractéristiques immobilières ou de quartiers non vérifiés. Les adresses des bureaux et la présence de clients à Antony proviennent des indications du propriétaire.
