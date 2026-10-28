'use strict';

function previewIndex(position, width, count) {
  return Math.max(0, Math.min(count - 1, Math.floor(position / width * count)));
}

for (const frame of document.querySelectorAll('.project-card .cover[data-preview]')) {
  let slides;
  try { slides = JSON.parse(frame.dataset.preview); } catch { continue; }
  if (!Array.isArray(slides) || slides.length < 2) continue;
  const link = frame.closest('a');
  const image = frame.querySelector('img');
  let current = 0;
  let wanted = 0;
  let gesture = null;
  let suppressClick = false;
  const loaded = new Map();
  const indicators = document.createElement('span');
  indicators.className = 'preview-indicators';
  indicators.setAttribute('aria-hidden', 'true');
  const bars = slides.map((_, index) => {
    const bar = document.createElement('span');
    bar.className = index === 0 ? 'is-current' : '';
    indicators.append(bar);
    return bar;
  });
  const announcement = document.createElement('span');
  announcement.className = 'visually-hidden';
  announcement.setAttribute('aria-live', 'polite');
  frame.append(indicators, announcement);
  link.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');

  function load(index) {
    if (!loaded.has(index)) {
      const slide = slides[index];
      const probe = new Image();
      probe.sizes = image.sizes;
      probe.srcset = slide.srcset;
      probe.src = slide.src;
      loaded.set(index, probe.decode().then(() => probe).catch(() => {
        loaded.delete(index);
        return null;
      }));
    }
    return loaded.get(index);
  }

  async function show(index, announce = false) {
    wanted = index;
    if (index === current) return;
    const ready = await load(index);
    // При быстром движении курсора поздний ответ не меняет уже выбранный кадр.
    if (!ready || wanted !== index) return;
    image.srcset = slides[index].srcset;
    image.src = slides[index].src;
    image.alt = slides[index].alt;
    current = index;
    bars.forEach((bar, i) => bar.classList.toggle('is-current', i === index));
    if (announce) announcement.textContent = `Изображение ${index + 1} из ${slides.length}`;
  }

  function warmUp() {
    // Загружаем соседние кадры при взаимодействии, не всю библиотеку при открытии.
    void load(Math.min(current + 1, slides.length - 1));
    void load(Math.max(current - 1, 0));
  }

  function hover(event) {
    if (event.pointerType !== 'mouse' || event.buttons) return;
    const bounds = frame.getBoundingClientRect();
    void show(previewIndex(event.clientX - bounds.left, bounds.width, slides.length));
  }
  frame.addEventListener('pointerenter', event => { warmUp(); hover(event); });
  frame.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return hover(event);
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      gesture.dragging = true;
      frame.setPointerCapture(event.pointerId);
    }
    if (!gesture.dragging) return;
    const step = frame.getBoundingClientRect().width / Math.min(slides.length, 4);
    const index = Math.max(0, Math.min(slides.length - 1, gesture.index + Math.round(-dx / step)));
    void show(index);
  });
  frame.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') void show(0);
  });
  frame.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, index: current, dragging: false };
    warmUp();
  });
  frame.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    suppressClick = gesture.dragging;
    if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);
    gesture = null;
  });
  frame.addEventListener('pointercancel', () => { gesture = null; suppressClick = false; });
  link.addEventListener('pointerdown', () => { suppressClick = false; });
  link.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      suppressClick = false;
    }
  });
  link.addEventListener('keydown', event => {
    const keys = { ArrowLeft: Math.max(0, wanted - 1), ArrowRight: Math.min(slides.length - 1, wanted + 1), Home: 0, End: slides.length - 1 };
    if (!(event.key in keys) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    void show(keys[event.key], true);
  });
  link.addEventListener('focus', warmUp);
}
