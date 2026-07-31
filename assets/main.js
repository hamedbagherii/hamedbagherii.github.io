
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const sections = $$('.content-section[id]');
  const navButtons = $$('.site-header nav button');
  const byLabel = new Map(sections.map(s => [s.id.toLowerCase(), s]));

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
    let active = sections[0];
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

  updateScrollState();
})();
