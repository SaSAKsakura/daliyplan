(function (window) {
  var db = {
    open() {},
    save: function (data, callback) {
      erJsBridge.setValue(erUser.userId, data.name, data, 0, new Date(), callback);
    },
    getAll: function (callback) {
      // db.open(function () {
      //   var store = db.getObjectStore(),
      //     cursor = store.openCursor(),
      //     data = [];
      //   cursor.onsuccess = function (e) {
      //     var result = e.target.result;
      //     if (result && result !== null) {
      //       data.push(result.value);
      //       result.continue();
      //     } else {
      //       callback(data);
      //     }
      //   };
      // });
    },

    get: function (id, callback) {
      //id = id;
      erJsBridge.getValue(erUser.userId, id, (res) => {
        if (res.resultFlag == -1) {
          let obj = typeof res.result == "string" && res.result ? JSON.parse(res.result) : res.result;
          callback(obj);
        } else {
          callback({ value: "" });
        }
      });
    },

    delete: function (id, callback) {
      //id = parseIid);
      erJsBridge.setValue(erUser.userId, id, "", 0, new Date(), callback);
    },

    deleteAll: function (callback) {
      // db.open(function () {
      //   var mode, store, request;
      //   mode = "readwrite";
      //   store = db.getObjectStore(mode);
      //   // var request = store.openCursor();
      //   // request.onsuccess = function (event) {
      //   //   var cursor = event.target.result;
      //   //   if (cursor) {
      //   //     // 使用Object.assign方法是为了避免控制台打印时出错
      //   //     console.log(Object.assign(cursor.value));
      //   //     let temp = Object.assign(cursor.value);
      //   //     //自动清理过期的缓存
      //   //     cursor.continue();
      //   //   }
      //   // };

      //   // request.onerror = function (event) {
      //   //   // 错误处理!
      //   // };

      //   request = store.clear();
      //   request.onsuccess = callback;
      // });
      callback();
    },
    //清理过期数据
    // deleteAllOldData: function (callback) {
    //   db.open(function () {
    //     var mode, store, request;
    //     mode = "readwrite";
    //     store = db.getObjectStore(mode);
    //     var request = store.openCursor();
    //     request.onsuccess = function (event) {
    //       debugger;
    //       var cursor = event.target.result;
    //       if (cursor) {
    //         // 使用Object.assign方法是为了避免控制台打印时出错
    //         console.log(Object.assign(cursor.value));
    //         let temp = Object.assign(cursor.value);
    //         let currentTime = new Date().getTime();
    //         //过期则重新获取
    //         if (currentTime - temp.cacheTime > temp.expireTime) {
    //           store.delete(temp.name);
    //         }
    //         //自动清理过期的缓存
    //         cursor.continue();
    //       }
    //     };

    //     request.onerror = function (event) {
    //       // 错误处理!
    //     };
    //   });
    // },
    //模糊清理数据:
    deleDataWidthName: function (name, callback) {
      let cacheKeys = localStorage.getItem("");
    },
  };
  window.app = window.app || {};
  window.app.db = db;
})(window);
