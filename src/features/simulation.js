import { state } from '../core/state.js';
import { showScreen, goBack } from '../core/navigation.js';
import { formatRut, validateRut } from '../utils/rut.js';
import { showNotification } from '../utils/notifications.js';
import { assistant } from './assistant.js';

// Mapear certificados a sus categorías
const certCategoryMap = {
    'nac-matricula': 'nacimiento',
    'nac-asignacion': 'nacimiento',
    'nac-todo': 'nacimiento',
    'mat-todo': 'matrimonio',
    'mat-asignacion': 'matrimonio',
    'def-todo': 'defuncion',
    'def-asignacion': 'defuncion'
};

const categoryNames = {
    'nacimiento': 'Nacimiento',
    'matrimonio': 'Matrimonio',
    'defuncion': 'Defunción'
};

export function startInteractiveSimulation(certId, certName) {
    state.simActiveCertId = certId;
    state.simActiveCertName = certName;
    state.simActiveCatId = certCategoryMap[certId] || 'nacimiento';
    state.simCurrentStep = 0;
    
    // Limpiar inputs de RUT y formularios
    document.querySelectorAll('.sim-input-rut').forEach(inp => inp.value = '');
    const solRut = document.getElementById('sim-sol-rut');
    const solDoc = document.getElementById('sim-sol-doc');
    const solEmail = document.getElementById('sim-sol-email');
    const solEmailConfirm = document.getElementById('sim-sol-email-confirm');
    const captchaInput = document.getElementById('sim-captcha-input');
    if (solRut) solRut.value = '';
    if (solDoc) solDoc.value = '';
    if (solEmail) solEmail.value = '';
    if (solEmailConfirm) solEmailConfirm.value = '';
    if (captchaInput) captchaInput.value = '';
    
    // Resetear clases de error
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    // Deshabilitar formulario del solicitante
    const solBox = document.getElementById('sim-solicitante-box');
    if (solBox) {
        solBox.classList.add('disabled');
        solBox.querySelectorAll('input, button').forEach(el => el.disabled = true);
    }

    // Colapsar todas las categorías simuladas
    document.querySelectorAll('.sim-cat-card').forEach(card => {
        card.classList.remove('active');
    });

    // Limpiar checkboxes de certificados y ocultar action-boxes
    document.querySelectorAll('.sim-cert-checkbox').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.sim-cert-action-box').forEach(box => {
        box.style.display = 'none';
    });
    const totalDisplay = document.getElementById('sim-cart-total-val-display');
    if (totalDisplay) totalDisplay.innerText = '0';

    // Limpiar carro simulado
    const cartEmptyMsg = document.getElementById('sim-cart-empty-msg');
    const cartTable = document.getElementById('sim-cart-table');
    const cartTotalBox = document.getElementById('sim-cart-total-box');
    const cartItemsBody = document.getElementById('sim-cart-items-body');
    
    if (cartEmptyMsg) cartEmptyMsg.style.display = 'block';
    if (cartTable) cartTable.style.display = 'none';
    if (cartTotalBox) cartTotalBox.style.display = 'none';
    if (cartItemsBody) cartItemsBody.innerHTML = '';
    const cartCount = document.getElementById('sim-cart-count');
    if (cartCount) cartCount.innerText = '0 art.';

    // Ocultar pantalla de checkout y mostrar rejilla principal
    const mainGrid = document.getElementById('sim-main-grid');
    const checkoutScreen = document.getElementById('sim-checkout-screen');
    if (mainGrid) mainGrid.style.display = 'grid';
    if (checkoutScreen) checkoutScreen.style.display = 'none';

    // Asegurar que las categorías y aviso estén visibles y el captcha oculto al iniciar
    const infoBlock = document.getElementById('sim-info-text-block');
    const categoriesBlock = document.getElementById('sim-categories-list-block');
    const captchaContainer = document.getElementById('sim-captcha-container');
    if (infoBlock) infoBlock.style.display = 'block';
    if (categoriesBlock) categoriesBlock.style.display = 'block';
    if (captchaContainer) captchaContainer.style.display = 'none';

    // Mostrar pantalla de simulación
    showScreen('rcInteractiveSimulation');

    // Inicializar UI de pasos
    updateSimulationStepUI();
}

