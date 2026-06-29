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

/* ============================================================
   GALLERY — photos + videos, grid build + lightbox
   ============================================================
   To add or remove media: edit the GALLERY_ITEMS list below.
   - Put files in: assets/gallery/
   - Images: give "src". Videos: give "src" + "poster" (a thumbnail image).
   - "alt" is used for the thumbnail label and the lightbox caption.
   File type is detected from the extension (.mp4/.webm/.ogg/.mov = video).
*/
const GALLERY_ITEMS = [
  { src: 'assets/gallery/photo-1.JPG',  alt: "San Diego women's hockey players on the ice during a game." },
  { src: 'assets/gallery/photo-2.JPG',  alt: 'A faceoff at center ice between two players.' },
  { src: 'assets/gallery/photo-3.png',  alt: 'Teammates celebrating a goal together.' },
  { src: 'assets/gallery/photo-11.JPG',   alt: 'Game highlight: a breakaway and shot on goal.', poster: 'assets/gallery/clip-1.jpg' },
  { src: 'assets/gallery/photo-4.png',  alt: 'A goalie making a save in front of the net.' },
  { src: 'assets/gallery/photo-5.png',  alt: 'A player carrying the puck up the ice.' },
  { src: 'assets/gallery/photo-6.png',  alt: 'Players lined up on the bench during a game.' },
  { src: 'assets/gallery/photo-12.JPG',   alt: 'Warmup drills before the game.', poster: 'assets/gallery/clip-2.jpg' },
  { src: 'assets/gallery/photo-7.png',  alt: 'A skater taking a shot on goal.' },
  { src: 'assets/gallery/photo-8.png',  alt: 'The team posing for a group photo on the ice.' },
  { src: 'assets/gallery/photo-9.png',  alt: 'Two players battling for the puck along the boards.' },
  { src: 'assets/gallery/photo-10.png', alt: 'Players warming up before a game.' },
];

(function () {
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const VIDEO_RE = /\.(mp4|webm|ogg|mov)$/i;
  const isVideo = (item) => VIDEO_RE.test(item.src);

  const imgEl = lightbox.querySelector('.lightbox__img');
  const videoEl = lightbox.querySelector('.lightbox__video');
  const captionEl = lightbox.querySelector('.lightbox__caption');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn = lightbox.querySelector('.lightbox__nav--next');

  // ---- Build the grid from GALLERY_ITEMS ----
  GALLERY_ITEMS.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'photos__item';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photos__btn';
    const video = isVideo(item);
    btn.setAttribute('aria-label', (video ? 'Play video: ' : 'View photo: ') + item.alt);

    const thumb = document.createElement('img');
    thumb.loading = 'lazy';
    thumb.src = video ? (item.poster || '') : item.src;
    thumb.alt = item.alt;
    btn.appendChild(thumb);

    if (video) {
      btn.classList.add('photos__btn--video');
      const badge = document.createElement('span');
      badge.className = 'photos__play';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = '▶';
      btn.appendChild(badge);
    }

    btn.addEventListener('click', () => open(i));
    li.appendChild(btn);
    grid.appendChild(li);
  });

  // ---- Lightbox ----
  let current = 0;
  let lastFocused = null;

  function show(i) {
    current = (i + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
    const item = GALLERY_ITEMS[current];
    videoEl.pause();
    if (isVideo(item)) {
      imgEl.hidden = true;
      imgEl.removeAttribute('src');
      videoEl.hidden = false;
      videoEl.src = item.src;
      if (item.poster) videoEl.poster = item.poster;
    } else {
      videoEl.hidden = true;
      videoEl.removeAttribute('src');
      videoEl.load();
      imgEl.hidden = false;
      imgEl.src = item.src;
      imgEl.alt = item.alt;
    }
    captionEl.textContent = item.alt;
  }

  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    videoEl.pause();
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();

/* Carousel auto-scroll */
(function () {
  const track = document.querySelector('.gallery__track');
  if (!track) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let paused = false;
  const SPEED = 0.5; // pixels per frame

  function tick() {
    if (!paused) {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 1) {
        track.scrollTo({ left: 0, behavior: 'auto' }); // loop back to start
      } else {
        track.scrollLeft += SPEED;
      }
    }
    requestAnimationFrame(tick);
  }

  // pause on hover / focus so users can browse
  ['mouseenter', 'focusin'].forEach((e) =>
    track.addEventListener(e, () => { paused = true; }, { passive: true })
  );
  ['mouseleave', 'focusout'].forEach((e) =>
    track.addEventListener(e, () => { paused = false; }, { passive: true })
  );

  // touch: pause while the finger is down, resume shortly after release
  let resumeTimer;
  track.addEventListener('touchstart', () => {
    clearTimeout(resumeTimer);
    paused = true;
  }, { passive: true });
  ['touchend', 'touchcancel'].forEach((e) =>
    track.addEventListener(e, () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, 1200);
    }, { passive: true })
  );

  requestAnimationFrame(tick);
})();



/* Footer year */
(function () {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();
