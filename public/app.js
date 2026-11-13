// ASBot — affiche les postes du groupe (feuille Google « Posts mensuels » publiée en CSV).
// Dans Zoom, met en évidence la ligne de la personne qui regarde.

// Servie par functions/sheet.js sur le même domaine : le navigateur intégré
// de Zoom n'a pas à joindre Google directement.
const SHEET_CSV = "/sheet";

// RFC 4180 : guillemets, virgules et retours de ligne dans les cellules.
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function firstWord(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim().split(/[\s.,]+/)[0] || "";
}

// Lignes utiles : un titre de poste non vide.
function cleanRows(rows) {
  const [head = [], ...body] = rows;
  return {
    head: head.map((h) => h.trim()),
    body: body.filter((r) => (r[0] || "").trim() !== ""),
  };
}

// Colonnes de personnes : toutes sauf la première (titre du poste).
function rowsFor(name, body) {
  const me = firstWord(name);
  if (!me) return [];
  return body.filter((r) => r.slice(1).some((c) => firstWord(c) === me));
}

async function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

// Texte copié par « Partager ASBot » quand l'invitation Zoom n'est pas possible.
const SHARE_TEXT = "ASBot — les postes du groupe et les messages pour le chat : https://asbot.pages.dev";

// Renvoie { sdk, user, where } dans Zoom, sinon null.
// where = endroit où Zoom dit que l'app tourne (ex. "inMeeting", "inMainClient"), s'il le dit.
async function zoomContext() {
  if (typeof zoomSdk === "undefined") return null;
  try {
    const cfg = await withTimeout(zoomSdk.config({
      capabilities: ["getUserContext", "openUrl", "sendAppInvitationToAllParticipants", "sendMessageToChat"],
    }), 2500);
    const user = await withTimeout(zoomSdk.getUserContext(), 2500);
    return { sdk: zoomSdk, user, where: cfg && cfg.runningContext };
  } catch {
    return null;
  }
}

function render(table, head, body, mine) {
  table.replaceChildren();
  const thead = table.createTHead().insertRow();
  head.forEach((h) => { const th = document.createElement("th"); th.textContent = h; thead.appendChild(th); });
  const tbody = table.createTBody();
  body.forEach((r) => {
    const tr = tbody.insertRow();
    if (mine.includes(r)) tr.className = "mine";
    head.forEach((_, i) => { tr.insertCell().textContent = (r[i] || "").trim(); });
  });
  table.hidden = false;
}

// Envoie le texte dans le chat de la réunion ; sinon le copie (hors réunion, hors Zoom).
async function sendOrCopy(item, zoomPromise, statusEl, previewEl) {
  const zoom = await zoomPromise;
  if (zoom) {
    try {
      await zoom.sdk.sendMessageToChat({ message: item.text });
      statusEl.textContent = "Envoyé dans le chat : " + item.label;
      return;
    } catch { /* pas en réunion ou API non activée : on copie */ }
  }
  await copyText(item.text, item.label, statusEl, previewEl);
}

// Copie le texte ; si la copie est refusée, le sélectionne pour un Ctrl+C manuel.
async function copyText(text, label, statusEl, previewEl) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = "Copié : " + label + ". Colle-le dans le chat (Ctrl+V).";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(previewEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    statusEl.textContent = "Texte sélectionné : fais Ctrl+C, puis colle-le dans le chat.";
  }
}

// « Partager ASBot », pour tout membre : dans une réunion, Zoom invite tous les participants
// à ouvrir ASBot ; ailleurs (Linux, navigateur, ou si Zoom refuse) on copie SHARE_TEXT.
async function shareApp(zoomPromise, statusEl, previewEl) {
  const zoom = await zoomPromise;
  if (zoom && zoom.where !== "inMainClient") {
    try {
      await zoom.sdk.sendAppInvitationToAllParticipants();
      statusEl.textContent = "Invitation ASBot envoyée à tous les participants.";
      return;
    } catch { /* pas en réunion, client sans invitation, ou refus de Zoom : on copie */ }
  }
  await copyText(SHARE_TEXT, "Partager ASBot", statusEl, previewEl);
}

// Un bouton par message de public/messages.json.
async function setupMessages(zoomPromise) {
  const box = document.getElementById("messages");
  const status = document.getElementById("sent");
  try {
    const res = await fetch("/messages.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    (await res.json()).forEach((item) => {
      const row = document.createElement("div");
      row.className = "msg";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = item.label;
      const preview = document.createElement("p");
      preview.className = "preview";
      preview.textContent = item.text;
      btn.addEventListener("click", () => sendOrCopy(item, zoomPromise, status, preview));
      row.append(btn, preview);
      box.appendChild(row);
    });
  } catch (e) {
    status.textContent = "Messages indisponibles (" + e.message + ").";
  }
}

async function main() {
  const $ = (id) => document.getElementById(id);
  $("today").textContent = new Date().toLocaleDateString("fr-CA", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const zoomPromise = zoomContext();
  setupMessages(zoomPromise);
  $("share-text").textContent = SHARE_TEXT;
  $("share").addEventListener("click", () => shareApp(zoomPromise, $("sent"), $("share-text")));

  let head, body;
  try {
    const res = await fetch(SHEET_CSV, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    ({ head, body } = cleanRows(parseCsv(await res.text())));
    $("status").textContent = "";
  } catch (e) {
    $("status").textContent = "Impossible de lire la feuille des postes (" + e.message + "). Utilise le lien « Feuille complète ».";
    return;
  }

  const zoom = await zoomPromise;
  const mine = zoom ? rowsFor(zoom.user.screenName, body) : [];
  render($("postes"), head, body, mine);

  if (zoom) {
    const name = zoom.user.screenName || "";
    if (mine.length) {
      $("me").textContent = "Bonjour " + name + " — ton poste : " + mine.map((r) => r[0].trim()).join(", ");
      $("me").hidden = false;
    }
    if (["host", "coHost"].includes(zoom.user.role)) {
      $("invite").hidden = false;
      $("invite").addEventListener("click", () => {
        zoom.sdk.sendAppInvitationToAllParticipants().catch(() => {});
      });
    }
    // Dans Zoom, les liens externes s'ouvrent dans le navigateur.
    document.querySelectorAll("a.link").forEach((a) => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        zoom.sdk.openUrl({ url: a.href }).catch(() => {});
      });
    });
  }
}

if (typeof module !== "undefined") module.exports = { parseCsv, cleanRows, rowsFor, firstWord };
else main();
