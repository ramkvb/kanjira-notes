/**
 * Kanjira Sounds - Web Audio API synthesized strokes
 * Each stroke has a unique timbral character matching real Kanjira sounds.
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
     * @param {string} stroke - One of: Ta, Di, Tom, Nam, Tha, Ki
     * @param {number} time - AudioContext time to play at (0 = now)
     */
    play(stroke, time) {
        if (!this.ctx) this.init();
        this.ensureResumed();
        const t = time || this.ctx.currentTime;

        switch (stroke) {
            case 'Ta': this._playTa(t); break;
            case 'Di': this._playDi(t); break;
            case 'Tom': this._playTom(t); break;
            case 'Nam': this._playNam(t); break;
            case 'Tha': this._playTha(t); break;
            case 'Ki': this._playKi(t); break;
        }
    }

    // Ta - Open center tone: mid-freq sine, medium decay
    _playTa(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.15);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
    }

    // Di - Bass tone: low-freq sine, longer sustain
    _playDi(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }

    // Tom - Muted tone: mid-freq, very short decay, low gain
    _playTom(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    // Nam - Open slap: noise burst + high sine
    _playNam(t) {
        // Noise component
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        noise.connect(noiseGain).connect(this.ctx.destination);
        noise.start(t);

        // Tone component
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    // Tha - Resonant open: like Ta with added overtones
    _playTha(t) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(240, t);
        osc1.frequency.exponentialRampToValueAtTime(200, t + 0.2);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, t);
        osc2.frequency.exponentialRampToValueAtTime(380, t + 0.15);
        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.setValueAtTime(0.15, t);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc1.connect(gain).connect(this.ctx.destination);
        osc2.connect(osc2Gain).connect(gain);
        osc1.start(t);
        osc1.stop(t + 0.3);
        osc2.start(t);
        osc2.stop(t + 0.3);
    }

    // Ki - Fingertip tap: high-freq click, very short
    _playKi(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.02);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
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
