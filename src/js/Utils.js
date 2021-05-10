class Utils {
  static lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  static absDiff(val1, val2) {
    return Math.abs(val2 - val1);
  }

  static map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  static loadJson(url) {
    return fetch(url)
      .then((data) => data.json())
      .then((json) => json);
  }

  static loadBuffer(url) {
    return fetch(url)
      .then((data) => data.blob())
      .then((blob) => blob.arrayBuffer())
      .then((buffer) => buffer);
  }

  static getClosestFreq(array, freq) {
    return array.reduce((a, b) => {
      return Math.abs(b - freq) < Math.abs(a - freq) ? b : a;
    });
  }

  static noteToFreq(note) {
    let a = 440; //frequency of A (coomon value is 440Hz)
    return (a / 32) * 2 ** ((note - 9) / 12);
  }

  static hsl_col_perc(percent, start, end) {
    /*
    Quick ref:
        0 – red
        60 – yellow
        120 – green
        180 – turquoise
        240 – blue
        300 – pink
        360 – red
    */
    const a = percent / 100;
    const b = (end - start) * a;
    let c = b + start;
    return "hsl(" + c + ", 100%, 50%)";
  }
}

module.exports = Utils;
