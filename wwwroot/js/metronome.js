/**
 * Metronome - Web Audio API based with lookahead scheduling
 * Provides sample-accurate timing even on mobile browsers.
 */
class Metronome {
    constructor() {
        this._bpm = 80;
        this.beatsPerCycle = 4;
        this.notesPerBeat = 4;
        this.isPlaying = false;
        this.metronomeEnabled = true;

        // Lookahead scheduling — tighter for better sync
        this.scheduleAheadTime = 0.1;  // seconds to look ahead
        this.lookAhead = 15;           // ms between scheduler calls (tighter)

        this.currentNote = 0;
        this.nextNoteTime = 0;
        this.timerID = null;

        // Callbacks
        this.onNote = null;    // (noteIndex, time) => void
        this.onBeat = null;    // (beatIndex, time) => void
    }

    get bpm() { return this._bpm; }
    set bpm(val) {
        this._bpm = Math.max(30, Math.min(300, val));
    }

    get totalNotes() {
        return this.beatsPerCycle * this.notesPerBeat;
    }

    get secondsPerNote() {
        // BPM is beats per minute. Each beat has notesPerBeat subdivisions.
        // secondsPerBeat = 60 / BPM
        // secondsPerNote = secondsPerBeat / notesPerBeat
        return 60.0 / this._bpm / this.notesPerBeat;
    }

    async start() {
        if (this.isPlaying) return;

        const sounds = window.kanjiraSounds;
        await sounds.init();
        sounds.ensureResumed();

        this.isPlaying = true;
        this.currentNote = 0;
        // Small initial delay to allow audio context to stabilize
        this.nextNoteTime = sounds.currentTime + 0.05;

        this._schedule();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
        this.currentNote = 0;
    }

    _schedule() {
        if (!this.isPlaying) return;

        const sounds = window.kanjiraSounds;
        const ct = sounds.currentTime;

        while (this.nextNoteTime < ct + this.scheduleAheadTime) {
            this._scheduleNote(this.currentNote, this.nextNoteTime);
            this._advanceNote();
        }

        this.timerID = setTimeout(() => this._schedule(), this.lookAhead);
    }

    _scheduleNote(noteIndex, time) {
        const isFirstOfBeat = (noteIndex % this.notesPerBeat) === 0;
        const isFirstOfCycle = noteIndex === 0;

        // Play metronome click on beat boundaries
        if (this.metronomeEnabled && isFirstOfBeat) {
            window.kanjiraSounds.playClick(time, isFirstOfCycle);
        }

        // Schedule visual and stroke callbacks
        // Use the Web Audio clock to compute when to fire the visual update
        const now = window.kanjiraSounds.currentTime;
        const delayMs = Math.max(0, (time - now) * 1000);

        // Fire onNote callback — synced to audio time
        if (this.onNote) {
            setTimeout(() => {
                if (this.isPlaying) {
                    this.onNote(noteIndex, time);
                }
            }, delayMs);
        }

        if (this.onBeat && isFirstOfBeat) {
            const beatIndex = Math.floor(noteIndex / this.notesPerBeat);
            setTimeout(() => {
                if (this.isPlaying) {
                    this.onBeat(beatIndex, time);
                }
            }, delayMs);
        }
    }

    _advanceNote() {
        // Use current secondsPerNote so BPM changes take effect immediately
        this.nextNoteTime += this.secondsPerNote;
        this.currentNote = (this.currentNote + 1) % this.totalNotes;
    }
}

window.Metronome = Metronome;
