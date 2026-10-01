// Renders the Morni design assets (moods, app icon) to SVG + PNG for iOS and web.
// Usage: cd design/scripts && npm i && npm run build
// Uses the Playwright Chromium (set CHROMIUM_PATH to override the executable).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { moods, moodSVG } from './moods.mjs';
import { appIconSVG } from './icon.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const moodList = JSON.parse(readFileSync(join(root, 'design/moods/moods.json'), 'utf8'));
const iosShared = join(root, 'ios/Shared/Resources/Shared.xcassets');
const iosApp = join(root, 'ios/Morni/Resources/Assets.xcassets');
const webPublic = join(root, 'web/public');

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const dir = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
  return dir ? join(base, dir, 'chrome-linux', 'chrome') : undefined;
}

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function renderPNG(svg, size, out, { background = 'transparent' } = {}) {
  await page.setViewportSize({ width: size, height: size });
  const sized = svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
  await page.setContent(`<html><body style="margin:0;background:${background}">${sized}</body></html>`);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, omitBackground: background === 'transparent', clip: { x: 0, y: 0, width: size, height: size } });
}

const writeJSON = (path, obj) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(obj, null, 2) + '\n'); };

// Moods: 80pt base (@2x = 160, @3x = 240) for iOS, 256px PNG + SVG for web.
writeJSON(join(iosShared, 'Contents.json'), { info: { author: 'xcode', version: 1 } });
writeJSON(join(iosShared, 'Moods/Contents.json'), { info: { author: 'xcode', version: 1 }, properties: { 'provides-namespace': false } });
for (const { id } of moodList) {
  if (!moods[id]) throw new Error(`missing artwork for ${id}`);
  const svg = moodSVG(id);
  writeFileSync(join(root, `design/moods/${id}.svg`), svg + '\n');
  const set = join(iosShared, `Moods/mood-${id}.imageset`);
  await renderPNG(svg, 160, join(set, `mood-${id}@2x.png`));
  await renderPNG(svg, 240, join(set, `mood-${id}@3x.png`));
  writeJSON(join(set, 'Contents.json'), {
    images: [
      { idiom: 'universal', scale: '1x' },
      { filename: `mood-${id}@2x.png`, idiom: 'universal', scale: '2x' },
      { filename: `mood-${id}@3x.png`, idiom: 'universal', scale: '3x' },
    ],
    info: { author: 'xcode', version: 1 },
  });
  mkdirSync(join(webPublic, 'moods'), { recursive: true });
  writeFileSync(join(webPublic, `moods/${id}.svg`), svg + '\n');
  await renderPNG(svg, 256, join(webPublic, `moods/${id}.png`));
}

// App icon: 1024 opaque PNG for iOS, favicons + apple-touch-icon for web.
const icon = appIconSVG();
writeFileSync(join(root, 'design/app-icon.svg'), icon + '\n');
await renderPNG(icon, 1024, join(iosApp, 'AppIcon.appiconset/AppIcon.png'), { background: '#FF6B81' });
writeJSON(join(iosApp, 'Contents.json'), { info: { author: 'xcode', version: 1 } });
writeJSON(join(iosApp, 'AppIcon.appiconset/Contents.json'), {
  images: [{ filename: 'AppIcon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
  info: { author: 'xcode', version: 1 },
});
await renderPNG(icon, 180, join(webPublic, 'apple-touch-icon.png'), { background: '#FF6B81' });
await renderPNG(icon, 512, join(webPublic, 'icon-512.png'), { background: '#FF6B81' });
writeFileSync(join(webPublic, 'icon.svg'), icon + '\n');

// Preview sheet (for reviews / pitch).
const cells = moodList.map(({ id, premium, label }) => `
  <div class="cell"><img src="data:image/svg+xml;base64,${Buffer.from(moodSVG(id)).toString('base64')}"/>
  <b>${label.en}</b><span>${label.fr} · ${label.es}</span>${premium ? '<i>Morni+</i>' : ''}</div>`).join('');
await page.setViewportSize({ width: 1100, height: 900 });
await page.setContent(`<html><head><style>
  body{margin:0;font-family:-apple-system,system-ui,sans-serif;background:linear-gradient(160deg,#FFF6EF,#FFE3D6 60%,#EDE6FF);color:#2B1033}
  h1{font:600 38px Georgia,serif;font-style:italic;margin:36px 48px 8px}
  p{margin:0 48px 24px;opacity:.7}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:0 36px}
  .cell{display:flex;flex-direction:column;align-items:center;text-align:center;padding:8px 4px 18px;border-radius:24px;background:rgba(255,255,255,.55);position:relative}
  .cell img{width:140px;height:140px}.cell b{font-size:15px;margin-top:4px}.cell span{font-size:12px;opacity:.65;margin-top:2px}
  .cell i{position:absolute;top:10px;right:10px;font-style:normal;font-size:11px;font-weight:700;color:#fff;background:#FF6B81;border-radius:99px;padding:3px 8px}
</style></head><body><h1>Morni Moods</h1><p>${moodList.length} original stickers — ${moodList.filter((m) => !m.premium).length} free, ${moodList.filter((m) => m.premium).length} Morni+</p><div class="grid">${cells}</div></body></html>`);
await page.screenshot({ path: join(root, 'design/moods/preview.png'), fullPage: true });

await browser.close();
console.log('assets built');
