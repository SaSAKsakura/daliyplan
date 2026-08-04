
function Rect(config) {
  CommonModel.call(this,config)
  this.fillColor = config.fillColor || '#fff';
  this.strokeColor = config.strokeColor || '#000';
  this.strokeWidth = config.strokeWidth || 1;
}

 Rect.prototype.draw=function(ctx, osCtx) {
    const { x, y, width, height, strokeColor, strokeWidth, fillColor } = thiss
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = fillColor;
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const [r, g, b, a] = idToRgba(this.id);

    osCtx.save();
    osCtx.beginPath();
    osCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    osCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    osCtx.rect(x, y, width, height);
    osCtx.fill();
    osCtx.stroke();
    osCtx.restore();
  }

