import { state }                from '../core/state.js';
import { showScreen, goBack, getScreen } from '../core/navigation.js';
import { getFemaleLatamVoice } from '../core/speech.js';
import { selectRCCategory }    from './tutorial.js';
import { showNotification }    from '../utils/notifications.js';

// -------------------------------------------------------------------
// Texto contextual de cada pantalla (usado por handleCommand y narración)
// -------------------------------------------------------------------
function getScreenText(screenKey) {
    if (screenKey === 'rcTutorial') {
        const step = state.currentTutorialSteps[state.currentStepIndex];
        return step ? `${step.title}. ${step.text}` : 'Cargando tutorial...';
    }
    const screen = getScreen(screenKey);
    if (!screen) return 'No tengo información de esta pantalla.';

    let text = '';
    const h1       = screen.querySelector('h1') || screen.querySelector('h2');
    const subtitle = screen.querySelector('.subtitle') || screen.querySelector('p');
    if (h1)       text += h1.innerText + '. ';
    if (subtitle) text += subtitle.innerText + '. ';

    if (screenKey === 'login')   text += 'Ingrese su RUT y su contraseña. ';
    if (screenKey === 'menu')    text += 'Elija una opción del menú.';
    if (screenKey === 'form')    text += 'Seleccione el certificado que necesita.';
    if (screenKey === 'confirm') text += 'Revise los datos y confirme.';
    if (screenKey === 'success') text += 'Trámite completado con éxito.';
    return text;
}

