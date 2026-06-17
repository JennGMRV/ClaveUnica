import { state } from './state.js';

const synth = window.speechSynthesis;

export function preprocessTextForTTS(text) {
    if (!text) return '';
    let clean = text;
    
    // Convertir "$" a "pesos chilenos"
    clean = clean.replace(/\$\s*([\d\.]+)/g, '$1 pesos chilenos');
    clean = clean.replace(/\$/g, ' pesos chilenos');
    
    // Reemplazar RUN por RUT
    clean = clean.replace(/\bRUN\b/g, 'RUT');
    
    // Siglas y abreviaciones comunes chilenas
    clean = clean.replace(/\bPGU\b/g, 'P G U');
    clean = clean.replace(/\bIPS\b/g, 'I P S');
    clean = clean.replace(/\bAFP\b/g, 'A F P');
    clean = clean.replace(/\bFONASA\b/gi, 'Fonasa');
    
    return clean;
}

// Variables de módulo para el lector avanzado
let readerUtterance = null;

export function getFemaleLatamVoice() {
    const voices = synth.getVoices();
    
    // 1. Intentar buscar voz femenina en dialectos latinoamericanos / neutros preferidos (incluido es-419)
    const preferredLangs = ['es-CL', 'es-MX', 'es-419', 'es-AR', 'es-CO', 'es-US'];
    for (const lang of preferredLangs) {
        const voice = voices.find(v => {
            const normalizedLang = v.lang.replace('_', '-').toLowerCase();
            const normalizedName = v.name.toLowerCase();
            return normalizedLang.startsWith(lang.toLowerCase()) && (
                normalizedName.includes('female') ||
                normalizedName.includes('mujer') ||
                normalizedName.includes('sabina') ||
                normalizedName.includes('helena') ||
                normalizedName.includes('dalia') ||
                normalizedName.includes('zira') ||
                normalizedName.includes('paul') ||
                normalizedName.includes('google')
            );
        });
        if (voice) return voice;
    }

    // 2. Intentar buscar cualquier voz en dialectos latinoamericanos / neutros (no es-ES)
    const latamVoice = voices.find(v => {
        const normalizedLang = v.lang.replace('_', '-').toLowerCase();
        return normalizedLang.startsWith('es') && !normalizedLang.startsWith('es-es');
    });
    if (latamVoice) return latamVoice;

    // 3. Fallback: buscar voz femenina en español de España (es-ES)
    const esFemaleVoice = voices.find(v => {
        const normalizedLang = v.lang.replace('_', '-').toLowerCase();
        const normalizedName = v.name.toLowerCase();
        return normalizedLang.startsWith('es-es') && (
            normalizedName.includes('female') ||
            normalizedName.includes('mujer') ||
            normalizedName.includes('sabina') ||
            normalizedName.includes('helena') ||
            normalizedName.includes('zira')
        );
    });
    if (esFemaleVoice) return esFemaleVoice;

    // 4. Último recurso: cualquier voz que empiece por 'es'
    return voices.find(v => v.lang.toLowerCase().startsWith('es')) || null;
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

    const cleanedText = preprocessTextForTTS(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const voice = getFemaleLatamVoice();
    if (voice) utterance.voice = voice;
    utterance.lang  = 'es-CL';
    utterance.rate  = state.speechRate;
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
        const cleanedText = preprocessTextForTTS(fullText);
        const utt = new SpeechSynthesisUtterance(cleanedText);
        const v = getFemaleLatamVoice();
        if (v) utt.voice = v;
        utt.lang = 'es-CL';
        utt.rate = state.speechRate;
        utt.pitch = 1.05;
        synth.speak(utt);
        return;
    }

    readerUtterance = new SpeechSynthesisUtterance(fullText);
    const voice = getFemaleLatamVoice();
    if (voice) readerUtterance.voice = voice;
    readerUtterance.lang = 'es-CL';
    readerUtterance.rate = state.speechRate;
    readerUtterance.pitch = 1.05;

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
