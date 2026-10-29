'use strict';

function planGallery(ratios, width, seed = 0) {
  const small = width <= 620;
  const gap = small ? 14 : 20;
  // Первый кадр всегда главный, независимо от формата и числа изображений.
  const rows = [];
  let start = 0;
  let pair = 0;
  while (start < ratios.length) {
    const remaining = ratios.length - start;
    const count = small || start === 0 || remaining === 1 ? 1 : (remaining === 3 ? 3 : 2);
    const group = ratios.slice(start, start + count);
    let columns = [1];
    let height;
    if (count === 1) {
      // На телефоне показываем фото целиком. Крупный кадр на компьютере компактнее.
      height = small ? width / group[0] : (start === 0
        ? Math.min(720, width / Math.min(2.4, Math.max(1.9, group[0])))
        : Math.min(520, width / 2.8));
    } else if (count === 3) {
      const accents = [.42, .32, .26];
      columns = accents.map((_, i) => accents[(i + seed) % 3]);
      const natural = group.map((ratio, i) => (width - gap * 2) * columns[i] / ratio);
      height = Math.max(width * .25, Math.min(width * .58, Math.exp(natural.reduce((sum, value) => sum + Math.log(value), 0) / 3)));
    } else {
      const accents = seed === 2 ? [1.3, .7] : [1.2, .8];
      const phase = (pair + seed) % 2;
      const weights = group.map((ratio, i) => ratio * accents[(i + phase) % 2]);
      let fraction = Math.max(.36, Math.min(.64, weights[0] / (weights[0] + weights[1])));
      if (Math.abs(fraction - .5) < .08) fraction = phase === 0 ? .6 : .4;
      columns = [fraction, 1 - fraction];
      const available = width - gap;
      // Общая высота балансирует кадрирование обоих исходных форматов.
      const natural = group.map((ratio, i) => available * columns[i] / ratio);
      height = Math.max(width * .25, Math.min(width * .58, Math.sqrt(natural[0] * natural[1])));
      pair++;
    }
    const widths = columns.map(weight => weight * (width - gap * (count - 1)));
    rows.push({ start, count, ratios: group, width, gap, columns, widths,
      height, heights: widths.map(() => height), frameRatios: widths.map(cellWidth => cellWidth / height) });
    start += count;
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
      node.style.setProperty('--gallery-columns', row.columns.map(weight => `minmax(0,${weight}fr)`).join(' '));
      node.style.setProperty('--row-gap', `${row.gap}px`);
      for (let i = row.start; i < row.start + row.count; i++) {
        const figure = figures[i];
        const image = figure.querySelector('img');
        const cell = i - row.start;
        figure.style.setProperty('--frame-ratio', String(row.frameRatios[cell]));
        image.sizes = `${Math.ceil(Math.max(row.widths[cell], row.height * ratios[i]))}px`;
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
