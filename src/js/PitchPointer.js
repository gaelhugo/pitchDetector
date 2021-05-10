class PitchPointer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  update(x, y) {
    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.arc(x, y, 10, 0, Math.PI * 2, false);
    this.ctx.fill();
    this.ctx.closePath();
  }
}

module.exports = PitchPointer;
