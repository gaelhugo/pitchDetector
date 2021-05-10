const EventEmitter = require("./EventEmitter.js");

class Slider extends EventEmitter {
  constructor(param) {
    super();
    this.dom = document.createElement("section");
    const label = document.createElement("label");
    label.textContent = param.name;
    label.for = param.name.replace(" ", "_");
    const input = document.createElement("input");
    input.type = "range";
    input.min = param.min;
    input.max = param.max;
    input.step = param.step;
    input.value = param.value;
    input.name = param.name.replace(" ", "_");
    this.dom.appendChild(label);
    this.dom.appendChild(input);

    this.handler = {
      change: this.onChange.bind(this),
    };
    input.addEventListener("input", this.handler.change);
  }
  onChange(e) {
    this.raiseEvent("input", [
      {
        name: e.target.name,
        value: parseFloat(e.target.value),
      },
    ]);
  }
}

module.exports = Slider;
