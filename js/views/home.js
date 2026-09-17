// Home: the night crossing hero, then the way in to everything else.
import { loadAll } from '../data.js';
import { esc, haw, picture, heroImage, reducedMotion, seeded, libs } from '../util.js';
import { progress } from '../progress.js';
import { icon } from '../components/icon.js';
import { creditLine, creditMap } from '../components/credit.js';

const WAA = `
<svg class="hero__waa" viewBox="0 0 220 150" aria-hidden="true" focusable="false">
  <g fill="currentColor">
    <path d="M108 118 C104 84 108 44 124 8 C128 46 146 54 176 46 C164 84 140 106 108 118Z"/>
    <path d="M66 118 C64 92 68 64 80 38 C83 66 96 72 116 68 C106 94 90 110 66 118Z" opacity=".92"/>
    <path d="M6 112 C9 102 15 97 24 96 L27 116 C80 124 140 124 193 116 L196 94 C206 97 212 104 214 114 C170 134 50 134 6 112Z"/>
    <rect x="44" y="113" width="132" height="4"/>
    <path d="M186 110 L206 142 L202 144 L181 113Z"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <path d="M108 118 C104 84 108 44 124 8M66 118 C64 92 68 64 80 38"/>
  </g>
</svg>`;

// 17 lines fan out from the horizon, one for each star house boundary in the upper half of the compass.
const compass = () => `
<svg class="hero__compass" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  ${Array.from({ length: 17 }, (_, i) => {
    const a = Math.PI * i / 16;
    return `<line x1="100" y1="100" x2="${(100 - Math.cos(a) * 260).toFixed(1)}" y2="${(100 - Math.sin(a) * 260).toFixed(1)}" vector-effect="non-scaling-stroke"/>`;
  }).join('')}
  <ellipse cx="100" cy="100" rx="60" ry="46" vector-effect="non-scaling-stroke"/>
  <ellipse cx="100" cy="100" rx="98" ry="84" vector-effect="non-scaling-stroke"/>
</svg>`;

