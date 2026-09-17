// Confetti for wins, in the site's own colors. Quiet when reduced motion is on.
import { reducedMotion, libs } from '../util.js';
export async function celebrate() {
  if (reducedMotion() || !await libs.confetti()) return;
  confetti({ particleCount: 140, spread: 85, origin: { y: 0.7 }, colors: ['#D9A21B', '#EFE4CC', '#1A7A8A', '#2F5D3A'] });
}
