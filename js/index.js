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

  if (hSlides.length) {
    hSlides[0].classList.add('active');
    if (hDots[0]) hDots[0].classList.add('active');

    function heroGoTo(n) {
      n = ((n % hSlides.length) + hSlides.length) % hSlides.length;
      if (n === hCur) return;
      hSlides[hCur].classList.remove('active');
      if (hDots[hCur]) hDots[hCur].classList.remove('active');
      if (hTexts[hCur]) hTexts[hCur].classList.remove('active');
      hCur = n;
      hSlides[hCur].classList.add('active');
      if (hDots[hCur]) hDots[hCur].classList.add('active');
      if (hTexts[hCur]) hTexts[hCur].classList.add('active');
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
  }

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
    var heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .from('.hero-text.active .hero-eyebrow', { y: 16, opacity: 0, duration: 0.35, ease: 'power3.out' })
      .from('.hero-text.active .sub',          { y: 18, opacity: 0, duration: 0.35, ease: 'power3.out' }, 0.45)
      .from('.hero-actions',                   { y: 14, opacity: 0, duration: 0.3,  ease: 'power3.out' }, 0.6)
      .from('.hero-controls',                  { y: 10, opacity: 0, duration: 0.25, ease: 'power3.out' }, 0.7);

    /* ---- Pillar cards: staggered entry + 3D tilt ---- */
    gsap.from('.pillar', {
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 90%' },
      y: 50, opacity: 0, scale: 0.93,
      duration: 0.55, stagger: 0.1,
      ease: 'power3.out', clearProps: 'all',
    });

    document.querySelectorAll('.pillar').forEach(function (card) {
      /* inject spotlight glow layer */
      var glow = document.createElement('div');
      glow.className = 'pillar-glow';
      card.appendChild(glow);

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x  = e.clientX - rect.left;
        var y  = e.clientY - rect.top;
        var dx = (x - rect.width  / 2) / (rect.width  / 2);
        var dy = (y - rect.height / 2) / (rect.height / 2);
        glow.style.setProperty('--gx', x + 'px');
        glow.style.setProperty('--gy', y + 'px');
        gsap.to(card, { duration: 0.35, rotateX: -dy * 8, rotateY: dx * 8, y: -14, ease: 'power2.out', transformPerspective: 700, overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, { duration: 0.7, rotateX: 0, rotateY: 0, y: 0, ease: 'power3.out', overwrite: 'auto' });
      });
    });

    /* ---- About image parallax ---- */
    gsap.to('.about-img-main', {
      scrollTrigger: { trigger: '.about-grid', start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      y: -50, ease: 'none',
    });

    /* ---- Why Choose Us — pro animations ---- */
    (function () {
      var whySec   = document.querySelector('.why');
      if (!whySec) return;

      var whyVisual = whySec.querySelector('.why-visual');
      var imgMain   = whySec.querySelector('.why-img-main');
      var imgSub    = whySec.querySelector('.why-img-sub');
      var phAccent  = whySec.querySelector('.ph-accent');
      var points    = whySec.querySelectorAll('.why-point');
      var icons     = whySec.querySelectorAll('.why-point .ic');

      /* Accent block: scale in from top-left corner */
      if (phAccent) {
        gsap.fromTo(phAccent,
          { scale: 0, transformOrigin: 'top left' },
          {
            scrollTrigger: { trigger: whyVisual, start: 'top 80%', once: true },
            scale: 1, duration: 0.9, ease: 'power3.out',
          }
        );
      }

      /* Main image: clip-path curtain reveal top → bottom */
      if (imgMain) {
        gsap.fromTo(imgMain,
          { clipPath: 'inset(0% 0% 100% 0% round 22px)' },
          {
            scrollTrigger: { trigger: whyVisual, start: 'top 78%', once: true },
            clipPath: 'inset(0% 0% 0% 0% round 22px)',
            duration: 1.25, ease: 'power4.inOut',
          }
        );

        /* Main image: scroll parallax */
        gsap.to(imgMain, {
          scrollTrigger: { trigger: '.why', start: 'top bottom', end: 'bottom top', scrub: 1.4 },
          y: -65, ease: 'none',
        });

        /* Main image: 3-D tilt on mouse move */
        whyVisual.addEventListener('mousemove', function (e) {
          var r  = whyVisual.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
          var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
          gsap.to(imgMain, {
            rotateX: -dy * 6, rotateY: dx * 6,
            duration: 0.4, ease: 'power2.out',
            transformPerspective: 900, overwrite: 'auto',
          });
        });
        whyVisual.addEventListener('mouseleave', function () {
          gsap.to(imgMain, {
            rotateX: 0, rotateY: 0,
            duration: 0.7, ease: 'power3.out', overwrite: 'auto',
          });
        });
      }

      /* Sub image: slide in from bottom-right corner, then float */
      if (imgSub) {
        gsap.fromTo(imgSub,
          { x: 40, y: 55, opacity: 0, rotation: 6 },
          {
            scrollTrigger: { trigger: whyVisual, start: 'top 75%', once: true },
            x: 0, y: 0, opacity: 1, rotation: 0,
            duration: 1.05, delay: 0.6, ease: 'power3.out',
            onComplete: function () {
              /* Perpetual gentle float */
              gsap.to(imgSub, {
                y: -10, duration: 2.9, ease: 'sine.inOut', yoyo: true, repeat: -1,
              });
            },
          }
        );
      }

      /* Why-points: staggered slide-up */
      if (points.length) {
        gsap.fromTo(points,
          { y: 44, opacity: 0 },
          {
            scrollTrigger: { trigger: '.why-points', start: 'top 82%', once: true },
            y: 0, opacity: 1,
            duration: 0.65, stagger: 0.12,
            ease: 'power3.out', clearProps: 'all',
          }
        );

        /* Icons: spring scale pop — same stagger so each icon pops as its card arrives */
        gsap.fromTo(icons,
          { scale: 0 },
          {
            scrollTrigger: { trigger: '.why-points', start: 'top 82%', once: true },
            scale: 1,
            duration: 0.5, stagger: 0.12,
            ease: 'back.out(2.5)', clearProps: 'transform',
          }
        );

        /* Icons: magnetic hover */
        icons.forEach(function (ic) {
          ic.addEventListener('mousemove', function (e) {
            var r  = ic.getBoundingClientRect();
            var dx = (e.clientX - r.left - r.width  / 2) * 0.35;
            var dy = (e.clientY - r.top  - r.height / 2) * 0.35;
            gsap.to(ic, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
          });
          ic.addEventListener('mouseleave', function () {
            gsap.to(ic, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)' });
          });
        });
      }
    })();

    /* ====================================================
       PREMIUM HOVER — ALL SECTIONS
       ==================================================== */
    (function () {

      /* --- Service cards: inner-image counter-parallax + 3-D tilt --- */
      document.querySelectorAll('.svc').forEach(function (card) {
        var img = card.querySelector('.svc-img-wrap img');
        var num = card.querySelector('.svc-num');
        var ic  = card.querySelector('.svc-ic');

        card.addEventListener('mousemove', function (e) {
          var r  = card.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
          var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);

          gsap.to(card, {
            rotateX: -dy * 4, rotateY: dx * 4, y: -10,
            duration: 0.4, ease: 'power2.out',
            transformPerspective: 900, overwrite: 'auto',
          });
          /* image moves opposite to cursor — creates depth illusion */
          if (img) gsap.to(img, {
            x: -dx * 16, y: -dy * 12, scale: 1.1,
            duration: 0.55, ease: 'power2.out', overwrite: 'auto',
          });
          /* number badge drifts with tilt */
          if (num) gsap.to(num, {
            x: dx * 9, y: dy * 6,
            duration: 0.4, ease: 'power2.out', overwrite: 'auto',
          });
          /* icon floats counter to badge */
          if (ic) gsap.to(ic, {
            x: -dx * 7, y: -dy * 5, scale: 1.12,
            duration: 0.4, ease: 'power2.out', overwrite: 'auto',
          });
        });

        card.addEventListener('mouseleave', function () {
          gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.75, ease: 'power3.out', overwrite: 'auto' });
          if (img) gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.65, ease: 'power3.out', overwrite: 'auto' });
          if (num) gsap.to(num, { x: 0, y: 0, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
          if (ic)  gsap.to(ic,  { x: 0, y: 0, scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
        });
      });

      /* --- Feature list items: icon spring + slide right --- */
      document.querySelectorAll('.feature').forEach(function (feat) {
        var ic = feat.querySelector('.ic');
        feat.addEventListener('mouseenter', function () {
          gsap.to(feat, { x: 8, duration: 0.3, ease: 'power2.out' });
          if (ic) gsap.to(ic, { scale: 1.18, rotate: 10, duration: 0.3, ease: 'back.out(2.5)' });
        });
        feat.addEventListener('mouseleave', function () {
          gsap.to(feat, { x: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
          if (ic) gsap.to(ic, { scale: 1, rotate: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
      });

      /* --- Marquee items: GSAP scale spring on hover --- */
      document.querySelectorAll('.marquee-item').forEach(function (item) {
        item.addEventListener('mouseenter', function () {
          gsap.to(item, { scale: 1.12, duration: 0.28, ease: 'back.out(2)' });
        });
        item.addEventListener('mouseleave', function () {
          gsap.to(item, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
        });
      });

      /* --- Why-points: lift + elastic settle --- */
      document.querySelectorAll('.why-point').forEach(function (pt) {
        pt.addEventListener('mouseenter', function () {
          gsap.to(pt, { y: -7, duration: 0.28, ease: 'power2.out' });
        });
        pt.addEventListener('mouseleave', function () {
          gsap.to(pt, { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
      });

      /* --- Buttons: magnetic pull + ripple on click --- */
      document.querySelectorAll('.btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var r  = btn.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width  / 2) * 0.3;
          var dy = (e.clientY - r.top  - r.height / 2) * 0.3;
          gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)' });
        });
        btn.addEventListener('click', function (e) {
          var r      = btn.getBoundingClientRect();
          var ripple = document.createElement('span');
          ripple.className = 'btn-ripple';
          ripple.style.left = (e.clientX - r.left) + 'px';
          ripple.style.top  = (e.clientY - r.top)  + 'px';
          btn.appendChild(ripple);
          gsap.fromTo(ripple,
            { scale: 0, opacity: 0.55 },
            { scale: 45, opacity: 0, duration: 0.75, ease: 'power2.out',
              onComplete: function () { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }
            }
          );
        });
      });

      /* --- Footer social icons: spring bounce --- */
      document.querySelectorAll('.footer-social a').forEach(function (a) {
        a.addEventListener('mouseenter', function () {
          gsap.to(a, { scale: 1.2, y: -4, duration: 0.25, ease: 'back.out(2.5)' });
        });
        a.addEventListener('mouseleave', function () {
          gsap.to(a, { scale: 1, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
        });
      });

      /* --- Hero carousel arrows: scale bounce --- */
      document.querySelectorAll('.hero-arr').forEach(function (arr) {
        arr.addEventListener('mouseenter', function () {
          gsap.to(arr, { scale: 1.14, duration: 0.22, ease: 'back.out(2)' });
        });
        arr.addEventListener('mouseleave', function () {
          gsap.to(arr, { scale: 1, duration: 0.38, ease: 'power3.out' });
        });
      });

      /* --- About images: subtle tilt on hover --- */
      var aboutMedia = document.querySelector('.about-media');
      var aboutMain  = document.querySelector('.about-img-main');
      if (aboutMedia && aboutMain) {
        aboutMedia.addEventListener('mousemove', function (e) {
          var r  = aboutMedia.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
          var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
          gsap.to(aboutMain, {
            rotateX: -dy * 4, rotateY: dx * 4,
            duration: 0.45, ease: 'power2.out',
            transformPerspective: 1000, overwrite: 'auto',
          });
        });
        aboutMedia.addEventListener('mouseleave', function () {
          gsap.to(aboutMain, {
            rotateX: 0, rotateY: 0,
            duration: 0.7, ease: 'power3.out', overwrite: 'auto',
          });
        });
      }

    })();

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
        x: -14, opacity: 0,
        duration: 0.3, ease: 'power3.out',
      });
    });

    /* Section headings — word-by-word reveal from beneath a clip */
    gsap.utils.toArray('.section-title').forEach(function (el) {
      var words = splitWords(el);
      gsap.from(words, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        y: '110%', opacity: 0,
        duration: 0.4, stagger: 0.025,
        ease: 'power3.out',
      });
    });

    /* Lede / intro paragraphs — blur + fade up */
    gsap.utils.toArray('.lede').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        y: 18, opacity: 0,
        filter: 'blur(4px)',
        duration: 0.4, ease: 'power3.out',
        delay: 0.08, clearProps: 'filter',
      });
    });

    /* Hero headline — word-by-word */
    var heroH1 = document.querySelector('.hero-text.active h1');
    if (heroH1) {
      var heroWords = splitWords(heroH1);
      gsap.from(heroWords, {
        y: '110%', opacity: 0,
        duration: 0.35, stagger: 0.025,
        ease: 'power3.out', delay: 0.3,
      });
    }

    /* ---- Generic .reveal elements (replaces IntersectionObserver) ---- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    reveals.forEach(function (el) {
      var delay = 0;
      if      (el.classList.contains('d1')) delay = 0.06;
      else if (el.classList.contains('d2')) delay = 0.12;
      else if (el.classList.contains('d3')) delay = 0.18;
      else if (el.classList.contains('d4')) delay = 0.24;

      gsap.fromTo(el,
        { y: 24, opacity: 0 },
        {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          y: 0, opacity: 1,
          duration: 0.45, delay: delay,
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

  /* ---------- WhatsApp FAB ---------- */
  var waFab = document.createElement('a');
  waFab.className = 'whatsapp-fab';
  waFab.href = 'https://wa.me/917003634890';
  waFab.target = '_blank';
  waFab.rel = 'noopener noreferrer';
  waFab.setAttribute('aria-label', 'Chat with us on WhatsApp');
  waFab.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';
  document.body.appendChild(waFab);

  function updateWaFab() {
    waFab.classList.toggle('visible', window.scrollY > 80);
  }
  window.addEventListener('scroll', updateWaFab, { passive: true });
  updateWaFab();

  /* ---------- Floating scroll FAB ---------- */
  var fab    = document.getElementById('scrollFab');
  var footer = document.querySelector('.footer');

  if (fab) {
    function updateFab() {
      var scrolled  = window.scrollY;
      var docH      = document.documentElement.scrollHeight - window.innerHeight;
      var pct       = docH > 0 ? scrolled / docH : 0;

      /* Hide before 80px scroll */
      var show = scrolled > 80;

      fab.classList.toggle('visible', show);

      /* Switch direction at 50% scroll */
      var goUp = pct >= 0.5;
      fab.classList.toggle('up', goUp);
      fab.setAttribute('aria-label', goUp ? 'Scroll to top' : 'Scroll down');
    }

    window.addEventListener('scroll', updateFab, { passive: true });
    updateFab();

    fab.addEventListener('click', function () {
      if (fab.classList.contains('up')) {
        /* ↑ back to top */
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        /* ↓ scroll to footer */
        var target = footer || document.body;
        if (lenis) lenis.scrollTo(target, { duration: 1.4, offset: -40 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

})();
