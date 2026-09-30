# Mise en route de Morni (sans Mac)

Ce guide liste tout ce qu'il faut configurer **une seule fois**. Compte environ 2 heures.
Toutes les compilations iOS tournent sur GitHub Actions : tu n'as jamais besoin d'un Mac.

> **Règle d'or :** ne colle **jamais** une clé privée dans le chat. Les valeurs secrètes vont
> uniquement dans **GitHub → Settings → Secrets and variables → Actions** (onglet *Secrets*).
> Les valeurs publiques vont dans le même écran, onglet *Variables*.

---

## 0. Choisir les identifiants (5 min)

| Élément | Valeur par défaut | Où la changer |
|---|---|---|
| Nom de l'app | Morni | `ios/project.yml` (`CFBundleDisplayName`) |
| Bundle ID | `app.morni.ios` | variable GitHub `MORNI_BUNDLE_ID` |
| App Group | `group.app.morni.ios` | variable GitHub `MORNI_APP_GROUP` |
| Domaine du site | `morni.app` | variable GitHub `MORNI_WEB_DOMAIN` + `.env` du VPS |

Le bundle ID devient **définitif** dès que la fiche App Store Connect est créée (étape 1.4).

---

## 1. Apple Developer (30 min, sur le web)

### 1.1 Accords et Small Business Program (à faire en premier, la validation prend plusieurs jours)
- [App Store Connect](https://appstoreconnect.apple.com) → **Business** : signe l'accord *Paid Apps*, renseigne la banque et la fiscalité.
- Inscris-toi au [Small Business Program](https://developer.apple.com/app-store/small-business-program/) : la commission passe de 30 % à 15 %.

### 1.2 Identifiants ([developer.apple.com](https://developer.apple.com/account/resources/identifiers/list))
1. **App Groups** → `+` → `group.app.morni.ios`
2. **App IDs** → `+` → *App* :
   - `app.morni.ios` : cocher **App Groups** (choisir le groupe), **Associated Domains**, **Push Notifications**, **Sign In with Apple**
   - `app.morni.ios.widget` : cocher **App Groups** (même groupe)
   - `app.morni.ios.notifications` : cocher **App Groups** (même groupe)
3. Note ton **Team ID** (en haut à droite de la page *Membership*) → variable GitHub `MORNI_TEAM_ID`.

### 1.3 Clés
- **Keys** → `+` → cocher **Apple Push Notifications service (APNs)** → télécharger le `.p8`.
  - Secret GitHub `APNS_KEY_ID` = le Key ID
  - Secret GitHub `APNS_PRIVATE_KEY` = le contenu complet du fichier `.p8` (lignes `BEGIN`/`END` comprises)
- **App Store Connect → Users and Access → Integrations → App Store Connect API** → `+`, rôle **Admin** :
  - Secret `ASC_KEY_ID` = Key ID
  - Secret `ASC_ISSUER_ID` = Issuer ID (en haut de la page)
  - Secret `ASC_KEY_P8` = contenu du fichier `.p8` téléchargé

### 1.4 Fiche de l'app
App Store Connect → **Apps** → `+` → *New App* : plateforme iOS, nom `Morni` (ou `Morni: Couple Selfie Widget` si le nom est pris), langue principale *English (U.S.)*, bundle ID `app.morni.ios`, SKU `morni-ios`.
Ajoute ensuite les langues **French** et **Spanish** (textes prêts dans `marketing/app-store.md`).

### 1.5 Abonnements
Dans la fiche → **Monetization → Subscriptions** → groupe `Morni+` :

| Product ID | Durée | Prix | Offre d'introduction |
|---|---|---|---|
| `morni_plus_annual` | 1 an | 29,99 € | Essai gratuit 3 jours |
| `morni_plus_monthly` | 1 mois | 4,99 € | — |
| `morni_plus_annual_offer` | 1 an | 29,99 € | *Pay up front* : 14,99 € la 1ʳᵉ année (offre de sortie) |

Pense aux captures et à la description de chaque abonnement, sinon Apple refuse la soumission.

---

## 2. Certificats de signature sans Mac (10 min)

On utilise **fastlane match** : il crée le certificat et les profils puis les stocke chiffrés dans un dépôt privé.

1. Crée un dépôt GitHub **privé et vide** : `Torkor29/morni-certificates`.
2. Crée un [token GitHub classique](https://github.com/settings/tokens) avec le scope `repo`.
3. Dans le dépôt Widget-iOS, ajoute les secrets :
   - `MATCH_GIT_URL` = `https://github.com/Torkor29/morni-certificates.git`
   - `MATCH_GIT_BASIC_AUTHORIZATION` = résultat de `echo -n "Torkor29:TON_TOKEN" | base64`
   - `MATCH_PASSWORD` = une phrase de passe longue (garde-la dans un gestionnaire de mots de passe)

---

## 3. Supabase (20 min)

1. Crée un projet sur [supabase.com](https://supabase.com) en région **Frankfurt (eu-central-1)**.
2. Variables GitHub :
   - `SUPABASE_PROJECT_REF` = l'identifiant du projet (dans l'URL `https://<ref>.supabase.co`)
   - `MORNI_SUPABASE_HOST` = `<ref>.supabase.co` (**sans** `https://`)
   - `MORNI_SUPABASE_ANON_KEY` = clé *anon / publishable* (Project Settings → API)
3. Secrets GitHub :
   - `SUPABASE_ACCESS_TOKEN` = [token personnel Supabase](https://supabase.com/dashboard/account/tokens)
   - `SUPABASE_DB_PASSWORD` = mot de passe de la base choisi à la création
   - `CRON_SECRET` = une longue chaîne aléatoire (protège la fonction de rappels)
   - `REVENUECAT_WEBHOOK_AUTH` = une longue chaîne aléatoire (voir étape 5)
4. **Authentication → Providers** :
   - **Apple** : activer, *Client IDs* = `app.morni.ios`
   - **Google** : activer, *Client IDs* = l'ID client iOS de l'étape 4, cocher **Skip nonce check**

Au prochain push sur `main`, le workflow **Backend** applique le schéma, configure les secrets et déploie les fonctions.

---

## 4. Google Sign-In (10 min)

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → *Create credentials* → **OAuth client ID** → type **iOS**, bundle ID `app.morni.ios`.
- Variable `MORNI_GOOGLE_CLIENT_ID` = `xxxx.apps.googleusercontent.com`
- Variable `MORNI_GOOGLE_REVERSED_CLIENT_ID` = `com.googleusercontent.apps.xxxx`

Configure aussi l'écran de consentement OAuth (nom Morni, logo, liens vers `/privacy` et `/terms`).

---

## 5. RevenueCat (15 min)

1. Crée un projet, puis une app **App Store** avec le bundle ID `app.morni.ios`.
2. Relie App Store Connect : clé *In-App Purchase* (App Store Connect → Users and Access → Integrations → In-App Purchase) et clé API App Store Connect.
3. **Entitlement** `premium`, rattaché aux 3 produits.
4. **Offerings** :
   - `default` (courant) : packages *Annual* → `morni_plus_annual` et *Monthly* → `morni_plus_monthly`
   - `exit` : package *Annual* → `morni_plus_annual_offer`
5. **Integrations → Webhooks** : URL `https://<ref>.supabase.co/functions/v1/revenuecat-webhook`, en-tête *Authorization* = la valeur de `REVENUECAT_WEBHOOK_AUTH`.
6. Variable GitHub `MORNI_REVENUECAT_KEY` = la clé SDK publique iOS (`appl_…`).

---

## 6. Site web sur ton VPS (20 min)

1. DNS : un enregistrement **A** `morni.app` (et `www`) vers l'IP du VPS.
2. Sur le VPS : installe Docker (`curl -fsSL https://get.docker.com | sh`), puis :
   ```bash
   sudo mkdir -p /opt/morni/web && sudo chown $USER /opt/morni/web
   ```
3. Crée une clé SSH dédiée au déploiement (`ssh-keygen -t ed25519 -f morni_deploy`), ajoute la clé publique dans `~/.ssh/authorized_keys` du VPS.
4. Secrets GitHub : `VPS_HOST` (IP ou domaine), `VPS_USER`, `VPS_SSH_KEY` (contenu de la clé **privée** `morni_deploy`).
5. Sur le VPS, crée `/opt/morni/web/.env` à partir de `web/.env.example`. Tu y mets notamment `APPLE_TEAM_ID` (liens d'invitation) et `LEGAL_NAME`, `LEGAL_ADDRESS` et `CONTACT_EMAIL` (mentions légales).
6. Push sur `main` → le workflow **Website** envoie le site et lance `docker compose up -d --build`. Caddy obtient le certificat HTTPS tout seul.

> Si le VPS fait déjà tourner un site sur les ports 80/443, supprime le service `caddy` de `web/docker-compose.yml` et fais pointer ton proxy existant vers le port 3000 du conteneur `web`.

---

## 7. Premier TestFlight

0. Le code est sur la branche `claude/morni-mvp` : fusionne-la dans `main` (pull request). Le bouton *Run workflow*
   n'apparaît que pour les workflows présents sur `main`, et c'est ce push qui déploie aussi le backend et le site.
1. GitHub → **Actions → iOS → Run workflow**, sur la branche `main` :
   - la **première fois**, cocher *certificates* **et** *testflight* ;
   - les fois suivantes, seulement *testflight*.
2. 10 à 20 minutes plus tard, le build apparaît dans App Store Connect → **TestFlight**.
3. Ajoute-toi comme testeur interne, installe l'app **TestFlight** sur ton iPhone, puis Morni.
4. Pour tester à deux, ajoute ta ou ton partenaire (ou un ami) comme testeur.

---

## Récapitulatif GitHub

**Variables** : `MORNI_BUNDLE_ID`, `MORNI_APP_GROUP`, `MORNI_TEAM_ID`, `MORNI_WEB_DOMAIN`, `MORNI_SUPABASE_HOST`,
`MORNI_SUPABASE_ANON_KEY`, `MORNI_REVENUECAT_KEY`, `MORNI_GOOGLE_CLIENT_ID`, `MORNI_GOOGLE_REVERSED_CLIENT_ID`,
`SUPABASE_PROJECT_REF` (et optionnellement `VPS_PATH`).

**Secrets** : `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, `MATCH_GIT_URL`, `MATCH_GIT_BASIC_AUTHORIZATION`,
`MATCH_PASSWORD`, `APNS_KEY_ID`, `APNS_PRIVATE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`,
`REVENUECAT_WEBHOOK_AUTH`, `CRON_SECRET`, `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

## Vérifier le backend en local (facultatif)
```bash
cd supabase/tests && npm install && npm test   # 12 vérifications du schéma (Postgres en mémoire)
```
