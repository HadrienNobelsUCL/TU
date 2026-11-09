// Interface maîtres du jeu (mini-jeux, gentils et méchants : même interface)
let etat = norm(null);
let equipeSel = "";
let catSel = null;
let message = "";


function connecte() { return sessionStorage.getItem("maitre") === "1"; }
function afficher() {
  document.getElementById("login").hidden = connecte();
  document.getElementById("panneau").hidden = !connecte();
}
document.getElementById("pin-go").onclick = () => {
  if (document.getElementById("pin").value === window.PIN_MAITRE) { sessionStorage.setItem("maitre", "1"); afficher(); rendre(); }
  else document.getElementById("pin-msg").textContent = "Code incorrect.";
};
document.getElementById("pin").onkeydown = e => { if (e.key === "Enter") document.getElementById("pin-go").click(); };

async function agir(fn, ok) {
  const r = await DB.mutate(fn);
  message = r.ok ? (ok || "") : (r.error || "Erreur, réessayez.");
  rendre();
}

function rendre() {
  afficher();
  if (!connecte()) return;
  const box = document.getElementById("choix-equipe");
  box.innerHTML = EQUIPES.map(e =>
    `<button data-id="${e.id}" class="${e.id === equipeSel ? "sel" : ""}" style="background:${e.couleur};color:#fff;text-shadow:0 0 2px #000a">${esc(e.nom)} (${etat.teams[e.id].km} km)</button>`).join("");
  box.querySelectorAll("button").forEach(b => b.onclick = () => { equipeSel = b.dataset.id; catSel = null; message = ""; rendre(); });
  document.getElementById("journal").innerHTML = htmlLog(etat, 25);

  const act = document.getElementById("actions");
  if (!equipeSel) { act.innerHTML = ""; return; }
  const t = etat.teams[equipeSel], e = equipe(equipeSel);

  const retraits = [];
  CATEGORIES.forEach((c, ci) => {
    const i = t.malus["c" + ci];
    if (i !== undefined) retraits.push(`<div class="rangee"><span><b>${esc(c.nom)}</b> : ${esc(c.malus[i])}</span><button class="ko" data-rm="${ci}">Retirer</button></div>`);
  });
  Object.entries(t.special).forEach(([sid, txt]) => retraits.push(`<div class="rangee"><span><b>★ Spécial</b> : ${esc(txt)}</span><button class="ko" data-rs="${sid}">Retirer</button></div>`));

  let listeMalus = "";
  if (catSel !== null) {
    const deja = t.malus["c" + catSel] !== undefined;
    listeMalus = deja
      ? `<p class="msg">${esc(e.nom)} a déjà un malus « ${esc(CATEGORIES[catSel].nom)} » : utilisez un malus spécial ci-dessous.</p>`
      : `<div class="liste-malus rangee">${CATEGORIES[catSel].malus.map((m, i) => {
          const pris = etat.assigned[cleMalus(catSel, i)];
          return `<button data-add="${i}" ${pris ? "disabled" : ""}>${esc(m)}${pris ? ` (déjà à ${esc(equipe(pris).nom)})` : ""}</button>`;
        }).join("")}</div>`;
  }

  act.innerHTML = `
    <section style="border-left:8px solid ${e.couleur}"><h2>${badge(e)} ${esc(e.nom)} – ${t.km} km</h2>
      <h3>2. Kilomètres</h3>
      <div class="rangee">
        <select id="km-signe" style="flex:0 0 80px"><option value="1">+</option><option value="-1">−</option></select>
        <input type="number" id="km-libre" min="1" placeholder="Nombre de km" inputmode="numeric" style="flex:1;min-width:120px">
        <button class="ok" id="km-ok">Appliquer</button></div>
      <h3>3. Ajouter un malus</h3>
      <div class="rangee">${CATEGORIES.map((c, ci) => `<button data-cat="${ci}" style="${catSel === ci ? "outline:3px solid #ffd166" : ""}">${esc(c.nom)}${t.malus["c" + ci] !== undefined ? " ✔" : ""}</button>`).join("")}</div>
      ${listeMalus}
      <h3>Malus spécial (texte libre, non échangeable)</h3>
      <div class="rangee"><input type="text" id="spec-txt" placeholder="Ex : Parler en rimes pendant 10 min" style="flex:1;min-width:200px"><button id="spec-ok">Ajouter</button></div>
      <h3>Malus actuels</h3>
      ${retraits.join("") || `<p class="vide">Aucun.</p>`}
      <div class="msg">${esc(message)}</div>
    </section>`;

  document.getElementById("km-ok").onclick = () => {
    const v = Math.abs(parseInt(document.getElementById("km-libre").value, 10));
    const signe = Number(document.getElementById("km-signe").value);
    if (v) agir(s => Regles.ajouterKm(s, equipeSel, signe * v));
  };
  act.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { catSel = Number(b.dataset.cat); message = ""; rendre(); });
  act.querySelectorAll("[data-add]").forEach(b => b.onclick = () => { const c = catSel; catSel = null; agir(s => Regles.ajouterMalus(s, equipeSel, c, Number(b.dataset.add))); });
  act.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => agir(s => Regles.retirerMalus(s, equipeSel, Number(b.dataset.rm))));
  act.querySelectorAll("[data-rs]").forEach(b => b.onclick = () => agir(s => Regles.retirerSpecial(s, equipeSel, b.dataset.rs)));
  document.getElementById("spec-ok").onclick = () => {
    const txt = document.getElementById("spec-txt").value;
    agir(s => Regles.ajouterSpecial(s, equipeSel, txt));
  };
}

DB.subscribe(s => {
  etat = s;
  const ae = document.activeElement;
  if (ae && (ae.id === "spec-txt" || ae.id === "km-libre" || ae.id === "km-signe")) return; // ne pas perdre la saisie
  rendre();
});
afficher();
