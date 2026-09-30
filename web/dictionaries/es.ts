import type { Dictionary } from "./en";

const es: Dictionary = {
  meta: {
    title: "Morni — Despierta con su cara",
    description: "Un selfie al día, directo a la pantalla de inicio de tu persona. La app de widgets para parejas, amores a distancia y familias.",
  },
  nav: { how: "Cómo funciona", moods: "Moods", pricing: "Precios", faq: "FAQ", cta: "Descargar" },
  hero: {
    eyebrow: "El ritual de la mañana para dos",
    titleBefore: "Despierta con ",
    titleEm: "su",
    titleAfter: " cara.",
    sub: "Hazte un selfie al empezar el día. Llega al instante a la pantalla de inicio de tu persona. Privado por diseño: solo vosotros dos, siempre.",
    appStore: "Descargar en el App Store",
    comingSoon: "Muy pronto en el App Store. Consigue acceso anticipado:",
    emailPlaceholder: "tu@email.com",
    join: "Quiero acceso",
    joined: "¡Apuntado! Te escribiremos en el lanzamiento ☀️",
    invalid: "Ese email no parece correcto.",
    error: "Algo salió mal, inténtalo de nuevo.",
  },
  mock: { partner: "Lucía", you: "Pablo", app: "Morni" },
  how: {
    title: "Tres segundos al día. Mucho amor.",
    steps: [
      { title: "Hazte tu cara de la mañana", body: "Pelo revuelto, primer café, camino al trabajo. Añade un sticker de humor y unas palabras." },
      { title: "Llega a su pantalla de inicio", body: "Sin abrir la app. Tu selfie aparece en su widget en cuanto lo envías." },
      { title: "Reacciona y mantén la llama", body: "Envía una reacción o un «te extraño» y haced crecer vuestra racha día tras día." },
    ],
  },
  moods: {
    title: "Dilo con tu cara (y un sticker)",
    sub: "Doce moods originales, dibujados solo para Morni. Mañanas de malas incluidas.",
    plus: "Morni+",
  },
  uses: {
    title: "Para las personas que echas de menos",
    items: [
      { mood: "missyou", title: "Parejas a distancia", body: "Ciudades distintas, la misma mañana. Y la cuenta atrás hasta volver a veros." },
      { mood: "inlove", title: "Parejas que viven juntas", body: "¿Salís a horas distintas? Compartid igualmente la primera sonrisa del día." },
      { mood: "proud", title: "Padres y adolescentes", body: "Una carita rápida desde el insti o la uni, sin mensajes largos." },
      { mood: "coffee", title: "Mejores amigos", body: "Tu persona favorita en tu pantalla de inicio, cada mañana." },
    ],
  },
  pricing: {
    title: "Gratis para lo esencial. Morni+ para los dos.",
    sub: "Una sola suscripción desbloquea Morni+ para ambos.",
    free: {
      name: "Gratis",
      price: "0 €",
      features: ["Un selfie al día", "6 moods", "Widgets pequeño y mediano", "Rachas y reacciones", "7 días de recuerdos"],
    },
    plus: {
      name: "Morni+",
      badge: "Para los dos",
      price: "29,99 € / año",
      alt: "o 4,99 € / mes",
      trial: "3 días de prueba gratis",
      features: [
        "Todo lo de Gratis",
        "Los 12 moods, Picante incluido 🌶️",
        "Widget grande y de pantalla bloqueada",
        "Todos vuestros selfies, para siempre",
        "Selfies extra, todos los que quieras",
        "Cuenta atrás hasta vuestro reencuentro",
      ],
    },
  },
  faq: {
    title: "Preguntas",
    items: [
      { q: "¿Mi persona necesita un iPhone?", a: "Sí, por ahora Morni está en iPhone. Android está en camino: apúntate y serás de los primeros en saberlo." },
      { q: "¿Quién puede ver mis selfies?", a: "Solo tu persona. Sin feed, sin seguidores, sin perfil público. Las fotos se guardan de forma privada en la UE y se borran al desconectaros o eliminar la cuenta." },
      { q: "¿Cómo añado el widget?", a: "Mantén pulsada la pantalla de inicio, toca Editar y luego Añadir widget, busca Morni y elige un tamaño. La app te lo enseña." },
      { q: "¿Y si se me olvida publicar?", a: "Morni te manda un recordatorio a la hora que elijas. La racha solo cuenta los días en los que publicáis los dos." },
      { q: "¿Puedo cancelar Morni+?", a: "Cuando quieras, en los ajustes del App Store. Mantienes Morni+ hasta el final del periodo pagado." },
    ],
  },
  final: { title: "Mañana por la mañana, sé lo primero que vea.", sub: "Gratis para empezar. Listo en un minuto." },
  footer: { privacy: "Privacidad", terms: "Términos", support: "Ayuda", rights: "Todos los derechos reservados." },
  invite: {
    titleNamed: "{name} quiere despertar viendo tu cara ☀️",
    titleAnon: "Alguien quiere despertar viendo tu cara ☀️",
    sub: "Morni pone vuestros selfies en vuestras pantallas de inicio, uno al día. Únete en dos pasos:",
    step1: "Descarga Morni en tu iPhone",
    step2: "Introduce este código cuando la app te lo pida",
    open: "Ya tengo Morni: abrirla",
    copy: "Copiar código",
    copied: "¡Copiado!",
    android: "¿Tienes Android? Déjanos tu email y te avisaremos cuando llegue Morni.",
    ogNamed: "{name} quiere estar en tu pantalla de inicio",
    ogAnon: "Alguien quiere estar en tu pantalla de inicio",
  },
  legal: {
    updated: "Última actualización: 29 de septiembre de 2026",
    privacyTitle: "Política de privacidad",
    termsTitle: "Términos de uso",
    supportTitle: "Ayuda y soporte",
    privacy: [
      { h: "Quiénes somos", p: ["Morni es un servicio de {company}{address}. Contacto: {email}."] },
      {
        h: "Qué datos recogemos",
        p: [
          "Cuenta: tu nombre y el identificador de Iniciar sesión con Apple o Google (y el email que compartan, si lo hay).",
          "Contenido: los selfies, stickers de humor, textos y reacciones que envías a tu persona.",
          "Datos técnicos: el token de notificaciones de tu dispositivo, tu zona horaria, idioma y ajustes (hora del recordatorio).",
          "Compras: tu estado de Morni+, gestionado por Apple y RevenueCat. Nunca vemos tus datos de pago.",
        ],
      },
      {
        h: "Para qué los usamos",
        p: [
          "Para entregar tus selfies a tu persona, mostrarlos en la app y los widgets, enviar notificaciones y recordatorios, calcular rachas y ofrecer Morni+.",
          "No vendemos tus datos, no mostramos anuncios y no usamos tus fotos para entrenar ningún modelo.",
        ],
      },
      {
        h: "Quién los trata",
        p: [
          "Supabase (base de datos y fotos, alojados en la Unión Europea), Apple (inicio de sesión, notificaciones, pagos), Google (inicio de sesión, si lo usas), RevenueCat (estado de la suscripción).",
        ],
      },
      {
        h: "Cuánto tiempo los guardamos",
        p: [
          "Los selfies están disponibles para ti y tu persona mientras estéis conectados. Desconectaros borra todos los selfies compartidos para los dos. Eliminar tu cuenta (Ajustes → Eliminar mi cuenta) borra para siempre tu perfil y tus fotos.",
        ],
      },
      {
        h: "Tus derechos",
        p: [
          "Puedes acceder, rectificar, exportar o suprimir tus datos, y oponerte o limitar su tratamiento, escribiendo a {email}. También puedes reclamar ante tu autoridad de protección de datos (en España, la AEPD).",
        ],
      },
      { h: "Menores", p: ["Morni no está dirigido a menores de 13 años (14 en España sin consentimiento parental)."] },
    ],
    terms: [
      { h: "El servicio", p: ["Morni permite a dos personas compartir un selfie al día que aparece en sus pantallas de inicio. Al usar Morni aceptas estos términos."] },
      {
        h: "Tu cuenta",
        p: [
          "Debes tener al menos 13 años. Eres responsable de tu cuenta y del contenido que envías. Conéctate solo con alguien que acepte recibir tus selfies.",
        ],
      },
      {
        h: "Tu contenido",
        p: [
          "Conservas todos los derechos sobre tus fotos. Solo nos das el permiso necesario para guardarlas y entregarlas a tu persona. No envíes contenido ilegal, de odio o sin consentimiento; podemos suspender las cuentas que lo hagan.",
        ],
      },
      {
        h: "Morni+",
        p: [
          "Morni+ es una suscripción de renovación automática cobrada por Apple a tu Apple ID. Se renueva automáticamente salvo que la canceles al menos 24 horas antes del final del periodo actual. La prueba gratuita pasa a ser de pago si no la cancelas antes de que termine. Gestiona o cancela en los ajustes del App Store. Una suscripción desbloquea Morni+ para ambos mientras sigan conectados.",
        ],
      },
      {
        h: "Responsabilidad",
        p: [
          "Morni se ofrece tal cual. Hacemos lo posible por mantener el servicio y proteger tus datos, pero no podemos garantizar un funcionamiento ininterrumpido. Nada en estos términos limita tus derechos como consumidor.",
        ],
      },
      { h: "Cambios y ley aplicable", p: ["Podemos actualizar estos términos y te avisaremos de los cambios importantes. Se rigen por la ley francesa."] },
      { h: "Contacto", p: ["{email}"] },
    ],
    support: [
      { h: "Añadir el widget", p: ["Mantén pulsado un espacio vacío de la pantalla de inicio, toca Editar y luego Añadir widget. Busca Morni y elige un tamaño. Para la pantalla bloqueada, mantenla pulsada, toca Personalizar y añade Morni."] },
      { h: "Mi widget no se actualiza", p: ["Comprueba que las notificaciones de Morni están activadas (Ajustes → Notificaciones → Morni). Los widgets también se actualizan solos cada 30 minutos aproximadamente."] },
      { h: "Conectar con tu persona", p: ["En la app, envía tu enlace de invitación o comparte tu código de 6 caracteres. Los códigos valen 14 días."] },
      { h: "Suscripciones", p: ["Gestiona o cancela Morni+ en Ajustes → tu nombre → Suscripciones. Para restaurar una compra: Ajustes → Restaurar compras en la app."] },
      { h: "¿Sigues atascado?", p: ["Escríbenos a {email}. Solemos responder en 48 horas."] },
    ],
  },
};

export default es;
