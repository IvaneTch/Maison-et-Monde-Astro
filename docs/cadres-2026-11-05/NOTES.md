# Cadres et bordures — 5 novembre 2026

- Retrait de la bordure décorative des boutons dans `src/styles/buttons.css`, avec maintien du reflet, du dégradé et du repère de focus au clavier.
- Cartes mises en avant : Formule Confort dans `src/styles/menage-regulier-a-domicile.css`, Grand ménage dans `src/styles/services-occasionnels.css`.
- Fond intérieur arrondi à 22 px pour suivre le cadre extérieur de 24 px. Cadre doré de 2 px, redessiné au-dessus du fond afin de garder les coins visibles. Calque sans interaction, sous le badge, sans découper les photos débordantes.

Contrôles : bordure calculée des boutons à 0 px ; cadre doré à 2 px, coins intérieur/extérieur à 22/24 px ; ouverture des détails des deux cartes vérifiée ; pas de débordement à 320, 375 et 768 px sur les deux pages. Compilation serveur et construction/contrôle de la démo réussis. Aperçu local actualisé, aucune publication.
