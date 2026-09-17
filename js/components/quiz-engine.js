// Quiz engine: ten questions a round, mixed difficulty, shuffled choices, streak, best score.
import { esc, haw, picture, heroImage, shuffle } from '../util.js';
import { progress } from '../progress.js';
import { celebrate } from './confetti.js';

const ROUND = { easy: 4, medium: 4, hard: 2 };

export function quizEngine(root, questions, plants) {
  const plantBySlug = Object.fromEntries(plants.map(p => [p.slug, p]));
  let round, i, score, streak, bestStreak;

  function start() {
    round = shuffle(Object.entries(ROUND).flatMap(([tier, n]) => shuffle(questions.filter(q => q.tier === tier)).slice(0, n)));
    // easy ones first so nobody quits on question one
    round.sort((a, b) => 'emh'.indexOf(a.tier[0]) - 'emh'.indexOf(b.tier[0]));
    i = 0; score = 0; streak = 0; bestStreak = 0;
    ask();
  }

  function ask() {
    const q = round[i];
    const img = q.image && plantBySlug[q.image] && heroImage(plantBySlug[q.image]);
    root.innerHTML = `
      <div class="quiz__meta">
        <p>Question ${i + 1} of ${round.length}</p>
        <p>Score ${score}${streak > 1 ? `, streak of ${streak}` : ''}</p>
      </div>
      <div class="quiz__bar" aria-hidden="true">${round.map((_, n) => `<i class="${n < i ? 'done' : n === i ? 'now' : ''}"></i>`).join('')}</div>
      ${img ? `<figure class="quiz__photo">${picture({ ...img, alt: 'Mystery plant for this question' }, { sizes: '(min-width: 50rem) 40rem, 100vw', lazy: false })}</figure>` : ''}
      <h2 class="quiz__q" tabindex="-1">${haw(q.question)}</h2>
      <ul class="quiz__choices">
        ${shuffle(q.choices).map(c => `<li><button type="button" class="choice" data-choice="${esc(c)}">${haw(c)}</button></li>`).join('')}
      </ul>
      <div class="quiz__after" aria-live="polite"></div>`;
    if (i) root.querySelector('.quiz__q').focus({ preventScroll: true });
  }

  function answer(btn) {
    const q = round[i];
    const right = btn.dataset.choice === q.answer;
    right ? (score++, streak++, bestStreak = Math.max(bestStreak, streak)) : (streak = 0);
    root.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      if (b.dataset.choice === q.answer) b.classList.add('is-right');
      else if (b === btn) b.classList.add('is-wrong');
    });
    root.querySelector('.quiz__after').innerHTML = `
      <p class="verdict ${right ? 'verdict--right' : 'verdict--wrong'}">${right ? 'Correct.' : `Not quite. The answer is ${haw(q.answer)}.`}</p>
      <p>${haw(q.explain)}</p>
      <button type="button" class="btn" data-next>${i + 1 < round.length ? 'Next question' : 'See my score'}</button>`;
    root.querySelector('[data-next]').focus();
  }

  function finish() {
    const isBest = progress.setBest('quiz', score);
    const line = score === 10 ? 'A perfect ten. You could navigate by this knowledge.'
      : score >= 8 ? 'Excellent. You really know your canoe plants.'
      : score >= 5 ? 'Solid. A few more plant pages and you will ace it.'
      : 'Every navigator starts somewhere. Explore a few plants and try again.';
    root.innerHTML = `
      <h2 class="quiz__final" tabindex="-1">${score} out of ${round.length}</h2>
      <p class="lede">${line}</p>
      <p>Longest streak ${bestStreak}. ${isBest ? 'That is a new best score.' : `Your best score is ${progress.best('quiz')}.`}</p>
      <div class="cluster" style="margin-top: var(--s-5)">
        <button type="button" class="btn btn--gold" data-again>Play another round</button>
        <a class="btn btn--ghost" href="#/plants">Explore the plants</a>
      </div>`;
    root.querySelector('.quiz__final').focus({ preventScroll: true });
    if (score === round.length) celebrate();
  }

  root.addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (c && !c.disabled) answer(c);
    else if (e.target.closest('[data-next]')) { i++; i < round.length ? ask() : finish(); }
    else if (e.target.closest('[data-again]')) start();
  });
  start();
}
