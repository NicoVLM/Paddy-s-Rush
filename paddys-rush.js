// ─────────────────────────────────────────────
// PADDY'S RUSH – Complete St. Patrick's Game
// ─────────────────────────────────────────────

// Load Celtic-style font for title
const _fontLink = document.createElement('link');
_fontLink.rel = 'stylesheet';
_fontLink.href = 'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap';
document.head.appendChild(_fontLink);

// ═══════════════════════════════════════════
//  MUSIC – Irish jig chiptune + SFX
// ═══════════════════════════════════════════
const PaddyMusic = {
    ctx: null,
    playing: false,
    masterGain: null,
    started: false,
    bpm: 180,

    // Note frequencies
    N: {
        C4:261.63, D4:293.66, E4:329.63, F4:349.23, Fs4:369.99, G4:392.00, A4:440.00, B4:493.88,
        C5:523.25, D5:587.33, E5:659.25,
        C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
        R:0
    },

    // Fast Irish jig melody – D major, lively 6/8 feel
    getMelody() {
        const n = this.N;
        const bpm = this.bpm;
        const beat = 60 / bpm;
        const melody = [
            // ─── Section A: opening jig phrase ───
            [n.D4,.5],[n.Fs4,.5],[n.A4,.5],[n.B4,.5],[n.A4,.5],[n.Fs4,.5],
            [n.D4,.5],[n.E4,.5],[n.Fs4,1],[n.D4,.5],[n.E4,.5],
            [n.Fs4,.5],[n.A4,.5],[n.B4,.5],[n.A4,.5],[n.Fs4,.5],[n.E4,.5],
            [n.D4,1],[n.D4,.5],[n.Fs4,.5],[n.A4,.5],[n.B4,.5],

            // ─── Section A repeat with variation ───
            [n.D5,.5],[n.B4,.5],[n.A4,.5],[n.Fs4,.5],[n.A4,.5],[n.B4,.5],
            [n.D5,1],[n.B4,.5],[n.A4,.5],[n.Fs4,.5],[n.E4,.5],
            [n.D4,.5],[n.Fs4,.5],[n.A4,1],[n.B4,.5],[n.A4,.5],
            [n.Fs4,1],[n.D4,1],[n.E4,.5],[n.Fs4,.5],

            // ─── Section B: ascending energy ───
            [n.A4,.5],[n.B4,.5],[n.D5,1],[n.B4,.5],[n.A4,.5],
            [n.Fs4,.5],[n.A4,.5],[n.B4,.5],[n.A4,.5],[n.Fs4,.5],[n.E4,.5],
            [n.D4,.5],[n.Fs4,.5],[n.A4,.5],[n.D5,.5],[n.E5,.5],[n.D5,.5],
            [n.B4,1],[n.A4,.5],[n.Fs4,.5],[n.D4,.5],[n.E4,.5],

            // ─── Section C: climax reel ───
            [n.Fs4,.5],[n.A4,.5],[n.D5,.5],[n.E5,.5],[n.D5,.5],[n.B4,.5],
            [n.A4,.5],[n.Fs4,.5],[n.D4,1],[n.Fs4,.5],[n.A4,.5],
            [n.B4,.5],[n.D5,.5],[n.B4,.5],[n.A4,.5],[n.Fs4,.5],[n.E4,.5],
            [n.D4,1.5],[n.D4,.5],[n.Fs4,.5],[n.A4,.5],
        ];
        return { notes: melody, beat: beat };
    },

    // Driving bass with jig rhythm
    getBass() {
        const n = this.N;
        const bpm = this.bpm;
        const beat = 60 / bpm;
        const bass = [
            // ─── A ───
            [n.D3,1],[n.A3,.5],[n.A3,.5],[n.D3,1],[n.A3,.5],[n.A3,.5],
            [n.G3,1],[n.D3,.5],[n.D3,.5],[n.G3,.5],[n.A3,.5],
            [n.D3,1],[n.A3,.5],[n.A3,.5],[n.G3,.5],[n.A3,.5],
            [n.D3,1],[n.D3,.5],[n.A3,.5],[n.D3,.5],[n.A3,.5],

            // ─── A repeat ───
            [n.D3,1],[n.A3,.5],[n.A3,.5],[n.D3,1],[n.A3,.5],[n.A3,.5],
            [n.G3,1],[n.D3,.5],[n.D3,.5],[n.G3,.5],[n.A3,.5],
            [n.D3,.5],[n.G3,.5],[n.A3,1],[n.G3,.5],[n.A3,.5],
            [n.D3,1.5],[n.D3,.5],[n.A3,.5],[n.D3,.5],

            // ─── B ───
            [n.D3,1],[n.A3,.5],[n.G3,.5],[n.D3,1],[n.A3,.5],[n.A3,.5],
            [n.G3,1],[n.D3,.5],[n.A3,.5],[n.D3,1],[n.A3,.5],[n.A3,.5],
            [n.D3,1],[n.G3,1],[n.A3,.5],[n.G3,.5],
            [n.D3,1],[n.A3,.5],[n.D3,.5],[n.A3,.5],[n.D3,.5],

            // ─── C ───
            [n.D3,1],[n.G3,.5],[n.A3,.5],[n.D3,.5],[n.A3,.5],
            [n.D3,1],[n.D3,1],[n.A3,.5],[n.G3,.5],
            [n.D3,.5],[n.A3,.5],[n.D3,.5],[n.A3,.5],[n.D3,.5],[n.A3,.5],
            [n.D3,1.5],[n.D3,.5],[n.A3,.5],[n.D3,.5],
        ];
        return { notes: bass, beat: beat };
    },

    scheduleVoice(notes, beat, startTime, type, vol, detune) {
        let t = startTime;
        notes.forEach(([freq, dur]) => {
            if (freq > 0) {
                const osc = this.ctx.createOscillator();
                const env = this.ctx.createGain();
                osc.type = type;
                osc.frequency.value = freq;
                if (detune) osc.detune.value = detune;
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(vol, t + 0.02);
                env.gain.setValueAtTime(vol, t + dur * beat - 0.05);
                env.gain.linearRampToValueAtTime(0, t + dur * beat);
                osc.connect(env);
                env.connect(this.masterGain);
                osc.start(t);
                osc.stop(t + dur * beat);
            }
            t += dur * beat;
        });
        return t;
    },

    playLoop() {
        if (!this.ctx) return;
        const melody = this.getMelody();
        const bass = this.getBass();
        const startTime = this.ctx.currentTime + 0.1;

        // Main melody (square wave, chiptune fiddle feel)
        const endTime = this.scheduleVoice(melody.notes, melody.beat, startTime, 'square', 0.08, 0);
        // Harmony (slightly detuned for richness, like a second fiddle)
        this.scheduleVoice(melody.notes, melody.beat, startTime, 'square', 0.03, -1200);
        // Bass (triangle wave, bodhrán-like pulse)
        this.scheduleVoice(bass.notes, bass.beat, startTime, 'triangle', 0.12, 0);

        // Schedule next loop
        const loopDur = endTime - startTime;
        this.loopTimeout = setTimeout(() => {
            if (this.playing) this.playLoop();
        }, loopDur * 1000 - 100);
    },

    start() {
        if (this.playing) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
            this.playing = true;
            this.started = true;
            this.playLoop();
        } catch (e) {
            console.warn('Audio not available:', e);
        }
    },

    stop() {
        this.playing = false;
        if (this.loopTimeout) clearTimeout(this.loopTimeout);
        if (this.ctx) {
            this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
            setTimeout(() => {
                if (this.ctx) { this.ctx.close(); this.ctx = null; }
            }, 500);
        }
        this.started = false;
    },

    setVolume(v) {
        if (this.masterGain) this.masterGain.gain.value = v;
    },

    // ── Sound Effects ──
    _sfx(freq, type, dur, vol, slide) {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slide) osc.frequency.linearRampToValueAtTime(slide, this.ctx.currentTime + dur);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + dur);
        } catch(e) {}
    },

    _noise(dur, vol) {
        if (!this.ctx) return;
        try {
            const bufSize = this.ctx.sampleRate * dur;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            src.start();
        } catch(e) {}
    },

    // Pick up a pint: glass clink
    sfxClink() {
        this._sfx(1200, 'sine', 0.08, 0.15, 1800);
        setTimeout(() => this._sfx(1600, 'sine', 0.06, 0.1, 2200), 50);
        setTimeout(() => this._sfx(2000, 'sine', 0.1, 0.08, 1400), 90);
    },

    // Delivery: cheers
    sfxCheers() {
        this._sfx(400, 'square', 0.12, 0.06, 600);
        setTimeout(() => this._sfx(500, 'square', 0.12, 0.06, 750), 80);
        setTimeout(() => this._sfx(600, 'square', 0.15, 0.07, 900), 160);
        setTimeout(() => this._sfx(800, 'triangle', 0.2, 0.08, 1000), 240);
    },

    // Collision: glass break
    sfxGlassBreak() {
        this._noise(0.15, 0.12);
        this._sfx(900, 'sawtooth', 0.1, 0.08, 200);
        setTimeout(() => {
            this._noise(0.1, 0.08);
            this._sfx(600, 'sawtooth', 0.08, 0.06, 150);
        }, 60);
        setTimeout(() => this._noise(0.08, 0.05), 120);
    },

    // Power-up: whoosh
    sfxPowerUp() {
        this._sfx(300, 'sine', 0.25, 0.1, 1200);
        this._sfx(300, 'triangle', 0.3, 0.06, 1400);
        setTimeout(() => this._sfx(800, 'sine', 0.15, 0.08, 1600), 150);
        setTimeout(() => this._sfx(1200, 'sine', 0.1, 0.06, 1800), 250);
    },

    // Table complete: fanfare
    sfxTableComplete() {
        this._sfx(523, 'square', 0.1, 0.07, 523);
        setTimeout(() => this._sfx(659, 'square', 0.1, 0.07, 659), 100);
        setTimeout(() => this._sfx(784, 'square', 0.15, 0.08, 784), 200);
        setTimeout(() => this._sfx(1047, 'triangle', 0.25, 0.09, 1047), 300);
    },

    // Victory: triumphant melody
    sfxVictory() {
        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((f, i) => {
            setTimeout(() => this._sfx(f, 'square', 0.15, 0.08, f), i * 100);
        });
        setTimeout(() => {
            this._sfx(1047, 'triangle', 0.4, 0.1, 1047);
            this._sfx(784, 'triangle', 0.4, 0.06, 784);
        }, 600);
    },

    // Game over
    sfxGameOver() {
        this._sfx(440, 'square', 0.2, 0.07, 400);
        setTimeout(() => this._sfx(370, 'square', 0.2, 0.07, 330), 200);
        setTimeout(() => this._sfx(300, 'square', 0.25, 0.07, 260), 400);
        setTimeout(() => this._sfx(220, 'triangle', 0.4, 0.08, 180), 600);
    },

    // Alarm: 10 seconds remaining
    sfxUrgent() {
        this._sfx(880, 'square', 0.08, 0.1, 880);
        setTimeout(() => this._sfx(880, 'square', 0.08, 0.1, 880), 150);
        setTimeout(() => this._sfx(880, 'square', 0.08, 0.1, 880), 300);
        setTimeout(() => this._sfx(1100, 'square', 0.15, 0.08, 800), 450);
    },

    setFastTempo() { this.bpm = 220; },
    resetTempo() { this.bpm = 180; }
};

const W = 1000;
const H = 700;
const COLORS = {
    brick: 0x8B4533,
    brickLight: 0xA0593D,
    brickDark: 0x6B3020,
    floor: 0x8A8075,
    floorTile: 0x7A7065,
    bunting1: 0x169B62,     // Irish green
    bunting2: 0xFF883E,     // Irish orange
    buntingWhite: 0xFFFFFF,
    skin: 0xFFDBAC,
    dressGreen: 0x1B8A4B,
    dressLight: 0x22AA5E,
    apron: 0xFFFFFF,
    hair: 0xC04020,         // Auburn/red hair
    drunkWhite: 0xF0F0F0,
    drunkBlack: 0x222222,
    tableCloth: 0x169B62,   // Irish green
    tableOrange: 0xFF883E,
    success: 0x27AE60,
    danger: 0xE74C3C,
    uiBg: 0x1A120A,
    gold: 0xFFD700,
};

