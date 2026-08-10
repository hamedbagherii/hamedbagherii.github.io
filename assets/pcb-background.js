(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.pcb-architecture-bg')) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('pcb-architecture-bg');
  svg.setAttribute('viewBox', '0 0 1600 900');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  svg.innerHTML = `
    <defs>
      <filter id="pcb-led-glow" x="-400%" y="-400%" width="800%" height="800%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="pcb-signal-glow" x="-400%" y="-400%" width="800%" height="800%">
        <feGaussianBlur stdDeviation="2.4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g class="pcb-network"></g>
    <g class="pcb-labels"></g>
    <g class="pcb-signals"></g>
  `;

  const network = svg.querySelector('.pcb-network');
  const labels = svg.querySelector('.pcb-labels');
  const signals = svg.querySelector('.pcb-signals');

  const traces = [
    { d:'M 0 132 H 110 V 178 H 244 V 214 H 354', label:'CTRL_BUS', lx:116, ly:166, secondary:false },
    { d:'M 0 668 H 98 V 608 H 224 V 574 H 370', label:'48V_BUS', lx:108, ly:598, secondary:true },
    { d:'M 124 0 V 82 H 212 V 126 H 302', label:'CAN_FD', lx:218, ly:114, secondary:true },
    { d:'M 492 0 V 78 H 560 V 154 H 658 V 212', label:'SENSOR_LINK', lx:568, ly:143, secondary:false },
    { d:'M 410 900 V 810 H 510 V 742 H 626 V 684', label:'ETHERCAT', lx:520, ly:732, secondary:false },
    { d:'M 930 0 V 110 H 1016 V 172 H 1128', label:'POWER_STAGE', lx:1024, ly:160, secondary:true },
    { d:'M 1600 104 H 1492 V 164 H 1378 V 230 H 1262', label:'BMS', lx:1390, ly:218, secondary:false },
    { d:'M 1600 730 H 1510 V 668 H 1398 V 610 H 1270', label:'IMU', lx:1410, ly:598, secondary:true },
    { d:'M 830 900 V 814 H 930 V 756 H 1068 V 700 H 1210', label:'SAFETY_IO', lx:944, ly:744, secondary:false },
    { d:'M 740 454 H 848 V 388 H 968 V 318 H 1102', label:'REALTIME', lx:856, ly:376, secondary:false },
    { d:'M 688 526 H 790 V 582 H 906 V 636 H 1026', label:'ENCODER', lx:800, ly:571, secondary:true },
    { d:'M 1188 430 H 1290 V 374 H 1414 V 318 H 1600', label:'MOTOR_IO', lx:1300, ly:362, secondary:false },
  ];

  function add(tag, attrs, parent = network) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  }

  const paths = [];
  traces.forEach((t, i) => {
    const p = add('path', { d:t.d, class:`pcb-trace${t.secondary ? ' pcb-trace-secondary' : ''}` });
    p.dataset.traceIndex = String(i);
    paths.push(p);

    const start = p.getPointAtLength(0);
    const end = p.getPointAtLength(p.getTotalLength());
    add('circle', { cx:start.x, cy:start.y, r:3.2, class:'pcb-via' });
    add('circle', { cx:end.x, cy:end.y, r:4.2, class:'pcb-pad' });

    const led = add('circle', { cx:end.x, cy:end.y, r:2.6, class:'pcb-led is-active' });
    led.style.animationDelay = `${(i * .47) % 2.8}s`;

    const tx = add('text', { x:t.lx, y:t.ly, class:'pcb-label' }, labels);
    tx.textContent = t.label;
  });

  // Central system nodes
  const nodes = [
    [354,214,'MCU'], [658,212,'SENSORS'], [626,684,'ETH'], [1128,172,'PWR'],
    [1262,230,'BMS'], [1270,610,'IMU'], [1210,700,'SAFE'], [1102,318,'RT'],
    [1026,636,'ENC'], [1188,430,'DRV']
  ];
  nodes.forEach(([x,y,n]) => {
    add('rect', { x:x-7, y:y-7, width:14, height:14, rx:1.5, class:'pcb-pad' });
    const tx = add('text', { x:x+12, y:y+3, class:'pcb-node-label' }, labels);
    tx.textContent = n;
  });

  add('path', { d:'M 24 790 H 298 V 748 H 540 V 708 H 760', class:'pcb-scan' });
  add('path', { d:'M 1000 92 H 1230 V 126 H 1466', class:'pcb-scan' });

  hero.prepend(svg);

  if (reduced) return;

  const activePaths = paths.filter((_, i) => !traces[i].secondary);
  const pulseCount = 7;
  const pulses = Array.from({length:pulseCount}, (_, i) => {
    const c = add('circle', { r:i % 3 === 0 ? 2.8 : 2.1, class:'pcb-signal' }, signals);
    return {
      el:c,
      path:activePaths[i % activePaths.length],
      progress:(i / pulseCount),
      speed:0.000035 + (i % 4) * 0.000006,
      delay:i * 700
    };
  });

  let last = performance.now();
  function animate(now) {
    const dt = Math.min(now - last, 40);
    last = now;
    pulses.forEach((pulse) => {
      if (now < pulse.delay) return;
      pulse.progress = (pulse.progress + dt * pulse.speed) % 1;
      const len = pulse.path.getTotalLength();
      const pt = pulse.path.getPointAtLength(len * pulse.progress);
      pulse.el.setAttribute('cx', pt.x.toFixed(2));
      pulse.el.setAttribute('cy', pt.y.toFixed(2));
      pulse.el.style.opacity = String(.45 + Math.sin(pulse.progress * Math.PI) * .55);
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
