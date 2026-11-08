// Logique partagée : état, base de données, règles du jeu.
const EQUIPES = window.EQUIPES, CATEGORIES = window.CATEGORIES, KM_MAX = window.KM_MAX;

function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const equipe = id => EQUIPES.find(e => e.id === id);
const cleMalus = (cat, i) => `c${cat}_${i}`;

// Garantit une structure complète (Firebase supprime les objets vides).
function norm(s) {
  s = s || {};
  s.teams = s.teams || {};
  EQUIPES.forEach(e => {
    const t = s.teams[e.id] = s.teams[e.id] || {};
    t.km = Number(t.km) || 0;
    t.malus = t.malus || {};
    t.special = t.special || {};
  });
  s.assigned = s.assigned || {};
  s.challenges = s.challenges || {};
  s.log = s.log || {};
  s.auth = s.auth || {};
  return s;
}

// Mot de passe d'équipe : hachage SHA-256 salé (repli simple si crypto.subtle indisponible).
async function hacher(tid, salt, mdp) {
  const txt = `${salt}:${tid}:${mdp}`;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 5381;
  for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
  return "f" + (h >>> 0).toString(16);
}
const selAleatoire = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function addLog(s, texte) {
  const k = String(Date.now()) + Math.random().toString(36).slice(2, 5);
  s.log[k] = texte;
  const keys = Object.keys(s.log).sort();
  keys.slice(0, Math.max(0, keys.length - 100)).forEach(x => delete s.log[x]);
}