// ═══════════════════════════════════════════
//  BOOT SCENE – Generate textures
// ═══════════════════════════════════════════
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    create() {
        this.generateTextures();
        document.fonts.load('400 48px MedievalSharp').then(() => {
            return document.fonts.ready;
        }).then(() => {
            this.time.delayedCall(100, () => {
                this.scene.start('MenuScene');
            });
        }).catch(() => {
            this.scene.start('MenuScene');
        });
        this.time.delayedCall(4000, () => {
            if (this.scene.isActive('BootScene')) {
                this.scene.start('MenuScene');
            }
        });
    }

    generateTextures() {
        // Helper: draw player body (green dress, red hair)
        const drawPlayerBody = (g) => {
            // Green dress body
            g.fillStyle(COLORS.dressGreen);
            g.fillRoundedRect(6, 16, 20, 18, 4);
            // White collar/blouse top
            g.fillStyle(0xFFFFFF);
            g.fillRoundedRect(8, 14, 16, 8, 3);
            // Dress lacing
            g.lineStyle(1, 0x0F6B35);
            g.lineBetween(10, 18, 16, 21);
            g.lineBetween(22, 18, 16, 21);
            // White apron
            g.fillStyle(COLORS.apron);
            g.fillRoundedRect(10, 24, 12, 11, 2);
            g.lineStyle(1, 0xDDDDDD);
            g.lineBetween(12, 24, 12, 34);
            g.lineBetween(20, 24, 20, 34);
            // Dress details
            g.fillStyle(COLORS.dressLight);
            g.fillTriangle(13, 24, 10, 27, 16, 26);
            g.fillTriangle(19, 24, 22, 27, 16, 26);
            // === HAIR FIRST (background layer) ===
            // Hair top (only the crown, above the face)
            g.fillStyle(COLORS.hair);
            g.fillCircle(16, 4, 8);        // top of head
            g.fillRect(8, 0, 16, 6);       // flat top area
            // Side braids (fall beside the face, not over it)
            g.fillRoundedRect(3, 6, 5, 20, 3);
            g.fillCircle(5, 26, 3);
            g.fillRoundedRect(24, 6, 5, 20, 3);
            g.fillCircle(27, 26, 3);
            // Hair ribbon ties
            g.fillStyle(COLORS.dressGreen);
            g.fillCircle(5, 14, 2);
            g.fillCircle(27, 14, 2);
            // === FACE ON TOP (covers lower part of hair) ===
            g.fillStyle(COLORS.skin);
            g.fillCircle(16, 9, 7);         // face circle, slightly smaller
            // Hair fringe across forehead (thin strip at top of face)
            g.fillStyle(COLORS.hair);
            g.fillRoundedRect(9, 2, 14, 5, 2);
            // Hair shine
            g.fillStyle(0xDD6040, 0.3);
            g.fillCircle(13, 3, 2);
            // === FACIAL FEATURES (drawn last) ===
            // Eyes (green)
            g.fillStyle(0x228B22);
            g.fillCircle(13, 9, 2);
            g.fillCircle(19, 9, 2);
            g.fillStyle(0x111111);
            g.fillCircle(13, 9, 1);
            g.fillCircle(19, 9, 1);
            // Eyebrows
            g.lineStyle(1, 0x8B3020);
            g.lineBetween(11, 7, 13, 7);
            g.lineBetween(19, 7, 21, 7);
            // Blush
            g.fillStyle(0xFFAAAA, 0.35);
            g.fillCircle(10, 11, 2);
            g.fillCircle(22, 11, 2);
            // Smile
            g.lineStyle(1.5, 0xDD7777);
            g.beginPath();
            g.arc(16, 11, 3, 0.3, Math.PI - 0.3);
            g.strokePath();
            // Arms
            g.fillStyle(COLORS.skin);
            g.fillRoundedRect(2, 18, 5, 10, 2);
            g.fillRoundedRect(25, 18, 5, 10, 2);
        };

        // Helper: draw player legs
        const drawPlayerLegs = (g, lx, ly, rx, ry) => {
            g.fillStyle(COLORS.skin);
            g.fillRect(lx, ly, 5, 7);
            g.fillRect(rx, ry, 5, 7);
            // White socks
            g.fillStyle(0xFFFFFF);
            g.fillRect(lx, ly + 4, 5, 3);
            g.fillRect(rx, ry + 4, 5, 3);
            // Black shoes
            g.fillStyle(0x222222);
            g.fillRoundedRect(lx - 1, ly + 6, 7, 4, 2);
            g.fillRoundedRect(rx, ry + 6, 7, 4, 2);
        };

        // ── Player frame 1 (standing) ──
        const pg = this.make.graphics({ add: false });
        drawPlayerBody(pg);
        drawPlayerLegs(pg, 10, 34, 17, 34);
        pg.generateTexture('player', 32, 45);
        pg.destroy();

        // ── Player frame 2 (walk) ──
        const pg2 = this.make.graphics({ add: false });
        drawPlayerBody(pg2);
        drawPlayerLegs(pg2, 8, 32, 19, 36);
        pg2.generateTexture('player_w', 32, 45);
        pg2.destroy();

        // ── Pint glass – dark stout + thick cream foam ──
        const bg = this.make.graphics({ add: false });
        // Glass body (slightly tapered pint shape)
        bg.fillStyle(0xDDDDDD, 0.25);
        bg.fillRoundedRect(4, 5, 16, 22, 2);
        // Wider top rim
        bg.fillStyle(0xDDDDDD, 0.2);
        bg.fillRoundedRect(3, 5, 18, 4, 1);
        // Dark stout liquid
        bg.fillStyle(0x1A0800);
        bg.fillRoundedRect(5, 10, 14, 16, 2);
        // Slightly lighter at edges (glass refraction)
        bg.fillStyle(0x2C1400, 0.4);
        bg.fillRect(5, 10, 2, 16);
        bg.fillRect(17, 10, 2, 16);
        // Settling bubbles (subtle cascade)
        bg.fillStyle(0x3A2000, 0.5);
        bg.fillCircle(9, 18, 1);
        bg.fillCircle(14, 22, 1);
        bg.fillCircle(11, 15, 1);
        bg.fillCircle(16, 20, 0.8);
        // Thick cream foam head
        bg.fillStyle(0xE8D5B0);
        bg.fillRoundedRect(3, 3, 18, 10, 4);
        bg.fillStyle(0xF5E6CC);
        bg.fillRoundedRect(4, 2, 16, 5, 3);
        // Foam bubbles
        bg.fillStyle(0xF0DFC0, 0.6);
        bg.fillCircle(8, 5, 3);
        bg.fillCircle(14, 4, 3);
        bg.fillCircle(11, 3, 2);
        // Glass shine (vertical highlight)
        bg.fillStyle(0xFFFFFF, 0.18);
        bg.fillRect(7, 11, 2, 14);
        bg.generateTexture('beer', 24, 28);
        bg.destroy();

        // Helper: draw drunk body (white shirt, black pants, flat cap, red beard)
        const drawDrunkBody = (g) => {
            // White shirt
            g.fillStyle(COLORS.drunkWhite);
            g.fillRoundedRect(6, 14, 20, 16, 4);
            // Shirt collar
            g.fillStyle(0xE8E8E8);
            g.fillRect(10, 14, 12, 4);
            // Shirt buttons
            g.fillStyle(0xCCCCCC);
            g.fillCircle(16, 18, 1);
            g.fillCircle(16, 22, 1);
            g.fillCircle(16, 26, 1);
            // Black trousers
            g.fillStyle(COLORS.drunkBlack);
            g.fillRoundedRect(8, 28, 16, 10, 2);
            // Suspenders
            g.lineStyle(2, 0x333333);
            g.lineBetween(11, 14, 10, 28);
            g.lineBetween(21, 14, 22, 28);
            // Belt
            g.lineStyle(1.5, 0x4A3520);
            g.lineBetween(10, 28, 22, 28);
            // Belt buckle
            g.fillStyle(0xCCAAAA);
            g.fillCircle(16, 28, 2);
            // Head
            g.fillStyle(COLORS.skin);
            g.fillCircle(16, 8, 8);
            // Flat cap (newsboy cap)
            g.fillStyle(0x333333);
            g.fillRoundedRect(6, -2, 20, 8, 4);
            g.fillRect(4, 5, 24, 3);
            // Cap brim
            g.fillStyle(0x444444);
            g.fillRoundedRect(3, 4, 26, 4, 2);
            // Red/ginger hair poking out
            g.fillStyle(0xBB4420);
            g.fillRect(6, 5, 4, 4);
            g.fillRect(22, 5, 4, 4);
            // Big red beard
            g.fillStyle(0xBB4420);
            g.beginPath();
            g.arc(13, 13, 4, 0, Math.PI, false);
            g.fill();
            g.beginPath();
            g.arc(19, 13, 4, 0, Math.PI, false);
            g.fill();
            // Beard center / mustache
            g.fillStyle(0xAA3818);
            g.fillRect(12, 11, 8, 4);
            // Red nose (from drinking!)
            g.fillStyle(0xFF5555);
            g.fillCircle(16, 10, 2.5);
            // X eyes (drunk)
            g.lineStyle(1.5, 0x333333);
            g.lineBetween(11, 7, 14, 10);
            g.lineBetween(14, 7, 11, 10);
            g.lineBetween(18, 7, 21, 10);
            g.lineBetween(21, 7, 18, 10);
            // Arms (white sleeves)
            g.fillStyle(COLORS.drunkWhite);
            g.fillRoundedRect(2, 16, 5, 10, 2);
            g.fillRoundedRect(25, 16, 5, 10, 2);
        };

        // Helper: draw drunk legs
        const drawDrunkLegs = (g, lx, ly, rx, ry) => {
            // Black trousers legs
            g.fillStyle(COLORS.drunkBlack);
            g.fillRect(lx, ly, 5, 7);
            g.fillRect(rx, ry, 5, 7);
            // Socks
            g.fillStyle(0x444444);
            g.fillRect(lx, ly + 4, 5, 3);
            g.fillRect(rx, ry + 4, 5, 3);
            // Black shoes
            g.fillStyle(0x111111);
            g.fillRoundedRect(lx - 1, ly + 6, 7, 3, 1);
            g.fillRoundedRect(rx, ry + 6, 7, 3, 1);
        };

        // ── Drunk frame 1 (standing) ──
        const dg = this.make.graphics({ add: false });
        drawDrunkBody(dg);
        drawDrunkLegs(dg, 10, 37, 17, 37);
        dg.generateTexture('drunk', 32, 48);
        dg.destroy();

        // ── Drunk frame 2 (walk) ──
        const dg2 = this.make.graphics({ add: false });
        drawDrunkBody(dg2);
        drawDrunkLegs(dg2, 8, 35, 19, 39);
        dg2.generateTexture('drunk_w', 32, 48);
        dg2.destroy();

        // ── Shamrock (speed power-up) ──
        const prg = this.make.graphics({ add: false });
        // Three leaves
        const leafR = 7;
        const cx = 17, cy = 14;
        prg.fillStyle(0x1B8A2B);
        // Top leaf
        prg.beginPath();
        prg.arc(cx, cy - 6, leafR, 0, Math.PI * 2);
        prg.fill();
        // Left leaf
        prg.beginPath();
        prg.arc(cx - 6, cy + 1, leafR, 0, Math.PI * 2);
        prg.fill();
        // Right leaf
        prg.beginPath();
        prg.arc(cx + 6, cy + 1, leafR, 0, Math.PI * 2);
        prg.fill();
        // Center fill
        prg.fillStyle(0x1B8A2B);
        prg.fillCircle(cx, cy - 2, 5);
        // Heart-shape notches (darker green inner detail)
        prg.fillStyle(0x0F6B1A);
        prg.fillCircle(cx - 2, cy - 7, 3);
        prg.fillCircle(cx + 2, cy - 7, 3);
        prg.fillCircle(cx - 7, cy, 3);
        prg.fillCircle(cx - 4, cy + 1, 3);
        prg.fillCircle(cx + 4, cy + 1, 3);
        prg.fillCircle(cx + 7, cy, 3);
        // Leaf veins
        prg.lineStyle(1, 0x0A5515, 0.5);
        prg.lineBetween(cx, cy - 2, cx, cy - 11);
        prg.lineBetween(cx, cy - 2, cx - 9, cy);
        prg.lineBetween(cx, cy - 2, cx + 9, cy);
        // Stem
        prg.lineStyle(3, 0x2A6B15);
        prg.lineBetween(cx, cy + 2, cx + 2, cy + 12);
        // Bright highlight
        prg.fillStyle(0x44DD55, 0.3);
        prg.fillCircle(cx - 1, cy - 8, 3);
        prg.fillCircle(cx - 8, cy - 1, 2);
        prg.generateTexture('shamrock', 34, 26);
        prg.destroy();

        // ── Table – Irish pub style with tricolor cloth ──
        const tg = this.make.graphics({ add: false });
        // Table shadow
        tg.fillStyle(0x000000, 0.15);
        tg.fillRoundedRect(3, 12, 84, 50, 6);
        // Table body (dark wood)
        tg.fillStyle(0x4A2818);
        tg.fillRoundedRect(0, 8, 84, 50, 6);
        // Wood plank lines
        tg.lineStyle(1, 0x3A1808, 0.4);
        tg.lineBetween(4, 12, 4, 54);
        tg.lineBetween(28, 12, 28, 54);
        tg.lineBetween(56, 12, 56, 54);
        tg.lineBetween(80, 12, 80, 54);
        // Table top
        tg.fillStyle(0x6B4030);
        tg.fillRoundedRect(2, 8, 80, 16, 4);
        // Wood grain on top
        tg.lineStyle(0.5, 0x5A3020, 0.3);
        tg.lineBetween(6, 12, 78, 12);
        tg.lineBetween(6, 16, 78, 16);
        tg.lineBetween(6, 20, 78, 20);
        // Irish tricolor cloth runner (green | white | orange)
        const clothY = 26, clothH = 20;
        // Green stripe
        tg.fillStyle(COLORS.tableCloth);
        tg.fillRoundedRect(6, clothY, 24, clothH, {tl:3,bl:3,tr:0,br:0});
        // White stripe
        tg.fillStyle(0xFFFFFF);
        tg.fillRect(30, clothY, 24, clothH);
        // Orange stripe
        tg.fillStyle(COLORS.tableOrange);
        tg.fillRoundedRect(54, clothY, 24, clothH, {tl:0,bl:0,tr:3,br:3});
        // Cloth border
        tg.lineStyle(2, 0x0F6B35, 0.6);
        tg.lineBetween(6, clothY + clothH, 78, clothY + clothH);
        // Sturdy legs
        tg.fillStyle(0x3A1808);
        tg.fillRect(6, 54, 8, 12);
        tg.fillRect(70, 54, 8, 12);
        // Leg braces
        tg.fillStyle(0x2A1005);
        tg.fillRect(6, 60, 8, 2);
        tg.fillRect(70, 60, 8, 2);
        tg.lineStyle(2, 0x2A1005);
        tg.lineBetween(14, 62, 70, 62);
        tg.generateTexture('table', 88, 68);
        tg.destroy();

        // ── Star particle (gold) ──
        const sg = this.make.graphics({ add: false });
        sg.fillStyle(0xFFD700);
        sg.fillCircle(4, 4, 4);
        sg.generateTexture('star', 8, 8);
        sg.destroy();

        // ── Foam particle (cream) ──
        const fg = this.make.graphics({ add: false });
        fg.fillStyle(0xE8D5B0);
        fg.fillCircle(3, 3, 3);
        fg.generateTexture('foam', 6, 6);
        fg.destroy();

        // ── Leprechaun (shield power-up) ──
        const gh = this.make.graphics({ add: false });
        // Body (green coat)
        gh.fillStyle(0x1B8A2B);
        gh.fillRoundedRect(6, 12, 20, 12, 3);
        // Head
        gh.fillStyle(COLORS.skin);
        gh.fillCircle(16, 8, 7);
        // Top hat
        gh.fillStyle(0x1A6B25);
        gh.fillRect(8, -4, 16, 8);
        gh.fillRect(6, 3, 20, 3);
        // Hat band (gold buckle)
        gh.fillStyle(0xFFD700);
        gh.fillRect(8, 1, 16, 3);
        gh.fillStyle(0xDDBB00);
        gh.fillRect(14, 0, 4, 4);
        // Ginger beard
        gh.fillStyle(0xBB4420);
        gh.beginPath();
        gh.arc(16, 12, 5, 0, Math.PI, false);
        gh.fill();
        // Face
        gh.fillStyle(0x333333);
        gh.fillCircle(13, 7, 1.2);
        gh.fillCircle(19, 7, 1.2);
        // Grin
        gh.lineStyle(1, 0xDD6644);
        gh.beginPath();
        gh.arc(16, 9, 3, 0.2, Math.PI - 0.2);
        gh.strokePath();
        // Belt
        gh.fillStyle(0x4A3520);
        gh.fillRect(8, 20, 16, 3);
        gh.fillStyle(0xFFD700);
        gh.fillRect(14, 19, 4, 4);
        // Legs
        gh.fillStyle(0x1B8A2B);
        gh.fillRect(10, 23, 5, 4);
        gh.fillRect(17, 23, 5, 4);
        // Buckle shoes
        gh.fillStyle(0x333333);
        gh.fillRoundedRect(9, 26, 7, 3, 1);
        gh.fillRoundedRect(16, 26, 7, 3, 1);
        gh.fillStyle(0xFFD700);
        gh.fillCircle(12, 27, 1);
        gh.fillCircle(20, 27, 1);
        gh.generateTexture('leprechaun', 32, 30);
        gh.destroy();

        // ── Beer splash particle (dark stout) ──
        const sp = this.make.graphics({ add: false });
        sp.fillStyle(0x3A1A00);
        sp.fillCircle(4, 4, 4);
        sp.fillStyle(0xE8D5B0, 0.5);
        sp.fillCircle(3, 2, 1.5);
        sp.generateTexture('beersplash', 8, 8);
        sp.destroy();

        // ── Glass shard particle ──
        const gs = this.make.graphics({ add: false });
        gs.fillStyle(0xDDDDDD, 0.7);
        gs.fillTriangle(0, 0, 4, 6, 6, 1);
        gs.generateTexture('glassshard', 7, 7);
        gs.destroy();

        // ── Beer puddle (dark stout) ──
        const bp = this.make.graphics({ add: false });
        bp.fillStyle(0x2A1200, 0.5);
        bp.fillEllipse(20, 10, 40, 20);
        bp.fillStyle(0x1A0800, 0.3);
        bp.fillEllipse(20, 10, 30, 14);
        // Foam edge
        bp.fillStyle(0xE8D5B0, 0.4);
        bp.fillEllipse(14, 6, 16, 8);
        bp.generateTexture('puddle', 40, 20);
        bp.destroy();

        // ── Wall segment (brick) ──
        const wg = this.make.graphics({ add: false });
        wg.fillStyle(COLORS.brickDark);
        wg.fillRect(0, 0, 16, 16);
        wg.fillStyle(COLORS.brick);
        wg.fillRect(1, 1, 14, 14);
        // Brick pattern (mortar lines)
        wg.lineStyle(0.5, 0x9A9080, 0.5);
        wg.lineBetween(0, 4, 16, 4);
        wg.lineBetween(0, 8, 16, 8);
        wg.lineBetween(0, 12, 16, 12);
        wg.lineBetween(8, 0, 8, 4);
        wg.lineBetween(4, 4, 4, 8);
        wg.lineBetween(12, 8, 12, 12);
        wg.generateTexture('wall', 16, 16);
        wg.destroy();

        // ── Irish Harp (freeze power-up) ──
        const ac = this.make.graphics({ add: false });
        // Harp frame (gold)
        ac.fillStyle(0xDAA520);
        ac.fillRoundedRect(10, 0, 4, 24, 2);
        // Curved top (pillar)
        ac.lineStyle(4, 0xDAA520);
        ac.beginPath();
        ac.arc(16, 5, 8, Math.PI, Math.PI * 1.6);
        ac.strokePath();
        // Base
        ac.fillStyle(0xDAA520);
        ac.fillRoundedRect(6, 20, 20, 5, 2);
        // Sound box
        ac.fillStyle(0xB8860B);
        ac.fillRoundedRect(20, 4, 6, 18, 3);
        // Strings
        ac.lineStyle(1, 0xFFD700, 0.7);
        for (let i = 0; i < 5; i++) {
            const sx = 13 + i * 2;
            ac.lineBetween(sx, 5, sx + 4, 20);
        }
        // Gold shine
        ac.fillStyle(0xFFE44D, 0.4);
        ac.fillCircle(12, 10, 3);
        ac.generateTexture('harp', 32, 26);
        ac.destroy();

        // ── Vomit particle ──
        const vp = this.make.graphics({ add: false });
        vp.fillStyle(0x88AA22);
        vp.fillCircle(3, 3, 3);
        vp.fillStyle(0xAACC33, 0.6);
        vp.fillCircle(2, 2, 1.5);
        vp.generateTexture('vomit', 6, 6);
        vp.destroy();

        // ── Vomit puddle ──
        const vpd = this.make.graphics({ add: false });
        vpd.fillStyle(0x6B8822, 0.5);
        vpd.fillEllipse(18, 8, 36, 16);
        vpd.fillStyle(0x88AA22, 0.3);
        vpd.fillEllipse(18, 8, 24, 10);
        vpd.fillStyle(0xAACC33, 0.2);
        vpd.fillEllipse(14, 5, 10, 6);
        vpd.generateTexture('vomitpuddle', 36, 16);
        vpd.destroy();
    }
}

