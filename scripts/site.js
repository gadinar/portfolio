'use strict';

function updateCopyrightYear() {
  const year = String(new Date().getFullYear());
  for (const node of document.querySelectorAll('[data-current-year]')) node.textContent = year;
}
updateCopyrightYear();
document.addEventListener('visibilitychange', updateCopyrightYear);
setInterval(updateCopyrightYear, 60000);
