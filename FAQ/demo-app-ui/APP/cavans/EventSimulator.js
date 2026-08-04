
var ActionType= {
  "Down":'DOWN',
  Up :'Up',
  Move : 'MOVE',
}

var EventNames= {
  click:'click',
  mousedown:'mousedown',
  mousemove :'mousemove',
  mouseup :'mouseup',
  mouseenter : 'mouseenter',
  mouseleave :'mouseleave',
}

function EventSimulator() {
  this.listenersMap={};
  this.lastDownId="";
  this.lastMoveId="";
}
EventSimulator.prototype.addAction=function(action, evt) {
     var type = action.type
     var id=action.id
    // mousemove
    if (type === ActionType.Move) {
      this.fire(id, EventNames.mousemove, evt);
    }
    // mouseover
    // mouseenter
    if (type === ActionType.Move && (!this.lastMoveId || this.lastMoveId !== id)) {
      this.fire(id, EventNames.mouseenter, evt);
      this.fire(this.lastMoveId, EventNames.mouseleave, evt);
    }

    // mousedown
    if (type === ActionType.Down) {
      this.fire(id, EventNames.mousedown, evt);
    }

    // mouseup
    if (type === ActionType.Up) {
      this.fire(id, EventNames.mouseup, evt);
    }
     
    // click
    if (type === ActionType.Up && this.lastDownId === id) {
      this.fire(id, EventNames.click, evt);
    }

    if (type === ActionType.Move) {
      this.lastMoveId = action.id;
    } else if (type === ActionType.Down) {
      this.lastDownId = action.id;
    }
  }

  EventSimulator.prototype.addListeners=function(
    id,
    listeners
  ) {
    this.listenersMap[id] = listeners;
  }

  EventSimulator.prototype.fire= function(id, eventName, evt) {
    if (this.listenersMap[id] && this.listenersMap[id][eventName]) {
      
      this.listenersMap[id][eventName].forEach((listener) => listener(evt));
    }
  }

