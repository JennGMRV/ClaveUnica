import { state }           from '../core/state.js';
import { showNotification } from '../utils/notifications.js';

// --- Tamaño de fuente ---

let currentFontSize = parseInt(localStorage.getItem('fontSize') || '20', 10);

export function applyFontSize(size) {
    currentFontSize = size;
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
    localStorage.setItem('fontSize', size);
}

export function initFontControls() {
    applyFontSize(currentFontSize);

    document.getElementById('btn-font-plus')?.addEventListener('click', () => {
        if (currentFontSize < 32) applyFontSize(currentFontSize + 2);
    });
    document.getElementById('btn-font-minus')?.addEventListener('click', () => {
        if (currentFontSize > 16) applyFontSize(currentFontSize - 2);
    });

    // Ciclo de tamaño (botón opcional)
    const fontSizes = [20, 26, 32];
    let fontSizeIndex = 0;
    document.getElementById('btn-font-size-cycle')?.addEventListener('click', () => {
        fontSizeIndex = (fontSizeIndex + 1) % fontSizes.length;
        applyFontSize(fontSizes[fontSizeIndex]);
    });
}

// --- Modo oscuro ---

export function initDarkMode() {
    const btn = document.getElementById('btn-dark-mode');
    if (!btn) return;
    const saved = localStorage.getItem('darkMode') === 'true';
    if (saved) document.body.classList.add('dark-mode');
    btn.classList.toggle('active', saved);

    btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        btn.classList.toggle('active', isDark);
    });
}

// --- Alto contraste ---

export function initContrastToggle() {
    const btn = document.getElementById('btn-toggle-contrast');
    if (!btn) return;
    btn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        btn.classList.toggle('active', document.body.classList.contains('high-contrast'));
    });
}

// --- Modo daltonismo (ciclo) ---

const cbCycle = [
    { cls: null,               label: 'Normal'    },
    { cls: 'cb-protanopia',    label: 'Opción 1'  },
    { cls: 'cb-deuteranopia',  label: 'Opción 2'  },
    { cls: 'cb-tritanopia',    label: 'Opción 3'  },
];
const cbModes = cbCycle.slice(1).map(m => m.cls);

export function initColorblindMode() {
    const btn    = document.getElementById('btn-colorblind');
    const badge  = document.getElementById('cb-current-badge');
    const panel  = document.getElementById('colorblind-panel');
    if (panel) panel.style.display = 'none';
    if (!btn) return;

    let cbIndex = 0;
    let cbFlashTimer = null;

    const savedCb = localStorage.getItem('colorblindMode');
    if (savedCb) {
        const found = cbCycle.findIndex(m => m.cls === savedCb);
        if (found >= 0) {
            cbIndex = found;
            document.body.classList.add(savedCb);
            btn.classList.add('active');
        }
    }
    if (badge) badge.textContent = cbCycle[cbIndex].label;

    function applyCbMode(index) {
        cbModes.forEach(m => document.body.classList.remove(m));
        const mode = cbCycle[index];
        if (mode.cls) {
            document.body.classList.add(mode.cls);
            localStorage.setItem('colorblindMode', mode.cls);
            btn.classList.add('active');
        } else {
            localStorage.removeItem('colorblindMode');
            btn.classList.remove('active');
        }
        if (badge) {
            badge.textContent = mode.label;
            badge.classList.add('flash');
            clearTimeout(cbFlashTimer);
            cbFlashTimer = setTimeout(() => badge.classList.remove('flash'), 2200);
        }

    }

    btn.addEventListener('click', () => {
        cbIndex = (cbIndex + 1) % cbCycle.length;
        applyCbMode(cbIndex);
    });
}

// --- Panel de velocidad de voz ---

export function initSpeedPanel() {
    const btnToggle = document.getElementById('btn-speed-toggle');
    const panel     = document.getElementById('speed-control-panel');
    if (!btnToggle || !panel) return;

    btnToggle.addEventListener('click', () => panel.classList.toggle('visible'));

    const speeds = [
        { id: 'speed-normal',     rate: 0.9,  label: 'Velocidad normal activada' },
        { id: 'speed-slow',       rate: 0.65, label: 'Velocidad lenta activada'  },
        { id: 'speed-very-slow',  rate: 0.45, label: 'Velocidad muy lenta activada' },
    ];

    speeds.forEach(({ id, rate, label }) => {
        document.getElementById(id)?.addEventListener('click', () => {
            state.speechRate = rate;
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(id)?.classList.add('active');
            panel.classList.remove('visible');
            showNotification(label, 'info');
        });
    });
}

// --- Ítems interactivos de la leyenda de accesibilidad ---

const toggleTargets = new Set(['btn-dark-mode', 'btn-toggle-contrast', 'btn-colorblind']);

function syncLegendItems() {
    document.querySelectorAll('.toolbar-legend-item[data-target]').forEach(item => {
        const btn = document.getElementById(item.dataset.target);
        if (btn && toggleTargets.has(item.dataset.target)) {
            item.classList.toggle('active', btn.classList.contains('active'));
        }
    });
}

export function initLegendItems() {
    document.querySelectorAll('.toolbar-legend-item[data-target]').forEach(item => {
        item.addEventListener('click', () => {
            const btn = document.getElementById(item.dataset.target);
            if (!btn) return;
            item.classList.add('clicking');
            setTimeout(() => item.classList.remove('clicking'), 180);
            btn.click();
            setTimeout(syncLegendItems, 40);
        });
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
        });
    });
    syncLegendItems();
}
