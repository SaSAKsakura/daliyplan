 function idToRgba(id) {
  return id.split("-");
}

function rgbaToId(rgba) {
  return rgba.join("-");
}

const idPool = {};

function createId(){
  let id = createOnceId();
  while (idPool[id]) {
    id = createOnceId();
  }
  return id;
}

function createOnceId(){
  return Array(3)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 255))
    .concat(255)
    .join("-");
}

function getRad(degree){
  return degree/180*Math.PI;
}

// function drawText(ctx,text,x,y){
//   ctx.save();
//   ctx.translate(x,y)
//   ctx.rotate(getRad(180))
//   ctx.scale(-1,1)
//   ctx.fillText(text,0,0);
//   ctx.restore();
// }
