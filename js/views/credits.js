// Sources and credits: every image and every text source.
import { loadAll } from '../data.js';
import { esc, haw } from '../util.js';
import { sourceItem } from './plant.js';

export default async function creditsView() {
  const [credits, sources, plants, companions] = await loadAll('credits', 'sources', 'plants', 'companions');
  const names = Object.fromEntries([...plants.map(p => [p.slug, p.nameHaw]), ...companions.map(c => [`companion-${c.slug}`, c.nameHaw])]);
  const groups = new Map();
  for (const c of credits) groups.set(c.plantSlug, [...(groups.get(c.plantSlug) || []), c]);
  const sorted = Object.entries(sources).sort(([, a], [, b]) => (a.author || a.title).localeCompare(b.author || b.title));

  const html = `
  <div class="wrap view-head">
    <h1>Sources and credits</h1>
  </div>
  <section class="wrap prose">
    <p class="lede">The plants, practices, and stories on this site belong to Hawaiian culture and to the generations of Hawaiian people who carried that knowledge forward. This site is a starting point, not the last word.</p>
    <p>If you want to go deeper, learn from Hawaiian cultural practitioners, farmers, and teachers in your own community. If you find a mistake here, please tell us through the project page on GitHub so we can fix it.</p>
    <h2>Licenses</h2>
    <p>The code for this site is free to reuse under the MIT license. The writing is shared under <a href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener">Creative Commons Attribution 4.0</a>. Each photo keeps the license chosen by its photographer, listed below. Land shapes on the voyage map come from Natural Earth, which is public domain.</p>
    <h2>Photos</h2>
    <p>${credits.length} images, every one public domain or Creative Commons. Thank you to the photographers, and above all to Forest and Kim Starr, whose decades of Hawaiʻi plant photos made this site possible.</p>
  </section>
  <div class="wrap credit-groups">
    ${[...groups].map(([slug, list]) => `
    <section><h3 lang="haw">${esc(names[slug] || slug)}</h3>
      <ul>${list.map(c => `<li><a href="${esc(c.sourceUrl)}" rel="noopener">${haw(c.title)}</a>, by ${esc(c.author)}, <a href="${esc(c.licenseUrl)}" rel="license noopener">${esc(c.license)}</a></li>`).join('')}</ul>
    </section>`).join('')}
  </div>
  <section class="wrap section prose">
    <h2 style="margin-top:0">Text sources</h2>
    <p>Every fact on a plant page lists its sources at the bottom of that page. Here is the full list.</p>
    <ul class="source-list">${sorted.map(([id, s]) => sourceItem(s, id)).join('')}</ul>
  </section>`;
  return { title: 'Sources and credits', ground: 'ground-kapa', html };
}
