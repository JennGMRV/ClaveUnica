import { state } from './state.js';

// Mapa de pantallas — se inicializa una vez que el DOM está listo
let screens = {};

const breadcrumbLabels = {
    landing:      null,
    login:        ['Inicio'],
    menu:         ['Inicio', 'Menú principal'],
    form:         ['Inicio', 'Menú principal', 'Solicitar certificado'],
    confirm:      ['Inicio', 'Menú principal', 'Solicitar certificado', 'Confirmación'],
    success:      ['Inicio', 'Menú principal', 'Completado'],
    tutorial:     ['Inicio', 'Menú principal', 'Tutorial ChileAtiende'],
    rcCategories: ['Inicio', 'Menú principal', 'Registro Civil'],
    rcTutorial:   ['Inicio', 'Menú principal', 'Registro Civil', 'Tutorial'],
    caCategories: ['Inicio', 'Menú principal', 'ChileAtiende']
};

// Hooks ejecutados en cada cambio de pantalla: (key: string) => void
const screenChangeHooks = [];

export function addScreenChangeHook(fn) {
    screenChangeHooks.push(fn);
}

export function getScreen(key) {
    return screens[key] || null;
}

export function initNavigation() {
    screens = {
        landing:      document.getElementById('screen-landing'),
        login:        document.getElementById('screen-login'),
        menu:         document.getElementById('screen-menu'),
        form:         document.getElementById('screen-form'),
        confirm:      document.getElementById('screen-confirm'),
        success:      document.getElementById('screen-success'),
        tutorial:     document.getElementById('screen-tutorial'),
        rcCategories: document.getElementById('screen-rc-categories'),
        rcTutorial:   document.getElementById('screen-rc-tutorial'),
        caCategories: document.getElementById('screen-ca-categories')
    };

    // Tecla Retroceso: vuelve atrás si no hay campo de texto activo o está vacío
    window.addEventListener('keydown', (e) => {
        if (e.key !== 'Backspace' && e.keyCode !== 8) return;
        const active = document.activeElement;
        const isInput = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA';
        if (!isInput || active.value === '') {
            e.preventDefault();
            goBack();
        }
    });
}

export function showScreen(key, addToHistory = true) {
    Object.values(screens).forEach(s => s && s.classList.remove('active'));
    if (screens[key]) screens[key].classList.add('active');
    state.currentScreenKey = key;

    if (addToHistory && state.history[state.history.length - 1] !== key) {
        state.history.push(key);
    }

    window.scrollTo(0, 0);
    updateBreadcrumb(key);
    screenChangeHooks.forEach(fn => fn(key));
}

export function goBack() {
    if (state.history.length > 1) {
        state.history.pop();
        showScreen(state.history[state.history.length - 1], false);
    }
}

export function updateBreadcrumb(key) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    const crumbs = breadcrumbLabels[key];
    if (!crumbs || crumbs.length === 0) {
        breadcrumb.style.display = 'none';
        return;
    }
    breadcrumb.style.display = 'flex';
    breadcrumb.innerHTML = crumbs.map((label, i) =>
        i < crumbs.length - 1
            ? `<span class="bc-item bc-link">${label}</span><span class="bc-sep">›</span>`
            : `<span class="bc-item bc-current">${label}</span>`
    ).join('');
}
