// Interface joueurs (lecture + défis)
let etat = norm(null);
let monEquipe = "";


// ---- Carte ----
const carte = L.map("carte").setView(window.CARTE_CENTRE, window.CARTE_ZOOM);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(carte);
CATEGORIES.forEach((c, i) => {
  const icone = L.divIcon({ className: "", html: `<div style="background:#0d1426;color:#00e5ff;border:2px solid #00e5ff;box-shadow:0 0 10px #00e5ff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:bold">${i + 1}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
  L.marker([c.lat, c.lng], { icon: icone }).addTo(carte).bindPopup(`<b>Epreuve ${i + 1} : ${esc(c.nom)}</b><br>${esc(c.lieu)}`);
});

// ---- Piste ----
const CHEMIN = "M 50 340 C 330 340, 350 210, 200 205 S 70 70, 350 70";
function dessinerPiste() {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 400 400");
  const mk = (tag, attrs, parent = svg) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el); return el;
  };
  const route = mk("path", { d: CHEMIN, fill: "none",   stroke: "#16254a", "stroke-width": 34, "stroke-linecap": "round" });
    mk("path", { d: CHEMIN, fill: "none", stroke: "#00e5ff", "stroke-width": 2, "stroke-dasharray": "10 10", opacity: .7 });
  const L0 = route.getTotalLength();
  const pt = km => route.getPointAtLength(L0 * km / KM_MAX);
  const normale = km => {
    const a = pt(Math.max(0, km - 2)), b = pt(Math.min(KM_MAX, km + 2));
    const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1;
    return { x: -dy / n, y: dx / n };
  };
  for (let km = 0; km <= KM_MAX; km += 100) {
    const p = pt(km), n = normale(km);
    mk("line", { x1: p.x - n.x * 28, y1: p.y - n.y * 28, x2: p.x + n.x * 28, y2: p.y + n.y * 28, stroke: "#ff2bd6", "stroke-width": 3, "stroke-dasharray": "5 5" });
    const lab = mk("text", { x: p.x + n.x * 42, y: p.y + n.y * 42 + 5, "text-anchor": "middle", "font-size": 18, "font-weight": "bold", fill: "#d6e6ff" });
    lab.textContent = km === 0 ? "Départ" : km === KM_MAX ? "500 km" : km + " km";
  }
  // Équipes : décalage perpendiculaire pour éviter les chevauchements
  EQUIPES.forEach((e, idx) => {
    const km = etat.teams[e.id].km, p = pt(km), n = normale(km), off = (idx - 2) * 17;
    const x = p.x + n.x * off, y = p.y + n.y * off;
    const g = mk("g", {});
    mk("circle", { cx: x, cy: y, r: 15, fill: e.couleur, stroke: "#fff", "stroke-width": 3 }, g);
    const t = mk("text", { x, y: y + 6, "text-anchor": "middle", "font-size": 17, "font-weight": "bold", fill: "#fff", stroke: "#0006", "stroke-width": 0.5 }, g);
    t.textContent = e.icone;
    mk("title", {}, g).textContent = `${e.nom} : ${km} km`;
  });
  document.getElementById("piste").replaceChildren(svg);
  const lg = document.createElement("div");
  lg.className = "rangee";
  lg.innerHTML = [...EQUIPES].sort((a, b) => etat.teams[b.id].km - etat.teams[a.id].km)
    .map(e => `<span style="border-left:6px solid ${e.couleur};padding-left:6px">${badge(e)} ${esc(e.nom)} : <b>${etat.teams[e.id].km} km</b></span>`).join("");
  document.getElementById("piste").appendChild(lg);
}

// ---- Dashboards ----
function dessinerDashboards() {
  document.getElementById("dashboards").innerHTML = EQUIPES.map(e => {
    const t = etat.teams[e.id];
    return `<div class="carte-equipe" style="border-color:${e.couleur}">
      <h3>${badge(e)} ${esc(e.nom)} – ${t.km} km</h3>${htmlMalusEquipe(t)}</div>`;
  }).join("");
}

// ---- Compte d'équipe (mot de passe) ----
let cibleLogin = "";
let msgCompte = "";

function sessionValide() {
  const tid = localStorage.getItem("authEquipe"), h = localStorage.getItem("authHash");
  return tid && etat.auth[tid] && etat.auth[tid].hash === h ? tid : "";
}
function deconnecter() { localStorage.removeItem("authEquipe"); localStorage.removeItem("authHash"); monEquipe = ""; rendre(true); }

function dessinerCompte() {
  const box = document.getElementById("mon-equipe");
  if (monEquipe) {
    const e = equipe(monEquipe);
    box.innerHTML = `<div class="rangee"><span>Connecté : <b>${badge(e)} ${esc(e.nom)}</b></span><button class="ko" id="c-out">Se déconnecter</button></div>`;
    document.getElementById("c-out").onclick = deconnecter;
    return;
  }
  const choix = EQUIPES.map(e => `<button data-id="${e.id}" class="${e.id === cibleLogin ? "sel" : ""}" style="  background:${e.couleur};color:#fff;text-shadow:0 0 2px #000a">${esc(e.nom)}</button>`).join("");
  let form = "";
  if (cibleLogin) {
    const auth = etat.auth[cibleLogin];
    if (!auth) {
      form = `<p class="vide">Cette équipe n'a pas encore de mot de passe : scannez le QR code de votre équipe pour le créer.</p>`;
    } else {
      form = `<div class="rangee"><input type="password" id="c-mdp" placeholder="Mot de passe de l'équipe" autocomplete="current-password"><button class="ok" id="c-login">Se connecter</button></div>`;
    }
  }
  box.innerHTML = `<p>Choisissez votre équipe pour gérer vos échanges :</p><div class="rangee choix-equipes">${choix}</div>${form}<div class="msg">${esc(msgCompte)}</div>`;
  box.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { cibleLogin = b.dataset.id; msgCompte = ""; dessinerCompte(); });
  const ouvrir = async (tid, mdp) => {
    const auth = etat.auth[tid];
    const h = await hacher(tid, auth.salt, mdp);
    if (h !== auth.hash) { msgCompte = "Mot de passe incorrect."; dessinerCompte(); return; }
    localStorage.setItem("authEquipe", tid); localStorage.setItem("authHash", h);
    msgCompte = ""; monEquipe = tid; rendre(true);
  };
  const bl = document.getElementById("c-login");
  if (bl) {
    const go = () => ouvrir(cibleLogin, document.getElementById("c-mdp").value);
    bl.onclick = go;
    document.getElementById("c-mdp").onkeydown = e => { if (e.key === "Enter") go(); };
  }
}

