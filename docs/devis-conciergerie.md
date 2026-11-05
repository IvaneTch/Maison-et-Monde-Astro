# Devis Conciergerie

Route : `/conciergerie/demande-de-devis/`.

Le formulaire utilise le Layout commun, des styles préfixés `cq`, un script dédié et l’API `/api/devis`. Les formulaires de ménage restent inchangés. Les réponses sont conservées entre les étapes dans la page, sans stockage persistant des coordonnées dans le navigateur.

La sélection « Services complémentaires » ouvre un dialogue natif personnalisé : texte obligatoire de 2 000 caractères au maximum, enregistrement et modification, annulation/Escape/clic sur le fond, retour du focus. Fermer sans premier enregistrement annule la sélection. Annuler une modification conserve le texte enregistré. Décocher exclut les précisions de l’envoi. Le dialogue natif assure le confinement du focus et rend le reste de la page inactif.

Pour le ménage seul à la carte, les plateformes sont masquées et exclues de l’envoi. Le récapitulatif contient toutes les réponses envoyées et permet de revenir à chaque étape. Les doubles envois sont bloqués pendant la requête ; un échec conserve les réponses et permet de réessayer.

## Stockage compatible

Le schéma MySQL local a été vérifié : `type_devis` est un ENUM limité à `simple` et `detaille`. Aucune migration n’est nécessaire : les demandes utilisent `type_devis=detaille`, `prestation_souhaitee=Conciergerie`. Les listes administrateur présentent la catégorie « Conciergerie ». Les champs communs et les services sont enregistrés dans les colonnes existantes ; les réponses spécifiques figurent dans `commentaires`, au format JSON `{ "conciergerie": { ... } }`. La fiche administrateur les affiche dans une section dédiée, avec les sauts de ligne conservés. Les anciennes demandes gardent leur présentation.

## Vérifications effectuées

- `node --test tests/conciergerie.test.mjs` avec Node 24 : onze tests réussis (formulaire et administration), validation et API avec connexion simulée, succès et panne, régression des devis ménage simple et détaillé.
- Tests DOM isolés avec jsdom (installé temporairement hors du projet) : cinq étapes, champs obligatoires, conservation des réponses, modale et texte vide, modification, annulation/Escape et focus, ménage seul, récapitulatif, erreur/reprise et double envoi.
- MySQL réel : exécution de la branche API avec insertion et relecture dans une transaction, puis annulation ; absence de demande fictive vérifiée.
- Réponse HTTP 200 sur la nouvelle route et compilation Astro réussie.

Limite : le navigateur intégré a échoué à ouvrir un onglet ; le contrôle visuel sur ordinateur/mobile et le contrôle interactif de la fiche administrateur restent à effectuer dans un navigateur. Le confinement natif du focus du dialogue n’a pas été testé dans un vrai navigateur.


## Listes administrateur Ménage et Conciergerie

Le tableau de bord conserve ses indicateurs globaux et présente deux listes distinctes, accessibles par le menu : « Devis Ménage » et « Devis Conciergerie ». Chacune dispose de sa recherche, de son filtre de statut (y compris Refusées), de son compteur de résultats et d’un résumé des statuts. La recherche globale s’applique aux deux listes. Les raccourcis « nouvelles » et « toutes » réinitialisent les recherches des deux listes.

La liste Conciergerie affiche l’accompagnement demandé et la fréquence des séjours ; la liste Ménage affiche la prestation et la fréquence. La catégorie reste visible sous la référence, dans l’activité récente, en haut de la fiche et dans la corbeille. Le fichier clients reste commun.

Les nouvelles références sont `CC-AAAAMMJJ-XXXXXXXX` pour la Conciergerie et `MM-AAAAMMJJ-XXXXXXXX` pour le ménage. Aucune référence existante n’a été modifiée. Le classement utilise la catégorie enregistrée, indépendamment du préfixe ; les anciennes demandes Conciergerie en MM sont donc correctement séparées.

Vérification supplémentaire : rendu du véritable composant Astro avec demandes fictives et connexion simulée, puis tests DOM des recherches indépendantes et globale, filtres de statut, raccourcis et menu. Aucun accès administrateur ni enregistrement réel n’a été créé pour ces tests. Compilation réussie après les modifications.

## Fiches clients et historique

Les trois formulaires passent désormais par `enregistrerDevisAvecClient`. L’enregistrement du devis, la création/réutilisation de la fiche et le lien `client_id` sont effectués dans une transaction MySQL. Un verrou commun évite la création simultanée de doublons. Une erreur annule l’ensemble ; les coordonnées des fiches existantes ne sont jamais écrasées depuis le formulaire public.

Règle de rapprochement : e-mail normalisé + prénom et nom normalisés. Même e-mail avec un autre nom, ou même nom avec un autre e-mail : fiches distinctes. Le téléphone seul ne suffit jamais. Pour les anciennes demandes sans e-mail uniquement, le téléphone normalisé et le nom complet doivent correspondre. Les doublons exacts ambigus nécessitent une vérification plutôt qu’une fusion automatique.

Le tableau Clients compte les demandes par `client_id`, comme l’historique de la fiche. Les deux activités partagent le même fichier clients.

La réparation des données locales a créé 8 fiches et corrigé 12 liens (11 manquants et 1 incohérent). Résultat vérifié : 10 clients, 14 demandes actives liées, aucune demande orpheline. Le contenu complet des devis, y compris leurs dates, références et statuts, a été comparé avant/après et conservé. Le journal local `.local/rattachement-clients-1793612073364.json` contient uniquement les identifiants des liens avant/après et des fiches créées ; il est exclu de Git.

Commande de diagnostic, sans écriture : `node --env-file=.env scripts/reparer-clients.mjs`. Ajouter `--apply` pour appliquer une réparation. Le script valide le contenu des devis et la cohérence des liens avant de valider la transaction. Une seconde analyse après réparation ne propose aucune modification.

Validation : 16 tests automatisés réussis ; cinq envois réels de test sur les trois branches API vérifiés dans MySQL (réutilisation du contact entre activités, séparation des noms/e-mails différents, comptage), puis annulés sans laisser de données fictives. Compilation Astro réussie.

## Présentation harmonisée avec le site

Le devis Conciergerie reprend désormais les titres Georgia gras et les textes Arial/Helvetica du devis ménage, avec un bandeau blanc et bleu nuit, une photo découpée par une courbe organique, deux contours dorés et des cercles décoratifs. Des lignes dorées traversent le fond du parcours. Progression, choix, boutons et panneau bénéficient d’ombres cohérentes ; les effets de survol et le léger flottement du cartouche sont réservés aux appareils avec souris et désactivés en mode mouvement réduit.

Les cinq étapes conservent les mêmes champs et validations. Les choix de logement et d’accompagnement sont illustrés ; les services ont des pictogrammes et des descriptions courtes. Un encart avec photo et texte contextuels accompagne chaque étape. Le récapitulatif dispose de cartes dédiées, et la modale reprend les mêmes finitions.

Contrôle réel dans le navigateur effectué : ordinateur, largeur mobile 390 px sans débordement horizontal, navigation jusqu’au récapitulatif, ouverture et validation de la modale, conservation des précisions. Aucune demande fictive n’a été envoyée depuis le navigateur. Test DOM complet (y compris erreur/reprise et confirmation simulée) et compilation réussis. Ces contrôles remplacent la limitation de contrôle visuel mentionnée lors de la première livraison.
