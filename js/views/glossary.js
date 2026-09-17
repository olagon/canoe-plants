// Glossary: every Hawaiian word used on the site, searchable.
import { load } from '../data.js';
import { esc, haw, plain } from '../util.js';

export default async function glossaryView({ query }) {
  const terms = await load('glossary');
  const start = query.get('q') || '';

  const html = `
  <div class="wrap view-head">
    <h1>Glossary</h1>
    <p class="lede">${terms.length} Hawaiian words that show up on this site, with a simple guide to saying each one.</p>
  </div>
  <div class="wrap glossary-search">
    <label for="glossary-q">Search the words</label>
    <input class="field" id="glossary-q" type="search" value="${esc(start)}" placeholder="Type a Hawaiian or English word" autocomplete="off">
    <p role="status" aria-live="polite" class="small muted" id="glossary-count"></p>
  </div>
  <dl class="wrap glossary" id="glossary-list">
    ${terms.map((t, i) => `
    <div class="glossary__item" data-i="${i}">
      <dt><span class="glossary__term" lang="haw">${esc(t.term)}</span> <span class="glossary__say">${esc(t.pronunciation)}</span></dt>
      <dd>${haw(t.definition)}</dd>
    </div>`).join('')}
  </dl>`;

  function mount(main) {
    const index = terms.map(t => plain(`${t.term} ${t.definition}`));
    const items = [...main.querySelectorAll('.glossary__item')];
    const count = main.querySelector('#glossary-count');
    const filter = q => {
      const needle = plain(q.trim());
      let n = 0;
      items.forEach((el, i) => { el.hidden = !index[i].includes(needle); if (!el.hidden) n++; });
      count.textContent = needle ? `${n} ${n === 1 ? 'word matches' : 'words match'}` : '';
    };
    main.querySelector('#glossary-q').addEventListener('input', e => filter(e.target.value));
    filter(start);
  }
  return { title: 'Glossary', ground: 'ground-kapa', html, mount };
}
