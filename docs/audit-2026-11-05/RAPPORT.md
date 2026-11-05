# Audit Maison & Monde — 5 novembre 2026

## Résultat et périmètre

Audit du code Astro et des pages rendues localement : navigation, responsive, Conciergerie, contenus commerciaux, devis, SEO technique et images. Corrections effectuées dans `maison-et-monde-demo`, le projet local versionné. Avant modification, son dossier `src` était identique à celui extrait du ZIP Maison-et-Monde-Astro ; les outils de démo constituent une extension du projet local.

Aucun déploiement, aucune modification de base de données, aucun envoi d’e-mail et aucun remplacement important de photo. Couleurs, structure des pages et identité Maison & Monde conservées. Les formulaires ont été parcourus avec des données fictives, sans envoi réel.

**Bilan :** 29 tests automatisés réussis ; compilation serveur réussie ; démo statique de 29 pages générée et vérifiée ; 26 pages publiques auditées, 27 destinations et 82 références d’images contrôlées par l’auditeur fourni, sans erreur ; 130 contrôles de largeur (26 pages × 5 tailles) sans débordement après correction.

Les contrôles de largeur vérifient la géométrie du document, pas chaque détail de chaque écran ni toutes les combinaisons d’interactions. Ils ne remplacent pas des essais sur de vrais téléphones.

## Corrections effectuées

Gravité : **élevée** = risque de perte ou de mauvaise qualification d’une demande ; **moyenne** = parcours, accessibilité ou référencement dégradé ; **faible** = amélioration ciblée sans blocage.

| Gravité initiale | Problème confirmé | Correction | Fichiers |
|---|---|---|---|
| Élevée | Les liens `?formule=classique/confort/expert` n’étaient pas lus par le devis : choix commercial perdu. | Conservation du nom de formule dans `prestation_souhaitee`, sélection du ménage et de la fréquence régulière. Formule Confort vérifiée dans le navigateur. | `src/pages/devis-detaille.astro` ; lien émetteur dans `src/pages/menage-regulier-a-domicile/index.astro` |
| Moyenne | Le gestionnaire d’envoi du devis détaillé ne contrôlait que l’étape 5, même lors d’un appui sur Entrée plus tôt. | Entrée fait progresser l’étape courante ; validation des cinq étapes avant envoi, y compris les sections temporairement masquées. | `src/pages/devis-detaille.astro` |
| Moyenne | L’API du devis détaillé vérifiait uniquement la présence du champ de consentement ; `false` était accepté. | Valeur `on` exigée, comme pour les autres devis. Nouveau test : refus avant connexion MySQL. | `src/pages/api/devis.ts` ; `tests/conciergerie.test.mjs` |
| Moyenne | Les cinq cartes de services de l’accueil et le lien « toutes nos prestations » menaient tous à `#contact`. | Liens vers les pages concernées ; vitres vers le devis prérempli, faute de page dédiée. | `src/pages/index.astro` |
| Moyenne | L’ornement circulaire du devis professionnel créait 72 px de débordement à 375 px et un débordement jusqu’à 1024 px. | Débordement décoratif contenu dans la section, sans modifier les champs ni la composition. | `src/styles/devis-professionnel.css` |
| Moyenne | Descriptions identiques sur ménage régulier, occasionnel et Formule Test. | Trois descriptions spécifiques aux offres et à la zone d’intervention. | `src/pages/menage-regulier-a-domicile/index.astro` ; `src/pages/services-occasionnels/index.astro` ; `src/pages/service-de-menage-test/index.astro` |
| Moyenne | Deux éléments `main` imbriqués sur Crédit d’impôt. | Un seul contenu principal ; conteneur interne transformé en `div`. | `src/pages/credit-impot/index.astro` |
| Moyenne | Les URL canoniques dépendaient de la présence d’un slash dans l’URL demandée. | Canonique normalisée avec slash final ; paramètres de devis exclus. | `src/components/SeoHead.astro` |
| Faible | Une même image de salon était utilisée pour les aperçus sociaux de toutes les prestations. | Aperçus Open Graph et Twitter adaptés aux principales prestations à partir des images existantes ; titres, descriptions et textes alternatifs Twitter ajoutés. | `src/components/SeoHead.astro` |
| Faible | La page 404 aurait hérité de l’indexation générale si celle-ci était activée. | Exclusion explicite des réponses 404 dans les métadonnées. Le serveur retourne bien HTTP 404. | `src/components/SeoHead.astro` |
| Faible | Échappement JSON-LD du caractère `<` suréchappé. | Échappement JSON correct sans changer les données d’entreprise. | `src/components/SeoHead.astro` |
| Faible | Plusieurs dimensions HTML étaient différentes des dimensions réelles ; une photo d’inspection avait un texte alternatif de salon. | Dimensions synchronisées avec les fichiers ; texte alternatif de l’inspection corrigé. | `src/components/ServicePage.astro` ; pages Contact, Crédit d’impôt, ménage régulier, occasionnel, Test et suivi-maintenance |
| Faible | Trois photos récentes n’avaient ni variantes mobiles ni entrée dans le manifeste. | Six variantes WebP ajoutées (480/960 px), manifeste complété, `srcset` branchés sur les images de maintenance et la photo secondaire des bureaux. Originaux conservés. | `public/images/conciergerie/*-480.webp` et `*-960.webp` ; `src/data/images.json` ; `src/components/ServicePage.astro` ; `src/pages/conciergerie/suivi-maintenance/index.astro` |
| Faible | Notice cookies volumineuse sur mobile ; pas de limite de hauteur sur petit écran. | Marges, logo et espacements réduits ; texte intégral conservé ; boutons de 44 px ; hauteur maximale et défilement interne. Mesure à 375 px : environ 338 → 267 px. | `src/styles/cookie-notice.css` |
| Faible | Une note destinée à la préparation du site était visible sous les avis (« capture de votre fiche Google »). | Formulation publique sobre avec maintien du lien Google ; avis et notes inchangés. | `src/pages/index.astro` |

