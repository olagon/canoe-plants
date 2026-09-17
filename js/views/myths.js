// Myth busters: plants people think came in the canoe but did not. Plus a tap game.
import { loadAll } from '../data.js';
import { esc, haw, shuffle } from '../util.js';
import { progress } from '../progress.js';
import { celebrate } from '../components/confetti.js';

const ROUNDS = 10;

export default async function mythsView() {
  const [myths, plants] = await loadAll('myths', 'plants');

  const item = (m, extra) => `
    <li><h3>${m.nameHaw ? `<span lang="haw">${esc(m.nameHaw)}</span>` : esc(m.name)}</h3>
      <p class="myth__sub">${esc(m.nameHaw ? (m.name || m.nameCommon) : '')}${m.nameHaw ? ', ' : ''}<span class="sci">${esc(m.nameSci)}</span></p>
      <p class="myth__tag">${esc(extra)}</p>
      <p>${haw(m.line)}</p></li>`;

  const html = `
  <div class="wrap view-head">
    <h1>Myth busters</h1>
    <p class="lede">Pineapple? Plumeria? Koa? Lots of plants feel like they have always been part of Hawaiʻi. Some were here before any person. Some showed up on sailing ships. Neither kind rode in a voyaging canoe.</p>
  </div>

  <section class="wrap myth-game panel" aria-labelledby="game-h">
    <h2 id="game-h">Canoe plant or not?</h2>
    <div id="myth-game" aria-live="polite"></div>
  </section>

  <section class="wrap section">
    <h2>Already here</h2>
    <p class="lede" style="margin-top: var(--s-3)">Native plants reached Hawaiʻi on their own, by wind, wings, or waves, long before people. Endemic means found nowhere else on Earth.</p>
    <ul class="myths">${myths.native.map(m => item(m, m.status === 'endemic' ? 'Endemic, found only in Hawaiʻi' : 'Indigenous, got here without people')).join('')}</ul>
  </section>
  <div class="kapa-band" data-pattern="weave" aria-hidden="true"></div>
  <section class="wrap section">
    <h2>Came after 1778</h2>
    <p class="lede" style="margin-top: var(--s-3)">After Captain Cook arrived, ships brought plants from all over the world. Many are now island favorites. They are just not canoe plants.</p>
    <ul class="myths">${myths.postContact.map(m => item(m, `Arrived ${m.arrived}`)).join('')}</ul>
  </section>`;

  function mount(main) {
    const box = main.querySelector('#myth-game');
    const deckAll = [
      ...plants.filter(p => p.status === 'canoe').map(p => ({ name: p.nameHaw, sub: p.nameCommon, haw: true, canoe: true, why: `Yes. ${p.nameHaw} came in the canoe. ${p.whyInCanoe.split('. ')[0]}.` })),
      ...myths.native.map(m => ({ name: m.nameHaw, sub: m.nameCommon, haw: true, canoe: false, why: `No. It was already here. ${m.line}` })),
      ...myths.postContact.map(m => ({ name: m.name, sub: m.nameHaw, canoe: false, why: `No. It came later. ${m.line}` })),
    ];
    let deck, i, score;

    function start() {
      const yes = shuffle(deckAll.filter(c => c.canoe)).slice(0, 4);
      const no = shuffle(deckAll.filter(c => !c.canoe)).slice(0, ROUNDS - 4);
      deck = shuffle([...yes, ...no]); i = 0; score = 0;
      ask();
    }
    function ask() {
      const c = deck[i];
      box.innerHTML = `
        <p class="small muted">Plant ${i + 1} of ${ROUNDS}. Score ${score}</p>
        <p class="myth-game__name" ${c.haw ? 'lang="haw"' : ''}>${esc(c.name)}</p>
        <p class="muted">${esc(c.sub || '')}</p>
        <div class="cluster myth-game__btns">
          <button type="button" class="btn btn--gold" data-guess="yes">Canoe plant</button>
          <button type="button" class="btn btn--ghost" data-guess="no">Not a canoe plant</button>
        </div>`;
    }
    function answer(guess) {
      const c = deck[i];
      const right = (guess === 'yes') === c.canoe;
      if (right) score++;
      box.querySelector('.myth-game__btns').outerHTML = `
        <p class="verdict ${right ? 'verdict--right' : 'verdict--wrong'}">${right ? 'Right.' : 'Not quite.'}</p>
        <p>${haw(c.why)}</p>
        <button type="button" class="btn" data-next>${i + 1 < ROUNDS ? 'Next plant' : 'See my score'}</button>`;
      box.querySelector('[data-next]').focus();
    }
    function finish() {
      const best = progress.setBest('myths', score);
      if (score === ROUNDS) celebrate();
      box.innerHTML = `
        <p class="myth-game__name">${score} out of ${ROUNDS}</p>
        <p>${score === ROUNDS ? 'Perfect. You cannot be fooled.' : score >= 7 ? 'Sharp eyes. A few of these fool almost everyone.' : 'These are tricky. Read the lists below and try again.'}
        ${best ? ' That is your best score so far.' : ''}</p>
        <button type="button" class="btn" data-again>Play again</button>`;
      box.querySelector('[data-again]').focus();
    }
    box.addEventListener('click', e => {
      const g = e.target.closest('[data-guess]');
      if (g) answer(g.dataset.guess);
      else if (e.target.closest('[data-next]')) { i++; i < ROUNDS ? ask() : finish(); box.querySelector('button')?.focus(); }
      else if (e.target.closest('[data-again]')) { start(); box.querySelector('button').focus(); }
    });
    start();
  }
  return { title: 'Myth busters', ground: 'ground-lau', html, mount };
}
