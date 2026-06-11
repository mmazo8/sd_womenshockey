/* Mobile navigation toggle */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const scrim = document.querySelector('.nav-scrim');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.dataset.open = open;
    if (scrim) scrim.dataset.open = open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => {
    setOpen(nav.dataset.open !== 'true');
  });

  if (scrim) scrim.addEventListener('click', () => setOpen(false));

  // Close on link click or Escape
  nav.querySelectorAll('.nav__link').forEach((link) =>
    link.addEventListener('click', () => setOpen(false))
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();