## Navigation et responsive

- Les 26 pages publiques, le menu principal, le pied de page et les liens internes rendus ont été parcourus automatiquement. Aucune destination interne cassée ni ancre manquante détectée.
- Deux anciennes pages de devis existent et redirigent vers les parcours actuels : `/demande-de-devis/` et `/demande-de-devis-menage-et-nettoyage-a-domicile/`.
- Menu mobile ouvert/fermé et fenêtre de devis rapide ouverte/fermée dans le navigateur à 375 px.
- Toutes les pages publiques contrôlées à **320, 375, 768, 1024 et 1440 px**, hauteur de référence 900 px : pas de défilement horizontal du document après correction.
- Présence d’un lien d’évitement, de styles de focus et d’une prise en compte de la réduction des animations constatée dans le code.
- Les tableaux de disponibilité peuvent utiliser leur propre défilement interne, ce qui est distinct d’un débordement global.
- La barre inférieure mobile, le comportement au défilement, le zoom à 200 %, VoiceOver, Safari iOS, Android et les claviers virtuels n’ont pas fait l’objet d’une validation exhaustive.

## Conciergerie et contenus commerciaux

Les **9 pages** suivantes existent et répondent : accueil Conciergerie, gestion complète, ménage/préparation, accueil voyageurs, suivi/maintenance, services à la carte, tarifs/formules, questions fréquentes et demande de devis. Aucune page de cette rubrique n’est manquante dans les parcours contrôlés.

Les prix présents dans les sources sont cohérents entre les pages examinées : gestion à partir de **18 % TTC** ; forfaits **80/95/120 € TTC** ; ménage seul à partir de **55 €** pour studio/T1, **80 €** pour T2/T3 ; accueil **35 €**, linge **20 €**. Le ménage et le linge sont annoncés comme facturés séparément de la commission, sauf devis particulier. Les services de gestion d’annonces et de réservations ne sont pas inclus automatiquement, comme le précisent la FAQ et la gestion complète.

