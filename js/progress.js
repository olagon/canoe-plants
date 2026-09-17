// Visitor progress in localStorage. Everything still works when storage is blocked.
const KEY = 'canoe-plants-v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage blocked, carry on */ }
}

export const progress = {
  met: () => read().met || [],
  isMet: slug => progress.met().includes(slug),
  setMet(slug, on = true) {
    const p = read();
    const met = new Set(p.met || []);
    on ? met.add(slug) : met.delete(slug);
    write({ ...p, met: [...met] });
  },
  best: key => (read().best || {})[key] ?? null,
  // Keeps the higher score. Returns true when it is a new best.
  setBest(key, score) {
    const p = read();
    const old = (p.best || {})[key];
    if (old != null && old >= score) return false;
    write({ ...p, best: { ...p.best, [key]: score } });
    return true;
  },
};
