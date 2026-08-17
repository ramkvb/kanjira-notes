/**
 * DrumGrid - Interactive drum pattern grid controller
 * Manages grid rendering, cell toggling, playback cursor, and auto-save.
 */

const STROKES = ['Tha', 'Thi', 'Thom', 'Naam'];
const STROKE_COLORS = {
    'Tha':  'hsl(38, 90%, 55%)',    // Amber - Open tone
    'Thi':  'hsl(200, 80%, 55%)',   // Blue - Finger tip
    'Thom': 'hsl(260, 70%, 60%)',   // Purple - Bass/muted
    'Naam': 'hsl(350, 75%, 55%)',   // Red - Slap
};

class DrumGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.patternId = parseInt(this.container.dataset.patternId);
        this.bpm = parseInt(this.container.dataset.bpm) || 80;
        this.beatsPerCycle = parseInt(this.container.dataset.beats) || 4;
        this.notesPerBeat = parseInt(this.container.dataset.notes) || 4;

        // Parse existing pattern data
        let rawData = this.container.dataset.pattern || '{}';
        try {
            this.gridData = JSON.parse(rawData);
        } catch {
            this.gridData = {};
        }

        // Ensure all strokes exist
        for (const stroke of STROKES) {
            if (!Array.isArray(this.gridData[stroke])) {
                this.gridData[stroke] = new Array(this.totalNotes).fill(false);
            }
        }

        this.metronome = new Metronome();
        this.isPlaying = false;
        this.currentNoteIndex = -1;
        this.saveTimeout = null;

        this._bindControls();
        this._renderGrid();
    }

    get totalNotes() {
        return this.beatsPerCycle * this.notesPerBeat;
    }

    _bindControls() {
        const id = this.patternId;

        // BPM slider
        const bpmSlider = document.getElementById(`bpm-slider-${id}`);
        if (bpmSlider) {
            bpmSlider.addEventListener('input', (e) => {
                this.bpm = parseInt(e.target.value);
                this.metronome.bpm = this.bpm;
                this._debounceSave();
            });
        }

        // Beats per cycle
        const beatsSelect = document.getElementById(`beats-${id}`);
        if (beatsSelect) {
            beatsSelect.addEventListener('change', (e) => {
                this.beatsPerCycle = parseInt(e.target.value);
                this._resizeGrid();
                this._renderGrid();
                this._debounceSave();
            });
        }

        // Notes per beat
        const notesSelect = document.getElementById(`notes-${id}`);
        if (notesSelect) {
            notesSelect.addEventListener('change', (e) => {
                this.notesPerBeat = parseInt(e.target.value);
                this._resizeGrid();
                this._renderGrid();
                this._debounceSave();
            });
        }

        // Play/Stop button
        const playBtn = document.getElementById(`play-btn-${id}`);
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }

        // Clear button
        const clearBtn = document.getElementById(`clear-btn-${id}`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearGrid());
        }

        // Metronome toggle
        const metToggle = document.getElementById(`metronome-toggle-${id}`);
        if (metToggle) {
            metToggle.addEventListener('change', (e) => {
                this.metronome.metronomeEnabled = e.target.checked;
            });
        }

        // Sound mode toggle (Instrument / Voice)
        const soundModeContainer = document.getElementById(`sound-mode-${id}`);
        if (soundModeContainer) {
            soundModeContainer.querySelectorAll('.segment').forEach(btn => {
                btn.addEventListener('click', () => {
                    const mode = btn.dataset.mode;
                    window.kanjiraSounds.setMode(mode);
                    // Update active state on all grids' toggles
                    document.querySelectorAll('.sound-mode-toggle').forEach(container => {
                        container.querySelectorAll('.segment').forEach(s => {
                            s.classList.toggle('active', s.dataset.mode === mode);
                        });
                    });
                });
            });
        }
    }

    _resizeGrid() {
        const newTotal = this.totalNotes;
        for (const stroke of STROKES) {
            const current = this.gridData[stroke] || [];
            if (current.length < newTotal) {
                this.gridData[stroke] = [...current, ...new Array(newTotal - current.length).fill(false)];
            } else if (current.length > newTotal) {
                this.gridData[stroke] = current.slice(0, newTotal);
            }
        }
    }

    _renderGrid() {
        const id = this.patternId;
        const tbody = document.getElementById(`grid-body-${id}`);
        const thead = document.getElementById(`beat-numbers-${id}`);
        if (!tbody || !thead) return;

        // Render beat number headers
        let headerHtml = '<th class="stroke-label-header"></th>';
        for (let b = 0; b < this.beatsPerCycle; b++) {
            for (let n = 0; n < this.notesPerBeat; n++) {
                const noteIdx = b * this.notesPerBeat + n;
                const isFirstOfBeat = n === 0;
                const beatClass = isFirstOfBeat ? 'beat-start' : '';
                const label = isFirstOfBeat ? (b + 1) : '';
                headerHtml += `<th class="beat-header ${beatClass}" data-note="${noteIdx}">${label}</th>`;
            }
        }
        thead.innerHTML = headerHtml;

        // Render stroke rows
        let bodyHtml = '';
        for (const stroke of STROKES) {
            bodyHtml += `<tr class="stroke-row" data-stroke="${stroke}">`;
            bodyHtml += `<td class="stroke-label" style="--stroke-color: ${STROKE_COLORS[stroke]}">
                            <span class="stroke-name">${stroke}</span>
                         </td>`;

            for (let b = 0; b < this.beatsPerCycle; b++) {
                for (let n = 0; n < this.notesPerBeat; n++) {
                    const noteIdx = b * this.notesPerBeat + n;
                    const isActive = this.gridData[stroke]?.[noteIdx] || false;
                    const isFirstOfBeat = n === 0;
                    const activeClass = isActive ? 'active' : '';
                    const beatClass = isFirstOfBeat ? 'beat-start' : '';

                    bodyHtml += `<td class="grid-cell ${activeClass} ${beatClass}"
                                     data-stroke="${stroke}"
                                     data-note="${noteIdx}"
                                     style="--stroke-color: ${STROKE_COLORS[stroke]}"
                                     id="cell-${id}-${stroke}-${noteIdx}">
                                     <div class="cell-inner"></div>
                                </td>`;
                }
            }
            bodyHtml += '</tr>';
        }
        tbody.innerHTML = bodyHtml;

        // Bind cell click/touch events using pointer events for unified handling
        tbody.querySelectorAll('.grid-cell').forEach(cell => {
            cell.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this._toggleCell(cell);
            });
        });
    }

    async _toggleCell(cell) {
        const stroke = cell.dataset.stroke;
        const noteIdx = parseInt(cell.dataset.note);

        if (!this.gridData[stroke]) this.gridData[stroke] = new Array(this.totalNotes).fill(false);

        this.gridData[stroke][noteIdx] = !this.gridData[stroke][noteIdx];
        cell.classList.toggle('active');

        // Play sound preview on toggle-on
        if (this.gridData[stroke][noteIdx]) {
            await window.kanjiraSounds.init();
            window.kanjiraSounds.play(stroke);
        }

        this._debounceSave();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    async start() {
        await window.kanjiraSounds.init();
        window.kanjiraSounds.ensureResumed();

        this.isPlaying = true;
        const id = this.patternId;

        // Update button
        const playBtn = document.getElementById(`play-btn-${id}`);
        if (playBtn) {
            playBtn.classList.add('playing');
            playBtn.querySelector('.play-icon').textContent = '⏹';
            playBtn.querySelector('.play-text').textContent = 'Stop';
        }

        // Configure metronome
        this.metronome.bpm = this.bpm;
        this.metronome.beatsPerCycle = this.beatsPerCycle;
        this.metronome.notesPerBeat = this.notesPerBeat;

        this.metronome.onNote = (noteIndex, time) => {
            this._onNote(noteIndex, time);
        };

        this.metronome.start();
    }

    stop() {
        this.isPlaying = false;
        this.metronome.stop();

        const id = this.patternId;

        // Update button
        const playBtn = document.getElementById(`play-btn-${id}`);
        if (playBtn) {
            playBtn.classList.remove('playing');
            playBtn.querySelector('.play-icon').textContent = '▶';
            playBtn.querySelector('.play-text').textContent = 'Play';
        }

        // Clear cursor
        this._clearCursor();
    }

    _onNote(noteIndex, time) {
        const id = this.patternId;

        // Update cursor position
        this._updateCursor(noteIndex);

        // Play active strokes at this position
        for (const stroke of STROKES) {
            if (this.gridData[stroke]?.[noteIndex]) {
                window.kanjiraSounds.play(stroke, time);
            }
        }
    }

    _updateCursor(noteIndex) {
        const id = this.patternId;

        // Remove previous highlight
        this.container.querySelectorAll('.grid-cell.current').forEach(c => c.classList.remove('current'));
        this.container.querySelectorAll('.beat-header.current').forEach(c => c.classList.remove('current'));

        // Add current highlight
        for (const stroke of STROKES) {
            const cell = document.getElementById(`cell-${id}-${stroke}-${noteIndex}`);
            if (cell) cell.classList.add('current');
        }

        // Highlight beat header
        const headers = this.container.querySelectorAll(`.beat-header[data-note="${noteIndex}"]`);
        headers.forEach(h => h.classList.add('current'));

        // Auto-scroll to keep cursor visible
        const firstCell = document.getElementById(`cell-${id}-${STROKES[0]}-${noteIndex}`);
        if (firstCell) {
            const wrapper = this.container.querySelector('.grid-scroll-wrapper');
            if (wrapper) {
                const cellRect = firstCell.getBoundingClientRect();
                const wrapperRect = wrapper.getBoundingClientRect();
                if (cellRect.left < wrapperRect.left || cellRect.right > wrapperRect.right) {
                    firstCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        }
    }

    _clearCursor() {
        this.container.querySelectorAll('.grid-cell.current').forEach(c => c.classList.remove('current'));
        this.container.querySelectorAll('.beat-header.current').forEach(c => c.classList.remove('current'));
    }

    clearGrid() {
        for (const stroke of STROKES) {
            this.gridData[stroke] = new Array(this.totalNotes).fill(false);
        }
        this.container.querySelectorAll('.grid-cell.active').forEach(c => c.classList.remove('active'));
        this._debounceSave();
    }

    _debounceSave() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this._save(), 800);
    }

    async _save() {
        try {
            await fetch(`/api/patterns/${this.patternId}/grid`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patternData: JSON.stringify(this.gridData),
                    bpm: this.bpm,
                    beatsPerCycle: this.beatsPerCycle,
                    notesPerBeat: this.notesPerBeat
                })
            });
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    }
}

// Initialize all grids on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.drum-grid-container').forEach(container => {
        new DrumGrid(container.id);
    });
});
