document.querySelectorAll('.door').forEach(door => {
  const panel = door.querySelector('.panel');
  door.addEventListener('click', () => {
    const open = door.classList.toggle('open');
    panel.setAttribute('aria-expanded', open);
    panel.setAttribute('aria-label', (open ? 'Close ' : 'Open ') + door.dataset.title);
  });
});

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });

(function () {
  const wrap = document.getElementById('tl');
  if (!wrap) return;
  const draws = [...wrap.querySelectorAll('.tl-draw')];
  const stops = [...wrap.querySelectorAll('.stop')];
  const ref   = wrap.querySelector('.tl-path');
  const VB_H  = 4500;
  const L     = ref.getTotalLength();
  draws.forEach(p => p.style.strokeDasharray = L);

  const N = 900, ys = [];
  for (let i = 0; i <= N; i++) ys.push(ref.getPointAtLength(L * i / N).y);
  const lengthAtY = y => { let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; ys[m] < y ? lo = m + 1 : hi = m; } return L * lo / N; };

  const clamp  = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  const targetNow = () => innerHeight / 2 - wrap.getBoundingClientRect().top;

  let target = targetNow(), cur = target, running = false;

  function render(centre) {
    const h  = wrap.offsetHeight, vh = innerHeight;
    const yVB = centre / h * VB_H;
    const off = L - clamp(lengthAtY(yVB + 30), 0, L);
    draws.forEach(p => p.style.strokeDashoffset = off);
    stops.forEach(el => {
      const sy = parseFloat(el.dataset.y) / VB_H * h;
      const d  = Math.abs(sy - centre) / vh;
      const k  = smooth(clamp(d / 0.42, 0, 1));
      el.style.setProperty('--s',  1 + 1.1 * smooth(clamp(d / 0.6, 0, 1)));
      el.style.setProperty('--o',  1 - k);
      el.style.setProperty('--dx', 70 * k + 'px');
    });
  }
  function tick() {
    cur += (target - cur) * 0.085;                 // easing: closer = slower, so it settles softly
    render(cur);
    if (Math.abs(target - cur) > 0.2) requestAnimationFrame(tick); else running = false;
  }
  function kick() { target = targetNow(); if (!running) { running = true; requestAnimationFrame(tick); } }
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { cur = target = targetNow(); render(cur); });
  render(cur);
})();