// -------------------------------------------------------------------
// Objeto principal del asistente
// -------------------------------------------------------------------
export const assistant = {
    bubble:   null,
    icon:     null,
    mainBtn:  null,
    chatInput: null,
    chatSendBtn: null,
    synth:    window.speechSynthesis,
    recognition:  null,
    isListening:  false,
    state:        null,  // null | 'confirming_rut' | 'confirming_cert'
    pendingData:  null,
    _narrateTimer: null,
    bubbleTimeout: null,

    certificateKnowledge: [
        { id: 'afiliacion',   type: 'fonasa', name: 'Certificado de Afiliación',     desc: 'acredita que usted está en FONASA actualmente',                              keywords: ['afiliación','afiliado','pertenezco','salud','fonasa','papel azul','inscrito','isapre no','pertenecer'] },
        { id: 'cotizaciones', type: 'fonasa', name: 'Certificado de Cotizaciones',   desc: 'muestra sus pagos de salud de los últimos meses',                            keywords: ['pagos','platas','plata','dinero','cotización','cotizaciones','descuentos','sueldo','cuánto tengo','ahorros','pagado'] },
        { id: 'nacimiento',   type: 'rc',     name: 'Certificado de Nacimiento',     desc: 'documento que acredita su nacimiento y datos de sus padres',                 keywords: ['nacimiento','nacer','naci','parto','bebé','bebe','hijo','hija','nació'] },
        { id: 'matrimonio',   type: 'rc',     name: 'Certificado de Matrimonio',     desc: 'documento que acredita su estado civil de casado o casada',                  keywords: ['matrimonio','casado','casada','boda','casamiento','pareja','estado civil'] },
        { id: 'defuncion',    type: 'rc',     name: 'Certificado de Defunción',      desc: 'documento que acredita el fallecimiento de una persona',                    keywords: ['defunción','defuncion','defunci','muerte','fallecido','fallecimiento','falleci','muerto','velorio','difunto','finado','óbito'] },
        { id: 'antecedentes', type: 'rc',     name: 'Certificado de Antecedentes',   desc: 'muestra si usted tiene registros penales. Requiere Clave Única.',           keywords: ['antecedentes','antecedente','penales','penal','policía','carcel','limpio','conducta','registro policial'] },
        { id: 'vehiculos',    type: 'rc',     name: 'Certificados de Vehículos',     desc: 'muestra multas, anotaciones y datos del dueño del vehículo',                keywords: ['vehículo','vehiculo','auto','carro','patente','multa','tránsito','transito','anotaciones','camión','camion','moto','automovil','vehículo','permiso circulación'] },
        { id: 'identidad',    type: 'rc',     name: 'Certificados de Identidad',     desc: 'documentos relacionados con su cédula de identidad y pasaporte',            keywords: ['identidad','cédula','cedula','carnet','pasaporte','renovar carnet','documento de identidad','cédula de identidad','ci'] }
    ],

    formatNumbersForSeniors(str) {
        if (!str) return '';
        return str.split('').join(', ').replace(/-/g, ' guion ');
    },

    init() {
        this.bubble     = document.getElementById('assistant-bubble');
        this.icon       = document.getElementById('assistant-icon');
        this.mainBtn    = document.getElementById('btn-assistant-main');
        this.chatInput  = document.getElementById('assistant-chat-input');
        this.chatSendBtn= document.getElementById('btn-assistant-send');

        this.chatSendBtn?.addEventListener('click', () => {
            const text = this.chatInput.value.trim();
            if (text) { this.handleCommand(text, false); this.chatInput.value = ''; }
        });

        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.chatSendBtn.click();
        });

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang            = 'es-CL';
            this.recognition.continuous      = true;
            this.recognition.interimResults  = true;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.icon?.parentElement.classList.add('listening');
                this.showBubble('Te escucho... ¿Qué necesitas?');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.icon?.parentElement.classList.remove('listening');
            };

            this.recognition.onerror = (e) => {
                if (e.error === 'not-allowed' || e.error === 'permission-denied') {
                    setInputMode('text');
                    localStorage.removeItem('micPermissionGranted');
                    this.showBubble('No se pudo acceder al micrófono. Puede seguir escribiendo normalmente.');
                } else if (e.error !== 'aborted') {
                    this.showBubble('No pude escucharte bien. ¿Podrías repetir?');
                }
            };

            this.recognition.onresult = (event) => {
                let finalTranscript   = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript   += event.results[i][0].transcript;
                    else                          interimTranscript += event.results[i][0].transcript;
                }
                if (interimTranscript) this.showBubble('"' + interimTranscript + '"', true);
                if (finalTranscript) {
                    const cmd = finalTranscript.trim();
                    this.showBubble('"' + cmd + '"', true);
                    this.handleCommand(cmd, true);
                    this.recognition.stop();
                }
            };

            this.mainBtn?.addEventListener('click', () => {
                const mode = localStorage.getItem('inputMode') || 'text';
                if (mode === 'voice') {
                    if (this.isListening) this.recognition.stop();
                    else { try { this.recognition.start(); } catch (_) {} }
                } else {
                    if (this.bubble) {
                        const visible = this.bubble.style.display === 'block';
                        this.bubble.style.display = visible ? 'none' : 'block';
                        if (!visible) document.getElementById('assistant-chat-input')?.focus();
                    }
                }
            });
        }
    },

    showBubble(text, isUser = false) {
        const textEl = document.getElementById('assistant-text');
        if (!this.bubble || !textEl) return;
        textEl.innerText = text;
        this.bubble.style.display = 'block';
        this.bubble.classList.toggle('user-msg', isUser);

        clearTimeout(this.bubbleTimeout);
        this.bubbleTimeout = setTimeout(() => {
            if (!this.synth.speaking && this.bubble && document.activeElement !== this.chatInput) {
                this.bubble.style.display = 'none';
            }
        }, 8000);
    },

    say(text, callback) {
        this.showBubble(text, false);
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang  = 'es-CL';
        utter.rate  = state.speechRate;
        const voice = getFemaleLatamVoice();
        if (voice) utter.voice = voice;

        utter.onstart = () => { if (this.icon) this.icon.classList.add('speaking'); };
        utter.onend   = () => {
            if (this.icon) this.icon.classList.remove('speaking');
            if (callback) callback();
        };

        window.speechSynthesis.speak(utter);
    },

    narrateCurrentScreen() {
        if (this.synth.speaking) return;
        const screenTexts = {
            landing:      'Bienvenido al portal de trámites. Puede elegir obtener un certificado del Registro Civil, o explorar los servicios de ChileAtiende.',
            login:        'Pantalla de inicio de sesión. Por favor ingrese su RUN en el primer campo, y su Clave Única en el segundo. Luego presione el botón Autenticar.',
            menu:         'Menú principal. Tiene tres opciones: Obtener Certificado, Guía del Registro Civil, o Guía de ChileAtiende.',
            form:         'Selección de certificado. Elija entre el Certificado de Afiliación, que acredita que está en FONASA, o el de Cotizaciones, que muestra sus pagos de salud. Luego presione Siguiente paso.',
            confirm:      'Pantalla de confirmación. Revise bien su información. Si todo está correcto, presione el botón que dice: Sí, Confirmar Trámite.',
            success:      '¡Trámite exitoso! Su certificado fue procesado correctamente y se enviará a su correo electrónico.',
            tutorial:     'Centro de ayuda. Aquí encontrará información sobre qué es la Clave Única, cómo usar el teclado, cómo cuidarse en internet, y el compromiso de accesibilidad de esta plataforma.',
            rcCategories: 'Servicios del Registro Civil. Elija una categoría: Nacimiento, Matrimonio, Defunción, Antecedentes, Vehículos, o Identidad.',
            caCategories: 'Servicios de ChileAtiende. Puede consultar: Mi Registro Social de Hogares, Mis Pagos de Beneficios Sociales, Mis Capacitaciones, Mi Información Previsional, o Mi Seguro Social.',
        };

        if (state.currentScreenKey === 'rcTutorial') {
            const step = state.currentTutorialSteps[state.currentStepIndex];
            if (step) this.say(step.title + '. ' + step.text);
            return;
        }

        const text = screenTexts[state.currentScreenKey];
        if (text) this.say(text);
    },

    handleCommand(cmdRaw, isVoice = false) {
        const cmd = cmdRaw.toLowerCase();

        // Estado: confirmando RUT
        if (this.state === 'confirming_rut') {
            if (cmd.includes('sí') || cmd.includes('si') || cmd.includes('correcto') || cmd.includes('está bien') || cmd.includes('bueno')) {
                document.getElementById('rut').value = this.pendingData;
                this.say('Perfecto. He anotado su RUT. Ahora, si desea, puede decirme su clave.');
                this.state = null; this.pendingData = null;
                return;
            }
            if (cmd.includes('no') || cmd.includes('incorrecto') || cmd.includes('está mal') || cmd.includes('borra')) {
                this.say('Oh, mil disculpas. Por favor, dígame su RUT nuevamente para corregirlo.');
                this.state = null; this.pendingData = null;
                return;
            }
            const correctionMatch = cmd.match(/(?:cambia|no es|en vez de|era|es un)\s*(?:el|un)?\s*(\d+)\s*(?:por|es|era)\s*(?:el|un)?\s*(\d+)/i);
            if (correctionMatch) {
                const [, oldDigit, newDigit] = correctionMatch;
                if (this.pendingData.includes(oldDigit)) {
                    this.pendingData = this.pendingData.replace(oldDigit, newDigit);
                    this.say(`Entendido. He cambiado el ${oldDigit} por el ${newDigit}. Ahora el RUT es: ${this.formatNumbersForSeniors(this.pendingData)}. ¿Es correcto ahora?`, () => {
                        if (isVoice && !this.isListening) this.recognition.start();
                    });
                } else {
                    this.say(`No encontré el número ${oldDigit} en lo que anoté. ¿Podría repetirme el RUT completo por favor?`);
                    this.state = null; this.pendingData = null;
                }
                return;
            }
        }

        // Estado: confirmando certificado
        if (this.state === 'confirming_cert') {
            if (cmd.includes('sí') || cmd.includes('si') || cmd.includes('correcto') || cmd.includes('está bien')) {
                const cert = this.pendingData;
                this.state = null; this.pendingData = null;
                this.say(`Excelente decisión. Estoy preparando su ${cert.name}.`);
                const rad = document.querySelector(`input[value="${cert.id}"]`);
                if (rad) rad.checked = true;
                document.getElementById('confirm-type').innerText = cert.name;
                showScreen('confirm');
                return;
            }
            if (cmd.includes('no') || cmd.includes('otro') || cmd.includes('incorrecto')) {
                this.say('Entendido. ¿Qué certificado necesita entonces? Puedo buscar el de Afiliación o el de Cotizaciones.');
                this.state = null; this.pendingData = null;
                return;
            }
        }

        // Saludo
        const commonGreetings = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'asistente'];
        const isGreetingOnly  = commonGreetings.includes(cmd) || (cmd.startsWith('hola') && cmd.length < 10);
        if (isGreetingOnly) { this.say('Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'); return; }

        // Ayuda contextual
        const helpTriggers = ['ayuda','qué hago','explica','explicar','entiende','entiendo','instrucción','qué hay que hacer','qué dice'];
        if (helpTriggers.some(t => cmd.includes(t))) {
            if (state.currentScreenKey === 'rcTutorial') {
                const step = state.currentTutorialSteps[state.currentStepIndex];
                if (step) { this.say(`Estamos en el paso ${state.currentStepIndex + 1} de su trámite. El título es ${step.title}. La instrucción para usted es: ${step.text}`); return; }
            }
            this.say('Con gusto. En esta pantalla: ' + getScreenText(state.currentScreenKey));
            return;
        }

        // Navegación
        if (cmd.includes('inicio') || cmd.includes('salir') || cmd.includes('cerrar')) {
            this.say('Volviendo al inicio.');
            document.getElementById('btn-logout')?.click() || showScreen('login');
            return;
        }
        if (cmd.includes('atrás') || cmd.includes('volver')) { this.say('Entendido, volvamos atrás.'); goBack(); return; }
        if (cmd.includes('continuar') || cmd.includes('siguiente') || cmd.includes('aceptar')) {
            const nextBtn = document.querySelector('.screen.active .btn.primary');
            if (nextBtn) { this.say('Avanzando al siguiente paso.'); nextBtn.click(); }
            else this.say('No encontré un botón para continuar en esta pantalla.');
            return;
        }

        // Pantalla de login
        if (state.currentScreenKey === 'login') {
            if (cmd.includes('rut')) {
                const matches = cmd.match(/[\dk]+/gi);
                if (matches) {
                    const val = matches.join('').toUpperCase();
                    this.pendingData = val;
                    this.state = 'confirming_rut';
                    this.say(`He entendido que su RUT es: ${this.formatNumbersForSeniors(val)}. ¿Es esto correcto?`, () => {
                        if (isVoice && !this.isListening) this.recognition.start();
                    });
                    return;
                }
            }
            if (cmd.includes('clave') || cmd.includes('contraseña')) {
                let passwordPart = cmdRaw.split(/(?:clave|contraseña)\s*(?:es|es)?\s*/i)[1] || '';
                if (passwordPart) {
                    const symbols = { punto:'.', coma:',', arroba:'@', guion:'-', guión:'-', bajo:'_', asterisco:'*', gato:'#', pesos:'$', exclamación:'!', interrogación:'?' };
                    let cleanPass = passwordPart.trim();
                    Object.keys(symbols).forEach(key => {
                        cleanPass = cleanPass.replace(new RegExp('\\b' + key + '\\b', 'gi'), symbols[key]);
                    });
                    cleanPass = cleanPass
                        .replace(/mayúscula\s*(\w)/gi, (_, p1) => p1.toUpperCase())
                        .replace(/minúscula\s*(\w)/gi, (_, p1) => p1.toLowerCase())
                        .replace(/\s+/g, '');
                    document.getElementById('password').value = cleanPass;
                    this.say('He ingresado tu clave. He quitado los espacios y aplicado las mayúsculas que me pediste.');
                    return;
                }
            }
            if (cmd.includes('entrar') || cmd.includes('ingresar')) { document.getElementById('btn-login').click(); return; }
        }

        // Navegación global a secciones principales
        const goToCA = cmd.includes('chileatiende') || cmd.includes('chile atiende') || cmd.includes('atiende') ||
                       cmd.includes('beneficio') || cmd.includes('bono') || cmd.includes('subsidio') ||
                       cmd.includes('registro social') || cmd.includes('capacitacion') ||
                       cmd.includes('previsional') || cmd.includes('seguro social') ||
                       cmd.includes('sence') || cmd.includes('pagos del estado');

        const goToRC = cmd.includes('registro civil') || cmd.includes('registrocivil') ||
                       cmd.includes('certif') || cmd.includes('certificado') ||
                       cmd.includes('acta') || cmd.includes('partida');

        if (goToCA && state.currentScreenKey !== 'caCategories' && state.currentScreenKey !== 'rcTutorial') {
            this.say('Entendido. Abriendo los servicios de ChileAtiende.');
            showScreen('caCategories');
            return;
        }
        if (goToRC && !goToCA && state.currentScreenKey !== 'rcCategories' && state.currentScreenKey !== 'rcTutorial') {
            this.say('Claro, aquí tiene los trámites del Registro Civil.');
            showScreen('rcCategories');
            return;
        }

        if (state.currentScreenKey === 'menu' || state.currentScreenKey === 'landing') {
            if (cmd.includes('papel') || cmd.includes('tramite') || cmd.includes('obtener')) {
                this.say('Abriendo sección de certificados del Registro Civil.');
                showScreen('rcCategories');
                return;
            }
        }

        if (state.currentScreenKey === 'form') {
            if (cmd.includes('afiliación')) {
                const rad = document.querySelector('input[value="afiliacion"]');
                if (rad) rad.checked = true;
                this.say('Seleccionado Certificado de Afiliación.');
                return;
            }
            if (cmd.includes('cotizaciones')) {
                const rad = document.querySelector('input[value="cotizaciones"]');
                if (rad) rad.checked = true;
                this.say('Seleccionado Certificado de Cotizaciones.');
                return;
            }
        }

        // Búsqueda difusa de certificados
        const certKeywords = ['certificado','papel','comprobante','necesito','quiero','dame','obtener','sacar','el de','la de','los de','nacimiento','matrimonio','antecedentes','antecedente','defunci','vehiculo','vehículo','identidad','cedula','cédula','fonasa'];
        if (certKeywords.some(kw => cmd.includes(kw))) {
            let bestMatch = null;
            let maxScore  = 0;
            this.certificateKnowledge.forEach(cert => {
                let score = 0;
                if (cmd.includes(cert.id)) score += 15;
                cert.keywords.forEach(kw => { if (cmd.includes(kw)) score += 5; });
                if (score > maxScore) { maxScore = score; bestMatch = cert; }
            });

            // RC certs tienen nombres únicos: 1 keyword match ya es alta confianza.
            // FONASA certs son más ambiguos: requieren mayor puntaje.
            const directThreshold = bestMatch?.type === 'rc' ? 5 : 10;

            if (bestMatch && maxScore >= directThreshold) {
                this.say(`Perfecto. Preparando de inmediato su ${bestMatch.name}.`);
                setTimeout(() => {
                    if (bestMatch.type === 'rc') {
                        selectRCCategory(bestMatch.id);
                    } else {
                        const rad = document.querySelector(`input[value="${bestMatch.id}"]`);
                        if (rad) rad.checked = true;
                        document.getElementById('confirm-type').innerText = bestMatch.name;
                        showScreen('confirm');
                    }
                }, 100);
                return;
            }
            if (bestMatch && maxScore >= 5) {
                this.pendingData = bestMatch;
                this.state = 'confirming_cert';
                this.say(`Entendido. No encontré uno con ese nombre exacto, pero tengo el ${bestMatch.name}, que ${bestMatch.desc}. ¿Es ese el que necesita?`, () => {
                    if (isVoice && !this.isListening) this.recognition.start();
                });
                return;
            }
            if (cmd.includes('certificado') || cmd.includes('papel') || cmd.includes('trámite')) {
                this.say('No estoy seguro de qué certificado busca. Tengo de Nacimiento, Matrimonio, Antecedentes, o los de Fonasa. ¿Cuál necesita?');
                return;
            }
        }

        if (cmd.includes('letra') && (cmd.includes('grande') || cmd.includes('agrandar'))) {
            document.getElementById('btn-font-plus')?.click();
            return;
        }
        if (cmd.includes('contraste')) { document.getElementById('btn-toggle-contrast')?.click(); return; }

        this.say(`No estoy seguro de cómo ayudarte con '${cmd}'. Prueba decir 'ayuda' para explicarte esta pantalla.`);
    }
};

