'use strict';

(() => {
  const filters = document.querySelector('.category-filters');
  if (!filters) return;
  const buttons = [...filters.querySelectorAll('button[data-category]')];
  const cards = [...document.querySelectorAll('.project-card[data-categories]')].map(node => {
    let categories = [];
    try { categories = JSON.parse(node.dataset.categories); } catch { /* Без категории доступен фильтр «Все». */ }
    return { node, categories };
  });
  const empty = document.querySelector('.filter-empty');
  const status = document.querySelector('#filter-status');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      let visible = 0;
      for (const card of cards) {
        card.node.hidden = Boolean(category && !card.categories.includes(category));
        if (!card.node.hidden) visible++;
      }
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      empty.hidden = visible !== 0;
      status.textContent = `${button.textContent}: проектов — ${visible}`;
    });
  }
  filters.hidden = false;
})();
