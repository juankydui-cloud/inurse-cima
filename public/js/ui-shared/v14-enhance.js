
/* ================================================================
   CAPA INTERACTIVA v14 — menú desplegable, tilt 3D, reveal, scroll
   Delegación total sobre los chips originales: cero cambios de lógica.
   ================================================================ */
(function(){
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isNight = () => document.documentElement.getAttribute('data-theme') === 'night';

  /* ---- 1. Fondo aurora + barra de scroll ---- */
  const fx = document.createElement('div');
  fx.id = 'auroraFx';
  fx.innerHTML = '<span class="a1"></span><span class="a2"></span><span class="a3"></span>';
  document.body.prepend(fx);

  const bar = document.createElement('div');
  bar.id = 'scrollBar';
  document.body.appendChild(bar);
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      ticking = false;
    });
  }, { passive: true });

  /* ---- 2. Tilt 3D sutil en las tarjetas de grupo (solo con ratón) ---- */
  const content = document.getElementById('content');
  if (content && matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    content.addEventListener('pointermove', e => {
      if (isNight()) return;
      const card = e.target.closest('.group-card');
      if (!card || card.classList.contains('open')) return;
      const r = card.getBoundingClientRect();
      const ry = ((e.clientX - r.left) / r.width - .5) * 5;   /* máx ±2.5° */
      const rx = ((e.clientY - r.top) / r.height - .5) * -4;
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    }, { passive: true });
    content.addEventListener('pointerout', e => {
      const card = e.target.closest('.group-card');
      if (card) { card.style.setProperty('--rx','0deg'); card.style.setProperty('--ry','0deg'); }
    }, { passive: true });
  }

  /* ---- 4. Aparición escalonada de tarjetas al renderizar/scroll ---- */
  if (content && !reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('v14-in'), Math.min(i * 60, 300));
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    const watch = () => {
      if (isNight()) return;
      content.querySelectorAll('.group-card:not(.v14-reveal), .grid.flat > .card:not(.v14-reveal)')
        .forEach(el => { el.classList.add('v14-reveal'); io.observe(el); });
    };
    new MutationObserver(watch).observe(content, { childList: true });
    watch();
  }
})();
