// Morni "Moods" sticker set — source of truth for the mood artwork.
// Each mood defines `sil` (silhouette, drawn in white underneath to create the
// sticker border) and `art` (the coloured illustration). Canvas is 160×160.
// Run `cd design/scripts && npm run build` to regenerate SVG + PNG assets.

const PLUM = '#2B1033';
const CORAL = '#FF6B81';
const GOLD = '#FFC24B';
const LILAC = '#B9A6FF';
const TEAR = '#8EC5FF';

const eyeArcUp = (x, y, w = 12) => `<path d="M${x} ${y} q${w / 2} -${w * 0.6} ${w} 0" fill="none" stroke="${PLUM}" stroke-width="4.5" stroke-linecap="round"/>`;
const eyeArcDown = (x, y, w = 14) => `<path d="M${x} ${y} q${w / 2} ${w * 0.45} ${w} 0" fill="none" stroke="${PLUM}" stroke-width="4.5" stroke-linecap="round"/>`;
const eyeDot = (x, y, r = 4.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PLUM}"/><circle cx="${x + 1.6}" cy="${y - 1.8}" r="1.5" fill="#fff"/>`;
const cheek = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="7.5" ry="4.5" fill="${CORAL}" opacity=".42"/>`;
const shine = (x, y, rot = -35) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="6" fill="#fff" opacity=".5" transform="rotate(${rot} ${x} ${y})"/>`;
const stroke = (d, w = 4.5, c = PLUM) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const heart = (x, y, s, fill) => `<path d="M0 7 C-10 0 -10 -8 -5 -8 C-2.5 -8 0 -6 0 -4 C0 -6 2.5 -8 5 -8 C10 -8 10 0 0 7 Z" transform="translate(${x} ${y}) scale(${s})" fill="${fill}"/>`;
const heartSil = (x, y, s) => `<path d="M0 7 C-10 0 -10 -8 -5 -8 C-2.5 -8 0 -6 0 -4 C0 -6 2.5 -8 5 -8 C10 -8 10 0 0 7 Z" transform="translate(${x} ${y}) scale(${s})" stroke-width="${14 / s}"/>`;
const sparkle = (x, y, s, fill) => `<path d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z" transform="translate(${x} ${y}) scale(${s})" fill="${fill}"/>`;
const sparkleSil = (x, y, s) => `<path d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z" transform="translate(${x} ${y}) scale(${s})" stroke-width="${12 / s}"/>`;
const grad = (id, a, b, x1 = 0.2, y1 = 0.1, x2 = 0.8, y2 = 0.95) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const rays = (() => {
  const out = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    const x1 = 80 + Math.cos(a) * 52, y1 = 82 + Math.sin(a) * 52;
    const x2 = 80 + Math.cos(a) * 66, y2 = 82 + Math.sin(a) * 66;
    out.push(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return out.join(' ');
})();

const blob = 'M80 38 C112 38 128 62 128 90 C128 118 108 132 80 132 C52 132 32 118 32 90 C32 62 48 38 80 38 Z';
const star = 'M80 32 L97.6 61.7 L131.4 69.3 L108.5 95.3 L111.7 129.7 L80 116 L48.3 129.7 L51.5 95.3 L28.6 69.3 L62.4 61.7 Z';
const flame = 'M80 26 C94 48 120 60 120 98 C120 122 102 138 80 138 C58 138 40 122 40 98 C40 80 50 68 60 60 C62 72 67 78 74 81 C69 62 71 44 80 26 Z';
const heartBody = 'M80 134 C40 108 24 84 30 62 C36 40 62 34 80 54 C98 34 124 40 130 62 C136 84 120 108 80 134 Z';
const cloud = 'M44 112 C30 112 26 96 36 88 C32 72 48 62 60 68 C64 50 90 44 102 58 C116 54 130 66 124 82 C138 88 134 112 116 112 Z';
const pepper = 'M46 58 C74 50 120 58 130 94 C138 124 118 140 104 128 C96 106 72 92 46 84 C30 80 30 62 46 58 Z';

export const moods = {
  sunny: {
    defs: grad('g', '#FFE58F', '#FFAA80'),
    sil: `<path d="${rays}" fill="none" stroke-width="24"/><circle cx="80" cy="82" r="42"/>`,
    art: `${stroke(rays, 10, GOLD)}
      <circle cx="80" cy="82" r="42" fill="url(#g)"/>${shine(64, 60)}
      ${eyeArcUp(60, 80)}${eyeArcUp(88, 80)}${cheek(57, 92)}${cheek(103, 92)}
      <path d="M67 93 Q80 112 93 93 Z" fill="${PLUM}" stroke="${PLUM}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M73 101 Q80 108 87 101 Q80 97 73 101 Z" fill="${CORAL}"/>`,
  },
  sleepy: {
    defs: grad('g', '#DCD3FF', '#9C88F5') + grad('c', '#FF9AAE', '#FF5C7A'),
    sil: `<circle cx="80" cy="90" r="44"/><path d="M44 72 C50 40 86 26 112 36 C126 42 136 58 134 76 L128 84 C122 66 116 60 110 60 C90 58 62 64 44 72 Z"/>
      <circle cx="132" cy="80" r="9"/><path d="M16 46 h14 l-14 16 h14 M36 22 h11 l-11 12 h11" fill="none" stroke-width="14"/>`,
    art: `<circle cx="80" cy="90" r="44" fill="url(#g)"/>${shine(60, 74)}
      <path d="M44 72 C50 40 86 26 112 36 C126 42 136 58 134 76 C126 64 118 58 110 58 C90 56 62 62 44 72 Z" fill="url(#c)"/>
      ${stroke('M45 71 C64 61 90 55 112 58', 10, '#FFF6EF')}
      <circle cx="132" cy="80" r="9" fill="#FFF6EF"/>
      ${eyeArcDown(57, 94)}${eyeArcDown(89, 94)}${cheek(55, 106)}${cheek(105, 106)}
      <ellipse cx="80" cy="112" rx="4.5" ry="5.5" fill="${PLUM}"/>
      ${stroke('M16 46 h14 l-14 16 h14', 4.5)}${stroke('M36 22 h11 l-11 12 h11', 3.8)}`,
  },
  grumpy: {
    defs: grad('g', '#D3CBE3', '#8B80A8'),
    sil: `<path d="${cloud}"/><path d="M86 108 l-12 20 h11 l-6 18 l20 -25 h-11 l7 -13 z"/>`,
    art: `<path d="M86 108 l-12 20 h11 l-6 18 l20 -25 h-11 l7 -13 z" fill="${GOLD}" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>
      <path d="${cloud}" fill="url(#g)"/>${shine(58, 76)}
      ${stroke('M58 80 l13 5')}${stroke('M102 80 l-13 5')}
      ${eyeDot(66, 92)}${eyeDot(94, 92)}
      ${stroke('M72 105 q8 -7 16 0')}`,
  },
  inlove: {
    defs: grad('g', '#FFA3B5', '#FF5577'),
    sil: `<path d="${heartBody}"/>${heartSil(134, 30, 1.3)}${heartSil(24, 36, 0.9)}`,
    art: `<path d="${heartBody}" fill="url(#g)"/>${shine(50, 60)}
      ${heart(64, 84, 1.25, PLUM)}${heart(96, 84, 1.25, PLUM)}
      ${cheek(54, 96)}${cheek(106, 96)}
      ${stroke('M70 100 q10 10 20 0')}
      ${heart(134, 30, 1.3, CORAL)}${heart(24, 36, 0.9, LILAC)}`,
  },
  missyou: {
    defs: grad('g', '#FFD3BE', '#FF9E86'),
    sil: `<path d="${blob}"/>${heartSil(80, 136, 2.1)}<circle cx="62" cy="130" r="7"/><circle cx="98" cy="130" r="7"/>`,
    art: `<path d="${blob}" fill="url(#g)"/>${shine(56, 58)}
      ${stroke('M55 70 l12 -5')}${stroke('M105 70 l-12 -5')}
      <ellipse cx="63" cy="86" rx="7.5" ry="9.5" fill="${PLUM}"/><circle cx="65.5" cy="82" r="3" fill="#fff"/><circle cx="60.5" cy="90" r="1.5" fill="#fff"/>
      <ellipse cx="97" cy="86" rx="7.5" ry="9.5" fill="${PLUM}"/><circle cx="99.5" cy="82" r="3" fill="#fff"/><circle cx="94.5" cy="90" r="1.5" fill="#fff"/>
      <path d="M58 99 q-6 9 0 13 q6 -4 0 -13 z" fill="${TEAR}"/>
      ${cheek(52, 104)}${cheek(108, 104)}
      ${stroke('M71 108 q4.5 -4 9 0 q4.5 4 9 0', 4)}
      ${heart(80, 136, 2.1, CORAL)}
      <circle cx="63" cy="130" r="7" fill="#FF9E86"/><circle cx="97" cy="130" r="7" fill="#FF9E86"/>`,
  },
  coffee: {
    defs: grad('g', '#FFF1E6', '#FFC4A3', 0.2, 0, 0.8, 1),
    sil: `<rect x="36" y="52" width="74" height="80" rx="18"/><path d="M108 74 c22 0 22 36 0 36" fill="none" stroke-width="24"/>
      <path d="M60 42 q-6 -8 0 -16 M80 40 q-6 -9 0 -20 q6 -8 0 -14 M100 42 q-6 -8 0 -16" fill="none" stroke-width="14"/>`,
    art: `${stroke('M60 42 q-6 -8 0 -16', 4.5, LILAC)}${stroke('M80 40 q-6 -9 0 -20 q6 -8 0 -14', 4.5, LILAC)}${stroke('M100 42 q-6 -8 0 -16', 4.5, LILAC)}
      ${stroke('M108 74 c22 0 22 36 0 36', 10, '#FFB592')}
      <rect x="36" y="52" width="74" height="80" rx="18" fill="url(#g)"/>
      <ellipse cx="73" cy="58" rx="31" ry="6.5" fill="#7A4632"/>
      <rect x="36" y="118" width="74" height="14" rx="7" fill="${CORAL}" opacity=".85"/>
      <path d="M52 88 a7 7 0 0 0 14 0 z" fill="${PLUM}"/>${stroke('M50 88 h18', 3.8)}
      <path d="M80 88 a7 7 0 0 0 14 0 z" fill="${PLUM}"/>${stroke('M78 88 h18', 3.8)}
      ${cheek(52, 102)}${cheek(94, 102)}
      ${stroke('M66 106 q7 -4 14 0', 4)}`,
  },
  cuddle: {
    defs: grad('g', '#FFC9E0', '#C4A2FF'),
    sil: `<circle cx="80" cy="86" r="40"/><path d="M48 94 Q30 82 20 62 M112 94 Q130 82 140 62" fill="none" stroke-width="30"/>${heartSil(18, 40, 1)}${heartSil(142, 40, 1)}`,
    art: `${stroke('M48 94 Q30 82 20 62', 16, '#D9B2F8')}${stroke('M112 94 Q130 82 140 62', 16, '#D9B2F8')}
      <circle cx="80" cy="86" r="40" fill="url(#g)"/>${shine(62, 66)}
      ${eyeArcUp(61, 84)}${eyeArcUp(87, 84)}${cheek(58, 96)}${cheek(102, 96)}
      ${stroke('M68 98 q12 13 24 0')}
      ${heart(18, 40, 1, CORAL)}${heart(142, 40, 1, CORAL)}`,
  },
  sick: {
    defs: grad('g', '#DDF5D6', '#9FD6AC'),
    sil: `<circle cx="80" cy="86" r="42"/><path d="M86 106 L128 124" fill="none" stroke-width="22"/><path d="M114 50 q-7 10 0 14 q7 -4 0 -14 z"/>`,
    art: `<circle cx="80" cy="86" r="42" fill="url(#g)"/>${shine(62, 64)}
      ${stroke('M56 82 q7 5 14 0')}${stroke('M90 82 q7 5 14 0')}
      ${stroke('M58 90 q5 2 10 0', 2.5)}${stroke('M92 90 q5 2 10 0', 2.5)}
      ${stroke('M88 107 L126 124', 9, PLUM)}${stroke('M88 107 L126 124', 5.5, '#fff')}${stroke('M112 118 L126 124', 3.2, CORAL)}
      <circle cx="84" cy="106" r="6" fill="${PLUM}"/>
      <path d="M114 50 q-7 10 0 14 q7 -4 0 -14 z" fill="${TEAR}"/>`,
  },
  hungry: {
    defs: grad('g', '#FFC27A', '#FF7E57'),
    sil: `<circle cx="84" cy="86" r="42"/><path d="M30 142 V104 M22 72 V92 q0 12 8 12 q8 0 8 -12 V72" fill="none" stroke-width="20"/>`,
    art: `${stroke('M30 142 V104', 6, '#A5A8C6')}${stroke('M22 72 V92 q0 12 8 12 q8 0 8 -12 V72', 4.5, '#A5A8C6')}${stroke('M30 72 V92', 4.5, '#A5A8C6')}
      <circle cx="84" cy="86" r="42" fill="url(#g)"/>${shine(68, 64)}
      ${stroke('M63 72 l13 5')}${stroke('M107 72 l-13 5')}
      ${eyeDot(70, 86)}${eyeDot(98, 86)}
      <path d="M68 98 Q84 122 100 98 Z" fill="${PLUM}" stroke="${PLUM}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M76 108 Q84 114 92 108 Q84 104 76 108 Z" fill="${CORAL}"/>
      <path d="M101 102 q-5 9 0 12 q5 -3 0 -12 z" fill="${TEAR}"/>`,
  },
  fire: {
    defs: grad('g', '#FFD66B', '#FF5C7A', 0.5, 0, 0.5, 1),
    sil: `<path d="${flame}"/>`,
    art: `<path d="${flame}" fill="url(#g)"/>
      <path d="M80 80 C88 92 102 98 102 114 C102 126 92 132 80 132 C68 132 58 126 58 114 C58 100 72 94 80 80 Z" fill="#FFE9A8" opacity=".35"/>
      ${shine(62, 82, -60)}
      ${stroke('M63 92 l11 5')}${stroke('M97 92 l-11 5')}
      ${eyeDot(69, 104)}${eyeDot(91, 104)}
      ${stroke('M70 116 q10 8 20 0')}`,
  },
  spicy: {
    defs: grad('g', '#FF8595', '#E3304B'),
    sil: `<path d="${pepper}"/><path d="M46 58 C36 56 30 66 34 74 C38 82 46 82 50 76 Z"/><path d="M36 64 C30 56 28 48 32 40" fill="none" stroke-width="20"/>${heartSil(132, 38, 1.2)}`,
    art: `<path d="${pepper}" fill="url(#g)"/>${shine(66, 64, -10)}
      ${stroke('M36 64 C30 56 28 48 32 40', 6, '#4FAE6F')}
      <path d="M46 58 C36 56 30 66 34 74 C38 82 46 82 50 76 C52 70 52 62 46 58 Z" fill="#7ED49B"/>
      ${stroke('M72 80 q5.5 -6 11 0')}
      ${eyeDot(100, 82)}
      ${cheek(70, 92)}${cheek(112, 94)}
      ${stroke('M82 98 q10 7 20 -3')}
      ${heart(132, 38, 1.2, CORAL)}`,
  },
  proud: {
    defs: grad('g', '#FFE58F', '#FFB347'),
    sil: `<path d="${star}" stroke-width="26"/>${sparkleSil(24, 30, 1)}${sparkleSil(140, 26, 0.8)}`,
    art: `<path d="${star}" fill="url(#g)" stroke="url(#g)" stroke-width="12" stroke-linejoin="round"/>${shine(64, 72)}
      ${eyeArcUp(66, 88, 11)}${eyeArcUp(83, 88, 11)}${cheek(62, 99)}${cheek(98, 99)}
      ${stroke('M72 100 q8 9 16 0')}
      ${sparkle(24, 30, 1, LILAC)}${sparkle(140, 26, 0.8, CORAL)}`,
  },
  kiss: {
    defs: grad('g', '#FFC6D6', '#FF7A9A'),
    sil: `<circle cx="78" cy="88" r="42"/>${heartSil(126, 84, 1.4)}${heartSil(138, 54, 0.9)}`,
    art: `<circle cx="78" cy="88" r="42" fill="url(#g)"/>${shine(60, 68)}
      ${eyeArcDown(55, 84)}${eyeArcDown(85, 84)}${cheek(54, 98)}${cheek(100, 98)}
      ${stroke('M84 98 q8 2.5 0 6 q8 2.5 0 6', 4.5)}
      ${heart(126, 84, 1.4, CORAL)}${heart(138, 54, 0.9, CORAL)}`,
  },
  party: {
    defs: grad('g', '#FFE38A', '#FF9E86') + grad('h', '#CBB8FF', '#8E6CF0'),
    sil: `<circle cx="80" cy="92" r="40"/><path d="M56 62 L90 20 L108 60 Z" stroke-linejoin="round"/><circle cx="90" cy="20" r="8"/>
      <path d="M22 52 l8 -3 M136 74 l8 3 M26 124 l8 -2 M132 120 l7 4" fill="none" stroke-width="16"/>`,
    art: `${stroke('M22 52 l8 -3', 5, CORAL)}${stroke('M136 74 l8 3', 5, LILAC)}${stroke('M26 124 l8 -2', 5, GOLD)}${stroke('M132 120 l7 4', 5, CORAL)}
      <circle cx="80" cy="92" r="40" fill="url(#g)"/>${shine(62, 76)}
      <path d="M56 62 L90 20 L108 60 Q82 68 56 62 Z" fill="url(#h)" stroke="url(#h)" stroke-width="2" stroke-linejoin="round"/>
      ${stroke('M71 46 L98 50', 4, GOLD)}${stroke('M64 55 L103 58', 4, CORAL)}
      <circle cx="90" cy="20" r="7" fill="${GOLD}"/>
      ${eyeArcUp(60, 90)}${eyeArcUp(88, 90)}${cheek(57, 102)}${cheek(103, 102)}
      <path d="M67 103 Q80 120 93 103 Z" fill="${PLUM}" stroke="${PLUM}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M73 110 Q80 116 87 110 Q80 107 73 110 Z" fill="${CORAL}"/>`,
  },
  sad: {
    defs: grad('g', '#CFE7FF', '#7FB2F5'),
    sil: `<path d="M80 26 C96 52 122 74 122 98 C122 122 103 136 80 136 C57 136 38 122 38 98 C38 74 64 52 80 26 Z"/>`,
    art: `<path d="M80 26 C96 52 122 74 122 98 C122 122 103 136 80 136 C57 136 38 122 38 98 C38 74 64 52 80 26 Z" fill="url(#g)"/>${shine(64, 76, -50)}
      ${stroke('M56 84 l11 -4')}${stroke('M104 84 l-11 -4')}
      <ellipse cx="65" cy="98" rx="6.5" ry="8" fill="${PLUM}"/><circle cx="67" cy="94.5" r="2.5" fill="#fff"/>
      <ellipse cx="95" cy="98" rx="6.5" ry="8" fill="${PLUM}"/><circle cx="97" cy="94.5" r="2.5" fill="#fff"/>
      <path d="M100 108 q-5 8 0 11 q5 -3 0 -11 z" fill="#fff" opacity=".9"/>
      ${stroke('M71 122 q9 -7 18 0')}`,
  },
  jealous: {
    defs: grad('g', '#D9F2B8', '#8CCB7E'),
    sil: `<circle cx="80" cy="88" r="42"/>`,
    art: `<circle cx="80" cy="88" r="42" fill="url(#g)"/>${shine(62, 68)}
      <path d="M52 88 a10 8 0 0 0 20 0 z" fill="#fff"/><circle cx="67" cy="91" r="3.8" fill="${PLUM}"/>
      <path d="M86 88 a10 8 0 0 0 20 0 z" fill="#fff"/><circle cx="101" cy="91" r="3.8" fill="${PLUM}"/>
      ${stroke('M50 88 h24')}${stroke('M84 88 h24')}
      ${stroke('M72 110 q10 -5 20 2')}`,
  },
  cool: {
    defs: grad('g', '#FFDD7A', '#FF9F5A'),
    sil: `<circle cx="80" cy="88" r="42"/>`,
    art: `<circle cx="80" cy="88" r="42" fill="url(#g)"/>${shine(62, 66)}
      <rect x="50" y="76" width="27" height="17" rx="7" fill="${PLUM}"/><rect x="83" y="76" width="27" height="17" rx="7" fill="${PLUM}"/>
      ${stroke('M77 81 h6', 4)}${stroke('M50 80 l-8 -4', 4)}${stroke('M110 80 l8 -4', 4)}
      ${stroke('M56 80 l6 8', 2.5, '#fff')}${stroke('M89 80 l6 8', 2.5, '#fff')}
      ${cheek(54, 102)}${cheek(106, 102)}
      ${stroke('M70 108 q11 7 22 -3')}`,
  },
  angel: {
    defs: grad('g', '#FFFDF7', '#FFDDC4'),
    sil: `<circle cx="80" cy="92" r="40"/><ellipse cx="80" cy="40" rx="28" ry="9" fill="none" stroke-width="20"/>
      <path d="M44 88 C24 76 16 100 28 108 C20 116 30 128 46 118 Z M116 88 C136 76 144 100 132 108 C140 116 130 128 114 118 Z"/>`,
    art: `<path d="M44 88 C24 76 16 100 28 108 C20 116 30 128 46 118 Z M116 88 C136 76 144 100 132 108 C140 116 130 128 114 118 Z" fill="#EDE6FF" stroke="${LILAC}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="80" cy="92" r="40" fill="url(#g)"/>${shine(62, 74)}
      <ellipse cx="80" cy="40" rx="28" ry="9" fill="none" stroke="${GOLD}" stroke-width="6"/>
      ${eyeArcUp(60, 92)}${eyeArcUp(88, 92)}${cheek(57, 104)}${cheek(103, 104)}
      ${stroke('M70 106 q10 9 20 0')}`,
  },
  devil: {
    defs: grad('g', '#D2B4FF', '#8A63EE'),
    sil: `<circle cx="80" cy="92" r="40"/><path d="M50 66 C42 50 44 36 52 26 C56 42 64 52 70 56 Z M110 66 C118 50 116 36 108 26 C104 42 96 52 90 56 Z" stroke-linejoin="round"/>`,
    art: `<path d="M50 66 C42 50 44 36 52 26 C56 42 64 52 70 56 Z M110 66 C118 50 116 36 108 26 C104 42 96 52 90 56 Z" fill="#FF5C7A" stroke="#FF5C7A" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="80" cy="92" r="40" fill="url(#g)"/>${shine(62, 74)}
      ${stroke('M57 82 l13 6')}${stroke('M103 82 l-13 6')}
      ${eyeDot(66, 94)}${eyeDot(94, 94)}
      <path d="M62 104 Q80 124 98 104 Q80 112 62 104 Z" fill="${PLUM}" stroke="${PLUM}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M86 107 l4 7 l3 -8 z" fill="#fff"/>`,
  },
  shy: {
    defs: grad('g', '#FFD9CC', '#FFA79A'),
    sil: `<circle cx="80" cy="86" r="42"/><circle cx="46" cy="108" r="11"/><circle cx="114" cy="108" r="11"/>${sparkleSil(132, 40, 0.8)}`,
    art: `<circle cx="80" cy="86" r="42" fill="url(#g)"/>${shine(62, 64)}
      ${eyeArcDown(58, 88, 12)}${eyeArcDown(90, 88, 12)}
      <ellipse cx="56" cy="100" rx="11" ry="6.5" fill="${CORAL}" opacity=".6"/><ellipse cx="104" cy="100" rx="11" ry="6.5" fill="${CORAL}" opacity=".6"/>
      ${stroke('M73 108 q3.5 -3 7 0 q3.5 3 7 0', 3.8)}
      <circle cx="48" cy="106" r="10" fill="#FFB3A4"/><circle cx="112" cy="106" r="10" fill="#FFB3A4"/>
      ${sparkle(132, 40, 0.8, GOLD)}`,
  },
  melting: {
    defs: grad('g', '#FFD27A', '#FF9257'),
    sil: `<path d="M40 92 C40 62 58 44 80 44 C102 44 120 62 120 92 L120 112 C120 120 112 120 112 112 C112 104 104 104 104 112 L104 124 C104 132 94 132 94 124 L94 116 C94 110 86 110 86 116 L86 130 C86 140 74 140 74 130 L74 118 C74 112 66 112 66 118 C66 124 56 124 56 118 L56 112 C56 106 48 106 48 112 C48 118 40 118 40 110 Z"/><ellipse cx="80" cy="142" rx="40" ry="6"/><path d="M118 52 q-6 9 0 12 q6 -3 0 -12 z"/>`,
    art: `<ellipse cx="80" cy="142" rx="40" ry="6" fill="#FFAE66"/>
      <path d="M40 92 C40 62 58 44 80 44 C102 44 120 62 120 92 L120 112 C120 120 112 120 112 112 C112 104 104 104 104 112 L104 124 C104 132 94 132 94 124 L94 116 C94 110 86 110 86 116 L86 130 C86 140 74 140 74 130 L74 118 C74 112 66 112 66 118 C66 124 56 124 56 118 L56 112 C56 106 48 106 48 112 C48 118 40 118 40 110 Z" fill="url(#g)"/>${shine(62, 64)}
      ${stroke('M56 80 q7 6 14 0')}${stroke('M90 80 q7 6 14 0')}
      ${stroke('M69 98 q5.5 -4 11 0 q5.5 4 11 0', 4)}
      <path d="M118 52 q-6 9 0 12 q6 -3 0 -12 z" fill="${TEAR}"/>`,
  },
  pizza: {
    defs: grad('g', '#FFE58F', '#FFB347', 0.5, 0, 0.5, 1),
    sil: `<path d="M28 46 Q80 22 132 46 L86 138 Q80 146 74 138 Z" stroke-linejoin="round"/>`,
    art: `<path d="M30 48 Q80 26 130 48 L85 136 Q80 143 75 136 Z" fill="url(#g)"/>
      ${stroke('M30 48 Q80 26 130 48', 13, '#E9A25A')}
      <circle cx="58" cy="66" r="7" fill="${CORAL}"/><circle cx="104" cy="64" r="6.5" fill="${CORAL}"/><circle cx="84" cy="112" r="6" fill="${CORAL}"/>
      ${eyeDot(70, 78, 4.2)}${eyeDot(92, 78, 4.2)}
      ${stroke('M72 90 q9 8 18 0', 4)}`,
  },
  plane: {
    defs: grad('g', '#FF97A8', '#FF5C7A') + grad('h', '#CBB8FF', '#9E86F5'),
    sil: `<rect x="34" y="52" width="92" height="76" rx="18"/><path d="M62 52 v-14 h36 v14" fill="none" stroke-width="22"/><circle cx="52" cy="134" r="8"/><circle cx="108" cy="134" r="8"/>`,
    art: `${stroke('M62 52 v-14 h36 v14', 7, '#9AA0B8')}
      <circle cx="52" cy="133" r="7" fill="${PLUM}"/><circle cx="108" cy="133" r="7" fill="${PLUM}"/>
      <rect x="34" y="52" width="92" height="76" rx="18" fill="url(#g)"/>
      <rect x="34" y="70" width="92" height="9" fill="#fff" opacity=".35"/>
      ${shine(52, 62, -20)}
      ${eyeArcUp(60, 98)}${eyeArcUp(88, 98)}${cheek(56, 108)}${cheek(104, 108)}
      ${stroke('M72 110 q8 8 16 0')}
      <rect x="96" y="84" width="20" height="13" rx="4" fill="url(#h)" transform="rotate(12 106 90)"/>
      ${heart(106, 91, 0.6, '#fff')}`,
  },
  goodnight: {
    defs: grad('g', '#FFF3C4', '#FFC95C') + `<mask id="m"><rect width="160" height="160" fill="#fff"/><circle cx="106" cy="66" r="40" fill="#000"/></mask><mask id="n"><rect width="160" height="160" fill="#fff"/><circle cx="106" cy="66" r="33" fill="#000"/></mask>`,
    sil: `<circle cx="78" cy="86" r="59" mask="url(#n)"/>${sparkleSil(118, 34, 0.9)}${sparkleSil(140, 74, 0.6)}`,
    art: `<circle cx="78" cy="86" r="52" fill="url(#g)" mask="url(#m)"/>
      ${shine(48, 74, -60)}
      ${eyeArcDown(46, 96, 12)}${eyeArcDown(68, 106, 12)}
      ${cheek(44, 108)}
      ${stroke('M58 118 q7 5 14 0', 4)}
      ${sparkle(118, 34, 0.9, LILAC)}${sparkle(140, 74, 0.6, GOLD)}`,
  },
  freezing: {
    defs: grad('g', '#EAF8FF', '#9ED6F5'),
    sil: `<rect x="38" y="46" width="84" height="84" rx="20"/><path d="M24 70 q-6 10 0 20 M136 70 q6 10 0 20" fill="none" stroke-width="14"/>${sparkleSil(132, 36, 0.8)}`,
    art: `${stroke('M24 70 q-6 10 0 20', 4, '#8EC5FF')}${stroke('M136 70 q6 10 0 20', 4, '#8EC5FF')}
      <rect x="38" y="46" width="84" height="84" rx="20" fill="url(#g)"/>
      <rect x="44" y="52" width="72" height="72" rx="15" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
      ${shine(60, 62, -30)}
      ${stroke('M56 82 l9 5 l-9 5')}${stroke('M104 82 l-9 5 l-9 5')}
      <rect x="64" y="100" width="32" height="14" rx="5" fill="#fff" stroke="${PLUM}" stroke-width="3.5"/>
      ${stroke('M72 101 v12 M80 101 v12 M88 101 v12', 2.5)}
      ${sparkle(132, 36, 0.8, '#8EC5FF')}`,
  },
};

export function moodSVG(id, { size = 160 } = {}) {
  const m = moods[id];
  if (!m) throw new Error(`unknown mood ${id}`);
  // Prefix ids so several moods can be inlined on the same web page.
  const scope = (markup) => markup.replace(/id="(\w+)"/g, `id="${id}-$1"`).replace(/url\(#(\w+)\)/g, `url(#${id}-$1)`);
  return scope(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="${size}" height="${size}">
  <defs>
    ${m.defs}
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${PLUM}" flood-opacity=".22"/></filter>
  </defs>
  <g fill="#fff" stroke="#fff" stroke-width="14" stroke-linejoin="round" stroke-linecap="round" filter="url(#shadow)">${m.sil}</g>
  ${m.art}
</svg>`);
}