Ménage régulier : Classique **29 €/h**, Confort **31 €/h**, Expert **35 €/h** ; montants après avantage fiscal affichés à moitié. Occasionnel **32,50 €/h**, grand ménage **34,50 €/h**, vitres **29 €/h**, Test **29 €/h**. Les divisions par deux sont correctes dans les valeurs examinées. Ces vérifications portent sur la cohérence du contenu ; elles ne certifient ni les tarifs réellement pratiqués ni l’éligibilité fiscale.

**Décisions commerciales restant à confirmer :**

| Gravité | Point | Conséquence / action souhaitée | Fichiers |
|---|---|---|---|
| Moyenne | L’accueil affiche « Avec l’avance immédiate », tandis que la page dédiée précise que sa disponibilité pour Maison & Monde doit être confirmée. | Faire confirmer la disponibilité opérationnelle avant de garder une promesse générale. Aucune activation fiscale présumée. | `src/pages/index.astro` ; `src/pages/credit-impot/index.astro` |
| Moyenne | « Gestion complète » peut être comprise comme incluant la commercialisation alors que la FAQ l’exclut par défaut. | Valider que le positionnement souhaité est bien la coordination sur place ; les exclusions existent déjà. | `src/pages/conciergerie/gestion-complete/index.astro` ; FAQ |
| Faible | La base de la commission, les modalités d’annulation et les fournitures sont renvoyées au devis. | À compléter seulement selon les conditions commerciales réelles : assiette de calcul, délais, suppléments, minimum éventuel, horaires d’arrivée. | Tarifs, FAQ, `src/pages/cgv/index.astro` |
| Faible | Pas de page autonome de nettoyage de vitres ; le service existe dans les offres et le devis. | Création possible si une présentation détaillée est souhaitée ; ce n’est pas un lien cassé. | Occasionnels et devis détaillé |
| À confirmer | Avis, assurances, qualification des intervenants, coordonnées, promesses de disponibilité et affiliation SAP. | Le code ne prouve pas la réalité de ces informations. Les extraits d’avis n’ont pas été recertifiés auprès de Google. | Accueil, données entreprise et pages commerciales |

Les pages de conditions, confidentialité et mentions sont présentes et accessibles. Cet audit n’est pas une validation juridique ou fiscale de leur contenu.

## Formulaires : résultats et limites

| Parcours | Vérifications réalisées | Limite |
|---|---|---|
| Devis rapide | Ouverture/fermeture de la fenêtre, champs requis, sélection multiple et conversion vers `prestation` examinées ; API couverte par tests simulés. | Pas d’enregistrement réel. |
| Devis ménage détaillé | Choix de formule conservé, Entrée à l’étape 1 amène à l’étape 2 dans le navigateur ; validation finale et consentement corrigés ; limites de 3 à 7 h pour Test examinées. | Parcours de succès final vérifié par tests API simulés, pas avec une base réelle. |
| Devis professionnel | Champs et valeurs autorisées comparés à l’API ; consentement et piège antispam présents ; création et catégorie de notification couvertes par tests. | Pas d’essai d’écriture MySQL ni d’envoi SMTP. |
| Devis Conciergerie | Étape vide bloquée ; cinq étapes remplies jusqu’au récapitulatif ; studio avec zéro chambre accepté ; plateformes masquées pour ménage seul ; consentement et récapitulatif vérifiés. | Bouton final volontairement non envoyé. Fenêtre de services complémentaires examinée dans le code et validation couverte par tests, pas chaque interaction UI. |
| Contact / rappel | Code et tests existants contrôlés : validation, consentement, antispam, transaction et notification. | Pas d’appel téléphonique, de message réel ni de rappel déclenché. |

Les tests utilisent des connexions MySQL simulées. Ils couvrent notamment les transactions, les échecs de base, le rattachement client, la catégorie Professionnel/Conciergerie, les consentements et les réponses API. Cela ne prouve pas que le schéma réellement installé correspond aux requêtes.

