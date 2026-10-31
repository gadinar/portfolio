'use strict';

function projectSpans(count, columns = 3) {
  const spans = [];
  const patterns = { 1: [24], 2: [13, 11], 3: [9, 7, 8], 4: [7, 5, 5, 7] };
  let row = 0;
  while (spans.length < count) {
    const remaining = count - spans.length;
    const size = remaining === columns + 1 ? remaining : Math.min(columns, remaining);
    const pattern = patterns[size];
    const shift = row % pattern.length;
    spans.push(...pattern.slice(shift), ...pattern.slice(0, shift));
    row++;
  }
  return spans;
}

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
  const mixed = document.querySelector('.project-grid')?.dataset?.layout === 'mixed';
  function layoutCards() {
    if (!mixed) return;
    const visible = cards.filter(card => !card.node.hidden);
    const desktop = projectSpans(visible.length);
    const tablet = projectSpans(visible.length, 2);
    visible.forEach((card, index) => {
      card.node.style.setProperty('--project-span', desktop[index]);
      card.node.style.setProperty('--project-span-tablet', tablet[index]);
    });
  }
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      let visible = 0;
      for (const card of cards) {
        card.node.hidden = Boolean(category && !card.categories.includes(category));
        if (!card.node.hidden) visible++;
      }
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      layoutCards();
      empty.hidden = visible !== 0;
      status.textContent = `${button.textContent}: проектов — ${visible}`;
    });
  }
  layoutCards();
  filters.hidden = false;
})();
