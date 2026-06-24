import { state }      from '../core/state.js';
import { goBack, showScreen, resetHistoryTo } from '../core/navigation.js';
import { startInteractiveSimulation } from './simulation.js';

// Callback para decir el mensaje de felicitaciones (inyectado desde main.js)
let _sayCb = null;
export function setSayCallback(fn) { _sayCb = fn; }

// -------------------------------------------------------------------
// Modal: Zoom de imagen del tutorial
// -------------------------------------------------------------------
function initImageZoom() {
    const modalZoom  = document.getElementById('modal-zoom');
    const zoomImg    = document.getElementById('zoom-img');
    const btnClose   = document.getElementById('btn-zoom-close');

    document.addEventListener('click', (e) => {
        const img = e.target.closest('.rc-step-img');
        if (img && modalZoom && zoomImg) {
            zoomImg.src = img.src;
            zoomImg.alt = img.alt;
            modalZoom.style.display = 'flex';
        }
    });
    btnClose?.addEventListener('click', () => { if (modalZoom) modalZoom.style.display = 'none'; });
    modalZoom?.addEventListener('click', (e) => { if (e.target === modalZoom) modalZoom.style.display = 'none'; });
}

// -------------------------------------------------------------------
// Modal: Confirmar salida del tutorial
// -------------------------------------------------------------------
function initExitTutorialModal() {
    document.getElementById('btn-exit-confirm')?.addEventListener('click', () => {
        const m = document.getElementById('modal-exit-tutorial');
        if (m) m.style.display = 'none';
        goBack();
    });
    document.getElementById('btn-exit-cancel')?.addEventListener('click', () => {
        const m = document.getElementById('modal-exit-tutorial');
        if (m) m.style.display = 'none';
    });
}

// -------------------------------------------------------------------
// Modal: Resumen al finalizar el tutorial
// -------------------------------------------------------------------
export function showTutorialSummary() {
    const modal  = document.getElementById('modal-tutorial-summary');
    if (!modal) return;
    const listEl = document.getElementById('summary-steps-recap');
    if (listEl) {
        listEl.innerHTML = '<ul>' + state.currentTutorialSteps.map(s =>
            `<li><span class="summary-check">✅</span> ${s.title}</li>`
        ).join('') + '</ul>';
    }
    const simBtn = document.getElementById('btn-summary-simulate');
    const noSim = ['caCategories', 'login'];
    if (simBtn) simBtn.style.display = noSim.includes(state.currentTutorialOrigin) ? 'none' : '';
    modal.style.display = 'flex';
}

function initTutorialSummaryModal() {
    document.getElementById('btn-summary-ok')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-tutorial-summary');
        if (modal) modal.style.display = 'none';
        resetHistoryTo(state.currentTutorialOrigin || 'menu');
    });

    document.getElementById('btn-summary-simulate')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-tutorial-summary');
        if (modal) modal.style.display = 'none';
        resetHistoryTo('rcCategories');
        startInteractiveSimulation(state.choiceCertId || 'nac-matricula', state.choiceCertName || 'Certificado de Nacimiento');
    });
}

// -------------------------------------------------------------------
// Overlay: Primera visita (onboarding)
// -------------------------------------------------------------------
function openFirstUseOverlay() {
    document.getElementById('overlay-first-use')?.classList.add('visible');
}