// ═══════════════════════════════════════════
//  MENU SCENE
// ═══════════════════════════════════════════
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        if (!PaddyMusic.started) {
            const startMusic = () => {
                PaddyMusic.start();
                this.input.off('pointerdown', startMusic);
                this.input.keyboard.off('keydown', startMusic);
            };
            this.input.on('pointerdown', startMusic);
            this.input.keyboard.on('keydown', startMusic);
        }

        this.drawPubBackground();

        // Title
        const title = this.add.text(W / 2, 140, '☘️ PADDY\'S RUSH ☘️', {
            fontSize: '60px',
            fontFamily: 'MedievalSharp, serif',
            fill: '#FFD700',
            stroke: '#1A3A00',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 150,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const subtitle = this.add.text(W / 2, 220, 'Serveuse dans les rues de Dublin !', {
            fontSize: '24px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#E8D5B0',
            stroke: '#1A3A00',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Instructions panel
        const panelY = 380;
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.uiBg, 0.85);
        panel.fillRoundedRect(W / 2 - 240, panelY - 90, 480, 235, 16);
        panel.lineStyle(3, COLORS.gold);
        panel.strokeRoundedRect(W / 2 - 240, panelY - 90, 480, 235, 16);

        const instructions = [
            '🍺  Va au BAR pour prendre des bières',
            '🪑  Livre les pintes aux TABLES',
            '🍻  Évite les ivrognes !',
            '☘️  Les Trèfles te donnent un bonus de vitesse',
            '🧙  Les Leprechauns sont des boucliers',
            '🎵  La Harpe fige les ivrognes',
        ];

        instructions.forEach((text, i) => {
            this.add.text(W / 2, panelY - 60 + i * 35, text, {
                fontSize: '17px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fill: '#E8D5B0'
            }).setOrigin(0.5);
        });

        // Buttons row: JOUER | NIVEAUX | COMMANDES | QUITTER
        const btnY = 560;
        const btnW = 160, btnH = 46, btnGap = 14;
        const totalW = btnW * 4 + btnGap * 3;
        const startX = W / 2 - totalW / 2 + btnW / 2;

        const makeMenuBtn = (x, y, label, fillColor, textColor, hoverColor, cb) => {
            const g = this.add.graphics();
            g.fillStyle(fillColor);
            g.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 23);
            g.lineStyle(2, 0xFFD700);
            g.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 23);
            this.add.text(x, y, label, {
                fontSize: '17px', fontFamily: 'Arial, Helvetica, sans-serif',
                fontStyle: 'bold', fill: textColor
            }).setOrigin(0.5);
            const z = this.add.zone(x, y, btnW, btnH).setInteractive({ useHandCursor: true });
            z.on('pointerover', () => {
                g.clear(); g.fillStyle(hoverColor);
                g.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 23);
                g.lineStyle(2, 0xFFFFFF);
                g.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 23);
            });
            z.on('pointerout', () => {
                g.clear(); g.fillStyle(fillColor);
                g.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 23);
                g.lineStyle(2, 0xFFD700);
                g.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 23);
            });
            z.on('pointerdown', () => {
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.time.delayedCall(300, cb);
            });
        };

        makeMenuBtn(startX, btnY, '▶  JOUER', 0x1B8A4B, '#FFFFFF', 0x22AA5E, () => {
            this.scene.start('GameScene', { level: 1 });
        });
        makeMenuBtn(startX + btnW + btnGap, btnY, '📋 NIVEAUX', 0xFF883E, '#FFFFFF', 0xFFAA66, () => {
            this.scene.start('LevelSelectScene');
        });
        makeMenuBtn(startX + (btnW + btnGap) * 2, btnY, '🎮 COMMANDES', 0x6B4030, '#E8D5B0', 0x8B5A40, () => {
            this.scene.start('ControlsScene');
        });
        makeMenuBtn(startX + (btnW + btnGap) * 3, btnY, '✕  QUITTER', 0x8B2020, '#FFFFFF', 0xAA3333, () => {
            PaddyMusic.stop();
            window.close();
            // Fallback for browsers that block window.close()
            this.time.delayedCall(500, () => {
                this.add.text(W / 2, H / 2, 'Vous pouvez fermer cet onglet.', {
                    fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif',
                    fill: '#E8D5B0'
                }).setOrigin(0.5).setDepth(99);
            });
        });

        // ── Mute button ──
        this.muteBtn = this.add.graphics();
        const muteX = W - 50, muteY = 30;
        this.isMuted = !PaddyMusic.playing && PaddyMusic.started;
        const drawMuteBtn = () => {
            this.muteBtn.clear();
            this.muteBtn.fillStyle(COLORS.uiBg, 0.8);
            this.muteBtn.fillRoundedRect(muteX - 20, muteY - 16, 40, 32, 10);
            this.muteBtn.lineStyle(1.5, COLORS.gold, 0.5);
            this.muteBtn.strokeRoundedRect(muteX - 20, muteY - 16, 40, 32, 10);
        };
        drawMuteBtn();
        this.muteBtnText = this.add.text(muteX, muteY, this.isMuted ? '🔇' : '🔊', {
            fontSize: '18px'
        }).setOrigin(0.5);
        const muteZone = this.add.zone(muteX, muteY, 40, 32).setInteractive({ useHandCursor: true });
        muteZone.on('pointerdown', () => {
            if (PaddyMusic.playing) {
                PaddyMusic.stop();
                this.isMuted = true;
            } else {
                PaddyMusic.start();
                this.isMuted = false;
            }
            this.muteBtnText.setText(this.isMuted ? '🔇' : '🔊');
        });

        // Copyright
        this.add.text(W / 2, H - 15, '© 2026 Nico\'s Games. Tous droits réservés.', {
            fontSize: '11px', fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#E8D5B0', alpha: 0.4
        }).setOrigin(0.5);

        // Floating pints decoration
        for (let i = 0; i < 6; i++) {
            const beerDeco = this.add.image(100 + i * 160, 650, 'beer').setScale(2).setAlpha(0.4);
            this.tweens.add({
                targets: beerDeco,
                y: 640,
                angle: { from: -5, to: 5 },
                duration: 1500 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        this.cameras.main.fadeIn(500);
    }

    drawPubBackground() {
        const bg = this.add.graphics();
        // Dark pub interior base
        bg.fillStyle(0x1A120A);
        bg.fillRect(0, 0, W, H);

        // Brick wall stripes
        for (let i = 0; i < 20; i++) {
            bg.fillStyle(i % 2 === 0 ? 0x3A2218 : 0x2E1A10);
            bg.fillRect(i * 50, 0, 50, H);
        }

        // Dublin pub ceiling
        bg.fillStyle(0x1A120A, 0.6);
        bg.fillRect(0, 0, W, 60);

        // Irish flag bunting
        for (let i = 0; i < 15; i++) {
            const x = 35 + i * 68;
            const colors = [COLORS.bunting1, COLORS.buntingWhite, COLORS.bunting2];
            bg.fillStyle(colors[i % 3]);
            bg.fillTriangle(x - 15, 55, x + 15, 55, x, 85);
        }

        // Warm pub glow
        bg.fillStyle(0xFFAA33, 0.06);
        bg.fillCircle(W / 2, H / 2, 400);
    }
}

// ═══════════════════════════════════════════
//  CONTROLS SCENE
// ═══════════════════════════════════════════
class ControlsScene extends Phaser.Scene {
    constructor() { super('ControlsScene'); }

    create() {
        const bg = this.add.graphics();
        bg.fillStyle(0x1A120A);
        bg.fillRect(0, 0, W, H);
        for (let i = 0; i < 20; i++) {
            bg.fillStyle(i % 2 === 0 ? 0x3A2218 : 0x2E1A10);
            bg.fillRect(i * 50, 0, 50, H);
        }
        bg.fillStyle(0xFFAA33, 0.05);
        bg.fillCircle(W / 2, H / 2, 350);

        // Back arrow
        const arrowBg = this.add.graphics();
        arrowBg.fillStyle(0x1B8A4B);
        arrowBg.fillRoundedRect(24, 20, 60, 50, 14);

        const arrowText = this.add.text(54, 45, '◀', {
            fontSize: '30px', fontFamily: 'Arial, Helvetica, sans-serif',
            fontStyle: 'bold', fill: '#FFFFFF'
        }).setOrigin(0.5);

        const arrowZone = this.add.zone(54, 45, 60, 50).setInteractive({ useHandCursor: true });
        arrowZone.on('pointerover', () => {
            arrowBg.clear(); arrowBg.fillStyle(0x22AA5E);
            arrowBg.fillRoundedRect(24, 20, 60, 50, 14);
        });
        arrowZone.on('pointerout', () => {
            arrowBg.clear(); arrowBg.fillStyle(0x1B8A4B);
            arrowBg.fillRoundedRect(24, 20, 60, 50, 14);
        });
        arrowZone.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('MenuScene'));
        });

        // Title
        this.add.text(W / 2, 60, '🎮 COMMANDES', {
            fontSize: '44px',
            fontFamily: 'MedievalSharp, serif',
            fill: '#FFD700',
            stroke: '#1A3A00',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5);

        // Controls panel
        const panelX = W / 2 - 320;
        const panelY = 120;
        const panelW = 640;
        const panelH = 460;
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.uiBg, 0.9);
        panel.fillRoundedRect(panelX, panelY, panelW, panelH, 20);
        panel.lineStyle(3, COLORS.gold, 0.7);
        panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 20);

        const controls = [
            { label: 'SE DÉPLACER', keys: '▲ ▼ ◄ ►', desc: 'Flèches directionnelles ou WASD', icon: '🏃' },
            { label: 'PRENDRE / LIVRER', keys: 'ESPACE', desc: 'Prendre une pinte au bar\nou la livrer à une table', icon: '🍺' },
            { label: 'PAUSE', keys: 'ENTRÉE', desc: 'Met le jeu en pause\net propose de revenir au menu', icon: '⏸' }
        ];

        controls.forEach((ctrl, i) => {
            const rowY = panelY + 50 + i * 140;
            this.add.text(panelX + 45, rowY + 20, ctrl.icon, { fontSize: '40px' }).setOrigin(0.5);
            const badgeX = panelX + 130;
            const badgeW = 150;
            const badge = this.add.graphics();
            badge.fillStyle(0x0A0600, 0.8);
            badge.fillRoundedRect(badgeX, rowY - 5, badgeW, 50, 12);
            badge.lineStyle(2, COLORS.gold, 0.5);
            badge.strokeRoundedRect(badgeX, rowY - 5, badgeW, 50, 12);
            this.add.text(badgeX + badgeW / 2, rowY + 20, ctrl.keys, {
                fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fill: '#FFD700'
            }).setOrigin(0.5);
            this.add.text(panelX + 320, rowY, ctrl.label, {
                fontSize: '22px', fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fill: '#FFD700'
            }).setOrigin(0);
            this.add.text(panelX + 320, rowY + 30, ctrl.desc, {
                fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0', lineSpacing: 4
            }).setOrigin(0);
            if (i < controls.length - 1) {
                const sep = this.add.graphics();
                sep.lineStyle(1, COLORS.gold, 0.2);
                sep.lineBetween(panelX + 30, rowY + 120, panelX + panelW - 30, rowY + 120);
            }
        });

        // Footer tip
        this.add.text(W / 2, H - 50, '☘️ Trèfle = vitesse  •  🧙 Leprechaun = bouclier  •  🎵 Harpe = freeze', {
            fontSize: '15px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0', alpha: 0.7
        }).setOrigin(0.5);

        this.cameras.main.fadeIn(300);
    }
}

