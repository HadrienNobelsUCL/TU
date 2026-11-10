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
// Lieu de départ et d'arrivée (maison) : remplacez lat/lng
window.MAISON = { lat: 51.128207700621246, lng: 5.54780611739903, nom: "Départ / Arrivée" };
window.CARTE_ZOOM = 15;

// Les 5 équipes
window.EQUIPES = [
  { id: "t1", nom: "Baladins", couleur: "#101f5a", icone: "B" },
  { id: "t2", nom: "Seeonee", couleur: "#7ed957", icone: "S" },
  { id: "t3", nom: "PDH", couleur: "#1b6b3a", icone: "P" },
  { id: "t4", nom: "Agoja", couleur: "#2144a0", icone: "A" },
  { id: "t5", nom: "Pionniers", couleur: "#d62828", icone: "P" },
  { id: "t6", nom: "Staff d'U", couleur: "#ff69b4", icone: "U", staff: true }, // pas de km, ressources en texte libre uniquement
];

// Pastille ronde colorée avec la première lettre de l'équipe
window.badge = e => `<span class="badge" style="background:${e.couleur}">${e.icone}</span>`;

// Les 6 catégories (une par mini-jeu), chacune avec 5 malus prédéfinis + lieu sur la carte.
// Remplacez les textes, adresses et coordonnées (lat, lng) quand vous les connaîtrez.
window.CATEGORIES = [
  { nom: "Communication", lieu: "Epreuve 1", lat: 51.0690, lng: 5.5500,
    malus: ["Les robots ont mangé mes chaussettes", "Dans 20-30 ans y en aura plus", "Skibidi tentafruit", "+1000 aura", "Bismillah, c’est les ténèbres"] },
  { nom: "Emotion", lieu: "Epreuve 2", lat: 51.0680, lng: 5.5560,
    malus: ["Colère", "Tristesse", "Joie", "Peur", "Surprise"] },
  { nom: "Matériel", lieu: "Epreuve 3", lat: 51.0650, lng: 5.5570,
    malus: ["Objet Bala", "Objet Seeonee", "Objet PDH", "Objet Agoja", "Objet Pionniers"] },
  { nom: "Textile", lieu: "Epreuve 4", lat: 51.0640, lng: 5.5510,
    malus: ["Malus 4.1", "Malus 4.2", "Malus 4.3", "Malus 4.4", "Malus 4.5"] },
  { nom: "Audio", lieu: "Epreuve 5", lat: 51.0650, lng: 5.5440,
    malus: ["GIMS - CIEL", "Rassemblement baladins", "Charger - Triangle des Bermudes", "Soleil Bleu", "Les démons de minuit"] },
];

window.KM_MAX = 500;