function initFirstUseOverlay() {
    const overlay = document.getElementById('overlay-first-use');
    if (!overlay) return;

    const slides  = overlay.querySelectorAll('.first-use-slide');
    const dots    = overlay.querySelectorAll('.fuse-dot');
    const btnNext = document.getElementById('btn-fuse-next');
    let fuseStep  = 0;

    const dismissOverlay = () => {
        overlay.classList.remove('visible');
        localStorage.setItem('firstUseShown', 'true');
    };

    const goToSlide = (n) => {
        slides.forEach((s, i) => s.classList.toggle('active', i === n));
        dots.forEach((d, i)   => d.classList.toggle('active', i === n));
        if (btnNext) btnNext.textContent = n === slides.length - 1 ? '¡Comenzar!' : 'Siguiente →';
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => { fuseStep = i; goToSlide(fuseStep); }));

    btnNext?.addEventListener('click', () => {
        if (fuseStep < slides.length - 1) { fuseStep++; goToSlide(fuseStep); }
        else dismissOverlay();
    });

    document.getElementById('btn-fuse-skip')?.addEventListener('click', dismissOverlay);

    if (!localStorage.getItem('firstUseShown')) {
        goToSlide(0);
        overlay.classList.add('visible');
    }
}

// -------------------------------------------------------------------
// Botón flotante de ayuda rápida
// -------------------------------------------------------------------
function initQuickHelp() {
    const btn = document.getElementById('btn-quick-help');
    if (!btn) return;
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    btn.addEventListener('click', () => {
        if (isTouchDevice) {
            if (!btn.classList.contains('is-expanded')) {
                btn.classList.add('is-expanded');
                clearTimeout(btn._collapseTimer);
                btn._collapseTimer = setTimeout(() => btn.classList.remove('is-expanded'), 3000);
            } else {
                clearTimeout(btn._collapseTimer);
                btn.classList.remove('is-expanded');
                openFirstUseOverlay();
            }
        } else {
            openFirstUseOverlay();
        }
    });
}

// -------------------------------------------------------------------
// Transparencia del asistente al solapar con texto (móvil)
// -------------------------------------------------------------------
function initAssistantTransparency() {
    const container = document.querySelector('.assistant-container');
    if (!container) return;
    const isTouchOnly = window.matchMedia('(hover: none)').matches;

    if (isTouchOnly) {
        container.addEventListener('touchstart', () => {
            container.classList.add('is-active');
            container.classList.remove('is-overlapping');
            clearTimeout(container._fadeTimer);
        }, { passive: true });

        const startFadeTimer = () => {
            clearTimeout(container._fadeTimer);
            container._fadeTimer = setTimeout(() => {
                container.classList.remove('is-active');
                checkAssistantOverlap();
            }, 2000);
        };

        container.addEventListener('touchend',   startFadeTimer, { passive: true });
        container.addEventListener('touchcancel', startFadeTimer, { passive: true });
    }

    function checkAssistantOverlap() {
        if (container.classList.contains('is-active')) return;
        const acRect  = container.getBoundingClientRect();
        const textEls = document.querySelectorAll('#app p, #app h1, #app h2, #app h3, #app li, #app label, #app .btn-text, #app .menu-item, #app .card');
        let overlaps  = false;
        for (const el of textEls) {
            const r = el.getBoundingClientRect();
            if (r.bottom > acRect.top && r.top < acRect.bottom && r.right > acRect.left && r.left < acRect.right) {
                overlaps = true;
                break;
            }
        }
        container.classList.toggle('is-overlapping', overlaps);
    }

    if (isTouchOnly) {
        window.addEventListener('scroll', checkAssistantOverlap, { passive: true });
        const appEl = document.getElementById('app');
        if (appEl) new MutationObserver(checkAssistantOverlap).observe(appEl, { attributes: true, subtree: false, attributeFilter: ['class'] });
        checkAssistantOverlap();
    }

    const avatarEl = document.getElementById('assistant-icon');
    if (avatarEl) {
        new MutationObserver(() => {
            const busy = avatarEl.classList.contains('speaking') || avatarEl.classList.contains('listening');
            container.classList.toggle('is-active', busy);
        }).observe(avatarEl, { attributes: true, attributeFilter: ['class'] });
    }
}

// -------------------------------------------------------------------
// Init global de todos los modales
// -------------------------------------------------------------------
export function initModals() {
    initImageZoom();
    initExitTutorialModal();
    initTutorialSummaryModal();
    initFirstUseOverlay();
    initQuickHelp();
    initAssistantTransparency();
}
