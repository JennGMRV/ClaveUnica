export const rcData = {
    categories: {
        nacimiento: {
            title: "Nacimiento",
            certs: [
                { id: "nac-matricula",  name: "Certificado Nacimiento Para Matrícula",         cu: false, desc: "Trámite gratuito para procesos escolares." },
                { id: "nac-asignacion", name: "Certificado Nacimiento Asignación Familiar",     cu: false, desc: "Para trámites de beneficios laborales." },
                { id: "nac-todo",       name: "Certificado Nacimiento Todo Trámite",            cu: false, desc: "Uso general en cualquier institución." }
            ]
        },
        matrimonio: {
            title: "Matrimonio",
            certs: [
                { id: "mat-todo",       name: "Certificado Matrimonio Todo Trámite",            cu: false, desc: "Acredita el estado civil actual." },
                { id: "mat-asignacion", name: "Certificado Matrimonio Asignación Familiar",     cu: false, desc: "Para beneficios de salud o laborales." }
            ]
        },
        antecedentes: {
            title: "Antecedentes",
            certs: [
                { id: "ant-fines-particulares", name: "Antecedentes Fines Particulares", cu: true, desc: "Para empleos o trámites personales." },
                { id: "ant-fines-especiales",   name: "Antecedentes Fines Especiales",   cu: true, desc: "Para trámites legales específicos." }
            ]
        },
        defuncion: {
            title: "Defunción",
            certs: [
                { id: "def-todo",       name: "Certificado Defunción Para Todo Trámite",       cu: false, desc: "Acredita el fallecimiento de una persona." },
                { id: "def-asignacion", name: "Certificado Defunción Asignación Familiar",     cu: false, desc: "Para trámites de previsión o herencia." }
            ]
        },
        vehiculos: {
            title: "Vehículos",
            certs: [
                { id: "veh-anotaciones", name: "Anotaciones Vigentes de Vehículos",            cu: false, desc: "Muestra multas y datos del dueño." },
                { id: "veh-multas",      name: "Certificado de Multas de Tránsito",            cu: false, desc: "Revisa si tiene deudas de patentes." }
            ]
        }
    },
    steps: {
        "nac-matricula": [
            { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "rc-certs-online.png", highlight: "nacimiento-row" },
            { title: "Paso 2: Elegir Matrícula", text: "Ahora busque el primero de la lista que dice 'Para Matrícula'. Ponga el RUT deseado y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-matricula.png", highlight: "add-to-cart-section-mat" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
        ],
        "nac-asignacion": [
            { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "rc-certs-online.png", highlight: "nacimiento-row" },
            { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el segundo de la lista que dice 'Asignación Familiar'. Ponga el RUT deseado y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-asignacion.png", highlight: "add-to-cart-section-asig" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
        ],
        "nac-todo": [
            { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "rc-certs-online.png", highlight: "nacimiento-row" },
            { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora aparecerá un recuadro abajo. Escriba el RUT deseado y después apriete el botón azul que tiene un dibujo de un carrito y dice 'Agregar al Carro'.", visual: "rc-certs-step2.png", highlight: "add-to-cart-section" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
        ],
        "mat-todo": [
            { title: "Paso 1: Buscar 'Matrimonio'", text: "Primero, busque donde dice 'Matrimonio' con una flechita azul. Tiene que apretar justo ahí para que se abran los papeles de matrimonio.", visual: "rc-certs-mat-def-list.png", highlight: "matrimonio-row" },
            { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora elija la primera opción 'Todo Trámite'. Escriba el RUT de la persona y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-mat-step2.png", highlight: "add-to-cart-mat-todo" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de matrimonio ya esté en su carrito. Estos certificados también son gratis para usted.", visual: "rc-certs-online.png", highlight: "cart-box" }
        ],
        "mat-asignacion": [
            { title: "Paso 1: Buscar 'Matrimonio'", text: "Primero, busque donde dice 'Matrimonio' con una flechita azul. Tiene que apretar justo ahí para que se abran los papeles de matrimonio.", visual: "rc-certs-mat-def-list.png", highlight: "matrimonio-row" },
            { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el segundo de la lista que dice 'Asignación Familiar'. Escriba el RUT de la persona y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-mat-step2.png", highlight: "add-to-cart-mat-asig" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de matrimonio ya esté en su carrito. Estos certificados también son gratis para usted.", visual: "rc-certs-online.png", highlight: "cart-box" }
        ],
        "def-todo": [
            { title: "Paso 1: Buscar 'Defunciones'", text: "Primero, busque donde dice 'Defunciones' con una flechita azul. Tiene que apretar justo ahí para ver las opciones.", visual: "rc-certs-mat-def-list.png", highlight: "defunciones-row" },
            { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora elija la opción 'Para Todo Trámite'. Escriba el RUT de la persona fallecida y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-def-step2.png", highlight: "add-to-cart-def-todo" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de defunción ya esté en su carrito. Es totalmente gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
        ],
        "def-asignacion": [
            { title: "Paso 1: Buscar 'Defunciones'", text: "Primero, busque donde dice 'Defunciones' con una flechita azul. Tiene que apretar justo ahí para ver las opciones.", visual: "rc-certs-mat-def-list.png", highlight: "defunciones-row" },
            { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el que dice 'Asignación Familiar'. Escriba el RUT de la persona fallecida y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "rc-certs-def-step2.png", highlight: "add-to-cart-def-asig" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de defunción ya esté en su carrito. Es totalmente gratis.", visual: "rc-certs-online.png", highlight: "cart-box" }
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
