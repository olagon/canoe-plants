// Icons from the sprite in assets/svg/icons.svg. Decorative, so hidden from screen readers.
export const icon = (id, cls = '') =>
  `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="assets/svg/icons.svg#${id}"></use></svg>`;
