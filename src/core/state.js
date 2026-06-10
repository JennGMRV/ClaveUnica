// Estado global compartido entre módulos.
// Se muta directamente (no se reemplaza el objeto).
export const state = {
    currentScreenKey:    'landing',
    history:             ['landing'],
    postLoginTarget:     'menu',
    autoReadMode:        false,
    currentTutorialSteps:  [],
    currentStepIndex:      0,
    currentTutorialOrigin: 'rcCategories',
    speechRate: 1.05,

    // Variables de selección de certificado
    choiceCertId: null,
    choiceCertName: null,
    choiceCertCu: false,

    // Variables de simulación interactiva
    simActiveCertId: '',
    simActiveCertName: '',
    simActiveCatId: '',
    simCurrentStep: 0,
    simCaptchaText: '',
    simCartRUT: '',
};
