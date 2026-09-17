// Pack the canoe: the game view.
import { loadAll } from '../data.js';
import { haw } from '../util.js';
import { canoeGame } from '../components/canoe-game.js';

export default async function packView() {
  const [plants, game] = await loadAll('plants', 'pack-the-canoe');
  return {
    title: 'Pack the canoe',
    ground: 'ground-wai',
    html: `
    <div class="wrap view-head">
      <h1>Pack the canoe</h1>
      <p class="lede">${haw(game.intro)}</p>
    </div>
    <div class="wrap pack" id="pack"></div>
    <p class="wrap small muted photo-note">Every photo is credited on its plant page and on the <a href="#/credits">credits page</a>.</p>`,
    mount: main => canoeGame(main.querySelector('#pack'), plants, game),
  };
}
