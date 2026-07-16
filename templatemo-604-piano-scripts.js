// ===== FLUTE AUDIO ENGINE =====
class FluteAudio {
   constructor() {
      this.audioCtx = null;
      this.masterGain = null;
      this.volume = 0.7;
   }

   init() {
      if (this.audioCtx) return;

      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.volume * 0.5;
      this.masterGain.connect(this.audioCtx.destination);
   }

   setVolume(value) {
      this.volume = value;
      if (this.masterGain) {
         this.masterGain.gain.value = value * 0.5;
      }
   }

   noteToFreq(note) {
      const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

      const noteName = note.slice(0,-1);
      const octave = parseInt(note.slice(-1));

      const semitone = notes.indexOf(noteName);
      const midi = (octave + 1) * 12 + semitone;

      return 440 * Math.pow(2, (midi - 69) / 12);
   }

   playNote(note, duration = 0.8) {
      this.init();

      const freq = this.noteToFreq(note);
      const now = this.audioCtx.currentTime;

      // Main Oscillator
      const osc = this.audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      // Soft harmonic
      const harmonic = this.audioCtx.createOscillator();
      harmonic.type = "triangle";
      harmonic.frequency.value = freq * 2;

      // Vibrato
      const vibrato = this.audioCtx.createOscillator();
      vibrato.type = "sine";
      vibrato.frequency.value = 5;

      const vibratoGain = this.audioCtx.createGain();
      vibratoGain.gain.value = 4;

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      const gain = this.audioCtx.createGain();

      osc.connect(gain);

      const harmonicGain = this.audioCtx.createGain();
      harmonicGain.gain.value = 0.08;

      harmonic.connect(harmonicGain);
      harmonicGain.connect(gain);

      gain.connect(this.masterGain);

      // Smooth flute envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.15);
      gain.gain.setValueAtTime(0.6, now + duration * 0.8);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.start(now);
      harmonic.start(now);
      vibrato.start(now);

      osc.stop(now + duration + 0.1);
      harmonic.stop(now + duration + 0.1);
      vibrato.stop(now + duration + 0.1);
   }
}
