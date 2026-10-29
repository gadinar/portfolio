'use strict';

(() => {
  const gallery = document.querySelector('.gallery');
  if (!gallery || typeof HTMLDialogElement === 'undefined') return;
  const links = [...gallery.querySelectorAll('.gallery-image')];
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Просмотр изображений проекта');
  dialog.innerHTML = `<div class="viewer-toolbar"><p class="viewer-counter" aria-live="polite"></p><button type="button" class="viewer-close" aria-label="Закрыть"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div class="viewer-stage"><img alt="" draggable="false"><p class="viewer-error" role="status" hidden>Не удалось загрузить изображение. Попробуйте открыть его ещё раз.</p></div>
    <div class="viewer-navigation"><button type="button" class="viewer-prev" aria-label="Предыдущее изображение"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button><button type="button" class="viewer-next" aria-label="Следующее изображение"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button></div>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const counter = dialog.querySelector('.viewer-counter');
  const error = dialog.querySelector('.viewer-error');
  const stage = dialog.querySelector('.viewer-stage');
  let current = 0;
  let touch;
  function show(index) {
    current = (index + links.length) % links.length;
    image.alt = links[current].querySelector('img').alt;
    error.hidden = true;
    image.src = links[current].href;
    counter.textContent = `${current + 1} / ${links.length}`;
  }
  function close() { dialog.close(); }
  image.addEventListener('error', () => { error.hidden = false; });
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    event.preventDefault();
    show(index);
    dialog.showModal();
    document.documentElement.classList.add('viewer-open');
  }));
  dialog.querySelector('.viewer-close').addEventListener('click', close);
  dialog.querySelector('.viewer-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => show(current + 1));
  dialog.querySelector('.viewer-navigation').hidden = links.length < 2;
  dialog.addEventListener('close', () => document.documentElement.classList.remove('viewer-open'));
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target === stage) close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  stage.addEventListener('touchstart', event => {
    touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touch = null; });
})();