export function updateSimulationStepUI() {
    const textEl = document.getElementById('sim-assistant-text');
    if (!textEl) return;

    let instructionText = "";
    let targetSelector = "";

    const catName = categoryNames[state.simActiveCatId] || "";

    switch (state.simCurrentStep) {
        case 0: // Clic en categoría correcta
            instructionText = `Paso 1: Busque y haga clic sobre la categoría "${catName}" (marcada con el borde naranja parpadeante) para abrir las opciones.`;
            targetSelector = `#sim-cat-${state.simActiveCatId}`;
            break;
        case 1: // Rellenar RUT y agregar
            instructionText = `Paso 2: Marque la casilla al lado de "${state.simActiveCertName}", escriba el RUN de la persona en el cuadro blanco y presione "Agregar al carro".`;
            targetSelector = `#sim-cert-${state.simActiveCertId}`;
            break;
        case 2: // Resolver Captcha (inline)
            instructionText = `Paso 3: Por seguridad, escriba el código de 6 letras y números de la imagen en el recuadro blanco y presione "submit".`;
            targetSelector = `#sim-captcha-container`;
            break;
        case 3: // Rellenar datos del solicitante
            instructionText = `Paso 4: ¡El certificado se agregó al carro! Ahora, complete los "Datos del Solicitante" a la derecha: ingrese su RUN, N° documento de carnet y su correo.`;
            targetSelector = `#sim-solicitante-box`;
            break;
        case 4: // Presionar continuar del solicitante
            instructionText = `Paso 5: Revise que sus datos estén correctos y presione el botón "Continuar" para avanzar al paso final.`;
            targetSelector = `#sim-btn-continue`;
            break;
        case 5: // Confirmar y obtener
            instructionText = `Paso 6: ¡Último paso! Revise que el valor sea $0 (estos certificados son gratis para usted) y presione el botón "Obtener Certificado" para terminar.`;
            targetSelector = `#btn-sim-checkout-submit`;
            break;
    }

    // Actualizar texto en panel flotante
    textEl.innerHTML = instructionText;

    // Resaltar visualmente el componente actual
    simHighlightOnly(targetSelector);

    // Narrar instrucción si corresponde
    if (state.autoReadMode) {
        assistant.say(instructionText);
    }
}

