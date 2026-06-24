export function formatRut(rut) {
    let value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (value.length > 9) value = value.slice(0, 9);
    if (value.length === 0) return '';
    if (value.length > 1) {
        let body = value.slice(0, -1);
        const dv = value.slice(-1);
        body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return body + '-' + dv;
    }
    return value;
}

export function attachRutBlurFeedback(input) {
    input.addEventListener('blur', function () {
        const val = this.value.trim();
        if (!val) { this.classList.remove('rut-valid', 'error-field'); return; }
        if (validateRut(val)) {
            this.classList.add('rut-valid');
            this.classList.remove('error-field');
        } else {
            this.classList.add('error-field');
            this.classList.remove('rut-valid');
        }
    });
    input.addEventListener('input', function () {
        this.classList.remove('rut-valid', 'error-field');
    });
}

export function validateRut(rut) {
    const value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (value.length < 2) return false;

    const body = value.slice(0, -1);
    const dv   = value.slice(-1);

    if (parseInt(body, 10) <= 0) return false;

    let sum = 0;
    let multiple = 2;
    for (let i = 1; i <= body.length; i++) {
        sum += multiple * parseInt(body.charAt(body.length - i));
        multiple = multiple < 7 ? multiple + 1 : 2;
    }

    const expected = 11 - (sum % 11);
    const expectedStr = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
    return expectedStr === dv;
}
