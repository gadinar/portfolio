'use strict';

(() => {
  const key = 'portfolio-theme';
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let selected = null;
  try { selected = localStorage.getItem(key); } catch { /* Тема работает и без доступа к хранилищу. */ }
  if (!['light', 'dark'].includes(selected)) selected = null;

  function apply(theme) {
    root.dataset.theme = theme;
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.hidden = false;
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.setAttribute('title', `Включить ${theme === 'dark' ? 'светлую' : 'тёмную'} тему`);
    }
  }
  function current() { return selected || (preference.matches ? 'dark' : 'light'); }
  apply(current());
  preference.addEventListener('change', () => { if (!selected) apply(current()); });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    selected = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    apply(current());
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply(current());
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      selected = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, selected); } catch { /* Выбор действует в текущей вкладке. */ }
      apply(selected);
    });
  });
})();
