function CircleModel(config) {
  CommonModel.call(this, config);
  this.fillColor = config.fillColor || "#fff";
  this.strokeColor = config.strokeColor || "#000";
  this.strokeWidth = config.strokeWidth || 1;
  this.x = config.x;
  this.y = config.y;
  this.radius = config.radius;
  this.text = config.text;
  this.font=config.font
}

inherit(CircleModel, CommonModel);

CircleModel.prototype.draw = function (ctx, osCtx) {
  const { x, y, radius, strokeColor, strokeWidth, fillColor } = this;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.stroke();
  ctx.restore();

  if (this.text) {
    this.rotateText(ctx, osCtx,this.text, x - radius-5, y + radius+5,this.font);
   
  }

  const [r, g, b, a] = idToRgba(this.id);
  osCtx.save();
  osCtx.beginPath();
  osCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  osCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  osCtx.lineWidth = strokeWidth;
  osCtx.arc(x, y, radius, 0, Math.PI * 2);

  osCtx.fill();
  osCtx.stroke();
  osCtx.restore();
};

CircleModel.prototype.rotateText = function (ctx,osCtx,text, x, y,font) {
  ctx.save();
  ctx.font =font||"25px Microsoft Yahei,sans-serif";
  ctx.translate(x,y)
  ctx.rotate(getRad(180))
  ctx.scale(-1,1)
  ctx.fillText(text, 0,0);
  ctx.restore();


  osCtx.save();
  osCtx.font =font||"25px Microsoft Yahei,sans-serif"
  osCtx.translate(x,y)
  osCtx.rotate(getRad(180))
  osCtx.scale(-1,1)
  osCtx.fillText(text, 0,0);
  osCtx.restore();

  
};
