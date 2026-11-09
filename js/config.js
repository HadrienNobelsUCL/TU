// ====== CONFIGURATION À MODIFIER ======

// Code d'accès de l'interface des maîtres du jeu (maitre.html)
window.PIN_MAITRE = "1234";

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAqvZyczT6aNdQJwJB5bJCCZjEIsCH8sZo",
  authDomain: "tu2026-58919.firebaseapp.com",
  databaseURL: "https://tu2026-58919-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tu2026-58919",
  storageBucket: "tu2026-58919.firebasestorage.app",
  messagingSenderId: "183523022892",
  appId: "1:183523022892:web:d63f8cbd282c8f85fb9989",
  measurementId: "G-FB5KNBMJW7"
};

// Centre de la carte : Schoolstraat, 3670 Oudsbergen (approximatif, à ajuster)
window.CARTE_CENTRE = [51.0667, 5.5500];
window.CARTE_ZOOM = 15;

// Les 5 équipes
window.EQUIPES = [
  { id: "t1", nom: "Baladins", couleur: "#101f5a", icone: "B" },
  { id: "t2", nom: "Seeonee", couleur: "#7ed957", icone: "S" },
  { id: "t3", nom: "PDH", couleur: "#1b6b3a", icone: "P" },
  { id: "t4", nom: "Agoja", couleur: "#2144a0", icone: "A" },
  { id: "t5", nom: "Pionniers", couleur: "#d62828", icone: "P" },
];

// Pastille ronde colorée avec la première lettre de l'équipe
window.badge = e => `<span class="badge" style="background:${e.couleur}">${e.icone}</span>`;

// Les 6 catégories (une par mini-jeu), chacune avec 5 malus prédéfinis + lieu sur la carte.
// Remplacez les textes, adresses et coordonnées (lat, lng) quand vous les connaîtrez.
window.CATEGORIES = [
  { nom: "Déguisement", lieu: "Mini-jeu 1 – adresse à venir", lat: 51.0690, lng: 5.5500,
    malus: ["Déguisement 1", "Déguisement 2", "Déguisement 3", "Déguisement 4", "Déguisement 5"] },
  { nom: "Catégorie 2", lieu: "Mini-jeu 2 – adresse à venir", lat: 51.0680, lng: 5.5560,
    malus: ["Malus 2.1", "Malus 2.2", "Malus 2.3", "Malus 2.4", "Malus 2.5"] },
  { nom: "Catégorie 3", lieu: "Mini-jeu 3 – adresse à venir", lat: 51.0650, lng: 5.5570,
    malus: ["Malus 3.1", "Malus 3.2", "Malus 3.3", "Malus 3.4", "Malus 3.5"] },
  { nom: "Catégorie 4", lieu: "Mini-jeu 4 – adresse à venir", lat: 51.0640, lng: 5.5510,
    malus: ["Malus 4.1", "Malus 4.2", "Malus 4.3", "Malus 4.4", "Malus 4.5"] },
  { nom: "Catégorie 5", lieu: "Mini-jeu 5 – adresse à venir", lat: 51.0650, lng: 5.5440,
    malus: ["Malus 5.1", "Malus 5.2", "Malus 5.3", "Malus 5.4", "Malus 5.5"] },
  { nom: "Catégorie 6", lieu: "Mini-jeu 6 – adresse à venir", lat: 51.0680, lng: 5.5435,
    malus: ["Malus 6.1", "Malus 6.2", "Malus 6.3", "Malus 6.4", "Malus 6.5"] },
];

window.KM_MAX = 500;
