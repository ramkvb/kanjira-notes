/**
 * Metronome - Web Audio API based with lookahead scheduling
 * Provides sample-accurate timing even on mobile browsers.
 */
class Metronome {
    constructor() {
        this.bpm = 80;
        this.beatsPerCycle = 4;
        this.notesPerBeat = 4;
        this.isPlaying = false;
        this.metronomeEnabled = true;

        // Lookahead scheduling
        this.scheduleAheadTime = 0.1;  // seconds to schedule ahead
        this.lookAhead = 25;           // ms between scheduler calls

        this.currentNote = 0;
        this.nextNoteTime = 0;
        this.timerID = null;

        // Callbacks
        this.onNote = null;    // (noteIndex, time) => void
        this.onBeat = null;    // (beatIndex, time) => void
    }

    get totalNotes() {
        return this.beatsPerCycle * this.notesPerBeat;
    }

    get secondsPerNote() {
        return 60.0 / this.bpm / this.notesPerBeat;
    }

    start() {
        if (this.isPlaying) return;

        const sounds = window.kanjiraSounds;
        sounds.init();
        sounds.ensureResumed();

        this.isPlaying = true;
        this.currentNote = 0;
        this.nextNoteTime = sounds.currentTime + 0.05;

        this._schedule();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    _schedule() {
        if (!this.isPlaying) return;

        const sounds = window.kanjiraSounds;

        while (this.nextNoteTime < sounds.currentTime + this.scheduleAheadTime) {
            this._scheduleNote(this.currentNote, this.nextNoteTime);
            this._advanceNote();
        }

        this.timerID = setTimeout(() => this._schedule(), this.lookAhead);
    }

    _scheduleNote(noteIndex, time) {
        const beatIndex = Math.floor(noteIndex / this.notesPerBeat);
        const isFirstOfBeat = (noteIndex % this.notesPerBeat) === 0;
        const isFirstOfCycle = noteIndex === 0;

        // Play metronome click on beats
        if (this.metronomeEnabled && isFirstOfBeat) {
            window.kanjiraSounds.playClick(time, isFirstOfCycle);
        }

        // Fire callbacks
        if (this.onNote) {
            // Use setTimeout to sync visual updates with audio
            const delay = Math.max(0, (time - window.kanjiraSounds.currentTime) * 1000);
            setTimeout(() => {
                if (this.isPlaying) {
                    this.onNote(noteIndex, time);
                }
            }, delay);
        }

        if (this.onBeat && isFirstOfBeat) {
            const delay = Math.max(0, (time - window.kanjiraSounds.currentTime) * 1000);
            setTimeout(() => {
                if (this.isPlaying) {
                    this.onBeat(beatIndex, time);
                }
            }, delay);
        }
    }

    _advanceNote() {
        this.nextNoteTime += this.secondsPerNote;
        this.currentNote = (this.currentNote + 1) % this.totalNotes;
    }
}

window.Metronome = Metronome;
