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

export function validateRut(rut) {
    const value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (value.length < 2) return false;

    const body = value.slice(0, -1);
    const dv   = value.slice(-1);

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
