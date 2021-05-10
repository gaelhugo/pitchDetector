require("./src/css/main.scss");
const Utils = require("./src/js/Utils.js");
const UserInterface = require("./src/js/UserInterface.js");
const MidiViewer = require("./src/js/MidiViewer.js");
const AudioPlayer = require("./src/js/AudioPlayer.js");
const PitchDetection = require("./src/js/PitchDetection.js");
const Microphone = require("./src/js/Microphone");
class Main {
  constructor() {
    this.handlers = {
      keydown: this.onKeydown.bind(this),
      play: this.draw.bind(this),
      slide: this.onSlide.bind(this),
      modelReady: this.onModelReady.bind(this),
      end: this.onEnd.bind(this),
      resize: this.onResize.bind(this),
      micClick: this.onMicClick.bind(this),
    };
    this.pause = true;
    this.applicationStarted = false;
    this.init();
  }

  async init() {
    this.settings = await Utils.loadJson("./src/json/settings.json");
    this.notes = await Utils.loadJson("./src/json/keyFrequencies.json");
    // --- UI
    this.userInterface = new UserInterface(
      "#interface",
      this.settings.UIParameters
    );
    // --- UI MICROPHONE
    this.mic = new Microphone("#microphone");
    // --- MUSIC VIEWER
    this.viewer = new MidiViewer("#viewer", this.settings.viewerParameters);
    // --- AUDIO PLAYER
    this.audioPlayer = new AudioPlayer(
      this.settings.audioParameters,
      this.notes
    );
    await this.audioPlayer.initMidiPlayer();
    this.viewer.setSoundtrack(this.audioPlayer.soundtrack, this.notes);
    this.audioPlayer.ticker = this.viewer.ticker;
    // --- PITCH
    this.detector = new PitchDetection(
      this.settings.pitchDetectorParameters,
      this.notes,
      this.audioPlayer.detune
    );

    this.initListeners();
  }

  initListeners() {
    // --- GENERAL INTERACTION
    window.addEventListener("resize", this.handlers.resize);
    document.addEventListener("keydown", this.handlers.keydown);
    //
    this.userInterface.addEventListener("slide", this.handlers.slide);
    this.mic.addEventListener("click", this.handlers.micClick);
    this.audioPlayer.addEventListener("play", this.handlers.play);
    this.audioPlayer.addEventListener("end", this.handlers.end);
    this.detector.addEventListener("modelReady", this.handlers.modelReady);
    // add text to the interface...
    this.updateText("PRESS SPACE BAR TO START");
  }

  onSlide(e) {
    switch (e.name) {
      case "voice_detune":
        this.detector.voiceDetune = parseFloat(e.value);
        break;
      case "track_detune":
        this.audioPlayer.detune = parseFloat(e.value);
        this.detector.detune = parseFloat(e.value);
        break;
      case "volume":
        this.audioPlayer.volPercentage = parseFloat(e.value);
        break;
      case "tempo":
        this.audioPlayer.tempo = parseFloat(e.value);
        break;
      case "accuracy":
        this.viewer.accuracy = parseFloat(e.value);
        break;
    }
  }

  onKeydown(e) {
    if (e.code == "Space") {
      if (!this.applicationStarted) {
        this.updateText("TRY TO HUM THAT");
        this.viewer.draw({ tick: 0 });
        this.detector.preload();
      } else {
        this.mic.toggle();
        this.toggle();
      }
    }
  }
  onMicClick(e) {
    this.toggle();
  }

  onModelReady(e) {
    this.detector.play();
    this.mic.activate();
    setTimeout(() => {
      this.startApplication();
    }, 3000);
  }

  onEnd() {
    this.detector.pause();
  }

  onResize(e) {
    this.viewer.resize();
  }

  startApplication() {
    this.updateText("");
    this.mic.toggle();
    this.applicationStarted = true;
    this.audioPlayer.play(0);
    this.pause = false;
  }

  draw(e) {
    this.viewer.pitch = this.detector.pitch;
    this.viewer.validator.check(e.tick, this.audioPlayer.activeNotes);
    this.viewer.draw(e);
  }

  toggle() {
    if (this.pause) {
      this.audioPlayer.play();
      this.detector.play();
      this.pause = false;
    } else {
      this.audioPlayer.pause();
      this.detector.pause();
      this.pause = true;
    }
    this.mic.button.blur();
  }

  updateText(text) {
    this.viewer.viewer.setAttribute("data-text", text);
  }
}

window.onload = () => {
  new Main();
};