**Durcissement restant conseillé (moyen, non bloquant pour le parcours normal)** : le devis détaillé contrôle la présence de services et disponibilités, mais ne possède pas la même liste stricte de valeurs autorisées que la Conciergerie. Fréquence et durée ordinaires sont aussi moins strictement contrôlées côté serveur. Un appel direct à l’API peut donc transmettre des choix non proposés dans l’interface. Une centralisation des choix client/serveur serait préférable à une duplication de listes. La limite de taille dépend également du `Content-Length` annoncé. La protection de fréquence est en mémoire du processus (`src/lib/limites.ts`) ; son comportement derrière plusieurs serveurs n’a pas été testé.

## SEO technique

Contrôles sur les **26 pages publiques** : titre, description, un H1, un main, canonique, robots, JSON-LD et attributs alternatifs. Après corrections : aucun titre ou description dupliqué ; un seul H1 et main par page ; une canonique par page ; JSON-LD analysable ; aucune image HTML sans attribut `alt` détectée. Un alt vide est conservé pour les éléments décoratifs.

Le sitemap répond HTTP 200. Les canoniques ignorent les paramètres de formulaire et normalisent le slash final. Le domaine par défaut est `https://maisonetmonde.fr` et reste configurable par `PUBLIC_SITE_URL`. Les URL historiques de devis sont conservées.

**Point de lancement majeur, laissé volontairement inchangé :** la compilation locale produit `noindex,nofollow` et un `robots.txt` interdisant l’exploration, car `PUBLIC_INDEXABLE` n’est pas activé. C’est une protection adaptée à la démonstration. Si le site public définitif utilise le même réglage, son référencement sera empêché. L’activation doit se faire sur l’environnement définitif, avec vérification du domaine, des en-têtes et du robots réellement servis ; elle n’a pas été effectuée ici.

La démo conserve son blocage d’indexation et ses formulaires désactivés. Aucun score Lighthouse, résultat Search Console, classement Google ou métrique réelle de vitesse n’est revendiqué. Les titres longs ne sont pas considérés automatiquement comme des erreurs : leur affichage dépend des moteurs.

### Inventaire page par page

Toutes les lignes ci-dessous ont passé les contrôles structurels ; l’indexation locale est volontairement désactivée. Le détail des descriptions et métadonnées se trouve dans `pages.json`.

| Page | Titre contrôlé |
|---|---|
| `/` | Maison & Monde — Ménage à domicile à Paris |
| `/nos-services/` | Nos services à Paris et en Île-de-France — Maison & Monde |
| `/menage-regulier-a-domicile/` | Ménage régulier à domicile — Maison & Monde |
| `/services-occasionnels/` | Services de ménage occasionnels à Paris — Maison & Monde |
| `/grand-menage-paris/` | Grand ménage à Paris — Maison & Monde |
| `/repassage-a-domicile-paris/` | Repassage à domicile à Paris — Maison & Monde |
| `/service-de-menage-test/` | Formule Test de ménage à domicile à Paris — Maison & Monde |
| `/nettoyage-bureaux-paris/` | Nettoyage de bureaux à Paris — Maison & Monde |
| `/conciergerie/` | Conciergerie à Paris — Maison & Monde |
| `/conciergerie/gestion-complete/` | Gestion complète de location courte durée à Paris — Maison & Monde |
| `/conciergerie/menage-preparation-logement/` | Ménage et préparation du logement à Paris — Maison & Monde |
| `/conciergerie/accueil-voyageurs/` | Accueil des voyageurs à Paris — Conciergerie Maison & Monde |
| `/conciergerie/suivi-maintenance/` | Suivi et maintenance de logement à Paris — Maison & Monde |
| `/conciergerie/services-a-la-carte/` | Services complémentaires de conciergerie à Paris — Maison & Monde |
| `/conciergerie/tarifs-formules/` | Tarifs et formules de conciergerie à Paris — Maison & Monde |
| `/conciergerie/questions-frequentes/` | Questions fréquentes — Conciergerie Maison & Monde |
| `/devis-simple/` | Demande de devis — Maison & Monde |
| `/devis-detaille/` | Devis ménage détaillé — Maison & Monde |
| `/devis-professionnel/` | Devis professionnel — Maison & Monde |
| `/conciergerie/demande-de-devis/` | Devis Conciergerie — Maison & Monde |
| `/contactez-nous/` | Contactez Maison & Monde — Paris et Île-de-France |
| `/credit-impot/` | Crédit d’impôt et Avance immédiate — Maison & Monde |
| `/mentions-legales/` | Mentions légales — Maison & Monde |
| `/politique-de-confidentialite/` | Politique de confidentialité — Maison & Monde |
| `/cgv/` | Conditions de demande et de service — Maison & Monde |
| `/plan-du-site/` | Plan du site — Maison & Monde |

