// Boot: patterns, nav, search, router.
import { installPatterns } from './patterns.js';
import { startRouter } from './router.js';
import { load } from './data.js';
import { esc, haw, plain, learnHawaiian } from './util.js';

installPatterns();

const routes = {
  '/': () => import('./views/home.js'),
  '/voyage': () => import('./views/voyage.js'),
  '/plants': () => import('./views/plants.js'),
  '/plant/:slug': () => import('./views/plant.js'),
  '/pack-the-canoe': () => import('./views/pack.js'),
  '/quiz': () => import('./views/quiz.js'),
  '/myths': () => import('./views/myths.js'),
  '/companions': () => import('./views/companions.js'),
  '/glossary': () => import('./views/glossary.js'),
  '/teachers': () => import('./views/teachers.js'),
  '/credits': () => import('./views/credits.js'),
};

/* nav */
const toggle = document.querySelector('.nav__toggle');
const links = document.getElementById('nav-links');
const setMenu = open => {
  toggle.setAttribute('aria-expanded', String(open));
  links.classList.toggle('is-open', open);
};
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

function markCurrent(path) {
  const section = path.startsWith('/plant/') ? '/plants' : path;
  for (const a of links.querySelectorAll('a')) {
    a.getAttribute('href') === `#${section}` ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  }
}

/* skip link: focus main without touching the hash route */
document.querySelector('.skip-link').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('main').focus();
});

/* search dialog, opened with the nav button or the / key */
const dialog = document.getElementById('search');
const input = document.getElementById('search-input');
const results = document.getElementById('search-results');
let fuse;

async function openSearch() {
  if (dialog.open) return;
  dialog.showModal();
  input.value = '';
  results.innerHTML = '';
  if (!fuse) {
    const [plants, glossary] = await Promise.all([load('plants'), load('glossary')]);
    const items = [
      ...plants.map(p => ({
        kind: 'Plant', href: `#/plant/${p.slug}`, title: p.nameHaw, sub: p.nameCommon,
        text: plain([p.nameHaw, p.nameCommon, p.nameSci, p.hook, ...p.facts.map(f => f.text), ...p.uses.map(u => u.text)].join(' ')),
        name: plain(`${p.nameHaw} ${p.nameCommon}`),
      })),
      ...glossary.map(g => ({
        kind: 'Word', href: `#/glossary?q=${encodeURIComponent(g.term)}`, title: g.term, sub: g.definition,
        text: plain(g.definition), name: plain(g.term),
      })),
    ];
    fuse = new Fuse(items, { keys: [{ name: 'name', weight: 3 }, 'text'], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 2 });
  }
}

input.addEventListener('input', () => {
  const q = plain(input.value.trim());
  const hits = q.length < 2 || !fuse ? [] : fuse.search(q, { limit: 8 });
  results.innerHTML = hits.map(({ item }) => `
    <li><a href="${item.href}"><span class="search__kind">${item.kind}</span>
      <span class="search__title">${haw(item.title)}</span>
      <span class="search__sub">${esc(item.sub)}</span></a></li>`).join('')
    || (q.length >= 2 ? '<li class="search__none">Nothing found. Try another word.</li>' : '');
});
results.addEventListener('click', e => { if (e.target.closest('a')) dialog.close(); });
document.addEventListener('click', e => { if (e.target.closest('[data-open-search]')) openSearch(); });
document.addEventListener('keydown', e => {
  if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
  e.preventDefault();
  openSearch();
});

/* boot. Learn the Hawaiian word list first so every view can mark words with lang="haw". */
Promise.all([load('plants'), load('glossary')])
  .then(([plants, glossary]) => learnHawaiian([...plants.map(p => p.nameHaw), ...glossary.map(g => g.term)]))
  .catch(() => {})
  .finally(() => startRouter(routes, document.getElementById('main'), markCurrent));
