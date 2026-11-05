# Bandeaux — 5 novembre 2026

Fichier modifié : `src/styles/bandeaux.css`.

Le bandeau du devis professionnel utilisait déjà les couleurs communes, mais la variante diagonale rendait son SVG à 80 % d’opacité. Sur fond blanc, cela éclaircissait et grisait les bleus. L’opacité du fond est désormais de 100 %, avec les mêmes couleurs et les mêmes courbes.

Animation de flottement ajoutée aux icônes des bandeaux partagés, aux avantages de l’accueil et aux icônes des grilles d’avantages des services. Déclenchement au survol du groupe ; mouvement vertical de 7 px en boucle douce de 1,8 seconde. Les rotations existantes sont conservées. Aucun mouvement permanent sur mobile, ni animation pour la préférence de réduction des mouvements.

Vérifié dans le navigateur : opacité 1 et animation `mm-band-icon-float` active sous le pointeur ; déplacement vertical intermédiaire constaté. Accueil, ménage régulier et devis professionnel contrôlés à 320, 375 et 768 px sans débordement. Compilation serveur, construction et contrôle de démo réussis. Aperçu local actualisé, aucune publication.
