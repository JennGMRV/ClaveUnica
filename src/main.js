// ============================================================
// Punto de entrada — conecta todos los módulos
// ============================================================
import { showScreen, goBack, initNavigation, addScreenChangeHook, updateBreadcrumb } from './core/navigation.js';
import { stopSpeaking, prepareTextForHighlighting, startAdvancedReader, stopAdvancedReader } from './core/speech.js';
import { state }            from './core/state.js';

import { showNotification } from './utils/notifications.js';
import { formatRut, validateRut } from './utils/rut.js';

import { initFontControls, initDarkMode, initContrastToggle, initColorblindMode, initSpeedPanel, initLegendItems } from './features/accessibility.js';
import { initTutorial, setStepChangeCallback, setOnTutorialComplete, updateStepUI } from './features/tutorial.js';
import { assistant, initAssistant } from './features/assistant.js';
import { initModals, showTutorialSummary, setSayCallback } from './features/modals.js';

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------
    // 1. Núcleo: navegación
    // ----------------------------------------------------------
    initNavigation();

    // Hook: detener voz al cambiar de pantalla
    addScreenChangeHook(() => stopSpeaking());

    // Hook: auto-narración cuando el modo lector persistente está activo
    addScreenChangeHook(() => {
        if (state.autoReadMode) {
            clearTimeout(assistant._narrateTimer);
            assistant._narrateTimer = setTimeout(() => assistant.narrateCurrentScreen(), 800);
        }
    });

    // ----------------------------------------------------------
    // 2. Accesibilidad
    // ----------------------------------------------------------
    initFontControls();
    initDarkMode();
    initContrastToggle();
    initColorblindMode();
    initSpeedPanel();
    initLegendItems();

    // ----------------------------------------------------------
    // 3. Tutorial (Registro Civil y ChileAtiende)
    // ----------------------------------------------------------
    initTutorial();

    // Narración automática al cambiar de paso en el tutorial
    setStepChangeCallback(() => assistant.narrateCurrentScreen());

    // Acción al completar un tutorial
    setOnTutorialComplete(() => {
        showTutorialSummary();
        assistant.say('¡Felicitaciones! Ha completado el tutorial exitosamente. ¡Muy bien hecho!');
    });

    // ----------------------------------------------------------
    // 4. Asistente inteligente
    // ----------------------------------------------------------
    initAssistant();
    setSayCallback(text => assistant.say(text));

    // ----------------------------------------------------------
    // 5. Modales y overlays
    // ----------------------------------------------------------
    initModals();

    // ----------------------------------------------------------
    // 6. Barras de lector (reader toolbars)
    // ----------------------------------------------------------
    document.querySelectorAll('.reader-toolbar').forEach(tb => {
        const play   = tb.querySelector('.btn-play');
        const stop   = tb.querySelector('.btn-stop');
        const status = tb.querySelector('.reader-status');

        play.onclick = () => {
            state.autoReadMode = true;
            if (status) status.innerText = 'Leyendo...';

            const targetId = tb.getAttribute('data-reader-target');
            const target   = targetId ? document.getElementById(targetId) : null;
            if (target) {
                prepareTextForHighlighting(target);
                startAdvancedReader(target, tb);
            } else {
                assistant.narrateCurrentScreen();
                if (status) status.innerText = 'Leyendo pantalla...';
            }
        };

        stop.onclick = () => {
            state.autoReadMode = false;
            stopAdvancedReader();
        };
    });

    // ----------------------------------------------------------
    // 7. Formulario de login
    // ----------------------------------------------------------
    const rutInput  = document.getElementById('rut');
    const passInput = document.getElementById('password');

    rutInput?.addEventListener('input', function () {
        this.value = formatRut(this.value);
        this.classList.remove('error-field');
    });

    passInput?.addEventListener('input', function () {
        this.classList.remove('error-field');
    });

    document.getElementById('btn-login')?.addEventListener('click', () => {
        const rut      = rutInput?.value  || '';
        const password = passInput?.value || '';

        rutInput?.classList.remove('error-field');
        passInput?.classList.remove('error-field');

        const missing = [];
        if (rut.trim()      === '') { missing.push('RUT');        rutInput?.classList.add('error-field'); }
        if (password.trim() === '') { missing.push('Contraseña'); passInput?.classList.add('error-field'); }

        if (missing.length > 0) {
            showNotification(`Por favor, ingrese los siguientes campos: ${missing.join(', ')}.`, 'error');
            return;
        }
        if (!validateRut(rut)) {
            showNotification('Por favor, ingrese un RUT válido.', 'error');
            rutInput?.classList.add('error-field');
            return;
        }

        if (state.postLoginTarget === 'rcTutorial') updateStepUI();
        showScreen(state.postLoginTarget);
        state.postLoginTarget = 'menu';
    });

    // Toggle visibilidad de contraseña
    const togglePassBtn = document.getElementById('btn-toggle-password');
    if (togglePassBtn && passInput) {
        togglePassBtn.addEventListener('click', () => {
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            togglePassBtn.classList.toggle('active', isPass);
            togglePassBtn.innerText = isPass ? '🔒' : '👁️';
        });
    }

    // Ayuda de contraseña: muestra notificación
    document.getElementById('btn-help-password')?.addEventListener('click', () => {
        showNotification('La clave es su Clave Única, una contraseña secreta de 8 caracteres o más que le entregó el Registro Civil.', 'info');
    });

    // ----------------------------------------------------------
    // 8. Botones de navegación principal
    // ----------------------------------------------------------
    document.getElementById('btn-start-simulation')?.addEventListener('click',    () => showScreen('rcCategories'));
    document.getElementById('btn-start-ca-simulation')?.addEventListener('click', () => showScreen('caCategories'));

    document.getElementById('btn-tramites')?.addEventListener('click',  () => showScreen('form'));
    document.getElementById('btn-rc-guide')?.addEventListener('click',  () => showScreen('rcCategories'));
    document.getElementById('btn-ca-guide')?.addEventListener('click',  () => showScreen('caCategories'));

    document.getElementById('btn-back-tutorial')?.addEventListener('click', goBack);
    document.getElementById('btn-back-form')?.addEventListener('click',    goBack);
    document.getElementById('btn-back-confirm')?.addEventListener('click', goBack);

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        state.history = ['login'];
        showScreen('login', false);
    });

    // ----------------------------------------------------------
    // 9. Flujo de confirmación de trámite FONASA
    // ----------------------------------------------------------
    document.getElementById('btn-to-confirm')?.addEventListener('click', () => {
        const selected = document.querySelector('input[name="tramite"]:checked');
        if (!selected) return;
        const label = selected.parentElement.querySelector('strong')?.innerText || '';
        document.getElementById('confirm-type').innerText = label;
        showScreen('confirm');
    });

    document.getElementById('btn-confirm-final')?.addEventListener('click', () => showScreen('success'));

    document.getElementById('btn-finish')?.addEventListener('click', () => {
        state.history = ['login'];
        showScreen('login', false);
        if (rutInput)  rutInput.value  = '';
        if (passInput) passInput.value = '';
    });

    // ----------------------------------------------------------
    // 10. Breadcrumb de la pantalla inicial
    // ----------------------------------------------------------
    updateBreadcrumb('landing');
});
