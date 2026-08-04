
function inherit(son,parent){
  var clone = Object.create(parent.prototype);  //共享父类方法
  son.prototype = clone;  
  clone.constructor = son;
}

function CommonModel(modelConfig) {
  this.modelCode = modelConfig.modelCode;
  this.modelGuid = modelConfig.modelGuid;
  this.modelId = modelConfig.modelId;
  this.actions = modelConfig.actions;
  this.childModels = modelConfig.childModels;
  this.fnCode = modelConfig.fnCode;
  this.fnParameter = modelConfig.fnParameter;
  this.listeners = {};
  this.id=createId()
}
CommonModel.prototype.getId=function(){
   return this.id
} 
CommonModel.prototype.draw = function (ctx, osCtx) {
  console.log("Method not implemented.");
};

CommonModel.prototype.onEvent = function (eventName, callback) {
  if (this.listeners[eventName]) {
    this.listeners[eventName].push(callback);
  } else {
    this.listeners[eventName] = [callback];
  }
};
CommonModel.prototype.removeEvent = function (eventName) {
  delete this.listeners[eventName];
};

CommonModel.prototype.getValue = function (propName) {
  return this[propName];
};

CommonModel.prototype.setValue = function (propName, value) {
  return (this[propName] = value);
};

CommonModel.prototype.updateConfig = function (modelConfig) {
  Object.keys(modelConfig).forEach((key) => {
    this.setValue(key, modelConfig[key]);
  });
};

CommonModel.prototype.addSubObject = function (modelConfig) {
  if (Array.isArray(this.childModels)) {
    this.childModels.push(modelConfig);
  } else {
    this.setValue("childModels", [modelConfig]);
  }
};

CommonModel.prototype.getListeners=function(){
  return this.listeners;
}

