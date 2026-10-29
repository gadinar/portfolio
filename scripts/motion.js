'use strict';

(() => {
  const root = document.documentElement;
  const effects = new Set((root.dataset.animations || '').split(' '));
  if (!root.dataset.animations || typeof matchMedia !== 'function') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = effects.has('reveal') ? [...document.querySelectorAll('.project-card, .gallery figure')] : [];
  const seen = new Set();
  const active = new Set();
  let observer;
  if (targets.length && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || reduced.matches || entry.target.hidden || seen.has(entry.target)) continue;
        const node = entry.target;
        seen.add(node);
        observer.unobserve(node);
        if (typeof node.animate !== 'function' || node.contains(document.activeElement)) continue;
        // Контент виден и без JS; анимация не меняет размеры или порядок сетки.
        const animation = node.animate([
          { opacity: .65, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 420, easing: 'cubic-bezier(.2,.65,.3,1)' });
        active.add(animation);
        animation.finished.catch(() => {}).finally(() => active.delete(animation));
      }
    }, { threshold: .08 });
  }
  function update() {
    root.classList.toggle('motion-ready', !reduced.matches);
    if (reduced.matches) {
      observer?.disconnect();
      for (const animation of active) animation.cancel();
      active.clear();
    } else {
      for (const node of targets) if (!seen.has(node)) observer?.observe(node);
    }
  }
  // Тема уже установлена до первого кадра; переходы не вызывают стартовую вспышку.
  requestAnimationFrame(update);
  reduced.addEventListener('change', update);
})();
