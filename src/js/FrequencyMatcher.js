const Utils = require("./Utils.js");
class FrequencyMatcher {
  constructor(scope) {
    this.scope = scope;
    this.GOAL = [];
    this.percentageChecker = {};
    this.SCORE = [];
    // DEBUG
    this.debug = document.querySelector("#score");
  }

  check(tick, notes) {
    const keys = Object.keys(notes);
    keys.forEach((key) => {
      if (
        notes[key].start &&
        notes[key].freq == this.scope.pitch &&
        notes[key].mainTrack
      ) {
        // COLOR HANDLER
        const property = key + "_" + notes[key].start;
        if (!this.percentageChecker.hasOwnProperty(property)) {
          this.percentageChecker[property] = {
            percent: this.scope.ticker,
            width: notes[key].width,
          };
        } else {
          this.percentageChecker[property].percent += this.scope.ticker;
        }

        if (this.scope.scroll) {
          this.GOAL.push({
            x: notes[key].start + 10,
            y: this.scope.height - this.scope.pitch / this.scope.ratio,
            width:
              notes[key]
                .width /*0 + tick * this.scope.ticker - (notes[key].start + 0)*/,
            height: 20,
            zone: this.scope.offsetX,
            property: property,
          });
        } else {
          this.GOAL.push({
            x: notes[key].start + this.scope.offsetX + 10,
            y: this.scope.height - this.scope.pitch / this.scope.ratio,
            width:
              /*0 +
              tick * this.scope.ticker +
              this.scope.offsetX -
              (notes[key].start + this.scope.offsetX + 0)*/ notes[
                key
              ].width,
            height: 20,
            zone: this.scope.offsetX,
            property: property,
          });
        }
      }
    });
  }

  update() {
    // this.scope.ctx.fillStyle = "rgba(30,180,30,0.01)";
    this.GOAL.forEach((item) => {
      if (this.scope.scroll) {
        if (item.x + this.scope.offsetX + item.width > 0) {
          const percent = Math.min(
            (this.percentageChecker[item.property].percent /
              (item.width - ((100 - this.scope.accuracy) / 100) * item.width)) *
              100,
            100
          );
          this.scope.ctx.fillStyle = Utils.hsl_col_perc(percent, 0, 120);
          this.scope.ctx.fillRect(
            item.x + this.scope.offsetX,
            item.y,
            item.width,
            item.height
          );
        } else {
          delete this.percentageChecker[item.property];
        }
        if (
          this.percentageChecker[item.property] &&
          !this.percentageChecker[item.property].scored &&
          item.x + this.scope.offsetX + item.width < this.scope.playhead.x
        ) {
          this.SCORE.push(this.percentageChecker[item.property]);
          this.percentageChecker[item.property].scored = true;
        }
      } else {
        if (
          this.percentageChecker[item.property] &&
          item.zone == this.scope.offsetX
        ) {
          const percent = Math.min(
            (this.percentageChecker[item.property].percent /
              (item.width - ((100 - this.scope.accuracy) / 100) * item.width)) *
              100,
            100
          );
          this.scope.ctx.fillStyle = Utils.hsl_col_perc(percent, 0, 120);
          this.scope.ctx.fillRect(item.x, item.y, item.width, item.height);
        } else {
          delete this.percentageChecker[item.property];
        }
        // detect when to add score....
        if (
          this.percentageChecker[item.property] &&
          !this.percentageChecker[item.property].scored &&
          item.x + item.width < this.scope.playhead.x
        ) {
          this.SCORE.push(this.percentageChecker[item.property]);
          this.percentageChecker[item.property].scored = true;
        }
      }
    });

    const total = this.SCORE.reduce(
      (accumulator, currentValue) =>
        accumulator +
        Math.min(
          (currentValue.percent /
            (currentValue.width -
              ((100 - this.scope.accuracy) / 100) * currentValue.width)) *
            100,
          100
        ),
      0
    );
    // this.debug.innerHTML = this.SCORE.length;
    if (this.SCORE.length > 0)
      this.debug.innerHTML = (total / this.SCORE.length).toFixed(2) + "%";
  }
}

module.exports = FrequencyMatcher;
