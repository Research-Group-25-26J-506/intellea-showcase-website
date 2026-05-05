// INTELLEA — shared subpage interactions
(function () {
  'use strict';

  // ---------- Navbar (always solid on subpages) ----------
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.add('scrolled');

  // ---------- Mobile menu ----------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => io.observe(el));

  // ---------- Hero canvas (lightweight neural lattice) ----------
  const heroCanvas = document.querySelector('.page-hero canvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let W = 0, H = 0, dpr = window.devicePixelRatio || 1;
    let nodes = [];
    const NODE_COUNT = 38;

    function resize() {
      const r = heroCanvas.getBoundingClientRect();
      W = r.width; H = r.height;
      heroCanvas.width = W * dpr;
      heroCanvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      resize();
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.7
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 18000) {
            const op = (1 - d2 / 18000) * 0.18;
            ctx.strokeStyle = `rgba(96,165,250,${op})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        ctx.fillStyle = 'rgba(147,197,253,0.7)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', () => { resize(); });
    init(); tick();
  }

  // ---------- Domain TOC active highlight ----------
  const tocLinks = document.querySelectorAll('.domain-toc-link');
  if (tocLinks.length) {
    const sections = Array.from(tocLinks).map(l => document.querySelector(l.getAttribute('href')));
    const tocIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const link = document.querySelector('.domain-toc-link[href="#' + e.target.id + '"]');
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(s => s && tocIo.observe(s));
  }

  // ---------- Progress bars (milestones) ----------
  const progressBars = document.querySelectorAll('.progress-bar-fill');
  if (progressBars.length) {
    const pIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const pct = e.target.getAttribute('data-pct') || '0';
          e.target.style.width = pct + '%';
          pIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    progressBars.forEach(b => pIo.observe(b));
  }

  // ---------- Documents filter ----------
  const docFilters = document.querySelectorAll('.docs-filter-btn');
  const docCards = document.querySelectorAll('.doc-card');
  if (docFilters.length) {
    docFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        docFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-cat');
        docCards.forEach(c => {
          const cardCat = c.getAttribute('data-cat');
          c.style.display = (cat === 'all' || cardCat === cat) ? '' : 'none';
        });
      });
    });
  }

  // ---------- Presentation modal ----------
  const presCards = document.querySelectorAll('.pres-card');
  const presModal = document.getElementById('presModal');
  if (presCards.length && presModal) {
    const titleEl = presModal.querySelector('[data-modal-title]');
    const descEl = presModal.querySelector('[data-modal-desc]');
    const linkEl = presModal.querySelector('[data-modal-link]');
    presCards.forEach(card => {
      card.addEventListener('click', () => {
        if (titleEl) titleEl.textContent = card.getAttribute('data-title') || 'Presentation';
        if (descEl) descEl.textContent = card.getAttribute('data-desc') || '';
        if (linkEl) linkEl.href = card.getAttribute('data-link') || '#';
        presModal.classList.add('open');
      });
    });
    presModal.addEventListener('click', (e) => {
      if (e.target === presModal || e.target.closest('.pres-modal-close')) {
        presModal.classList.remove('open');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') presModal.classList.remove('open');
    });
  }

  // ---------- Team flip cards (touch) ----------
  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
      if (window.matchMedia('(hover: none)').matches) {
        card.classList.toggle('flipped');
      }
    });
  });

  // ---------- Contact form ----------
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit');
      const success   = document.getElementById('formSuccess');

      // Gather field values
      const firstName    = document.getElementById('firstName').value.trim();
      const lastName     = document.getElementById('lastName').value.trim();
      const email        = document.getElementById('email').value.trim();
      const organization = document.getElementById('organization').value.trim() || '—';
      const topic        = document.getElementById('topic').value;
      const message      = document.getElementById('message').value.trim();

      // Disable button while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      // Replace 'YOUR_SERVICE_ID' with your EmailJS Service ID
      emailjs.send('service_qpauc2m', 'oQpn4TvSLcbCOQ5T6', {
        from_name:    firstName + ' ' + lastName,
        from_email:   email,
        organization: organization,
        topic:        topic,
        message:      message,
        reply_to:     email,
      }).then(() => {
        if (success) {
          success.textContent = '✓ Thank you! Your message has been sent. We\'ll reply within two working days.';
          success.classList.add('show');
        }
        form.reset();
        setTimeout(() => success && success.classList.remove('show'), 6000);
      }).catch((err) => {
        console.error('EmailJS error:', err);
        if (success) {
          success.textContent = '✗ Something went wrong. Please email us directly at intellea.research@my.sliit.lk';
          success.style.color = '#f87171';
          success.classList.add('show');
          setTimeout(() => {
            success.classList.remove('show');
            success.style.color = '';
          }, 7000);
        }
      }).finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
        }
      });
    });
  }
})();
