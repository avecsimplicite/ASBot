# Guide de relève — ASBot

> Dernière mise à jour : 12 novembre 2026.
> Ce guide est la passation du service ASBot. Il est écrit pour la personne qui prend le relais,
> même si elle n'a jamais vu le code. Si quelque chose a changé depuis, corrige ce guide dans le
> même commit que ton changement.

**Ce dépôt est public.** Rien ici ne contient de mot de passe, de jeton (token), de code de
validation ni de nom de membre. Les accès se transmettent de personne à personne (section 4),
jamais par ce fichier, le chat ou un courriel.

---

## En une minute

- **ASBot** est un panneau qui s'ouvre dans Zoom, à côté de la vidéo. Il montre la liste des
  postes de service du groupe (qui fait l'accueil, l'animation, l'affichage…) et quatre boutons
  qui publient dans le chat de la réunion les messages qu'on colle à chaque réunion
  (première étape, 7e Tradition, serviteur à l'affichage, serviteur à l'animation).
- La page vit à **https://asbot.pages.dev**. Elle est publiée automatiquement par Cloudflare
  Pages à chaque changement poussé sur la branche `main` du dépôt GitHub
  **avecsimplicite/ASBot**.
- Pour changer le texte d'un bouton : modifier `public/messages.json`, pousser sur `main`,
  attendre environ 20 secondes, puis dans Zoom : **ASBot → … → Refresh app**.
- Tout est gratuit : GitHub, Cloudflare Pages et l'app Zoom ne coûtent rien au groupe.

---

## 1. Ce qu'est ASBot, et pour qui

ASBot sert le groupe **Avec Simplicité** de Narcotiques Anonymes, et plus précisément le
tableau des **postes mensuels** du groupe (NAAS). Le dépôt a été créé en 2022 avec cette
intention : « un outil pour converser dans une séance Zoom qui peut nous répondre et agir selon
la volonté de la conscience de groupe ». La version actuelle (novembre 2026) en est la première
forme utile :

- chaque membre qui ouvre ASBot dans la réunion voit qui tient quel poste ce mois-ci ;
- si son nom Zoom correspond à un nom du tableau, **sa ligne est surlignée** et ASBot lui dit
  « ton poste : … » ;
- la personne qui anime ou qui tient l'affichage publie les messages habituels d'un clic,
  au lieu de chercher le texte et de le coller.

**C'est un service de groupe, pas l'outil d'une personne.** Les postes tournent, et ASBot doit
pouvoir changer de mains comme n'importe quel autre service. Ce guide est la façon dont le service
se transmet : la personne qui part le met à jour, la personne qui arrive le lit et le corrige
là où il ne correspond plus à la réalité. Nos responsables ne sont que des serviteurs de
confiance ; ils ne gouvernent pas. Les décisions sur ASBot (quels messages, quels boutons)
appartiennent à la conscience de groupe.

**Anonymat.** La page `asbot.pages.dev` est publique sur Internet, comme la feuille Google qu'elle
lit (elle est déjà « publiée sur le Web »). On n'y met donc que des prénoms ou des initiales, jamais
de nom de famille, de numéro de téléphone ni d'adresse. Si la feuille change de forme, vérifie que
cette règle est toujours respectée.

**Autonomie (7e Tradition).** ASBot n'utilise que des offres gratuites et des comptes au nom du
groupe. Aucune contribution extérieure n'est nécessaire pour le faire vivre.

---

## 2. État actuel (12 novembre 2026)

### Ce qui fonctionne, vérifié

| Quoi | Comment ça a été vérifié |
|---|---|
| La page https://asbot.pages.dev est en ligne | Réponse 200, avec les quatre en-têtes de sécurité exigés par Zoom |
| Le tableau des postes se charge depuis la feuille Google | Ouvert dans Zoom de bureau (Linux, onglet Apps de la fenêtre principale) : 5 postes affichés |
| Les quatre boutons de messages s'affichent | Rendu dans Chrome et dans Zoom |
| Hors réunion, un bouton **copie** le texte | Comportement prévu ; il suffit de coller (Ctrl+V) |
| L'app ASBot est installée sur le compte Zoom du groupe | Visible dans **Apps → My apps** de Zoom de bureau |

### Ce qui n'est pas encore fait ou pas encore vérifié

- **Publication dans le chat pendant une vraie réunion** : le code appelle `sendMessageToChat`,
  et l'autorisation est activée dans Zoom, mais personne ne l'a encore essayé dans une réunion
  (il faut Windows ou macOS, voir plus bas).
- **Réunion avec plusieurs participants** : le bouton **Ouvrir pour tout le monde** (visible pour
  l'hôte et les co-hôtes) et le « mode invité » qui permet aux autres comptes d'ouvrir ASBot
  n'ont pas été testés avec de vrais participants.
- **Téléphones** : l'option *Mobile* n'est pas activée dans l'app Zoom. Pour iPhone/iPad,
  Zoom demande en plus un identifiant d'équipe Apple Developer, que le groupe n'a pas.
- **Publication sur le Zoom Marketplace** : l'app est en *brouillon* (Draft), installée seulement
  sur le compte Zoom du groupe par le mode « Local test ». Elle n'est pas publiée.

### La limite Linux et comment la contourner

Zoom ne propose pas les apps **dans la fenêtre de réunion** sur Linux. Sur Linux, ASBot
s'ouvre seulement depuis la fenêtre principale de Zoom (**Apps → My apps → ASBot**), et là,
ses boutons **copient** le texte au lieu de le publier.

Contournements :

1. **Fenêtre principale + coller** : pendant la réunion, ouvrir ASBot depuis la fenêtre principale
   de Zoom, cliquer sur un bouton, puis coller dans le chat de la réunion avec **Ctrl+V**.
2. **Navigateur** : ouvrir https://asbot.pages.dev dans n'importe quel navigateur ; mêmes boutons,
   même copie.
3. **Windows ou macOS** : une personne qui sert depuis Windows ou macOS voit ASBot dans la réunion
   (bouton **Apps** de la barre d'outils, ou **Plus (…) → Apps**), et les boutons publient
   directement dans le chat.

---

## 3. Comment c'est construit

### Le chemin d'un clic

```
Membre dans Zoom ──ouvre──▶ app Zoom « ASBot » (Marketplace, compte du groupe)
                                  │  affiche la page d'accueil (Home URL)
                                  ▼
                     https://asbot.pages.dev   ◀── Cloudflare Pages publie
                                  │                  le dossier public/ du dépôt
                                  │                  avecsimplicite/ASBot (branche main)
                 ┌────────────────┴────────────────┐
                 ▼                                  ▼
     /messages.json (les boutons)      /sheet  (relais, functions/sheet.js)
                                                    │
                                                    ▼
                                  feuille Google « Posts mensuels » (CSV publié)
```

### Organisation du dépôt

```
ASBot/
├── GUIDE-RELEVE.md        ← ce guide
├── README.md              ← présentation courte, renvoie ici
├── functions/
│   └── sheet.js           ← relais /sheet : lit la feuille Google côté serveur
└── public/                ← tout ce qui est publié sur asbot.pages.dev
    ├── index.html         ← la structure de la page (titres, zones, liens du bas)
    ├── app.js             ← ce que fait la page (tableau, surlignage, boutons, Zoom)
    ├── style.css          ← l'apparence (couleurs, tailles, mode sombre)
    ├── messages.json      ← LES MESSAGES DES BOUTONS (le fichier qu'on modifie le plus)
    ├── _headers           ← en-têtes de sécurité exigés par Zoom (ne pas toucher)
    └── oauth/index.html   ← page « ASBot est installé » après l'installation dans Zoom
```

### La page (`public/`)

- `index.html` contient les zones fixes : le titre **Postes du groupe**, la date, le bouton
  **Ouvrir pour tout le monde** (caché sauf pour l'hôte), le tableau, la section
  **Messages pour le chat**, et les liens **Site du groupe** et **Feuille complète**.
- `app.js` fait le travail :
  - il lit la feuille via `/sheet` et dessine le tableau ;
  - dans Zoom, il demande à Zoom le nom de la personne (`getUserContext`) et surligne sa
    ligne. La comparaison se fait sur le **premier mot** du nom, sans accents ni majuscules :
    « Hélène » dans la feuille correspond à « helene B. » dans Zoom (exemple fictif) ;
  - il crée un bouton par entrée de `messages.json`. Dans une réunion, le bouton publie le texte
    dans le chat (`sendMessageToChat`). Ailleurs, il le copie dans le presse-papiers, et si la
    copie est refusée, il sélectionne le texte pour un Ctrl+C manuel ;
  - les liens du bas s'ouvrent dans le navigateur de l'ordinateur (`openUrl`), parce que le
    navigateur intégré de Zoom refuse les sites qui ne sont pas dans sa liste.
- Les fonctions Zoom que la page a le droit d'utiliser sont listées à **deux endroits** qui
  doivent toujours correspondre : la liste `capabilities` dans `app.js`, et la liste des APIs
  dans les réglages de l'app Zoom (section 7). Aujourd'hui : `getUserContext`, `openUrl`,
  `sendAppInvitationToAllParticipants`, `sendMessageToChat`.

### Le relais `/sheet` et la feuille Google

- La feuille lue est **« Posts mensuels »** du groupe NAAS, publiée sur le Web au format CSV.
  Colonnes : `Titre du poste`, `Responsable`, `Adjoint`, `Mentorat`. Seules les lignes dont la
  première colonne est remplie s'affichent.
- `functions/sheet.js` va chercher ce CSV chez Google **depuis le serveur de Cloudflare** et le
  renvoie à l'adresse `https://asbot.pages.dev/sheet`.
- **Pourquoi un relais ?** Google redirige le téléchargement vers un sous-domaine de
  `googleusercontent.com`, et le navigateur intégré de Zoom bloquait cette requête (« Failed to
  fetch »). Avec le relais, la page ne parle qu'à son propre domaine. Ne remets pas l'adresse
  Google directement dans `app.js`.
- Modifier la feuille (changer un responsable) **ne demande aucun changement de code** : la page
  suit toute seule, avec un délai de quelques minutes, parce que Google ne met à jour la version
  publiée qu'environ toutes les 5 minutes.
- L'adresse de la feuille se trouve dans la constante `SHEET_CSV` de `functions/sheet.js`. Le lien
  **Feuille complète** (fin de `index.html`) pointe vers la version HTML de la même feuille.
- Les autres feuilles du groupe (ONQT, Marathon) sont décrites dans le dépôt
  `avecsimplicite/naas`, fichier `groups.config.json`, si on veut un jour en afficher une autre.

### Les en-têtes de sécurité (`public/_headers`)

Zoom refuse d'afficher une page qui n'envoie pas ces quatre en-têtes : `Strict-Transport-Security`,
`X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`. C'est la raison pour
laquelle on n'utilise pas GitHub Pages (qui ne permet pas de les ajouter) mais Cloudflare Pages.

La ligne `Content-Security-Policy` dit aussi d'où la page a le droit de charger quoi :
scripts de la page elle-même et de `appssdk.zoom.us`, styles de la page elle-même, et requêtes
vers la page elle-même. **Si un jour la page doit charger quelque chose d'un autre site**, il faut
l'ajouter ici **et** dans la *Domain allow list* de l'app Zoom (section 7). La meilleure solution
reste presque toujours un relais dans `functions/` comme `/sheet`.

### Cloudflare Pages

| Réglage | Valeur |
|---|---|
| Projet | `asbot`, sur le compte Cloudflare du groupe |
| Adresse | https://asbot.pages.dev |
| Source | GitHub `avecsimplicite/ASBot`, branche de production `main` |
| Framework preset | None |
| Build command | (vide) |
| Build output directory | `public` |
| Fonctions | dossier `functions/` à la racine du dépôt (détecté automatiquement) |

Chaque commit poussé sur `main` déclenche une publication, en ligne environ 15 à 20 secondes plus
tard. Le premier déploiement du 12 novembre (commit `c4cea2a`) apparaît en échec dans la liste :
c'est normal, le dossier `public/` n'existait pas encore.

---

## 4. Comptes et accès

Aucun mot de passe, jeton ou code n'est écrit ici. Ils se transmettent de personne à personne,
selon ce que la conscience de groupe a décidé pour les accès du groupe (par exemple de vive voix,
ou par un gestionnaire de mots de passe partagé). Le **courriel de service du groupe**
(`avecsimplicite@…`, l'adresse complète est connue du serviteur sortant) sert à plusieurs de ces
comptes.

| Service | Compte | Ce qu'il porte pour ASBot | Où vit la connexion aujourd'hui |
|---|---|---|---|
| **GitHub** | `avecsimplicite` | Le dépôt **avecsimplicite/ASBot** (public) ; aussi `avecsimplicite/naas` (les feuilles) | Navigateur : connexion au compte GitHub du groupe. Sur l'ordinateur Eury : un jeton GitHub du compte, rangé dans `/a/src/.mcp.github.as.json` (lisible seulement par l'utilisateur `gmusic`), utilisé par Claude quand il est lancé avec `claude --mcp-config /a/src/.mcp.github.as.json`. Aucun accès `git push` en ligne de commande n'est configuré pour ce compte sur Eury (voir section 6). |
| **Cloudflare** | Compte du groupe (courriel de service) | Le projet Pages **asbot** → `asbot.pages.dev`. L'app GitHub « Cloudflare Pages » est installée sur le compte `avecsimplicite` | https://dash.cloudflare.com, connexion par navigateur |
| **Zoom** | Compte Zoom du groupe (courriel de service) | Les réunions du groupe ; l'app ASBot installée sur ce compte ; l'espace développeur du Marketplace | L'app Zoom de bureau sur Eury est connectée à ce compte. Marketplace : https://marketplace.zoom.us, connexion par navigateur |
| **App Zoom ASBot (celle qui sert)** | App *user-managed*, ID **`LWZN1ZQuS6Ga8cB5D0ARkA`** | Les réglages de la section 7 | Dans le Marketplace, compte Zoom du groupe : https://marketplace.zoom.us/develop/applications/LWZN1ZQuS6Ga8cB5D0ARkA/information?mode=dev |
| **Google** | Le compte Google propriétaire de la feuille et du site du groupe | La feuille « Posts mensuels » et le site https://sites.google.com/jgwill.com/serviteur/accueil | À compléter par le serviteur sortant : quel compte possède la feuille, et qui peut la modifier |

**Ce que la personne qui arrive doit recevoir** (hors de ce dépôt) :

1. l'accès au compte GitHub `avecsimplicite` (ou une invitation comme collaboratrice sur le dépôt) ;
2. l'accès au compte Cloudflare du groupe ;
3. l'accès au compte Zoom du groupe (et donc à son espace développeur) ;
4. le droit de modifier la feuille « Posts mensuels », si elle tient aussi ce tableau ;
5. ce guide.

Quand un accès change de mains, change aussi le mot de passe ou retire l'ancien accès, et
note la date ici.

---

## 5. Modifier ASBot

### 5.1 Changer le texte d'un message ou le nom d'un bouton

Tout est dans **`public/messages.json`**. Chaque bouton est un bloc entre accolades `{ }` :

```json
{
  "label": "7e Tradition",
  "text": "La 7e Tradition nous dit que: ...\n\nhttps://Paypal.me/AvecSimplicite\n\nMerci pour vos contributions!"
}
```

- `label` : le texte écrit **sur le bouton** ;
- `text` : le message **publié dans le chat** (ou copié) ;
- `\n` : un **retour à la ligne** dans le message ; `\n\n` laisse une ligne vide ;
- les guillemets droits `"` entourent chaque valeur. Si le message lui-même contient un guillemet
  droit, écris-le `\"`. Les apostrophes (`'` ou `’`) ne posent aucun problème.

**La façon la plus simple, sans rien installer (navigateur) :**

1. Se connecter à https://github.com avec le compte `avecsimplicite`.
2. Ouvrir https://github.com/avecsimplicite/ASBot/blob/main/public/messages.json
3. Cliquer sur le **crayon** (Edit this file).
4. Modifier le texte, en gardant les guillemets, les virgules et les accolades.
5. Cliquer sur **Commit changes…**, écrire une phrase qui dit ce qui change
   (ex. « Nouveau lien pour la première étape »), laisser **Commit directly to the main branch**,
   puis **Commit changes**.
6. Passer à la section 6.3 (vérifier) puis 6.4 (rafraîchir dans Zoom).

**Depuis l'ordinateur (dossier local) :**

```bash
cd /home/gmusic/salix/repos/ASBot
git pull                                   # partir de la dernière version
nano public/messages.json                  # ou n'importe quel éditeur
python3 -m json.tool public/messages.json > /dev/null && echo "JSON valide"
```

Si la commande `python3 -m json.tool` affiche une erreur, il manque une virgule, une accolade ou
un guillemet : corrige avant de publier. Une erreur dans ce fichier fait disparaître **tous** les
boutons (la page affiche alors « Messages indisponibles »). Le tableau des postes, lui, continue
de fonctionner.

### 5.2 Ajouter (ou retirer) un bouton de message

Même fichier. Copier un bloc `{ ... }` existant, le coller après le dernier, et changer `label`
et `text`. **Entre deux blocs il faut une virgule, après le dernier bloc il n'en faut pas** :

```json
[
  { "label": "Premier bouton", "text": "..." },
  { "label": "Nouveau bouton", "text": "Texte du nouveau message\nhttps://exemple.org" }
]
```

L'ordre des blocs est l'ordre des boutons. Pour retirer un bouton, supprimer son bloc (et la
virgule qui le précède si c'était le dernier). Aucun autre fichier n'est à toucher, ni aucun
réglage Zoom.

### 5.3 Ajouter un nouveau bouton qui fait autre chose

Exemple : un bouton **« Lien de la réunion »** qui publie le lien d'invitation de la réunion en
cours. Trois endroits, dans cet ordre :

1. **`public/index.html`** — ajouter le bouton là où il doit apparaître, par exemple juste sous
   le bouton « Ouvrir pour tout le monde » :

   ```html
   <button id="joinlink" class="btn" hidden>Lien de la réunion</button>
   ```

2. **`public/app.js`** — deux changements :
   - ajouter le nom de la fonction Zoom utilisée à la liste `capabilities` dans `zoomContext()` :

     ```js
     capabilities: ["getUserContext", "openUrl", "sendAppInvitationToAllParticipants",
                    "sendMessageToChat", "getMeetingJoinUrl"],
     ```

   - à la fin de `main()`, dans le bloc `if (zoom) { ... }`, montrer le bouton et dire ce qu'il
     fait :

     ```js
     $("joinlink").hidden = false;
     $("joinlink").addEventListener("click", async () => {
       try {
         const { joinUrl } = await zoom.sdk.getMeetingJoinUrl();
         await zoom.sdk.sendMessageToChat({ message: "Lien de la réunion : " + joinUrl });
       } catch {
         $("sent").textContent = "Disponible seulement pendant une réunion.";
       }
     });
     ```

3. **Réglages de l'app Zoom** — ajouter la même fonction dans la liste des APIs autorisées
   (section 7, « Ajouter une API »). **Sans cette étape, Zoom refuse l'appel**, même si le code
   est juste.

Avant d'utiliser une fonction Zoom, vérifie son nom exact et ce qu'elle renvoie dans la
documentation du SDK : https://appssdk.zoom.us/classes/ZoomSdk.ZoomSdk.html . Dans l'exemple
ci-dessus, `getMeetingJoinUrl` existe bien dans le SDK, mais le nom du champ renvoyé (`joinUrl`)
est à confirmer dans cette documentation avant de publier. La liste **Add APIs** de la section 7
donne aussi une description courte de chaque fonction.

Pour l'apparence, ajouter une classe dans `public/style.css`. Les couleurs sont définies une seule
fois en haut du fichier (`--accent`, `--card`, etc.), avec une version pour le mode sombre ;
réutilise ces variables plutôt que des couleurs en dur.

### 5.4 Ajouter une nouvelle fonction côté serveur (`functions/`)

Quand la page a besoin de données d'un autre site, on ajoute un relais comme `/sheet`, au lieu de
faire charger l'autre site par la page (Zoom le bloquerait, section 3).

- Un fichier `functions/NOM.js` répond à l'adresse `https://asbot.pages.dev/NOM`.
- Modèle à copier : `functions/sheet.js`. Par exemple `functions/onqt.js` pour la feuille ONQT :

  ```js
  const SOURCE = "https://docs.google.com/spreadsheets/d/e/.../pub?gid=...&single=true&output=csv";

  export async function onRequestGet() {
    const upstream = await fetch(SOURCE, { redirect: "follow" });
    if (!upstream.ok) return new Response("Indisponible (" + upstream.status + ")", { status: 502 });
    return new Response(await upstream.text(), {
      headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "public, max-age=60" },
    });
  }
  ```

- Dans `app.js`, la page lit alors `fetch("/onqt")`.
- Pas de réglage Cloudflare à changer : le dossier `functions/` est détecté automatiquement. Le
  quota gratuit de Cloudflare est très au-delà de ce qu'un groupe utilise.
- **Ne jamais mettre de mot de passe ou de clé dans `functions/`** : le dépôt est public. Si un
  jour une clé est nécessaire, elle se range dans Cloudflare (projet `asbot` → *Settings* →
  *Variables and Secrets*), jamais dans le code.

### 5.5 Changer la feuille lue par le tableau

1. Dans Google Sheets : **Fichier → Partager → Publier sur le Web**, choisir l'onglet voulu et le
   format **CSV**, puis copier le lien obtenu.
2. Remplacer la valeur de `SHEET_CSV` dans `functions/sheet.js` par ce lien (en gardant les
   guillemets).
3. Remplacer aussi le lien **Feuille complète** dans `public/index.html` (même lien, avec
   `pubhtml` au lieu de `pub` et sans `output=csv`).
4. Si les colonnes changent, le tableau suit tout seul (il affiche les en-têtes de la feuille). Le
   surlignage cherche le prénom dans toutes les colonnes sauf la première.

### 5.6 Essayer avant de publier

- **Sur l'ordinateur, sans Zoom :**

  ```bash
  cd /home/gmusic/salix/repos/ASBot/public
  python3 -m http.server 8765
  # puis ouvrir http://127.0.0.1:8765 dans un navigateur ; Ctrl+C pour arrêter
  ```

  Les boutons de messages fonctionnent (ils copient). Le tableau affiche une erreur, parce que ce
  petit serveur ne fait pas tourner `functions/` : c'est normal. Pour tout tester localement, y
  compris `/sheet`, utiliser l'outil de Cloudflare : `npx wrangler pages dev public` (depuis le
  dossier du dépôt).

- **En ligne, sans toucher la version du groupe :** pousser sur une autre branche que `main`
  (ex. `essai-bouton`). Cloudflare Pages publie alors une **préversion** à une adresse du type
  `https://essai-bouton.asbot.pages.dev` (réglage par défaut des préversions ; l'adresse exacte
  apparaît dans Cloudflare, *asbot → Deployments*). La version que le groupe voit dans Zoom reste
  celle de `main`. Quand c'est bon, fusionner la branche dans `main`.

---

## 6. Déployer

### 6.1 Enregistrer et pousser le changement (commit + push)

Trois façons, selon où tu travailles. Dans les trois cas, le commit arrive sur la branche `main`
du dépôt `avecsimplicite/ASBot`.

1. **Navigateur GitHub** (section 5.1) : le bouton *Commit changes* fait commit + push d'un coup.
2. **Ligne de commande**, avec un accès au compte `avecsimplicite` configuré sur ta machine
   (clé SSH ajoutée au compte GitHub du groupe, par exemple) :

   ```bash
   cd /home/gmusic/salix/repos/ASBot
   git status --short                        # voir ce qui a changé
   git add public/messages.json              # ajouter SEULEMENT les fichiers modifiés
   git commit -m "Nouveau lien pour la première étape"
   git push origin main
   ```

   Attention sur Eury : les comptes GitHub configurés en ligne de commande sont ceux d'autres
   personnes (`gh` = Gerico1007, `ghm` = gmusic1007), pas `avecsimplicite`. Ne pousse pas ASBot
   avec ces comptes. Le dossier local a été cloné en lecture seule (adresse HTTPS publique).
3. **Avec Claude sur Eury** : lancé avec `claude --mcp-config /a/src/.mcp.github.as.json`, Claude
   dispose de la connexion GitHub du compte `avecsimplicite` (outil `github_as`) et pousse les
   fichiers comme le compte du groupe. C'est ainsi qu'ont été faits les commits de novembre 2026.
   Après un tel push, remettre le dossier local à jour avec `git pull`.

Une raison par commit : un commit = un changement qu'on peut expliquer en une phrase.

### 6.2 Cloudflare Pages publie

Rien à faire : Cloudflare voit le nouveau commit sur `main` et publie le dossier `public/` (et
`functions/`) en 15 à 20 secondes environ. Pour suivre : https://dash.cloudflare.com → compte du
groupe → **Workers & Pages** → **asbot** → **Deployments**. La ligne du haut doit porter le
message de ton commit et l'état *Success*. En cas d'échec, cliquer sur la ligne pour lire le
journal (*build log*).

### 6.3 Vérifier que c'est en ligne

- Ouvrir https://asbot.pages.dev dans un navigateur (forcer le rechargement : **Ctrl+Shift+R**).
- Pour un message : https://asbot.pages.dev/messages.json doit montrer le nouveau texte.
- Pour la feuille : https://asbot.pages.dev/sheet doit montrer le CSV.

### 6.4 Rafraîchir ASBot dans Zoom

Zoom garde l'ancienne version en mémoire. Après chaque changement :

- dans ASBot, cliquer sur **…** (en haut à droite du panneau) → **Refresh app** ;
- ou fermer ASBot et le rouvrir.

Pas besoin de se déconnecter de Zoom, ni de réinstaller l'app.

### 6.5 Revenir en arrière

- **Le plus rapide** : Cloudflare → *asbot* → *Deployments* → sur une publication précédente qui
  marchait, menu **…** → **Rollback to this deployment**. Le site revient en quelques secondes.
  Corriger ensuite le dépôt, sinon le prochain push republiera l'erreur.
- **Dans le dépôt** : `git revert <hash-du-commit-fautif>` puis `git push origin main` (ou, sur
  GitHub, rouvrir le fichier et remettre l'ancien texte).

---

## 7. Les réglages de l'app Zoom (Marketplace)

Où : https://marketplace.zoom.us → connexion avec le compte Zoom du groupe → **Develop** /
**Created apps** → **ASBot** (*User Managed*). Toujours travailler dans l'onglet **Development** :
c'est la configuration qu'utilise l'installation du groupe (*Local test*). L'onglet
**Production** n'est pas configuré ; il ne servira que si le groupe décide un jour de publier
ASBot sur le Marketplace.

### Réglages en place (vérifiés le 12 novembre 2026) — à garder tels quels

| Page | Réglage | Valeur |
|---|---|---|
| — | ID de l'app | `LWZN1ZQuS6Ga8cB5D0ARkA` (c'était le brouillon « General app 834 », renommé ASBot) |
| Basic information | Mode de gestion | **User-managed** (choisi à la création, ne peut plus changer) |
| Basic information | OAuth redirect URL | `https://asbot.pages.dev/oauth` (*strict mode* coché) |
| Basic information | OAuth allow list | `https://asbot.pages.dev/oauth` (suit automatiquement) |
| Features → Surface | Produits | **Meetings** (et Chat, hérité du brouillon) |
| Features → Surface | Home URL | `https://asbot.pages.dev/` |
| Features → Surface | Domain allow list | `asbot.pages.dev`, `appssdk.zoom.us`, `docs.google.com`, `googleusercontent.com`, `sites.google.com` |
| Features → Surface | Zoom App SDK | **activé**, 4 APIs : `getUserContext`, `openUrl`, `sendAppInvitationToAllParticipants`, `sendMessageToChat` |
| Features → Surface | Guest mode | **activé**, avec *Ability to test guest mode* coché |
| Features → Surface | Mobile | désactivé (pas encore fait) |
| Scopes | Scope | **`zoomapp:inmeeting`** (« Enable Zoom App within Zoom Meeting Client ») |
| Local test | Installation | Ajoutée au compte Zoom du groupe (*Remove App* visible) |

**Ce qui ne doit pas changer :**

- **L'ID de l'app et son mode user-managed.** Une nouvelle app oblige à tout refaire et à la
  réinstaller.
- **Le scope `zoomapp:inmeeting`** : sans lui, ASBot n'apparaît pas dans les réunions.
- **Le Guest mode** : c'est lui qui permet aux membres connectés avec d'autres comptes Zoom d'ouvrir
  ASBot quand l'hôte clique **Ouvrir pour tout le monde**.
- **La Home URL et l'OAuth redirect URL** : elles doivent pointer vers `asbot.pages.dev`.
- **La liste des APIs** doit contenir au moins celles de `capabilities` dans `app.js`.

Les petites notes jaunes « *This domain requires review. Briefly explain your reason for using
it* » sous chaque domaine ne concernent que la publication officielle sur le Marketplace. Elles
n'empêchent pas l'app de fonctionner pour le groupe.

### Ajouter une API (quand le code utilise une nouvelle fonction Zoom)

**Features → Surface → Zoom App SDK → Add APIs**, cocher la fonction, **Done**. Le compteur
« N Selected » augmente. Recharger la page pour vérifier que c'est enregistré. Dans Zoom, faire
**… → Refresh app**. Si Zoom refuse encore la fonction, réinstaller : **Local test → Remove App**,
puis **Add app now** → **Allow**.

### L'impasse à éviter : l'ancienne app ASBot de 2022

Le compte a **deux** apps nommées ASBot. Celle de 2022 (ID `9FCuanfvRTifq75SRiAwrQ`, état
« Create request submitted / Update needed », *Account Level*) est **admin-managed**, et ce mode
ne peut pas être changé. Or **Zoom n'affiche jamais une app admin-managed dans l'application
Zoom**, et cette app n'offre même pas le scope `zoomapp:inmeeting`. On y a perdu une partie de la
journée du 12 novembre 2026 : réglages faits, réinstallation, redémarrage de Zoom, et ASBot
n'apparaissait toujours pas.

- Ne pas la modifier, ne pas essayer de la faire marcher.
- Elle est encore installée au niveau du compte. Elle ne gêne rien. La supprimer est une décision
  à prendre en groupe.
- Pour distinguer les deux dans **Created apps** : la bonne est marquée **User Managed** ; la
  vieille, **Account Level**.

---

## 8. Recettes de relance et pièges

Ces recettes concernent l'ordinateur **Eury** (Linux, bureau KDE, écran `:0`). Une personne qui
sert depuis Windows ou macOS n'en a pas besoin.

### 8.1 Relancer Zoom sur Linux

**Depuis le bureau** (une fenêtre Konsole du bureau KDE, ou le menu) : lancer simplement `zoom`.

**Depuis un terminal d'agent ou tmux** (où l'environnement diffère) : Zoom plante au démarrage si la
variable `QT_XCB_GL_INTEGRATION=none` est présente (son journal dit alors *Failed to initialize
graphics backend for OpenGL* et il se ferme). Il faut la retirer :

```bash
# Seulement si aucune réunion n'est en cours : ceci ferme Zoom.
pkill -TERM -x zoom
env -u QT_XCB_GL_INTEGRATION -u QT_DEBUG_PLUGINS DISPLAY=:0 XAUTHORITY="$XA" setsid -f /usr/bin/zoom
```

`$XA` est le fichier d'autorisation de l'écran du bureau. Il change à chaque ouverture de session ;
on le retrouve à partir d'une Konsole ouverte sur l'écran `:0` :

```bash
for p in $(pgrep -x konsole); do tr '\0' '\n' < /proc/$p/environ | grep -q '^DISPLAY=:0$' && \
  tr '\0' '\n' < /proc/$p/environ | grep '^XAUTHORITY='; done | head -1
```

(Le 12 novembre 2026, c'était `/tmp/xauth_dOlkfZ`.) Après un redémarrage de Zoom, ouvrir
**Apps** pour qu'il recharge la liste des apps.

### 8.2 La fenêtre Chrome dédiée aux réglages Zoom (et le piège du trousseau KDE)

Pour les réglages du Marketplace, n'importe quel navigateur connecté au compte Zoom du groupe
suffit. Sur Eury, Claude a utilisé un **profil Chrome séparé**, connecté au compte Zoom du groupe,
qu'il peut piloter (port de débogage `9333`, écouté seulement en local). Ce profil se trouve dans
un dossier **temporaire** de session Claude (sous `/tmp/claude-1000/…/scratchpad/zoom-profile`) :
il disparaîtra au prochain redémarrage de l'ordinateur, et il faudra alors se reconnecter à Zoom.

**Le piège** : sous Linux, Chrome chiffre la connexion enregistrée avec une clé gardée par le
trousseau du bureau. Le profil a été créé depuis le bureau KDE, donc avec **KWallet**. Lancé depuis
tmux, sans les variables du bureau KDE, Chrome va chercher la clé dans le trousseau GNOME : une
fenêtre **« Unlock Keyring » / « Authentication required »** apparaît à l'écran et **toutes les pages
restent bloquées sur « Chargement… »**, même un site sans rapport.

- Ne jamais taper de mot de passe dans cette fenêtre pour « débloquer » : cliquer **Cancel**.
- Relancer Chrome avec les variables du bureau KDE :

```bash
P=/chemin/vers/zoom-profile
env DISPLAY=:0 XAUTHORITY="$XA" \
    XDG_CURRENT_DESKTOP=KDE KDE_FULL_SESSION=true DESKTOP_SESSION=plasma KDE_SESSION_VERSION=5 \
    XDG_SESSION_DESKTOP=KDE XDG_SESSION_TYPE=x11 \
  /opt/google/chrome/chrome --user-data-dir="$P" \
    --remote-debugging-port=9333 --remote-debugging-address=127.0.0.1 \
    --no-first-run --no-default-browser-check --window-size=1400,950 \
    --new-window "https://marketplace.zoom.us/user/build"
```

Signe que tout va bien : l'onglet s'appelle **App Marketplace**, et la page **Created apps** liste
les deux apps ASBot sans demander de connexion.

### 8.3 Rafraîchir l'app dans Zoom

Dans le panneau ASBot : **…** (en haut à droite) → **Refresh app**. Le menu peut s'ouvrir légèrement
en dehors du panneau, à sa droite. Les autres choix sont *Open In New Window* et *Close*.

### 8.4 Autres pièges connus

- **« Impossible de lire la feuille des postes (Failed to fetch) »** dans Zoom : c'était le blocage
  de Google par le navigateur de Zoom, réglé par le relais `/sheet`. Si ça revient : vérifier
  https://asbot.pages.dev/sheet dans un navigateur, puis faire **Refresh app**.
- **ASBot n'apparaît pas dans Apps** : vérifier que c'est le compte Zoom du groupe qui est connecté,
  que c'est l'app *user-managed* qui est installée (section 7), puis redémarrer Zoom.
- **Pas de bouton Apps dans la fenêtre de réunion sur Linux** : limite de Zoom, voir section 2.
- **Tous les boutons de messages ont disparu** : `messages.json` est invalide (virgule, guillemet,
  accolade). Vérifier avec `python3 -m json.tool public/messages.json`.
- **GitHub Pages ne convient pas** pour héberger la page : il n'envoie pas les en-têtes exigés par
  Zoom, et on ne peut pas les y ajouter. (Le brouillon d'app d'avril 2026 pointait vers
  `avecsimplicite.github.io/naas/minimal` ; c'est ce brouillon qui est devenu l'ASBot actuel.)

---

## 9. Où se trouvent les choses

| Quoi | Où |
|---|---|
| Le code (source de vérité) | https://github.com/avecsimplicite/ASBot (branche `main`) |
| La page en ligne | https://asbot.pages.dev |
| Les messages des boutons | https://github.com/avecsimplicite/ASBot/blob/main/public/messages.json |
| La copie locale sur Eury | `/home/gmusic/salix/repos/ASBot` |
| La feuille des postes | « Posts mensuels » (NAAS), version lisible : lien **Feuille complète** en bas d'ASBot |
| Le site du groupe | https://sites.google.com/jgwill.com/serviteur/accueil |
| Les autres feuilles du groupe | `avecsimplicite/naas`, fichier `groups.config.json` |
| La publication | Cloudflare → Workers & Pages → `asbot` |
| L'app Zoom qui sert | Marketplace → Created apps → ASBot (*User Managed*), ID `LWZN1ZQuS6Ga8cB5D0ARkA` |
| La mémoire de projet de Claude sur Eury | `/home/gmusic/.claude/projects/-home-gmusic/memory/project_asbot_zoom_panel.md` (notes de l'assistant ; ce guide fait foi pour le groupe) |
| Le jeton GitHub du compte du groupe pour Claude | `/a/src/.mcp.github.as.json` sur Eury (ne jamais le copier ailleurs ni l'afficher) |

---

## 10. Tâches en suspens

- [ ] **Tester dans une vraie réunion depuis Windows ou macOS** : publier un message avec un bouton ;
      faire **Ouvrir pour tout le monde** et vérifier qu'un participant d'un autre compte peut
      ouvrir ASBot.
- [ ] **Activer Mobile** (Android d'abord ; iPhone/iPad demande un identifiant Apple Developer).
- [ ] **Ancienne app ASBot 2022** : régénérer son *client secret* de développement (il est apparu
      dans le journal d'une session de travail le 12 novembre 2026), puis décider en groupe si on
      la supprime.
- [ ] **Cloudflare ↔ GitHub** : l'app GitHub « Cloudflare Pages » a accès à tous les dépôts du
      compte `avecsimplicite`. La limiter à ASBot : GitHub → *Settings* → *Applications* →
      *Cloudflare Pages* → *Configure* → *Only select repositories*.
- [ ] **Section 4** : compléter quel compte Google possède la feuille « Posts mensuels », et
      comment les accès du groupe se transmettent.

---

## Historique

| Commit | Date | Ce qui a changé |
|---|---|---|
| `770a7b0`, `8264fbd`, `c4cea2a` | avril 2022 | Création du dépôt, intention, essai de vérification de domaine Zoom |
| `7f86c13` | 12 nov. 2026 | Première page : tableau des postes, en-têtes de sécurité, page d'installation |
| `34221a8` | 12 nov. 2026 | Relais `/sheet` (le navigateur de Zoom bloquait Google) |
| `1dce646` | 12 nov. 2026 | Quatre boutons de messages pour le chat (`messages.json`) |
| (ce commit) | 12 nov. 2026 | Ce guide de relève |
