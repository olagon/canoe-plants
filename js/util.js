// Small shared helpers: escaping, Hawaiian word wrapping, responsive pictures.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ESC[c]);

// Strip ʻokina and kahakō so "olena" finds "ʻŌlena".
export const plain = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯʻ]/g, '').toLowerCase();

// Words with no ʻokina or kahakō that should still be marked as Hawaiian.
// Filled at boot from plant names and glossary terms.
const hawWords = new Set();
const NOT_HAW = new Set(['kilo', 'a', 'i', 'o', 'e', 'no', 'he', 'me', 'pau', 'ma']);
export function learnHawaiian(terms) {
  for (const t of terms) for (const w of t.split(/[\s,]+/)) {
    const k = w.toLowerCase();
    if (k && !NOT_HAW.has(k)) hawWords.add(k);
  }
}

const WORD = /[\p{L}ʻ]+/gu;
const MARKS = /[ʻāēīōūĀĒĪŌŪ]/;
// Escape text and wrap Hawaiian words in <span lang="haw">.
export function haw(text) {
  return esc(text).replace(WORD, w =>
    MARKS.test(w) || hawWords.has(w.toLowerCase()) ? `<span lang="haw">${w}</span>` : w);
}
// Paragraphs from text with blank lines.
export const paras = text => String(text ?? '').split(/\n\n+/).map(p => `<p>${haw(p)}</p>`).join('');

// Responsive <picture>. img.base is the path without size or extension.
export function picture(img, { sizes = '100vw', lazy = true, cls = '' } = {}) {
  if (!img) return '';
  const set = ext => [480, 960, 1600].map(w => `${img.base}-${w}.${ext} ${w}w`).join(', ');
  return `<picture>
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img class="${cls}" src="${img.base}-960.jpg" srcset="${set('jpg')}" sizes="${sizes}"
      alt="${esc(img.alt)}" width="${img.w || 1600}" height="${img.h || 1067}"
      ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">
  </picture>`;
}

export const heroImage = plant => plant.images.find(i => i.role === 'hero') || plant.images[0];

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Deterministic random numbers so layouts are stable between visits.
export function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function shuffle(list, rand = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const USE_LABELS = {
  food: 'Food',
  medicine: 'Medicine',
  'cloth-cordage': 'Cloth and cordage',
  'wood-tools': 'Wood and tools',
  'light-dye': 'Light and dye',
  ceremony: 'Ceremony and protection',
};
export const PART_LABELS = {
  root: 'Root', stem: 'Stem', leaf: 'Leaf', flower: 'Flower', fruit: 'Fruit',
  seed: 'Seed or nut', bark: 'Bark', wood: 'Wood', sap: 'Sap',
};
export const ORIGIN_LABELS = {
  taiwan: 'Taiwan and East Asia',
  sea: 'South and Southeast Asia',
  newguinea: 'New Guinea and Melanesia',
  vanuatu: 'Vanuatu',
  indopacific: 'Indo Pacific coasts',
  southamerica: 'South America',
};

// Libraries load from CDNs with pinned versions, only when a view needs them.
const loaded = {};
const script = src => loaded[src] ??= new Promise((ok, fail) => {
  const el = Object.assign(document.createElement('script'), { src, defer: true, onload: ok, onerror: fail });
  document.head.append(el);
});
const css = href => { loaded[href] ??= document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href })); };
const CDN = 'https://cdn.jsdelivr.net/npm/';
// Each resolves to true when the library is ready and false when it could not load. The site works either way.
export const libs = {
  gsap: () => script('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')
    .then(() => script('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')).then(() => true, () => false),
  swiper: () => { css(`${CDN}swiper@11.1.14/swiper-bundle.min.css`); return script(`${CDN}swiper@11.1.14/swiper-bundle.min.js`).then(() => true, () => false); },
  fuse: () => script(`${CDN}fuse.js@7.0.0/dist/fuse.min.js`).then(() => true, () => false),
  confetti: () => script(`${CDN}canvas-confetti@1.9.3/dist/confetti.browser.min.js`).then(() => true, () => false),
};
