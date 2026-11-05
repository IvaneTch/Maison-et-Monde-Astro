# Pages de zones — images et présentation — 5 novembre 2026

## Corrections effectuées

- 21 couvertures originales : les 20 arrondissements de Paris et Antony. Création par l’outil intégré de génération d’images. Ambiances variées : crème, bois, sauge, terracotta, rose, quelques accents bleu marine.
- 63 fichiers WebP dans `public/images/secteurs/` : chaque image en 1536, 960 et 480 pixels. Ensemble : environ 3,8 Mo. Dimensions, textes alternatifs et srcset intégrés au manifeste `src/data/images.json` et aux données `src/data/secteurs.ts`.
- Grand bandeau photo sur les 21 pages, texte blanc et or, deux liens de devis/formules et vague dorée, comme la Conciergerie. Les images sont signalées comme illustrations, sans prétendre montrer des clients réels.
- Bloc « Choisir votre prestation » remplacé par quatre cartes illustrées : ménage régulier, ponctuel/grand ménage, repassage et première intervention. Grille 4 colonnes sur ordinateur, 2 sur tablette, 1 sur mobile. Les images des cartes ne répètent pas celle du bandeau sur une même page.
- Cadres dorés Confort et Grand ménage conservés ; les photos rondes passent maintenant devant le trait. Badges conservés au premier plan.
- Liens des zones supprimés du menu principal, sur ordinateur et mobile. Le pied de page conserve uniquement « Zones d’intervention » ; les liens directs vers Paris 14, 12, 13 et Antony sont retirés de ce menu. Les pages restent accessibles dans l’annuaire et indexables.

## Fichiers principaux

- `src/components/LocalServicePage.astro`
- `src/styles/secteurs.css`
- `src/data/secteurs.ts`, `src/data/images.json`
- `src/components/Header.astro`, `src/components/Footer.astro`
- `src/styles/menage-regulier-a-domicile.css`, `src/styles/services-occasionnels.css`

## Vérifications

- Compilation Astro réussie.
- 30 tests existants réussis, aucun échec.
- Démo statique : 51 pages, liens/images présents et formulaires désactivés comme prévu.
- Audit HTTP : 48 pages, 49 destinations, 145 ressources images ; aucune erreur détectée (`audit.json`). Aucun formulaire envoyé.
- 51 contrôles de rendu : les 21 pages à 320 et 1440 pixels, et trois pages représentatives à 320, 768 et 1440 pixels. Un titre H1, quatre cartes, couverture chargée et aucun débordement horizontal dans les cas contrôlés (`responsive.json`).
- Contrôle visuel des 21 créations sur la planche, puis des bandeaux, cartes et deux cadres dans le navigateur. Captures conservées dans ce dossier.

## Sources et limites

Les prompts complets, les chemins des PNG originaux conservés et les textes alternatifs figurent dans `prompts.json`. Les WebP utilisés sont dans `public/images/secteurs/`. La planche est `planche-21-images.jpg`.

Aucune publication effectuée. Les envois réels, la base de données et la réception des courriels ne font pas partie de ces contrôles de présentation. Le positionnement Google se mesurera après lancement ; des images distinctes ne garantissent pas une meilleure place.
