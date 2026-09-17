// For teachers: lesson ideas, framework notes, printable fact sheets.
import { loadAll } from '../data.js';
import { esc, haw } from '../util.js';

export default async function teachersView() {
  const [t, plants] = await loadAll('teachers', 'plants');
  const html = `
  <div class="wrap view-head">
    <h1>For teachers</h1>
    <p class="lede">${haw(t.intro)}</p>
  </div>
  <section class="wrap section--tight">
    <h2>Five lesson ideas</h2>
    <ol class="lessons">
      ${t.lessons.map(l => `
      <li>
        <h3>${haw(l.title)}</h3>
        <p class="small muted">${esc(l.time)}</p>
        <p>${haw(l.text)}</p>
        <h4>Talk about it</h4>
        <ul>${l.questions.map(q => `<li>${haw(q)}</li>`).join('')}</ul>
      </li>`).join('')}
    </ol>
  </section>
  <div class="kapa-band kapa-band--fg" data-pattern="chevron" aria-hidden="true"></div>
  <section class="wrap section prose">
    <h2 style="margin-top:0">How this fits what you teach</h2>
    ${t.alignment.map(p => `<p>${haw(p)}</p>`).join('')}
    <h2>Saying the names right</h2>
    <ul>${t.pronunciation.map(p => `<li>${haw(p)}</li>`).join('')}</ul>
    <h2>Printable fact sheets</h2>
    <p>Each link opens the plant page and starts printing a clean one or two page handout. You can also save it as a PDF from the print window.</p>
  </section>
  <ul class="wrap sheet-links">
    ${plants.map(p => `<li><a href="#/plant/${p.slug}?print=1"><span lang="haw">${esc(p.nameHaw)}</span> <span class="small muted">${esc(p.nameCommon)}</span></a></li>`).join('')}
  </ul>`;
  return { title: 'For teachers', ground: 'ground-kapa', html };
}
