// Filter chips: a group of toggle buttons. Works with mouse, touch, and keyboard.
import { esc } from '../util.js';

export const chipGroup = (name, legend, options, selected) => `
  <fieldset class="chip-group" data-group="${name}">
    <legend>${esc(legend)}</legend>
    <div class="chips">
      ${Object.entries(options).map(([value, label]) =>
        `<button type="button" class="chip" data-value="${value}" aria-pressed="${selected.includes(value)}">${esc(label)}</button>`).join('')}
    </div>
  </fieldset>`;

// Calls onChange(groupName, selectedValues) whenever a chip is toggled.
export function wireChips(root, onChange) {
  root.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    const group = chip.closest('[data-group]');
    onChange(group.dataset.group, [...group.querySelectorAll('.chip[aria-pressed="true"]')].map(c => c.dataset.value));
  });
}
