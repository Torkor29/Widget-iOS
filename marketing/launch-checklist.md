# Checklist de lancement

## Avant la soumission
- [ ] Tester à deux sur TestFlight pendant au moins 3 jours (widgets, notifications, séries, paywall en sandbox).
- [ ] Vérifier le lien d'invitation : il doit ouvrir l'app si elle est installée, sinon la page web.
- [ ] Captures 6,9" (1320×2868) en EN, FR et ES, plus une vidéo de preview de 15 à 30 s.
- [ ] **App Privacy** (étiquettes de confidentialité) : Nom, Email (facultatif), Photos, Identifiant utilisateur, Historique d'achat. Tout est « lié à l'utilisateur », rien n'est utilisé pour le tracking.
- [ ] Classification par âge : 12+ (contenus générés par les utilisateurs, partagés en privé).
- [ ] URL de confidentialité, de support et d'accueil renseignées (site en ligne).
- [ ] Abonnements « Ready to Submit », avec capture d'écran et description.

## Notes pour la revue Apple (App Review)
Le relecteur doit pouvoir se connecter **à quelqu'un**. Prépare un compte de test déjà inscrit et donne-lui un code :
```
Morni works in pairs. To test: sign in with Apple, enter the name of your choice,
then on the "Connect with your person" screen enter the code XXXXXX
(a demo partner account). You'll see the partner's selfie on the Home screen;
add the Morni widget from the home screen to see it there.
Morni+ can be tested with a sandbox account from the paywall.
```
Pense à régénérer le code juste avant la soumission : il est valable 14 jours.

## Motifs de refus fréquents et parades
- **4.3 Spam / app trop simple** : mettre en avant les widgets, les moods, les séries et les souvenirs dans la description et les captures.
- **3.1.2 Abonnements** : prix, durée et renouvellement automatique clairement indiqués sur le paywall, liens CGU et confidentialité, bouton « Restaurer ».
- **5.1.1(v) Suppression de compte** : présente dans Réglages → Supprimer mon compte.
- **Connexion** : Sign in with Apple est bien proposé à côté de Google.

## Jour J
- [ ] Mettre l'URL App Store dans `.env` du VPS (`NEXT_PUBLIC_APP_STORE_URL`) et redéployer le site.
- [ ] Email à la liste d'attente (table `waitlist` dans Supabase).
- [ ] 3 vidéos par compte TikTok le jour même, puis rythme de croisière.
- [ ] Surveiller RevenueCat (essais, conversions) et les logs des fonctions Supabase.
