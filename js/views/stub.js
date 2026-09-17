// Placeholder for views that are not built yet.
export default async function stub({ path }) {
  return {
    title: 'Coming soon',
    ground: 'ground-kapa',
    html: `<div class="wrap section prose"><h1>Coming soon</h1><p>The page at ${path} is still being built.</p></div>`,
  };
}
