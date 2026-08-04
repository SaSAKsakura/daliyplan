function SceneContainer(canvas) {
  const dpr = window.devicePixelRatio;
  canvas.width = parseInt(canvas.style.width) * dpr;
  canvas.height = parseInt(canvas.style.height) * dpr;
  this.canvas = canvas;
  this.osCanvas = new OffscreenCanvas(canvas.width, canvas.height);
  this.ctx = this.canvas.getContext("2d");
  this.osCtx = this.osCanvas.getContext("2d");
  //ctx 和osCtx 的步骤一定要一致
  this.ctx.scale(1, -1);
  this.ctx.translate(0, -canvas.height);
  this.osCtx.scale(1, -1);
  this.osCtx.translate(0, -canvas.height);

  this.dpr = dpr;
  this.canvas.addEventListener(
    "mousedown",
    this.handleCreator(ActionType.Down)
  );
  this.canvas.addEventListener("mouseup", this.handleCreator(ActionType.Up));
  this.canvas.addEventListener(
    "mousemove",
    this.handleCreator(ActionType.Move)
  );
  this.shapes = {};
  this.eventSimulator = new EventSimulator();
}

SceneContainer.prototype.add = function (shape) {
  const id = shape.getId();
  this.eventSimulator.addListeners(id, shape.getListeners());
  this.shapes[id] = "";
  shape.draw(this.ctx, this.osCtx);
};

SceneContainer.prototype.AddModels = function (models) {};
SceneContainer.prototype.handleCreator = function (type) {
  return (evt, item) => {
    const x = evt.offsetX;
    const y = evt.offsetY;
    const id = this.hitJudge(x, y);
    this.eventSimulator.addAction({ type, id }, evt);
  };
};

SceneContainer.prototype.hitJudge = function (x, y) {
  var rgba = Array.from(
    this.osCtx.getImageData(x * this.dpr, y * this.dpr, 1, 1).data
  );
  var id = rgbaToId(rgba);
  return this.shapes.hasOwnProperty(id) ? id : "";
};

SceneContainer.prototype.AddModel = function (models, stage) {
  let _this = this;
  let bingModelEvent = (modelInstance, modelConfig) => {
    if (modelConfig.hasOwnProperty("actions")) {
      if (modelConfig.actions && modelConfig.actions.hasOwnProperty("click")) {
        let tempFun = modelConfig.actions.click;
        modelInstance.onEvent(EventNames.click, tempFun.bind(modelInstance));
      }
    }
  };
  models.forEach((model) => {
    if (model.modelCode == "LineModel") {
      let line = new LineModel(model);
      bingModelEvent(line, model);
      stage.add(line);
      model.data.forEach((item) => {
        if (item.radius) {
          let circle = new CircleModel(item);
          bingModelEvent(circle, item);
          stage.add(circle);
        }
      });
    }
    if (model.modelCode == "PolygonModel") {
      let polygon = new PolygonModel(model);
      bingModelEvent(polygon, model);
      stage.add(polygon);
    }
  });
};
