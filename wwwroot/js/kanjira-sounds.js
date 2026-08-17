/**
 * Kanjira Sounds - Real audio sample playback
 * Uses recorded .wav samples for authentic Kanjira strokes:
 * Tha, Thi, Thom, Naam
 */
class KanjiraSounds {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.buffers = {};
        this.loaded = false;
        this.loading = false;
    }

    async init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
        await this._loadSamples();
    }

    ensureResumed() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    async _loadSamples() {
        if (this.loaded || this.loading) return;
        this.loading = true;

        const strokes = {
            'Tha':  '/sounds/tha.wav',
            'Thi':  '/sounds/thi.wav',
            'Thom': '/sounds/thom.wav',
            'Naam': '/sounds/naam.wav'
        };

        const loadPromises = Object.entries(strokes).map(async ([name, url]) => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                this.buffers[name] = await this.ctx.decodeAudioData(arrayBuffer);
            } catch (err) {
                console.warn(`Failed to load sample for ${name}:`, err);
            }
        });

        await Promise.all(loadPromises);
        this.loaded = true;
        this.loading = false;
        console.log('Kanjira samples loaded:', Object.keys(this.buffers).join(', '));
    }

    /**
     * Play a stroke at the given time (or immediately if not specified)
     * @param {string} stroke - One of: Tha, Thi, Thom, Naam
     * @param {number} time - AudioContext time to play at (0 = now)
     */
    play(stroke, time) {
        if (!this.ctx) {
            this.init();
            return;
        }
        this.ensureResumed();

        const buffer = this.buffers[stroke];
        if (!buffer) {
            // Fallback: if samples not loaded yet, use synthesis
            this._playSynthFallback(stroke, time);
            return;
        }

        const t = time || this.ctx.currentTime;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Gain node for volume control
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.0, t);

        source.connect(gain).connect(this.ctx.destination);
        source.start(t);
    }

    // Fallback synthesis if samples haven't loaded yet
    _playSynthFallback(stroke, time) {
        const t = time || this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        switch (stroke) {
            case 'Tha':
                osc.frequency.setValueAtTime(240, t);
                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                break;
            case 'Thi':
                osc.frequency.setValueAtTime(380, t);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                break;
            case 'Thom':
                osc.frequency.setValueAtTime(130, t);
                gain.gain.setValueAtTime(0.6, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                break;
            case 'Naam':
                osc.frequency.setValueAtTime(700, t);
                osc.frequency.exponentialRampToValueAtTime(350, t + 0.1);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                break;
            default:
                return;
        }

        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    // Metronome click (always synthesized)
    playClick(time, accent) {
        if (!this.ctx) {
            this.init();
            return;
        }
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
