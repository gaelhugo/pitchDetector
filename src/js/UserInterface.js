require("../css/style.scss");
const EventEmitter = require("./EventEmitter.js");
const Slider = require("./Slider");
class UserInterface extends EventEmitter {
  constructor(containerID, parameters) {
    super();
    this.interface = document.querySelector(containerID);
    this.handlers = {
      sliderChange: this.onSliderChange.bind(this),
    };
    this.buildSliders(parameters.sliders);
  }
  buildSliders(sliders) {
    sliders.forEach((sliderParameter, index) => {
      const slider = new Slider(sliderParameter);
      this.interface.appendChild(slider.dom);
      slider.addEventListener("input", this.handlers.sliderChange);
    });
  }
  onSliderChange(e) {
    this.raiseEvent("slide", [e]);
  }
}

module.exports = UserInterface;
