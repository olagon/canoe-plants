// A field guide page for one plant. The same structure for every plant, built from plants.json.
import { load, plantBySlug } from '../data.js';
import { esc, haw, paras, picture, heroImage, PART_LABELS, USE_LABELS } from '../util.js';
import { progress } from '../progress.js';
import { icon } from '../components/icon.js';
import { creditLine, creditMap } from '../components/credit.js';

const STATUS_NOTE = {
  debated: 'Scientists are not fully sure about this one. It was probably brought by voyagers, but some botanists think it may have reached Hawaiʻi on its own, floating across the sea before any canoe.',
  reclassified: 'For a long time everyone called this a canoe plant. Then new evidence showed it was already growing in Hawaiʻi before people arrived. Science changed its mind, and that is how science is supposed to work.',
};

export default async function plantView({ params }) {
  const found = await plantBySlug(params.slug);
  if (!found) return null;
  const { plant: p, prev, next } = found;
  const [sources, credits] = await Promise.all([load('sources'), load('credits')]);
  const credit = creditMap(credits);
  const hero = heroImage(p);

  // group uses by plant part, in the order the parts first appear
  const byPart = new Map();
  for (const u of p.uses) byPart.set(u.part, [...(byPart.get(u.part) || []), u.text]);

  const html = `
  <article class="plant">
    <header class="plant-hero">
      ${hero ? `<figure class="plant-hero__photo">${picture(hero, { lazy: false })}</figure>` : ''}
      <div class="wrap">
        <div class="plant-hero__label${hero ? '' : ' plant-hero__label--bare'}">
          <h1 class="plant-name" lang="haw">${esc(p.nameHaw)}</h1>
          <p class="plant-say">
            <span lang="haw">${esc(p.nameHaw)}</span> <span class="plant-say__guide">(${esc(p.pronunciation)})</span>
            <button type="button" class="link-btn" popovertarget="say-it">How to say it</button>
          </p>
          ${hero ? creditLine(credit[hero.creditId]) : ''}
        </div>
      </div>
      <div id="say-it" popover class="say-popover">
        <h2>How to say Hawaiian names</h2>
        <p>The <span lang="haw">ʻokina</span> (ʻ) is a quick catch in the throat, like the break in the middle of "uh-oh."</p>
        <p>The <span lang="haw">kahakō</span> is the line over a vowel, like ā. It means hold that vowel a little longer.</p>
        <p>Vowels sound like this. A as in "ah," e as in "bet," i as in "see," o as in "go," u as in "moon."</p>
        <button type="button" class="btn" popovertarget="say-it" popovertargetaction="hide">Got it</button>
      </div>
    </header>

    <section class="wrap plant-id" aria-label="Names and origin">
      <dl class="plant-names">
        <div><dt>Common name</dt><dd>${esc(p.nameCommon)}</dd></div>
        <div><dt>Scientific name</dt><dd class="sci">${esc(p.nameSci)}</dd></div>
        <div><dt>Family</dt><dd>${esc(p.family)}</dd></div>
        <div><dt>Came from</dt><dd>${esc(p.originRegion)}</dd></div>
        <div><dt>Used for</dt><dd>${p.useTags.map(t => `<a href="#/plants?use=${t}">${USE_LABELS[t]}</a>`).join(', ')}</dd></div>
      </dl>
      ${STATUS_NOTE[p.status] ? `<p class="status-note">${haw(STATUS_NOTE[p.status])}</p>` : ''}
    </section>

    <section class="wrap section--tight plant-why">
      <h2>Why it was in the canoe</h2>
      <p class="lede">${haw(p.whyInCanoe)}</p>
    </section>

    <section class="ground-lau plant-uses kapa-field">
      <div class="wrap section">
        <h2>How Hawaiians used it</h2>
        <ul class="uses">
          ${[...byPart].map(([part, texts]) => `
          <li>${icon(part)}<h3>${PART_LABELS[part] || esc(part)}</h3>
            <ul>${texts.map(t => `<li>${haw(t)}</li>`).join('')}</ul></li>`).join('')}
        </ul>
      </div>
    </section>

    <section class="ground-olena plant-facts">
      <div class="wrap section">
        <h2>Crazy cool facts</h2>
        <ol class="facts">
          ${p.facts.map(f => `<li><p>${haw(f.text)}</p></li>`).join('')}
        </ol>
      </div>
    </section>
    <div id="met-sentinel"></div>

    <section class="ground-kapa-light plant-moolelo">
      <div class="kapa-band kapa-band--fg" data-pattern="diamond" aria-hidden="true"></div>
      <div class="wrap wrap--narrow section">
        <p class="plant-moolelo__label"><span lang="haw">Moʻolelo</span>, a story from Hawaiian tradition</p>
        <h2>${haw(p.moolelo.title)}</h2>
        <div class="prose">${paras(p.moolelo.text)}</div>
        ${p.moolelo.kinolau ? `<p class="plant-moolelo__kinolau">${haw(p.nameHaw)} is a <a href="#/glossary?q=kinolau"><span lang="haw">kinolau</span></a>, a body form, of ${haw(p.moolelo.kinolau)}.</p>` : ''}
      </div>
      <div class="kapa-band kapa-band--fg" data-pattern="diamond" aria-hidden="true"></div>
    </section>

    <section class="wrap section plant-now">
      <div>
        <h2>Today</h2>
        <div class="prose">${paras(p.today)}</div>
      </div>
      <div>
        <h2>Grow it</h2>
        <dl class="grow">
          <div><dt>Sun</dt><dd>${haw(p.grow.sun)}</dd></div>
          <div><dt>Water</dt><dd>${haw(p.grow.water)}</dd></div>
          <div><dt>Planting</dt><dd>${haw(p.grow.planting)}</dd></div>
          <div><dt>Harvest</dt><dd>${haw(p.grow.harvest)}</dd></div>
        </dl>
      </div>
    </section>

    ${p.images.length ? `
    <section class="wrap section--tight plant-gallery">
      <h2>Gallery</h2>
      <div class="swiper gallery">
        <div class="swiper-wrapper">
          ${p.images.map(img => `
          <figure class="swiper-slide">
            ${picture(img, { sizes: '(min-width: 60rem) 45vw, 90vw' })}
            <figcaption>${creditLine(credit[img.creditId])}</figcaption>
          </figure>`).join('')}
        </div>
        <div class="swiper-button-prev"></div><div class="swiper-button-next"></div>
        <div class="swiper-pagination"></div>
      </div>
    </section>` : ''}

    <section class="wrap section--tight plant-sources">
      <h2>Sources for this plant</h2>
      <ul class="source-list">
        ${p.sources.map(id => sourceItem(sources[id], id)).join('')}
      </ul>
    </section>

    <footer class="wrap plant-foot">
      <div class="cluster">
        <button type="button" class="btn" id="met-btn" aria-pressed="false"></button>
        <button type="button" class="btn btn--ghost" id="print-btn">Print fact sheet</button>
      </div>
      <nav class="plant-pager" aria-label="More plants">
        <a href="#/plant/${prev.slug}"><span class="small muted">Previous plant</span><span class="plant-pager__name" lang="haw">${esc(prev.nameHaw)}</span></a>
        <a href="#/plants"><span class="small muted">Back to</span><span class="plant-pager__name">All plants</span></a>
        <a href="#/plant/${next.slug}"><span class="small muted">Next plant</span><span class="plant-pager__name" lang="haw">${esc(next.nameHaw)}</span></a>
      </nav>
    </footer>
  </article>`;

  let swiper, observer;
  function mount(main) {
    const btn = main.querySelector('#met-btn');
    const paint = () => {
      const on = progress.isMet(p.slug);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? `You have met ${p.nameHaw}. Undo` : 'Mark as met';
    };
    btn.addEventListener('click', () => { progress.setMet(p.slug, !progress.isMet(p.slug)); paint(); });
    paint();

    // Reading past the facts counts as meeting the plant.
    observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { progress.setMet(p.slug); paint(); observer.disconnect(); }
    });
    observer.observe(main.querySelector('#met-sentinel'));

    main.querySelector('#print-btn').addEventListener('click', () => window.print());

    if (window.Swiper && main.querySelector('.gallery')) {
      swiper = new Swiper(main.querySelector('.gallery'), {
        slidesPerView: 1.08, spaceBetween: 12, keyboard: { enabled: true }, a11y: true,
        breakpoints: { 960: { slidesPerView: 2.15, spaceBetween: 20 } },
        navigation: { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' },
        pagination: { el: '.swiper-pagination', clickable: true },
      });
    }
  }

  return {
    title: `${p.nameHaw}, ${p.nameCommon}`,
    ground: 'ground-kapa',
    html, mount,
    unmount() { swiper?.destroy(); observer?.disconnect(); },
  };
}

export function sourceItem(s, id) {
  if (!s) return `<li>${esc(id)}</li>`;
  const who = [s.author, s.year].filter(Boolean).join(', ');
  const title = s.url ? `<a href="${esc(s.url)}" rel="noopener">${haw(s.title)}</a>` : haw(s.title);
  return `<li>${title}${who ? `. ${haw(who)}` : ''}</li>`;
}