export default async function home() {
  const [plants, content, credits] = await loadAll('plants', 'home', 'credits');
  const credit = creditMap(credits);
  const met = progress.met().filter(s => plants.some(p => p.slug === s));
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  const featured = plants.length ? plants[dayOfYear % plants.length] : null;

  const html = `
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__stage">
      <div class="hero__sky hero__sky--night"></div>
      <div class="hero__sky hero__sky--dawn"></div>
      <canvas class="hero__stars" aria-hidden="true"></canvas>
      ${compass()}
      <div class="hero__sun" aria-hidden="true"></div>
      <div class="hero__water"><div class="hero__water-dawn"></div><div class="hero__water-stamp"></div></div>
      <div class="hero__waa-track" aria-hidden="true">${WAA}</div>
      <div class="hero__copy">
        <h1 id="hero-title">${haw(content.hero.title)}</h1>
        <p>${haw(content.hero.sub)}</p>
        <div class="cluster">
          <a class="btn btn--gold" href="#/plants">Explore the plants</a>
          <a class="btn btn--ghost" href="#/voyage">See the voyage</a>
        </div>
      </div>
      <nav class="hero__names" aria-label="All twenty six plants">
        <svg class="hero__lines" aria-hidden="true" focusable="false"><polyline points=""/></svg>
        <ul>${plants.map(p => `<li><a href="#/plant/${p.slug}" lang="haw">${esc(p.nameHaw)}</a></li>`).join('')}</ul>
      </nav>
      <div class="hero__kapa" aria-hidden="true"></div>
    </div>
  </section>

  <div class="ground-kapa">
    <section class="section wrap what">
      <div class="what__text prose">
        <h2>${haw(content.what.title)}</h2>
        ${content.what.text.map((t, i) => `<p class="${i ? '' : 'lede'}">${haw(t)}</p>`).join('')}
      </div>
      <ul class="reasons">
        ${content.reasons.map(r => `<li>${icon(r.icon)}<h3>${haw(r.title)}</h3><p>${haw(r.text)}</p></li>`).join('')}
      </ul>
    </section>

    ${met.length ? `
    <section class="wrap progress-strip" aria-label="Your progress">
      <p><strong>You have met ${met.length} of ${plants.length} plants.</strong>
        ${met.length === plants.length ? 'Every one of them. Maikaʻi!' : 'Keep going.'}</p>
      <div class="progress-strip__bar" role="img" aria-label="${met.length} of ${plants.length} plants met">
        ${plants.map(p => `<i class="${met.includes(p.slug) ? 'is-met' : ''}"></i>`).join('')}
      </div>
      <a href="#/plants">Find the ones you have not met</a>
    </section>` : ''}

    <div class="kapa-band kapa-band--fg" data-pattern="weave" aria-hidden="true"></div>
  </div>

  ${featured ? `
  <section class="featured ground-lau" aria-labelledby="featured-title">
    <div class="featured__photo">${picture(heroImage(featured), { sizes: '(min-width: 60rem) 55vw, 100vw' })}</div>
    <div class="featured__text">
      <p class="muted">Plant of the day</p>
      <h2 id="featured-title" lang="haw">${esc(featured.nameHaw)}</h2>
      <p class="featured__common">${esc(featured.nameCommon)}</p>
      <p class="featured__fact">${haw(featured.facts[dayOfYear % featured.facts.length].text)}</p>
      <a class="btn btn--gold" href="#/plant/${featured.slug}">Meet ${haw(featured.nameHaw)}</a>
      ${creditLine(credit[heroImage(featured)?.creditId])}
    </div>
  </section>` : ''}

  <section class="doorways" aria-label="Where to go next">
    ${content.doorways.map(d => `
    <a class="doorway ${d.ground}" href="${d.href}">
      <h2>${haw(d.title)}</h2>
      <p>${haw(d.text)}</p>
      <span class="doorway__cta">${esc(d.cta)}</span>
    </a>`).join('')}
  </section>`;

  let cleanup = () => {};
  return {
    title: '',
    ground: 'ground-kai',
    html,
    mount(main) {
      const hero = main.querySelector('.hero');
      const stopLayout = heroLayout(hero);
      let stopMotion = () => {}, gone = false;
      cleanup = () => { gone = true; stopLayout(); stopMotion(); };
      // Names stay hidden until we know if they will rise or simply be there.
      (reducedMotion() ? Promise.resolve(false) : libs.gsap()).then(ok => {
        if (gone) return;
        if (ok) stopMotion = heroMotion(hero);
        else hero.classList.add('hero--still');
        hero.classList.add('hero--ready');
      });
    },
    unmount() { cleanup(); },
  };
}

/* ---------- hero ---------- */

// Place the names on a loose grid across the sky, the same way every visit. Returns a cleanup function.
function heroLayout(hero) {
  const stage = hero.querySelector('.hero__stage');
  const names = [...hero.querySelectorAll('.hero__names li')];
  const line = hero.querySelector('.hero__lines polyline');
  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    const horizon = parseFloat(getComputedStyle(stage).getPropertyValue('--horizon')) / 100;
    const cols = w < 560 ? 4 : w < 900 ? 5 : w < 1300 ? 7 : 9;
    const rows = Math.ceil(names.length / cols);
    const rand = seeded(26);
    const top = 0.05, bottom = horizon - 0.09;
    const pts = [];
    names.forEach((li, i) => {
      const r = Math.floor(i / cols);
      let c = i % cols;
      if (r % 2) c = cols - 1 - c; // serpentine, so the constellation line never jumps across the sky
      const inRow = Math.min(cols, names.length - r * cols);
      const span = r === rows - 1 ? inRow : cols;
      const cx = r % 2 && r === rows - 1 ? c - (cols - inRow) : c;
      const x = (cx + 0.5 + (rand() - 0.5) * 0.5) / span;
      const y = top + (r + 0.5 + (rand() - 0.5) * 0.6) / rows * (bottom - top);
      li.style.left = `${(6 + x * 88).toFixed(2)}%`;
      li.style.top = `${(y * 100).toFixed(2)}%`;
      li.style.setProperty('--rise', `${((horizon - y) * h).toFixed(0)}px`);
      li.style.setProperty('--tw', `${(rand() * 5).toFixed(2)}s`);
      // keep long names inside the screen on phones
      const over = (6 + x * 88) / 100 * w + li.offsetWidth - (w - 8);
      const px = (6 + x * 88) / 100 * w - Math.max(0, over);
      li.style.left = `${px.toFixed(1)}px`;
      pts.push(`${px.toFixed(1)},${(y * h).toFixed(1)}`);
    });
    line.setAttribute('points', pts.join(' '));
    drawStars(hero.querySelector('.hero__stars'), w, h * horizon);
  }
  layout();
  let t;
  const onResize = () => { clearTimeout(t); t = setTimeout(layout, 150); };
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}

