// Pack the canoe. Pick eight plants, sail, and see how your settlement does.
import { esc, haw, picture, heroImage, reducedMotion } from '../util.js';
import { progress } from '../progress.js';
import { celebrate } from './confetti.js';

export function canoeGame(root, plants, game) {
  const picked = [];
  const bySlug = Object.fromEntries(plants.map(p => [p.slug, p]));
  const max = game.needs.length * game.covered;

  root.innerHTML = `
    <div class="pack__board">
      <div class="pack__canoe" aria-live="polite">
        <div class="canoe">
          <div class="canoe__hull" aria-hidden="true"></div>
          <ol class="canoe__deck">${Array.from({ length: game.slots }, (_, i) => `<li data-slot="${i}"></li>`).join('')}</ol>
          <div class="canoe__hull" aria-hidden="true"></div>
        </div>
        <p class="pack__count"></p>
        <div class="cluster">
          <button type="button" class="btn btn--gold" id="sail" disabled>Set sail</button>
          <button type="button" class="btn btn--ghost" id="unload">Empty the canoe</button>
        </div>
      </div>
      <ul class="pack__plants">
        ${plants.map(p => `
        <li><button type="button" class="pack-tile" data-slug="${p.slug}" aria-pressed="false">
          ${picture(heroImage(p), { sizes: '9rem' })}
          <span class="pack-tile__name" lang="haw">${esc(p.nameHaw)}</span>
          <span class="pack-tile__sub">${esc(p.nameCommon)}</span>
        </button></li>`).join('')}
      </ul>
    </div>
    <div class="pack__sea" hidden aria-hidden="true"><div class="pack__boat"></div></div>
    <div class="pack__report" hidden tabindex="-1"></div>`;

  const $ = s => root.querySelector(s);
  const sail = $('#sail'), count = $('.pack__count'), report = $('.pack__report'), board = $('.pack__board'), sea = $('.pack__sea');

  function paint() {
    root.querySelectorAll('.pack-tile').forEach(t => {
      const on = picked.includes(t.dataset.slug);
      t.setAttribute('aria-pressed', String(on));
      t.disabled = !on && picked.length >= game.slots;
    });
    root.querySelectorAll('[data-slot]').forEach((li, i) => {
      const p = bySlug[picked[i]];
      li.innerHTML = p ? `<span lang="haw">${esc(p.nameHaw)}</span>` : '';
      li.classList.toggle('is-full', !!p);
    });
    const left = game.slots - picked.length;
    count.textContent = left ? `${picked.length} of ${game.slots} plants loaded. Room for ${left} more.` : 'The canoe is full. Ready when you are.';
    sail.disabled = left > 0;
  }

  function score() {
    return game.needs.map(need => {
      const points = picked.reduce((sum, s) => sum + (game.scores[s]?.[need.key] || 0), 0);
      const helpers = picked.filter(s => game.scores[s]?.[need.key]).map(s => bySlug[s].nameHaw);
      return { ...need, points: Math.min(points, game.covered), helpers, level: points >= game.covered ? 'good' : points > 0 ? 'thin' : 'miss' };
    });
  }

  function land() {
    const results = score();
    const total = results.reduce((s, r) => s + r.points, 0);
    const covered = results.filter(r => r.level === 'good').length;
    const isBest = progress.setBest('pack', total);
    const verdict = covered === 6 ? 'A balanced canoe. Your settlement thrives.'
      : covered >= 4 ? 'You made it, with some hard years ahead.'
      : covered >= 2 ? 'You landed, but life on the new island is a struggle.'
      : 'A rough landing. Your people may need to sail home and try again.';
    report.innerHTML = `
      <h2>Landing report</h2>
      <p class="pack__verdict">${verdict}</p>
      <p>Balance score <strong>${total} out of ${max}</strong>. ${covered} of 6 needs fully covered.${isBest ? ' That is your best so far.' : ` Your best is ${progress.best('pack')}.`}</p>
      <ul class="needs">
        ${results.map(r => `
        <li class="need need--${r.level}">
          <h3>${esc(r.label)}</h3>
          <div class="need__bar" role="img" aria-label="${r.points} of ${game.covered}">${Array.from({ length: game.covered }, (_, i) => `<i class="${i < r.points ? 'on' : ''}"></i>`).join('')}</div>
          <p>${haw(r[r.level])}</p>
          ${r.helpers.length ? `<p class="small muted">Helped by ${haw(r.helpers.join(', '))}</p>` : ''}
        </li>`).join('')}
      </ul>
      <div class="pack__reveal">
        <h2>${haw(game.reveal.title)}</h2>
        ${game.reveal.text.map(t => `<p>${haw(t)}</p>`).join('')}
      </div>
      <div class="cluster">
        <button type="button" class="btn btn--gold" id="again">Pack again</button>
        <a class="btn btn--ghost" href="#/plants">Explore the plants</a>
      </div>`;
    sea.hidden = true;
    report.hidden = false;
    report.focus({ preventScroll: true });
    report.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    if (covered === 6) celebrate();
  }

  root.addEventListener('click', e => {
    const tile = e.target.closest('.pack-tile');
    if (tile) {
      const i = picked.indexOf(tile.dataset.slug);
      i >= 0 ? picked.splice(i, 1) : picked.length < game.slots && picked.push(tile.dataset.slug);
      paint();
    } else if (e.target.closest('#unload')) { picked.length = 0; paint(); }
    else if (e.target.closest('#sail')) {
      board.hidden = true;
      if (reducedMotion()) return land();
      sea.hidden = false;
      sea.scrollIntoView({ block: 'center' });
      setTimeout(land, 3600);
    } else if (e.target.closest('#again')) {
      picked.length = 0; report.hidden = true; board.hidden = false; paint();
      board.scrollIntoView({ block: 'start' });
    }
  });
  paint();
}
