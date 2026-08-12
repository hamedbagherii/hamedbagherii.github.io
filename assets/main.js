
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const sections = $$('.content-section[id]');
  const navButtons = $$('.site-header nav button');
  const byLabel = new Map(sections.map(s => [s.id.toLowerCase(), s]));
  const siteHeader = $('.site-header');
  const primaryNav = $('#primary-navigation');
  const mobileNavToggle = $('.mobile-nav-toggle');


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

  function setMobileNavOpen(open, returnFocus = false) {
    if (!mobileNavToggle || !primaryNav) return;
    siteHeader?.classList.toggle('mobile-nav-open', open);
    mobileNavToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileNavToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (!open && returnFocus) mobileNavToggle.focus();
  }

  mobileNavToggle?.addEventListener('click', () => {
    setMobileNavOpen(mobileNavToggle.getAttribute('aria-expanded') !== 'true');
  });

  navButtons.forEach(btn => {
    const label = $('.nav-label', btn)?.textContent.trim().toLowerCase();
    const aliases = { highlights: 'awards' };
    const target = byLabel.get(aliases[label] || label);
    btn.addEventListener('click', () => {
      setMobileNavOpen(false);
      scrollToSection(target);
    });
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNavToggle?.getAttribute('aria-expanded') === 'true') {
      setMobileNavOpen(false, true);
    }
  });
  addEventListener('click', event => {
    if (mobileNavToggle?.getAttribute('aria-expanded') !== 'true' || siteHeader?.contains(event.target)) return;
    setMobileNavOpen(false);
  });
  matchMedia('(min-width: 1101px)').addEventListener('change', event => {
    if (event.matches) setMobileNavOpen(false);
  });

  // Compact section navigator. Press "/" anywhere outside a form field.
  const sectionNavigator = document.createElement('div');
  sectionNavigator.className = 'section-navigator';
  sectionNavigator.hidden = true;
  sectionNavigator.setAttribute('role', 'dialog');
  sectionNavigator.setAttribute('aria-modal', 'true');
  sectionNavigator.setAttribute('aria-labelledby', 'section-navigator-title');
  sectionNavigator.innerHTML = '<div class="section-navigator-panel"><header><span>QUICK NAVIGATION</span><kbd>/</kbd><button type="button" aria-label="Close section navigator">&times;</button></header><strong id="section-navigator-title">Jump to a section</strong><div class="section-navigator-list"></div><small>ARROW KEYS / TAB TO MOVE &middot; ENTER TO SELECT &middot; ESC TO CLOSE</small></div>';
  const navigatorList = $('.section-navigator-list', sectionNavigator);
  const navigatorClose = $('header button', sectionNavigator);
  let navigatorTrigger = null;
  sections.forEach((section, index) => {
    const button = document.createElement('button');
    const label = section.id === 'Awards' ? 'Highlights' : section.id;
    button.type = 'button';
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${label}</strong><i aria-hidden="true">&rarr;</i>`;
    button.addEventListener('click', () => {
      closeSectionNavigator();
      scrollToSection(section);
    });
    navigatorList.appendChild(button);
  });
  document.body.appendChild(sectionNavigator);

  const navigatorLaunch = document.createElement('button');
  navigatorLaunch.type = 'button';
  navigatorLaunch.className = 'section-navigator-launch';
  navigatorLaunch.setAttribute('aria-label', 'Open section navigator');
  navigatorLaunch.innerHTML = '<kbd>/</kbd><span>NAV</span>';
  document.body.appendChild(navigatorLaunch);

  function openSectionNavigator(trigger = document.activeElement) {
    navigatorTrigger = trigger;
    setMobileNavOpen(false);
    sectionNavigator.hidden = false;
    requestAnimationFrame(() => sectionNavigator.classList.add('open'));
    $('.section-navigator-list button', sectionNavigator)?.focus();
  }

  function closeSectionNavigator(returnFocus = false) {
    if (sectionNavigator.hidden) return;
    sectionNavigator.classList.remove('open');
    setTimeout(() => { sectionNavigator.hidden = true; }, 180);
    if (returnFocus && navigatorTrigger instanceof HTMLElement) navigatorTrigger.focus();
  }

  navigatorLaunch.addEventListener('click', () => openSectionNavigator(navigatorLaunch));
  navigatorClose.addEventListener('click', () => closeSectionNavigator(true));
  sectionNavigator.addEventListener('click', event => {
    if (event.target === sectionNavigator) closeSectionNavigator(true);
  });
  sectionNavigator.addEventListener('keydown', event => {
    const buttons = $$('.section-navigator-list button', sectionNavigator);
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); closeSectionNavigator(true); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault(); buttons[(Math.max(index, 0) + 1) % buttons.length]?.focus();
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault(); buttons[(Math.max(index, 0) - 1 + buttons.length) % buttons.length]?.focus();
    }
    if (event.key === 'Tab') {
      const focusable = [navigatorClose, ...buttons];
      const current = focusable.indexOf(document.activeElement);
      const next = event.shiftKey ? (current - 1 + focusable.length) % focusable.length : (current + 1) % focusable.length;
      event.preventDefault(); focusable[next].focus();
    }
  });
  addEventListener('keydown', event => {
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable);
    if (event.key === '/' && !typing && sectionNavigator.hidden) {
      event.preventDefault(); openSectionNavigator(target);
    }
  });
  $('.brand')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  $('footer button')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  $('.hero-actions .primary-btn')?.addEventListener('click', () => scrollToSection($('#Projects')));

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0;
    const bar = $('.scroll-progress');
    if (bar) bar.style.width = `${progress}%`;

    const marker = (siteHeader?.offsetHeight || 0) + Math.min(innerHeight * .35, 320);
    let active = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= marker) active = s;
    if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 4) active = sections.at(-1) || active;
    sections.forEach(s => $('.section-label', s)?.classList.toggle('is-active', s === active));
    navButtons.forEach(btn => {
      const label = $('.nav-label', btn)?.textContent.trim().toLowerCase();
      const normalized = label === 'highlights' ? 'awards' : label;
      const isActive = normalized === active?.id.toLowerCase();
      btn.classList.toggle('active', isActive);
      if (isActive) btn.setAttribute('aria-current', 'location');
      else btn.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', updateScrollState, {passive:true});
  addEventListener('resize', updateScrollState);
  updateScrollState();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); } });
  }, {threshold:.08, rootMargin:'0px 0px -8% 0px'});
  $$('[data-reveal]').forEach(el => revealObserver.observe(el));

  $$('.exo-gallery').forEach(gallery => {
    const stageImg = $('.exo-gallery-stage img', gallery);
    const stage = $('.exo-gallery-stage', gallery);
    const thumbs = $$('.exo-gallery-thumbs button', gallery);
    const prev = $('.exo-gallery-controls button:first-child', gallery);
    const next = $('.exo-gallery-controls button:last-child', gallery);
    const counter = $('.exo-gallery-controls span', gallery);
    const caption = $('.exo-gallery-caption', gallery);
    let index = Math.max(0, thumbs.findIndex(t => t.classList.contains('active')));
    function show(i, animate = true) {
      if (!thumbs.length || !stageImg) return;
      index = (i + thumbs.length) % thumbs.length;
      const thumb = thumbs[index], img = $('img', thumb);
      stageImg.src = img.src;
      stageImg.alt = thumb.dataset.imageAlt || thumb.dataset.captionDesc || thumb.dataset.captionTitle || thumb.getAttribute('aria-label')?.replace(/^Show\s+/i, '') || '';
      thumbs.forEach((t,n) => { t.classList.toggle('active', n===index); t.setAttribute('aria-selected', n===index ? 'true':'false'); });
      if (counter) counter.textContent = `${String(index+1).padStart(2,'0')} / ${String(thumbs.length).padStart(2,'0')}`;
      const bits = $('span', thumb)?.textContent.split('·').map(x=>x.trim()) || [];
      if (caption) {
        const label = thumb.dataset.captionLabel || bits[1];
        const title = thumb.dataset.captionTitle;
        const desc = thumb.dataset.captionDesc;
        if (label && $('em', caption)) $('em', caption).textContent = label;
        if (title && $('strong', caption)) $('strong', caption).textContent = title;
        if (desc && $('span', caption)) $('span', caption).textContent = desc;
      }
      if (animate && stage) {
        stage.classList.remove('media-switching');
        requestAnimationFrame(() => stage.classList.add('media-switching'));
        setTimeout(() => stage.classList.remove('media-switching'), 420);
      }
    }
    thumbs.forEach((t,i) => t.addEventListener('click', () => show(i)));
    prev?.addEventListener('click', e => {e.stopPropagation(); show(index-1)});
    next?.addEventListener('click', e => {e.stopPropagation(); show(index+1)});
    show(index, false);
  });

  $$('.exo-gallery-thumbs button img, .exo-video-selector img').forEach(img => {
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
  });

  const lb = document.createElement('div');
  lb.className = 'portfolio-lightbox';
  lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-labelledby','portfolio-lightbox-title');
  lb.innerHTML = '<button class="portfolio-lightbox-close" type="button" aria-label="Close expanded image">×</button><button class="portfolio-lightbox-nav portfolio-lightbox-prev" type="button" aria-label="Show previous image">←</button><figure><img alt=""><figcaption><span class="portfolio-lightbox-label"></span><strong id="portfolio-lightbox-title"></strong><small class="portfolio-lightbox-counter"></small></figcaption></figure><button class="portfolio-lightbox-nav portfolio-lightbox-next" type="button" aria-label="Show next image">→</button>';
  document.body.appendChild(lb);
  const lbImg = $('img', lb);
  const lbClose = $('.portfolio-lightbox-close', lb);
  const lbPrev = $('.portfolio-lightbox-prev', lb);
  const lbNext = $('.portfolio-lightbox-next', lb);
  const lbLabel = $('.portfolio-lightbox-label', lb);
  const lbTitle = $('#portfolio-lightbox-title', lb);
  const lbCounter = $('.portfolio-lightbox-counter', lb);
  let lbGallery = null;
  let lbIndex = 0;
  let lbTrigger = null;
  function renderLb(i) {
    const thumbs = lbGallery ? $$('.exo-gallery-thumbs button', lbGallery) : [];
    if (!thumbs.length) return;
    lbIndex = (i + thumbs.length) % thumbs.length;
    thumbs[lbIndex].click();
    const thumb = thumbs[lbIndex];
    const image = $('.exo-gallery-stage img', lbGallery);
    const caption = $('.exo-gallery-caption', lbGallery);
    const thumbText = $('span', thumb)?.textContent.trim().replace(/\s+/g, ' ') || '';
    const thumbLabel = thumb.dataset.captionLabel || thumbText.replace(/^\d+\s*(?:·\s*)?/, '');
    const thumbTitle = thumb.dataset.captionTitle || thumb.getAttribute('aria-label')?.replace(/^Show\s+/i, '');
    lbImg.src = image.src;
    lbImg.alt = image.alt;
    lbLabel.textContent = thumbLabel || $('em', caption)?.textContent.trim() || '';
    lbTitle.textContent = thumbTitle || $('strong', caption)?.textContent.trim() || image.alt;
    lbCounter.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(thumbs.length).padStart(2, '0')}`;
  }
  function closeLb() {
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    lbTrigger?.focus();
  }
  $$('.exo-gallery-open').forEach(btn => btn.addEventListener('click', () => {
    lbGallery = btn.closest('.exo-gallery');
    lbTrigger = btn;
    const thumbs = $$('.exo-gallery-thumbs button', lbGallery);
    const activeIndex = thumbs.findIndex(thumb => thumb.getAttribute('aria-selected') === 'true');
    lbPrev.hidden = thumbs.length < 2;
    lbNext.hidden = thumbs.length < 2;
    renderLb(Math.max(0, activeIndex));
    lb.classList.add('open');
    lb.classList.add('is-opening');
    setTimeout(() => lb.classList.remove('is-opening'), 360);
    document.body.classList.add('lightbox-open');
    lbClose.focus();
  }));
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => renderLb(lbIndex - 1));
  lbNext.addEventListener('click', () => renderLb(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') renderLb(lbIndex - 1);
    if (e.key === 'ArrowRight') renderLb(lbIndex + 1);
  });


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

