// Original geometric patterns in the spirit of ʻohe kāpala (bamboo stamp) designs.
// Each pattern is a small SVG tile. CSS uses them as masks so any color works.
// These are generated from simple rules. They do not copy any artist's or museum's design.

const tile = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const row = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');

export const patterns = {
  // niho: a row of teeth between two stamped lines
  niho: () => tile(24, 28,
    `<rect width="24" height="2.5"/><rect y="25.5" width="24" height="2.5"/>
     <polygon points="0,22 12,6 24,22"/>`),

  // chevron: three zigzag strokes
  chevron: () => tile(24, 28, row(3, i =>
    `<polyline points="0,${10 + i * 8} 12,${2 + i * 8} 24,${10 + i * 8}" fill="none" stroke="#000" stroke-width="2.6"/>`)),

  // diamond: nested diamonds with a solid heart
  diamond: () => tile(32, 28,
    `<polygon points="16,1 31,14 16,27 1,14" fill="none" stroke="#000" stroke-width="2.4"/>
     <polygon points="16,8 23,14 16,20 9,14"/>`),

  // dots: dotted lines, like the tip of a bamboo splinter pressed in rows
  dots: () => tile(12, 28, row(3, i => `<circle cx="6" cy="${5 + i * 9}" r="2.4"/>`)),

  // weave: triangles that point up then down
  weave: () => tile(28, 28,
    `<polygon points="0,26 7,14 14,26"/><polygon points="14,2 21,14 28,2"/>
     <rect y="13" width="28" height="2"/>`),

  // field: a quiet all over texture of small diamonds and dots for large surfaces
  field: () => tile(48, 48,
    `<polygon points="24,4 32,12 24,20 16,12"/><polygon points="0,28 8,36 0,44 -8,36"/><polygon points="48,28 56,36 48,44 40,36"/>
     <circle cx="24" cy="36" r="2"/><circle cx="0" cy="12" r="2"/><circle cx="48" cy="12" r="2"/>`),
};

const toUrl = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// Publish every pattern as a CSS custom property, for example var(--pat-niho).
export function installPatterns(root = document.documentElement) {
  for (const [name, make] of Object.entries(patterns)) {
    root.style.setProperty(`--pat-${name}`, toUrl(make()));
  }
}