function heroMotion(hero) {
  const stage = hero.querySelector('.hero__stage');
  const names = [...hero.querySelectorAll('.hero__names li')];
  const line = hero.querySelector('.hero__lines polyline');
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const ctx = gsap.context(() => {
    // 1. The names rise from the horizon like stars, then the constellation is drawn.
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ delay: 0.3 })
      .from(names, { y: i => parseFloat(names[i].style.getPropertyValue('--rise')), opacity: 0, duration: 2.6, stagger: 0.11, ease: 'power2.out' })
      .to(line, { strokeDashoffset: 0, duration: 3, ease: 'power1.inOut' }, '-=1.2');

    // 2. The waʻa crosses, slowly, forever.
    const far = () => stage.clientWidth + 40;
    gsap.timeline()
      .fromTo('.hero__waa-track', { x: () => stage.clientWidth * 0.08 }, { x: far, duration: 140, ease: 'none' })
      .fromTo('.hero__waa-track', { x: -200 }, { x: far, duration: 160, ease: 'none', repeat: -1, repeatDelay: 2 });
    gsap.to('.hero__waa', { y: 3, rotation: 1.2, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 90%' });

    // 3. Scrolling brings the dawn, and the dawn brings the kapa.
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.4 }, defaults: { ease: 'none' } })
      .to('.hero__copy', { opacity: 0, y: -30, duration: 0.25 }, 0.02)
      .to('.hero__sky--dawn, .hero__water-dawn', { opacity: 1, duration: 0.5 }, 0.1)
      .to('.hero__stars, .hero__compass', { opacity: 0, duration: 0.35 }, 0.15)
      .to('.hero__names', { opacity: 0, duration: 0.3 }, 0.25)
      .fromTo('.hero__sun', { yPercent: 60 }, { yPercent: -35, duration: 0.7 }, 0.15)
      .to('.hero__kapa', { opacity: 1, duration: 0.25 }, 0.75);
  }, hero);

  return () => ctx.revert();
}

function drawStars(canvas, w, h) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.height = `${h}px`;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  const rand = seeded(1976); // the year Hōkūleʻa first sailed to Tahiti
  const count = Math.round(w * h / 1400);
  for (let i = 0; i < count; i++) {
    let x = rand() * w, y = rand() * h;
    if (i % 3 === 0) { // a soft river of stars, low left to high right
      const along = rand();
      x = along * w;
      y = h * (0.85 - along * 0.75) + (rand() + rand() + rand() - 1.5) * h * 0.16;
    }
    const fade = Math.min(1, (h - y) / (h * 0.25)); // thin out toward the glow of the horizon
    const r = rand() < 0.04 ? 1.3 : 0.35 + rand() * 0.6;
    c.globalAlpha = (0.25 + rand() * 0.7) * fade;
    c.fillStyle = rand() < 0.12 ? '#F3D98B' : '#F8F2E3';
    c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill();
  }
}