## Images : répétitions vérifiées et propositions

Les logos récurrents, la carte du pied de page, les différentes résolutions `srcset` et les doublons entre une image et sa balise Open Graph ne sont pas comptés comme des répétitions éditoriales.

### Répétitions HTML certaines sur une même page

| Page | Photo | Nombre d’éléments img | Proposition, non appliquée |
|---|---|---:|---|
| `/grand-menage-paris/` | `/images/grand-menage.paris.webp` | 2 | Garder la photo principale ; proposer la salle de bain existante pour le bloc de préparation. |
| `/repassage-a-domicile-paris/` | `/images/service-repassage-domicile-paris.webp` | 2 | Garder la photo principale ; proposer hero-repassage.webp pour le second bloc. |
| `/conciergerie/gestion-complete/` | `/images/conciergerie/salon-conciergerie.webp` | 2 | Réserver le salon à un seul bloc et choisir une scène de coordination pour le second. |
| `/conciergerie/menage-preparation-logement/` | `/images/conciergerie/services-complementaires.webp` | 2 | Différencier préparation du lit, linge et contrôle plutôt que répéter la même scène. |
| `/conciergerie/menage-preparation-logement/` | `/images/conciergerie/salon-conciergerie.webp` | 2 | Réserver le salon à un seul bloc et choisir une scène de coordination pour le second. |
| `/conciergerie/services-a-la-carte/` | `/images/conciergerie/reassort-courses.webp` | 2 | Une seule scène de panier ; seconde scène centrée sur rangement et contrôle des produits. |

Des chevauchements supplémentaires entre `img` et des URL présentes dans les feuilles CSS sont signalés dans `pages.json`, notamment sur gestion complète, ménage/préparation, accueil voyageurs et services à la carte. Ce sont des **candidats à examiner**, car une déclaration CSS peut être surchargée ou inactive ; ils ne sont pas additionnés comme répétitions visibles certaines.

### Photos récentes contrôlées

Planche des photos présentes : [photos-actuelles.png](photos-actuelles.png).

- Bureaux : scène de travail avec intervenants et photo secondaire d’une intervenante nettoyant une table ; thème cohérent.
- Maintenance : inspection avec liste de contrôle et vérification d’équipements ; thème cohérent. L’ancien alt de salon était inadapté et a été corrigé.
- Repassage : geste de repassage visible, cohérent ; répétition sur la page à décider.
- Grand ménage : scène de logement en désordre et préparation de l’intervention ; possible complément avec une scène de nettoyage effectif ou de résultat, à valider.
- Accueil voyageurs : remise de clés ; thème cohérent.

Il n’existe pas d’historique visuel complet permettant de certifier tous les remplacements antérieurs. Le contrôle porte sur les fichiers actuellement utilisés, leur contenu visible et leurs propriétés. Aucune affirmation sur la provenance ou la licence des images existantes n’est déduite de leur nom.

### Optimisation vérifiée

