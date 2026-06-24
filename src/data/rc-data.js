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
                { id: "veh-anotaciones", name: "Certificado Anotaciones Vigentes",             cu: false, desc: "Muestra anotaciones y datos del vehículo." },
                { id: "veh-multas",      name: "Certificado de Multas de Tránsito",            cu: false, desc: "Revisa multas y deudas de tránsito." }
            ]
        },
        prendas: {
            title: "Prendas",
            certs: [
                { id: "prendas-natural", name: "Cert. Histórico Prendas Persona Natural",      cu: false, desc: "Registro histórico de prendas a su nombre." }
            ]
        },
        profesionales: {
            title: "Profesionales",
            certs: [
                { id: "prof-certif",     name: "Certificado Profesionales",                    cu: false, desc: "Acredita títulos profesionales registrados." }
            ]
        },
        acuerdo_civil: {
            title: "Acuerdo Unión Civil",
            certs: [
                { id: "auc-todo",        name: "Certificado Acuerdo Unión Civil Todo Trámite", cu: false, desc: "Acredita el Acuerdo de Unión Civil." }
            ]
        },
        discapacidad: {
            title: "Discapacidad",
            certs: [
                { id: "disc-credencial", name: "Credencial de Discapacidad",                   cu: true,  desc: "Acredita la condición de discapacidad." },
                { id: "disc-certif",     name: "Certificado de Discapacidad",                  cu: true,  desc: "Para trámites que requieren acreditación." }
            ]
        },
        persona_juridica: {
            title: "Persona Jurídica",
            certs: [
                { id: "pj-directorio",   name: "Cert. Directorio Persona Jurídica",            cu: false, desc: "Para corporaciones sin fines de lucro." }
            ]
        },
        posesion_efectiva: {
            title: "Posesión Efectiva",
            certs: [
                { id: "pe-certif",       name: "Certificado de Posesión Efectiva",             cu: false, desc: "Para tramitar herencias y sucesiones." },
                { id: "pe-testamento",   name: "Informes de Inscripción de Testamentos",       cu: false, desc: "Verifica testamentos inscritos." }
            ]
        }
    },
    steps: {
        "nac-matricula": [
            { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "nacimiento_1.jpeg" },
            { title: "Paso 2: Elegir Matrícula", text: "Ahora busque el primero de la lista que dice 'Para Matrícula'. Ponga el RUT deseado y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "nacimiento_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "carro_6.jpeg" }
        ],
        "nac-asignacion": [
            { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "nacimiento_1.jpeg" },
            { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el segundo de la lista que dice 'Asignación Familiar'. Ponga el RUT deseado y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "nacimiento_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "carro_6.jpeg" }
        ],
        "nac-todo": [
            { title: "Paso 1: Buscar la palabra 'Nacimiento'", text: "Primero, mire la pantalla y busque donde dice 'Nacimiento' con una flechita azul. Tiene que apretar justo ahí para que se abran las opciones.", visual: "nacimiento_1.jpeg" },
            { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora aparecerá un recuadro abajo. Escriba el RUT deseado y después apriete el botón azul que tiene un dibujo de un carrito y dice 'Agregar al Carro'.", visual: "nacimiento_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Ahora verá que el papel ya está en su carrito a la derecha. Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos y el número de su carnet, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que todo esté bien en el dibujo del carrito. No se asuste por el precio, estos certificados de nacimiento son gratis.", visual: "carro_6.jpeg" }
        ],
        "mat-todo": [
            { title: "Paso 1: Buscar 'Matrimonio'", text: "Primero, busque donde dice 'Matrimonio' con una flechita azul. Tiene que apretar justo ahí para que se abran los papeles de matrimonio.", visual: "matrimonio_1.jpeg" },
            { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora elija la primera opción 'Todo Trámite'. Escriba el RUT de la persona y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "matrimonio_todo_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de matrimonio ya esté en su carrito. Estos certificados también son gratis para usted.", visual: "carro_6.jpeg" }
        ],
        "mat-asignacion": [
            { title: "Paso 1: Buscar 'Matrimonio'", text: "Primero, busque donde dice 'Matrimonio' con una flechita azul. Tiene que apretar justo ahí para que se abran los papeles de matrimonio.", visual: "matrimonio_1.jpeg" },
            { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el segundo de la lista que dice 'Asignación Familiar'. Escriba el RUT de la persona y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "matrimonio_todo_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de matrimonio ya esté en su carrito. Estos certificados también son gratis para usted.", visual: "carro_6.jpeg" }
        ],
        "def-todo": [
            { title: "Paso 1: Buscar 'Defunciones'", text: "Primero, busque donde dice 'Defunciones' con una flechita azul. Tiene que apretar justo ahí para ver las opciones.", visual: "defuncion_1.jpeg" },
            { title: "Paso 2: Poner el RUT y Agregar", text: "Ahora elija la opción 'Para Todo Trámite'. Escriba el RUT de la persona fallecida y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "defuncion_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de defunción ya esté en su carrito. Es totalmente gratis.", visual: "carro_6.jpeg" }
        ],
        "def-asignacion": [
            { title: "Paso 1: Buscar 'Defunciones'", text: "Primero, busque donde dice 'Defunciones' con una flechita azul. Tiene que apretar justo ahí para ver las opciones.", visual: "defuncion_1.jpeg" },
            { title: "Paso 2: Elegir Asignación Familiar", text: "Ahora busque el que dice 'Asignación Familiar'. Escriba el RUT de la persona fallecida y después apriete el botón azul que dice 'Agregar al Carro'.", visual: "defuncion_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Finalmente, revise que el certificado de defunción ya esté en su carrito. Es totalmente gratis.", visual: "carro_6.jpeg" }
        ],
        "ant-fines-particulares": [
            { title: "Paso 1: Buscar 'Antecedentes'", text: "Busque donde dice 'Antecedentes' con una flechita azul y apriete ahí para que se abra la lista. Verá varios certificados de antecedentes disponibles.", visual: "antecedentes_1.jpeg" },
            { title: "Paso 2: Elegir Fines Particulares y agregar", text: "Busque el que dice 'Certificado Antecedentes Fines Particulares'. Apriete en el nombre y se abrirá un recuadro. Escriba su RUT y apriete 'Agregar al Carro'.", visual: "antecedentes_1.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de antecedentes ya esté en su carrito. Este certificado es gratuito.", visual: "carro_6.jpeg" }
        ],
        "ant-fines-especiales": [
            { title: "Paso 1: Buscar 'Antecedentes'", text: "Busque donde dice 'Antecedentes' con una flechita azul y apriete ahí para que se abra la lista. Verá varios certificados de antecedentes disponibles.", visual: "antecedentes_1.jpeg" },
            { title: "Paso 2: Elegir Fines Especiales y agregar", text: "Busque el que dice 'Certificado Antecedentes Fines Especiales'. Apriete en el nombre y se abrirá un recuadro. Escriba su RUT y apriete 'Agregar al Carro'.", visual: "antecedentes_1.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de antecedentes ya esté en su carrito. Este certificado es gratuito.", visual: "carro_6.jpeg" }
        ],
        "veh-anotaciones": [
            { title: "Paso 1: Buscar 'Vehículos'", text: "Busque donde dice 'Vehículos' con una flechita azul y apriete ahí para que se abra la lista de certificados de vehículos.", visual: "vehiculos_1.jpeg" },
            { title: "Paso 2: Elegir el certificado y poner la Patente", text: "Marque el recuadro del certificado que necesita. Luego escriba la patente del vehículo en el recuadro que dice 'Patente' y apriete el botón azul 'Agregar al Carro'.", visual: "vehiculos_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado del vehículo ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "veh-multas": [
            { title: "Paso 1: Buscar 'Vehículos'", text: "Busque donde dice 'Vehículos' con una flechita azul y apriete ahí para que se abra la lista de certificados de vehículos.", visual: "vehiculos_1.jpeg" },
            { title: "Paso 2: Elegir Multas y poner la Patente", text: "Marque el recuadro del 'Certificado Vehículos de Multas'. Luego escriba la patente del vehículo en el recuadro que dice 'Patente' y apriete el botón azul 'Agregar al Carro'.", visual: "vehiculos_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de multas ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "prendas-natural": [
            { title: "Paso 1: Buscar 'Prendas'", text: "Busque donde dice 'Prendas' con una flechita azul y apriete ahí para que se abra la lista de certificados de prendas.", visual: "prendas_1.jpeg" },
            { title: "Paso 2: Elegir el certificado y poner el RUT", text: "Marque el recuadro del certificado que necesita. Luego escriba el RUT de la persona en el recuadro y apriete el botón azul 'Agregar al Carro'.", visual: "prendas_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de prendas ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "prof-certif": [
            { title: "Paso 1: Buscar 'Profesionales'", text: "Busque donde dice 'Profesionales' con una flechita azul y apriete ahí para que se abra la sección.", visual: "profesionales_1.jpeg" },
            { title: "Paso 2: Elegir el certificado y poner el RUT", text: "Marque el recuadro del 'Certificado Profesionales'. Escriba el RUT de la persona en el recuadro y apriete el botón azul 'Agregar al Carro'.", visual: "profesionales_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado profesional ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "auc-todo": [
            { title: "Paso 1: Buscar 'Acuerdo Unión Civil'", text: "Busque donde dice 'Acuerdo Union Civil' con una flechita azul y apriete ahí para que se abra la sección.", visual: "auc_1.jpeg" },
            { title: "Paso 2: Elegir el certificado y poner el RUT", text: "Marque el recuadro del 'Certificado Acuerdo Union Civil Todo Tramite'. Escriba el RUT de la persona en el recuadro y apriete el botón azul 'Agregar al Carro'.", visual: "auc_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de Acuerdo de Unión Civil ya esté en su carrito. Este certificado es gratuito.", visual: "carro_6.jpeg" }
        ],
        "disc-credencial": [
            { title: "Paso 1: Buscar 'Discapacidad'", text: "Busque donde dice 'Discapacidad' con una flechita azul y apriete ahí para que se abra la lista de certificados disponibles.", visual: "discapacidad_1.jpeg" },
            { title: "Paso 2: Elegir la Credencial y agregar", text: "Marque el recuadro que dice 'Credencial Discapacidad'. Escriba el RUT de la persona y apriete el botón azul 'Agregar al Carro'. Este trámite requiere Clave Única.", visual: "discapacidad_1.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que la credencial de discapacidad ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "disc-certif": [
            { title: "Paso 1: Buscar 'Discapacidad'", text: "Busque donde dice 'Discapacidad' con una flechita azul y apriete ahí para que se abra la lista de certificados disponibles.", visual: "discapacidad_1.jpeg" },
            { title: "Paso 2: Elegir Certificado de Discapacidad y agregar", text: "Marque el recuadro que dice 'Certificado Discapacidad'. Escriba el RUT de la persona y apriete el botón azul 'Agregar al Carro'. Este trámite requiere Clave Única.", visual: "discapacidad_1.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de discapacidad ya esté en su carrito. Este certificado es gratuito.", visual: "carro_6.jpeg" }
        ],
        "pj-directorio": [
            { title: "Paso 1: Buscar 'Persona Jurídica'", text: "Busque donde dice 'Persona Jurídica' con una flechita azul y apriete ahí para ver los certificados disponibles para organizaciones.", visual: "personajuridica_1.jpeg" },
            { title: "Paso 2: Elegir el certificado y poner el Nº de Registro", text: "Marque el recuadro del certificado que necesita. En el recuadro que aparece abajo escriba el Número de Registro de la organización (no es un RUT) y apriete 'Agregar al Carro'.", visual: "personajuridica_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de Persona Jurídica ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "pe-certif": [
            { title: "Paso 1: Buscar 'Posesión Efectiva'", text: "Busque donde dice 'Posesión Efectiva' con una flechita azul y apriete ahí para ver los certificados de herencia disponibles.", visual: "posesion_1.jpeg" },
            { title: "Paso 2: Marcar 'Certificado de Posesión Efectiva'", text: "Marque el recuadro que dice 'Certificado de Posesión Efectiva'. Aparecerá una ventana especial pidiendo el RUT del causante (la persona fallecida). Escríbalo y apriete 'Agregar Al Carro'.", visual: "posesion_4.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el certificado de posesión efectiva ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ],
        "pe-testamento": [
            { title: "Paso 1: Buscar 'Posesión Efectiva'", text: "Busque donde dice 'Posesión Efectiva' con una flechita azul y apriete ahí para ver los certificados de herencia disponibles.", visual: "posesion_1.jpeg" },
            { title: "Paso 2: Elegir Testamentos y poner el RUT", text: "Marque el recuadro del 'Informes de Inscripción de Testamentos'. Escriba el RUT de la persona y apriete el botón azul 'Agregar al Carro'.", visual: "posesion_2.jpeg" },
            { title: "Paso 3: Resolver el desafío", text: "Ahora verá un dibujo con letras raras. Esto es para saber que usted es una persona y no un robot. Solo tiene que escribir esas mismas letras en el cuadrito blanco y después apretar el botón que dice 'submit'.", visual: "rc-certs-captcha.png", highlight: "captcha-section" },
            { title: "Paso 4: Poner sus datos", text: "Abajo tiene que poner sus datos: su RUT, su número de carnet y su correo electrónico. El número de carnet está donde dice 'Número Documento', como se ve en el ejemplo de abajo.", visual: "rc-certs-solicitante.png", highlight: "solicitante-section", secondaryVisual: "chilean-id-example.png", secondaryHighlight: "id-doc-number" },
            { title: "Paso 5: Apretar en Continuar", text: "Una vez que ya puso todos sus datos, tiene que bajar un poquito y apretar el botón azul de abajo que dice 'Continuar'.", visual: "rc-certs-filled.png", highlight: "continue-btn" },
            { title: "Paso 6: Ver su carro", text: "Revise que el informe de testamentos ya esté en su carrito. Este certificado tiene un costo que verá indicado en el carrito.", visual: "carro_6.jpeg" }
        ]
    }
};
