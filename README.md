# Le Grand Jeu – site web

- `index.html` : interface joueurs (classement 0→500 km, carte, tableaux de bord, défis/échanges de malus)
- `maitre.html` : interface maîtres du jeu (mini-jeux, gentils, méchants) protégée par un code
- `js/config.js` : **à personnaliser** (équipes, catégories, 30 malus, adresses/coordonnées, code, Firebase)

## Tester tout de suite (sans serveur)
Ouvrez `index.html` dans le navigateur (idéalement via `python -m http.server`). Sans config Firebase, les données restent dans le navigateur (mode test, onglets synchronisés).

## Serveur gratuit : Firebase Realtime Database
1. https://console.firebase.google.com → « Ajouter un projet » (gratuit, plan Spark).
2. « Build » → « Realtime Database » → créer (région Europe) → mode test.
3. Paramètres du projet → « Vos applications » → `</>` Web → copiez l'objet `firebaseConfig` dans `window.FIREBASE_CONFIG` de `js/config.js` (n'oubliez pas `databaseURL`).
4. Règles de la base (onglet « Règles »), limitées au nœud `state` :
   ```json
   { "rules": { "state": { ".read": true, ".write": true } } }
   ```
   ⚠ Le code des maîtres du jeu est vérifié côté navigateur : suffisant pour un jeu entre amis, pas sécurisé contre un utilisateur averti.

## Hébergement : GitHub Pages
1. Créez un dépôt GitHub, envoyez-y ces fichiers.
2. Settings → Pages → Branch `main` / racine. URL : `https://<pseudo>.github.io/<depot>/`.
3. Plus tard : domaine GoDaddy via Settings → Pages → Custom domain (+ enregistrement CNAME chez GoDaddy).

## Règles implémentées
- 6 catégories × 5 malus : chaque malus n'est attribuable qu'à une seule équipe (grisé ensuite, redevient cliquable une fois retiré).
- Une équipe ne peut avoir qu'un malus par catégorie ; sinon → malus « spécial » en texte libre (non échangeable).
- Échange : l'équipe gagnante choisit l'adversaire et la catégorie ; les deux malus de cette catégorie sont **échangés**, uniquement si l'équipe défiée clique sur « Accepter » (les deux équipes doivent avoir un malus dans la catégorie).
- Les kilomètres sont bornés entre 0 et 500.
