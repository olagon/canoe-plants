// The explorer: every plant on one wall, with filters, search, and sort kept in the URL.
import { load } from '../data.js';
import { esc, haw, plain, picture, heroImage, libs, USE_LABELS, PART_LABELS, ORIGIN_LABELS } from '../util.js';
import { progress } from '../progress.js';
import { chipGroup, wireChips } from '../components/chips.js';

const STATUS = { debated: 'Debated', reclassified: 'Reclassified by science' };
const list = v => (v ? v.split(',').filter(Boolean) : []);

export default async function plantsView({ query }) {
  const [plants] = await Promise.all([load('plants'), libs.fuse()]);
  const state = {
    use: list(query.get('use')), part: list(query.get('part')), origin: list(query.get('origin')),
    q: query.get('q') || '', sort: query.get('sort') === 'uses' ? 'uses' : 'name',
  };
  const usedOrigins = Object.fromEntries(Object.entries(ORIGIN_LABELS).filter(([k]) => plants.some(p => p.originMapKey === k)));

  const html = `
  <div class="wrap view-head">
    <h1>The plants</h1>
    <p class="lede">Twenty six plants, one canoe at a time. Filter by what each plant was for, or just wander.</p>
  </div>
  <div class="wrap explorer-controls">
    <div class="explorer-controls__row">
      <label class="sr-only" for="plant-search">Search the plants</label>
      <input class="field" id="plant-search" type="search" placeholder="Search names, uses, and facts" value="${esc(state.q)}" autocomplete="off">
      <label class="explorer-sort">Sort by
        <select class="field" id="plant-sort">
          <option value="name"${state.sort === 'name' ? ' selected' : ''}>Hawaiian name</option>
          <option value="uses"${state.sort === 'uses' ? ' selected' : ''}>Most uses</option>
        </select>
      </label>
    </div>
    <details class="filters">
      <summary>Filters</summary>
      <div class="filters__body">
        ${chipGroup('use', 'What it was for', USE_LABELS, state.use)}
        ${chipGroup('part', 'Part of the plant used', PART_LABELS, state.part)}
        ${chipGroup('origin', 'Where it came from', usedOrigins, state.origin)}
      </div>
    </details>
    <div class="explorer-controls__row">
      <p class="explorer-count" role="status" aria-live="polite"></p>
      <button type="button" class="chip" id="clear-filters" hidden>Clear all filters</button>
    </div>
  </div>
  <ul class="plant-wall" id="plant-wall"></ul>
  <p class="wrap plant-wall__empty" id="wall-empty" hidden>No plant matches all of that. Try removing a filter.</p>
  <p class="wrap small muted photo-note">Every photo is credited on its plant page and on the <a href="#/credits">credits page</a>.</p>`;

  function mount(main) {
    const wall = main.querySelector('#plant-wall');
    const count = main.querySelector('.explorer-count');
    const clear = main.querySelector('#clear-filters');
    const empty = main.querySelector('#wall-empty');
    const filters = main.querySelector('.filters');
    const met = new Set(progress.met());
    const byName = (a, b) => plain(a.nameHaw).localeCompare(plain(b.nameHaw));
    filters.open = innerWidth > 800 || !!(state.use.length + state.part.length + state.origin.length);

    const fuse = window.Fuse && new Fuse(plants.map(p => ({
      slug: p.slug,
      name: plain(`${p.nameHaw} ${p.nameCommon} ${p.nameSci}`),
      text: plain([p.hook, p.whyInCanoe, ...p.facts.map(f => f.text), ...p.uses.map(u => u.text)].join(' ')),
    })), { keys: [{ name: 'name', weight: 3 }, 'text'], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 2 });

    function draw() {
      let shown = plants.filter(p =>
        state.use.every(u => p.useTags.includes(u)) &&
        state.part.every(t => p.partTags.includes(t)) &&
        (!state.origin.length || state.origin.includes(p.originMapKey)));
      const q = plain(state.q.trim());
      if (q.length >= 2) {
        const hits = fuse ? fuse.search(q).map(h => h.item.slug)
          : plants.filter(p => plain(p.nameHaw + p.nameCommon).includes(q)).map(p => p.slug);
        shown = hits.map(s => shown.find(p => p.slug === s)).filter(Boolean);
      } else shown.sort(byName);
      if (state.sort === 'uses') shown.sort((a, b) => b.uses.length - a.uses.length || byName(a, b));

      wall.innerHTML = shown.map(tile).join('');
      count.textContent = shown.length === plants.length ? `Showing all ${plants.length} plants`
        : `Showing ${shown.length} ${shown.length === 1 ? 'plant' : 'plants'}`;
      empty.hidden = shown.length > 0;
      clear.hidden = !(state.use.length || state.part.length || state.origin.length || state.q);

      // Keep the URL in step so a teacher can share "all the medicine plants".
      const params = new URLSearchParams();
      for (const k of ['use', 'part', 'origin']) if (state[k].length) params.set(k, state[k].join(','));
      if (state.q) params.set('q', state.q);
      if (state.sort !== 'name') params.set('sort', state.sort);
      const qs = params.toString().replace(/%2C/g, ',');
      history.replaceState(null, '', `#/plants${qs ? '?' + qs : ''}`);
    }

    const tile = (p, i) => `
      <li><a class="tile" href="#/plant/${p.slug}">
        ${picture(heroImage(p), { sizes: '(min-width: 80rem) 20vw, (min-width: 48rem) 33vw, (min-width: 30rem) 50vw, 60vw', lazy: i > 3 })}
        <span class="tile__text">
          ${STATUS[p.status] ? `<span class="tile__status">${STATUS[p.status]}</span>` : ''}
          <span class="tile__name" lang="haw">${esc(p.nameHaw)}</span>
          <span class="tile__common">${esc(p.nameCommon)}</span>
          <span class="tile__hook">${haw(p.hook)}</span>
        </span>
        ${met.has(p.slug) ? '<span class="tile__met">Met</span>' : ''}
      </a></li>`;

    wireChips(main, (group, values) => { state[group] = values; draw(); });
    main.querySelector('#plant-search').addEventListener('input', e => { state.q = e.target.value; draw(); });
    main.querySelector('#plant-sort').addEventListener('change', e => { state.sort = e.target.value; draw(); });
    clear.addEventListener('click', () => {
      Object.assign(state, { use: [], part: [], origin: [], q: '' });
      main.querySelector('#plant-search').value = '';
      main.querySelectorAll('.chip[aria-pressed="true"]').forEach(c => c.setAttribute('aria-pressed', 'false'));
      draw();
    });
    draw();
  }

  return { title: 'The plants', ground: 'ground-kukui', html, mount };
}
