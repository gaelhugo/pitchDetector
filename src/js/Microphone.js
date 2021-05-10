const EventEmitter = require("./EventEmitter.js");

require("../css/microphone.scss");
class Microphone extends EventEmitter {
  constructor(containerId) {
    super();
    this.handler = {
      click: this.onClick.bind(this),
    };
    this.mic = document.querySelector(containerId);
    this.button = this.mic.querySelector(".button");
    this.button.addEventListener("click", this.handler.click);
  }

  onClick(e) {
    this.toggle();
    this.raiseEvent("click", [e]);
  }

  activate() {
    this.button.classList.remove("disabled");
  }

  toggle() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.button.classList.add("button--active");
    } else {
      this.isRecording = false;
      this.button.classList.remove("button--active");
    }
  }
}

module.exports = Microphone;
