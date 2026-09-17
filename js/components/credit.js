// One credit line for an image. Every image on the site shows one.
import { esc } from '../util.js';

export const creditLine = c => c ? `
  <p class="credit">Photo by ${esc(c.author)}, <a href="${esc(c.licenseUrl)}" rel="license noopener">${esc(c.license)}</a><span class="credit__src">,
  <a href="${esc(c.sourceUrl)}" rel="noopener">source</a></span></p>` : '';

export const creditMap = credits => Object.fromEntries(credits.map(c => [c.creditId, c]));