// ═══════════════════════════════════════════
//  LEVEL SELECT SCENE
// ═══════════════════════════════════════════
class LevelSelectScene extends Phaser.Scene {
    constructor() { super('LevelSelectScene'); }

    create() {
        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1A120A);
        bg.fillRect(0, 0, W, H);
        for (let i = 0; i < 20; i++) {
            bg.fillStyle(i % 2 === 0 ? 0x3A2218 : 0x2E1A10);
            bg.fillRect(i * 50, 0, 50, H);
        }
        bg.fillStyle(0xFFAA33, 0.05);
        bg.fillCircle(W / 2, H / 2, 350);

        // Back arrow (same as ControlsScene)
        const arrowBg = this.add.graphics();
        arrowBg.fillStyle(0x1B8A4B);
        arrowBg.fillRoundedRect(24, 20, 60, 50, 14);
        this.add.text(54, 45, '◀', {
            fontSize: '30px', fontFamily: 'Arial, Helvetica, sans-serif',
            fontStyle: 'bold', fill: '#FFFFFF'
        }).setOrigin(0.5);
        const arrowZone = this.add.zone(54, 45, 60, 50).setInteractive({ useHandCursor: true });
        arrowZone.on('pointerover', () => { arrowBg.clear(); arrowBg.fillStyle(0x22AA5E); arrowBg.fillRoundedRect(24, 20, 60, 50, 14); });
        arrowZone.on('pointerout', () => { arrowBg.clear(); arrowBg.fillStyle(0x1B8A4B); arrowBg.fillRoundedRect(24, 20, 60, 50, 14); });
        arrowZone.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('MenuScene'));
        });

        // Title
        this.add.text(W / 2, 60, '📋 NIVEAUX', {
            fontSize: '44px', fontFamily: 'MedievalSharp, serif',
            fill: '#FFD700', stroke: '#1A3A00', strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5);

        // Get max unlocked level
        let maxLevel = 1;
        try { maxLevel = parseInt(localStorage.getItem('paddysRushMaxLevel')) || 1; } catch(e) {}

        // Grid: 2 columns, 6 rows
        const cols = 2, rows = 6;
        const cellW = 180, cellH = 60, gapX = 30, gapY = 16;
        const gridW = cols * cellW + (cols - 1) * gapX;
        const gridH = rows * cellH + (rows - 1) * gapY;
        const gridX = W / 2 - gridW / 2;
        const gridY = 120;

        for (let lvl = 1; lvl <= 12; lvl++) {
            const col = (lvl - 1) % cols;
            const row = Math.floor((lvl - 1) / cols);
            const cx = gridX + col * (cellW + gapX) + cellW / 2;
            const cy = gridY + row * (cellH + gapY) + cellH / 2;
            const unlocked = lvl <= maxLevel;

            const g = this.add.graphics();
            if (unlocked) {
                g.fillStyle(0x1B8A4B);
                g.fillRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);
                g.lineStyle(2, 0xFFD700, 0.6);
                g.strokeRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);

                this.add.text(cx, cy, `☘️  Niveau ${lvl}`, {
                    fontSize: '18px', fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold', fill: '#FFFFFF'
                }).setOrigin(0.5);

                const z = this.add.zone(cx, cy, cellW, cellH).setInteractive({ useHandCursor: true });
                z.on('pointerover', () => {
                    g.clear(); g.fillStyle(0x22AA5E);
                    g.fillRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);
                    g.lineStyle(2, 0xFFFFFF);
                    g.strokeRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);
                });
                z.on('pointerout', () => {
                    g.clear(); g.fillStyle(0x1B8A4B);
                    g.fillRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);
                    g.lineStyle(2, 0xFFD700, 0.6);
                    g.strokeRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);
                });
                z.on('pointerdown', () => {
                    this.cameras.main.fadeOut(300, 0, 0, 0);
                    this.time.delayedCall(300, () => this.scene.start('GameScene', { level: lvl }));
                });
            } else {
                g.fillStyle(0x444444);
                g.fillRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);
                g.lineStyle(1, 0x666666, 0.4);
                g.strokeRoundedRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 14);

                this.add.text(cx, cy, `🔒  Niveau ${lvl}`, {
                    fontSize: '18px', fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold', fill: '#888888'
                }).setOrigin(0.5);
            }
        }

        this.cameras.main.fadeIn(300);
    }
}

