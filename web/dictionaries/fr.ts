import type { Dictionary } from "./en";

const fr: Dictionary = {
  meta: {
    title: "Morni — Réveille-toi avec son sourire",
    description: "Un selfie par jour, directement sur l'écran d'accueil de ta moitié. L'app widget pour les couples, les amours à distance et les familles.",
  },
  nav: { how: "Comment ça marche", moods: "Moods", pricing: "Tarifs", faq: "FAQ", cta: "Télécharger" },
  hero: {
    eyebrow: "Le rituel du matin à deux",
    titleBefore: "Réveille-toi avec ",
    titleEm: "son",
    titleAfter: " sourire.",
    sub: "Prends un selfie en commençant ta journée. Il arrive instantanément sur l'écran d'accueil de ta moitié. Privé par nature : rien que vous deux, toujours.",
    appStore: "Télécharger dans l'App Store",
    comingSoon: "Bientôt sur l'App Store. Reçois l'accès en avant-première :",
    emailPlaceholder: "ton@email.com",
    join: "Je veux l'accès",
    joined: "C'est noté ! On t'écrit au lancement ☀️",
    invalid: "Cet email n'a pas l'air valide.",
    error: "Un problème est survenu, réessaie.",
  },
  mock: { partner: "Léa", you: "Tom", app: "Morni" },
  how: {
    title: "Trois secondes par jour. Beaucoup d'amour.",
    steps: [
      { title: "Prends ta tête du matin", body: "Cheveux en bataille, premier café, trajet du matin. Ajoute un sticker d'humeur et quelques mots." },
      { title: "Il arrive sur son écran d'accueil", body: "Pas besoin d'ouvrir l'app. Ton selfie apparaît sur son widget à la seconde où tu l'envoies." },
      { title: "Réagis et garde la flamme", body: "Envoie une réaction ou un « tu me manques », et faites grandir votre série jour après jour." },
    ],
  },
  moods: {
    title: "Dis-le avec ta tête (et un sticker)",
    sub: "Douze moods originaux, dessinés rien que pour Morni. Réveils grognons compris.",
    plus: "Morni+",
  },
  uses: {
    title: "Pour les personnes qui te manquent",
    items: [
      { mood: "missyou", title: "Couples à distance", body: "Villes différentes, même matin. Et le compte à rebours jusqu'à vos retrouvailles." },
      { mood: "inlove", title: "Couples qui vivent ensemble", body: "Vous partez à des heures différentes ? Partagez quand même le premier sourire de la journée." },
      { mood: "proud", title: "Parents et ados", body: "Une petite tête depuis le lycée ou la fac, sans long message." },
      { mood: "coffee", title: "Meilleur·es ami·es", body: "Ton binôme sur ton écran d'accueil, chaque matin." },
    ],
  },
  pricing: {
    title: "Gratuit pour l'essentiel. Morni+ pour vous deux.",
    sub: "Un seul abonnement débloque Morni+ pour les deux partenaires.",
    free: {
      name: "Gratuit",
      price: "0 €",
      features: ["Un selfie par jour", "6 moods", "Petit et moyen widgets", "Séries et réactions", "7 jours de souvenirs"],
    },
    plus: {
      name: "Morni+",
      badge: "Pour vous deux",
      price: "29,99 € / an",
      alt: "ou 4,99 € / mois",
      trial: "3 jours d'essai gratuit",
      features: [
        "Tout le gratuit",
        "Les 12 moods, Mode coquin compris 🌶️",
        "Grand widget et écran verrouillé",
        "Tous vos selfies, pour toujours",
        "Des selfies bonus, autant que tu veux",
        "Compte à rebours avant vos retrouvailles",
      ],
    },
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Ma moitié doit-elle avoir un iPhone ?", a: "Oui, Morni est sur iPhone pour l'instant. Android arrive : inscris-toi et tu seras prévenu·e en premier." },
      { q: "Qui peut voir mes selfies ?", a: "Uniquement ta moitié. Pas de fil, pas d'abonnés, pas de profil public. Les photos sont stockées de façon privée dans l'UE et supprimées quand vous vous déconnectez ou supprimez votre compte." },
      { q: "Comment ajouter le widget ?", a: "Maintiens ton doigt sur l'écran d'accueil, touche Modifier puis Ajouter un widget, cherche Morni et choisis une taille. L'app te montre comment." },
      { q: "Et si j'oublie de poster ?", a: "Morni t'envoie un petit rappel à l'heure que tu choisis. Votre série ne compte que les jours où vous avez posté tous les deux." },
      { q: "Puis-je résilier Morni+ ?", a: "À tout moment, dans les réglages de l'App Store. Tu gardes Morni+ jusqu'à la fin de la période payée." },
    ],
  },
  final: { title: "Demain matin, sois la première chose qu'il ou elle voit.", sub: "Gratuit pour commencer. Prêt en une minute." },
  footer: { privacy: "Confidentialité", terms: "Conditions", support: "Aide", rights: "Tous droits réservés." },
  invite: {
    titleNamed: "{name} veut se réveiller avec ton sourire ☀️",
    titleAnon: "Quelqu'un veut se réveiller avec ton sourire ☀️",
    sub: "Morni met vos selfies sur vos écrans d'accueil, un par jour. Rejoins-le ou la en deux étapes :",
    step1: "Télécharge Morni sur ton iPhone",
    step2: "Entre ce code quand l'app te le demande",
    open: "J'ai déjà Morni : l'ouvrir",
    copy: "Copier le code",
    copied: "Copié !",
    android: "Sur Android ? Laisse ton email, on te prévient dès que Morni arrive.",
    ogNamed: "{name} veut être sur ton écran d'accueil",
    ogAnon: "Quelqu'un veut être sur ton écran d'accueil",
  },
  legal: {
    updated: "Dernière mise à jour : 29 septembre 2026",
    privacyTitle: "Politique de confidentialité",
    termsTitle: "Conditions d'utilisation",
    supportTitle: "Aide & support",
    privacy: [
      { h: "Qui sommes-nous", p: ["Morni est édité par {company}{address}. Contact : {email}."] },
      {
        h: "Les données collectées",
        p: [
          "Compte : ton prénom et l'identifiant fourni par Se connecter avec Apple ou Google (et l'adresse email partagée, le cas échéant).",
          "Contenus : les selfies, stickers d'humeur, légendes et réactions que tu envoies à ta moitié.",
          "Données techniques : le jeton de notifications de ton appareil, ton fuseau horaire, ta langue et tes réglages (heure du rappel).",
          "Achats : ton statut Morni+, traité par Apple et RevenueCat. Nous ne voyons jamais tes données de paiement.",
        ],
      },
      {
        h: "Pourquoi nous les utilisons",
        p: [
          "Pour livrer tes selfies à ta moitié, les afficher dans l'app et les widgets, envoyer notifications et rappels, calculer les séries et fournir Morni+ (exécution du contrat).",
          "Nous ne vendons pas tes données, n'affichons pas de publicité et n'utilisons pas tes photos pour entraîner un modèle.",
        ],
      },
      {
        h: "Sous-traitants",
        p: [
          "Supabase (base de données et stockage des photos, hébergés dans l'Union européenne), Apple (connexion, notifications, paiements), Google (connexion, si tu l'utilises), RevenueCat (statut d'abonnement).",
        ],
      },
      {
        h: "Durée de conservation",
        p: [
          "Les selfies restent accessibles à toi et à ta moitié tant que vous êtes connectés. Se déconnecter supprime tous les selfies partagés pour vous deux. Supprimer ton compte (Réglages → Supprimer mon compte) efface définitivement ton profil et tes photos.",
        ],
      },
      {
        h: "Tes droits",
        p: [
          "Tu peux accéder à tes données, les rectifier, les exporter ou les supprimer, et t'opposer à leur traitement ou le limiter, en écrivant à {email}. Tu peux aussi saisir la CNIL (cnil.fr).",
        ],
      },
      { h: "Enfants", p: ["Morni n'est pas destiné aux enfants de moins de 13 ans (15 ans sans accord parental en France)."] },
    ],
    terms: [
      { h: "Le service", p: ["Morni permet à deux personnes de partager un selfie par jour qui s'affiche sur leurs écrans d'accueil. En utilisant Morni, tu acceptes ces conditions."] },
      {
        h: "Ton compte",
        p: [
          "Tu dois avoir au moins 13 ans. Tu es responsable de ton compte et des contenus que tu envoies. Ne te connecte qu'avec une personne qui accepte de recevoir tes selfies.",
        ],
      },
      {
        h: "Tes contenus",
        p: [
          "Tu conserves tous les droits sur tes photos. Tu nous accordes uniquement l'autorisation nécessaire pour les stocker et les livrer à ta moitié. N'envoie pas de contenus illégaux, haineux ou non consentis ; nous pouvons suspendre les comptes qui le font.",
        ],
      },
      {
        h: "Morni+",
        p: [
          "Morni+ est un abonnement à renouvellement automatique facturé par Apple sur ton identifiant Apple. Il se renouvelle automatiquement sauf résiliation au moins 24 heures avant la fin de la période en cours. L'essai gratuit se transforme en abonnement payant s'il n'est pas résilié avant la fin. Gère ou résilie ton abonnement dans les réglages de l'App Store. Un abonnement débloque Morni+ pour les deux partenaires tant qu'ils restent connectés.",
        ],
      },
      {
        h: "Responsabilité",
        p: [
          "Morni est fourni en l'état. Nous faisons de notre mieux pour assurer le service et protéger tes données, sans pouvoir garantir un fonctionnement ininterrompu. Rien dans ces conditions ne limite tes droits de consommateur.",
        ],
      },
      { h: "Modifications et droit applicable", p: ["Nous pouvons mettre à jour ces conditions et te préviendrons des changements importants. Elles sont régies par le droit français."] },
      { h: "Contact", p: ["{email}"] },
    ],
    support: [
      { h: "Ajouter le widget", p: ["Maintiens ton doigt sur un espace vide de l'écran d'accueil, touche Modifier puis Ajouter un widget. Cherche Morni et choisis une taille. Pour l'écran verrouillé, maintiens-le, touche Personnaliser puis ajoute Morni."] },
      { h: "Mon widget ne se met pas à jour", p: ["Vérifie que les notifications sont activées pour Morni (Réglages → Notifications → Morni). Les widgets se rafraîchissent aussi tout seuls toutes les 30 minutes environ."] },
      { h: "Se connecter à sa moitié", p: ["Dans l'app, envoie ton lien d'invitation ou partage ton code de 6 caractères. Les codes sont valables 14 jours."] },
      { h: "Abonnements", p: ["Gère ou résilie Morni+ dans Réglages → ton nom → Abonnements. Pour restaurer un achat : Réglages → Restaurer les achats dans l'app."] },
      { h: "Toujours bloqué·e ?", p: ["Écris-nous à {email}. Nous répondons en général sous 48 heures."] },
    ],
  },
};

export default fr;
