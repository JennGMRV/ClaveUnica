const synth = window.speechSynthesis;

// Variables de módulo para el lector avanzado
let readerUtterance = null;

export function getFemaleLatamVoice() {
    const voices = synth.getVoices();
    const preferredLangs = ['es-CL', 'es-MX', 'es-AR', 'es-CO', 'es-US', 'es-ES'];

    for (const lang of preferredLangs) {
        const voice = voices.find(v =>
            v.lang.replace('_', '-').startsWith(lang) &&
            (v.name.toLowerCase().includes('female') ||
             v.name.toLowerCase().includes('mujer')  ||
             v.name.toLowerCase().includes('sabina') ||
             v.name.toLowerCase().includes('helena') ||
             v.name.toLowerCase().includes('zira')   ||
             v.name.toLowerCase().includes('paul'))
        );
        if (voice) return voice;
    }
    return voices.find(v => v.lang.startsWith('es')) || null;
}

export function stopSpeaking() {
    if (synth.speaking) synth.cancel();
    document.querySelectorAll('.btn-audio').forEach(btn => btn.classList.remove('playing'));
}

export function speakText(text, button) {
    if (synth.speaking && button.classList.contains('playing')) {
        stopSpeaking();
        return;
    }
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getFemaleLatamVoice();
    if (voice) utterance.voice = voice;
    utterance.lang  = 'es-CL';
    utterance.rate  = 0.75;
    utterance.pitch = 1.05;

    utterance.onstart = () => button.classList.add('playing');
    utterance.onend   = () => button.classList.remove('playing');
    utterance.onerror = () => button.classList.remove('playing');

    synth.speak(utterance);
}

export function prepareTextForHighlighting(container) {
    if (container.querySelector('.reader-word')) return;
    const targets = container.querySelectorAll('h1, h2, .subtitle, label, .flow-item, .key-item p, .wcag-card p, .shield-point');
    targets.forEach(el => {
        el.innerHTML = el.innerText.split(/(\s+)/).map(part =>
            part.trim().length === 0 ? part : `<span class="reader-word">${part}</span>`
        ).join('');
    });
}

export function startAdvancedReader(textElement, toolbar) {
    stopAdvancedReader();

    const wordSpans = Array.from(textElement.querySelectorAll('.reader-word'));
    const fullText  = textElement.innerText;

    if (wordSpans.length === 0) {
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

    const status  = toolbar.querySelector('.reader-status');
    const playBtn = toolbar.querySelector('.btn-play');

    readerUtterance.onboundary = (event) => {
        if (event.name !== 'word') return;
        document.querySelectorAll('.highlight-word').forEach(el => el.classList.remove('highlight-word'));

        let currentPos = 0;
        for (const span of wordSpans) {
            if (currentPos >= event.charIndex) {
                span.classList.add('highlight-word');
                span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
            currentPos += span.innerText.length + 1;
        }
    };

    readerUtterance.onstart = () => {
        if (status)  status.innerText = 'Leyendo...';
        if (playBtn) playBtn.classList.add('active');
    };

    readerUtterance.onend = () => stopAdvancedReader();

    synth.speak(readerUtterance);
}

export function stopAdvancedReader() {
    synth.cancel();
    document.querySelectorAll('.highlight-word').forEach(el => el.classList.remove('highlight-word'));
    document.querySelectorAll('.reader-toolbar').forEach(tb => {
        const status  = tb.querySelector('.reader-status');
        const playBtn = tb.querySelector('.btn-play');
        if (status)  status.innerText = 'Escuchar';
        if (playBtn) { playBtn.innerHTML = '▶️'; playBtn.classList.remove('active'); }
    });
}
