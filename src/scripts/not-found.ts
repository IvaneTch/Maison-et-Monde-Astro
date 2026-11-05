// Deux plans indépendants inspirés des exemples fournis : mots au fond, réseau devant.
// Dessin local en Canvas, sans script tiers ni écoute globale du clavier.
const stage = document.querySelector<HTMLElement>('.mm-not-found');
if (stage) {
  const wordsCanvas = stage.querySelector<HTMLCanvasElement>('.mm-error-words')!;
  const particlesCanvas = stage.querySelector<HTMLCanvasElement>('.particles-js-canvas-el')!;
  const wordsCtx = wordsCanvas.getContext('2d');
  const particlesCtx = particlesCanvas.getContext('2d');
  const control = stage.querySelector<HTMLButtonElement>('.mm-error-motion')!;
  if (wordsCtx && particlesCtx) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reduced.matches;
    let frame = 0;
    let previous = 0;
    let width = 1,
      height = 1;
    let pointer: { x: number; y: number } | null = null;
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    type Word = { x: number; y: number; size: number; text: string };
    type Dot = { x: number; y: number; vx: number; vy: number; size: number };
    let words: Word[] = [],
      dots: Dot[] = [];
    const updateControl = () => {
      control.hidden = false;
      control.setAttribute('aria-pressed', String(paused));
      control.textContent = paused ? 'Activer l’animation' : 'Mettre l’animation en pause';
    };
    function resize() {
      const rect = stage!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      for (const canvas of [wordsCanvas, particlesCanvas]) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.getContext('2d')!.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      words = Array.from({ length: width < 600 ? 28 : 60 }, (_, i) => ({
        x: random(0, width),
        y: random(0, height),
        size: random(9, 23),
        text: ['404', 'page', 'introuvable', '404'][i % 4],
      }));
      dots = Array.from({ length: width < 600 ? 30 : 65 }, () => ({
        x: random(0, width),
        y: random(0, height),
        vx: random(-14, 14),
        vy: random(-14, 14),
        size: random(1, 2.4),
      }));
      draw(0);
    }
    function draw(dt: number) {
      wordsCtx!.clearRect(0, 0, width, height);
      for (const w of words) {
        w.x += dt * (10 + w.size);
        if (w.x > width + 20) {
          w.x = -160;
          w.y = random(12, height);
        }
        wordsCtx!.font = `${w.size}px Arial, sans-serif`;
        wordsCtx!.fillStyle = 'rgba(210,227,239,.24)';
        wordsCtx!.fillText(w.text, w.x, w.y);
      }
      particlesCtx!.clearRect(0, 0, width, height);
      for (const d of dots) {
        d.x = (d.x + d.vx * dt + width) % width;
        d.y = (d.y + d.vy * dt + height) % height;
        particlesCtx!.beginPath();
        particlesCtx!.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        particlesCtx!.fillStyle = 'rgba(255,212,136,.72)';
        particlesCtx!.fill();
      }
      const line = (x: number, y: number, xx: number, yy: number, alpha: number) => {
        particlesCtx!.beginPath();
        particlesCtx!.moveTo(x, y);
        particlesCtx!.lineTo(xx, yy);
        particlesCtx!.strokeStyle = `rgba(233,183,101,${alpha})`;
        particlesCtx!.lineWidth = 0.7;
        particlesCtx!.stroke();
      };
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 135) line(a.x, a.y, b.x, b.y, (1 - distance / 135) * 0.35);
        }
        if (pointer) {
          const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (distance < 145) line(a.x, a.y, pointer.x, pointer.y, (1 - distance / 145) * 0.65);
        }
      }
    }
    function tick(now: number) {
      frame = 0;
      if (paused || document.hidden) return;
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      draw(dt);
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      updateControl();
      if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
    }
    control.addEventListener('click', () => {
      paused = !paused;
      sync();
    });
    reduced.addEventListener('change', () => {
      paused = reduced.matches;
      sync();
    });
    document.addEventListener('visibilitychange', sync);
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    stage.addEventListener('pointerleave', () => {
      pointer = null;
    });
    stage.addEventListener('click', (event) => {
      if (paused || (event.target as Element).closest('a,button')) return;
      const rect = stage.getBoundingClientRect();
      // Quantité plafonnée même après de nombreux clics.
      for (let i = 0; i < 4; i++)
        dots.push({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          vx: random(-16, 16),
          vy: random(-16, 16),
          size: random(1, 2.4),
        });
      dots = dots.slice(-90);
    });
    new ResizeObserver(resize).observe(stage);
    resize();
    sync();
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
  }
}
