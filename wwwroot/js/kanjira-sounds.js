/**
 * Kanjira Sounds - Web Audio API synthesized strokes
 * 4 core strokes matching traditional Kanjira syllables:
 * Tha, Thi, Thom, Naam
 */
class KanjiraSounds {
    constructor() {
        this.ctx = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    }

    ensureResumed() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Play a stroke at the given time (or immediately if not specified)
     * @param {string} stroke - One of: Tha, Thi, Thom, Naam
     * @param {number} time - AudioContext time to play at (0 = now)
     */
    play(stroke, time) {
        if (!this.ctx) this.init();
        this.ensureResumed();
        const t = time || this.ctx.currentTime;

        switch (stroke) {
            case 'Tha': this._playTha(t); break;
            case 'Thi': this._playThi(t); break;
            case 'Thom': this._playThom(t); break;
            case 'Naam': this._playNaam(t); break;
        }
    }

    // Tha - Open tone: mid-freq sine, medium decay (fundamental open stroke)
    _playTha(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        // Add subtle overtone for warmth
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, t);
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        gain2.gain.setValueAtTime(0.12, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain).connect(this.ctx.destination);
        osc2.connect(gain2).connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.3);
        osc2.start(t); osc2.stop(t + 0.15);
    }

    // Thi - Finger tip tone: higher pitch, shorter decay (lighter touch)
    _playThi(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.18);
    }

    // Thom - Bass/muted tone: low-freq, warm, medium sustain
    _playThom(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.25);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        // Sub-bass warmth
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(80, t);
        gain2.gain.setValueAtTime(0.15, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain).connect(this.ctx.destination);
        osc2.connect(gain2).connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.35);
        osc2.start(t); osc2.stop(t + 0.2);
    }

    // Naam - Slap/open: noise burst + resonant tone (sharp attack)
    _playNaam(t) {
        // Noise burst for the slap attack
        const bufferSize = this.ctx.sampleRate * 0.06;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // Resonant tone
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.1);
        oscGain.gain.setValueAtTime(0.35, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        noise.connect(noiseGain).connect(this.ctx.destination);
        osc.connect(oscGain).connect(this.ctx.destination);
        noise.start(t);
        osc.start(t); osc.stop(t + 0.15);
    }

    // Metronome click
    playClick(time, accent) {
        if (!this.ctx) this.init();
        this.ensureResumed();
        const t = time || this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(accent ? 1000 : 800, t);
        gain.gain.setValueAtTime(accent ? 0.3 : 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.03);
    }

    get currentTime() {
        return this.ctx ? this.ctx.currentTime : 0;
    }
}

// Global singleton
window.kanjiraSounds = new KanjiraSounds();
