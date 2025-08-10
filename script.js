// NeuroTouch Pro — Demo functions
document.addEventListener('DOMContentLoaded', () => {
  const botones = document.querySelectorAll('.touch-btn');
  const countEl = document.getElementById('count');
  const exportBtn = document.getElementById('exportCsv');
  const resetBtn = document.getElementById('resetLog');
  const fsBtn = document.getElementById('fullscreen');
  const flashLayer = document.getElementById('flash');
  const bpmInput = document.getElementById('bpm');
  const startMetronomeBtn = document.getElementById('startMetronome');
  const stopMetronomeBtn = document.getElementById('stopMetronome');

  let audioCtx = null;
  let count = 0;
  let log = []; // {timeISO, elapsedMs, source}
  let startTime = performance.now();
  let metroTimer = null;

  const supportsPointer = window.PointerEvent !== undefined;

  // Unified pointer/touch handling
  botones.forEach((btn) => {
    const handler = () => ejecutarAccion(btn.dataset.action, 'user');
    if (supportsPointer) {
      btn.addEventListener('pointerdown', handler, { passive: true });
    } else {
      let touched = false;
      btn.addEventListener('touchstart', (e) => { touched = true; handler(); }, { passive: true });
      btn.addEventListener('click', (e) => { if (touched) { touched = false; return; } handler(); });
    }
  });

  function initAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext no disponible', e);
      }
    }
  }

  function beep(freq = 880, durationMs = 120, type = 'sine', gain = 0.05) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(audioCtx.destination);
    osc.start();

    // Simple envelope
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    osc.stop(now + durationMs / 1000 + 0.02);
  }

  function flash(ms = 90) {
    flashLayer.style.transition = 'none';
    flashLayer.style.opacity = '0.9';
    requestAnimationFrame(() => {
      flashLayer.style.transition = 'opacity 140ms ease-out';
      flashLayer.style.opacity = '0';
    });
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  function registrar(source) {
    count += 1;
    countEl.textContent = String(count);
    const now = performance.now();
    log.push({
      timeISO: new Date().toISOString(),
      elapsedMs: Math.round(now - startTime),
      source
    });
  }

  function exportCSV() {
    if (!log.length) { alert('No hay datos para exportar.'); return; }
    const header = 'index,timeISO,elapsedMs,source\n';
    const rows = log.map((row, i) => [i+1, row.timeISO, row.elapsedMs, row.source].join(','));
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neurotouch_log.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        fsBtn.textContent = 'Salir de pantalla completa';
      } else {
        await document.exitFullscreen();
        fsBtn.textContent = 'Pantalla completa';
      }
    } catch (e) {
      alert('Pantalla completa no disponible: ' + e.message);
    }
  }

  function startMetronome() {
    let bpm = parseInt(bpmInput.value, 10);
    if (!bpm || bpm < 20) bpm = 20;
    if (bpm > 300) bpm = 300;
    stopMetronome(); // clear if already running
    const intervalMs = 60000 / bpm;

    metroTimer = setInterval(() => {
      beep(1000, 60, 'square', 0.06);
      flash(60);
    }, intervalMs);
  }

  function stopMetronome() {
    if (metroTimer) {
      clearInterval(metroTimer);
      metroTimer = null;
    }
  }

  function ejecutarAccion(accion, source) {
    switch (accion) {
      case 'beep':
        beep(880, 90, 'sine', 0.06);
        flash(90);
        registrar(source);
        break;
      case 'vibrate':
        vibrate([30, 50, 30]); // Android soportado; iOS puede ignorar
        beep(220, 120, 'sine', 0.06);
        flash(60);
        registrar(source);
        break;
      case 'contar':
        beep(660, 70, 'sine', 0.05);
        registrar(source);
        break;
      default:
        console.log('Acción no definida:', accion);
    }
  }

  // Buttons
  exportBtn.addEventListener('click', exportCSV);
  resetBtn.addEventListener('click', () => {
    count = 0; countEl.textContent = '0'; log = []; startTime = performance.now();
  });
  fsBtn.addEventListener('click', toggleFullscreen);
  startMetronomeBtn.addEventListener('click', startMetronome);
  stopMetronomeBtn.addEventListener('click', stopMetronome);

  // Resume audio on first user gesture (iOS)
  window.addEventListener('pointerdown', initAudio, { once: true });
});
