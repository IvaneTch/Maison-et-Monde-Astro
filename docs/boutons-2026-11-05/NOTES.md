# Boutons Maison & Monde — 5 novembre 2026

Style inspiré du déplacement de dégradé de [Gradient Button Hover, Mohammed Erdem](https://codepen.io/JavaScriptJunkie/pen/pPRooV), réinterprété dans la palette Maison & Monde, sans chargement de code ou de ressource externe.

- Doré champagne / miel : actions principales, devis rapide, validation et envoi.
- Bleu marine / bleu profond : actions secondaires, devis détaillé, retour et modification.
- Rouge conservé pour les actions destructives de l’administration.
- Relief au repos ; dégradé qui glisse et bouton qui se soulève au survol ; pression vers le bas au clic.
- Sur mobile, l’état pressé reste disponible sans dépendre d’un survol.
- Focus clavier visible, état désactivé explicite, animations coupées pour les utilisateurs demandant une réduction des mouvements.
- Les icônes et les petits contrôles conservent leurs gabarits. Les points des carrousels et les liens purement textuels gardent leur rôle de navigation.

Style partagé : `src/styles/buttons.css`, chargé dans les deux layouts public et administration. Classes visuelles explicites ajoutées aux boutons et liens d’action, sans modifier les URL, identifiants ou gestionnaires de formulaires. Les modifications de l’audit précédent sont conservées.

Vérifications : compilation serveur réussie ; 29 tests réussis ; compilation et contrôle de la démo statique réussis ; 104 contrôles de largeur (26 pages × 320/375/768/1440 px), aucun débordement ; ouverture et fermeture du devis rapide, navigation vers le devis détaillé et blocage des champs vides en Conciergerie vérifiés dans le navigateur. Aucun formulaire envoyé, aucun déploiement réalisé. L’administration a été compilée mais n’a pas été parcourue avec une session authentifiée.

Voir `apercu-ordinateur.png` et `responsive.json` dans ce dossier.

## Ajustement après retour sur le bouton n° 6

Dégradés renforcés, direction `to right`, fond à `300% 100%`, déplacement de `0% 0%` à `100% 0%` en `0.4s ease-in-out`. Halo diffus plus marqué, suppression de l’épaisse semelle de l’ancienne version. Format principal de 55 px et texte de 16 px imposés face aux anciens styles de page ; en-tête compact conservé. Relief au survol et pression au clic conservés. Palette : doré du logo pour le principal, marine et bleu pour le secondaire. Vérification de la taille et des propriétés calculées dans le navigateur ; 78 mesures de largeur (26 pages × 320/375/1440), aucun débordement. Compilation serveur et contrôle de démo réussis. Aperçu local laissé actif pour un essai avec la souris. Pas de nouvelle publication en ligne.

## Relief 3D et recherche des boutons oubliés

Ajout d’un reflet bombé en couche fixe sur le dégradé mobile existant. Tranche de 6 px au repos, 9 px au survol et 1 px en état pressé ; ombres internes pour le volume. Le fond coloré continue à glisser en 0,4 s, séparément du reflet.

Boutons ajoutés à l’harmonisation : « En savoir plus » et « Voir tous les avis sur Google » sur l’accueil, liens de références officiels sur Crédit d’impôt, catégories de questions sur la FAQ Conciergerie. Flèches du carrousel principal raccordées au style compact d’icône. Aucun lien ou gestionnaire d’événement changé.

Recherche dans le rendu des 26 pages : aucun autre ancien lien/bouton avec fond ou bordure et forme arrondie détecté après corrections (hors liens d’évitement, cartes de services et icônes sociales). Cette recherche concerne les contrôles rendus visibles, pas une session d’administration authentifiée. 104 vérifications de largeur (320/375/768/1440 px), aucun débordement. Compilations serveur/démo et contrôle de démo réussis. Aperçu local actualisé et laissé actif.

## Finition brillante sans halo extérieur

Après la nouvelle référence visuelle : reflet supérieur arrondi et ombrage inférieur intégrés dans le bouton. Suppression de toutes les ombres extérieures colorées et de la tranche déportée, au repos, au survol, à l’appui et à l’état désactivé. Dégradé mobile et transition de 0,4 s conservés, couleurs du logo inchangées. Le focus clavier reste visible pour l’accessibilité. Propriétés calculées vérifiées sur les deux boutons de devis : uniquement des ombres `inset`. Compilations et contrôle de la démo réussis. Aperçu local actualisé et laissé actif.