- **38 images principales** référencées dans le manifeste après ajout des trois images récentes ; dimensions et largeurs déclarées des variantes vérifiées avec Sharp : aucune incohérence détectée.
- Formats WebP existants conservés. Les 38 fichiers principaux totalisent environ **5,52 Mo** ; cela ne représente pas le poids téléchargé par une page.
- Plus gros principal : immeuble, environ **248 ko** ; ménage à domicile, **213 ko** ; appartement Conciergerie, **210 ko**. Pas de recompression générale avec perte supplémentaire.
- Six nouvelles variantes mobiles ajoutées pour bureaux, inspection et contrôle des équipements : **21–22 ko à 480 px**, **52–54 ko à 960 px**, contre **125–133 ko** pour leurs principaux. Les trois originaux sont inchangés.
- Aucun fichier image strictement identique à un autre par comparaison SHA-256 dans `public/images`. Des scènes visuellement proches restent possibles.
- Les dimensions HTML ont été corrigées là où elles ne correspondaient pas aux images référencées. Les photos de maintenance et bureaux sont désormais raccordées aux bonnes variantes.
- Les fonds CSS conservent souvent leur image principale : proposer des variantes adaptées via `image-set` ou des règles mobiles est une piste complémentaire, à contrôler selon le recadrage.
- Deux photos de la FAQ restent chargées depuis `images.unsplash.com` (`src/pages/conciergerie/questions-frequentes/index.astro`, vers les lignes 139 et 278). Elles sont externes au contrôle d’existence des fichiers locaux, et leur disponibilité et licence n’ont pas été certifiées. Proposition : choisir des photos locales distinctes ou des visuels approuvés, puis les intégrer avec leurs variantes.
- Le script `scripts/optimiser-images.mjs` n’a pas été relancé : ses originaux `.local/originaux/images` ne sont pas disponibles dans le projet de travail. Il reconstruit le manifeste et doit tenir compte des trois images récentes avant une régénération générale.

### Recherche de références thématiques — à valider avant intégration

Priorité proposée : exploiter d’abord les photos locales existantes pour garder les tenues vertes, les touches dorées et l’ambiance parisienne. Les références externes ci-dessous constituent une sélection thématique, pas un remplacement approuvé. Leur rendu exact, le cadrage et les droits d’utilisation doivent être validés avant téléchargement et intégration.