// ═══════════════════════════════════════════
//  GAME SCENE – Main Gameplay
// ═══════════════════════════════════════════
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.level = data.level || 1;
    }

    create() {
        this.gameActive = true;
        this.beersCarried = 0;
        this.beersSpilled = 0;
        this.bonusesUsed = 0;

        const cfg = this.getLevelConfig();
        this.maxBeers = cfg.maxBeers;
        this.timeRemaining = cfg.time;
        this.deliveriesNeeded = cfg.deliveriesNeeded;
        this.totalDeliveries = 0;
        this.playerSpeed = cfg.playerSpeed;
        this.speedBoostActive = false;
        this.invincible = false;

        // Draw environment
        this.drawPub();
        this.drawBar(cfg);

        // Tables
        this.tableGroup = this.physics.add.staticGroup();
        this.tableData = [];
        cfg.tables.forEach((tDef, idx) => {
            const t = this.tableGroup.create(tDef.x, tDef.y, 'table');
            t.setScale(tDef.scale || 1);
            t.refreshBody();
            const data = {
                sprite: t, x: tDef.x, y: tDef.y,
                beersNeeded: tDef.beers, beersDelivered: 0,
                id: idx, complete: false
            };
            this.tableData.push(data);
            this.updateTableIndicators(data);
        });

        // Player
        this.player = this.physics.add.sprite(W / 2, H / 2, 'player');
        this.player.setScale(1.6);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.body.setSize(20, 30);

        // Drunks
        this.drunks = this.physics.add.group();
        cfg.drunks.forEach(d => {
            const drunk = this.drunks.create(d.x, d.y, 'drunk');
            drunk.setScale(1.4);
            drunk.setCollideWorldBounds(true);
            drunk.setBounce(1);
            drunk.setVelocity(
                (Math.random() > 0.5 ? 1 : -1) * d.speed,
                (Math.random() > 0.5 ? 1 : -1) * d.speed
            );
            drunk.body.setSize(20, 30);
        });

        this.walkFrame = false;
        this.walkTimer = 0;

        // Bar exclusion zone
        this.barExclusion = this.physics.add.staticGroup();
        const exclPad = 50;
        const exclBody = this.add.zone(cfg.barX, cfg.barY, cfg.barW + exclPad * 2, cfg.barH + exclPad * 2);
        this.physics.add.existing(exclBody, true);
        this.barExclusion.add(exclBody);
        this.physics.add.collider(this.drunks, this.barExclusion);

        // Walls (brick barriers)
        this.walls = this.physics.add.staticGroup();
        const wallGfx = this.add.graphics().setDepth(3);
        if (cfg.walls) {
            cfg.walls.forEach(w => {
                // Brick wall visual
                wallGfx.fillStyle(COLORS.brickDark);
                wallGfx.fillRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h);
                wallGfx.fillStyle(COLORS.brick);
                wallGfx.fillRect(w.x - w.w / 2 + 2, w.y - w.h / 2 + 2, w.w - 4, w.h - 4);
                // Brick mortar pattern
                wallGfx.lineStyle(0.5, 0x9A9080, 0.4);
                if (w.w > w.h) {
                    for (let gy = w.y - w.h / 2 + 4; gy < w.y + w.h / 2 - 2; gy += 4) {
                        wallGfx.lineBetween(w.x - w.w / 2 + 3, gy, w.x + w.w / 2 - 3, gy);
                    }
                    // Brick offset pattern
                    for (let gx = w.x - w.w / 2 + 8; gx < w.x + w.w / 2 - 2; gx += 12) {
                        wallGfx.lineBetween(gx, w.y - w.h / 2 + 2, gx, w.y - w.h / 2 + 4);
                        wallGfx.lineBetween(gx + 6, w.y - w.h / 2 + 4, gx + 6, w.y - w.h / 2 + 8);
                    }
                } else {
                    for (let gx = w.x - w.w / 2 + 4; gx < w.x + w.w / 2 - 2; gx += 4) {
                        wallGfx.lineBetween(gx, w.y - w.h / 2 + 3, gx, w.y + w.h / 2 - 3);
                    }
                    for (let gy = w.y - w.h / 2 + 8; gy < w.y + w.h / 2 - 2; gy += 12) {
                        wallGfx.lineBetween(w.x - w.w / 2 + 2, gy, w.x - w.w / 2 + 4, gy);
                        wallGfx.lineBetween(w.x - w.w / 2 + 4, gy + 6, w.x - w.w / 2 + 8, gy + 6);
                    }
                }
                // Top highlight
                wallGfx.fillStyle(COLORS.brickLight, 0.2);
                wallGfx.fillRect(w.x - w.w / 2 + 2, w.y - w.h / 2 + 2, w.w - 4, 3);

                const wallBody = this.add.zone(w.x, w.y, w.w, w.h);
                this.physics.add.existing(wallBody, true);
                this.walls.add(wallBody);
            });
        }
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.drunks, this.walls);

        // Shamrocks (speed power-ups)
        this.shamrocks = this.physics.add.group();
        this.spawnShamrockTimer = this.time.addEvent({
            delay: cfg.powerUpInterval, callback: this.spawnShamrock, callbackScope: this, loop: true
        });

        // Leprechauns (shield power-ups)
        this.leprechauns = this.physics.add.group();
        this.shieldActive = false;
        this.spawnLeprechaunTimer = this.time.addEvent({
            delay: Math.floor(cfg.powerUpInterval * 2), callback: this.spawnLeprechaun, callbackScope: this, loop: true
        });

        // Harps (freeze drunks)
        this.harps = this.physics.add.group();
        this.spawnHarpTimer = this.time.addEvent({
            delay: Math.floor(cfg.powerUpInterval * 2.2), callback: this.spawnHarp, callbackScope: this, loop: true
        });

        // Carried beer visual
        this.beerSprites = [];
        for (let i = 0; i < this.maxBeers; i++) {
            const bs = this.add.image(0, 0, 'beer').setScale(1.2).setVisible(false).setDepth(11);
            this.beerSprites.push(bs);
        }

        // Collisions
        this.physics.add.overlap(this.player, this.drunks, this.hitDrunk, null, this);
        this.physics.add.overlap(this.player, this.shamrocks, this.grabShamrock, null, this);
        this.physics.add.overlap(this.player, this.leprechauns, this.grabLeprechaun, null, this);
        this.physics.add.overlap(this.player, this.harps, this.grabHarp, null, this);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // Interaction zones
        this.nearBarFlag = false;

        // Bar zone
        this.barZone = this.add.zone(cfg.barX, cfg.barY, cfg.barW + 40, cfg.barH + 40);
        this.physics.add.existing(this.barZone, true);

        // UI
        this.createUI();

        // Timer
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.gameActive || this.paused || this.cheatOpen) return;
                this.timeRemaining--;
                this.updateUI();
                if (this.timeRemaining === 10) {
                    PaddyMusic.sfxUrgent();
                    PaddyMusic.setFastTempo();
                }
                if (this.timeRemaining <= 0) this.endGame(false);
            },
            loop: true
        });

        this.showLevelAnnouncement();

        // Particles
        this.starEmitter = this.add.particles(0, 0, 'star', {
            speed: { min: 50, max: 150 }, scale: { start: 1, end: 0 },
            lifespan: 600, emitting: false, quantity: 8
        }).setDepth(20);

        this.foamEmitter = this.add.particles(0, 0, 'foam', {
            speed: { min: 20, max: 80 }, scale: { start: 0.8, end: 0 },
            lifespan: 400, emitting: false, quantity: 5
        }).setDepth(20);

        this.splashEmitter = this.add.particles(0, 0, 'beersplash', {
            speed: { min: 60, max: 180 }, scale: { start: 1.2, end: 0 },
            lifespan: 500, gravityY: 200, emitting: false, quantity: 10
        }).setDepth(20);

        this.shardEmitter = this.add.particles(0, 0, 'glassshard', {
            speed: { min: 80, max: 200 }, scale: { start: 1, end: 0.3 },
            lifespan: 600, gravityY: 250, rotate: { min: 0, max: 360 },
            emitting: false, quantity: 6
        }).setDepth(20);

        // ── Vomit emitter ──
        this.vomitEmitter = this.add.particles(0, 0, 'vomit', {
            speed: { min: 40, max: 120 },
            scale: { start: 1.2, end: 0.3 },
            lifespan: 500,
            gravityY: 180,
            emitting: false,
            quantity: 1
        }).setDepth(20);

        // ── Vomit timer (random 13-18s) ──
        this.vomitFrozen = false;
        this.scheduleNextVomit();

        // Message
        this.msgText = this.add.text(W / 2, 160, '', {
            fontSize: '22px', fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#FFF', backgroundColor: '#1A120A',
            padding: { x: 16, y: 8 }, stroke: '#FFD700', strokeThickness: 1
        }).setOrigin(0.5).setDepth(30).setAlpha(0);

        // Pause system
        this.paused = false;
        this.pauseElements = [];
        this.cheatOpen = false;
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.pauseKey.on('down', () => {
            if (!this.gameActive) return;
            if (this.cheatOpen) return;
            if (this.paused) this.resumeGame();
            else this.pauseGame();
        });

        // Cheat code system (CTRL+X)
        this.input.keyboard.on('keydown', (e) => {
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                if (this.cheatOpen) this.closeCheatConsole();
                else this.openCheatConsole();
            }
        });

        this.cameras.main.fadeIn(400);

        // Touch input bridge (set by mobile.html, ignored on PC)
        this._prevTouchAction = false;
    }

    openCheatConsole() {
        if (this.cheatOpen) return;
        this.cheatOpen = true;
        if (!this.paused && this.gameActive) {
            this.physics.pause();
            this.timerEvent.paused = true;
            if (this.spawnShamrockTimer) this.spawnShamrockTimer.paused = true;
            if (this.spawnLeprechaunTimer) this.spawnLeprechaunTimer.paused = true;
            if (this.spawnHarpTimer) this.spawnHarpTimer.paused = true;
            if (this.vomitTimer) this.vomitTimer.paused = true;
        }
        this.cheatElements = [];
        const panel = this.add.graphics().setDepth(70);
        panel.fillStyle(0x000000, 0.85);
        panel.fillRoundedRect(10, 10, 260, 44, 8);
        panel.lineStyle(1.5, 0x1B8A4B, 0.8);
        panel.strokeRoundedRect(10, 10, 260, 44, 8);
        this.cheatElements.push(panel);
        const prompt = this.add.text(20, 22, '>', {
            fontSize: '18px', fontFamily: 'monospace', fill: '#1B8A4B', fontStyle: 'bold'
        }).setDepth(71);
        this.cheatElements.push(prompt);
        this.cheatInput = '';
        this.cheatText = this.add.text(38, 22, '', {
            fontSize: '18px', fontFamily: 'monospace', fill: '#00FF00'
        }).setDepth(71);
        this.cheatElements.push(this.cheatText);
        this.cheatCursor = this.add.text(38, 22, '_', {
            fontSize: '18px', fontFamily: 'monospace', fill: '#00FF00'
        }).setDepth(71);
        this.cheatElements.push(this.cheatCursor);
        this.cheatCursorTween = this.tweens.add({
            targets: this.cheatCursor, alpha: 0, duration: 400, yoyo: true, repeat: -1
        });
        this.cheatKeyHandler = (e) => {
            if (!this.cheatOpen) return;
            if (e.key === 'Enter') { this.executeCheat(this.cheatInput.trim()); this.closeCheatConsole(); }
            else if (e.key === 'Escape' || (e.ctrlKey && e.key === 'x')) { this.closeCheatConsole(); }
            else if (e.key === 'Backspace') { this.cheatInput = this.cheatInput.slice(0, -1); this.updateCheatDisplay(); }
            else if (e.key.length === 1 && this.cheatInput.length < 30) { this.cheatInput += e.key; this.updateCheatDisplay(); }
        };
        this.input.keyboard.on('keydown', this.cheatKeyHandler);
    }

    updateCheatDisplay() {
        if (this.cheatText) this.cheatText.setText(this.cheatInput);
        if (this.cheatCursor) {
            const w = this.cheatText ? this.cheatText.width : 0;
            this.cheatCursor.setX(38 + w);
        }
    }

    closeCheatConsole() {
        if (!this.cheatOpen) return;
        this.cheatOpen = false;
        if (this.cheatKeyHandler) { this.input.keyboard.off('keydown', this.cheatKeyHandler); this.cheatKeyHandler = null; }
        if (this.cheatCursorTween) this.cheatCursorTween.stop();
        if (this.cheatElements) { this.cheatElements.forEach(el => el.destroy()); this.cheatElements = []; }
        if (!this.paused && this.gameActive) {
            this.physics.resume();
            this.timerEvent.paused = false;
            if (this.spawnShamrockTimer) this.spawnShamrockTimer.paused = false;
            if (this.spawnLeprechaunTimer) this.spawnLeprechaunTimer.paused = false;
            if (this.spawnHarpTimer) this.spawnHarpTimer.paused = false;
            if (this.vomitTimer) this.vomitTimer.paused = false;
        }
    }

    executeCheat(code) {
        const cmd = code.toLowerCase();
        const lvl = parseInt(code);
        if (lvl >= 1 && lvl <= 12) {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => { this.scene.start('GameScene', { level: lvl }); });
            return;
        }
        if (cmd === 'shamrock') {
            this.speedBoostActive = true;
            this.player.setTint(0x44DD55);
            this.showMsg('CHEAT: Vitesse permanente !');
            return;
        }
        if (cmd === 'leprechaun') {
            this.shieldActive = true;
            this.player.setTint(0xFFD700);
            if (!this.shieldRing || !this.shieldRing.active) {
                this.shieldRing = this.add.graphics().setDepth(12);
                this.shieldRingAngle = 0;
            }
            if (!this.shieldGlow || !this.shieldGlow.active) {
                this.shieldGlow = this.add.graphics().setDepth(9);
                this.shieldGlowTween = this.tweens.add({
                    targets: { val: 0.3 }, val: 0.6, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                    onUpdate: (tween) => {
                        if (!this.shieldGlow || !this.shieldGlow.active) return;
                        this.shieldGlow.clear();
                        this.shieldGlow.fillStyle(0xFFD700, tween.getValue());
                        this.shieldGlow.fillCircle(this.player.x, this.player.y, 32);
                    }
                });
            }
            this.showMsg('CHEAT: Bouclier permanent !');
            return;
        }
        if (cmd === 'dublin') {
            this.drunks.getChildren().forEach(d => {
                d.body.setVelocity(0, 0); d.body.setImmovable(true); d.body.moves = false;
            });
            this.showMsg('CHEAT: Ivrognes figés !');
            return;
        }
        if (cmd === 'ireland') {
            if (this.walls) { this.walls.getChildren().forEach(w => w.destroy()); this.walls.clear(true, true); }
            this.children.list.filter(c => c.type === 'Graphics' && c.depth === 3).forEach(g => g.destroy());
            this.showMsg('CHEAT: Murs supprimés !');
            return;
        }
    }

    pauseGame() {
        this.paused = true;
        this.physics.pause();
        this.timerEvent.paused = true;
        if (this.spawnShamrockTimer) this.spawnShamrockTimer.paused = true;
        if (this.spawnLeprechaunTimer) this.spawnLeprechaunTimer.paused = true;
        if (this.spawnHarpTimer) this.spawnHarpTimer.paused = true;
            if (this.vomitTimer) this.vomitTimer.paused = true;

        const overlay = this.add.graphics().setDepth(60);
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, W, H);
        this.pauseElements.push(overlay);

        const panelW = 400, panelH = 220;
        const px = W / 2 - panelW / 2, py = H / 2 - panelH / 2;
        const panel = this.add.graphics().setDepth(61);
        panel.fillStyle(COLORS.uiBg, 0.95);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.lineStyle(3, COLORS.gold);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.pauseElements.push(panel);

        const title = this.add.text(W / 2, H / 2 - 60, '⏸ PAUSE', {
            fontSize: '36px', fontFamily: 'MedievalSharp, serif',
            fill: '#FFD700', stroke: '#1A120A', strokeThickness: 4
        }).setOrigin(0.5).setDepth(62);
        this.pauseElements.push(title);

        const question = this.add.text(W / 2, H / 2 - 10, 'Retourner au menu ?', {
            fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0'
        }).setOrigin(0.5).setDepth(62);
        this.pauseElements.push(question);

        const btnW = 130, btnH = 44, gap = 20;
        const btnY = H / 2 + 50;

        // OUI
        const ouiBg = this.add.graphics().setDepth(62);
        ouiBg.fillStyle(COLORS.danger);
        ouiBg.fillRoundedRect(W / 2 - gap / 2 - btnW, btnY - btnH / 2, btnW, btnH, 22);
        this.pauseElements.push(ouiBg);
        const ouiText = this.add.text(W / 2 - gap / 2 - btnW / 2, btnY, 'OUI', {
            fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fill: '#FFF'
        }).setOrigin(0.5).setDepth(63);
        this.pauseElements.push(ouiText);
        const ouiZone = this.add.zone(W / 2 - gap / 2 - btnW / 2, btnY, btnW, btnH)
            .setDepth(64).setInteractive({ useHandCursor: true });
        ouiZone.on('pointerover', () => { ouiBg.clear(); ouiBg.fillStyle(0xFF5555); ouiBg.fillRoundedRect(W / 2 - gap / 2 - btnW, btnY - btnH / 2, btnW, btnH, 22); });
        ouiZone.on('pointerout', () => { ouiBg.clear(); ouiBg.fillStyle(COLORS.danger); ouiBg.fillRoundedRect(W / 2 - gap / 2 - btnW, btnY - btnH / 2, btnW, btnH, 22); });
        ouiZone.on('pointerdown', () => { this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(300, () => this.scene.start('MenuScene')); });
        this.pauseElements.push(ouiZone);

        // NON
        const nonBg = this.add.graphics().setDepth(62);
        nonBg.fillStyle(COLORS.success);
        nonBg.fillRoundedRect(W / 2 + gap / 2, btnY - btnH / 2, btnW, btnH, 22);
        this.pauseElements.push(nonBg);
        const nonText = this.add.text(W / 2 + gap / 2 + btnW / 2, btnY, 'NON', {
            fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fill: '#FFF'
        }).setOrigin(0.5).setDepth(63);
        this.pauseElements.push(nonText);
        const nonZone = this.add.zone(W / 2 + gap / 2 + btnW / 2, btnY, btnW, btnH)
            .setDepth(64).setInteractive({ useHandCursor: true });
        nonZone.on('pointerover', () => { nonBg.clear(); nonBg.fillStyle(0x33CC55); nonBg.fillRoundedRect(W / 2 + gap / 2, btnY - btnH / 2, btnW, btnH, 22); });
        nonZone.on('pointerout', () => { nonBg.clear(); nonBg.fillStyle(COLORS.success); nonBg.fillRoundedRect(W / 2 + gap / 2, btnY - btnH / 2, btnW, btnH, 22); });
        nonZone.on('pointerdown', () => { this.resumeGame(); });
        this.pauseElements.push(nonZone);
    }

    resumeGame() {
        this.paused = false;
        this.physics.resume();
        this.timerEvent.paused = false;
        if (this.spawnShamrockTimer) this.spawnShamrockTimer.paused = false;
        if (this.spawnLeprechaunTimer) this.spawnLeprechaunTimer.paused = false;
        if (this.spawnHarpTimer) this.spawnHarpTimer.paused = false;
            if (this.vomitTimer) this.vomitTimer.paused = false;
        this.pauseElements.forEach(el => el.destroy());
        this.pauseElements = [];
    }

    getLevelConfig() {
        const levels = {
            1: { time:35, maxBeers:2, playerSpeed:250, deliveriesNeeded:6, barX:W/2, barY:70, barW:300, barH:50,
                tables:[{x:200,y:550,beers:2,scale:1},{x:500,y:550,beers:2,scale:1},{x:800,y:550,beers:2,scale:1}],
                drunks:[{x:400,y:350,speed:75},{x:600,y:400,speed:75},{x:500,y:300,speed:75}],
                powerUpInterval:25000, walls:[{x:300,y:300,w:160,h:14},{x:700,y:300,w:160,h:14},{x:500,y:400,w:14,h:100}]},
            2: { time:35, maxBeers:2, playerSpeed:250, deliveriesNeeded:8, barX:W/2, barY:70, barW:300, barH:50,
                tables:[{x:150,y:450,beers:2},{x:500,y:550,beers:2},{x:850,y:450,beers:2},{x:500,y:350,beers:2}],
                drunks:[{x:300,y:300,speed:83},{x:700,y:400,speed:83},{x:500,y:500,speed:83}],
                powerUpInterval:20000, walls:[{x:250,y:250,w:200,h:14},{x:750,y:250,w:200,h:14},{x:500,y:220,w:14,h:100},{x:300,y:480,w:14,h:120},{x:700,y:480,w:14,h:120},{x:500,y:480,w:200,h:14}]},
            3: { time:40, maxBeers:2, playerSpeed:250, deliveriesNeeded:12, barX:W/2, barY:70, barW:280, barH:50,
                tables:[{x:150,y:400,beers:2},{x:400,y:550,beers:3},{x:600,y:550,beers:3},{x:850,y:400,beers:2},{x:500,y:350,beers:2}],
                drunks:[{x:250,y:300,speed:88},{x:600,y:250,speed:88},{x:750,y:500,speed:88},{x:400,y:400,speed:88}],
                powerUpInterval:15000, walls:[{x:200,y:200,w:14,h:160},{x:800,y:200,w:14,h:160},{x:350,y:280,w:180,h:14},{x:650,y:280,w:180,h:14},{x:500,y:200,w:14,h:100},{x:350,y:430,w:14,h:80},{x:650,y:430,w:14,h:80},{x:500,y:480,w:160,h:14}]},
            4: { time:40, maxBeers:3, playerSpeed:260, deliveriesNeeded:16, barX:W/2, barY:70, barW:260, barH:50,
                tables:[{x:120,y:350,beers:3},{x:350,y:550,beers:2},{x:650,y:550,beers:2},{x:880,y:350,beers:3},{x:300,y:400,beers:3},{x:700,y:400,beers:3}],
                drunks:[{x:200,y:250,speed:91},{x:500,y:300,speed:91},{x:800,y:250,speed:91},{x:400,y:500,speed:91}],
                powerUpInterval:12000, walls:[{x:180,y:200,w:14,h:180},{x:820,y:200,w:14,h:180},{x:350,y:200,w:180,h:14},{x:650,y:200,w:180,h:14},{x:350,y:300,w:14,h:120},{x:650,y:300,w:14,h:120},{x:500,y:300,w:160,h:14},{x:250,y:470,w:200,h:14},{x:750,y:470,w:200,h:14},{x:500,y:470,w:14,h:130}]},
            5: { time:45, maxBeers:4, playerSpeed:270, deliveriesNeeded:18, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:120,y:320,beers:3},{x:300,y:550,beers:3},{x:500,y:420,beers:2},{x:700,y:550,beers:2},{x:880,y:320,beers:2},{x:200,y:450,beers:3},{x:800,y:450,beers:3}],
                drunks:[{x:200,y:250,speed:108},{x:500,y:280,speed:108},{x:800,y:250,speed:108},{x:350,y:480,speed:108},{x:650,y:480,speed:108}],
                powerUpInterval:12000, walls:[{x:150,y:190,w:14,h:160},{x:850,y:190,w:14,h:160},{x:300,y:190,w:160,h:14},{x:700,y:190,w:160,h:14},{x:300,y:280,w:14,h:100},{x:700,y:280,w:14,h:100},{x:500,y:250,w:14,h:120},{x:420,y:350,w:120,h:14},{x:580,y:350,w:120,h:14},{x:200,y:300,w:14,h:120},{x:800,y:300,w:14,h:120},{x:350,y:480,w:200,h:14},{x:650,y:480,w:200,h:14},{x:500,y:540,w:14,h:100}]},
            6: { time:45, maxBeers:4, playerSpeed:270, deliveriesNeeded:21, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:150,y:250,beers:3},{x:500,y:250,beers:3},{x:850,y:250,beers:3},{x:250,y:500,beers:3},{x:500,y:600,beers:3},{x:750,y:500,beers:3},{x:500,y:400,beers:3}],
                drunks:[{x:300,y:350,speed:113},{x:700,y:350,speed:113},{x:500,y:500,speed:113},{x:200,y:400,speed:113},{x:800,y:400,speed:113}],
                powerUpInterval:12000, walls:[{x:330,y:180,w:14,h:100},{x:670,y:180,w:14,h:100},{x:250,y:350,w:180,h:14},{x:750,y:350,w:180,h:14},{x:500,y:325,w:14,h:70},{x:380,y:450,w:14,h:100},{x:620,y:450,w:14,h:100},{x:150,y:400,w:120,h:14},{x:850,y:400,w:120,h:14},{x:500,y:520,w:160,h:14}]},
            7: { time:45, maxBeers:4, playerSpeed:280, deliveriesNeeded:23, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:150,y:350,beers:3},{x:350,y:200,beers:3},{x:650,y:200,beers:4},{x:850,y:350,beers:4},{x:250,y:580,beers:3},{x:500,y:530,beers:3},{x:750,y:580,beers:3}],
                drunks:[{x:400,y:350,speed:123},{x:600,y:350,speed:123},{x:300,y:450,speed:123},{x:700,y:450,speed:123},{x:500,y:300,speed:123},{x:500,y:600,speed:123}],
                powerUpInterval:12000, walls:[{x:250,y:270,w:14,h:120},{x:750,y:270,w:14,h:120},{x:500,y:200,w:14,h:140},{x:350,y:380,w:160,h:14},{x:650,y:380,w:160,h:14},{x:180,y:480,w:14,h:100},{x:820,y:480,w:14,h:100},{x:400,y:480,w:140,h:14},{x:600,y:480,w:140,h:14},{x:350,y:560,w:14,h:80},{x:650,y:560,w:14,h:80}]},
            8: { time:50, maxBeers:5, playerSpeed:290, deliveriesNeeded:28, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:120,y:220,beers:4},{x:880,y:220,beers:4},{x:300,y:400,beers:4},{x:700,y:400,beers:4},{x:150,y:580,beers:4},{x:500,y:550,beers:4},{x:850,y:580,beers:4}],
                drunks:[{x:350,y:250,speed:131},{x:650,y:250,speed:131},{x:500,y:350,speed:131},{x:200,y:480,speed:131},{x:800,y:480,speed:131},{x:500,y:480,speed:131}],
                powerUpInterval:12000, walls:[{x:250,y:180,w:14,h:120},{x:750,y:180,w:14,h:120},{x:400,y:200,w:120,h:14},{x:600,y:200,w:120,h:14},{x:500,y:280,w:14,h:100},{x:180,y:340,w:14,h:100},{x:820,y:340,w:14,h:100},{x:400,y:340,w:160,h:14},{x:600,y:340,w:160,h:14},{x:300,y:490,w:14,h:80},{x:700,y:490,w:14,h:80},{x:500,y:460,w:14,h:80},{x:350,y:600,w:200,h:14},{x:650,y:600,w:200,h:14}]},
            9: { time:50, maxBeers:5, playerSpeed:300, deliveriesNeeded:31, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:200,y:200,beers:4},{x:800,y:200,beers:4},{x:120,y:430,beers:5},{x:500,y:330,beers:5},{x:880,y:430,beers:5},{x:300,y:600,beers:4},{x:700,y:600,beers:4}],
                drunks:[{x:400,y:200,speed:141},{x:600,y:200,speed:141},{x:300,y:400,speed:141},{x:700,y:400,speed:141},{x:500,y:530,speed:141},{x:500,y:250,speed:141}],
                powerUpInterval:12000, walls:[{x:350,y:170,w:14,h:100},{x:650,y:170,w:14,h:100},{x:500,y:200,w:120,h:14},{x:200,y:310,w:14,h:100},{x:800,y:310,w:14,h:100},{x:350,y:310,w:180,h:14},{x:650,y:310,w:180,h:14},{x:500,y:420,w:14,h:100},{x:250,y:520,w:14,h:80},{x:750,y:520,w:14,h:80},{x:400,y:520,w:140,h:14},{x:600,y:520,w:140,h:14}]},
            10: { time:55, maxBeers:5, playerSpeed:310, deliveriesNeeded:35, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:500,y:200,beers:5},{x:150,y:320,beers:5},{x:850,y:320,beers:5},{x:350,y:450,beers:5},{x:650,y:450,beers:5},{x:200,y:600,beers:5},{x:800,y:600,beers:5}],
                drunks:[{x:300,y:250,speed:146},{x:700,y:250,speed:146},{x:500,y:350,speed:146},{x:250,y:500,speed:146},{x:750,y:500,speed:146},{x:500,y:550,speed:146},{x:400,y:400,speed:146}],
                powerUpInterval:12000, walls:[{x:300,y:160,w:14,h:100},{x:700,y:160,w:14,h:100},{x:500,y:280,w:14,h:80},{x:200,y:240,w:120,h:14},{x:800,y:240,w:120,h:14},{x:350,y:330,w:200,h:14},{x:650,y:330,w:200,h:14},{x:250,y:400,w:14,h:100},{x:750,y:400,w:14,h:100},{x:500,y:500,w:14,h:100},{x:350,y:540,w:140,h:14},{x:650,y:540,w:140,h:14},{x:150,y:500,w:14,h:100},{x:850,y:500,w:14,h:100}]},
            11: { time:55, maxBeers:6, playerSpeed:310, deliveriesNeeded:43, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:150,y:200,beers:5},{x:500,y:160,beers:5},{x:850,y:200,beers:6},{x:400,y:350,beers:6},{x:600,y:350,beers:6},{x:250,y:520,beers:5},{x:500,y:600,beers:5},{x:750,y:520,beers:5}],
                drunks:[{x:300,y:250,speed:152},{x:700,y:250,speed:152},{x:500,y:300,speed:152},{x:200,y:450,speed:152},{x:800,y:450,speed:152},{x:500,y:520,speed:152},{x:400,y:450,speed:152}],
                powerUpInterval:12000, walls:[{x:300,y:180,w:14,h:100},{x:700,y:180,w:14,h:100},{x:200,y:280,w:160,h:14},{x:800,y:280,w:160,h:14},{x:500,y:240,w:14,h:80},{x:150,y:380,w:14,h:100},{x:850,y:380,w:14,h:100},{x:350,y:430,w:140,h:14},{x:650,y:430,w:140,h:14},{x:400,y:540,w:14,h:80},{x:600,y:540,w:14,h:80},{x:500,y:490,w:120,h:14}]},
            12: { time:55, maxBeers:6, playerSpeed:310, deliveriesNeeded:48, barX:W/2, barY:70, barW:240, barH:50,
                tables:[{x:500,y:200,beers:6},{x:200,y:300,beers:6},{x:800,y:300,beers:6},{x:500,y:420,beers:6},{x:120,y:520,beers:6},{x:880,y:520,beers:6},{x:350,y:600,beers:6},{x:650,y:600,beers:6}],
                drunks:[{x:350,y:200,speed:161},{x:650,y:200,speed:161},{x:500,y:350,speed:161},{x:200,y:450,speed:161},{x:800,y:450,speed:161},{x:500,y:550,speed:161},{x:300,y:550,speed:161},{x:700,y:550,speed:161}],
                powerUpInterval:12000, walls:[{x:350,y:160,w:14,h:80},{x:650,y:160,w:14,h:80},{x:250,y:230,w:140,h:14},{x:750,y:230,w:140,h:14},{x:500,y:280,w:14,h:80},{x:350,y:370,w:14,h:100},{x:650,y:370,w:14,h:100},{x:200,y:400,w:120,h:14},{x:800,y:400,w:120,h:14},{x:150,y:420,w:14,h:80},{x:850,y:420,w:14,h:80},{x:260,y:540,w:14,h:80},{x:740,y:540,w:14,h:80},{x:500,y:560,w:100,h:14}]}
        };
        const lvl = Math.min(this.level, 12);
        return levels[lvl];
    }

    drawPub() {
        // Level-based pub decor themes
        const themes = [
            null,
            { ceiling:0x1B8A4B, bunting1:0x169B62, bunting2:0xFF883E, buntW:0xFFFFFF, light:0xFFDD66, lantern:0xFFAA00 },
            { ceiling:0x1B8A4B, bunting1:0x169B62, bunting2:0xFF883E, buntW:0xFFFFFF, light:0xFFDD66, lantern:0xFFAA00 },
            { ceiling:0x8B4533, bunting1:0xCC5533, bunting2:0xFFDD44, buntW:0xFFFFFF, light:0xFFBB66, lantern:0xFF8833 },
            { ceiling:0x8B4533, bunting1:0xCC5533, bunting2:0xFFDD44, buntW:0xFFFFFF, light:0xFFBB66, lantern:0xFF8833 },
            { ceiling:0x2C5F2D, bunting1:0x3A8B3C, bunting2:0xFFD700, buntW:0xFFFFFF, light:0xAAFF88, lantern:0x66CC44 },
            { ceiling:0x2C5F2D, bunting1:0x3A8B3C, bunting2:0xFFD700, buntW:0xFFFFFF, light:0xAAFF88, lantern:0x66CC44 },
            { ceiling:0x4A2860, bunting1:0x7744AA, bunting2:0xFFDD44, buntW:0xFFFFFF, light:0xDDBBFF, lantern:0xAA66DD },
            { ceiling:0x4A2860, bunting1:0x7744AA, bunting2:0xFFDD44, buntW:0xFFFFFF, light:0xDDBBFF, lantern:0xAA66DD },
            { ceiling:0x8B6914, bunting1:0xDAA520, bunting2:0x1B8A4B, buntW:0xFFFFFF, light:0xFFCC44, lantern:0xFFAA22 },
            { ceiling:0xCC2222, bunting1:0xFF3333, bunting2:0xFFDD00, buntW:0xFFFFFF, light:0xFF6644, lantern:0xFF4444 },
            { ceiling:0x006666, bunting1:0x00AAAA, bunting2:0xFFFFDD, buntW:0x169B62, light:0x66FFDD, lantern:0x00CCAA },
            { ceiling:0x333333, bunting1:0xFFD700, bunting2:0x169B62, buntW:0xFFFFFF, light:0xFFAA22, lantern:0xFFCC00 },
        ];
        const theme = themes[Math.min(this.level, 12)];

        const bg = this.add.graphics();
        // Cobblestone floor
        bg.fillStyle(COLORS.floor);
        bg.fillRect(0, 0, W, H);
        // Cobblestone pattern
        for (let row = 0; row < 18; row++) {
            for (let col = 0; col < 26; col++) {
                if ((row + col) % 2 === 0) {
                    bg.fillStyle(COLORS.floorTile, 0.3);
                    bg.fillRect(col * 40, row * 40, 40, 40);
                }
                // Random cobble highlights
                if ((row * 7 + col * 13) % 5 === 0) {
                    bg.fillStyle(0x9A9585, 0.15);
                    bg.fillCircle(col * 40 + 20, row * 40 + 20, 8);
                }
            }
        }
        // Warm light spots
        bg.fillStyle(theme.light, 0.05);
        bg.fillCircle(250, 300, 200);
        bg.fillCircle(750, 300, 200);
        bg.fillCircle(500, 500, 250);

        const deco = this.add.graphics().setDepth(0);

        // Dublin pub ceiling / dark timber
        for (let i = 0; i < 20; i++) {
            deco.fillStyle(i % 2 === 0 ? theme.ceiling : 0x1A120A, i % 2 === 0 ? 0.1 : 0.08);
            deco.fillRect(i * 50, 0, 50, 30);
        }

        // Irish flag bunting at top
        for (let i = 0; i < 18; i++) {
            const bx = 30 + i * 56;
            const colors = [theme.bunting1, theme.buntW, theme.bunting2];
            deco.fillStyle(colors[i % 3]);
            deco.fillTriangle(bx - 12, 25, bx + 12, 25, bx, 48);
        }
        deco.lineStyle(1.5, 0x888888, 0.5);
        deco.lineBetween(18, 26, W - 18, 26);

        // Second row: small shamrock-like dots
        for (let i = 0; i < 25; i++) {
            const dx = 20 + i * 40;
            const dy = 50;
            deco.fillStyle(i % 2 === 0 ? 0x1B8A2B : 0xFFD700, 0.5);
            deco.fillCircle(dx, dy, 4);
        }
        deco.lineStyle(1, 0x666666, 0.3);
        deco.lineBetween(12, 50, W - 12, 50);

        // Hanging garland strings
        deco.lineStyle(2, 0x1B8A2B, 0.3);
        for (let g = 0; g < 4; g++) {
            const gx1 = 80 + g * 250;
            const gx2 = gx1 + 250;
            const pts = 8;
            for (let p = 0; p < pts; p++) {
                const t1 = p / pts;
                const t2 = (p + 1) / pts;
                const x1g = gx1 + (gx2 - gx1) * t1;
                const x2g = gx1 + (gx2 - gx1) * t2;
                const sag1 = Math.sin(t1 * Math.PI) * 28;
                const sag2 = Math.sin(t2 * Math.PI) * 28;
                deco.lineBetween(x1g, 28 + sag1, x2g, 28 + sag2);
            }
        }

        // Side brick pillars
        const posts = this.add.graphics().setDepth(1);
        // Left pillar
        posts.fillStyle(COLORS.brick);
        posts.fillRect(0, 0, 18, H);
        posts.fillStyle(COLORS.brickDark);
        posts.fillRect(0, 0, 8, H);
        // Right pillar
        posts.fillStyle(COLORS.brick);
        posts.fillRect(W - 18, 0, 18, H);
        posts.fillStyle(COLORS.brickDark);
        posts.fillRect(W - 8, 0, 8, H);
        // Mortar lines on pillars
        posts.lineStyle(0.5, 0x9A9080, 0.4);
        for (let py = 0; py < H; py += 8) {
            posts.lineBetween(0, py, 18, py);
            posts.lineBetween(W - 18, py, W, py);
        }

        // Decorative kegs along walls
        const sideDeco = this.add.graphics().setDepth(1);
        const sideKegY = [180, 350, 520];
        sideKegY.forEach(by => {
            // Left keg
            sideDeco.fillStyle(0x1A1A1A);
            sideDeco.fillRoundedRect(20, by - 18, 30, 36, 5);
            sideDeco.fillStyle(0x2A2A2A);
            sideDeco.fillRoundedRect(22, by - 16, 26, 32, 4);
            // Gold band
            sideDeco.lineStyle(1.5, 0xDAA520);
            sideDeco.lineBetween(22, by - 8, 48, by - 8);
            sideDeco.lineBetween(22, by + 8, 48, by + 8);
            // Harp logo (tiny)
            sideDeco.fillStyle(0xDAA520);
            sideDeco.fillCircle(35, by, 4);
            sideDeco.fillStyle(0x1A1A1A);
            sideDeco.fillCircle(35, by, 2);
            // Right keg
            sideDeco.fillStyle(0x1A1A1A);
            sideDeco.fillRoundedRect(W - 50, by - 18, 30, 36, 5);
            sideDeco.fillStyle(0x2A2A2A);
            sideDeco.fillRoundedRect(W - 48, by - 16, 26, 32, 4);
            sideDeco.lineStyle(1.5, 0xDAA520);
            sideDeco.lineBetween(W - 48, by - 8, W - 22, by - 8);
            sideDeco.lineBetween(W - 48, by + 8, W - 22, by + 8);
            sideDeco.fillStyle(0xDAA520);
            sideDeco.fillCircle(W - 35, by, 4);
            sideDeco.fillStyle(0x1A1A1A);
            sideDeco.fillCircle(W - 35, by, 2);
        });

        // Hanging pub lanterns (warm glow)
        const lanternX = [160, 380, 620, 840];
        lanternX.forEach((lx) => {
            deco.lineStyle(1, 0x666666, 0.4);
            deco.lineBetween(lx, 0, lx, 42);
            deco.fillStyle(theme.lantern, 0.7);
            deco.fillRoundedRect(lx - 8, 35, 16, 20, 4);
            deco.fillStyle(theme.lantern, 0.08);
            deco.fillCircle(lx, 45, 30);
            deco.fillStyle(0x888888, 0.5);
            deco.fillRect(lx - 6, 34, 12, 4);
            deco.fillStyle(0x888888, 0.5);
            deco.fillRect(lx - 4, 53, 8, 3);
        });

        // Celtic knot shield (center top decoration)
        const cx = W / 2, cy = 15;
        deco.fillStyle(0x1B8A2B, 0.5);
        deco.fillRoundedRect(cx - 18, cy - 8, 36, 22, 6);
        deco.lineStyle(1, 0xFFD700, 0.6);
        deco.strokeRoundedRect(cx - 18, cy - 8, 36, 22, 6);
        // Irish flag mini pattern inside
        deco.fillStyle(0x169B62, 0.7);
        deco.fillRect(cx - 12, cy - 4, 8, 14);
        deco.fillStyle(0xFFFFFF, 0.6);
        deco.fillRect(cx - 4, cy - 4, 8, 14);
        deco.fillStyle(0xFF883E, 0.7);
        deco.fillRect(cx + 4, cy - 4, 8, 14);

        // Ivy vines along side walls
        [22, W - 22].forEach(vx => {
            for (let vy = 80; vy < H - 80; vy += 60) {
                deco.lineStyle(1, 0x228B22, 0.25);
                deco.lineBetween(vx, vy, vx + (vx < W / 2 ? 8 : -8), vy + 15);
                deco.lineBetween(vx, vy + 15, vx + (vx < W / 2 ? -5 : 5), vy + 30);
                // Ivy leaves
                deco.fillStyle(0x2A8B2A, 0.35);
                deco.fillCircle(vx + (vx < W / 2 ? 6 : -6), vy + 8, 4);
                deco.fillCircle(vx + (vx < W / 2 ? -3 : 3), vy + 22, 3);
            }
        });

        // Wet cobblestone patches (subtle)
        deco.fillStyle(0x6A6560, 0.08);
        deco.fillCircle(180, 480, 50);
        deco.fillCircle(600, 380, 40);
        deco.fillCircle(820, 520, 45);
        deco.fillCircle(400, 300, 35);
    }

    drawBar(cfg) {
        const barG = this.add.graphics();
        const bx = cfg.barX - cfg.barW / 2;
        const by = cfg.barY - cfg.barH / 2;

        // Kegs behind the bar
        const kegCount = 5;
        const kegW = 36;
        const kegH = 44;
        const kegsStartX = cfg.barX - (kegCount * kegW) / 2 + kegW / 2;
        for (let i = 0; i < kegCount; i++) {
            const bxr = kegsStartX + i * kegW;
            const byr = by - kegH + 6;
            barG.fillStyle(0x1A1A1A);
            barG.fillRoundedRect(bxr - 14, byr, 28, kegH, 6);
            barG.fillStyle(0x2A2A2A);
            barG.fillRoundedRect(bxr - 16, byr + 10, 32, kegH - 20, 4);
            barG.lineStyle(2, 0xDAA520);
            barG.lineBetween(bxr - 14, byr + 8, bxr + 14, byr + 8);
            barG.lineBetween(bxr - 14, byr + kegH - 8, bxr + 14, byr + kegH - 8);
            barG.lineStyle(1.5, 0xBB9920);
            barG.lineBetween(bxr - 15, byr + kegH / 2, bxr + 15, byr + kegH / 2);
            barG.fillStyle(0x111111);
            barG.fillCircle(bxr, byr + kegH / 2, 6);
            barG.fillStyle(0xDAA520);
            barG.fillCircle(bxr, byr + kegH / 2, 3);
        }

        // Bar counter shadow
        barG.fillStyle(0x000000, 0.25);
        barG.fillRoundedRect(bx + 4, by + 4, cfg.barW, cfg.barH, 8);
        // Bar counter body (dark Irish pub wood)
        barG.fillStyle(0x3A1808);
        barG.fillRoundedRect(bx, by, cfg.barW, cfg.barH, 8);
        // Wood panels
        barG.fillStyle(0x4A2818);
        const panelCount = Math.floor(cfg.barW / 40);
        for (let i = 0; i < panelCount; i++) {
            barG.fillRoundedRect(bx + 6 + i * 40, by + 6, 34, cfg.barH - 12, 3);
        }
        // Bar counter top (polished mahogany)
        barG.fillStyle(0x8B5E3C);
        barG.fillRoundedRect(bx - 6, by - 4, cfg.barW + 12, 16, 6);
        barG.fillStyle(0x9B6E4C, 0.4);
        barG.fillRoundedRect(bx, by - 2, cfg.barW, 6, 3);
        barG.lineStyle(2, 0x7B4E2C);
        barG.lineBetween(bx - 4, by + 10, bx + cfg.barW + 4, by + 10);

        // Taps (black with gold)
        for (let i = 0; i < 3; i++) {
            const tx = cfg.barX - 50 + i * 50;
            barG.fillStyle(0x111111);
            barG.fillRoundedRect(tx - 5, by - 8, 10, 6, 2);
            barG.fillStyle(0x222222);
            barG.fillRect(tx - 3, by - 24, 6, 20);
            barG.fillStyle(0x111111);
            barG.fillRoundedRect(tx - 5, by - 30, 10, 8, 3);
            barG.fillStyle(0xDAA520);
            barG.fillCircle(tx, by - 30, 5);
            barG.fillStyle(0xFFE44D, 0.5);
            barG.fillCircle(tx - 1, by - 31, 2);
        }

        // Pints on bar
        const mugPositions = [cfg.barX - 100, cfg.barX + 100];
        mugPositions.forEach(mx => {
            barG.fillStyle(0x1A0800, 0.6);
            barG.fillRoundedRect(mx - 6, by - 2, 12, 14, 2);
            barG.fillStyle(0xE8D5B0, 0.6);
            barG.fillRoundedRect(mx - 7, by - 4, 14, 5, 2);
        });

        // BAR text
        this.add.text(cfg.barX, cfg.barY + 8, '🍺 BAR 🍺', {
            fontSize: '18px', fontFamily: 'Arial, Helvetica, sans-serif',
            fontStyle: 'bold', fill: '#FFD700', stroke: '#1A120A', strokeThickness: 3
        }).setOrigin(0.5).setDepth(2);
        barG.setDepth(1);
    }

    updateTableIndicators(table) {
        if (table.indicators) { table.indicators.forEach(i => i.destroy()); }
        table.indicators = [];
        if (table.complete) {
            const check = this.add.text(table.x, table.y - 45, '✅', { fontSize: '24px' }).setOrigin(0.5).setDepth(5);
            table.indicators.push(check);
            return;
        }
        const remaining = table.beersNeeded - table.beersDelivered;
        for (let i = 0; i < remaining; i++) {
            const indicator = this.add.image(table.x - (remaining - 1) * 10 + i * 20, table.y - 45, 'beer')
                .setScale(1).setDepth(5).setAlpha(0.5);
            table.indicators.push(indicator);
        }
        for (let i = 0; i < table.beersDelivered; i++) {
            const delivered = this.add.image(table.x - (table.beersNeeded - 1) * 10 + (remaining + i) * 20, table.y - 45, 'beer')
                .setScale(1).setDepth(5).setTint(COLORS.success);
            table.indicators.push(delivered);
        }
    }

    createUI() {
        const uiBg = this.add.graphics().setDepth(25);
        uiBg.fillStyle(COLORS.uiBg, 0.9);
        uiBg.fillRoundedRect(8, H - 52, W - 16, 46, 10);
        uiBg.lineStyle(2, COLORS.gold, 0.6);
        uiBg.strokeRoundedRect(8, H - 52, W - 16, 46, 10);

        const uiStyle = { fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fill: '#E8D5B0' };

        this.uiLevel = this.add.text(30, H - 38, `Niveau ${this.level}`, { ...uiStyle, fill: '#FFD700', fontSize: '18px' }).setDepth(26);
        this.uiBeers = this.add.text(300, H - 38, `🍺 0/${this.maxBeers}`, uiStyle).setDepth(26);
        this.uiTime = this.add.text(540, H - 38, `⏱ ${this.timeRemaining}s`, uiStyle).setDepth(26);
        this.uiDeliveries = this.add.text(780, H - 38, `📦 0/${this.deliveriesNeeded}`, uiStyle).setDepth(26);

        this.hintText = this.add.text(W / 2, H - 75, '', {
            fontSize: '15px', fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#FFD700', backgroundColor: '#1A120ACC', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setDepth(26).setAlpha(0);
    }

    updateUI() {
        this.uiBeers.setText(`🍺 ${this.beersCarried}/${this.maxBeers}`);
        this.uiTime.setText(`⏱ ${this.timeRemaining}s`);
        this.uiDeliveries.setText(`📦 ${this.totalDeliveries}/${this.deliveriesNeeded}`);
        if (this.timeRemaining <= 10) {
            this.uiTime.setFill('#FF4444');
            this.tweens.add({ targets: this.uiTime, alpha: 0.3, duration: 300, yoyo: true });
        }
    }

    update() {
        if (!this.gameActive || this.paused || this.cheatOpen) return;

        const speed = this.speedBoostActive ? this.playerSpeed * 1.5 : this.playerSpeed;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        // Touch D-pad input (from mobile.html)
        const ti = window.touchInput;
        if (ti) {
            if (ti.left) vx = -speed;
            else if (ti.right) vx = speed;
            if (ti.up) vy = -speed;
            else if (ti.down) vy = speed;
        }

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.player.body.setVelocity(vx, vy);
        if (vx < 0) this.player.setFlipX(true);
        else if (vx > 0) this.player.setFlipX(false);

        this.walkTimer += this.game.loop.delta;
        const playerMoving = (vx !== 0 || vy !== 0);
        if (this.walkTimer > 150) { this.walkTimer = 0; this.walkFrame = !this.walkFrame; }
        if (playerMoving) { this.player.setTexture(this.walkFrame ? 'player_w' : 'player'); }
        else { this.player.setTexture('player'); }
        this.drunks.getChildren().forEach(d => {
            if (d.isVomiting) return;
            const moving = Math.abs(d.body.velocity.x) > 5 || Math.abs(d.body.velocity.y) > 5;
            if (moving) { d.setTexture(this.walkFrame ? 'drunk_w' : 'drunk'); if (d.body.velocity.x < 0) d.setFlipX(true); else if (d.body.velocity.x > 0) d.setFlipX(false); }
            else { d.setTexture('drunk'); }
        });

        this.player.y = Phaser.Math.Clamp(this.player.y, 25, H - 65);
        this.player.x = Phaser.Math.Clamp(this.player.x, 25, W - 25);

        for (let i = 0; i < this.beerSprites.length; i++) {
            if (i < this.beersCarried) {
                this.beerSprites[i].setVisible(true);
                const side = (i % 2 === 0) ? -1 : 1;
                const stack = Math.floor(i / 2);
                const offsetX = side * 18;
                const offsetY = 2 - stack * 12;
                this.beerSprites[i].setPosition(this.player.x + offsetX, this.player.y + offsetY + Math.sin(this.time.now / 400 + i) * 1.5);
            } else { this.beerSprites[i].setVisible(false); }
        }

        if (this.shieldActive && this.shieldRing && this.shieldRing.active) {
            this.shieldRingAngle += 0.05;
            this.shieldRing.clear();
            for (let i = 0; i < 6; i++) {
                const a = this.shieldRingAngle + (i * Math.PI * 2 / 6);
                const rx = this.player.x + Math.cos(a) * 28;
                const ry = this.player.y + Math.sin(a) * 28;
                const size = 2.5 + Math.sin(this.shieldRingAngle * 3 + i) * 1;
                this.shieldRing.fillStyle(0xFFD700, 0.9);
                this.shieldRing.fillCircle(rx, ry, size);
                if (i % 2 === 0) { this.shieldRing.fillStyle(0xFFFFFF, 0.8); this.shieldRing.fillCircle(rx, ry, size * 0.5); }
            }
        }

        // Touch action "just pressed" detection
        const touchAction = ti && ti.action;
        const touchJustPressed = touchAction && !this._prevTouchAction;
        this._prevTouchAction = touchAction;
        const actionPressed = Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE')) || touchJustPressed;

        // Touch pause
        if (ti && ti.pause) { ti.pause = false; if (this.paused) this.resumeGame(); else this.pauseGame(); }

        // Bar interaction
        this.nearBarFlag = false;
        const barZoneBounds = this.barZone.getBounds();
        const playerBounds = this.player.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(barZoneBounds, playerBounds)) { this.nearBarFlag = true; }
        if (this.nearBarFlag && this.beersCarried < this.maxBeers) {
            this.showHint('🍺 pour prendre une bière');
            if (actionPressed) {
                this.beersCarried++; this.foamEmitter.emitParticleAt(this.player.x, this.player.y - 20);
                this.showMsg('🍺 Bière servie !'); PaddyMusic.sfxClink(); this.updateUI();
            }
        } else if (this.nearBarFlag && this.beersCarried >= this.maxBeers) { this.showHint('Plateau plein !'); }

        // Table interaction
        let nearAnyTable = false;
        this.tableData.forEach(table => {
            if (table.complete) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, table.x, table.y);
            if (dist < 65) {
                nearAnyTable = true;
                if (this.beersCarried > 0) { this.showHint('🍺 pour livrer');
                    if (actionPressed) { this.deliverBeer(table); }
                } else { this.showHint('Pas de bière ! Retourne au bar.'); }
            }
        });
        if (!nearAnyTable && !this.nearBarFlag) { this.hideHint(); }
    }

    deliverBeer(table) {
        table.beersDelivered++;
        this.beersCarried--;
        this.updateUI();
        this.updateTableIndicators(table);
        this.starEmitter.emitParticleAt(table.x, table.y - 30);
        this.showMsg('✅ Bière livrée !');
        PaddyMusic.sfxCheers();

        if (table.beersDelivered >= table.beersNeeded) {
            table.complete = true;
            this.totalDeliveries += table.beersNeeded;
            this.updateTableIndicators(table);
            // Flash table green
            let flashes = 0;
            const flashInterval = this.time.addEvent({
                delay: 200,
                callback: () => {
                    if (flashes % 2 === 0) table.sprite.setTint(COLORS.success);
                    else table.sprite.clearTint();
                    flashes++;
                    if (flashes >= 6) flashInterval.remove();
                },
                loop: true
            });
            this.showMsg(`🎉 Table ${table.id + 1} servie !`);
            PaddyMusic.sfxTableComplete();

            // Confetti "Sláinte!"
            const prostText = this.add.text(table.x, table.y - 40, 'Sláinte! 🍻', {
                fontSize: '22px', fontFamily: 'Arial, Helvetica, sans-serif',
                fontStyle: 'bold', fill: '#FFD700', stroke: '#1A120A', strokeThickness: 3
            }).setOrigin(0.5).setDepth(20);
            this.tweens.add({ targets: prostText, y: table.y - 100, alpha: 0, duration: 1200, ease: 'Cubic.easeOut', onComplete: () => prostText.destroy() });
            for (let ci = 0; ci < 12; ci++) {
                const colors = [0xFFD700, 0x169B62, 0xFF883E, 0xFFFFFF, 0x44FF44];
                const confetti = this.add.graphics().setDepth(19);
                confetti.fillStyle(colors[ci % colors.length]);
                confetti.fillRect(-2, -4, 4, 8);
                confetti.setPosition(table.x, table.y - 20);
                this.tweens.add({ targets: confetti, x: table.x + Phaser.Math.Between(-80, 80), y: table.y + Phaser.Math.Between(-90, 10), angle: Phaser.Math.Between(-360, 360), alpha: 0, duration: 800 + Math.random() * 400, ease: 'Cubic.easeOut', onComplete: () => confetti.destroy() });
            }
            this.updateUI();
            if (this.totalDeliveries >= this.deliveriesNeeded) { this.time.delayedCall(600, () => this.endGame(true)); }
        }
    }

    hitDrunk(player, drunk) {
        if (!this.invincible && this.beersCarried > 0) {
            if (this.shieldActive) {
                this.showMsg('🛡️ Bouclier ! Bière sauvée !');
                this.invincible = true;
                this.time.delayedCall(800, () => { this.invincible = false; });
                const angle = Phaser.Math.Angle.Between(drunk.x, drunk.y, player.x, player.y);
                player.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
                return;
            }
            this.beersCarried = Math.max(0, this.beersCarried - 1);
            this.updateUI();
            const hitX = (player.x + drunk.x) / 2;
            const hitY = (player.y + drunk.y) / 2;
            this.splashEmitter.emitParticleAt(hitX, hitY);
            this.shardEmitter.emitParticleAt(hitX, hitY);
            const puddle = this.add.image(hitX, hitY + 15, 'puddle').setScale(1).setAlpha(0.8).setDepth(0);
            this.tweens.add({ targets: puddle, alpha: 0, scaleX: 1.3, scaleY: 0.8, delay: 800, duration: 1200, onComplete: () => puddle.destroy() });
            this.showMsg('🍺💥 Bière renversée !');
            this.beersSpilled++;
            PaddyMusic.sfxGlassBreak();
            const angle = Phaser.Math.Angle.Between(drunk.x, drunk.y, player.x, player.y);
            player.body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
            this.invincible = true;
            this.tweens.add({ targets: player, alpha: 0.3, duration: 100, yoyo: true, repeat: 5, onComplete: () => { player.alpha = 1; this.invincible = false; } });
        }
    }

    grabShamrock(player, shamrock) {
        if (this.speedBoostActive || this.shieldActive) return;
        shamrock.destroy();
        this.starEmitter.emitParticleAt(player.x, player.y - 10);
        this.showMsg('☘️ Trèfle ! Vitesse x1.5 !');
        PaddyMusic.sfxPowerUp();
        this.bonusesUsed++;
        this.speedBoostActive = true;
        player.setTint(0x44DD55);
        this.time.delayedCall(8000, () => { this.speedBoostActive = false; player.clearTint(); });
        this.updateUI();
    }

    getValidSpawnPos() {
        const margin = 50;
        for (let attempt = 0; attempt < 20; attempt++) {
            const x = Phaser.Math.Between(80, W - 80);
            const y = Phaser.Math.Between(150, H - 100);
            let valid = true;
            this.tableData.forEach(t => {
                if (Math.abs(x - t.x) < margin && Math.abs(y - t.y) < margin) valid = false;
            });
            if (valid && this.walls) {
                this.walls.getChildren().forEach(w => {
                    const b = w.getBounds();
                    if (x > b.left - margin && x < b.right + margin &&
                        y > b.top - margin && y < b.bottom + margin) valid = false;
                });
            }
            if (valid) return { x, y };
        }
        return { x: Phaser.Math.Between(80, W - 80), y: Phaser.Math.Between(150, H - 100) };
    }

    spawnShamrock() {
        if (!this.gameActive) return;
        const { x, y } = this.getValidSpawnPos();
        const p = this.shamrocks.create(x, y, 'shamrock');
        p.setScale(1.5);
        this.tweens.add({ targets: p, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.time.delayedCall(8000, () => { if (p.active) { this.tweens.add({ targets: p, alpha: 0, duration: 500, onComplete: () => p.destroy() }); } });
    }

    grabLeprechaun(player, leprechaun) {
        if (this.shieldActive || this.speedBoostActive) return;
        leprechaun.destroy();
        this.starEmitter.emitParticleAt(player.x, player.y - 10);
        this.showMsg('🧙 Leprechaun ! Bouclier activé !');
        PaddyMusic.sfxPowerUp();
        this.bonusesUsed++;
        this.shieldActive = true;
        player.setTint(0xFFD700);
        this.shieldRing = this.add.graphics().setDepth(12);
        this.shieldRingAngle = 0;
        this.shieldGlow = this.add.graphics().setDepth(9);
        this.shieldGlowTween = this.tweens.add({
            targets: { val: 0.3 }, val: 0.6, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
                if (!this.shieldGlow || !this.shieldGlow.active) return;
                this.shieldGlow.clear();
                this.shieldGlow.fillStyle(0xFFD700, tween.getValue());
                this.shieldGlow.fillCircle(player.x, player.y, 32);
            }
        });
        this.time.delayedCall(10000, () => {
            this.shieldActive = false; player.clearTint();
            if (this.shieldRing) { this.shieldRing.destroy(); this.shieldRing = null; }
            if (this.shieldGlow) { this.shieldGlow.destroy(); this.shieldGlow = null; }
            if (this.shieldGlowTween) this.shieldGlowTween.stop();
        });
        this.updateUI();
    }

    spawnLeprechaun() {
        if (!this.gameActive) return;
        const { x, y } = this.getValidSpawnPos();
        const g = this.leprechauns.create(x, y, 'leprechaun');
        g.setScale(1.5);
        this.tweens.add({ targets: g, y: y - 10, scaleX: 1.6, scaleY: 1.6, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.time.delayedCall(8000, () => { if (g.active) { this.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: () => g.destroy() }); } });
    }

    spawnHarp() {
        if (!this.gameActive) return;
        const { x, y } = this.getValidSpawnPos();
        const a = this.harps.create(x, y, 'harp');
        a.setScale(1.4);
        this.tweens.add({ targets: a, scaleX: { from: 1.4, to: 1.6 }, scaleY: { from: 1.4, to: 1.2 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.time.delayedCall(8000, () => { if (a.active) { this.tweens.add({ targets: a, alpha: 0, duration: 500, onComplete: () => a.destroy() }); } });
    }

    grabHarp(player, harp) {
        harp.destroy();
        this.starEmitter.emitParticleAt(player.x, player.y - 10);
        this.showMsg('🎵 Harpe ! Ivrognes figés !');
        PaddyMusic.sfxPowerUp();
        this.bonusesUsed++;
        this.drunks.getChildren().forEach(d => {
            d.prevVx = d.body.velocity.x; d.prevVy = d.body.velocity.y;
            d.body.setVelocity(0, 0); d.body.moves = false; d.setTint(0x8888FF);
        });
        // Suspend vomit timer during freeze
        this.vomitFrozen = true;
        if (this.vomitTimer) this.vomitTimer.paused = true;

        this.time.delayedCall(10000, () => {
            this.drunks.getChildren().forEach(d => {
                if (!d.isVomiting) {
                    d.body.moves = true; d.clearTint();
                    if (d.prevVx !== undefined) { d.body.setVelocity(d.prevVx, d.prevVy); }
                }
            });
            // Resume vomit timer
            this.vomitFrozen = false;
            if (this.vomitTimer) this.vomitTimer.paused = false;
        });
    }

    scheduleNextVomit() {
        const delay = Phaser.Math.Between(12000, 16000);
        this.vomitTimer = this.time.delayedCall(delay, () => {
            if (!this.gameActive) return;
            this.triggerVomit();
            this.scheduleNextVomit();
        });
    }

    triggerVomit() {
        const drunks = this.drunks.getChildren().filter(d => d.active && d.body.moves && !d.isVomiting);
        if (drunks.length === 0) return;

        const d = Phaser.Utils.Array.GetRandom(drunks);

        // Save velocity and stop
        const savedVx = d.body.velocity.x;
        const savedVy = d.body.velocity.y;
        d.body.setVelocity(0, 0);
        d.body.moves = false;
        d.isVomiting = true;

        // Green face overlay (only on face, not whole sprite)
        const faceGreen = this.add.graphics().setDepth(11);
        faceGreen.fillStyle(0x88AA22, 0.6);
        faceGreen.fillCircle(0, 0, 8);
        faceGreen.setPosition(d.x, d.y - 14);
        d.vomitFace = faceGreen;

        // Vomit direction (in front of the drunk)
        const dir = savedVx >= 0 ? 1 : -1;
        const vomX = d.x + dir * 20;
        const vomY = d.y + 10;

        // Emit vomit particles in bursts using position offsets
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 400, () => {
                if (!d.active) return;
                // Update face overlay position
                if (d.vomitFace) d.vomitFace.setPosition(d.x, d.y - 14);
                for (let p = 0; p < 6; p++) {
                    this.vomitEmitter.emitParticleAt(
                        vomX + dir * Phaser.Math.Between(0, 15),
                        vomY + Phaser.Math.Between(-8, 8)
                    );
                }
                // Shake the drunk sprite
                this.tweens.add({
                    targets: d, x: d.x + Phaser.Math.Between(-3, 3),
                    duration: 80, yoyo: true
                });
            });
        }

        // Leave a puddle
        this.time.delayedCall(800, () => {
            if (!d.active) return;
            const puddle = this.add.image(vomX, vomY + 10, 'vomitpuddle').setScale(1).setAlpha(0.7).setDepth(0);
            this.tweens.add({
                targets: puddle, alpha: 0, scaleX: 1.2, scaleY: 0.7,
                delay: 3000, duration: 2000,
                onComplete: () => puddle.destroy()
            });
        });

        // Resume after ~2 seconds
        this.time.delayedCall(3000, () => {
            if (!d.active) return;
            d.isVomiting = false;
            if (d.vomitFace) { d.vomitFace.destroy(); d.vomitFace = null; }
            // If harp freeze is active, stay frozen
            if (this.vomitFrozen) {
                d.setTint(0x8888FF);
                return;
            }
            d.body.moves = true;
            d.body.setVelocity(savedVx, savedVy);
        });
    }

    showMsg(text) {
        this.msgText.setText(text); this.tweens.killTweensOf(this.msgText); this.msgText.setAlpha(1);
        this.tweens.add({ targets: this.msgText, alpha: 0, delay: 1200, duration: 400 });
    }
    showHint(text) { this.hintText.setText(text); this.hintText.setAlpha(1); }
    hideHint() { this.hintText.setAlpha(0); }

    showLevelAnnouncement() {
        const overlay = this.add.graphics().setDepth(50);
        overlay.fillStyle(0x000000, 0.6);
        overlay.fillRect(0, 0, W, H);
        const lvlText = this.add.text(W / 2, H / 2 - 30, `NIVEAU ${this.level}`, {
            fontSize: '56px', fontFamily: 'MedievalSharp, serif',
            fill: '#FFD700', stroke: '#1A3A00', strokeThickness: 6
        }).setOrigin(0.5).setDepth(51).setAlpha(0);
        const subText = this.add.text(W / 2, H / 2 + 30, `${this.deliveriesNeeded} bières à livrer !`, {
            fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0'
        }).setOrigin(0.5).setDepth(51).setAlpha(0);
        this.tweens.add({ targets: [lvlText, subText], alpha: 1, duration: 400, ease: 'Back.easeOut' });
        this.time.delayedCall(1800, () => {
            this.tweens.add({ targets: [overlay, lvlText, subText], alpha: 0, duration: 400, onComplete: () => { overlay.destroy(); lvlText.destroy(); subText.destroy(); } });
        });
    }

    endGame(won) {
        this.gameActive = false;
        this.player.body.setVelocity(0, 0);
        PaddyMusic.resetTempo();

        const overlay = this.add.graphics().setDepth(50);
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, W, H);

        if (won) {
            PaddyMusic.sfxVictory();
            this.add.text(W / 2, H / 2 - 80, '🎉 SLÁINTE! 🎉', {
                fontSize: '52px', fontFamily: 'MedievalSharp, serif',
                fill: '#FFD700', stroke: '#1A3A00', strokeThickness: 6
            }).setOrigin(0.5).setDepth(51);
            this.add.text(W / 2, H / 2 - 20, `Niveau ${this.level} terminé !`, {
                fontSize: '26px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0'
            }).setOrigin(0.5).setDepth(51);
            this.add.text(W / 2, H / 2 + 20, `⏱ Restant: ${this.timeRemaining}s  |  💥 Renversées: ${this.beersSpilled}  |  ✨ Bonus: ${this.bonusesUsed}`, {
                fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#FFD700'
            }).setOrigin(0.5).setDepth(51);

            for (let i = 0; i < 5; i++) {
                this.time.delayedCall(i * 200, () => { this.starEmitter.emitParticleAt(Phaser.Math.Between(200, 800), Phaser.Math.Between(150, 400)); });
            }

            // Save progression
            try {
                const saved = parseInt(localStorage.getItem('paddysRushMaxLevel')) || 1;
                if (this.level + 1 > saved) localStorage.setItem('paddysRushMaxLevel', Math.min(this.level + 1, 12));
            } catch(e) {}

            if (this.level < 12) {
                this.createEndButton(W / 2, H / 2 + 80, 'Niveau suivant ▶', () => { this.scene.start('GameScene', { level: this.level + 1 }); });
                this.time.delayedCall(500, () => { this.input.keyboard.once('keydown-SPACE', () => { this.scene.start('GameScene', { level: this.level + 1 }); }); });
            } else {
                this.add.text(W / 2, H / 2 + 70, '🏆 Tous les niveaux terminés ! 🏆', {
                    fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#FFD700'
                }).setOrigin(0.5).setDepth(51);
            }
            this.createEndButton(W / 2, H / 2 + (this.level < 12 ? 140 : 120), '🏠 Menu', () => { this.scene.start('MenuScene'); });
        } else {
            PaddyMusic.sfxGameOver();
            this.add.text(W / 2, H / 2 - 70, '⏰ TEMPS ÉCOULÉ !', {
                fontSize: '44px', fontFamily: 'MedievalSharp, serif',
                fill: '#FF6B6B', stroke: '#1A120A', strokeThickness: 6
            }).setOrigin(0.5).setDepth(51);
            this.add.text(W / 2, H / 2, `Livraisons: ${this.totalDeliveries}/${this.deliveriesNeeded}`, {
                fontSize: '22px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0'
            }).setOrigin(0.5).setDepth(51);
            this.add.text(W / 2, H / 2 + 35, `💥 Renversées: ${this.beersSpilled}  |  ✨ Bonus: ${this.bonusesUsed}`, {
                fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif', fill: '#E8D5B0'
            }).setOrigin(0.5).setDepth(51);
            this.createEndButton(W / 2, H / 2 + 90, '🔄 Réessayer', () => { this.scene.start('GameScene', { level: this.level }); });
            this.createEndButton(W / 2, H / 2 + 150, '🏠 Menu', () => { this.scene.start('MenuScene'); });
        }
    }

    createEndButton(x, y, label, callback) {
        const btnG = this.add.graphics().setDepth(51);
        const bw = 240, bh = 46;
        btnG.fillStyle(0x1B8A4B);
        btnG.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 23);
        const btnT = this.add.text(x, y, label, {
            fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fill: '#FFFFFF'
        }).setOrigin(0.5).setDepth(52);
        const zone = this.add.zone(x, y, bw, bh).setDepth(53).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { btnG.clear(); btnG.fillStyle(0x22AA5E); btnG.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 23); });
        zone.on('pointerout', () => { btnG.clear(); btnG.fillStyle(0x1B8A4B); btnG.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 23); });
        zone.on('pointerdown', () => { this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(300, callback); });
    }

}

// ═══════════════════════════════════════════
//  LAUNCH
// ═══════════════════════════════════════════
const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [BootScene, MenuScene, ControlsScene, LevelSelectScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#0A0805'
};

const game = new Phaser.Game(config);
