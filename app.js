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
        login: document.getElementById('screen-login'),
        menu: document.getElementById('screen-menu'),
        form: document.getElementById('screen-form'),
        confirm: document.getElementById('screen-confirm'),
        success: document.getElementById('screen-success'),
        tutorial: document.getElementById('screen-tutorial'),
        rcCategories: document.getElementById('screen-rc-categories'),
        rcTutorial: document.getElementById('screen-rc-tutorial')
    };

    let history = ['login'];
    let currentScreenKey = 'login';

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

    // Login -> Menu
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
        showScreen('menu');
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

    let currentTutorialSteps = [];
    let currentStepIndex = 0;

    // Menu -> RC Categories
    document.getElementById('btn-rc-guide').addEventListener('click', () => {
        showScreen('rcCategories');
    });

    document.getElementById('btn-back-rc').addEventListener('click', goBack);
    document.getElementById('btn-back-rc-tutorial').addEventListener('click', goBack);

    // Category Click Handling
    document.querySelectorAll('.rc-category-card').forEach(card => {
        card.addEventListener('click', () => {
            const catId = card.getAttribute('data-cat');
            const cat = rcData.categories[catId];
            
            if (cat) {
                // Highlight active card
                document.querySelectorAll('.rc-category-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Show sublist
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
                    item.onclick = () => startTutorial(cert.id, cert.name);
                    container.appendChild(item);
                });
                
                sublist.style.display = 'block';
                window.scrollTo({ top: sublist.offsetTop - 50, behavior: 'smooth' });
            } else {
                showNotification("Esta categoría estará disponible próximamente.", "info");
            }
        });
    });

    function startTutorial(certId, certName) {
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
                    <img src="${step.visual}" class="rc-step-img" alt="Guía visual">
                    ${step.highlight ? `<div class="rc-highlight-overlay ${step.highlight}"></div><div class="rc-finger-pointer">☝️</div>` : ''}
                </div>
            `;
        } else {
            visualHtml = `
                <div id="rc-step-visual" style="padding: 20px; background: #f0f7ff; border-radius: 8px; border: 2px dashed var(--primary); text-align: center; font-weight: 700;">
                    ${step.visual}
                </div>
            `;
        }

        content.innerHTML = `
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
    }

    document.getElementById('btn-rc-next').addEventListener('click', () => {
        if (currentStepIndex < currentTutorialSteps.length - 1) {
            currentStepIndex++;
            updateStepUI();
        } else {
            showScreen('rcCategories');
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
        const screen = screens[screenKey];
        if (!screen) return '';

        let text = '';
        const h1 = screen.querySelector('h1') || screen.querySelector('h2');
        const subtitle = screen.querySelector('.subtitle');

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
    let isReaderPaused = false;
    let targetElement = null;

    document.querySelectorAll('.reader-toolbar').forEach(tb => {
        const play = tb.querySelector('.btn-play');
        const pause = tb.querySelector('.btn-pause');
        const stop = tb.querySelector('.btn-stop');
        const status = tb.querySelector('.reader-status');

        play.onclick = () => {
            if (isReaderPaused) {
                synth.resume();
                isReaderPaused = false;
                status.innerText = "Leyendo...";
                play.innerHTML = "⏸️";
                return;
            }

            if (synth.speaking) {
                synth.pause();
                isReaderPaused = true;
                status.innerText = "Pausado";
                play.innerHTML = "▶️";
                return;
            }

            // Start new reading
            const targetId = tb.getAttribute('data-reader-target');
            let target;
            
            if (targetId === 'reader-target-text') {
                target = document.getElementById('reader-target-text');
            } else {
                target = document.getElementById(targetId);
                if (target) prepareTextForHighlighting(target);
            }

            if (target) {
                startAdvancedReader(target, tb);
            }
        };

        stop.onclick = stopAdvancedReader;
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
            playBtn.innerHTML = "⏸️";
            playBtn.classList.add('active');
            toolbar.querySelector('.btn-pause').disabled = false;
        };

        readerUtterance.onend = () => {
            stopAdvancedReader();
        };

        synth.speak(readerUtterance);
    }

    function stopAdvancedReader() {
        synth.cancel();
        isReaderPaused = false;
        document.querySelectorAll('.highlight-word').forEach(el => el.classList.remove('highlight-word'));
        document.querySelectorAll('.reader-toolbar').forEach(tb => {
            tb.querySelector('.reader-status').innerText = "Escuchar";
            tb.querySelector('.btn-play').innerHTML = "▶️";
            tb.querySelector('.btn-play').classList.remove('active');
            tb.querySelector('.btn-pause').disabled = true;
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
                name: 'Certificado de Afiliación',
                desc: 'acredita que usted está en FONASA actualmente',
                keywords: ['afiliación', 'afiliado', 'pertenezco', 'salud', 'fonasa', 'papel azul', 'inscrito', 'isapre no', 'pertenecer']
            },
            {
                id: 'cotizaciones',
                name: 'Certificado de Cotizaciones',
                desc: 'muestra sus pagos de salud de los últimos meses',
                keywords: ['pagos', 'platas', 'plata', 'dinero', 'cotización', 'cotizaciones', 'descuentos', 'sueldo', 'cuánto tengo', 'ahorros', 'pagado']
            }
        ],

        formatNumbersForSeniors(str) {
            if (!str) return '';
            // Adds commas between digits for very slow, clear pronunciation
            return str.split('').join(', ').replace(/-/g, ' guion ');
        },

        init() {
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
                    console.error("Mic error:", e);
                    this.showBubble("No pude escucharte bien. ¿Podrías repetir?");
                };

                this.recognition.onresult = (event) => {
                    let fullTranscript = '';
                    for (let i = 0; i < event.results.length; ++i) {
                        fullTranscript += event.results[i][0].transcript + ' ';
                    }

                    const cmd = fullTranscript.trim();
                    this.showBubble('"' + cmd + '"', true);

                    // Reset silence timer
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = setTimeout(() => {
                        if (cmd) {
                            console.log("Final command after silence:", cmd);
                            this.handleCommand(cmd);
                            this.recognition.stop(); // Stop listening after command is handled
                        }
                    }, 3000); // 3 seconds of silence for seniors
                };

                this.mainBtn.addEventListener('click', () => {
                    if (this.isListening) {
                        this.recognition.stop();
                    } else {
                        if (localStorage.getItem('micPermissionGranted') !== 'true') {
                            showMicGuide();
                        } else {
                            this.recognition.start();
                        }
                    }
                });
            }
        },

        showBubble(text, isUser = false) {
            if (!this.bubble) return;
            this.bubble.innerText = text;
            this.bubble.style.display = 'block';
            if (isUser) {
                this.bubble.classList.add('user-msg');
            } else {
                this.bubble.classList.remove('user-msg');
            }

            clearTimeout(this.bubbleTimeout);
            this.bubbleTimeout = setTimeout(() => {
                if (!this.synth.speaking && this.bubble) this.bubble.style.display = 'none';
            }, 5000);
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

        handleCommand(cmdRaw) {
            const cmd = cmdRaw.toLowerCase();
            console.log("Assistant handling:", cmd, "State:", this.state);

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
                            if (!this.isListening) this.recognition.start();
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

            // Standard Commands
            if (cmd === 'hola' || cmd.startsWith('hola ') || cmd.includes(' buenos días') || cmd.includes(' buenas tardes')) {
                this.say("¡Hola! Qué gusto saludarte. Soy tu asistente de FONASA. ¿En qué puedo ayudarte con tus trámites hoy?");
                return;
            }

            // 1. Contextual Help
            if (cmd.includes('ayuda') || cmd.includes('qué hago') || cmd.includes('explicar')) {
                const contextText = getScreenText(currentScreenKey);
                this.say("En esta pantalla: " + contextText);
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
                            if (!this.isListening) this.recognition.start();
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

            if (currentScreenKey === 'menu') {
                if (cmd.includes('certificado') || cmd.includes('papel') || cmd.includes('tramite')) {
                    this.say("Abriendo sección de certificados.");
                    document.getElementById('btn-tramites').click();
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
            if (cmd.includes('certificado') || cmd.includes('papel') || cmd.includes('comprobante') || cmd.includes('necesito el') || cmd.includes('quiero el')) {
                let bestMatch = null;
                let maxScore = 0;

                this.certificateKnowledge.forEach(cert => {
                    let score = 0;
                    if (cmd.includes(cert.id)) score += 10;
                    cert.keywords.forEach(kw => {
                        if (cmd.includes(kw)) score += 5;
                    });
                    if (score > maxScore) {
                        maxScore = score;
                        bestMatch = cert;
                    }
                });

                if (bestMatch && maxScore >= 10) {
                    // High confidence match: Automatic navigation
                    this.say(`Perfecto. Preparando de inmediato su ${bestMatch.name}.`);
                    
                    // Set the value and navigate
                    setTimeout(() => {
                        const rad = document.querySelector(`input[value="${bestMatch.id}"]`);
                        if (rad) rad.checked = true;
                        
                        document.getElementById('confirm-type').innerText = bestMatch.name;
                        showScreen('confirm');
                    }, 100);
                    return;
                } else if (bestMatch && maxScore >= 5) {
                    // Medium confidence: Ask for confirmation
                    this.pendingData = bestMatch;
                    this.state = 'confirming_cert';
                    this.say(`Entendido. No encontré uno con ese nombre exacto, pero tengo el ${bestMatch.name}, que ${bestMatch.desc}. ¿Es ese el que necesita?`, () => {
                        if (!this.isListening) this.recognition.start();
                    });
                    return;
                } else if (cmd.includes('certificado') || cmd.includes('papel')) {
                    this.say("No estoy seguro de qué certificado busca. Tengo el de Afiliación y el de Cotizaciones. ¿Cuál de ellos necesita?");
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
        }
    };

    // Helper for Microphone Guide
    const modal = document.getElementById('modal-mic-guide');
    const closeBtn = document.querySelector('.close-modal');
    const understoodBtn = document.getElementById('btn-close-guide');

    function showMicGuide() {
        if (modal) modal.style.display = 'block';
        assistant.say("Por favor, presiona el botón azul de 'Permitir' que aparece arriba para poder escucharte.");
    }

    function hideMicGuide() {
        if (modal) modal.style.display = 'none';
        assistant.recognition?.start();
    }

    if (closeBtn) closeBtn.onclick = hideMicGuide;
    if (understoodBtn) {
        understoodBtn.onclick = () => {
            localStorage.setItem('micPermissionGranted', 'true');
            hideMicGuide();
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) hideMicGuide();
    };

    assistant.init();

    // Screen change proactivity
    const oldShowScreen = showScreen;
    showScreen = (key, add) => {
        oldShowScreen(key, add);
    };
});