// ---- Défis ----
let msgDefi = "";
function dessinerDefis() {
  const box = document.getElementById("defis-contenu");
  if (!monEquipe) { box.innerHTML = `<p class="vide">Connectez-vous avec le mot de passe de votre équipe (section « Mon équipe ») pour proposer ou accepter un échange.</p>`; return; }
  const autres = EQUIPES.filter(e => e.id !== monEquipe);
  const attente = Object.entries(etat.challenges).filter(([, c]) => c.statut === "attente");
  const recus = attente.filter(([, c]) => c.vers === monEquipe);
  const envoyes = attente.filter(([, c]) => c.de === monEquipe);
  const ph = c => `${badge(equipe(c.de))} <b>${esc(equipe(c.de).nom)}</b> ⇄ ${badge(equipe(c.vers))} <b>${esc(equipe(c.vers).nom)}</b> – catégorie <b>${esc(CATEGORIES[c.cat].nom)}</b>`;
  const nomMalus = (tid, cat) => { const i = etat.teams[tid].malus["c" + cat]; return i === undefined ? "?" : CATEGORIES[cat].malus[i]; };
  const info = c => `<br><small>${esc(equipe(c.de).nom)} donne « ${esc(nomMalus(c.de, c.cat))} », ${esc(equipe(c.vers).nom)} donne « ${esc(nomMalus(c.vers, c.cat))} »</small>`;
  box.innerHTML = `
    <h3>Vous avez gagné un duel ? Proposez un échange</h3>
    <div class="rangee">
      <span>Équipe défiée :</span>
      <select id="d-vers">${autres.map(e => `<option value="${e.id}">${esc(e.nom)}</option>`).join("")}</select>
      <span>Catégorie :</span>
      <select id="d-cat">${CATEGORIES.map((c, i) => `<option value="${i}">${esc(c.nom)}</option>`).join("")}</select>
      <button id="d-go">Proposer l'échange</button>
    </div>
    <div class="msg">${esc(msgDefi)}</div>
    <h3>À accepter (${recus.length})</h3>
    ${recus.map(([id, c]) => `<div class="defi">${ph(c)}${info(c)}
      <div class="rangee"><button class="ok" data-acc="${id}">✅ Accepter</button><button class="ko" data-ref="${id}">❌ Refuser</button></div></div>`).join("") || `<p class="vide">Aucun.</p>`}
    <h3>En attente de réponse (${envoyes.length})</h3>
    ${envoyes.map(([id, c]) => `<div class="defi">${ph(c)}<div class="rangee"><button class="ko" data-ann="${id}">Annuler</button></div></div>`).join("") || `<p class="vide">Aucun.</p>`}`;
  document.getElementById("d-go").onclick = async () => {
    const vers = document.getElementById("d-vers").value, cat = Number(document.getElementById("d-cat").value);
    const r = await DB.mutate(s => Regles.proposerEchange(s, monEquipe, vers, cat));
    msgDefi = r.ok ? "Proposition envoyée !" : (r.error || "Erreur"); dessinerDefis();
  };
  box.querySelectorAll("[data-acc]").forEach(b => b.onclick = async () => { const r = await DB.mutate(s => Regles.repondreEchange(s, b.dataset.acc, true)); if (r.error) { msgDefi = r.error; dessinerDefis(); } });
  box.querySelectorAll("[data-ref]").forEach(b => b.onclick = () => DB.mutate(s => Regles.repondreEchange(s, b.dataset.ref, false)));
  box.querySelectorAll("[data-ann]").forEach(b => b.onclick = () => DB.mutate(s => Regles.annulerEchange(s, b.dataset.ann)));
}

