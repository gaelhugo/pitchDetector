const Tone = require("tone");
const MidiPlayer = require("midi-player-js/build");
const Utils = require("./Utils.js");
const EventEmitter = require("./EventEmitter.js");
/**
 *  REMOTE FILES TO MOVE AS STATIC : https://tonejs.github.io/audio/salamander/
 */
class AudioPlayer extends EventEmitter {
  constructor(parameters, notes) {
    super();
    this.notes = notes;
    this.activeNotes = {};
    this.detune = parameters.detune;
    this.volPercentage = parameters.volumPercentage;
    this.vol = parameters.volume;
    this.midiFile = parameters.midiFile;
    this.initSampler();
    // this.initMidiPlayer(parameters);
  }

  get soundtrack() {
    return { tracks: this.Player.tracks, totalTicks: this.Player.totalTicks };
  }

  set ticker(ticker) {
    this._ticker = ticker;
  }

  set tempo(tempo) {
    this.Player.setTempo(tempo);
  }

  initSampler() {
    // INIT TONEJS
    this.sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      // baseUrl: "./samples/guitar-nylon/",
    }).toDestination();
  }

  initMidiPlayer() {
    return new Promise(async (resolve, reject) => {
      // MIDI PLAYER
      this.Player = new MidiPlayer.Player((event) => {});
      this.Player.on("midiEvent", (e) => {
        this.playSound(e);
      });
      this.Player.on("playing", (currentTick) => {
        this.raiseEvent("play", [currentTick]);
      });
      this.Player.on("fileLoaded", (e) => {
        resolve();
      });
      this.Player.on("endOfFile", (e) => {});
      const buffer = await Utils.loadBuffer(this.midiFile);
      this.Player.loadArrayBuffer(buffer);
    });
  }

  play() {
    this.Player.play();
  }

  pause() {
    this.Player.pause();
  }

  playSound(e) {
    const freq = Utils.noteToFreq(e.noteNumber);
    const id = this.notes.frequencies.indexOf(parseFloat(freq.toFixed(2)));
    if (freq && e.name == "Note on") {
      if (this.notes.keys[id])
        this.sampler.triggerAttack(
          this.notes.keys[id + this.detune],
          Tone.now(),
          e.track == 2 ? this.volPercentage : this.vol * this.volPercentage
        );
      if (e.track == 2) {
        this.activeNotes[this.notes.keys[id]] = {
          freq: this.notes.frequencies[id],
          start: e.tick * this._ticker,
          mainTrack: e.mainTrack,
          width: e.width,
        };
      }
    } else if (e.name == "Note off") {
      const now = Tone.now();
      this.sampler.triggerRelease(this.notes.keys[id + this.detune], now + 1);
      if (this.activeNotes.hasOwnProperty(this.notes.keys[id])) {
        delete this.activeNotes[this.notes.keys[id]];
      }
    }
  }
}

module.exports = AudioPlayer;
