
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const sections = $$('.content-section[id]');
  const navButtons = $$('.site-header nav button');
  const byLabel = new Map(sections.map(s => [s.id.toLowerCase(), s]));


  // Full-screen system preloader. It reaches 100% only after the page is ready.
  const systemLoader = $('#system-loader');
  const systemLoaderBar = $('#system-loader-bar');
  const systemLoaderText = $('#system-loader-text');
  const systemLoaderPercent = $('#system-loader-percent');

  if (systemLoader && systemLoaderBar && systemLoaderPercent) {
    const startedAt = performance.now();
    const minimumDuration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 350 : 1500;
    let pageReady = document.readyState === 'complete';
    let displayedProgress = 0;
    let loaderFrame = 0;

    addEventListener('load', () => { pageReady = true; }, { once: true });

    function updateLoader(now) {
      const elapsed = now - startedAt;
      const timeProgress = Math.min(90, (elapsed / minimumDuration) * 90);
      const target = pageReady && elapsed >= minimumDuration ? 100 : timeProgress;
      displayedProgress += (target - displayedProgress) * (target === 100 ? 0.22 : 0.12);

      if (target === 100 && displayedProgress > 99.2) displayedProgress = 100;
      const rounded = Math.max(0, Math.min(100, Math.round(displayedProgress)));
      systemLoaderBar.style.width = `${rounded}%`;
      systemLoaderPercent.textContent = `${rounded}%`;

      if (systemLoaderText) {
        systemLoaderText.textContent = rounded < 35 ? 'LOADING ASSETS' : rounded < 72 ? 'INITIALIZING SYSTEMS' : rounded < 100 ? 'FINALIZING INTERFACE' : 'SYSTEM ONLINE';
      }

      if (rounded >= 100) {
        setTimeout(() => {
          systemLoader.classList.add('is-complete');
          document.body.classList.remove('is-loading');
          setTimeout(() => systemLoader.remove(), 800);
        }, 220);
        return;
      }
      loaderFrame = requestAnimationFrame(updateLoader);
    }

    loaderFrame = requestAnimationFrame(updateLoader);
  } else {
    document.body.classList.remove('is-loading');
  }

  function scrollToSection(section) {
    if (!section) return;
    const header = $('.site-header');
    const y = section.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0) - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  navButtons.forEach(btn => {
    const label = $('.nav-label', btn)?.textContent.trim().toLowerCase();
    const aliases = { highlights: 'awards' };
    const target = byLabel.get(aliases[label] || label);
    btn.addEventListener('click', () => scrollToSection(target));
  });
  $('.brand')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  $('footer button')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  $('.hero-actions .primary-btn')?.addEventListener('click', () => scrollToSection($('#Projects')));

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0;
    const bar = $('.scroll-progress');
    if (bar) bar.style.width = `${progress}%`;

    const marker = (document.querySelector('.site-header')?.offsetHeight || 0) + innerHeight * .7;
    let active = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= marker) active = s;
    sections.forEach(s => $('.section-label', s)?.classList.toggle('is-active', s === active));
    navButtons.forEach(btn => {
      const label = $('.nav-label', btn)?.textContent.trim().toLowerCase();
      const normalized = label === 'highlights' ? 'awards' : label;
      btn.classList.toggle('active', normalized === active?.id.toLowerCase());
    });
  }
  addEventListener('scroll', updateScrollState, {passive:true});
  addEventListener('resize', updateScrollState);

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); } });
  }, {threshold:.08, rootMargin:'0px 0px -8% 0px'});
  $$('[data-reveal]').forEach(el => revealObserver.observe(el));

  $$('.exo-gallery').forEach(gallery => {
    const stageImg = $('.exo-gallery-stage img', gallery);
    const thumbs = $$('.exo-gallery-thumbs button', gallery);
    const prev = $('.exo-gallery-controls button:first-child', gallery);
    const next = $('.exo-gallery-controls button:last-child', gallery);
    const counter = $('.exo-gallery-controls span', gallery);
    const caption = $('.exo-gallery-caption', gallery);
    let index = Math.max(0, thumbs.findIndex(t => t.classList.contains('active')));
    function show(i) {
      if (!thumbs.length || !stageImg) return;
      index = (i + thumbs.length) % thumbs.length;
      const thumb = thumbs[index], img = $('img', thumb);
      stageImg.src = img.src;
      stageImg.alt = thumb.getAttribute('aria-label') || '';
      thumbs.forEach((t,n) => { t.classList.toggle('active', n===index); t.setAttribute('aria-selected', n===index ? 'true':'false'); });
      if (counter) counter.textContent = `${String(index+1).padStart(2,'0')} / ${String(thumbs.length).padStart(2,'0')}`;
      const bits = $('span', thumb)?.textContent.split('·').map(x=>x.trim()) || [];
      if (caption && bits[1]) $('em', caption).textContent = bits[1];
    }
    thumbs.forEach((t,i) => t.addEventListener('click', () => show(i)));
    prev?.addEventListener('click', e => {e.stopPropagation(); show(index-1)});
    next?.addEventListener('click', e => {e.stopPropagation(); show(index+1)});
    show(index);
  });

  const lb = document.createElement('div');
  lb.className = 'portfolio-lightbox';
  lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-label','Expanded project image');
  lb.innerHTML = '<button type="button" aria-label="Close image">×</button><img alt="">';
  document.body.appendChild(lb);
  const lbImg = $('img', lb);
  function closeLb(){ lb.classList.remove('open'); document.body.classList.remove('lightbox-open'); }
  $$('.exo-gallery-open').forEach(btn => btn.addEventListener('click', () => { const img=$('img',btn); lbImg.src=img.src; lbImg.alt=img.alt; lb.classList.add('open'); document.body.classList.add('lightbox-open'); }));
  $('button',lb).addEventListener('click',closeLb); lb.addEventListener('click',e=>{if(e.target===lb)closeLb()}); addEventListener('keydown',e=>{if(e.key==='Escape')closeLb()});


  // Subtle animated network in the hero background.
  const particleCanvas = $('.hero-particles');
  const hero = $('.hero');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (particleCanvas && hero && !reduceMotion) {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    let width = 0, height = 0, dpr = 1, frameId = 0;

    function particleCount() {
      const area = width * height;
      const base = innerWidth < 780 ? 20 : 42;
      return Math.max(16, Math.min(58, Math.round(base * area / 1300000)));
    }

    function makeParticle() {
      const speed = innerWidth < 780 ? 0.055 : 0.075;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed * (0.45 + Math.random()),
        vy: Math.sin(angle) * speed * (0.45 + Math.random()),
        r: 1.0 + Math.random() * 1.65,
        pulse: Math.random() * Math.PI * 2
      };
    }

    function resizeParticles() {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(devicePixelRatio || 1, 2);
      particleCanvas.width = Math.round(width * dpr);
      particleCanvas.height = Math.round(height * dpr);
      particleCanvas.style.width = `${width}px`;
      particleCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = particleCount();
      particles = Array.from({ length: count }, (_, i) => particles[i] || makeParticle());
    }

    function drawParticles(time) {
      ctx.clearRect(0, 0, width, height);
      const maxLink = innerWidth < 780 ? 130 : 190;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;

        for (let k = i + 1; k < particles.length; k++) {
          const q = particles[k];
          const dx = p.x - q.x, dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);
          if (distance < maxLink) {
            const alpha = (1 - distance / maxLink) * 0.28;
            ctx.strokeStyle = `rgba(255, 157, 58, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        const pulse = 0.72 + Math.sin(time * 0.0007 + p.pulse) * 0.20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 157, 58, ${0.62 * pulse})`;
        ctx.shadowColor = 'rgba(255, 157, 58, 0.58)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      frameId = requestAnimationFrame(drawParticles);
    }

    resizeParticles();
    addEventListener('resize', resizeParticles, { passive: true });
    frameId = requestAnimationFrame(drawParticles);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frameId);
      else frameId = requestAnimationFrame(drawParticles);
    });
  }

  updateScrollState();
})();
