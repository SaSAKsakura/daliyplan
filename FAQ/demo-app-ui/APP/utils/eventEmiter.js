(function () {
  let eventEmitter = {
    // 缓存列表
    list: {},
    listMap: {},
    // 订阅
    on(event, fn, paramsObj) {
      let _this = this;
      // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
      // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
      // (_this.list[event] || (_this.list[event] = [])).push(fn);
      if (!_this.list[event]) {
        _this.list[event] = [];
      }
      //如果数组里面已经有了指定容器的对应event监听，不再重复push,保证一个容器对event的监听唯一
      if (paramsObj && paramsObj.ctnrUID) {
        if (!_this.listMap[paramsObj.ctnrUID + "_" + event]) {
          _this.list[event].push(fn);
          _this.listMap[paramsObj.ctnrUID + "_" + event] = [fn];
        }
      } else {
        _this.list[event].push(fn);
      }
      return _this;
    },
    // 监听一次
    once(event, fn) {
      // 先绑定，调用后删除
      let _this = this;
      function on() {
        _this.off(event, on);
        fn.apply(_this, arguments);
      }
      on.fn = fn;
      _this.on(event, on);
      return _this;
    },
    // 取消订阅
    off(event, fn, paramsObj) {
      let _this = this;
      let fns = _this.list[event];
      // 如果缓存列表中没有相应的 fn，返回false
      if (!fns) return false;
      if (!fn) {
        // 如果没有传 fn 的话，就会将 event 值对应缓存列表中的 fn 都清空
        fns && (fns.length = 0);
      } else {
        // 若有 fn，遍历缓存列表，看看传入的 fn 与哪个函数相同，如果相同就直接从缓存列表中删掉即可
        let cb;
        for (let i = 0, cbLen = fns.length; i < cbLen; i++) {
          cb = fns[i];
          if (cb === fn || cb.fn === fn) {
            fns.splice(i, 1);
            break;
          }
        }
      }
      if (paramsObj && paramsObj.ctnrUID) {
        if (_this.listMap[paramsObj.ctnrUID + "_" + event]) {
          delete _this.listMap[paramsObj.ctnrUID + "_" + event];
        }
      }
      return _this;
    },
    // 发布
    emit() {
      let _this = this;
      // 第一个参数是对应的 event 值，直接用数组的 shift 方法取出
      let event = [].shift.call(arguments);
      if (Array.isArray(_this.list[event])) {
        let fns = _this.list[event].concat();
        // 如果缓存列表里没有 fn 就返回 false
        if (!fns || fns.length === 0) {
          return false;
        }
        // 遍历 event 值对应的缓存列表，依次执行 fn
        fns.forEach((fn) => {
          fn.apply(_this, arguments);
        });
      }

      return _this;
    },
  };
  window.eventEmitter = eventEmitter;
})();
