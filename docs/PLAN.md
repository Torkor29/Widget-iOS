# Morni — plan produit

> Un selfie par jour, directement sur l'écran d'accueil de ta moitié.

## Décisions validées
| Sujet | Choix |
|---|---|
| Nom (provisoire) | **Morni**, à vérifier : App Store, domaine, INPI/EUIPO |
| Connexion | Sign in with Apple + Google |
| Prix | Annuel **29,99 €** (essai 3 jours) · Mensuel **4,99 €** · offre de sortie 14,99 € la 1ʳᵉ année |
| Partage | Un abonnement débloque Morni+ **pour les deux** partenaires |
| Langues | Anglais, français, espagnol |
| Backend | Supabase (UE, Francfort) |
| Site | Next.js sur le VPS (Docker + Caddy) |
| Build iOS | GitHub Actions + fastlane, **sans Mac** |

## Direction artistique « Morning Glow »
- Palette : crème `#FFF6EF`, pêche `#FFB38A`, corail `#FF6B81`, lilas `#B9A6FF`, prune `#2B1033`, or `#FFC24B`.
- Titres en serif éditoriale (New York dans l'app, Fraunces sur le site), interface en SF Pro Rounded / Inter.
- 12 **moods originaux** façon stickers (`design/moods/`) : 6 gratuits, 6 Morni+.
- Icône : deux petits soleils qui se lèvent ensemble ; leur intersection brille en doré.

## Ce qui est construit (MVP)
- **App iOS** : connexion Apple/Google, prénom, invitation par lien ou code, caméra frontale avec moods et légende, accueil (selfie de l'autre, réactions, « tu me manques », série, jours ensemble), souvenirs (7 jours gratuits), réglages (rappel, dates, abonnement, déconnexion, suppression de compte), paywall + offre de sortie.
- **Widgets** : son selfie (petit / grand), vous deux (moyen), écran verrouillé (rectangulaire, circulaire, en ligne), StandBy.
- **Mise à jour instantanée** : notification → extension qui télécharge la photo → widget rechargé. Filet de sécurité : le widget interroge `widget-feed` toutes les 30 min.
- **Backend** : schéma + RLS testés, séries, limite gratuite 1/jour, premium partagé, fonctions (post-drop, react, accept-invite, unpair, delete-account, revenuecat-webhook, daily-reminder, widget-feed).
- **Site** : landing EN/FR/ES, liste d'attente, pages d'invitation avec aperçu personnalisé, confidentialité / CGU / aide, fichier universal links.

## Prochaines étapes
1. Toi : configuration (voir `docs/SETUP.md`).
2. Premier build TestFlight, tests à deux pendant quelques jours.
3. Captures App Store et vidéo de preview.
4. Bêta avec 20 à 50 couples (liste d'attente + TikTok).
5. Soumission à Apple, puis lancement.

## V2 (après les premiers retours)
- Push widgets iOS 26 (mise à jour même sans notification visible).
- Gel de série (Morni+), dessins et stickers sur la photo, Live Photos.
- Récap vidéo du mois, distance entre vous.
- Packs saisonniers (Saint-Valentin, Noël), codes cadeaux.
- Android (widget Glance) si la liste d'attente Android grossit.
- Album photo imprimé (Prodigi / Printful).

## Indicateurs à suivre
- Taux de liaison (installs → couples connectés) : objectif > 60 %.
- Rétention J1 / J7 des couples actifs.
- Démarrage d'essai / install, conversion essai → payant.
- Selfies par couple et par jour, longueur moyenne des séries.