| Prestation | Direction proposée | Référence consultée |
|---|---|---|
| Ménage régulier et Test | Geste d’entretien réel, pièce lumineuse, tenue professionnelle ; choisir une scène distincte pour chaque page. | [Nettoyage d’un lavabo — Matilda Wormwood, Pexels](https://www.pexels.com/photo/person-in-blue-gloves-cleaning-white-sink-4098762/) |
| Grand ménage / occasionnel | Gros plan de nettoyage des sanitaires pour compléter la vue générale. | [Nettoyage de salle de bain — Kaboompics, Pexels](https://www.pexels.com/photo/crop-person-in-cleaning-glove-in-bathroom-4239041/) |
| Vitres | Geste de nettoyage de fenêtre clairement visible. | [Nettoyage de fenêtre, Pexels](https://www.pexels.com/photo/a-woman-cleaning-the-window-4440537/) |
| Repassage / linge | Plan rapproché du linge et du fer, différent de la photo principale. | [Repassage professionnel — Liliana Drew, Pexels](https://www.pexels.com/photo/woman-ironing-clothes-9462665/) |
| Préparation d’une location | Mise en place du lit plutôt qu’un nouveau salon. | [Préparation de la literie — Liliana Drew, Pexels](https://www.pexels.com/photo/housekeepers-changing-bedding-in-hotel-room-9462742/) |
| Accueil voyageurs | Remise de clés, consignes ou livret d’accueil ; la photo locale actuelle est déjà adaptée. | [Clés en main, Unsplash](https://unsplash.com/photos/a-person-holding-a-bunch-of-keys-in-their-hand-Ebj87ehFNNU) |
| Bureaux | Conserver les deux photos récentes ; pas de remplacement proposé à ce stade. | Voir la planche locale. |
| Suivi/maintenance | Conserver inspection et contrôle ; éviter la répétition de salons. | Voir la planche locale. |
| Gestion complète / tarifs / FAQ | Coordination, contrôle et préparation, chacun dans un bloc différent. | Réutilisation ciblée des scènes locales, puis sélection d’une seule photo par rôle. |
| Courses et réassort | Panier d’accueil pour un bloc et rangement des consommables pour l’autre. | La photo locale `reassort-courses.webp` convient au premier rôle ; seconde prise de vue à sélectionner. |

## Contrôles effectués et preuves

| Contrôle | Résultat | Preuve |
|---|---|---|
| Node | v24.22.1 utilisée, conforme à la contrainte du projet `>=22.23.4`. Le Node par défaut v20.8.0 échouait ; ce n’était pas un défaut du site. | `package.json` et journaux |
| `npm test` | **29/29 réussis**, dont un nouveau test de consentement. | `tests.txt` |
| `npm run build` | Réussie, sortie serveur Astro. | `compilation.txt` |
| `npm run build:demo`, `npm run check:demo` | Réussis : 29 HTML, liens/ressources présents, envois désactivés, aucun code serveur publié par ce contrôle. | `demo.txt` |
| `npm run audit -- http://127.0.0.1:4327` | 26 pages, 27 destinations, 82 images, **0 erreur**. | `controle-http.txt` |
| Audit supplémentaire des métadonnées | Titres/descriptions uniques, H1/main uniques, canoniques, JSON-LD et alt contrôlés. | `pages.json` |
| Dimensions et poids des images | 38 principaux et leurs variantes, aucune incohérence de manifeste. | `images.json` |
| Responsive | 130 mesures, **0 débordement**. | `responsive.json` |
| Notice cookies mobile | Hauteur 267 px à 375 px ; identité et texte conservés. | `mobile-cookies.png` |
| Routes particulières | URL sans slash, paramètres devis, 404, sitemap, robots vérifiés. | `routes-speciales.json` |
| Diff de fichiers | Pas d’erreur d’espacement signalée par `git diff --check`. | Vérification locale |

Les scripts de formatage général n’ont pas été appliqués à tout le projet : seules les corrections et certains fichiers concernés ont été formatés. Les fichiers de journaux et de preuve sont conservés dans ce dossier.

## Ce qui nécessite encore un environnement réel ou une décision

1. **Élevé pour la validation opérationnelle :** soumettre une demande fictive autorisée à une base de test configurée, vérifier la ligne enregistrée, le client rattaché, les catégories et l’affichage dans l’administration. Aucune base n’a été initialisée ou modifiée pendant cet audit.
2. **Élevé avant un référencement public :** valider le domaine définitif, puis les réglages `PUBLIC_INDEXABLE`, les robots et les en-têtes sur ce domaine. La démo doit rester non indexée.
3. **Moyen :** contrôler les notifications avec une boîte de test et l’exécution réelle de `scripts/envoyer-notifications.mjs`. L’API crée des notifications ; elle ne prouve pas à elle seule la réception d’un e-mail. Aucun ordonnanceur ni compte SMTP n’a été testé.
4. **Moyen :** valider l’Avance immédiate, les services effectivement inclus, les exclusions et les conditions commerciales ; contrôler les justificatifs des promesses. Aucun changement de prix ni d’engagement ajouté.
5. **Moyen :** décider des remplacements de photos répétés et des deux photos externes de la FAQ. Les propositions sont prêtes ; aucun remplacement important appliqué.
6. **Moyen :** harmoniser les listes de choix et les limites serveur du devis détaillé, et valider la protection antispam dans les conditions du serveur définitif.
7. **Faible :** compléter les essais sur de vrais téléphones, au clavier et avec lecteur d’écran ; effectuer une mesure de performances sur l’environnement représentatif.

Aucune publication ni modification de l’environnement de production réalisée.
