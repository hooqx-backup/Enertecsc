/* ============================================================
   EnerTec — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Lenis smooth scroll ---------- */
  var lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });
    function lenisRaf(time) { lenis.raf(time); requestAnimationFrame(lenisRaf); }
    requestAnimationFrame(lenisRaf);
  }

  /* ---------- Hero Carousel ---------- */
  var hSlides = document.querySelectorAll('.hero-slide');
  var hTexts  = document.querySelectorAll('.hero-text');
  var hDots   = document.querySelectorAll('.hero-dot');
  var hPrev   = document.querySelector('.hero-prev');
  var hNext   = document.querySelector('.hero-next');
  var hCur    = 0;

  hSlides[0].classList.add('active');
  hDots[0].classList.add('active');

  function heroGoTo(n) {
    n = ((n % hSlides.length) + hSlides.length) % hSlides.length;
    if (n === hCur) return;
    hSlides[hCur].classList.remove('active');
    hDots[hCur].classList.remove('active');
    hTexts[hCur].classList.remove('active');
    hCur = n;
    hSlides[hCur].classList.add('active');
    hDots[hCur].classList.add('active');
    hTexts[hCur].classList.add('active');
  }

  if (hPrev) hPrev.addEventListener('click', function () { heroGoTo(hCur - 1); resetHero(); });
  if (hNext) hNext.addEventListener('click', function () { heroGoTo(hCur + 1); resetHero(); });
  hDots.forEach(function (d, i) {
    d.addEventListener('click', function () { heroGoTo(i); resetHero(); });
  });

  var heroTimer;
  function resetHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(function () { heroGoTo(hCur + 1); }, 3000);
  }
  resetHero();

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var body = document.body;
  var openBtn  = document.querySelector('.nav-toggle');
  var closeBtn = document.querySelector('.mp-close');
  var overlay  = document.querySelector('.mobile-overlay');

  function openMenu()  { body.classList.add('menu-open'); }
  function closeMenu() { body.classList.remove('menu-open'); }

  if (openBtn)  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay)  overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.m-sub-toggle').forEach(function (t) {
    t.addEventListener('click', function () {
      t.classList.toggle('open');
      var sub = t.nextElementSibling;
      if (sub) sub.classList.toggle('open');
    });
  });

  document.querySelectorAll('.mobile-nav a[href]:not([href="#"])').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Smooth-scroll for in-page anchors (Lenis-aware) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -72 });
      } else {
        var y = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ==========================================================
     GSAP + ScrollTrigger animations
  ========================================================== */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* Connect Lenis to ScrollTrigger so scrub stays in sync */
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* ---- Hero entrance timeline ---- */
    var heroTl = gsap.timeline({ delay: 0.25 });
    heroTl
      .from('.hero-text.active .hero-eyebrow', { y: 24, opacity: 0, duration: 0.7,  ease: 'power3.out' })
      .from('.hero-text.active .sub',          { y: 28, opacity: 0, duration: 0.75, ease: 'power3.out' }, 0.9)
      .from('.hero-actions',                   { y: 22, opacity: 0, duration: 0.65, ease: 'power3.out' }, 1.1)
      .from('.hero-controls',                  { y: 16, opacity: 0, duration: 0.5,  ease: 'power3.out' }, 1.25);

    /* ---- Pillar cards: staggered entry + 3D tilt ---- */
    gsap.from('.pillar', {
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 90%' },
      y: 80, opacity: 0, scale: 0.88,
      duration: 1.05, stagger: 0.2,
      ease: 'power3.out', clearProps: 'all',
    });

    document.querySelectorAll('.pillar').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
        gsap.to(card, { duration: 0.35, rotateX: -dy * 7, rotateY: dx * 7, y: -12, ease: 'power2.out', transformPerspective: 700, overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, { duration: 0.6, rotateX: 0, rotateY: 0, y: 0, ease: 'power3.out', overwrite: 'auto' });
      });
    });

    /* ---- About image parallax ---- */
    gsap.to('.about-img-main', {
      scrollTrigger: { trigger: '.about-grid', start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      y: -50, ease: 'none',
    });

    /* ---- Text animations ---- */

    /* Helper: wrap each word in overflow-hidden spans for clip reveal */
    function splitWords(el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) {
        return '<span class="ww"><span class="wi">' + w.replace(/&/g, '&amp;') + '</span></span>';
      }).join(' ');
      return el.querySelectorAll('.wi');
    }

    /* Eyebrow labels — slide in from left */
    gsap.utils.toArray('.eyebrow').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        x: -20, opacity: 0,
        duration: 0.6, ease: 'power3.out',
      });
    });

    /* Section headings — word-by-word reveal from beneath a clip */
    gsap.utils.toArray('.section-title').forEach(function (el) {
      var words = splitWords(el);
      gsap.from(words, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        y: '110%', opacity: 0,
        duration: 0.65, stagger: 0.045,
        ease: 'power3.out',
      });
    });

    /* Lede / intro paragraphs — blur + fade up */
    gsap.utils.toArray('.lede').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        y: 28, opacity: 0,
        filter: 'blur(5px)',
        duration: 0.9, ease: 'power3.out',
        delay: 0.12, clearProps: 'filter',
      });
    });

    /* Hero headline — word-by-word (override simple y-fade set in timeline) */
    var heroH1 = document.querySelector('.hero-text.active h1');
    if (heroH1) {
      var heroWords = splitWords(heroH1);
      gsap.from(heroWords, {
        y: '110%', opacity: 0,
        duration: 0.6, stagger: 0.04,
        ease: 'power3.out', delay: 0.55,
      });
    }

    /* ---- Generic .reveal elements (replaces IntersectionObserver) ---- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    reveals.forEach(function (el) {
      var delay = 0;
      if      (el.classList.contains('d1')) delay = 0.1;
      else if (el.classList.contains('d2')) delay = 0.2;
      else if (el.classList.contains('d3')) delay = 0.3;
      else if (el.classList.contains('d4')) delay = 0.4;

      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          y: 0, opacity: 1,
          duration: 0.85, delay: delay,
          ease: 'power3.out',
          onComplete: function () { el.classList.add('in'); },
        }
      );
    });

    /* Safety net — ensure nothing stays invisible */
    window.addEventListener('load', function () {
      setTimeout(function () {
        reveals.forEach(function (el) { el.classList.add('in'); });
      }, 3500);
    });

  } else {
    /* ---- Fallback: IntersectionObserver reveal ---- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    function revealNow(el) { el.classList.add('in'); }
    function inView(el) {
      var r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || document.documentElement.clientHeight) * 0.95 && r.bottom > 0;
    }
    function revealVisible() {
      reveals.forEach(function (el) { if (!el.classList.contains('in') && inView(el)) revealNow(el); });
    }
    revealVisible();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { revealNow(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
    } else {
      window.addEventListener('scroll', revealVisible, { passive: true });
    }
    window.addEventListener('load', revealVisible);
    setTimeout(function () { reveals.forEach(revealNow); }, 2500);
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dur = 1600, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = target % 1 === 0 ? Math.round(target * eased).toString() : (target * eased).toFixed(1);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target % 1 === 0 ? target.toString() : target.toFixed(1);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) { other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
      });
      if (isOpen) { item.classList.remove('open'); a.style.maxHeight = null; }
      else        { item.classList.add('open');    a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------- Testimonials slider ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.testi-slide'));
  if (slides.length) {
    var idx = 0;
    var prev = document.querySelector('.testi-prev');
    var next = document.querySelector('.testi-next');
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
    }
    if (prev) prev.addEventListener('click', function () { show(idx - 1); });
    if (next) next.addEventListener('click', function () { show(idx + 1); });
    var auto = setInterval(function () { show(idx + 1); }, 7000);
    [prev, next].forEach(function (b) {
      if (b) b.addEventListener('click', function () { clearInterval(auto); });
    });
    show(0);
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.style.opacity = '.7';
      status.textContent = 'Sending…'; status.style.color = 'var(--muted)';
      setTimeout(function () {
        status.textContent = '✓ Thanks! We will get back to you shortly.';
        status.style.color = 'var(--accent-600)';
        form.reset(); btn.disabled = false; btn.style.opacity = '1';
      }, 1100);
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

})();
