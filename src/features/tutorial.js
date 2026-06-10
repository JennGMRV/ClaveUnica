import { state }                          from '../core/state.js';
import { showScreen, goBack }              from '../core/navigation.js';
import { stopAdvancedReader }              from '../core/speech.js';
import { showNotification }               from '../utils/notifications.js';
import { rcData }                          from '../data/rc-data.js';
import { caData }                          from '../data/ca-data.js';
import { startInteractiveSimulation }      from './simulation.js';

// Callback inyectado desde main.js para narrar el paso actual cuando autoReadMode está activo
let _onStepChange = null;
export function setStepChangeCallback(fn) { _onStepChange = fn; }

// Callback inyectado desde main.js cuando se completa el tutorial
let _onTutorialComplete = null;
export function setOnTutorialComplete(fn) { _onTutorialComplete = fn; }

export function initTutorial() {
    // Botones de categorías del Registro Civil
    document.querySelectorAll('.rc-category-card').forEach(card => {
        card.addEventListener('click', () => selectRCCategory(card.getAttribute('data-cat')));
    });

    // Botones de servicios de ChileAtiende
    document.querySelectorAll('.ca-service-item').forEach(item => {
        item.addEventListener('click', () => {
            const serviceId = item.getAttribute('data-service');
            const service   = caData[serviceId];
            if (!service) return;
            state.currentTutorialOrigin = 'caCategories';
            state.currentTutorialSteps  = service.steps;
            state.currentStepIndex      = 0;
            updateStepUI();
            showScreen('rcTutorial');
        });
    });

    // Navegación de pasos
    document.getElementById('btn-rc-next')?.addEventListener('click', () => {
        if (state.currentStepIndex < state.currentTutorialSteps.length - 1) {
            state.currentStepIndex++;
            updateStepUI();
        } else {
            if (_onTutorialComplete) _onTutorialComplete();
        }
    });

    document.getElementById('btn-rc-prev')?.addEventListener('click', () => {
        if (state.currentStepIndex > 0) {
            state.currentStepIndex--;
            updateStepUI();
        }
    });

    // Botones de retroceso
    document.getElementById('btn-back-rc')?.addEventListener('click', goBack);

    document.getElementById('btn-back-rc-tutorial')?.addEventListener('click', () => {
        if (state.currentStepIndex > 0) {
            document.getElementById('modal-exit-tutorial').style.display = 'block';
        } else {
            goBack();
        }
    });

    document.getElementById('btn-back-ca')?.addEventListener('click', goBack);

    // --- Lógica del Modal de Elección de Modo de Aprendizaje ---
    const choiceModal = document.getElementById('modal-rc-learn-choice');
    const btnCloseChoice = document.getElementById('btn-close-choice');
    const btnChoiceTutorial = document.getElementById('btn-choice-tutorial');
    const btnChoiceSimulate = document.getElementById('btn-choice-simulate');

    if (btnCloseChoice && choiceModal) {
        btnCloseChoice.onclick = () => {
            choiceModal.style.display = 'none';
        };
        window.addEventListener('click', (event) => {
            if (event.target == choiceModal) {
                choiceModal.style.display = 'none';
            }
        });
    }

    if (btnChoiceTutorial && choiceModal) {
        btnChoiceTutorial.onclick = () => {
            choiceModal.style.display = 'none';
            if (state.choiceCertCu) {
                state.postLoginTarget = 'rcTutorial';
                state.currentTutorialOrigin = 'rcCategories';
                state.currentTutorialSteps = rcData.steps[state.choiceCertId] || [];
                state.currentStepIndex = 0;
                showScreen('login');
            } else {
                startTutorial(state.choiceCertId, state.choiceCertName);
            }
        };
    }

    if (btnChoiceSimulate && choiceModal) {
        btnChoiceSimulate.onclick = () => {
            choiceModal.style.display = 'none';
            if (state.choiceCertCu) {
                state.postLoginTarget = 'rcInteractiveSimulation';
                state.currentTutorialOrigin = 'rcCategories';
                state.currentStepIndex = 0;
                showScreen('login');
            } else {
                startInteractiveSimulation(state.choiceCertId, state.choiceCertName);
            }
        };
    }
}

