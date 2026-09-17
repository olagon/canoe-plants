// Tiny hash router. Routes look like #/plants or #/plant/kalo?x=1
import { esc } from './util.js';

export function parseHash() {
  const [path, qs = ''] = (location.hash.slice(1) || '/').split('?');
  return { path, query: new URLSearchParams(qs) };
}

export function startRouter(routes, main, onChange) {
  const table = Object.entries(routes).map(([pattern, loader]) => ({
    re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'),
    loader,
  }));
  let current = null;
  let first = true;

  async function go() {
    // Plain anchors like #main are not routes.
    if (location.hash && !location.hash.startsWith('#/')) return;
    const { path, query } = parseHash();
    let view;
    try {
      const hit = table.map(r => ({ r, m: path.match(r.re) })).find(x => x.m);
      if (hit) {
        const mod = await hit.r.loader();
        view = await mod.default({ params: hit.m.groups || {}, query, path });
      }
    } catch (err) {
      console.error(err);
      view = { title: 'Something went wrong', ground: 'ground-kapa', html: message('Something went wrong', 'This page could not load. Check your connection and try again.') };
    }
    view ||= { title: 'Page not found', ground: 'ground-kapa', html: message('This page drifted off course', 'We could not find that page.') };

    current?.unmount?.();
    current = view;
    main.className = view.ground || 'ground-kapa';
    main.innerHTML = view.html;
    document.title = view.title ? `${view.title} | Canoe plants of Hawaiʻi` : 'Canoe plants of Hawaiʻi';
    window.scrollTo(0, 0);
    view.mount?.(main);
    onChange?.(path);
    const h1 = main.querySelector('h1');
    if (h1 && !first) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
    first = false;
  }

  window.addEventListener('hashchange', go);
  go();
}

function message(title, text) {
  return `<div class="wrap section prose"><h1>${esc(title)}</h1><p>${esc(text)}</p>
    <p><a class="btn" href="#/plants">Explore the plants</a></p></div>`;
}
