// Page d'activation (QR code) : création du mot de passe d'équipe uniquement.
const tid = new URLSearchParams(location.search).get("equipe");
const eq = EQUIPES.find(e => e.id === tid);
const box = document.getElementById("contenu");
let cree = false, enCours = false, msg = "";

function connecter(a) {
  localStorage.setItem("authEquipe", eq.id);
  localStorage.setItem("authHash", a.hash);
}

function dessiner(s) {
  if (!eq) { box.innerHTML = `<p class="msg">QR code invalide.</p>`; return; }
  if (cree) {
    box.innerHTML = `<h2>✅ Mot de passe créé !</h2>
      <p>Vous êtes connecté. Notez bien le mot de passe et partagez-le avec les membres de <b>${esc(eq.nom)}</b> : il sera demandé si vous vous reconnectez sur un autre appareil.</p>
      <a href="index.html"><button class="ok">Aller sur le site</button></a>`;
    return;
  }
  if (enCours) return;
  if (s.auth[eq.id]) { connecter(s.auth[eq.id]); location.replace("index.html"); return; } // déjà activé : connexion + site
  box.innerHTML = `<h2 style="color:${eq.couleur}">${badge(eq)} ${esc(eq.nom)}</h2>
    <p>Bienvenue ! Commencez par créer le mot de passe de votre équipe.</p>
    <div class="rangee"><input type="password" id="mdp" placeholder="Mot de passe (4 caractères min.)" autocomplete="new-password">
    <input type="password" id="mdp2" placeholder="Confirmer le mot de passe" autocomplete="new-password">
    <button class="ok" id="creer">Créer le mot de passe</button></div><div class="msg">${esc(msg)}</div>`;
  document.getElementById("creer").onclick = async () => {
    const m1 = document.getElementById("mdp").value, m2 = document.getElementById("mdp2").value;
    if (m1.length < 4) { msg = "Mot de passe trop court (4 caractères minimum)."; dessiner(s); return; }
    if (m1 !== m2) { msg = "Les mots de passe ne correspondent pas."; dessiner(s); return; }
    const salt = selAleatoire(), hash = await hacher(eq.id, salt, m1);
    enCours = true;
    const r = await DB.mutate(st => Regles.definirMotDePasse(st, eq.id, salt, hash));
    enCours = false;
    if (!r.ok) { msg = r.error || "Erreur, réessayez."; dessiner(s); return; }
    connecter({ hash });
    cree = true; dessiner(s);
  };
}

let dernier = norm(null);
DB.subscribe(s => {
  dernier = s;
  const ae = document.activeElement;
  if (ae && ae.matches && ae.matches("input") && !cree) return; // ne pas perdre la saisie
  dessiner(s);
});
