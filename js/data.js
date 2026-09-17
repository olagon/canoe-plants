// Loads and caches the JSON content.
const cache = {};
export function load(name) {
  return cache[name] ??= fetch(`data/${name}.json`).then(r => {
    if (!r.ok) throw new Error(`Could not load ${name}.json`);
    return r.json();
  });
}
export const loadAll = (...names) => Promise.all(names.map(load));

export async function plantBySlug(slug) {
  const plants = await load('plants');
  const i = plants.findIndex(p => p.slug === slug);
  if (i < 0) return null;
  const n = plants.length;
  return { plant: plants[i], prev: plants[(i + n - 1) % n], next: plants[(i + 1) % n] };
}
