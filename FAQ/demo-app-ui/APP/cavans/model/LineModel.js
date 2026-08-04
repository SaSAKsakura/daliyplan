
//创建构造函数
function LineModel(config) {
  CommonModel.call(this, config);
  this.strokeColor = config.strokeColor || "#000";
  this.strokeWidth = config.strokeWidth || 1;
  this.data = config.data;
}
inherit(LineModel, CommonModel);
//4.绘制点
LineModel.prototype.draw = function (ctx, osCtx) {
    let _this=this;
    let {data,strokeColor,strokeWidth,fillColor}=this
    ctx.beginPath();
      osCtx.beginPath();
      const [r, g, b, a] = idToRgba(_this.id);
      ctx.strokeStyle=strokeColor;
      ctx.lineWidth=strokeWidth;
      ctx.fillStyle = fillColor

      osCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      osCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      osCtx.lineWidth=strokeWidth
     
    //防止foreach方法中的函数的this指向发生改变，这里直接将this再带进去
    data.forEach(function (item,index) {
        let canvasX=item.x;
        let canvasY=item.y;
        if(index===0){
           ctx.moveTo(canvasX,canvasY);
           osCtx.moveTo(canvasX,canvasY);
        }else {
           ctx.lineTo(canvasX,canvasY);
           osCtx.lineTo(canvasX,canvasY);
        }
       
    });
    ctx.stroke();
    osCtx.stroke();
  
};
