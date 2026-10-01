export type Section = { h: string; p: string[] };

const en = {
  meta: {
    title: "Morni — Wake up to their face",
    description: "One selfie a day, straight to your person's home screen. The widget app for couples, long-distance loves and families.",
  },
  nav: { how: "How it works", moods: "Moods", pricing: "Pricing", faq: "FAQ", cta: "Get Morni" },
  hero: {
    eyebrow: "The morning ritual for two",
    titleBefore: "Wake up to ",
    titleEm: "their",
    titleAfter: " face.",
    sub: "Snap a selfie when your day starts. It lands on your person's home screen, instantly. Private by design: only the two of you, ever.",
    appStore: "Download on the App Store",
    comingSoon: "Coming soon to the App Store. Get early access:",
    emailPlaceholder: "your@email.com",
    join: "Get early access",
    joined: "You're on the list! We'll email you at launch ☀️",
    invalid: "That email doesn't look right.",
    error: "Something went wrong, please try again.",
  },
  mock: { partner: "Léa", you: "Tom", app: "Morni" },
  how: {
    title: "Three seconds a day. A lot of love.",
    steps: [
      { title: "Snap your morning face", body: "Bed hair, first coffee, commute glow. Add a mood sticker and a few words." },
      { title: "It lands on their home screen", body: "No app to open. Your selfie appears on their widget the second you send it." },
      { title: "React and keep the flame", body: "Send a reaction or a \"miss you\", and grow your streak together, day after day." },
    ],
  },
  moods: {
    title: "Say it with your face (and a sticker)",
    sub: "Twenty-five original moods, drawn just for Morni. Grumpy mornings included.",
    plus: "Morni+",
    example: "Me before coffee",
  },
  uses: {
    title: "Made for the people you miss",
    items: [
      { mood: "missyou", title: "Long-distance couples", body: "Different cities, same morning. Count down the days until your next reunion." },
      { mood: "inlove", title: "Couples who live together", body: "Leave for work at different times? Still share the first smile of the day." },
      { mood: "proud", title: "Parents and teens", body: "A quick face from school or college, without a long message." },
      { mood: "coffee", title: "Best friends", body: "Your ride-or-die, on your home screen, every single morning." },
    ],
  },
  pricing: {
    title: "Free for the essentials. Morni+ for the two of you.",
    sub: "One subscription unlocks Morni+ for both partners.",
    free: {
      name: "Free",
      price: "$0",
      features: ["One selfie a day", "10 moods", "Small and medium widgets", "Streaks and reactions", "7 days of memories"],
    },
    plus: {
      name: "Morni+",
      badge: "Both of you",
      price: "$29.99 / year",
      alt: "or $4.99 / month",
      trial: "3-day free trial",
      features: [
        "Everything in Free",
        "All 25 moods: 15 more, Spicy included 🌶️",
        "Large and Lock Screen widgets",
        "Every selfie, forever",
        "Bonus selfies, as many as you want",
        "Countdown to your next reunion",
      ],
    },
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Does my person need an iPhone?", a: "Yes, Morni is on iPhone for now. Android is on the way: join the waitlist and we'll tell you first." },
      { q: "Who can see my selfies?", a: "Only your person. There is no feed, no followers and no public profile. Photos are stored privately in the EU and deleted when you disconnect or delete your account." },
      { q: "How do I add the widget?", a: "Touch and hold your home screen, tap Edit then Add Widget, search for Morni and pick a size. The app shows you how." },
      { q: "What if I forget to post?", a: "Morni sends a gentle reminder at the time you choose. Your streak only counts days where you both posted." },
      { q: "Can I cancel Morni+?", a: "Anytime, in your App Store settings. You keep Morni+ until the end of the period you paid for." },
    ],
  },
  final: { title: "Tomorrow morning, be the first thing they see.", sub: "Free to start. Takes a minute to set up." },
  footer: { privacy: "Privacy", terms: "Terms", support: "Support", rights: "All rights reserved." },
  invite: {
    titleNamed: "{name} wants to wake up to your face ☀️",
    titleAnon: "Someone wants to wake up to your face ☀️",
    sub: "Morni puts your selfies on each other's home screen, one a day. Join in two steps:",
    step1: "Download Morni on your iPhone",
    step2: "Enter this code when the app asks",
    open: "I already have Morni: open it",
    copy: "Copy code",
    copied: "Copied!",
    android: "On Android? Leave your email and we'll tell you when Morni arrives.",
    ogNamed: "{name} wants to be on your home screen",
    ogAnon: "Someone wants to be on your home screen",
  },
  legal: {
    updated: "Last updated: September 29, 2026",
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Use",
    supportTitle: "Help & support",
    privacy: [
      { h: "Who we are", p: ["Morni is published by {company}{address}. Contact: {email}."] },
      {
        h: "What we collect",
        p: [
          "Account: your first name and the identifier provided by Sign in with Apple or Google (and the email address they share, if any).",
          "Content: the selfies, mood stickers, captions and reactions you send to your person.",
          "Technical: your device's push notification token, time zone, language and app settings (reminder time).",
          "Purchases: your Morni+ status, processed by Apple and RevenueCat. We never see your payment details.",
        ],
      },
      {
        h: "Why we use it",
        p: [
          "To deliver your selfies to your person, show them in the app and widgets, send notifications and reminders, compute streaks and provide Morni+.",
          "We do not sell your data, show ads or use your photos to train any model.",
        ],
      },
      {
        h: "Who processes it",
        p: [
          "Supabase (database and photo storage, hosted in the European Union), Apple (Sign in with Apple, push notifications, payments), Google (Sign in with Google, if you use it), RevenueCat (subscription status).",
        ],
      },
      {
        h: "How long we keep it",
        p: [
          "Selfies stay available to you and your person while you are connected. Disconnecting deletes every shared selfie for both of you. Deleting your account (Settings → Delete my account) permanently deletes your profile and photos.",
        ],
      },
      {
        h: "Your rights",
        p: [
          "You can access, correct, export or delete your data, and object to or restrict its processing, by writing to {email}. You can also file a complaint with your data protection authority (in France, the CNIL).",
        ],
      },
      { h: "Children", p: ["Morni is not intended for children under 13."] },
    ] as Section[],
    terms: [
      { h: "The service", p: ["Morni lets two people share one selfie a day that appears on each other's home screen. By using Morni you accept these terms."] },
      {
        h: "Your account",
        p: [
          "You must be at least 13 years old. You are responsible for your account and for the content you send. Only connect with someone who agrees to receive your selfies.",
        ],
      },
      {
        h: "Your content",
        p: [
          "You keep all rights to your photos. You give us only the permission needed to store them and deliver them to your person. Do not send illegal, hateful or non-consensual content; we may suspend accounts that do.",
        ],
      },
      {
        h: "Morni+",
        p: [
          "Morni+ is an auto-renewable subscription billed by Apple to your Apple ID. It renews automatically unless cancelled at least 24 hours before the end of the current period. Free trials convert to a paid subscription unless cancelled before they end. Manage or cancel in your App Store settings. One subscription unlocks Morni+ for both connected partners while they stay connected.",
        ],
      },
      {
        h: "Liability",
        p: [
          "Morni is provided as is. We do our best to keep it running and your data safe, but we cannot guarantee uninterrupted service. Nothing in these terms limits your rights as a consumer.",
        ],
      },
      { h: "Changes and law", p: ["We may update these terms and will notify you of important changes. These terms are governed by French law."] },
      { h: "Contact", p: ["{email}"] },
    ] as Section[],
    support: [
      { h: "Adding the widget", p: ["Touch and hold an empty spot on your home screen, tap Edit, then Add Widget. Search for Morni and pick a size. For the Lock Screen, touch and hold it, tap Customize, then add Morni."] },
      { h: "My widget doesn't update", p: ["Make sure notifications are on for Morni (Settings → Notifications → Morni). Widgets also refresh on their own every 30 minutes or so."] },
      { h: "Connecting with your person", p: ["In the app, send your invite link or share your 6-character code. Codes are valid for 14 days."] },
      { h: "Subscriptions", p: ["Manage or cancel Morni+ in Settings → your name → Subscriptions. To restore a purchase, use Settings → Restore purchases in the app."] },
      { h: "Still stuck?", p: ["Write to us at {email}. We usually answer within 48 hours."] },
    ] as Section[],
  },
};

export type Dictionary = typeof en;
export default en;