// -------------------------------------------------------------------
// Modo de entrada (texto / voz)
// -------------------------------------------------------------------
export function setInputMode(mode) {
    localStorage.setItem('inputMode', mode);
    const btnText  = document.getElementById('btn-mode-text');
    const btnVoice = document.getElementById('btn-mode-voice');
    const icon     = document.getElementById('assistant-icon');
    if (btnText)  btnText.classList.toggle('active',  mode === 'text');
    if (btnVoice) btnVoice.classList.toggle('active', mode === 'voice');
    if (icon)     icon.textContent = mode === 'voice' ? '🎤' : '💬';
    if (mode === 'text' && assistant.isListening) assistant.recognition?.stop();
}

function showMicGuide() {
    const modal = document.getElementById('modal-mic-guide');
    if (modal) modal.style.display = 'block';
    assistant.say("Por favor, presiona el botón azul de 'Permitir' que aparece arriba para poder escucharte.");
}

function hideMicGuide() {
    const modal = document.getElementById('modal-mic-guide');
    if (modal) modal.style.display = 'none';
}

export function initAssistant() {
    assistant.init();

    // Restaurar modo guardado
    setInputMode(localStorage.getItem('inputMode') || 'text');

    // Botones de modo texto/voz
    document.getElementById('btn-mode-text')?.addEventListener('click', () => setInputMode('text'));

    document.getElementById('btn-mode-voice')?.addEventListener('click', async () => {
        if (!assistant.recognition) {
            showNotification('Tu navegador no soporta comandos de voz. Usa el chat de texto.', 'warning');
            return;
        }

        // Detectar si el navegador ya tiene el permiso otorgado (sesión anterior o via API)
        let alreadyGranted = localStorage.getItem('micPermissionGranted') === 'true';
        if (!alreadyGranted && navigator.permissions) {
            try {
                const result = await navigator.permissions.query({ name: 'microphone' });
                if (result.state === 'granted') {
                    localStorage.setItem('micPermissionGranted', 'true');
                    alreadyGranted = true;
                }
            } catch (_) {}
        }

        if (!alreadyGranted) {
            showMicGuide();
        } else {
            setInputMode('voice');
            if (!assistant.isListening) { try { assistant.recognition.start(); } catch (_) {} }
        }
    });

    // Modal de guía de micrófono
    const micModal  = document.getElementById('modal-mic-guide');
    const closeBtn  = micModal?.querySelector('.close-modal');
    if (closeBtn) closeBtn.onclick = hideMicGuide;
    window.onclick = (event) => { if (event.target === micModal) hideMicGuide(); };

    document.getElementById('btn-choose-text')?.addEventListener('click', () => {
        localStorage.setItem('micPermissionGranted', 'true');
        setInputMode('text');
        hideMicGuide();
    });

    document.getElementById('btn-choose-voice')?.addEventListener('click', () => {
        localStorage.setItem('micPermissionGranted', 'true');
        setInputMode('voice');
        hideMicGuide();
        if (assistant.recognition && !assistant.isListening) {
            try { assistant.recognition.start(); } catch (_) {}
        }
    });

    // Botón asistente FONASA (llamada en video)
    document.getElementById('btn-call-asistente')?.addEventListener('click', () => {
        showNotification('Conectando con un asistente de FONASA en video-llamada... Por favor, espere un momento.', 'info');
    });
}