// ---- Accès aux données ----
const DB = (() => {
  const cfg = window.FIREBASE_CONFIG;
  const useFirebase = cfg && cfg.databaseURL;
  if (useFirebase) {
    firebase.initializeApp(cfg);
    const ref = firebase.database().ref("state");
    return {
      mode: "firebase",
      subscribe: cb => ref.on("value", snap => cb(norm(snap.val()))),
      mutate: fn => {
        let err = null;
        return ref.transaction(cur => {
          err = null;
          const s = norm(cur);
          err = fn(s) || null;
          if (err) return; // annule
          return s;
        }).then(r => (err ? { ok: false, error: err } : { ok: r.committed }));
      },
    };
  }
  const KEY = "jeu_state";
  const load = () => { try { return norm(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return norm(null); } };
  const subs = [];
  window.addEventListener("storage", e => { if (e.key === KEY) subs.forEach(cb => cb(load())); });
  return {
    mode: "local",
    subscribe: cb => { subs.push(cb); cb(load()); },
    mutate: fn => {
      const s = load();
      const err = fn(s);
      if (err) return Promise.resolve({ ok: false, error: err });
      localStorage.setItem(KEY, JSON.stringify(s));
      subs.forEach(cb => cb(s));
      return Promise.resolve({ ok: true });
    },
  };
})();

// ---- Règles du jeu (utilisées dans les transactions) ----
const Regles = {
  ajouterKm(s, tid, delta) {
    const t = s.teams[tid];
    t.km = Math.max(0, Math.min(KM_MAX, t.km + delta));
    addLog(s, `${equipe(tid).nom} : ${delta > 0 ? "+" : ""}${delta} km (total ${t.km})`);
  },
  ajouterMalus(s, tid, cat, i) {
    const k = cleMalus(cat, i), t = s.teams[tid];
    if (s.assigned[k]) return "Ce malus est déjà attribué.";
    if (t.malus["c" + cat] !== undefined) return "Cette équipe a déjà un malus dans cette catégorie. Utilisez la catégorie spéciale.";
    s.assigned[k] = tid;
    t.malus["c" + cat] = i;
    addLog(s, `${equipe(tid).nom} reçoit « ${CATEGORIES[cat].malus[i]} » (${CATEGORIES[cat].nom})`);
  },
  retirerMalus(s, tid, cat) {
    const t = s.teams[tid], i = t.malus["c" + cat];
    if (i === undefined) return "Malus introuvable.";
    delete t.malus["c" + cat];
    delete s.assigned[cleMalus(cat, i)];
    addLog(s, `${equipe(tid).nom} perd « ${CATEGORIES[cat].malus[i]} »`);
  },
  ajouterSpecial(s, tid, texte) {
    texte = (texte || "").trim();
    if (!texte) return "Texte vide.";
    s.teams[tid].special["s" + Date.now() + Math.random().toString(36).slice(2, 5)] = texte;
    addLog(s, `${equipe(tid).nom} reçoit un malus spécial : « ${texte} »`);
  },
  retirerSpecial(s, tid, sid) {
    const txt = s.teams[tid].special[sid];
    if (txt === undefined) return "Malus introuvable.";
    delete s.teams[tid].special[sid];
    addLog(s, `${equipe(tid).nom} perd le malus spécial « ${txt} »`);
  },
  proposerEchange(s, de, vers, cat) {
    if (de === vers) return "Choisissez une autre équipe.";
    if (s.teams[de].malus["c" + cat] === undefined) return "Votre équipe n'a pas de malus dans cette catégorie.";
    if (s.teams[vers].malus["c" + cat] === undefined) return "L'autre équipe n'a pas de malus dans cette catégorie.";
    const dup = Object.values(s.challenges).some(c => c.statut === "attente" && c.cat === cat &&
      [c.de, c.vers].some(x => x === de || x === vers));
    if (dup) return "Un échange est déjà en attente pour cette catégorie et l'une de ces équipes.";
    const id = "d" + Date.now() + Math.random().toString(36).slice(2, 5);
    s.challenges[id] = { de, vers, cat, statut: "attente", t: Date.now() };
    addLog(s, `${equipe(de).nom} propose un échange « ${CATEGORIES[cat].nom} » à ${equipe(vers).nom}`);
  },
  repondreEchange(s, id, accepte) {
    const c = s.challenges[id];
    if (!c || c.statut !== "attente") return "Défi introuvable ou déjà traité.";
    if (accepte) {
      const a = s.teams[c.de], b = s.teams[c.vers], k = "c" + c.cat;
      if (a.malus[k] === undefined || b.malus[k] === undefined) { c.statut = "annule"; return "Un des malus n'existe plus : échange annulé."; }
      const ia = a.malus[k], ib = b.malus[k];
      a.malus[k] = ib; b.malus[k] = ia;
      s.assigned[cleMalus(c.cat, ia)] = c.vers;
      s.assigned[cleMalus(c.cat, ib)] = c.de;
      c.statut = "accepte";
      addLog(s, `Échange accepté « ${CATEGORIES[c.cat].nom} » : ${equipe(c.de).nom} ⇄ ${equipe(c.vers).nom}`);
    } else {
      c.statut = "refuse";
      addLog(s, `${equipe(c.vers).nom} refuse l'échange proposé par ${equipe(c.de).nom}`);
    }
    // ne garder que les 20 derniers défis traités
    const done = Object.keys(s.challenges).filter(x => s.challenges[x].statut !== "attente").sort();
    done.slice(0, Math.max(0, done.length - 20)).forEach(x => delete s.challenges[x]);
  },
  annulerEchange(s, id) {
    if (s.challenges[id]) delete s.challenges[id];
  },
  definirMotDePasse(s, tid, salt, hash) {
    if (s.auth[tid]) return "Cette équipe a déjà un mot de passe.";
    s.auth[tid] = { salt, hash };
    addLog(s, `${equipe(tid).nom} a activé son accès`);
  },
};

function htmlMalusEquipe(t) {
  const items = [];
  CATEGORIES.forEach((c, ci) => {
    const i = t.malus["c" + ci];
    if (i !== undefined) items.push(`<li><span class="cat">${esc(c.nom)}</span> ${esc(c.malus[i])}</li>`);
  });
  Object.values(t.special).forEach(txt => items.push(`<li class="special"><span class="cat">★ Spécial</span> ${esc(txt)}</li>`));
  return items.length ? `<ul class="malus">${items.join("")}</ul>` : `<p class="vide">Aucun malus 🎉</p>`;
}

function heure(k) {
  const d = new Date(parseInt(k.slice(0, 13), 10));
  return isNaN(d) ? "" : d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

function htmlLog(s, n = 15) {
  const keys = Object.keys(s.log).sort().reverse().slice(0, n);
  return keys.length ? `<ul class="log">${keys.map(k => `<li><span class="heure">${heure(k)}</span> ${esc(s.log[k])}</li>`).join("")}</ul>` : `<p class="vide">Rien pour l'instant.</p>`;
}
