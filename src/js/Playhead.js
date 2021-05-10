class Playhead {
  constructor(ctx, ticker, height) {
    this.ctx = ctx;
    this.ticker = ticker;
    this.height = height;
  }

  update(tick, offsetX) {
    this.x = offsetX + 0 + tick * this.ticker;
    this.ctx.fillStyle = `rgba(200 ,200,180,0.5`;
    this.ctx.fillRect(offsetX, 0, tick * this.ticker + 0, this.height);
    this.ctx.fillStyle = `rgba(255,255,255,0.2)`;
    this.ctx.fillRect(this.x - 3, 0, 7, this.height);
    this.ctx.fillStyle = `rgba(255,255,255,1)`;
    this.ctx.fillRect(this.x, 0, 1, this.height);
  }
}

module.exports = Playhead;
