/* Grandma Mei's Herbal Remedies — shared site behavior
   Vanilla JS only: scroll reveals, SVG draw-on-scroll, email modal, mobile nav,
   ambient motes. All effects respect prefers-reduced-motion. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Scroll-triggered reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reducedMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Self-drawing botanical dividers ---------- */
  var dividers = document.querySelectorAll('.divider[data-draw]');
  dividers.forEach(function (divider) {
    divider.querySelectorAll('path').forEach(function (path) {
      try {
        var len = Math.ceil(path.getTotalLength());
        path.style.setProperty('--path-len', len);
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      } catch (e) { /* non-rendered SVG; skip */ }
    });
  });
  if (!reducedMotion && 'IntersectionObserver' in window) {
    var drawObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          drawObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    dividers.forEach(function (d) { drawObserver.observe(d); });
  } else {
    dividers.forEach(function (d) {
      d.querySelectorAll('path').forEach(function (p) {
        p.style.strokeDasharray = 'none';
        p.style.strokeDashoffset = '0';
      });
    });
  }

  /* ---------- Ambient dust motes (hero only) ---------- */
  var moteHost = document.querySelector('.motes');
  if (moteHost && !reducedMotion) {
    var MOTE_COUNT = 14;
    for (var i = 0; i < MOTE_COUNT; i++) {
      var mote = document.createElement('span');
      mote.className = 'mote';
      mote.style.left = (Math.random() * 100) + '%';
      mote.style.setProperty('--drift-x', (Math.random() * 80 - 40) + 'px');
      mote.style.animationDuration = (14 + Math.random() * 14) + 's';
      mote.style.animationDelay = (Math.random() * 18) + 's';
      var size = 3 + Math.random() * 4;
      mote.style.width = size + 'px';
      mote.style.height = size + 'px';
      moteHost.appendChild(mote);
    }
  }

  /* ---------- First-visit email capture modal ----------
     Dismissible soft gate: shows once per visitor (localStorage),
     never blocks content. Also closes via X, overlay click, Escape. */
  var overlay = document.getElementById('email-modal');
  if (overlay) {
    var STORAGE_KEY = 'gm_modal_seen';
    var seen = null;
    try { seen = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }

    var openModal = function () {
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      var closeBtn = overlay.querySelector('.modal__close');
      if (closeBtn) closeBtn.focus();
    };
    var closeModal = function () {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    };

    if (!seen) {
      // Small delay so the page paints first — kinder to in-app browsers.
      setTimeout(openModal, 2500);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    var closeBtn = overlay.querySelector('.modal__close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    // Any element with [data-open-modal] re-opens it (e.g. inline CTA).
    document.querySelectorAll('[data-open-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.classList.add('is-open');
        overlay.removeAttribute('aria-hidden');
      });
    });
  }

  /* ---------- Lazy-load below-the-fold images ---------- */
  document.querySelectorAll('img[data-lazy]').forEach(function (img) {
    img.loading = 'lazy';
  });
})();
