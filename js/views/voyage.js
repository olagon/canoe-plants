// The voyage: a hand built SVG map of the Pacific, the routes, where each plant started, and the timeline.
import { loadAll } from '../data.js';
import { esc, haw, reducedMotion, ORIGIN_LABELS } from '../util.js';

const W = 1000, H = 520;
// plain equirectangular, recentered on the Pacific. Matches tools/map.py
const project = ([lon, lat]) => [((lon < -25 ? lon + 360 : lon) - 95) * 5, (52 - lat) * 5];

// a smooth line through the waypoints
function curve(points) {
  const p = points.map(project);
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${p[i][0]},${p[i][1]} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const last = p[p.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

export default async function voyageView() {
  const [map, timeline, plants, sources] = await loadAll('voyage-map', 'timeline', 'plants', 'sources');
  const land = await fetch('assets/svg/pacific.svg').then(r => r.text()).then(t => t.match(/ d="([^"]+)"/)?.[1] || '');
  const plantsAt = key => plants.filter(p => p.originMapKey === key);

  const svg = `
  <svg class="pacific" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="map-title map-desc">
    <title id="map-title">Map of the Pacific Ocean</title>
    <desc id="map-desc">Asia and Australia on the left, the Americas on the right, Hawaiʻi near the top. Lines show the routes of Polynesian voyagers. Use the lists below the map to explore each route and region.</desc>
    <path class="pacific__land" d="${land}"/>
    <g class="pacific__routes">
      ${map.routes.map(r => [r.points, r.points2].filter(Boolean).map(pts =>
        `<path class="route${r.alt ? ' route--alt' : ''}${r.faint ? ' route--faint' : ''}${r.pause ? ' route--pause' : ''}" data-route="${r.key}" pathLength="1" d="${curve(pts)}"/>`).join('')).join('')}
    </g>
    <g class="pacific__places">
      ${map.places.map(pl => {
        const [x, y] = project([pl.lon, pl.lat]);
        return `${pl.noDot ? '' : pl.star
          ? `<path class="place-star" d="M${x},${y - 9}l2.6,6 6.4,.6-4.9,4.3 1.5,6.3L${x},${y + 4}l-5.6,3.2 1.5-6.3-4.9-4.3 6.4-.6z"/>`
          : `<circle class="place-dot" cx="${x}" cy="${y}" r="3"/>`}
        <text class="place-label${pl.star ? ' place-label--star' : ''}" x="${x + (pl.dx || 0)}" y="${y + (pl.dy || 0)}" text-anchor="${pl.anchor || 'start'}" ${/[ʻā]/.test(pl.name) ? 'lang="haw"' : ''}>${esc(pl.name)}</text>`;
      }).join('')}
    </g>
    <g class="pacific__origins" aria-hidden="true">
      ${map.origins.map(o => {
        const [x, y] = project([o.lon, o.lat]);
        return `<g class="origin" data-origin="${o.key}" transform="translate(${x} ${y})"><circle r="13"/><text y="5" text-anchor="middle">${plantsAt(o.key).length}</text></g>`;
      }).join('')}
    </g>
  </svg>`;

  const html = `
  <div class="wrap view-head">
    <h1>The voyage</h1>
    <p class="lede">${haw(map.intro)}</p>
  </div>
  <div class="map-scroll" tabindex="0" role="group" aria-label="Map of the Pacific, scrolls sideways on small screens">${svg}</div>
  <p class="wrap small muted map-key"><span class="map-key__dot"></span> A gold circle shows how many canoe plants started in that region. Land shapes from Natural Earth.</p>

  <div class="wrap voyage-controls">
    <section aria-labelledby="routes-h">
      <h2 id="routes-h">The routes</h2>
      <ol class="voyage-list">
        ${map.routes.map((r, i) => `<li><button type="button" data-route-btn="${r.key}" aria-pressed="false"><span class="voyage-list__n">${i + 1}</span><span><strong>${haw(r.title)}</strong><br><span class="small muted">${esc(r.when)}</span></span></button></li>`).join('')}
      </ol>
      <button type="button" class="btn btn--ghost" id="replay">Replay the whole voyage</button>
    </section>
    <section aria-labelledby="origins-h">
      <h2 id="origins-h">Where the plants started</h2>
      <ul class="voyage-list">
        ${map.origins.map(o => `<li><button type="button" data-origin-btn="${o.key}" aria-pressed="false"><span class="voyage-list__n voyage-list__n--gold">${plantsAt(o.key).length}</span><span><strong>${esc(ORIGIN_LABELS[o.key])}</strong></span></button></li>`).join('')}
      </ul>
    </section>
    <section class="voyage-detail panel" aria-live="polite" id="voyage-detail">
      <h2>Pick a route or a region</h2>
      <p>Tap any leg of the journey to watch it draw on the map. Tap a region to see which plants began there.</p>
    </section>
  </div>

  <div class="kapa-band" data-pattern="chevron" aria-hidden="true"></div>

  <section class="ground-kapa">
    <div class="wrap section">
      <h2>A timeline of the voyage</h2>
      <ol class="timeline">
        ${timeline.events.map(e => `<li><p class="timeline__when">${esc(e.when)}</p><div><h3>${haw(e.title)}</h3><p>${haw(e.text)}</p>${cite(sources[e.source])}</div></li>`).join('')}
      </ol>
    </div>
  </section>

  <section class="ground-kapa-light">
    <div class="kapa-band kapa-band--fg" data-pattern="dots" aria-hidden="true"></div>
    <div class="wrap section">
      <h2>How do we know?</h2>
      <p class="lede" style="margin-top: var(--s-4)">Nobody wrote any of this down at the time. So scientists and Hawaiian scholars put the story together from four kinds of clues. They all point the same way.</p>
      <ul class="how-know">
        ${timeline.howWeKnow.map(k => `<li><h3>${haw(k.title)}</h3><p>${haw(k.text)}</p>${cite(sources[k.source])}</li>`).join('')}
      </ul>
    </div>
  </section>`;

  function mount(main) {
    const detail = main.querySelector('#voyage-detail');
    const routes = [...main.querySelectorAll('.route')];
    const press = (sel, key) => main.querySelectorAll(sel).forEach(b =>
      b.setAttribute('aria-pressed', String((b.dataset.routeBtn || b.dataset.originBtn) === key)));
    const clearMarks = () => {
      press('[data-route-btn], [data-origin-btn]', null);
      main.querySelectorAll('.origin').forEach(o => o.classList.remove('is-on'));
    };

    function draw(keys, stagger = 0) {
      routes.forEach(r => {
        const i = keys.indexOf(r.dataset.route);
        r.classList.remove('is-drawn');
        r.style.transitionDelay = '0s';
        if (i < 0) return;
        void r.getBoundingClientRect(); // restart the transition
        r.style.transitionDelay = `${i * stagger}s`;
        r.classList.add('is-drawn');
      });
      main.querySelector('.pacific').classList.toggle('is-focused', keys.length === 1);
    }

    function showRoute(key) {
      const r = map.routes.find(x => x.key === key);
      clearMarks(); press('[data-route-btn]', key);
      draw([key]);
      detail.innerHTML = `<p class="small muted">${esc(r.when)}</p><h2>${haw(r.title)}</h2><p>${haw(r.text)}</p>`;
    }

    function showOrigin(key) {
      const o = map.origins.find(x => x.key === key);
      clearMarks(); press('[data-origin-btn]', key);
      main.querySelector(`.origin[data-origin="${key}"]`).classList.add('is-on');
      const list = plantsAt(key);
      detail.innerHTML = `<p class="small muted">${list.length} ${list.length === 1 ? 'plant' : 'plants'} started here</p>
        <h2>${esc(ORIGIN_LABELS[key])}</h2><p>${haw(o.blurb)}</p>
        <ul class="origin-plants">${list.map(p => `<li><a href="#/plant/${p.slug}"><span lang="haw">${esc(p.nameHaw)}</span> <span class="small">${esc(p.nameCommon)}</span></a></li>`).join('')}</ul>
        <p><a href="#/plants?origin=${key}">See these plants on the wall</a></p>`;
    }

    main.addEventListener('click', e => {
      const rb = e.target.closest('[data-route-btn]'), ob = e.target.closest('[data-origin-btn]'), og = e.target.closest('.origin');
      if (rb) showRoute(rb.dataset.routeBtn);
      else if (ob) showOrigin(ob.dataset.originBtn);
      else if (og) { showOrigin(og.dataset.origin); detail.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); }
      else if (e.target.closest('#replay')) { clearMarks(); draw(map.routes.map(r => r.key), 1.1); }
    });

    // one gentle draw on first view
    draw(map.routes.map(r => r.key), reducedMotion() ? 0 : 0.9);
    // start phones centered on the middle of the ocean
    const scroller = main.querySelector('.map-scroll');
    scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * 0.45;
  }

  return { title: 'The voyage', ground: 'ground-kai', html, mount };
}

const cite = s => s ? `<p class="small muted cite">Source: ${s.url ? `<a href="${esc(s.url)}" rel="noopener">${haw(s.title)}</a>` : haw(s.title)}</p>` : '';