export function selectRCCategory(catId) {
    const cat = rcData.categories[catId];
    if (!cat) {
        showNotification('Esta categoría estará disponible próximamente.', 'info');
        return;
    }

    showScreen('rcCategories');

    document.querySelectorAll('.rc-category-card').forEach(c => c.classList.remove('active'));
    const card = document.querySelector(`.rc-category-card[data-cat="${catId}"]`);
    if (card) card.classList.add('active');

    const sublist   = document.getElementById('rc-certs-sublist');
    const titleEl   = document.getElementById('rc-selected-cat-title');
    const container = document.getElementById('rc-certs-items');

    titleEl.innerText   = 'Certificados de ' + cat.title;
    container.innerHTML = '';

    cat.certs.forEach(cert => {
        const item = document.createElement('div');
        item.className = 'rc-cert-item';
        item.innerHTML = `
            <div class="rc-cert-info">
                <span class="rc-cert-name">${cert.name}</span>
                <span class="rc-cert-desc">${cert.desc}</span>
            </div>
            ${cert.cu ? '<div class="cu-badge"><span class="icon">🔑</span> Requiere Clave Única</div>' : ''}
        `;
        item.onclick = () => {
            state.choiceCertId = cert.id;
            state.choiceCertName = cert.name;
            state.choiceCertCu = cert.cu;
            
            const choiceModal = document.getElementById('modal-rc-learn-choice');
            if (choiceModal) {
                choiceModal.style.display = 'flex';
                const modalTitle = document.getElementById('choice-modal-title');
                if (modalTitle) modalTitle.innerText = `¿Cómo desea realizar: ${cert.name}?`;
            } else {
                if (cert.cu) {
                    state.postLoginTarget       = 'rcTutorial';
                    state.currentTutorialOrigin = 'rcCategories';
                    state.currentTutorialSteps  = rcData.steps[cert.id] || [];
                    state.currentStepIndex      = 0;
                    showScreen('login');
                } else {
                    startTutorial(cert.id, cert.name);
                }
            }
        };
        container.appendChild(item);
    });

    sublist.style.display = 'block';
    setTimeout(() => sublist.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
}

function startTutorial(certId, certName) {
    state.currentTutorialOrigin = 'rcCategories';
    state.currentTutorialSteps  = rcData.steps[certId] || [
        { title: 'Paso 1: Ingresar', text: `Para obtener el ${certName}, primero debe ir al sitio oficial del Registro Civil.`, visual: '🌐 www.registrocivil.cl' },
        { title: 'Paso 2: Selección', text: 'Busque el nombre del certificado en la lista de servicios en línea.', visual: '🖱️ Clic en la lista.' },
        { title: 'Paso 3: Finalizar', text: 'Siga las instrucciones en pantalla para recibir su documento por correo.', visual: '✅ Proceso completado.' }
    ];
    state.currentStepIndex = 0;
    updateStepUI();
    showScreen('rcTutorial');
}

export function updateStepUI() {
    const step    = state.currentTutorialSteps[state.currentStepIndex];
    const content = document.getElementById('rc-tutorial-content');

    const wrappedText = step.text.split(/(\s+)/).map((part, i) =>
        part.trim().length === 0 ? part : `<span class="reader-word" data-word-index="${i}">${part}</span>`
    ).join('');

    let visualHtml = '';
    if (step.visual.endsWith('.png') || step.visual.endsWith('.jpg')) {
        visualHtml = `
            <div class="rc-visual-wrapper">
                <img src="${step.visual}" class="rc-step-img" alt="Guía visual" title="Toque para ampliar">
                ${step.highlight ? `<div class="rc-highlight-overlay ${step.highlight}"></div><div class="rc-finger-pointer">☝️</div>` : ''}
            </div>
            <p class="zoom-hint">🔍 Toque la imagen para verla más grande</p>
        `;
    } else {
        visualHtml = `
            <div id="rc-step-visual" style="padding:20px;background:#f0f7ff;border-radius:8px;border:2px dashed var(--primary);text-align:center;font-weight:700;">
                ${step.visual}
            </div>
        `;
    }

    const progressPct = Math.round(((state.currentStepIndex + 1) / state.currentTutorialSteps.length) * 100);

    content.innerHTML = `
        <div class="tutorial-progress-header">
            <span class="tutorial-step-counter">Paso ${state.currentStepIndex + 1} de ${state.currentTutorialSteps.length}</span>
            <div class="tutorial-progress-track">
                <div class="tutorial-progress-fill" style="width:${progressPct}%"></div>
            </div>
        </div>
        <h2>${step.title}</h2>
        <div id="reader-target-text" class="step-text">${wrappedText}</div>
        <div class="rc-official-mockup">
            <div class="rc-official-header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Logotipo_Clave_%C3%9Anica.svg" alt="Logo CU" class="rc-official-logo">
                <div class="rc-guide-overlay" title="Ayuda" onclick="showNotification('${step.text.replace(/'/g, "\\'")}', 'info')">?</div>
            </div>
            ${visualHtml}
            ${step.secondaryVisual ? `
                <div class="rc-visual-wrapper secondary" style="margin-top:15px;">
                    <img src="${step.secondaryVisual}" class="rc-step-img" alt="Ejemplo carnet">
                    ${step.secondaryHighlight ? `<div class="rc-highlight-overlay ${step.secondaryHighlight}"></div>` : ''}
                </div>
            ` : ''}
        </div>
    `;

    const prevBtn = document.getElementById('btn-rc-prev');
    const nextBtn = document.getElementById('btn-rc-next');
    if (prevBtn) prevBtn.disabled = state.currentStepIndex === 0;
    if (nextBtn) nextBtn.innerText = state.currentStepIndex === state.currentTutorialSteps.length - 1
        ? 'Entendido, finalizar'
        : 'Siguiente Paso';

    stopAdvancedReader();

    if (state.autoReadMode && _onStepChange) {
        clearTimeout(window._tutorialNarrateTimer);
        window._tutorialNarrateTimer = setTimeout(_onStepChange, 600);
    }
}
