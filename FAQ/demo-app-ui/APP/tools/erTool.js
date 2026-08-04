(function () {
  const erTool = {
    QueryString: function (val) {
      var url = window.location.search;
      var re = new RegExp("" + val + "=([^&?]*)", "ig");
      return url.match(re) ? url.match(re)[0].substr(val.length + 1) : null;
    },
    generateUUID() {
      let d = new Date().getTime();
      let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
      return uuid;
    },
    isTablet() {
      var ua = navigator.userAgent;
      var isAndroid = /(?:Android)/.test(ua);
      var isFireFox = /(?:Firefox)/.test(ua);
      var isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua));
      return isTablet || window.innerWidth > window.innerHeight;
    },

    image2Base64(img) {
      let canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let dataURL = canvas.toDataURL("image/jpeg");
      return dataURL;
    },

    // Vue实例对象traget在引入vant组件的情况下可使用该方法
    showLoading(target, message, duration = 0) {
      target.$toast.loading({
        duration,
        message,
      });
    },

    // Vue实例对象traget在引入vant组件的情况下可使用该方法
    hideLoading(target) {
      target.$toast.clear();
    },

    // Vue实例对象traget在引入vant组件的情况下可使用该方法
    showAlert(target, title, message, callback) {
      target.$dialog
        .alert({
          title,
          message,
        })
        .then(() => {
          if (callback) callback();
        });
    },

    // 将base64转换为文件，imgStr为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
    base64ToFile(imgStr, filename) {
      try {
        let arr = imgStr.split(",");
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      } catch (error) {
        return null;
      }
    },
    isBase64(str) {
      const base64Regex = /^(?:[A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
      return base64Regex.test(str);
    },
    base64ToStringOne(str) {
      return decodeURIComponent(
        atob(str)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
    },
    encrypt(word, keys, klength = 16) {
      let srcs = CryptoJS.enc.Utf8.parse(word);
      let key = CryptoJS.enc.Utf8.parse(keys.substr(0, 16));
      let iv = CryptoJS.enc.Utf8.parse(keys.substr(0, 16));
      let encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding,
      });
      return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    },
    decrypt(word, keys, klength = 16) {
      let key = CryptoJS.enc.Utf8.parse(keys.substr(0, klength));
      let iv = CryptoJS.enc.Utf8.parse(keys.substr(0, 16));
      let base64 = CryptoJS.enc.Base64.parse(word);
      let src = CryptoJS.enc.Base64.stringify(base64);
      var decrypt = CryptoJS.AES.decrypt(src, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding,
      });
      var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
      return decryptedStr.toString();
    },
    sm2Encrypts(content, key, clipMode) {
      return '04' + sm2.doEncrypt(content, key, (clipMode = 0));
    },
    decryptsm2(content, privateKey) {
      content = content.slice(2);
      let decryptData = sm2.doDecrypt(content, privateKey, 0);
      return decryptData;
    },
    /// 依赖百度map api，需先引入bmap js
    /// from: wgs84、gcj02、bd09
    /// to: gcj02、bd09
    /// 根据法律规定，不支持将任何类型的坐标转换为GPS坐标
    gpsConvertor(gps, from, to, callback) {
      let points = [new BMap.Point(gps.lon, gps.lat)];
      let convertor = new BMap.Convertor();
      let coorCode = (coordinate) => {
        if (coordinate == "wgs84") return 1;
        if (coordinate == "gcj02") return 3;
        if (coordinate == "bd09") return 5;
        return "";
      };
      let fromCode = coorCode(from);
      if (fromCode == "") {
        if (callback)
          callback({
            resultFlag: 0,
            errMsg: `不支持${from}坐标系`,
          });
        return;
      }
      let toCode = coorCode(to);
      if (toCode == "") {
        if (callback)
          callback({
            resultFlag: 0,
            errMsg: `不支持${to}坐标系`,
          });
      }
      convertor.translate(points, fromCode, toCode, (data) => {
        if (data.status == 0) {
          let point = data.points.pop();
          if (callback)
            callback({
              resultFlag: -1,
              result: {
                lon: point.lng,
                lat: point.lat,
              },
              errMsg: "",
            });
        } else {
          let errMsg = data.status;
          if (data.status == 1) errMsg = "内部错误";
          else if (data.status == 4) errMsg = "转换失败";
          else if (data.status == 21) errMsg = "from非法";
          else if (data.status == 22) errMsg = "to非法";
          else if (data.status == 24) errMsg = "coords格式非法";
          else if (data.status == 25) errMsg = "coords个数非法，超过限制";
          else if (data.status == 26) errMsg = "参数错误";
          if (callback)
            callback({
              resultFlag: 0,
              errMsg,
            });
        }
      });
    },
    //获取两个坐标点之间的距离
    getPointDistance(from, to) {
      var EARTH_RADIUS = 6378137.0; //单位M
      var PI = Math.PI;
      let getRad = (d) => {
        return (d * PI) / 180.0;
      };
      var f = getRad((from.lat + to.lat) / 2);
      var g = getRad((from.lat - to.lat) / 2);
      var l = getRad((from.lon - to.lon) / 2);

      var sg = Math.sin(g);
      var sl = Math.sin(l);
      var sf = Math.sin(f);

      var s, c, w, r, d, h1, h2;
      var a = EARTH_RADIUS;
      var fl = 1 / 298.257;

      sg = sg * sg;
      sl = sl * sl;
      sf = sf * sf;

      s = sg * (1 - sl) + (1 - sf) * sl;
      c = (1 - sg) * (1 - sl) + sf * sl;

      w = Math.atan(Math.sqrt(s / c));
      r = Math.sqrt(s * c) / w;
      d = 2 * w * a;
      h1 = (3 * r - 1) / 2 / c;
      h2 = (3 * r + 1) / 2 / s;
      var distance = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
      return distance;
    },
    //根据中文地址获取对应坐标点
    getPointByAddress(address, callback) {
      if (!address) {
        return;
      }
      var myGeo = new BMap.Geocoder();
      myGeo.getPoint(
        address,
        (point) => {
          if (point) {
            callback({
              lng: point.lng,
              lat: point.lat,
            });
          } else {
            callback({ errMsg: "未找到坐标点" });
          }
        },
        "全国"
      );
    },
  };
  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (s1, s2) {
      return this.replace(new RegExp(s1, "gm"), s2);
    };
  }
  window.erTool = erTool;
})();