// Privacy-enhanced project video selection.
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const videoDurations = {
    vOMn8qyuhpg:'1:53', 'ZlrcPtzQ-3M':'1:15', DYMDQ00YPnQ:'1:55', 'OOGeJYit_-U':'0:20', q3o65fjHgag:'0:37',
    i_7lMuh__iM:'4:36', D8wxss3ov4A:'1:13', '7emDLChfB94':'1:01', '2dDeK9wTgyU':'4:04', '12lt7iTwJ1E':'5:56', dWiBbqnNJ6I:'5:56'
  };

  $$('.exo-video-selector').forEach(selector => {
    const duration = videoDurations[selector.dataset.videoId];
    const thumb = $('.exo-video-selector-thumb', selector);
    if (!duration || !thumb) return;
    const badge = document.createElement('span');
    badge.className = 'exo-video-duration';
    badge.textContent = duration;
    badge.setAttribute('aria-label', `Duration ${duration}`);
    thumb.appendChild(badge);
  });

  function buildVideoUrl(videoId, shouldPlay) {
    const playerOrigin = /^https?:$/.test(location.protocol) ? location.origin : 'https://hamedbagheri.dev';
    const url = new URL(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`);
    url.searchParams.set('rel', '0');
    url.searchParams.set('playsinline', '1');
    url.searchParams.set('origin', playerOrigin);
    if (shouldPlay) url.searchParams.set('autoplay', '1');
    return url.toString();
  }

  $$('.exo-video-strip').forEach(videoStrip => {
    const player = $('.exo-video-feature iframe', videoStrip);
    const selectors = $$('.exo-video-selector', videoStrip);
    const feature = $('.exo-video-feature', videoStrip);
    const currentNumber = $('.exo-video-current', videoStrip);
    if (!player || !selectors.length) return;

    function selectVideo(selector, shouldPlay = true) {
      const videoId = selector.dataset.videoId;
      if (!videoId) return;
      selectors.forEach(button => {
        const selected = button === selector;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      if (currentNumber) currentNumber.textContent = String(selectors.indexOf(selector) + 1).padStart(2, '0');
      player.title = selector.dataset.videoTitle || 'Robotic exoskeleton project video';
      const title = $('.exo-video-selector-copy strong', selector);
      const description = $('.exo-video-selector-copy span', selector);
      const currentTitle = $('.exo-video-now strong', videoStrip);
      const currentDescription = $('.exo-video-now small', videoStrip);
      if (currentTitle && title) currentTitle.textContent = title.textContent;
      if (currentDescription && description) currentDescription.textContent = description.textContent;
      player.src = buildVideoUrl(videoId, shouldPlay);
      if (shouldPlay && feature) {
        feature.classList.remove('media-switching');
        requestAnimationFrame(() => feature.classList.add('media-switching'));
        setTimeout(() => feature.classList.remove('media-switching'), 420);
      }
    }

    selectors.forEach((selector, index) => {
      selector.addEventListener('click', () => selectVideo(selector));
      selector.addEventListener('keydown', event => {
        const steps = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1};
        let next;
        if (event.key in steps) next = (index + steps[event.key] + selectors.length) % selectors.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = selectors.length - 1;
        else return;
        event.preventDefault();
        selectors[next].focus();
        selectVideo(selectors[next]);
      });
    });

    const initial = selectors.find(selector => selector.getAttribute('aria-selected') === 'true') || selectors[0];
    selectVideo(initial, false);
  });
})();