function saisieEnCours(id) {
  const ae = document.activeElement;
  return !!(ae && ae.matches && ae.matches("input,select") && ae.closest("#" + id));
}

let finFermee = false;
function dessinerFin() {
  let ov = document.getElementById("fin");
  const gagne = monEquipe && etat.teams[monEquipe].km >= KM_MAX;
  if (!gagne) { if (ov) ov.remove(); finFermee = false; return; }
  if (finFermee) { if (ov) ov.remove(); return; }
  if (ov) return;
  const e = equipe(monEquipe);
  ov = document.createElement("div"); ov.id = "fin"; document.body.appendChild(ov);
  ov.innerHTML = `<div class="fin-boite">
    <h2>Félicitations, humains ${badge(e)} ${esc(e.nom)} !</h2>
    <p><b>Vous avez réussi à réparer la machine à remonter dans le temps, à récupérer des fragments de créativité et vous êtes maintenant arrivé à votre camp d’entrainement.</b></p>
    <p><b>Mais attention : vous n'avez pas encore gagné.</b></p>
    <p><b>Les robots ont effacé de la mémoire collective la capacité de rêver, de créer, de rire et de penser librement.</b></p>
    <p><b>Vous avez désormais une heure pour assembler tous les fragments récoltés durant votre voyage et créer une œuvre capable de réveiller l'humanité.</b></p>
    <p><b>À 21h30, votre création sera votre seule arme.</b></p>
    <p><b>Ne nous décevez pas. L'avenir de l'humanité repose entre vos mains.</b></p>
    <button id="fin-ok">Fermer</button></div>`;
  document.getElementById("fin-ok").onclick = () => { finFermee = true; ov.remove(); };
}

function rendre(force) {
  monEquipe = sessionValide();
  dessinerFin();
  dessinerPiste(); dessinerDashboards();
  document.getElementById("journal").innerHTML = htmlLog(etat);
  // ne pas écraser une saisie ou une sélection en cours
  if (force || !saisieEnCours("mon-equipe")) dessinerCompte();
  if (force || !saisieEnCours("defis-contenu")) dessinerDefis();
}

DB.subscribe(s => { etat = s; rendre(); });
