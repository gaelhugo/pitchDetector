require("../css/viewer.scss");
const Playhead = require("./Playhead.js");
const PitchPointer = require("./PitchPointer.js");
const Utils = require("./Utils.js");
const FrequencyMatcher = require("./FrequencyMatcher.js");
class MidiViewer {
  constructor(containerId, parameters) {
    this.zoom = parameters.zoom;
    this.height = parameters.canvasHeight;
    this.ratio = parameters.ratio;
    this.scroll = parameters.scroll;
    this.accuracy = parameters.accuracy; /* 1 - 99 , 99 is super hard*/
    this.offsetX = 0;
    this.pitch = 0;
    this.viewer = document.querySelector(containerId);
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth - 20;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.viewer.appendChild(this.canvas);
  }

  resize() {
    this.canvas.width = window.innerWidth - 20;
  }

  setSoundtrack(_tracks, notes) {
    const tracks = _tracks.tracks;
    this.singleNotes = [];
    this.noteDictionary = {};
    this.byteDictionary = {};
    this.ticker = ((window.innerWidth - 20) / _tracks.totalTicks) * this.zoom;
    this.playhead = new Playhead(this.ctx, this.ticker, this.height);
    this.pointer = new PitchPointer(this.ctx);
    this.validator = new FrequencyMatcher(this);
    //ADD ALL TRACKS Notes
    tracks.forEach((item, index) => {
      item.events.forEach((it, id) => {
        if (it.name == "Note on") {
          const _index = notes.keys.indexOf(it.noteName);
          const freq = notes.frequencies[_index];
          this.noteDictionary[it.noteName] = {
            x: 10 + this.ticker * it.tick,
            y: this.height - freq / this.ratio,
            track: it.track,
            mainTrack: false,
            byteIndex: it.byteIndex,
          };

          it.mainTrack = false;
          it.x = 10 + this.ticker * it.tick;
          it.y = this.height - freq / this.ratio;
        }
        if (
          this.noteDictionary.hasOwnProperty(it.noteName) &&
          it.name == "Note off"
        ) {
          this.noteDictionary[it.noteName].width =
            10 + this.ticker * it.tick - this.noteDictionary[it.noteName].x;
          this.byteDictionary[this.noteDictionary[it.noteName].byteIndex] =
            10 + this.ticker * it.tick - this.noteDictionary[it.noteName].x;
          this.singleNotes.push(this.noteDictionary[it.noteName]);
        }
      });
    });
    // Filter High Track From Track 2 (Melody)
    this.singleNotes.forEach((item, index) => {
      let canBeAdded = true;
      this.singleNotes.forEach((it, id) => {
        if (index != id && item.track == 2 && it.track == 2) {
          if (Utils.absDiff(it.x, item.x) < 1) {
            if (it.y < item.y) {
              canBeAdded = false;
            }
          }
        }
      });
      if (canBeAdded && item.track == 2) {
        item.mainTrack = true;
      }
    });
    // Add Main Track to The midi events (only track2)
    tracks[1].events.forEach((item, index) => {
      let canBeAdded = true;
      tracks[1].events.forEach((it, id) => {
        if (index != id && item.track == 2 && it.track == 2) {
          if (Utils.absDiff(it.x, item.x) < 1) {
            if (it.y < item.y) {
              canBeAdded = false;
            }
          }
        }
      });
      if (canBeAdded && item.track == 2) {
        item.mainTrack = true;
        if (item.name == "Note on") {
          item.width = this.byteDictionary[item.byteIndex];
        }
      }
    });
  }

  draw(e) {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.singleNotes.forEach((item, index) => {
      if (item.mainTrack) {
        this.ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      } else {
        this.ctx.fillStyle = `rgba(128,107,${(item.track - 1) * 84},1)`;
      }
      this.ctx.fillRect(
        item.x + this.offsetX,
        item.y,
        item.width ? item.width : 2,
        20
      );
    });

    //
    this.playhead.update(e.tick, this.offsetX);
    //
    this.validator.update();
    //
    const x = this.offsetX + e.tick * this.ticker;
    const y = this.height - this.pitch / this.ratio + 10;
    this.pointer.update(x, y);

    if (this.scroll) {
      if (0 + e.tick * this.ticker + this.offsetX >= window.innerWidth / 2) {
        this.offsetX--;
      }
    } else {
      if (0 + e.tick * this.ticker + this.offsetX >= window.innerWidth - 10) {
        this.offsetX -= window.innerWidth;
      }
    }
  }
}

module.exports = MidiViewer;
