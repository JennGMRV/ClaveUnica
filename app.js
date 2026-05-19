document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Notification System ---
    window.showNotification = function(message, type = 'info') {
        let container = document.getElementById('custom-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'custom-toast-container';
            container.className = 'custom-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'error') icon = '⚠️';
        if (type === 'success') icon = '✅';

        toast.innerHTML = `
            <div class="custom-toast-icon">${icon}</div>
            <div class="custom-toast-message">${message}</div>
            <button class="custom-toast-close">✖</button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.custom-toast-close');
        
        const removeToast = () => {
            if (toast.classList.contains('hiding')) return;
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentElement) toast.parentElement.removeChild(toast);
            }, 300);
        };

        closeBtn.addEventListener('click', removeToast);
        setTimeout(removeToast, 5000);
    };

    const screens = {
        landing: document.getElementById('screen-landing'),
        login: document.getElementById('screen-login'),
        menu: document.getElementById('screen-menu'),
        form: document.getElementById('screen-form'),
        confirm: document.getElementById('screen-confirm'),
        success: document.getElementById('screen-success'),
        tutorial: document.getElementById('screen-tutorial'),
        rcCategories: document.getElementById('screen-rc-categories'),
        rcTutorial: document.getElementById('screen-rc-tutorial'),
        caCategories: document.getElementById('screen-ca-categories')
    };

    let history = ['landing'];
    let currentScreenKey = 'landing';
    let postLoginTarget = 'menu'; // Default target after login
    let autoReadMode = false; // Modo lector persistente: lee cada pantalla automáticamente

    function showScreen(key, addToHistory = true) {
        // Hide all
        Object.values(screens).forEach(s => s.classList.remove('active'));

        // Show target
        screens[key].classList.add('active');
        currentScreenKey = key;

        if (addToHistory && history[history.length - 1] !== key) {
            history.push(key);
        }

        window.scrollTo(0, 0);
        if (typeof stopSpeaking === 'function') stopSpeaking();
    }

    function goBack() {
        if (history.length > 1) {
            history.pop(); // Remove current
            const prev = history[history.length - 1];
            showScreen(prev, false);
        }
    }

    // --- Backspace logic (The most critical accessibility tool) ---
    window.addEventListener('keydown', (e) => {
        // If the key is Backspace (8)
        if (e.key === 'Backspace' || e.keyCode === 8) {
            const activeElement = document.activeElement;
            const isInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';

            if (!isInput) {
                // Not in an input? Prevents browser default back and uses our safe undo
                e.preventDefault();
                goBack();
            } else if (activeElement.value === '') {
                // In an input but it's empty? Allow going back as a "safe undo"
                e.preventDefault();
                goBack();
            }
        }
    });

    // --- RUT Formatting and Validation ---
    function formatRut(rut) {
        let value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (value.length > 9) {
            value = value.slice(0, 9);
        }
        if (value.length === 0) return '';
        if (value.length > 1) {
            let body = value.slice(0, -1);
            let dv = value.slice(-1);
            body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return body + '-' + dv;
        }
        return value;
    }

    function validateRut(rut) {
        let value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (value.length < 2) return false;
        
        let body = value.slice(0, -1);
        let dv = value.slice(-1);
        
        let sum = 0;
        let multiple = 2;
        
        for (let i = 1; i <= body.length; i++) {
            sum += multiple * parseInt(body.charAt(body.length - i));
            multiple = multiple < 7 ? multiple + 1 : 2;
        }
        
        let expectedDv = 11 - (sum % 11);
        let expectedDvStr = expectedDv === 11 ? '0' : (expectedDv === 10 ? 'K' : expectedDv.toString());
        
        return expectedDvStr === dv;
    }

    const rutInput = document.getElementById('rut');
    const globalPassInput = document.getElementById('password');

    if (rutInput) {
        rutInput.addEventListener('input', function() {
            this.value = formatRut(this.value);
            this.classList.remove('error-field');
        });
    }
    
    if (globalPassInput) {
        globalPassInput.addEventListener('input', function() {
            this.classList.remove('error-field');
        });
    }

    // --- Button Handlers ---

    // Landing -> RC Simulation
    document.getElementById('btn-start-simulation').addEventListener('click', () => {
        showScreen('rcCategories');
    });

    // Landing -> CA Simulation
    document.getElementById('btn-start-ca-simulation').addEventListener('click', () => {
        showScreen('caCategories');
    });

    // Login -> Menu or Simulation Target
    document.getElementById('btn-login').addEventListener('click', () => {
        const rutElement = document.getElementById('rut');
        const passElement = document.getElementById('password');
        const rut = rutElement ? rutElement.value : '';
        const password = passElement ? passElement.value : '';
        
        if (rutElement) rutElement.classList.remove('error-field');
        if (passElement) passElement.classList.remove('error-field');

        let missing = [];
        if (rut.trim() === '') {
            missing.push('RUT');
            if (rutElement) rutElement.classList.add('error-field');
        }
        if (password.trim() === '') {
            missing.push('Contraseña');
            if (passElement) passElement.classList.add('error-field');
        }
        
        if (missing.length > 0) {
            showNotification(`Por favor, ingrese los siguientes campos: ${missing.join(', ')}.`, 'error');
            return;
        }

        if (!validateRut(rut)) {
            showNotification('Por favor, ingrese un RUT válido.', 'error');
            if (rutElement) rutElement.classList.add('error-field');
            return;
        }
        
        // Success: Go to the intended target
        if (postLoginTarget === 'rcTutorial') {
            updateStepUI();
        }
        showScreen(postLoginTarget);
        // Reset postLoginTarget for next time
        postLoginTarget = 'menu';
    });

    // Menu -> Form
    document.getElementById('btn-tramites').addEventListener('click', () => {
        showScreen('form');
    });



    // Back from Tutorial
    document.getElementById('btn-back-tutorial').addEventListener('click', goBack);

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        history = ['login'];
        showScreen('login', false);
    });

    // Form -> Confirm
    document.getElementById('btn-to-confirm').addEventListener('click', () => {
        const selected = document.querySelector('input[name="tramite"]:checked');
        const label = selected.parentElement.querySelector('strong').innerText;
        document.getElementById('confirm-type').innerText = label;
        showScreen('confirm');
    });

    // Back from Form
    document.getElementById('btn-back-form').addEventListener('click', goBack);

    // Confirm -> Success
    document.getElementById('btn-confirm-final').addEventListener('click', () => {
        showScreen('success');
    });

    // Back from Confirm
    document.getElementById('btn-back-confirm').addEventListener('click', goBack);

    // Success -> Login (Finish)
    document.getElementById('btn-finish').addEventListener('click', () => {
        history = ['login'];
        showScreen('login', false);
        // Reset inputs
        document.getElementById('rut').value = '';
        document.getElementById('password').value = '';
    });

    // --- Registro Civil Tutorial Logic ---

    const rcData = {
        categories: {
            nacimiento: {
                title: "Nacimiento",
                certs: [
                    { id: "nac-matricula", name: "Certificado Nacimiento Para Matrícula", cu: false, desc: "Trámite gratuito para procesos escolares." },
                    { id: "nac-asignacion", name: "Certificado Nacimiento Asignación Familiar", cu: false, desc: "Para trámites de beneficios laborales." },
                    { id: "nac-todo", name: "Certificado Nacimiento Todo Trámite", cu: false, desc: "Uso general en cualquier institución." }
                ]
            },
            matrimonio: {
                title: "Matrimonio",
                certs: [
                    { id: "mat-todo", name: "Certificado Matrimonio Todo Trámite", cu: false, desc: "Acredita el estado civil actual." },
                    { id: "mat-asignacion", name: "Certificado Matrimonio Asignación Familiar", cu: false, desc: "Para beneficios de salud o laborales." }
                ]
            },
            antecedentes: {
                title: "Antecedentes",
                certs: [
                    { id: "ant-fines-particulares", name: "Antecedentes Fines Particulares", cu: true, desc: "Para empleos o trámites personales." },
                    { id: "ant-fines-especiales", name: "Antecedentes Fines Especiales", cu: true, desc: "Para trámites legales específicos." }
                ]
            },
            defuncion: {
                title: "Defunción",
                certs: [
                    { id: "def-todo", name: "Certificado Defunción Para Todo Trámite", cu: false, desc: "Acredita el fallecimiento de una persona." },
                    { id: "def-asignacion", name: "Certificado Defunción Asignación Familiar", cu: false, desc: "Para trámites de previsión o herencia." }
                ]
            },
            vehiculos: {
                title: "Vehículos",
                certs: [
                    { id: "veh-anotaciones", name: "Anotaciones Vigentes de Vehículos", cu: false, desc: "Muestra multas y datos del dueño." },
                    { id: "veh-multas", name: "Certificado de Multas de Tránsito", cu: false, desc: "Revisa si tiene deudas de patentes." }
                ]
            }
        },
        steps: {
            "nac-matricula": [
                { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "rc-certs-online.png", highlight: "nacimiento-row" },
                { title: "Paso 2: Elegir Matrícula", text: "Ahora busque el primero de la lista que dice 'Para Matrícula'. Ponga el RUT deseado y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-matricula.png", highlight: "add-to-cart-section-mat" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "nac-asignacion": [
                { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "rc-certs-online.png", highlight: "nacimiento-row" },
                { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el segundo de la lista que dice 'Asignación Familiar'. Ponga el RUT deseado y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-asignacion.png", highlight: "add-to-cart-section-asig" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "mat-todo": [
                { title: "Paso 1: Buscar 'Matrimonio'", text: "Primero, busque donde dice 'Matrimonio' con una flechita azul. Tiene que apretar justo ahí para que se abran los papeles de matrimonio.", visual: "rc-certs-mat-def-list.png", highlight: "matrimonio-row" },
                { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora elija la primera opción 'Todo Trámite'. Escriba el RUT de la persona y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-mat-step2.png", highlight: "add-to-cart-mat-todo" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de matrimonio ya esté en su carrito. Estos certificados también son gratis para usted.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "mat-asignacion": [
                { title: "Paso 1: Buscar 'Matrimonio'", text: "Primero, busque donde dice 'Matrimonio' con una flechita azul. Tiene que apretar justo ahí para que se abran los papeles de matrimonio.", visual: "rc-certs-mat-def-list.png", highlight: "matrimonio-row" },
                { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el segundo de la lista que dice 'Asignación Familiar'. Escriba el RUT de la persona y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-mat-step2.png", highlight: "add-to-cart-mat-asig" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de matrimonio ya esté en su carrito. Estos certificados también son gratis para usted.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "def-todo": [
                { title: "Paso 1: Buscar 'Defunciones'", text: "Primero, busque donde dice 'Defunciones' con una flechita azul. Tiene que apretar justo ahí para ver las opciones.", visual: "rc-certs-mat-def-list.png", highlight: "defunciones-row" },
                { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora elija la opción 'Para Todo Trámite'. Escriba el RUT de la persona fallecida y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-def-step2.png", highlight: "add-to-cart-def-todo" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de defunción ya esté en su carrito. Es totalmente gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "def-asignacion": [
                { title: "Paso 1: Buscar 'Defunciones'", text: "Primero, busque donde dice 'Defunciones' con una flechita azul. Tiene que apretar justo ahí para ver las opciones.", visual: "rc-certs-mat-def-list.png", highlight: "defunciones-row" },
                { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el que dice 'Asignación Familiar'. Escriba el RUT de la persona fallecida y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-def-step2.png", highlight: "add-to-cart-def-asig" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de defunción ya esté en su carrito. Es totalmente gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "nac-todo": [
                { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "rc-certs-online.png", highlight: "nacimiento-row" },
                { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora aparecerá un recuadro abajo. Escriba el RUT deseado y después apriete el botón azul que tiene un dibujo de un carrito y dice 'Agregar al Carro'.", visual: "rc-certs-step2.png", highlight: "add-to-cart-section" },
                { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
                { 
                    title: "Paso 4: Poner sus datos", 
                    text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", 
                    visual: "rc-certs-solicitante.png", 
                    highlight: "solicitante-section",
                    secondaryVisual: "chilean-id-example.png",
                    secondaryHighlight: "id-doc-number"
                },
                { 
                    title: "Paso 5: Apretar en Continuar", 
                    text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", 
                    visual: "rc-certs-filled.png", 
                    highlight: "continue-btn" 
                },
                { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
            ],
            "ant-fines-particulares": [
                { title: "Paso 1: Entrar al Sitio", text: "Vaya a la página www.registrocivil.cl y busque la opción 'Servicios en línea'.", visual: "🏠 Pantalla principal del Registro Civil." },
                { title: "Paso 2: Elegir Certificado", text: "Haga clic en 'Antecedentes' y luego en 'Antecedentes Fines Particulares'.", visual: "🖱️ Clic en el botón azul." },
                { title: "Paso 3: Identificación", text: "Este trámite requiere su Clave Única. Ingrese su RUT en el primer recuadro.", visual: "👤 Campo de RUT resaltado." },
                { title: "Paso 4: Su Clave Única", text: "Ahora ingrese su contraseña secreta. Si no la recuerda, presione el signo de pregunta al lado.", visual: "🔑 Campo de Contraseña resaltado." },
                { title: "Paso 5: Descarga", text: "Presione 'Autenticar' y su certificado llegará a su correo electrónico en unos segundos.", visual: "📧 Icono de correo enviado." }
            ]
        }
    };

    const caData = {
        'registro-social': {
            name: 'Mi Registro Social de Hogares',
            steps: [
                { title: "Paso 1: Entrar a la página de ChileAtiende", text: "Abra el navegador y vaya a la página www.chileatiende.gob.cl. Verá el logo de ChileAtiende arriba y un recuadro blanco a la derecha que dice 'Para acceder, ingresa con tu ClaveÚnica'. Apriete el botón azul que dice 'Iniciar sesión'.", visual: "🌐 Página principal de Mi ChileAtiende con el botón azul 'Iniciar sesión'." },
                { title: "Paso 2: Ingresar su RUN y Clave Única", text: "Aparecerá un formulario con el título 'miChileAtiende'. Escriba su RUN en el primer recuadro y su Clave Única en el segundo. Luego apriete el botón azul grande que dice 'INGRESA'.", visual: "🔑 Formulario con campos de RUN y ClaveÚnica, y botón INGRESA." },
                { title: "Paso 3: Elegir el servicio desde el menú lateral", text: "Una vez adentro verá su nombre arriba y un menú a la izquierda llamado 'Mis accesos'. Busque y apriete donde dice 'Mi Registro Social de Hogares'. También puede apretarlo desde las tarjetas del centro de la pantalla.", visual: "📋 Menú lateral 'Mis accesos' con la opción Mi Registro Social de Hogares." },
                { title: "Paso 4: Ver su Calificación Socioeconómica", text: "Verá la sección 'Calificación socioeconómica' con una barra de colores. Ahí aparece en qué porcentaje está su hogar entre todos los hogares de Chile, y si está más cerca de mayor o menor vulnerabilidad.", visual: "📊 Barra de calificación socioeconómica con el porcentaje del hogar." },
                { title: "Paso 5: Obtener la Cartola del Hogar e Integrantes", text: "Más abajo verá el recuadro 'Cartola Hogar'. Apriete el botón azul 'Obtener cartola' para descargar el documento. Al final de la página está la sección 'Integrantes de mi hogar' con las personas registradas en su hogar.", visual: "📄 Recuadro Cartola Hogar y tarjetas de integrantes del hogar." }
            ]
        },
        'pagos-beneficios': {
            name: 'Mis Pagos de Beneficios Sociales',
            steps: [
                { title: "Paso 1: Entrar a la página de ChileAtiende", text: "Abra el navegador y vaya a la página www.chileatiende.gob.cl. Verá un recuadro blanco a la derecha que dice 'Para acceder, ingresa con tu ClaveÚnica'. Apriete el botón azul 'Iniciar sesión'.", visual: "🌐 Página principal de Mi ChileAtiende con el botón azul 'Iniciar sesión'." },
                { title: "Paso 2: Ingresar su RUN y Clave Única", text: "Aparecerá un formulario con el título 'miChileAtiende'. Escriba su RUN en el primer recuadro y su Clave Única en el segundo. Luego apriete el botón azul grande que dice 'INGRESA'.", visual: "🔑 Formulario con campos de RUN y ClaveÚnica, y botón INGRESA." },
                { title: "Paso 3: Elegir el servicio desde el menú lateral", text: "Una vez adentro verá el menú 'Mis accesos' a la izquierda. Apriete donde dice 'Mis pagos de beneficios sociales'. También puede apretarlo desde las tarjetas del centro de la pantalla. Este servicio lo entrega el Instituto de Previsión Social.", visual: "📋 Menú lateral con la opción Mis pagos de beneficios sociales." },
                { title: "Paso 4: Revisar sus pagos", text: "La página le mostrará sus pagos de pensión o beneficios a cargo del IPS. Si el Estado le ha pagado algún bono o subsidio, aparecerá aquí con la fecha y el monto recibido.", visual: "💰 Lista de pagos de pensión y beneficios del IPS con fechas y montos." },
                { title: "Paso 5: Si no aparece ningún pago", text: "Si sale el mensaje 'No encontramos pagos de beneficios sociales a tu nombre', no se preocupe, no es un error. Significa que por ahora el IPS no registra pagos a su nombre. El sistema le avisará cuando haya novedades.", visual: "ℹ️ Mensaje informativo cuando no hay pagos registrados por el IPS." }
            ]
        },
        'capacitaciones': {
            name: 'Mis Capacitaciones',
            steps: [
                { title: "Paso 1: Entrar a la página de ChileAtiende", text: "Abra el navegador y vaya a la página www.chileatiende.gob.cl. Verá un recuadro blanco a la derecha que dice 'Para acceder, ingresa con tu ClaveÚnica'. Apriete el botón azul 'Iniciar sesión'.", visual: "🌐 Página principal de Mi ChileAtiende con el botón azul 'Iniciar sesión'." },
                { title: "Paso 2: Ingresar su RUN y Clave Única", text: "Aparecerá un formulario con el título 'miChileAtiende'. Escriba su RUN en el primer recuadro y su Clave Única en el segundo. Luego apriete el botón azul grande que dice 'INGRESA'.", visual: "🔑 Formulario con campos de RUN y ClaveÚnica, y botón INGRESA." },
                { title: "Paso 3: Elegir el servicio desde el menú lateral", text: "Una vez adentro verá el menú 'Mis accesos' a la izquierda. Apriete donde dice 'Mis capacitaciones'. También puede apretarlo desde las tarjetas del centro. Este servicio lo entrega el SENCE, el Servicio Nacional de Capacitación y Empleo.", visual: "📋 Menú lateral con la opción Mis capacitaciones." },
                { title: "Paso 4: Ver sus cursos registrados", text: "La página mostrará todos los cursos, talleres o diplomados que ha realizado a través del SENCE. Aparecerá el nombre del curso, la institución donde lo hizo y la fecha en que lo realizó.", visual: "📚 Lista de cursos, talleres y diplomados realizados a través de SENCE." },
                { title: "Paso 5: Si no aparece ningún curso", text: "Si sale el mensaje 'Aún no tienes cursos registrados en SENCE', no tiene cursos en el sistema. Puede apretar el botón 'Ir al sitio web de SENCE' para ver cursos y capacitaciones gratuitas disponibles para usted.", visual: "ℹ️ Mensaje cuando no hay cursos, con botón para ir al sitio de SENCE." }
            ]
        },
        'informacion-previsional': {
            name: 'Mi Información Previsional',
            steps: [
                { title: "Paso 1: Entrar a la página de ChileAtiende", text: "Abra el navegador y vaya a la página www.chileatiende.gob.cl. Verá un recuadro blanco a la derecha que dice 'Para acceder, ingresa con tu ClaveÚnica'. Apriete el botón azul 'Iniciar sesión'.", visual: "🌐 Página principal de Mi ChileAtiende con el botón azul 'Iniciar sesión'." },
                { title: "Paso 2: Ingresar su RUN y Clave Única", text: "Aparecerá un formulario con el título 'miChileAtiende'. Escriba su RUN en el primer recuadro y su Clave Única en el segundo. Luego apriete el botón azul grande que dice 'INGRESA'.", visual: "🔑 Formulario con campos de RUN y ClaveÚnica, y botón INGRESA." },
                { title: "Paso 3: Elegir el servicio desde el menú lateral", text: "Una vez adentro verá el menú 'Mis accesos' a la izquierda. Apriete donde dice 'Mi información previsional'. También puede apretarlo desde las tarjetas del centro. Este servicio lo entrega el Ministerio del Trabajo y Previsión Social.", visual: "📋 Menú lateral con la opción Mi información previsional." },
                { title: "Paso 4: Ver la sección AFP", text: "Verá la sección 'AFP' que muestra su fecha de afiliación, cuál es su AFP actual y los datos de su Cuenta de Capitalización Individual. Ojo: estos datos pueden tener hasta 30 días de desfase. Más abajo verá la sección 'Seguridad laboral'.", visual: "📊 Sección AFP con fecha de afiliación y datos de la cuenta individual." },
                { title: "Paso 5: Si no aparece información de AFP", text: "Si sale un aviso que dice 'No existen registros de afiliación a una AFP', no es un error. Puede ser porque usted pertenece a otro sistema como Capredena, Dipreca o las ex Cajas de Previsión Social. Si alguna sección no carga, inténtelo más tarde.", visual: "ℹ️ Aviso cuando el sistema previsional es distinto a una AFP privada." }
            ]
        },
        'seguro-social': {
            name: 'Mi Seguro Social',
            steps: [
                { title: "Paso 1: Entrar a la página de ChileAtiende", text: "Abra el navegador y vaya a la página www.chileatiende.gob.cl. Verá un recuadro blanco a la derecha que dice 'Para acceder, ingresa con tu ClaveÚnica'. Apriete el botón azul 'Iniciar sesión'.", visual: "🌐 Página principal de Mi ChileAtiende con el botón azul 'Iniciar sesión'." },
                { title: "Paso 2: Ingresar su RUN y Clave Única", text: "Aparecerá un formulario con el título 'miChileAtiende'. Escriba su RUN en el primer recuadro y su Clave Única en el segundo. Luego apriete el botón azul grande que dice 'INGRESA'.", visual: "🔑 Formulario con campos de RUN y ClaveÚnica, y botón INGRESA." },
                { title: "Paso 3: Elegir el servicio desde el menú lateral", text: "Una vez adentro verá el menú 'Mis accesos' a la izquierda. Apriete donde dice 'Mi Seguro Social'. También puede apretarlo desde las tarjetas del centro. Este servicio lo entrega el Instituto de Previsión Social.", visual: "📋 Menú lateral con la opción Mi Seguro Social." },
                { title: "Paso 4: Ver sus cotizaciones al Seguro Social", text: "Verá la sección 'Cotizaciones al Seguro Social'. Este seguro no es lo mismo que su AFP: este dinero lo paga su empleador y sirve para mejorar las pensiones actuales y futuras. Si trabaja independiente, puede pagarlo voluntariamente.", visual: "🛡️ Sección de cotizaciones al Seguro Social con explicación del beneficio." },
                { title: "Paso 5: Si no aparecen cotizaciones", text: "Si sale el mensaje 'Todavía no registras cotizaciones en este Seguro', puede ser que aún no se haya actualizado el pago más reciente. Puede apretar el botón 'Revisar información' para aprender más sobre qué es el Seguro Social y cómo funciona.", visual: "ℹ️ Mensaje cuando no hay cotizaciones, con botón 'Revisar información'." }
            ]
        }
    };

    let currentTutorialSteps = [];
    let currentStepIndex = 0;
    let currentTutorialOrigin = 'rcCategories';

    // Menu -> RC Categories
    document.getElementById('btn-rc-guide').addEventListener('click', () => {
        showScreen('rcCategories');
    });

    document.getElementById('btn-back-rc').addEventListener('click', goBack);
    document.getElementById('btn-back-rc-tutorial').addEventListener('click', () => {
        if (currentStepIndex > 0) {
            document.getElementById('modal-exit-tutorial').style.display = 'block';
        } else {
            goBack();
        }
    });

    // Menu -> CA Categories
    document.getElementById('btn-ca-guide').addEventListener('click', () => {
        showScreen('caCategories');
    });
    document.getElementById('btn-back-ca').addEventListener('click', goBack);

    // CA Service Click Handling
    document.querySelectorAll('.ca-service-item').forEach(item => {
        item.addEventListener('click', () => {
            const serviceId = item.getAttribute('data-service');
            const service = caData[serviceId];
            if (service) {
                currentTutorialOrigin = 'caCategories';
                currentTutorialSteps = service.steps;
                currentStepIndex = 0;
                updateStepUI();
                showScreen('rcTutorial');
            }
        });
    });

    function selectRCCategory(catId) {
        const cat = rcData.categories[catId];
        if (cat) {
            showScreen('rcCategories');
            
            // 1. Highlight active card immediately
            document.querySelectorAll('.rc-category-card').forEach(c => c.classList.remove('active'));
            const card = document.querySelector(`.rc-category-card[data-cat="${catId}"]`);
            if (card) card.classList.add('active');

            // 2. Populate and show sublist immediately
            const sublist = document.getElementById('rc-certs-sublist');
            const title = document.getElementById('rc-selected-cat-title');
            const container = document.getElementById('rc-certs-items');
            
            title.innerText = "Certificados de " + cat.title;
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
                    if (cert.cu) {
                        postLoginTarget = 'rcTutorial';
                        currentTutorialOrigin = 'rcCategories';
                        currentTutorialSteps = rcData.steps[cert.id] || [];
                        currentStepIndex = 0;
                        showScreen('login');
                    } else {
                        startTutorial(cert.id, cert.name);
                    }
                };
                container.appendChild(item);
            });
            
            sublist.style.display = 'block';
            
            // 3. Scroll after a short delay to ensure layout is ready
            setTimeout(() => {
                sublist.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else {
            showNotification("Esta categoría estará disponible próximamente.", "info");
        }
    }

    // Category Click Handling
    document.querySelectorAll('.rc-category-card').forEach(card => {
        card.addEventListener('click', () => {
            const catId = card.getAttribute('data-cat');
            selectRCCategory(catId);
        });
    });

    function startTutorial(certId, certName) {
        currentTutorialOrigin = 'rcCategories';
        currentTutorialSteps = rcData.steps[certId] || [
            { title: "Paso 1: Ingresar", text: `Para obtener el ${certName}, primero debe ir al sitio oficial del Registro Civil.`, visual: "🌐 www.registrocivil.cl" },
            { title: "Paso 2: Selección", text: "Busque el nombre del certificado en la lista de servicios en línea.", visual: "🖱️ Clic en la lista." },
            { title: "Paso 3: Finalizar", text: "Siga las instrucciones en pantalla para recibir su documento por correo.", visual: "✅ Proceso completado." }
        ];
        currentStepIndex = 0;
        updateStepUI();
        showScreen('rcTutorial');
    }

    function updateStepUI() {
        const step = currentTutorialSteps[currentStepIndex];
        const content = document.getElementById('rc-tutorial-content');
        
        // Prepare text for highlighting: Split by words but preserve punctuation
        const wordsArray = step.text.split(/(\s+)/);
        const wrappedText = wordsArray.map((part, i) => {
            if (part.trim().length === 0) return part; // Keep spaces
            return `<span class="reader-word" data-word-index="${i}">${part}</span>`;
        }).join('');

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
                <div id="rc-step-visual" style="padding: 20px; background: #f0f7ff; border-radius: 8px; border: 2px dashed var(--primary); text-align: center; font-weight: 700;">
                    ${step.visual}
                </div>
            `;
        }

        const progressPct = Math.round(((currentStepIndex + 1) / currentTutorialSteps.length) * 100);
        content.innerHTML = `
            <div class="tutorial-progress-header">
                <span class="tutorial-step-counter">Paso ${currentStepIndex + 1} de ${currentTutorialSteps.length}</span>
                <div class="tutorial-progress-track">
                    <div class="tutorial-progress-fill" style="width:${progressPct}%"></div>
                </div>
            </div>
            <h2>${step.title}</h2>
            <div id="reader-target-text" class="step-text" style="font-size: 24px; margin-bottom: 25px; line-height: 1.8;">
                ${wrappedText}
            </div>
            <div class="rc-official-mockup">
                 <div class="rc-official-header">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Logotipo_Clave_%C3%9Anica.svg" alt="Logo CU" class="rc-official-logo">
                     <div class="rc-guide-overlay" title="Ayuda" onclick="showNotification('${step.text.replace(/'/g, "\\'")}', 'info')">?</div>
                 </div>
                 ${visualHtml}
                 ${step.secondaryVisual ? `
                    <div class="rc-visual-wrapper secondary" style="margin-top: 15px;">
                        <img src="${step.secondaryVisual}" class="rc-step-img" alt="Ejemplo carnet">
                        ${step.secondaryHighlight ? `<div class="rc-highlight-overlay ${step.secondaryHighlight}"></div>` : ''}
                    </div>
                 ` : ''}
            </div>
        `;

        document.getElementById('btn-rc-prev').disabled = currentStepIndex === 0;
        document.getElementById('btn-rc-next').innerText = currentStepIndex === currentTutorialSteps.length - 1 ? "Entendido, finalizar" : "Siguiente Paso";
        
        stopAdvancedReader();

        // Auto-leer el nuevo paso si el modo lector persistente está activo
        if (autoReadMode && typeof assistant !== 'undefined') {
            clearTimeout(assistant._narrateTimer);
            assistant._narrateTimer = setTimeout(() => {
                assistant.narrateCurrentScreen();
            }, 600);
        }
    }

    document.getElementById('btn-rc-next').addEventListener('click', () => {
        if (currentStepIndex < currentTutorialSteps.length - 1) {
            currentStepIndex++;
            updateStepUI();
        } else {
            showTutorialSummary();
        }
    });

    document.getElementById('btn-rc-prev').addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateStepUI();
        }
    });


    // --- Voice Assistance Logic ---
    const synth = window.speechSynthesis;

    function stopSpeaking() {
        if (synth.speaking) {
            synth.cancel();
        }
        document.querySelectorAll('.btn-audio').forEach(btn => btn.classList.remove('playing'));
    }

    function getFemaleLatamVoice() {
        const voices = synth.getVoices();
        // Priority tags: es-CL, es-MX, es-AR, es-CO, es-US, es-ES
        const preferredLangs = ['es-CL', 'es-MX', 'es-AR', 'es-CO', 'es-US', 'es-ES'];
        
        for (const lang of preferredLangs) {
            const voice = voices.find(v => 
                v.lang.replace('_', '-').startsWith(lang) && 
                (v.name.toLowerCase().includes('female') || 
                 v.name.toLowerCase().includes('mujer') || 
                 v.name.toLowerCase().includes('sabina') || 
                 v.name.toLowerCase().includes('helena') || 
                 v.name.toLowerCase().includes('zira') ||
                 v.name.toLowerCase().includes('paul'))
            );
            if (voice) return voice;
        }
        
        // Fallback to any Spanish voice
        return voices.find(v => v.lang.startsWith('es'));
    }

    function speakText(text, button) {
        // If clicking the same button while playing, just stop
        if (synth.speaking && button.classList.contains('playing')) {
            stopSpeaking();
            return;
        }

        // Stop any current speech
        stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set Voice
        const latamVoice = getFemaleLatamVoice();
        if (latamVoice) {
            utterance.voice = latamVoice;
        }
        
        utterance.lang = 'es-CL'; // Fallback lang
        utterance.rate = 0.75;    // Much slower for seniors as requested
        utterance.pitch = 1.05;   // Slightly higher for a clearer female tone

        utterance.onstart = () => {
            button.classList.add('playing');
        };

        utterance.onend = () => {
            button.classList.remove('playing');
        };

        utterance.onerror = () => {
            button.classList.remove('playing');
        };

        synth.speak(utterance);
    }

    function getScreenText(screenKey) {
        if (screenKey === 'rcTutorial') {
            const step = currentTutorialSteps[currentStepIndex];
            return step ? `${step.title}. ${step.text}` : 'Cargando tutorial...';
        }

        const screen = screens[screenKey];
        if (!screen) return 'No tengo información de esta pantalla.';

        let text = '';
        const h1 = screen.querySelector('h1') || screen.querySelector('h2');
        const subtitle = screen.querySelector('.subtitle') || screen.querySelector('p');

        if (h1) text += h1.innerText + '. ';
        if (subtitle) text += subtitle.innerText + '. ';

        // Contextual hints
        if (screenKey === 'login') {
            text += 'Ingrese su RUT y su contraseña. ';
        } else if (screenKey === 'menu') {
            text += 'Elija una opción del menú.';
        } else if (screenKey === 'form') {
            text += 'Seleccione el certificado que necesita.';
        } else if (screenKey === 'confirm') {
            text += 'Revise los datos y confirme.';
        } else if (screenKey === 'success') {
            text += 'Trámite completado con éxito.';
        }

        return text;
    }

    function prepareTextForHighlighting(container) {
        // This function wraps text nodes in spans for highlighting without breaking the layout
        // We only do this for elements that don't already have reader-word spans
        if (container.querySelector('.reader-word')) return;

        // Simple approach: find headers and subtitles and wrap their content
        const targets = container.querySelectorAll('h1, h2, .subtitle, label, .flow-item, .key-item p, .wcag-card p, .shield-point');
        targets.forEach(el => {
            const wordsArray = el.innerText.split(/(\s+)/);
            el.innerHTML = wordsArray.map((part, i) => {
                if (part.trim().length === 0) return part;
                return `<span class="reader-word">${part}</span>`;
            }).join('');
        });
    }

    // --- Unified Reader Logic ---
    let readerUtterance = null;
    let targetElement = null;

    document.querySelectorAll('.reader-toolbar').forEach(tb => {
        const play = tb.querySelector('.btn-play');
        const stop = tb.querySelector('.btn-stop');
        const status = tb.querySelector('.reader-status');

        play.onclick = () => {
            autoReadMode = true;
            status.innerText = "Leyendo...";

            const targetId = tb.getAttribute('data-reader-target');
            let target = targetId ? document.getElementById(targetId) : null;

            if (target) {
                prepareTextForHighlighting(target);
                startAdvancedReader(target, tb);
            } else {
                // Fallback: leer la pantalla activa actual
                assistant.narrateCurrentScreen();
                status.innerText = "Leyendo pantalla...";
            }
        };

        stop.onclick = () => {
            autoReadMode = false;
            stopAdvancedReader();
        };
    });


    function startAdvancedReader(textElement, toolbar) {
        stopAdvancedReader();
        targetElement = textElement;
        
        const wordSpans = Array.from(textElement.querySelectorAll('.reader-word'));
        const fullText = textElement.innerText;

        if (wordSpans.length === 0) {
            // Fallback if no spans were created
            const utt = new SpeechSynthesisUtterance(fullText);
            const v = getFemaleLatamVoice();
            if (v) utt.voice = v;
            utt.rate = 0.7;
            synth.speak(utt);
            return;
        }

        readerUtterance = new SpeechSynthesisUtterance(fullText);
        const voice = getFemaleLatamVoice();
        if (voice) readerUtterance.voice = voice;
        readerUtterance.lang = 'es-CL';
        readerUtterance.rate = 0.7;
        
        const status = toolbar.querySelector('.reader-status');
        const playBtn = toolbar.querySelector('.btn-play');

        readerUtterance.onboundary = (event) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;
                
                // Remove all previous highlights
                document.querySelectorAll('.highlight-word').forEach(el => el.classList.remove('highlight-word'));

                // Find the specific span that corresponds to this character index
                let currentPos = 0;
                let bestSpan = null;

                for (let i = 0; i < wordSpans.length; i++) {
                    const span = wordSpans[i];
                    const spanText = span.innerText;
                    
                    // The boundary index usually points to the start of the word
                    // We look for the span where this index falls
                    if (currentPos >= charIndex) {
                        bestSpan = span;
                        break;
                    }
                    currentPos += spanText.length + 1; // +1 for the space preserved in textContent
                }

                if (bestSpan) {
                    bestSpan.classList.add('highlight-word');
                    bestSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        };

        readerUtterance.onstart = () => {
            status.innerText = "Leyendo...";
            playBtn.classList.add('active');
        };

        readerUtterance.onend = () => {
            stopAdvancedReader();
        };

        synth.speak(readerUtterance);
    }

    function stopAdvancedReader() {
        synth.cancel();
        document.querySelectorAll('.highlight-word').forEach(el => el.classList.remove('highlight-word'));
        document.querySelectorAll('.reader-toolbar').forEach(tb => {
            tb.querySelector('.reader-status').innerText = "Escuchar";
            tb.querySelector('.btn-play').innerHTML = "▶️";
            tb.querySelector('.btn-play').classList.remove('active');
        });
    }

    // Assistant Button
    document.getElementById('btn-call-asistente').addEventListener('click', () => {
        showNotification('Conectando con un asistente de FONASA en video-llamada... Por favor, espere un momento.', 'info');
    });

    // Password Toggle Logic
    const passInput = document.getElementById('password');
    const toggleBtn = document.getElementById('btn-toggle-password');

    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', () => {
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';

            toggleBtn.classList.toggle('active', isPass);
            // Update icon
            toggleBtn.innerText = isPass ? '🔒' : '👁️';
        });
    }

    // Password Help Logic
    const helpBtn = document.getElementById('btn-help-password');
    if (helpBtn) {
        const helpText = "La clave es su Clave Única, una contraseña secreta de 8 caracteres o más que le entregó el Registro Civil.";
        helpBtn.addEventListener('click', () => {
            showNotification(helpText, 'info');
        });
    }

    // Accessibility Toolbar Logic
    let currentFontSize = 20;
    const body = document.body;

    document.getElementById('btn-toggle-contrast').addEventListener('click', () => {
        body.classList.toggle('high-contrast');
        const isActive = body.classList.contains('high-contrast');
        document.getElementById('btn-toggle-contrast').classList.toggle('active', isActive);
    });

    document.getElementById('btn-font-plus').addEventListener('click', () => {
        if (currentFontSize < 32) {
            currentFontSize += 2;
            body.style.setProperty('--base-font-size', currentFontSize + 'px');
        }
    });

    document.getElementById('btn-font-minus').addEventListener('click', () => {
        if (currentFontSize > 16) {
            currentFontSize -= 2;
            body.style.setProperty('--base-font-size', currentFontSize + 'px');
        }
    });

    // --- Smart Assistant Logic ---
    const assistant = {
        bubble: document.getElementById('assistant-bubble'),
        icon: document.getElementById('assistant-icon'),
        mainBtn: document.getElementById('btn-assistant-main'),
        synth: window.speechSynthesis,
        recognition: null,
        isListening: false,
        state: null, // null, 'confirming_rut', 'confirming_cert'
        pendingData: null,

        certificateKnowledge: [
            {
                id: 'afiliacion',
                type: 'fonasa',
                name: 'Certificado de Afiliación',
                desc: 'acredita que usted está en FONASA actualmente',
                keywords: ['afiliación', 'afiliado', 'pertenezco', 'salud', 'fonasa', 'papel azul', 'inscrito', 'isapre no', 'pertenecer']
            },
            {
                id: 'cotizaciones',
                type: 'fonasa',
                name: 'Certificado de Cotizaciones',
                desc: 'muestra sus pagos de salud de los últimos meses',
                keywords: ['pagos', 'platas', 'plata', 'dinero', 'cotización', 'cotizaciones', 'descuentos', 'sueldo', 'cuánto tengo', 'ahorros', 'pagado']
            },
            {
                id: 'nacimiento',
                type: 'rc',
                name: 'Certificado de Nacimiento',
                desc: 'documento que acredita su nacimiento y datos de sus padres',
                keywords: ['nacimiento', 'nacer', 'parto', 'bebé', 'hijo', 'hija', 'nací']
            },
            {
                id: 'matrimonio',
                type: 'rc',
                name: 'Certificado de Matrimonio',
                desc: 'documento que acredita su estado civil de casado o casada',
                keywords: ['matrimonio', 'casado', 'casada', 'boda', 'casamiento', 'pareja']
            },
            {
                id: 'defuncion',
                type: 'rc',
                name: 'Certificado de Defunción',
                desc: 'documento que acredita el fallecimiento de una persona',
                keywords: ['defunción', 'muerte', 'fallecido', 'fallecimiento', 'muerto', 'velorio']
            },
            {
                id: 'antecedentes',
                type: 'rc',
                name: 'Certificado de Antecedentes',
                desc: 'muestra si usted tiene registros penales. Requiere Clave Única.',
                keywords: ['antecedentes', 'penales', 'papel de antecedentes', 'policía', 'carcel', 'limpio']
            }
        ],

        formatNumbersForSeniors(str) {
            if (!str) return '';
            // Adds commas between digits for very slow, clear pronunciation
            return str.split('').join(', ').replace(/-/g, ' guion ');
        },

        init() {
            this.chatInput = document.getElementById('assistant-chat-input');
            this.chatSendBtn = document.getElementById('btn-assistant-send');

            if (this.chatSendBtn) {
                this.chatSendBtn.addEventListener('click', () => {
                    const text = this.chatInput.value.trim();
                    if (text) {
                        this.handleCommand(text, false);
                        this.chatInput.value = '';
                    }
                });
            }

            if (this.chatInput) {
                this.chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.chatSendBtn.click();
                    }
                });
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.lang = 'es-CL';
                this.recognition.continuous = true;
                this.recognition.interimResults = true;

                this.recognition.onstart = () => {
                    this.isListening = true;
                    this.icon.parentElement.classList.add('listening');
                    this.showBubble("Te escucho... ¿Qué necesitas?");
                };

                this.recognition.onend = () => {
                    this.isListening = false;
                    this.icon.parentElement.classList.remove('listening');
                };

                this.recognition.onerror = (e) => {
                    if (e.error === 'not-allowed' || e.error === 'permission-denied') {
                        setInputMode('text');
                        localStorage.removeItem('micPermissionGranted');
                        this.showBubble("No se pudo acceder al micrófono. Puede seguir escribiendo normalmente.");
                    } else if (e.error !== 'aborted') {
                        this.showBubble("No pude escucharte bien. ¿Podrías repetir?");
                    }
                };

                this.recognition.onresult = (event) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (interimTranscript) {
                        this.showBubble('"' + interimTranscript + '"', true);
                    }

                    if (finalTranscript) {
                        const cmd = finalTranscript.trim();
                        this.showBubble('"' + cmd + '"', true);
                        this.handleCommand(cmd, true);
                        // Optional: stop after each final command to prevent ghosting
                        this.recognition.stop();
                    }
                };

                this.mainBtn.addEventListener('click', () => {
                    const mode = localStorage.getItem('inputMode') || 'text';
                    if (mode === 'voice') {
                        if (this.isListening) {
                            this.recognition.stop();
                        } else {
                            try { this.recognition.start(); } catch (_) {}
                        }
                    } else {
                        // Modo texto: mostrar burbuja con el chat
                        if (this.bubble) {
                            const visible = this.bubble.style.display === 'block';
                            this.bubble.style.display = visible ? 'none' : 'block';
                            if (!visible) {
                                document.getElementById('assistant-chat-input')?.focus();
                            }
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
            if (isUser) {
                this.bubble.classList.add('user-msg');
            } else {
                this.bubble.classList.remove('user-msg');
            }

            clearTimeout(this.bubbleTimeout);
            this.bubbleTimeout = setTimeout(() => {
                if (!this.synth.speaking && this.bubble) {
                    // Don't hide if user is typing
                    if (document.activeElement !== this.chatInput) {
                        this.bubble.style.display = 'none';
                    }
                }
            }, 8000);
        },

        say(text, callback) {
            if (this.synth.speaking) this.synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Use the same voice logic
            const latamVoice = getFemaleLatamVoice();
            if (latamVoice) {
                utterance.voice = latamVoice;
            }
            
            utterance.lang = 'es-CL';
            utterance.rate = 0.75; // Slower for seniors
            utterance.pitch = 1.05;

            utterance.onstart = () => {
                if (this.icon) this.icon.classList.add('speaking');
                this.showBubble(text);
            };

            utterance.onend = () => {
                if (this.icon) this.icon.classList.remove('speaking');
                if (callback) callback();
            };

            this.synth.speak(utterance);
        },

        handleCommand(cmdRaw, isVoice = false) {
            const cmd = cmdRaw.toLowerCase();
            console.log("Assistant handling:", cmd, "State:", this.state, "IsVoice:", isVoice);

            // 0. Handle Confirmation States
            if (this.state === 'confirming_rut') {
                // ... (existing RUT logic)
                if (cmd.includes('sí') || cmd.includes('si') || cmd.includes('correcto') || cmd.includes('está bien') || cmd.includes('bueno')) {
                    document.getElementById('rut').value = this.pendingData;
                    this.say("Perfecto. He anotado su RUT. Ahora, si desea, puede decirme su clave.");
                    this.state = null;
                    this.pendingData = null;
                    return;
                }

                if (cmd.includes('no') || cmd.includes('incorrecto') || cmd.includes('está mal') || cmd.includes('borra')) {
                    this.say("Oh, mil disculpas. Por favor, dígame su RUT nuevamente para corregirlo.");
                    this.state = null;
                    this.pendingData = null;
                    return;
                }

                // Smart Correction Logic: "Cambia el 2 por el 1"
                const correctionMatch = cmd.match(/(?:cambia|no es|en vez de|era|es un)\s*(?:el|un)?\s*(\d+)\s*(?:por|es|era)\s*(?:el|un)?\s*(\d+)/i);
                if (correctionMatch) {
                    const oldDigit = correctionMatch[1];
                    const newDigit = correctionMatch[2];
                    if (this.pendingData.includes(oldDigit)) {
                        this.pendingData = this.pendingData.replace(oldDigit, newDigit);
                        this.say(`Entendido. He cambiado el ${oldDigit} por el ${newDigit}. Ahora el RUT es: ${this.formatNumbersForSeniors(this.pendingData)}. ¿Es correcto ahora?`, () => {
                            if (isVoice && !this.isListening) this.recognition.start();
                        });
                        return;
                    } else {
                        this.say(`No encontré el número ${oldDigit} en lo que anoté. ¿Podría repetirme el RUT completo por favor?`);
                        this.state = null;
                        this.pendingData = null;
                        return;
                    }
                }
            }

            if (this.state === 'confirming_cert') {
                if (cmd.includes('sí') || cmd.includes('si') || cmd.includes('correcto') || cmd.includes('está bien')) {
                    const cert = this.pendingData;
                    this.state = null;
                    this.pendingData = null;
                    this.say(`Excelente decisión. Estoy preparando su ${cert.name}.`);

                    // Logic to actually select it in UI
                    const rad = document.querySelector(`input[value="${cert.id}"]`);
                    if (rad) rad.checked = true;

                    // Navigate directly to confirmation screen
                    document.getElementById('confirm-type').innerText = cert.name;
                    showScreen('confirm');
                    return;
                }
                if (cmd.includes('no') || cmd.includes('otro') || cmd.includes('incorrecto')) {
                    this.say("Entendido. ¿Qué certificado necesita entonces? Puedo buscar el de Afiliación o el de Cotizaciones.");
                    this.state = null;
                    this.pendingData = null;
                    return;
                }
            }

            // Standard Commands - ONLY trigger greeting if it's the main intent
            const commonGreetings = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'asistente'];
            const isGreetingOnly = commonGreetings.includes(cmd) || (cmd.startsWith('hola') && cmd.length < 10);

            if (isGreetingOnly) {
                this.say("Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?");
                return;
            }

            // 1. Contextual Help
            const helpTriggers = ['ayuda', 'qué hago', 'explica', 'explicar', 'entiende', 'entiendo', 'instrucción', 'qué hay que hacer', 'qué dice'];
            if (helpTriggers.some(t => cmd.includes(t))) {
                // Special case for tutorial: explain the specific step
                if (currentScreenKey === 'rcTutorial') {
                    const step = currentTutorialSteps[currentStepIndex];
                    if (step) {
                        this.say(`Estamos en el paso ${currentStepIndex + 1} de su trámite. El título es ${step.title}. La instrucción para usted es: ${step.text}`);
                        return;
                    }
                }

                const contextText = getScreenText(currentScreenKey);
                this.say("Con gusto. En esta pantalla: " + contextText);
                return;
            }

            // 2. Navigation
            if (cmd.includes('inicio') || cmd.includes('salir') || cmd.includes('cerrar')) {
                this.say("Volviendo al inicio.");
                if (document.getElementById('btn-logout')) {
                    document.getElementById('btn-logout').click();
                } else {
                    showScreen('login');
                }
                return;
            }

            if (cmd.includes('atrás') || cmd.includes('volver')) {
                this.say("Entendido, volvamos atrás.");
                goBack();
                return;
            }

            if (cmd.includes('continuar') || cmd.includes('siguiente') || cmd.includes('aceptar')) {
                const nextBtn = document.querySelector('.screen.active .btn.primary');
                if (nextBtn) {
                    this.say("Avanzando al siguiente paso.");
                    nextBtn.click();
                } else {
                    this.say("No encontré un botón para continuar en esta pantalla.");
                }
                return;
            }

            // 3. Screen Specifics
            if (currentScreenKey === 'login') {
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
                    let passwordPart = cmdRaw.split(/(?:clave|contraseña)\s*(?:es|es)?\s*/i)[1] || "";
                    if (passwordPart) {
                        const symbols = {
                            "punto": ".", "coma": ",", "arroba": "@", "guion": "-",
                            "guión": "-", "bajo": "_", "asterisco": "*", "gato": "#",
                            "pesos": "$", "exclamación": "!", "interrogación": "?"
                        };

                        let cleanPass = passwordPart.trim();

                        // Replace symbols
                        Object.keys(symbols).forEach(key => {
                            const reg = new RegExp("\\b" + key + "\\b", "gi");
                            cleanPass = cleanPass.replace(reg, symbols[key]);
                        });

                        // 2. Handle Casing Keywords
                        // "mayúscula A" -> "A", "mayúsculas hola" -> "HOLA"
                        cleanPass = cleanPass.replace(/mayúscula\s*(\w)/gi, (match, p1) => p1.toUpperCase());
                        cleanPass = cleanPass.replace(/minúscula\s*(\w)/gi, (match, p1) => p1.toLowerCase());

                        // 3. Remove spaces
                        cleanPass = cleanPass.replace(/\s+/g, '');

                        document.getElementById('password').value = cleanPass;
                        this.say("He ingresado tu clave. He quitado los espacios y aplicado las mayúsculas que me pediste.");
                        return;
                    }
                }
                if (cmd.includes('entrar') || cmd.includes('ingresar')) {
                    document.getElementById('btn-login').click();
                    return;
                }
            }

            // --- Navegación global a secciones principales (funciona desde CUALQUIER pantalla) ---
            // Usamos IIFE para evitar bugs de precedencia entre && y ||
            const goToCA = (() => {
                if (cmd.includes('chileatiende'))  return true;
                if (cmd.includes('chile atiende')) return true;
                if (cmd.includes('chile atien'))   return true;
                if (cmd.includes('atiende'))        return true; // captura "servicios chileatiende", "chile atiende", etc.
                if (cmd.includes('chile a tien'))  return true;
                if (cmd.includes('beneficio'))     return true;
                if (cmd.includes('bono'))          return true;
                if (cmd.includes('subsidio'))      return true;
                if (cmd.includes('registro social'))   return true;
                if (cmd.includes('capacitacion'))  return true;
                if (cmd.includes('previsional'))   return true;
                if (cmd.includes('seguro social')) return true;
                if (cmd.includes('sence'))         return true;
                if (cmd.includes('pagos del estado')) return true;
                return false;
            })();

            const goToRC = (() => {
                if (cmd.includes('registro civil'))   return true;
                if (cmd.includes('registrocivil'))    return true;
                if (cmd.includes('registro civi'))    return true;
                if (cmd.includes('certif'))           return true;
                if (cmd.includes('certificado'))      return true;
                if (cmd.includes('acta'))             return true;
                if (cmd.includes('partida'))          return true;
                return false;
            })();

            if (goToCA && currentScreenKey !== 'caCategories' && currentScreenKey !== 'rcTutorial') {
                this.say("Entendido. Abriendo los servicios de ChileAtiende.");
                showScreen('caCategories');
                return;
            }

            if (goToRC && !goToCA && currentScreenKey !== 'rcCategories' && currentScreenKey !== 'rcTutorial') {
                this.say("Claro, aquí tiene los trámites del Registro Civil.");
                showScreen('rcCategories');
                return;
            }

            if (currentScreenKey === 'menu' || currentScreenKey === 'landing') {
                if (cmd.includes('papel') || cmd.includes('tramite') || cmd.includes('obtener')) {
                    this.say("Abriendo sección de certificados del Registro Civil.");
                    showScreen('rcCategories');
                    return;
                }
            }

            if (currentScreenKey === 'form') {
                if (cmd.includes('afiliación')) {
                    const rad = document.querySelector('input[value="afiliacion"]');
                    if (rad) rad.checked = true;
                    this.say("Seleccionado Certificado de Afiliación.");
                    return;
                }
                if (cmd.includes('cotizaciones')) {
                    const rad = document.querySelector('input[value="cotizaciones"]');
                    if (rad) rad.checked = true;
                    this.say("Seleccionado Certificado de Cotizaciones.");
                    return;
                }
            }

            // Fuzzy Match for Certificates (Smart Search - AI Logic)
            // We check for triggers, but if it's not a known command, we'll try to match certificates anyway
            const certKeywords = ['certificado', 'papel', 'comprobante', 'necesito', 'quiero', 'dame', 'obtener', 'sacar', 'el de', 'la de', 'los de', 'nacimiento', 'matrimonio', 'antecedentes', 'defuncion', 'fonasa'];
            const looksLikeCertRequest = certKeywords.some(kw => cmd.includes(kw));

            if (looksLikeCertRequest) {
                let bestMatch = null;
                let maxScore = 0;

                this.certificateKnowledge.forEach(cert => {
                    let score = 0;
                    if (cmd.includes(cert.id)) score += 15;
                    cert.keywords.forEach(kw => {
                        if (cmd.includes(kw)) score += 5;
                    });
                    if (score > maxScore) {
                        maxScore = score;
                        bestMatch = cert;
                    }
                });

                if (bestMatch && maxScore >= 10) {
                    this.say(`Perfecto. Preparando de inmediato su ${bestMatch.name}.`);
                    
                    setTimeout(() => {
                        if (bestMatch.type === 'rc') {
                            selectRCCategory(bestMatch.id);
                        } else {
                            // Fonasa flow
                            const rad = document.querySelector(`input[value="${bestMatch.id}"]`);
                            if (rad) rad.checked = true;
                            document.getElementById('confirm-type').innerText = bestMatch.name;
                            showScreen('confirm');
                        }
                    }, 100);
                    return;
                } else if (bestMatch && maxScore >= 5) {
                    // Medium confidence: Ask for confirmation
                    this.pendingData = bestMatch;
                    this.state = 'confirming_cert';
                    this.say(`Entendido. No encontré uno con ese nombre exacto, pero tengo el ${bestMatch.name}, que ${bestMatch.desc}. ¿Es ese el que necesita?`, () => {
                        if (isVoice && !this.isListening) this.recognition.start();
                    });
                    return;
                } else if (cmd.includes('certificado') || cmd.includes('papel') || cmd.includes('trámite')) {
                    this.say("No estoy seguro de qué certificado busca. Tengo de Nacimiento, Matrimonio, Antecedentes, o los de Fonasa. ¿Cuál necesita?");
                    return;
                }
            }

            if (cmd.includes('letra') && (cmd.includes('grande') || cmd.includes('agrandar'))) {
                document.getElementById('btn-font-plus').click();
                return;
            }
            if (cmd.includes('contraste')) {
                document.getElementById('btn-toggle-contrast').click();
                return;
            }

            this.say("No estoy seguro de cómo ayudarte con '" + cmd + "'. Prueba decir 'ayuda' para explicarte esta pantalla.");
        },

        // --- Auto-narración de pantalla (accesibilidad para adultos mayores) ---
        narrateCurrentScreen() {
            // No interrumpir si ya está hablando
            if (this.synth.speaking) return;
            let text = '';
            switch (currentScreenKey) {
                case 'landing':
                    text = 'Bienvenido al portal de trámites. Puede elegir obtener un certificado del Registro Civil, o explorar los servicios de ChileAtiende.';
                    break;
                case 'login':
                    text = 'Pantalla de inicio de sesión. Por favor ingrese su RUN en el primer campo, y su Clave Única en el segundo. Luego presione el botón Autenticar.';
                    break;
                case 'menu':
                    text = 'Menú principal. Tiene tres opciones: Obtener Certificado, Guía del Registro Civil, o Guía de ChileAtiende.';
                    break;
                case 'form':
                    text = 'Selección de certificado. Elija entre el Certificado de Afiliación, que acredita que está en FONASA, o el de Cotizaciones, que muestra sus pagos de salud. Luego presione Siguiente paso.';
                    break;
                case 'confirm':
                    text = 'Pantalla de confirmación. Revise bien su información. Si todo está correcto, presione el botón que dice: Sí, Confirmar Trámite.';
                    break;
                case 'success':
                    text = '¡Trámite exitoso! Su certificado fue procesado correctamente y se enviará a su correo electrónico.';
                    break;
                case 'tutorial':
                    text = 'Centro de ayuda. Aquí encontrará información sobre qué es la Clave Única, cómo usar el teclado, cómo cuidarse en internet, y el compromiso de accesibilidad de esta plataforma.';
                    break;
                case 'rcCategories':
                    text = 'Servicios del Registro Civil. Elija una categoría: Nacimiento, Matrimonio, Defunción, Antecedentes, Vehículos, o Identidad.';
                    break;
                case 'caCategories':
                    text = 'Servicios de ChileAtiende. Puede consultar: Mi Registro Social de Hogares, Mis Pagos de Beneficios Sociales, Mis Capacitaciones, Mi Información Previsional, o Mi Seguro Social.';
                    break;
                case 'rcTutorial': {
                    const step = currentTutorialSteps[currentStepIndex];
                    text = step ? step.title + '. ' + step.text : '';
                    break;
                }
                default:
                    text = '';
            }
            if (text) this.say(text);
        }
    };

    // Helper for Microphone Guide
    const modal = document.getElementById('modal-mic-guide');
    const closeBtn = document.querySelector('.close-modal');

    function showMicGuide() {
        if (modal) modal.style.display = 'block';
        assistant.say("Por favor, presiona el botón azul de 'Permitir' que aparece arriba para poder escucharte.");
    }

    function hideMicGuide() {
        if (modal) modal.style.display = 'none';
    }

    if (closeBtn) closeBtn.onclick = hideMicGuide;

    // Opción: solo escribir
    document.getElementById('btn-choose-text')?.addEventListener('click', () => {
        localStorage.setItem('micPermissionGranted', 'true');
        setInputMode('text');
        hideMicGuide();
    });

    // Opción: usar micrófono
    document.getElementById('btn-choose-voice')?.addEventListener('click', () => {
        localStorage.setItem('micPermissionGranted', 'true');
        setInputMode('voice');
        hideMicGuide();
        if (assistant.recognition && !assistant.isListening) {
            try { assistant.recognition.start(); } catch (_) {}
        }
    });

    window.onclick = (event) => {
        if (event.target === modal) hideMicGuide();
    };

    // --- Toggle de modo de entrada (texto / voz) ---
    function setInputMode(mode) {
        localStorage.setItem('inputMode', mode);
        const btnText = document.getElementById('btn-mode-text');
        const btnVoice = document.getElementById('btn-mode-voice');
        const icon = document.getElementById('assistant-icon');
        if (btnText) btnText.classList.toggle('active', mode === 'text');
        if (btnVoice) btnVoice.classList.toggle('active', mode === 'voice');
        if (icon) icon.textContent = mode === 'voice' ? '🎤' : '💬';
        if (mode === 'text' && assistant.isListening) {
            assistant.recognition?.stop();
        }
    }

    // Restaurar modo guardado al cargar
    setInputMode(localStorage.getItem('inputMode') || 'text');

    document.getElementById('btn-mode-text')?.addEventListener('click', () => {
        setInputMode('text');
    });

    document.getElementById('btn-mode-voice')?.addEventListener('click', () => {
        if (!assistant.recognition) {
            showNotification('Tu navegador no soporta comandos de voz. Usa el chat de texto.', 'warning');
            return;
        }
        if (localStorage.getItem('micPermissionGranted') !== 'true') {
            showMicGuide();
        } else {
            setInputMode('voice');
            if (!assistant.isListening) {
                try { assistant.recognition.start(); } catch (_) {}
            }
        }
    });

    assistant.init();

    // Screen change proactivity
    const oldShowScreen = showScreen;
    showScreen = (key, add) => {
        oldShowScreen(key, add);
        updateBreadcrumb(key);
        resetInactivityTimer();
        // Solo narrar si el modo lector persistente está activo (activado con ▶️, desactivado con ⏹️)
        if (autoReadMode) {
            clearTimeout(assistant._narrateTimer);
            assistant._narrateTimer = setTimeout(() => {
                assistant.narrateCurrentScreen();
            }, 800);
        }
    };

    // --- Dark Mode ---
    const btnDarkMode = document.getElementById('btn-dark-mode');
    if (btnDarkMode) {
        const savedDark = localStorage.getItem('darkMode') === 'true';
        if (savedDark) document.body.classList.add('dark-mode');
        btnDarkMode.classList.toggle('active', savedDark);

        btnDarkMode.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDark);
            btnDarkMode.classList.toggle('active', isDark);
        });
    }

    // --- Font Size Cycle ---
    const fontSizes = [20, 26, 32];
    let fontSizeIndex = 0;
    const btnFontCycle = document.getElementById('btn-font-size-cycle');
    if (btnFontCycle) {
        btnFontCycle.addEventListener('click', () => {
            fontSizeIndex = (fontSizeIndex + 1) % fontSizes.length;
            document.body.style.setProperty('--base-font-size', fontSizes[fontSizeIndex] + 'px');
            currentFontSize = fontSizes[fontSizeIndex];
        });
    }

    // --- Breadcrumb ---
    const breadcrumbLabels = {
        landing: null,
        login: ['Inicio'],
        menu: ['Inicio', 'Menú principal'],
        form: ['Inicio', 'Menú principal', 'Solicitar certificado'],
        confirm: ['Inicio', 'Menú principal', 'Solicitar certificado', 'Confirmación'],
        success: ['Inicio', 'Menú principal', 'Completado'],
        tutorial: ['Inicio', 'Menú principal', 'Tutorial ChileAtiende'],
        rcCategories: ['Inicio', 'Menú principal', 'Registro Civil'],
        rcTutorial: ['Inicio', 'Menú principal', 'Registro Civil', 'Tutorial'],
        caCategories: ['Inicio', 'Menú principal', 'ChileAtiende']
    };

    function updateBreadcrumb(key) {
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

    // --- Inactivity Timer ---
    let inactivityTimer = null;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (!assistant.isListening) {
                assistant.say('¿Necesita ayuda? Puede preguntarme lo que necesite o presionar el botón de ayuda.');
            }
        }, 90000);
    }
    ['mousemove', 'keydown', 'touchstart', 'click'].forEach(evt => {
        document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    // --- Touch-friendly help tooltip for password ---
    const helpBtnTooltip = document.getElementById('btn-help-password');
    if (helpBtnTooltip) {
        const tooltip = helpBtnTooltip.closest('.input-wrapper')?.querySelector('.cu-help-tooltip');
        if (tooltip) {
            helpBtnTooltip.addEventListener('click', (e) => {
                e.stopPropagation();
                tooltip.classList.toggle('visible');
            });
            document.addEventListener('click', () => tooltip.classList.remove('visible'));
        }
    }

    // --- Speed Control Panel ---
    let speechRate = 0.75;
    const btnSpeedToggle = document.getElementById('btn-speed-toggle');
    const speedPanel = document.getElementById('speed-control-panel');
    if (btnSpeedToggle && speedPanel) {
        btnSpeedToggle.addEventListener('click', () => {
            speedPanel.classList.toggle('visible');
        });
    }
    document.getElementById('speed-normal')?.addEventListener('click', () => {
        speechRate = 0.75;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('speed-normal')?.classList.add('active');
        if (speedPanel) speedPanel.classList.remove('visible');
        showNotification('Velocidad normal activada', 'info');
    });
    document.getElementById('speed-slow')?.addEventListener('click', () => {
        speechRate = 0.55;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('speed-slow')?.classList.add('active');
        if (speedPanel) speedPanel.classList.remove('visible');
        showNotification('Velocidad lenta activada', 'info');
    });
    document.getElementById('speed-very-slow')?.addEventListener('click', () => {
        speechRate = 0.38;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('speed-very-slow')?.classList.add('active');
        if (speedPanel) speedPanel.classList.remove('visible');
        showNotification('Velocidad muy lenta activada', 'info');
    });

    // Patch assistant.say: muestra el texto en la burbuja Y lo habla
    assistant.say = function(text, onEnd) {
        // Siempre mostrar en burbuja (modo texto o voz)
        assistant.showBubble(text, false);

        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'es-CL';
        utter.rate = speechRate;
        if (typeof getFemaleLatamVoice === 'function') {
            utter.voice = getFemaleLatamVoice();
        }
        if (onEnd) utter.onend = onEnd;
        window.speechSynthesis.speak(utter);
    };

    // --- Image Zoom ---
    const modalZoom = document.getElementById('modal-zoom');
    const zoomImg = document.getElementById('zoom-img');
    const btnZoomClose = document.getElementById('btn-zoom-close');

    document.addEventListener('click', (e) => {
        const img = e.target.closest('.rc-step-img');
        if (img && modalZoom && zoomImg) {
            zoomImg.src = img.src;
            zoomImg.alt = img.alt;
            modalZoom.style.display = 'flex';
        }
    });
    if (btnZoomClose) {
        btnZoomClose.addEventListener('click', () => {
            if (modalZoom) modalZoom.style.display = 'none';
        });
    }
    if (modalZoom) {
        modalZoom.addEventListener('click', (e) => {
            if (e.target === modalZoom) modalZoom.style.display = 'none';
        });
    }

    // --- Exit Tutorial Confirmation ---
    document.getElementById('btn-exit-confirm')?.addEventListener('click', () => {
        const m = document.getElementById('modal-exit-tutorial');
        if (m) m.style.display = 'none';
        goBack();
    });
    document.getElementById('btn-exit-cancel')?.addEventListener('click', () => {
        const m = document.getElementById('modal-exit-tutorial');
        if (m) m.style.display = 'none';
    });

    // --- Tutorial Summary Modal ---
    function showTutorialSummary() {
        const modal = document.getElementById('modal-tutorial-summary');
        if (!modal) return;
        const steps = currentTutorialSteps;
        const listEl = document.getElementById('summary-steps-recap');
        if (listEl && steps) {
            listEl.innerHTML = '<ul>' + steps.map(s =>
                `<li><span class="summary-check">✅</span> ${s.title}</li>`
            ).join('') + '</ul>';
        }
        modal.style.display = 'flex';
        assistant.say('¡Felicitaciones! Ha completado el tutorial exitosamente. ¡Muy bien hecho!');
    }

    document.getElementById('btn-summary-ok')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-tutorial-summary');
        if (modal) modal.style.display = 'none';
        showScreen(currentTutorialOrigin || 'menu');
    });

    // --- Quick Help Button ---
    const btnQuickHelp = document.getElementById('btn-quick-help');
    if (btnQuickHelp) {
        const isTouchDevice = window.matchMedia('(hover: none)').matches;

        btnQuickHelp.addEventListener('click', () => {
            if (isTouchDevice) {
                if (!btnQuickHelp.classList.contains('is-expanded')) {
                    btnQuickHelp.classList.add('is-expanded');
                    clearTimeout(btnQuickHelp._collapseTimer);
                    btnQuickHelp._collapseTimer = setTimeout(() => {
                        btnQuickHelp.classList.remove('is-expanded');
                    }, 3000);
                } else {
                    clearTimeout(btnQuickHelp._collapseTimer);
                    btnQuickHelp.classList.remove('is-expanded');
                    openFirstUseOverlay();
                }
            } else {
                openFirstUseOverlay();
            }
        });
    }

    function openFirstUseOverlay() {
        const overlay = document.getElementById('overlay-first-use');
        if (overlay) {
            overlay.classList.add('visible');
        }
    }

    // --- Transparencia del asistente ---
    const assistantContainer = document.querySelector('.assistant-container');
    if (assistantContainer) {
        const isTouchOnly = window.matchMedia('(hover: none)').matches;

        // Activar al tocar: opaco mientras el dedo esté encima, luego 2s antes de volver
        if (isTouchOnly) {
            assistantContainer.addEventListener('touchstart', () => {
                assistantContainer.classList.add('is-active');
                assistantContainer.classList.remove('is-overlapping');
                clearTimeout(assistantContainer._fadeTimer);
            }, { passive: true });

            const startFadeTimer = () => {
                clearTimeout(assistantContainer._fadeTimer);
                assistantContainer._fadeTimer = setTimeout(() => {
                    assistantContainer.classList.remove('is-active');
                    checkAssistantOverlap();
                }, 2000);
            };

            assistantContainer.addEventListener('touchend', startFadeTimer, { passive: true });
            assistantContainer.addEventListener('touchcancel', startFadeTimer, { passive: true });
        }

        // Detectar solapamiento con texto (mobile)
        function checkAssistantOverlap() {
            if (assistantContainer.classList.contains('is-active')) return;
            const acRect = assistantContainer.getBoundingClientRect();
            const textEls = document.querySelectorAll(
                '#app p, #app h1, #app h2, #app h3, #app li, #app label, #app .btn-text, #app .menu-item, #app .card'
            );
            let overlaps = false;
            for (const el of textEls) {
                const r = el.getBoundingClientRect();
                if (r.bottom > acRect.top && r.top < acRect.bottom &&
                    r.right > acRect.left && r.left < acRect.right) {
                    overlaps = true;
                    break;
                }
            }
            assistantContainer.classList.toggle('is-overlapping', overlaps);
        }

        if (isTouchOnly) {
            window.addEventListener('scroll', checkAssistantOverlap, { passive: true });
            // Re-chequear al cambiar de pantalla
            const appEl = document.getElementById('app');
            if (appEl) {
                new MutationObserver(checkAssistantOverlap).observe(appEl, {
                    attributes: true, subtree: false, attributeFilter: ['class']
                });
            }
            checkAssistantOverlap();
        }

        // Hacerlo activo mientras habla o escucha
        const avatarEl = document.getElementById('assistant-icon');
        if (avatarEl) {
            new MutationObserver(() => {
                const busy = avatarEl.classList.contains('speaking') || avatarEl.classList.contains('listening');
                assistantContainer.classList.toggle('is-active', busy);
            }).observe(avatarEl, { attributes: true, attributeFilter: ['class'] });
        }
    }

    // --- First-Use Onboarding Overlay ---
    const overlay = document.getElementById('overlay-first-use');
    if (overlay) {
        const slides = overlay.querySelectorAll('.first-use-slide');
        const dots = overlay.querySelectorAll('.fuse-dot');
        const btnNext = document.getElementById('btn-fuse-next');
        let fuseStep = 0;

        const dismissOverlay = () => {
            overlay.classList.remove('visible');
            localStorage.setItem('firstUseShown', 'true');
        };

        const goToSlide = (n) => {
            slides.forEach((s, i) => s.classList.toggle('active', i === n));
            dots.forEach((d, i) => d.classList.toggle('active', i === n));
            if (btnNext) {
                btnNext.textContent = n === slides.length - 1 ? '¡Comenzar!' : 'Siguiente →';
            }
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { fuseStep = i; goToSlide(fuseStep); });
        });

        btnNext?.addEventListener('click', () => {
            if (fuseStep < slides.length - 1) {
                fuseStep++;
                goToSlide(fuseStep);
            } else {
                dismissOverlay();
            }
        });

        document.getElementById('btn-fuse-skip')?.addEventListener('click', dismissOverlay);

        if (!localStorage.getItem('firstUseShown')) {
            goToSlide(0);
            overlay.classList.add('visible');
        }
    }

    // --- Modo Daltonismo ---
    const cbModes = ['cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia'];
    const btnColorblind = document.getElementById('btn-colorblind');
    const cbPanel = document.getElementById('colorblind-panel');

    if (btnColorblind && cbPanel) {
        const savedCb = localStorage.getItem('colorblindMode');
        if (savedCb && cbModes.includes(savedCb)) {
            document.body.classList.add(savedCb);
            document.getElementById(`cb-${savedCb.replace('cb-', '')}`)?.classList.add('active');
            document.getElementById('cb-none')?.classList.remove('active');
            btnColorblind.classList.add('active');
        }

        btnColorblind.addEventListener('click', () => {
            cbPanel.classList.toggle('visible');
        });

        document.querySelectorAll('.cb-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                cbModes.forEach(m => document.body.classList.remove(m));
                document.querySelectorAll('.cb-btn').forEach(b => b.classList.remove('active'));

                const modeKey = btn.id === 'cb-none' ? null : btn.id;
                if (modeKey) {
                    document.body.classList.add(modeKey);
                    localStorage.setItem('colorblindMode', modeKey);
                    btnColorblind.classList.add('active');
                } else {
                    localStorage.removeItem('colorblindMode');
                    btnColorblind.classList.remove('active');
                }

                btn.classList.add('active');
                cbPanel.classList.remove('visible');

                const names = {
                    'cb-none': 'Modo normal activado',
                    'cb-protanopia': 'Modo Protanopia activado',
                    'cb-deuteranopia': 'Modo Deuteranopia activado',
                    'cb-tritanopia': 'Modo Tritanopia activado'
                };
                showNotification(names[btn.id] || 'Modo actualizado', 'info');
            });
        });

        document.addEventListener('click', (e) => {
            if (!cbPanel.contains(e.target) && e.target !== btnColorblind) {
                cbPanel.classList.remove('visible');
            }
        });
    }

    // Initial breadcrumb
    updateBreadcrumb('landing');
});

