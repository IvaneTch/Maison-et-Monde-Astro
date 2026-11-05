# Une seule version de travail

Le dossier principal à ouvrir dans VS Code est :

`/Users/ivanetchikviladze/Desktop/Maison-et-Monde-Astro`

La copie dans Documents/ChatGPT a servi aux modifications du 5 novembre 2026. Elle est conservée comme copie de sécurité ; ne pas alterner entre les deux dossiers pour développer.

## Prévisualisation sur le Mac et l’iPhone

Depuis le dossier principal, avec Node 24 :

```sh
npm run dev -- --host 0.0.0.0 --port 4321 --background
```

- Mac : http://localhost:4321/
- iPhone, connecté au même Wi-Fi : utiliser l’adresse Network affichée par Astro (actuellement http://192.168.1.76:4321/).
- Si l’adresse Wi-Fi du Mac change, l’adresse sur l’iPhone change aussi.
- Le Mac et le serveur doivent rester allumés.
- Arrêt : `npm run astro -- dev stop`.
- État : `npm run astro -- dev status`.

## GitHub et la démonstration

Un seul dépôt : https://github.com/IvaneTch/Maison-et-Monde-Astro

- `main` : version complète du projet.
- `demo` : même travail, avec le workflow qui construit la démonstration statique.
- Les changements sont validés sur `main`, puis intégrés à `demo` et envoyés sans réécriture forcée d’historique.
- Un envoi sur `demo` actualise l’adresse existante : https://ivanetch.github.io/Maison-et-Monde-Astro/
- GitHub Actions doit terminer le déploiement avant que les changements soient visibles.

La démonstration GitHub Pages désactive les formulaires et n’embarque ni administration active, ni base de données, ni configuration secrète. Le site complet devra être hébergé sur un serveur adapté au lancement. Ne jamais envoyer `.env`, les données de base ni les sessions sur GitHub.

Avant chaque mise à jour : `npm test`, `npm run build`, `npm run build:demo`, `npm run check:demo`.
