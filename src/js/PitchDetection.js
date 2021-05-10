const EventEmitter = require("./EventEmitter.js");
const Utils = require("./Utils.js");
class PitchDetection extends EventEmitter {
  constructor(parameters, notes, detune) {
    super();
    this.voiceDetune = parameters.voiceDetune;
    this.detune = detune;
    this.notes = notes;
    this.KILL = false;
    this.ML5_Frequency = 0;
    // this.preload();
  }
  async preload() {
    this.audioCtx = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    this.initPitchDetection(this.stream, this.audioCtx);
  }

  get pitch() {
    return this.ML5_Frequency;
  }

  initPitchDetection(stream, ctx) {
    this.pitchDetection = ml5.pitchDetection(
      "./src/model",
      ctx,
      stream,
      this.modelLoaded.bind(this)
    );
  }

  modelLoaded() {
    this.raiseEvent("modelReady", []);
  }

  getPitch() {
    this.pitchDetection.getPitch((err, frequency) => {
      if (frequency) {
        const index = this.notes.frequencies.indexOf(
          Utils.getClosestFreq(this.notes.frequencies, frequency)
        );
        this.ML5_Frequency = this.notes.frequencies[
          index + this.voiceDetune - this.detune
        ];
      } else {
        this.ML5_Frequency = null;
      }
      if (!this.KILL) this.getPitch();
    });
  }

  play() {
    this.KILL = false;
    this.getPitch();
  }

  pause() {
    this.KILL = true;
  }
}

module.exports = PitchDetection;
