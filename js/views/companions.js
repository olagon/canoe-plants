// Voyaging companions: the animals that came in the canoe.
import { loadAll } from '../data.js';
import { esc, haw, picture } from '../util.js';
import { creditLine, creditMap } from '../components/credit.js';
import { sourceItem } from './plant.js';

export default async function companionsView() {
  const [companions, credits, sources] = await loadAll('companions', 'credits', 'sources');
  const credit = creditMap(credits);
  const html = `
  <div class="wrap view-head">
    <h1>Voyaging companions</h1>
    <p class="lede">Plants were not the only passengers. Pigs, dogs, and chickens rode in the canoe on purpose. Rats and a few tiny others came along without asking.</p>
  </div>
  ${companions.map((c, i) => `
  <section class="companion ${i % 2 ? 'ground-kapa-light' : 'ground-kapa'}" aria-labelledby="c-${c.slug}">
    <div class="wrap companion__inner">
      <figure class="companion__photo">${c.images[0] ? picture(c.images[0], { sizes: '(min-width: 60rem) 45vw, 100vw' }) + creditLine(credit[c.images[0].creditId]) : ''}</figure>
      <div class="companion__text">
        <h2 id="c-${c.slug}" lang="haw">${esc(c.nameHaw)}</h2>
        <p class="companion__names">${esc(c.nameCommon)}, <span class="sci">${esc(c.nameSci)}</span> <span class="muted">(${esc(c.pronunciation)})</span></p>
        <p class="companion__hook">${haw(c.hook)}</p>
        <p>${haw(c.intro)}</p>
        <ul>${c.facts.map(f => `<li>${haw(f.text)}</li>`).join('')}</ul>
        <details class="small"><summary>Sources</summary><ul class="source-list">${c.sources.map(id => sourceItem(sources[id], id)).join('')}</ul></details>
      </div>
    </div>
  </section>`).join('')}`;
  return { title: 'Voyaging companions', ground: 'ground-kapa', html };
}