function simHighlightOnly(selector) {
    document.querySelectorAll('.sim-highlight-guide, .sim-highlight-text-guide').forEach(el => {
        el.classList.remove('sim-highlight-guide', 'sim-highlight-text-guide');
    });

    if (selector) {
        const el = document.querySelector(selector);
        if (el) {
            if (selector.includes('input') || selector.includes('group') || selector.includes('box')) {
                el.classList.add('sim-highlight-text-guide');
            } else {
                el.classList.add('sim-highlight-guide');
            }
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

export function initSimulation() {
    // Configurar click en botones de reproducción de voz en la simulación
    const btnSimVoicePlay = document.getElementById('btn-sim-voice-play');
    if (btnSimVoicePlay) {
        btnSimVoicePlay.onclick = () => {
            const textEl = document.getElementById('sim-assistant-text');
            if (textEl) {
                assistant.say(textEl.innerText);
            }
        };
    }

    // Cancelar simulación
    const btnBackRcSimulation = document.getElementById('btn-back-rc-simulation');
    if (btnBackRcSimulation) {
        btnBackRcSimulation.onclick = () => {
            goBack();
        };
    }

    // 1. Clic en categorías de la simulación
    document.querySelectorAll('.sim-cat-card .sim-cat-header').forEach(hdr => {
        hdr.onclick = () => {
            const card = hdr.closest('.sim-cat-card');
            const catId = card.getAttribute('data-sim-cat');
            
            if (state.simCurrentStep === 0) {
                if (catId === state.simActiveCatId) {
                    card.classList.add('active');
                    state.simCurrentStep = 1;
                    updateSimulationStepUI();
                } else {
                    showNotification(`Para este trámite, busque y presione la categoría "${categoryNames[state.simActiveCatId]}" marcada en naranja.`, "error");
                }
            } else if (state.simCurrentStep >= 1) {
                card.classList.toggle('active');
            }
        };
    });

    // Manejo de checkboxes de certificados
    document.querySelectorAll('.sim-cert-checkbox').forEach(cb => {
        cb.onchange = () => {
            const certId = cb.getAttribute('data-cert-id');
            const actionBox = document.getElementById(`sim-action-${certId}`);
            
            if (cb.checked) {
                if (state.simCurrentStep === 1 && certId !== state.simActiveCertId) {
                    showNotification(`Por favor, simule el certificado indicado: "${state.simActiveCertName}".`, "error");
                    cb.checked = false;
                    return;
                }
                
                if (actionBox) actionBox.style.display = 'flex';
                
                document.querySelectorAll('.sim-cert-checkbox').forEach(other => {
                    if (other !== cb && other.closest('.sim-cat-card') === cb.closest('.sim-cat-card')) {
                        other.checked = false;
                        const otherId = other.getAttribute('data-cert-id');
                        const otherBox = document.getElementById(`sim-action-${otherId}`);
                        if (otherBox) otherBox.style.display = 'none';
                    }
                });
            } else {
                if (actionBox) actionBox.style.display = 'none';
            }
        };
    });

    // Validar y formatear inputs de RUT en la simulación
    document.querySelectorAll('.sim-input-rut, #sim-sol-rut').forEach(input => {
        input.addEventListener('input', function() {
            this.value = formatRut(this.value);
            this.classList.remove('error-field');
        });
    });

    // Clic en "Agregar al Carro" en la simulación
    document.querySelectorAll('.sim-btn-add-cart').forEach(btn => {
        btn.onclick = () => {
            const certId = btn.getAttribute('data-cert-id');
            const inputRut = document.getElementById(`input-rut-${certId}`);
            const rutVal = inputRut ? inputRut.value : '';

            if (state.simCurrentStep === 1) {
                if (certId !== state.simActiveCertId) {
                    showNotification(`Por favor, simule el certificado indicado: "${state.simActiveCertName}".`, "error");
                    return;
                }

                if (rutVal.trim() === '') {
                    showNotification("Por favor, ingrese el RUT del inscrito.", "error");
                    if (inputRut) inputRut.classList.add('error-field');
                    return;
                }

                if (!validateRut(rutVal)) {
                    showNotification("Por favor, ingrese un RUT válido.", "error");
                    if (inputRut) inputRut.classList.add('error-field');
                    return;
                }

                state.simCartRUT = rutVal;
                showSimCaptchaModal();
            } else {
                showNotification("Siga las instrucciones del asistente flotante de ayuda.", "info");
            }
        };
    });

    // Captcha simulado
    const captchaContainer = document.getElementById('sim-captcha-container');
    const infoBlock = document.getElementById('sim-info-text-block');
    const categoriesBlock = document.getElementById('sim-categories-list-block');
    const btnCaptchaRefresh = document.getElementById('btn-sim-captcha-refresh');
    const inputCaptcha = document.getElementById('sim-captcha-input');
    const btnCaptchaCancel = document.getElementById('btn-sim-captcha-cancel');
    const btnCaptchaSubmit = document.getElementById('btn-sim-captcha-submit');
    const btnCaptchaAudio = document.getElementById('btn-sim-captcha-audio');

    function showSimCaptchaModal() {
        state.simCaptchaText = generateRandomCaptcha();
        renderCaptcha(state.simCaptchaText);
        
        if (inputCaptcha) {
            inputCaptcha.value = '';
            inputCaptcha.classList.remove('error-field');
        }
        
        if (infoBlock) infoBlock.style.display = 'none';
        if (categoriesBlock) categoriesBlock.style.display = 'none';
        if (captchaContainer) captchaContainer.style.display = 'block';
        
        const supportCodeEl = document.getElementById('sim-captcha-support-code');
        if (supportCodeEl) {
            let code = '1690';
            for (let i = 0; i < 16; i++) {
                code += Math.floor(Math.random() * 10);
            }
            supportCodeEl.innerText = `Código de soporte: ${code}.`;
        }
        
        state.simCurrentStep = 2;
        updateSimulationStepUI();
        if (inputCaptcha) inputCaptcha.focus();
    }

    function renderCaptcha(text) {
        const container = document.getElementById('sim-captcha-letters-container');
        if (!container) return;
        container.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            const span = document.createElement('span');
            span.innerText = char;
            
            const rot = Math.floor(Math.random() * 30) - 15;
            const size = Math.floor(Math.random() * 8) + 26;
            const yOffset = Math.floor(Math.random() * 10) - 5;
            const xOffset = Math.floor(Math.random() * 6) - 3;
            const weight = [400, 600, 800][Math.floor(Math.random() * 3)];
            
            const colors = ['#2b2b2b', '#3a3a3a', '#4a4a4a', '#1e1e1e', '#555555'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            span.style.transform = `rotate(${rot}deg) translateY(${yOffset}px) translateX(${xOffset}px)`;
            span.style.fontSize = `${size}px`;
            span.style.fontWeight = weight;
            span.style.color = color;
            span.style.display = 'inline-block';
            span.style.fontFamily = "monospace";
            
            container.appendChild(span);
        }
    }

    if (btnCaptchaRefresh) {
        btnCaptchaRefresh.onclick = (e) => {
            if (e) e.preventDefault();
            state.simCaptchaText = generateRandomCaptcha();
            renderCaptcha(state.simCaptchaText);
            if (inputCaptcha) inputCaptcha.value = '';
        };
    }

    if (btnCaptchaCancel) {
        btnCaptchaCancel.onclick = (e) => {
            if (e) e.preventDefault();
            if (infoBlock) infoBlock.style.display = 'block';
            if (categoriesBlock) categoriesBlock.style.display = 'block';
            if (captchaContainer) captchaContainer.style.display = 'none';
            
            state.simCurrentStep = 1;
            updateSimulationStepUI();
        };
    }

    if (btnCaptchaSubmit) {
        btnCaptchaSubmit.onclick = (e) => {
            if (e) e.preventDefault();
            const entered = inputCaptcha ? inputCaptcha.value.trim().toUpperCase() : '';
            if (entered === state.simCaptchaText.toUpperCase()) {
                if (infoBlock) infoBlock.style.display = 'block';
                if (categoriesBlock) categoriesBlock.style.display = 'block';
                if (captchaContainer) captchaContainer.style.display = 'none';
                addItemToSimCart();
            } else {
                showNotification("Código incorrecto, por favor intente de nuevo.", "error");
                if (inputCaptcha) {
                    inputCaptcha.classList.add('error-field');
                    inputCaptcha.value = '';
                }
                state.simCaptchaText = generateRandomCaptcha();
                renderCaptcha(state.simCaptchaText);
            }
        };
    }

    if (btnCaptchaAudio) {
        btnCaptchaAudio.onclick = (e) => {
            if (e) e.preventDefault();
            if (!state.simCaptchaText) return;
            
            let spellOut = 'El código es: ';
            for (let i = 0; i < state.simCaptchaText.length; i++) {
                const char = state.simCaptchaText.charAt(i);
                if (char >= '0' && char <= '9') {
                    spellOut += `${char}. `;
                } else if (char === char.toUpperCase()) {
                    spellOut += `${char.toUpperCase()} mayúscula. `;
                } else {
                    spellOut += `${char.toLowerCase()} minúscula. `;
                }
            }
            assistant.say(spellOut);
        };
    }

    if (inputCaptcha) {
        inputCaptcha.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (btnCaptchaSubmit) btnCaptchaSubmit.click();
            }
        };
    }

    function generateRandomCaptcha() {
        const chars = 'abcdefhkmnpqruvwxyABCDEFGHKLMNPQRSTUVWXY346789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function addItemToSimCart() {
        const cartEmptyMsg = document.getElementById('sim-cart-empty-msg');
        const cartTable = document.getElementById('sim-cart-table');
        const cartTotalBox = document.getElementById('sim-cart-total-box');
        const cartItemsBody = document.getElementById('sim-cart-items-body');

        if (infoBlock) infoBlock.style.display = 'block';
        if (categoriesBlock) categoriesBlock.style.display = 'block';
        if (captchaContainer) captchaContainer.style.display = 'none';

        if (cartEmptyMsg) cartEmptyMsg.style.display = 'none';
        if (cartTable) cartTable.style.display = 'table';
        if (cartTotalBox) cartTotalBox.style.display = 'flex';
        
        if (cartItemsBody) {
            cartItemsBody.innerHTML = `
                <tr>
                    <td style="padding: 10px 0;"><strong>${state.simActiveCertName}</strong></td>
                    <td style="padding: 10px 0;">${state.simCartRUT}</td>
                    <td style="padding: 10px 0; color: #28a745; font-weight: bold;">$0</td>
                </tr>
            `;
        }

        const cartCount = document.getElementById('sim-cart-count');
        if (cartCount) cartCount.innerText = '1 art.';

        // Habilitar Formulario de Solicitante
        const solBox = document.getElementById('sim-solicitante-box');
        if (solBox) {
            solBox.classList.remove('disabled');
            solBox.querySelectorAll('input, button').forEach(el => el.disabled = false);
        }

        // Si ya hay RUT logueado en la app principal, auto-llenarlo
        const loggedInRut = document.getElementById('rut') ? document.getElementById('rut').value : '';
        const solRut = document.getElementById('sim-sol-rut');
        if (loggedInRut && solRut) {
            solRut.value = loggedInRut;
        }

        state.simCurrentStep = 3;
        updateSimulationStepUI();
    }

    // Datos del solicitante inputs validation
    const simSolRut = document.getElementById('sim-sol-rut');
    const simSolDoc = document.getElementById('sim-sol-doc');
    const simSolEmail = document.getElementById('sim-sol-email');
    const simSolEmailConfirm = document.getElementById('sim-sol-email-confirm');
    const simBtnContinue = document.getElementById('sim-btn-continue');

    function checkSimFormCompletion() {
        if (state.simCurrentStep === 3) {
            const r = simSolRut ? simSolRut.value : '';
            const d = simSolDoc ? simSolDoc.value : '';
            const e = simSolEmail ? simSolEmail.value : '';
            const ec = simSolEmailConfirm ? simSolEmailConfirm.value : '';

            if (r.trim() !== '' && d.trim() !== '' && e.trim() !== '' && ec.trim() !== '') {
                state.simCurrentStep = 4;
                updateSimulationStepUI();
            }
        }
    }

    [simSolRut, simSolDoc, simSolEmail, simSolEmailConfirm].forEach(el => {
        if (el) {
            el.addEventListener('input', () => {
                el.classList.remove('error-field');
                checkSimFormCompletion();
            });
        }
    });

    const simHelpDoc = document.getElementById('sim-btn-help-doc');
    if (simHelpDoc) {
        simHelpDoc.onclick = () => {
            showNotification("El número de documento o de serie está en el frente o reverso de su carnet de identidad. Es un número de 9 dígitos.", "info");
        };
    }

    // Clic en Continuar (solicitante)
    if (simBtnContinue) {
        simBtnContinue.onclick = () => {
            const rVal = simSolRut ? simSolRut.value : '';
            const dVal = simSolDoc ? simSolDoc.value : '';
            const eVal = simSolEmail ? simSolEmail.value : '';
            const ecVal = simSolEmailConfirm ? simSolEmailConfirm.value : '';

            if (!validateRut(rVal)) {
                showNotification("Por favor, ingrese un RUN de solicitante válido.", "error");
                if (simSolRut) simSolRut.classList.add('error-field');
                return;
            }

            if (dVal.trim().length < 6) {
                showNotification("Por favor, ingrese un N° Documento válido (está en su carnet).", "error");
                if (simSolDoc) simSolDoc.classList.add('error-field');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(eVal)) {
                showNotification("Por favor, ingrese un correo electrónico válido.", "error");
                if (simSolEmail) simSolEmail.classList.add('error-field');
                return;
            }

            if (eVal !== ecVal) {
                showNotification("Los correos electrónicos ingresados no coinciden.", "error");
                if (simSolEmailConfirm) simSolEmailConfirm.classList.add('error-field');
                return;
            }

            showSimCheckoutScreen();
        };
    }

    function showSimCheckoutScreen() {
        const mainGrid = document.getElementById('sim-main-grid');
        if (mainGrid) mainGrid.style.display = 'none';
        
        const checkoutItems = document.getElementById('sim-checkout-items');
        if (checkoutItems) {
            checkoutItems.innerHTML = `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>${state.simActiveCertName}</strong></td>
                    <td style="padding: 12px 0;">${state.simCartRUT}</td>
                    <td style="padding: 12px 0; text-align: right; color: #28a745; font-weight: bold;">$0</td>
                </tr>
            `;
        }

        const checkoutScreen = document.getElementById('sim-checkout-screen');
        if (checkoutScreen) checkoutScreen.style.display = 'block';

        state.simCurrentStep = 5;
        updateSimulationStepUI();
    }

    // Checkout Back button
    const btnSimCheckoutBack = document.getElementById('btn-sim-checkout-back');
    if (btnSimCheckoutBack) {
        btnSimCheckoutBack.onclick = () => {
            const mainGrid = document.getElementById('sim-main-grid');
            const checkoutScreen = document.getElementById('sim-checkout-screen');
            if (mainGrid) mainGrid.style.display = 'grid';
            if (checkoutScreen) checkoutScreen.style.display = 'none';
            state.simCurrentStep = 4;
            updateSimulationStepUI();
        };
    }

    // Checkout Submit button: Obtener Certificado (Final)
    const btnSimCheckoutSubmit = document.getElementById('btn-sim-checkout-submit');
    if (btnSimCheckoutSubmit) {
        btnSimCheckoutSubmit.onclick = () => {
            const successTitle = document.querySelector('#screen-success h1');
            const successSubtitle = document.querySelector('#screen-success .subtitle');
            const successDesc = document.querySelector('#screen-success .success-actions p');
            const btnFinish = document.getElementById('btn-finish');

            if (successTitle) successTitle.innerHTML = '¡Simulación Completada con Éxito! 🎉';
            if (successSubtitle) successSubtitle.innerText = `¡Felicitaciones! Ha aprendido a obtener su ${state.simActiveCertName}.`;
            
            const solEmail = document.getElementById('sim-sol-email');
            const emailVal = solEmail ? solEmail.value : 'su correo';
            if (successDesc) successDesc.innerHTML = `Usted simuló correctamente todos los pasos de la página del Registro Civil. Su certificado (simulado) ha sido enviado al correo <strong>${emailVal}</strong>.`;
            
            if (btnFinish) {
                btnFinish.innerText = 'Volver al Registro Civil';
                const oldFinishClick = btnFinish.onclick;
                btnFinish.onclick = (e) => {
                    e.preventDefault();
                    if (successTitle) successTitle.innerHTML = '¡Trámite Exitoso!';
                    if (successSubtitle) successSubtitle.innerText = 'Su certificado ha sido procesado correctamente.';
                    if (successDesc) successDesc.innerHTML = 'Se ha enviado una copia a su correo electrónico.';
                    btnFinish.innerText = 'Volver al Inicio';
                    btnFinish.onclick = oldFinishClick;
                    
                    showScreen('rcCategories');
                };
            }

            showScreen('success');
        };
    }
}
