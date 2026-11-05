# Extension des zones — 5 novembre 2026

14 nouvelles pages : Boulogne-Billancourt, Saint-Cloud, Clamart, Châtillon, Bagneux, Montrouge, Malakoff, Vanves, Villejuif, Saint-Mandé, Vincennes, Créteil, Alfortville et Vitry-sur-Seine.

Le composant existant de page locale est réutilisé : couverture photo, prestations illustrées, questions pratiques et liens de devis. Les titres, descriptions, paragraphes et questions sont adaptés dans `src/data/villes.json`. Les photos WebP existantes sont réutilisées comme illustrations ; aucune nouvelle série photographique n’a été générée. Aucun bureau ou témoignage local supplémentaire n’est revendiqué.

Les 14 routes sont ajoutées au plan et au sitemap. L’annuaire présente 35 zones (20 arrondissements et 15 villes, dont Antony). Les encarts compacts conservent les quatre priorités existantes et le lien vers toutes les zones.

Les devis sont préremplis à partir du même référentiel des secteurs : code postal et ville, sans duplication d’une liste spécifique au formulaire.

## Contrôles

- Compilation réussie.
- Démo statique : 71 pages, liens et images présents, formulaires désactivés.
- Audit HTTP global : 66 pages analysées, 69 destinations, 145 ressources images, aucune erreur.
- 28 contrôles des nouvelles pages à 320 et 1440 pixels : un H1, couverture chargée, aucun débordement horizontal.
- 16 contrôles du devis : les 14 nouveaux codes postaux, Paris 14 et Antony ; code postal et ville correctement préremplis, aucun formulaire envoyé.
- Codes postaux recoupés avec La Poste et La Banque Postale : https://localiser.laposte.fr/ et https://www.labanquepostale.fr/particulier/localisation_bureau/ile-de-france/hauts-de-seine.html

Les interventions et les dates restent à confirmer à l’adresse du client. Aucun effet sur le classement Google n’est présumé par la création des pages.
