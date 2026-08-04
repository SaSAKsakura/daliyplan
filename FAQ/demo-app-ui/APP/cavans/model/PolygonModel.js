function PolygonModel(config) {
  CommonModel.call(this, config);
  this.fillColor = config.fillColor;
  this.strokeColor = config.strokeColor;
  this.strokeWidth = config.strokeWidth;
  this.data = config.data;
  this.isShowDot = config.isShowDot;
  this.dotColor = config.dotColor;
  this.dotSize = config.dotSize;
}
inherit(PolygonModel, CommonModel);

PolygonModel.prototype.draw = function (ctx, osCtx) {
  let _this = this;
  let { data, strokeColor, strokeWidth, fillColor } = this;
  const [r, g, b, a] = idToRgba(_this.id);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.fillStyle = fillColor;

  osCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  osCtx.lineWidth = strokeWidth;
  osCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

  ctx.beginPath();
  osCtx.beginPath();

  //防止foreach方法中的函数的this指向发生改变，这里直接将this再带进去
  data.forEach(function (item, index) {
    let canvasX = item.x;
    let canvasY = item.y;
    if (index === 0) {
      ctx.moveTo(canvasX, canvasY);
      osCtx.moveTo(canvasX, canvasY);
    } else {
      ctx.lineTo(canvasX, canvasY);
      osCtx.lineTo(canvasX, canvasY);
    }
  });

  ctx.closePath();
  ctx.stroke();
  osCtx.closePath();
  osCtx.stroke();

  if (_this.fillColor) {
    ctx.fill();
    osCtx.fill();
  }

  data.forEach(function (item, index) {
    let canvasX = item.x;
    let canvasY = item.y;
    ctx.beginPath();
    ctx.fillStyle = _this.dotColor;
    ctx.strokeStyle = _this.dotColor;
    ctx.lineWidth = 0;
    ctx.arc(canvasX, canvasY, _this.dotSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    osCtx.beginPath();
    osCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    osCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    osCtx.lineWidth = 0;
    osCtx.arc(canvasX, canvasY, _this.dotSize, 0, Math.PI * 2);
    osCtx.fill();
    osCtx.stroke();
  });
};
