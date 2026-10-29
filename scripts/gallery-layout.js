'use strict';

function planGallery(ratios, width, seed = 0) {
  const small = width <= 620;
  const gap = small ? 14 : 20;
  const targets = small ? [240, 180, 300] : [420, 275, 540];
  const rows = [];
  let start = 0;
  while (start < ratios.length) {
    const target = targets[(rows.length + seed) % targets.length];
    let best;
    for (let count = 1; count <= Math.min(small ? 2 : 3, ratios.length - start); count++) {
      const group = ratios.slice(start, start + count);
      const total = group.reduce((sum, ratio) => sum + ratio, 0);
      const rowWidth = width;
      const height = (rowWidth - gap * (count - 1)) / total;
      if (count > 1 && Math.min(...group) * height < (small ? 120 : 150)) continue;
      let score = Math.abs(Math.log(height / target));
      if (ratios.length - start - count === 1) score += .7;
      if (!best || score < best.score) best = { start, count, ratios: group, width: rowWidth, height, gap, score };
    }
    rows.push(best);
    start += best.count;
  }
  return rows;
}

(() => {
  if (typeof document === 'undefined') return;
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;
  const figures = [...gallery.querySelectorAll('figure')];
  if (!figures.length) return;
  const ratios = figures.map(figure => {
    const image = figure.querySelector('img');
    return Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
  });
  if (ratios.some(ratio => !Number.isFinite(ratio) || ratio <= 0)) return;
  // Меняется рисунок рядов, но не последовательность работ.
  const seed = Math.floor(Math.random() * 3);
  let previousWidth = 0;
  let scheduled;
  function layout() {
    const width = gallery.clientWidth;
    if (width < 1 || Math.abs(width - previousWidth) < 1) return;
    previousWidth = width;
    const fragment = document.createDocumentFragment();
    for (const row of planGallery(ratios, width, seed)) {
      const node = document.createElement('div');
      node.className = 'gallery-row';
      node.style.setProperty('--gallery-columns', row.ratios.map(ratio => `minmax(0,${ratio}fr)`).join(' '));
      node.style.setProperty('--row-gap', `${row.gap}px`);
      for (let i = row.start; i < row.start + row.count; i++) {
        const figure = figures[i];
        const image = figure.querySelector('img');
        image.sizes = `${Math.ceil(row.height * ratios[i])}px`;
        node.append(figure);
      }
      fragment.append(node);
    }
    gallery.replaceChildren(fragment);
    gallery.classList.add('gallery--automatic');
  }
  layout();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(layout);
    }).observe(gallery);
  } else {
    window.addEventListener('resize', layout);
  }
})();
