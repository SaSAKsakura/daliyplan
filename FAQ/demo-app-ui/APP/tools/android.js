(function () {
  "use strict";
  const osType = !/android/i.test(navigator.userAgent) ? (!/OpenHarmony/i.test(navigator.userAgent) ? "iOS" : "harmonyos") : "android";
  const osColorScheme =
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) || /ColorScheme\/Dark/i.test(navigator.userAgent)
      ? "dark"
      : "light";

  const isSetFunc = function (func) {
    if (osType == "iOS") {
      if (webkit.messageHandlers[func]) return true;
      else return false;
    } else if (osType == "android") {
      if (android[func]) return true;
      else return false;
    } else if (osType == "harmonyos") {
      console.log("hosApi[func] func =", func);
      if (hosApi[func]) return true;
      else return false;
    }
  };

  const jsCallApp = function (func, params) {
    if (osType == "iOS") {
      if (params == undefined || params == null) {
        webkit.messageHandlers[func].postMessage(null);
      } else {
        webkit.messageHandlers[func].postMessage(JSON.stringify(params));
      }
    } else if (osType == "android") {
      if (params == undefined || params == null) {
        android[func]();
      } else {
        android[func](JSON.stringify(params));
      }
    } else if (osType == "harmonyos") {
      console.log("hosApi[func] func =", func);
      if (params == undefined || params == null) {
        hosApi[func]();
      } else {
        hosApi[func](JSON.stringify(params));
      }
    }
  };

  let callbackFunction = {};
  let callbackUniqueId = 0;
  const recordCallBack = function (name, callback) {
    name += callbackUniqueId; // 不能使用时间戳，同一毫秒下可能会执行多次该方法
    callbackUniqueId++;
    callbackFunction[name] = callback;
    let s = encodeURIComponent(JSON.stringify({ name }));
    return s;
  };
  const isKeepCallbackFlag = function (value) {
    return value === true || value === "true";
  };
  const shouldKeepCallback = function (data) {
    if (!data) {
      return false;
    }
    let result = data.result || {};
    return (
      isKeepCallbackFlag(data.keepCallback) ||
      isKeepCallbackFlag(data.keepAlive) ||
      isKeepCallbackFlag(data.isProgress) ||
      isKeepCallbackFlag(result.keepCallback) ||
      isKeepCallbackFlag(result.keepAlive) ||
      isKeepCallbackFlag(result.isProgress)
    );
  };
  // 适配鸿蒙
  const hosReturnValue = function (val) {
    console.log("val = ", val);
    let data = JSON.parse(val);
    let _callback = JSON.parse(decodeURIComponent(data.callback));
    let name = _callback.name;
    if (name.indexOf("appGetValue") >= 0) {
      let s = decodeURIComponent(data.result);
      if (s != "") {
        try {
          data.result = JSON.parse(s);
        } catch (err) {
          console.log("尝试解码后再转为json对象");
          data.result = JSON.parse(decodeURIComponent(s));
        }
      }
    } else if (name.indexOf("appGetTextValue") >= 0) {
      data.result = decodeURIComponent(data.result);
    }
    if (callbackFunction[name]) {
      callbackFunction[name](data);
      if (!shouldKeepCallback(data)) {
        delete callbackFunction[name];
      }
    }
  };
  window.hosReturnValue = hosReturnValue;

  const appReturnValue = function (data) {
    let _callback = JSON.parse(decodeURIComponent(data.callback));
    let name = _callback.name;

    if (name.indexOf("appGetValue") >= 0) {
      let s = decodeURIComponent(data.result);
      if (s != "") {
        try {
          data.result = JSON.parse(s);
        } catch (e) {
          data.result = s;
        }
      }
    } else if (name.indexOf("appGetTextValue") >= 0) {
      data.result = decodeURIComponent(data.result);
    }
    if (callbackFunction[name]) {
      callbackFunction[name](data);
      if (!shouldKeepCallback(data)) {
        delete callbackFunction[name];
      }
    }
  };
  window.appReturnValue = appReturnValue;
  const androidReturnValue_self = function (val) {
    let data = eval("(" + val + ")");
    let _callback = JSON.parse(decodeURIComponent(data.callback));
    let name = _callback.name;

    if (name.indexOf("appGetValue") >= 0) {
      let s = decodeURIComponent(data.result);
      if (s != "") {
        try {
          data.result = JSON.parse(s);
        } catch (e) {
          data.result = s;
        }
      }
    } else if (name.indexOf("appGetTextValue") >= 0) {
      let s = decodeURIComponent(data.result);
      data.result = s;
    }
    if (callbackFunction[name]) {
      callbackFunction[name](data);
      if (!shouldKeepCallback(data)) {
        delete callbackFunction[name];
      }
    }
  };
  window.androidReturnValue_self = androidReturnValue_self;
  window.androidReturnValue = androidReturnValue_self;

  const getVersionNumber = function (callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          version_name: 1.8,
        },
        resultFlag: -1,
      };
      callback(resultObj);
      return;
    }
    let parameter = {
      params: {},
      callback: recordCallBack("appGetVersionNumber", callback),
    };
    jsCallApp("getVersionName", parameter);
  };

  const getUniqueID = function (callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          unique_id: "debugMode862913031759823111",
        },
        resultFlag: -1,
      };
      callback(resultObj);
      return;
    }
    let parameter = {
      params: {},
      callback: recordCallBack("appGetUniqueID", callback),
    };
    jsCallApp("getUniqueID", parameter);
  };

  const setParameter = function (code, value, callback) {
    if (debugMode) {
      localStorage[code] = value;
      let resultObj = {
        result: "",
        resultFlag: -1,
      };
      if (callback != null) {
        callback(resultObj);
      }
      return;
    }
    let parameter = {
      params: {
        code: code,
        value: value,
      },
      callback: recordCallBack("appSetParameter", callback),
    };
    jsCallApp("setParameter", parameter);
  };

  const getParameter = function (code, callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          value: localStorage[code],
        },
        resultFlag: -1,
      };
      callback(resultObj);
      return;
    }
    let parameter = {
      params: {
        code: code,
      },
      callback: recordCallBack("appGetParameter", callback),
    };
    jsCallApp("getParameter", parameter);
  };

  const setValue = function (userId, code, value, statistics, last_update_date, callback) {
    if (debugMode) {
      localStorage[code + userId] = encodeURIComponent(JSON.stringify(value));
      localStorage[code + userId + "s"] = statistics;
      let resultObj = {
        result: "",
        resultFlag: -1,
      };
      if (callback != null) callback(resultObj);
      return;
    }

    value = encodeURIComponent(JSON.stringify(value));
    let parameter = {
      params: {
        userId: userId,
        code: code,
        value: value,
        statistics: statistics,
        last_update_date: last_update_date,
      },
      callback: recordCallBack("appSetValue." + code, callback),
    };
    jsCallApp("setValue", parameter);
  };

  const getValue = function (userId, code, callback) {
    if (debugMode) {
      let r = localStorage[code + userId] || "";
      try {
        r = JSON.parse(decodeURIComponent(r));
      } catch (e) {}
      let resultObj = {
        result: r,
        resultFlag: -1,
      };
      callback(resultObj);
      return;
    }
    let parameter = {
      params: {
        userId: userId,
        code: code,
      },
      callback: recordCallBack("appGetValue." + code, callback),
    };
    jsCallApp("getValue", parameter);
  };

  //获取统计数据
  const getStatistics = function (userId, code, callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          statistics: localStorage[code + userId + "s"] || 0,
        },
        resultFlag: -1,
      };
      if (callback) callback(resultObj);
      return;
    }
    let parameter = {
      params: {
        userId,
        code,
      },
      callback: recordCallBack("appGetStatistics", callback),
    };
    jsCallApp("getStatistics", parameter);
  };

  //获取全部文件
  const getAllFiles = function (userId, callback) {
    if (debugMode) {
      let fileList = [];
      if (localStorage["allFileList_" + userId] != undefined) {
        fileList = JSON.parse(decodeURIComponent(localStorage["allFileList_" + userId]));
      }
      let tempFileList = [];
      for (let i = 0; i < fileList.length; i++) {
        let tempFile = fileList[i];
        if (tempFile.upload_status == "NotUpload") {
          tempFileList.push(tempFile);
        }
      }
      var data = {};
      data.result = tempFileList;
      data.resultFlag = -1;
      data.callback = encodeURIComponent(JSON.stringify({ name: "appGetFileList", count: 1 }));
      if (callback != undefined) {
        callback(data);
      }
      return;
    }
    let parameter = {
      params: {
        userId,
      },
      callback: recordCallBack("appGetAllFileList", callback),
    };
    jsCallApp("getAllFile", parameter);
  };

  const getFileList = function (userId, fnCode, instanceGuid, folderCode, callback) {
    if (debugMode) {
      if (callback) {
        callback({
          resultFlag: -1,
          result: [],
        });
      }
      return;
    }
    let parameter = {
      params: {
        userId: userId,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode + "",
      },
      callback: recordCallBack("appGetFileList", callback),
    };
    jsCallApp("getFileList", parameter);
  };
  /**
   * getUploadFileList
   * @param {*} data
   * data包含 userId, fnCode, instanceGuid, folderCode,appId
   * @param {*} callback
   * appId 可不传
   * 获取上传文件本地缓存文件列表
   * 比getFileList多了一个返回参数
   * cacheFilePath返回缓存文件地址路径
   */
  const getUploadFileList = function ({ userId, fnCode, instanceGuid, folderCode, appId }, callback) {
    if (debugMode) {
      if (callback) {
        callback({
          resultFlag: -1,
          result: [],
        });
      }
      return;
    }
    let parameter = {
      params: {
        userId,
        fnCode,
        instanceGuid,
        folderCode,
        appId,
      },
      callback: recordCallBack("getUploadFileList", callback),
    };
    jsCallApp("getUploadFileList", parameter);
  };
  /**
   * getDownloadFileList
   * @param {*} data
   * data包含 userId, fnCode, instanceGuid, folderCode,appId,cacheFileFold
   * cacheFileFold 指定的本地特定缓存目录 可以不传
   * appId 可不传
   * @param {*} callback
   * 获取下载文件本地缓存文件列表
   * 比getFileList多了一个返回参数
   */
  const getDownloadFileList = function ({ userId, fnCode, instanceGuid, folderCode, appId, cacheFileFold }, callback) {
    if (debugMode) {
      if (callback) {
        callback({
          resultFlag: -1,
          result: "",
        });
      }
      return;
    }
    let parameter = {
      params: {
        userId,
        fnCode,
        instanceGuid,
        folderCode,
        appId,
        cacheFileFold,
      },
      callback: recordCallBack("getDownloadFileList", callback),
    };
    jsCallApp("getDownloadFileList", parameter);
  };
  const deleteFile = function (fileId, callback) {
    if (debugMode) {
      if (callback) {
        callback({
          resultFlag: -1,
          result: "",
        });
      }
      return;
    }
    let parameter = {
      params: {
        fileId,
      },
      callback: recordCallBack("appDeleteFile", callback),
    };
    jsCallApp("deleteFileV2", parameter);
  };
  const uploadFile = function (tokenId, fileName, callback) {
    if (!isSetFunc("uploadFileNameV2")) {
      if (callback) {
        callback({
          resultFlag: 0,
          result: "",
          errMsg: "请先升级app",
        });
      }
      return;
    }
    let parameter = {
      params: {
        tokenId,
        fileName,
      },
      callback: recordCallBack("uploadFile", callback),
    };
    jsCallApp("uploadFileNameV2", parameter);
  };

  const getGPS = function (callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          lon: 121.404469 + Math.floor(Math.random() * 1000) / 10000,
          lat: 31.137021 + Math.floor(Math.random() * 1000) / 10000,
        },
        resultFlag: -1,
      };
      if (callback) callback(resultObj);
      return;
    }

    let parameter = {
      params: {},
      callback: recordCallBack("appGetGPS", callback),
    };
    jsCallApp("getGPS", parameter);
  };

  const takePhoto = function (userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback) {
    let pictureMaxSize = "600";
    // 施工日志设置图片最大5120KB
    if (fnCode == "pm_construction_record") pictureMaxSize = "5120";
    let parameter = {
      params: {
        userId: userId,
        fileName: fileName,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
        pictureMaxSize: pictureMaxSize,
        statusname: "",
        fileGuid: "",
      },
      callback: recordCallBack("appTakePhoto", callback),
    };
    jsCallApp("takePhoto", parameter);
  };
  //takePicType=”LAND_HTML_TEXT”
  const takePhotoConfig = function ({
    userId,
    fileName,
    fnCode,
    instanceGuid,
    folderCode,
    uploadAPIPath,
    bizInfo,
    callback,
    takePicType,
    picPxW,
    picPxH,
  }) {
    let pictureMaxSize = "600";
    // 施工日志设置图片最大5120KB
    if (fnCode == "pm_construction_record") pictureMaxSize = "5120";
    let parameter = {
      params: {
        userId: userId,
        fileName: fileName,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
        pictureMaxSize: pictureMaxSize,
        statusname: "",
        fileGuid: "",
        takePicType, //后续不需要了 淘汰
        landType: takePicType == "LAND_HTML_TEXT" ? 1 : 0,
        picPxH: picPxH, //图片裁剪的高
        picPxW: picPxW, //图片裁剪的宽
      },
      callback: recordCallBack("appTakePhoto", callback),
    };
    jsCallApp("takePhoto", parameter);
  };
  // 人脸采集拍照
  const takePhotoV3 = function (userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback) {
    let pictureMaxSize = "600";
    // 施工日志设置图片最大5120KB
    if (fnCode == "pm_construction_record") pictureMaxSize = "5120";
    let parameter = {
      params: {
        userId: userId,
        fileName: fileName,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
        pictureMaxSize: pictureMaxSize,
        statusname: "",
        fileGuid: "",
      },
      callback: recordCallBack("takePhotoV3", callback),
    };
    jsCallApp("takePhotoV3", parameter);
  };

  const getBase64Img = function (dataCode, callback) {
    let parameter = {
      params: {
        dataCode: dataCode,
      },
      callback: recordCallBack("getBase64Img", callback),
    };
    jsCallApp("getBase64Img", parameter);
  };
  const pickPhoto = function (userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback, fileType) {
    if (!isSetFunc("pickPhoto")) {
      if (callback) {
        if (callback)
          callback({
            resultFlag: 0,
            result: "",
            errMsg: "请先升级app",
          });
      }
      return;
    }
    let params = {
      params: {
        userId,
        fileName,
        fnCode,
        instanceGuid,
        folderCode,
        fileType,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
        pictureMaxSize: "600",
        statusname: "",
        fileGuid: "",
      },
      callback: recordCallBack("appPickPhoto", callback),
    };
    jsCallApp("pickPhoto", params);
  };
  const pickFile = function (userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback, fileType) {
    let fileTypeParameter = [];
    let allFileType = ["text", "image", "audio", "video", "application"];
    if(fileType == "all") {
      fileTypeParameter = allFileType
    } else {
      fileTypeParameter = [fileType];
    }
    let params = {
      params: {
        userId,
        fileName,
        fnCode,
        instanceGuid,
        folderCode,
        fileType,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
        pictureMaxSize: "600",
        statusname: "",
        fileGuid: "",
      },
      callback: recordCallBack("appPickFile", callback),
    };
    if (!isSetFunc("pickFile")) {
      params.params.fileType = fileType;
      jsCallApp("pickPhoto", params);
      return;
    }
    jsCallApp("pickFile", params);
  };
  const appShowMultiVideo = function (videos, callback) {
    if (debugMode) {
      if (callback) callback();
      return;
    }
    if (igwMode) {
    } else {
      let parameter = {
        callback: recordCallBack("showMultiVideo", callback),
        params: {
          videos,
        },
      };
      jsCallApp("showMultiVideo", parameter);
    }
  };

  const appStopMultiVideo = function (callback) {
    if (debugMode) {
      if (callback) callback();
      return;
    }
    if (igwMode) {
    } else {
      let parameter = {
        callback: recordCallBack("stopMultiVideo", callback),
      };
      jsCallApp("stopMultiVideo", parameter);
    }
  };

  const audioRecordStart = function (userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback) {
    let parameter = {
      params: {
        userId: userId,
        fileName: encodeURIComponent(fileName),
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        fileGuid: fileGuid,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      },
      callback: recordCallBack("appBeginRecord", callback),
    };
    jsCallApp("beginRecord", parameter);
  };

  const audioRecordStop = function (callback) {
    let parameter = {
      params: {},
      callback: recordCallBack("appStopRecord", callback),
    };
    jsCallApp("stopRecord", parameter);
  };

  const videoRecord = function (userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback) {
    let parameter = {
      params: {
        userId: userId,
        fileName: fileName,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        fileGuid: fileGuid,
        uploadAPIPath: uploadAPIPath || "",
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      },
      callback: recordCallBack("appBeginCamera", callback),
    };
    jsCallApp("beginCamera", parameter);
  };

  const showFile = function (url, name) {
    let parameter = {
      params: {
        url: url,
        fileName: name,
      },
      callback: null,
    };
    jsCallApp("showFile", parameter);
  };

  const faceRegister = function (userId, steps, openFace, callback) {
    if (!isSetFunc("faceRegisterV2")) {
      if (callback)
        callback({
          resultFlag: 0,
          result: "",
          errMsg: "请先升级app",
        });
      return;
    }
    let params = {
      params: {
        userId: "" + userId,
        steps,
        openFace,
      },
      callback: recordCallBack("appFaceRegisterV2", callback),
    };
    jsCallApp("faceRegisterV2", params);
  };

  const scanQrcode = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("appScanQrcode", callback),
    };
    jsCallApp("scanQrcode", params);
  };

  const exitSystem = function () {
    setParameter("userName", "", (data) => {
      setParameter("userID", "", (data) => {
        setParameter("token", "", (data) => {
          if (debugMode) {
            window.location.href = `../SignIn.html?t=` + new Date().getTime();
            return;
          }
          jsCallApp("exitSystem");
          if (osType == "iOS") {
            window.location.href = `../SignIn.html?t=` + new Date().getTime();
          }
        });
      });
    });
  };

  const exitToYJK = function () {
    if (isSetFunc("exitToYJK")) {
      jsCallApp("exitToYJK");
      return true;
    }
    return false;
  };

  const appCameraPushInit = function (data, callback) {
    let params = {
      params: data,
      callback: recordCallBack("appCameraPushInit", callback),
    };
    jsCallApp("cameraPushInit", params);
  };
  const appCameraPushStart = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("appCameraPushStart", callback),
    };
    jsCallApp("cameraPushStart", params);
  };
  const appCameraPushPause = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("appCameraPushPause", callback),
    };
    jsCallApp("cameraPushPause", params);
  };

  const appCameraPushSwitchCamera = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("appCameraPushSwitchCamera", callback),
    };
    jsCallApp("cameraPushSwitchCamera", params);
  };

  const appCameraPushSwitchEncode = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("appCameraPushSwitchEncode", callback),
    };
    jsCallApp("cameraPushSwitchEncode", params);
  };

  const appGetCameraPushStatus = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("getCameraPushStatus", callback),
    };
    jsCallApp("getCameraPushStatus", params);
  };

  const appConfirm = function (message, callback) {
    var parameter = {
      params: { message: message },
      callback: recordCallBack("appConfirm", callback),
    };
    jsCallApp("confirm", parameter);
  };

  const appAlert = function (message, callback) {
    var parameter = {
      params: { message: message },
      callback: recordCallBack("appAlert", null),
    };
    jsCallApp("alert", parameter);
  };

  //文件上传
  const erowUploadFile = function (url, params, fileId, partName, fileName, filePath, mimeType, callback, isProgress = false) {
    let file = {
      fileId: fileId + "",
      partName,
      fileName,
      filePath,
    };
    if (mimeType) file.mimeType = mimeType;
    let parameter = {
      callback: recordCallBack("erowUploadFile", callback),
      params: {
        url,
        params,
        file,
        isProgress
      },
    };
    jsCallApp("erowUploadFile", parameter);
  };

  const startSocketServer = function (port, messageType, callback) {
    if (!debugMode) {
      let parameter = {
        callback: recordCallBack("startSocketServer", callback),
        params: {
          port: port,
          messageType: messageType,
        },
      };
      jsCallApp("startSocketServer", parameter);
    }
  };

  const closeSocketServer = function (port, messageType, callback) {
    if (!debugMode) {
      let parameter = {
        callback: recordCallBack("closeSocketServer", callback),
        params: {
          port: port,
          messageType: messageType,
        },
      };
      jsCallApp("closeSocketServer", parameter);
    }
  };

  const getShareData = function (callback, params) {
    if (debugMode) {
      callback({ data: [] });
    } else {
      let parameter = {
        callback: recordCallBack("getShareData", callback),
        params: params,
      };
      jsCallApp("getShareData", parameter);
    }
  };

  const clearShareData = function (callback) {
    if (!debugMode) {
      let parameter = {
        callback: recordCallBack("clearShareData", callback),
      };
      jsCallApp("clearShareData", parameter);
    }
  };
  /// 是否安装第三方app
  /// type: 1-百度地图 2-高德地图 3-腾讯地图
  const doesDeviceInstallMap = function (type, callback) {
    let source = "";
    if (osType == "iOS") {
      if (type == 1) source = "baidumap://";
      else if (type == 2) source = "iosamap://";
      else if (type == 3) source = "qqmap://";
    }
    let params = {
      params: {
        source,
      },
      callback: recordCallBack("doesDeviceInstallMap", callback),
    };
    jsCallApp("isAppInstalled", params);
  };

  /// 跳转第三方地图app
  /// type: bmap-百度地图 amap-高德地图 qqmap-腾讯地图
  /// 百度地图需要bd09坐标，高德、腾讯地图需要gjc02坐标
  /// dist：目标位置名称
  const toApp = function (appScheme, callback) {
    let parameter = {
      params: {
        appScheme: appScheme,
      },
      callback: recordCallBack("toMapApp", callback),
    };
    jsCallApp("toApp", parameter);
  };
  //  是否有第三方app
  const isAppInstalled = function (appName, callback) {
    let parameter = {
      params: {
        appName: appName,
      },
      callback: recordCallBack("isAppInstalled", callback),
    };
    if (osType == "iOS") {
      parameter = {
        params: {
          source: appName,
        },
        callback: recordCallBack("isAppInstalled", callback),
      };
    }
    jsCallApp("isAppInstalled", parameter);
  };
  const copyTextToClipboard = function (photo, callback) {
    let params = {
      params: {
        text: photo,
      },
      callback: recordCallBack("copyTextToClipboard", callback),
    };
    jsCallApp("copyTextToClipboard", params);
  };
  const setWindowOrientation = function (orientation, callback) {
    let parameter = {
      params: {
        orientation: orientation, // "PORTRAIT"竖屏/LANDSCAPE横
      },
      callback: recordCallBack("setWindowOrientation", callback),
    };
    jsCallApp("setWindowOrientation", parameter);
  };
  //当应用 A 需要跳转至应用 B 的某个页面时，由 A 应用调用此函数，传入应用 B 的projectGuid 和目标页面在逸集控后台系统中配置的 Code
  const toOtherPage = function (targetProjectGuid, targetPageCode, paramster, callback) {
    let parameter = {
      params: {
        targetProjectGuid: targetProjectGuid,
        targetPageCode: targetPageCode,
        params: paramster,
      },
      callback: recordCallBack("toOtherPage", callback),
    };
    jsCallApp("toOtherPage", parameter);
  };
  //当需要由应用 B 返回应用 A 时调用，由 pageManager 统一处理调用
  const pageReturn = function (callback) {
    let parameter = {
      params: {},
      callback: recordCallBack("pageReturn", callback),
    };
    jsCallApp("pageReturn", parameter);
  };

  // ios第三方预览
  const callThirdPartyToShowFile = function (appId, fileName, fileGuid, downloadType = "showFile") {
    let params = {
      params: {
        appId,
        fileName,
        fileGuid,
        downloadType,
      },
      callback: null,
    };
    jsCallApp("showFile2", params);
  };

  // 获取文件下载状态
  const getFileDownloadStatus = function (appId, fileName, fileGuid, callback) {
    let params = {
      params: {
        appId,
        fileName,
        fileGuid,
      },
      callback: recordCallBack("getFileDownStatus", callback),
    };
    jsCallApp("getFileDownStatus", params);
  };

  // 通知APP在后台下载文件
  const startAsyncDownloadInApp = function (url, fileName, fileGuid, fnCode, appId, callback) {
    let params = {
      params: {
        url,
        fileName,
        fileGuid,
        fnCode,
        appId,
      },
      callback: recordCallBack("showFileDownload", callback),
    };
    jsCallApp("showFileDownload", params);
  };

  // 判断用户网络环境(WIFI/数据)
  const getUserInterNetEnv = function (callback) {
    let params = {
      params: {},
      callback: recordCallBack("getNetworkState", callback),
    };
    jsCallApp("getNetworkState", params);
  };

  const updateFileParameter = function (fileName, newFileName, appId, newBizInfoValue, callback) {
    let parameter = {
      params: {
        fileName: fileName,
        newFileName: newFileName,
        appId: appId,
        newBizInfoValue: newBizInfoValue,
      },
      callback: recordCallBack("updateFileParameter", callback),
    };
    jsCallApp("updateFileParameter", parameter);
  };
  const getOtherToken = function (projectGuids, callback) {
    var parameter = {
      params: { projectGuids: projectGuids },
      callback: recordCallBack("getOtherToken", callback),
    };
    jsCallApp("getOtherToken", parameter);
  };

  //查看某一文件
  function appViewFile(fileName, callback, folderCode) {
    var parameter = {
      params: { fileName: fileName, folderCode: folderCode },
      callback: recordCallBack("appViewFile", callback),
    };

    //android.viewFile(JSON.stringify(parameter));
    jsCallApp("viewFile", parameter);
  }
  const checkApp = function (callback, params) {
    if (debugMode) {
      callback({ appStatus: "" });
    } else {
      let parameter = {
        callback: recordCallBack("checkApp", callback),
        params: params,
      };
      jsCallApp("checkApp", parameter);
    }
  };
  const goAppToConfig = function (callback) {
    if (!callback) {
      callback = () => {};
    }
    if (debugMode) {
      callback();
    } else {
      let parameter = {
        callback: recordCallBack("goAppToConfig", callback),
      };
      jsCallApp("goAppToConfig", parameter);
    }
  };
  const goAppSouthSdkSettingAC = function (callback) {
    if (!callback) {
      callback = () => {};
    }
    if (debugMode) {
      callback();
    } else {
      let parameter = {
        callback: recordCallBack("goAppSouthSdkSettingAC", callback),
      };
      jsCallApp("goAppSouthSdkSettingAC", parameter);
    }
  };
  const sendAction = function (callback, params) {
    if (!callback) {
      callback = () => {};
    }
    if (debugMode) {
      callback();
    } else {
      let parameter = {
        callback: recordCallBack("sendAction", callback),
        params: params,
      };
      jsCallApp("sendAction", parameter);
    }
  };

  // 保存图片至本地图库
  const saveImgLibrary = function (imageData, fileType, filePath, callback) {
    let parameter = {
      params: {
        imageData,
        fileType,
        filePath,
        callback,
      },
      callback: recordCallBack("saveImgLibrary", callback),
    };
    jsCallApp("saveImgLibrary", parameter);
  };
  /**
   * 分享内容至微信
   *
   * @function shareToWX
   * @param {number} scene - 分享场景：
   *   - 0: 聊天界面
   *   - 1: 朋友圈
   *   - 2: 收藏
   *   - 3: 指定联系人
   * @param {string} type - 分享内容类型：
   *   - 'text': 文本
   *   - 'image': 图片
   *   - 'video': 视频
   *   - 'webpage': 网页
   * @param {Object} message - 分享内容对象，结构根据 type 不同而变化：
   *   - type='text' 时：
   *     @property {string} text - 文本内容（必填）
   *   - type='image' 时：
   *     @property {string} imageUrl - 图片URL地址（必填）
   *     @property {string} [thumbUrl] - 缩略图URL地址（可选，默认逸集控logo）
   *   - type='video' 时：
   *     @property {string} videoUrl - 视频URL地址（必填）
   *     @property {string} [thumbUrl] - 缩略图URL地址（可选，默认逸集控logo）
   *     @property {string} title - 视频标题（必填）
   *     @property {string} desc - 内容描述（必填）
   *   - type='webpage' 时：
   *     @property {string} webUrl - 网页URL地址（必填）
   *     @property {string} [thumbUrl] - 缩略图URL地址（可选，默认逸集控logo）
   *     @property {string} title - 网页标题（必填）
   *     @property {string} desc - 内容描述（必填）
   * @param {Function} [callback] - 回调函数
   */
  const shareToWX = function (scene, type, message, callback) {
    let params = {
      params: {
        type,
        scene,
        message,
      },
      callback: recordCallBack("shareToWX", callback),
    };
    jsCallApp("shareToWX", params);
  };
  // 下载文件到缓存
  /**
   *
   * @param {object} params
   * params包含：appId,fileGuid,fnCode,fileName,fileUrl cacheFileFold 文件下载指定的目录
   * appId cacheFileFold 非必传
   * @param {*} callback
   */
  const downloadFile = function ({ appId, fileGuid, fnCode, fileName, fileUrl, cacheFileFold }, callback) {
    let param = {
      params: {
        appId,
        fileGuid,
        fnCode,
        fileName,
        url: fileUrl,
        cacheFileFold,
      },
      callback: recordCallBack("downloadFile", callback),
    };
    jsCallApp("downloadFile", param);
  };
  /**
   * 检查文件存在状态
   * @param {object} params
   * params包含：fileGuid,fileName,appId,cacheType
   * appId非必传
   * cacheType:upLoad downLoad,区分是从服务器下载的文件还是要上传的文件 区分上传下载参数必填，上传时，fileName必传，下载时fileGuid必传
   * @param {*} callback
   */
  const checkFileExists = function ({ fileGuid, fileName, appId, cacheType }, callback) {
    let param = {
      params: {
        fileGuid,
        fileName,
        appId,
        cacheType,
      },
      callback: recordCallBack("checkFileExists", callback),
    };
    jsCallApp("checkFileExists", param);
  };
  /**
   * 获取上传的本地文件缓存路径
   * @param {object} params
   * params包含：fileGuid,fileName,appId,cacheType
   * appId非必传
   * cacheType:upLoad downLoad  区分是从服务器下载的文件还是要上传的文件
   * @param {*} callback
   */

  const getFileDir = function ({ fileGuid, fileName, appId, cacheType }, callback) {
    let param = {
      params: {
        fileGuid,
        fileName,
        appId,
        cacheType,
      },
      callback: recordCallBack("getFileDir", callback),
    };
    jsCallApp("getFileDir", param);
  };
  /**
   * deleteFiles 批量删除缓存文件
   * @param {object} userId
   * @param {string} fnCode
   * @param {string} instanceGuid
   * @param {string} foldCode
   * @param {string} appId
   * @param {string} cacheFileFold 指定的缓存目录下的文件删除
   * @param {string} cacheType 【string】”upLoad”上传文件 ”downLoad”下载文件 必传
   * @param {string} fileGuid 【string】文件唯一标识 删除上传文件传
   * @param {*} callback
   * 如果以上参数都不传，删除当前系统所有缓存文件
   * appId cacheFileFold 非必传
   */
  const deleteFiles = function ({ userId, fnCode, fileGuid, instanceGuid, foldCode, appId, cacheFileFold, cacheType }, callback) {
    let param = {
      params: {
        userId,
        fnCode,
        instanceGuid,
        foldCode,
        appId,
        cacheFileFold,
        cacheType,
        fileGuid,
      },
      callback: recordCallBack("deleteFiles", callback),
    };
    jsCallApp("deleteFiles", param);
  };
  /**
   * saveAs 将本地缓存文件，拷贝保存一份到用户手机存储的download文件夹内
   * @param {object} params
   * params包含：fileGuid,fileName,appId,cacheType
   * appId非必传
   * cacheType:upLoad downLoad  区分是从服务器下载的文件还是要上传的文件
   * @param {*} callback
   */
  const saveAs = function ({ filePath }, callback) {
    let param = {
      params: {
        fileGuid,
        fileName,
        appId,
        cacheType,
      },
      callback: recordCallBack("saveAs", callback),
    };
    jsCallApp("saveAs", param);
  };
  const showLocalMdFile = function ({filePath}, callback) {
    let param = {
      params: {
        filePath,
      },
      callback: recordCallBack("showLocalMdFile", callback),
    };
    jsCallApp("showLocalMdFile", param);
  };  //签字
  function appSign(
    userId,
    fileName,
    fnCode,
    instanceGuid,
    folderCode,
    fileGuid,
    uploadAPIPath,
    bizInfo,
    callback
  ) {
    var parameter = {
      params: {
        userId: userId,
        fileName: fileName,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        fileGuid: fileGuid,
        uploadAPIPath: uploadAPIPath,
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      },
      callback: recordCallBack("appSign", callback),
    };
    jsCallApp("sign", parameter);
  }
  const erJsBridge = {
    osType,
    osColorScheme,
    isSetFunc,
    jsCallApp,
    getUniqueID,
    getVersionNumber,
    setParameter,
    getParameter,
    setValue,
    getValue,
    getStatistics,
    getAllFiles,
    getFileList,
    deleteFile,
    uploadFile,
    getGPS,
    takePhoto,
    takePhotoV3,
    getBase64Img,
    pickPhoto,
    pickFile,
    appShowMultiVideo,
    appStopMultiVideo,
    audioRecordStart,
    audioRecordStop,
    videoRecord,
    faceRegister,
    showFile,
    scanQrcode,
    exitSystem,
    exitToYJK,
    appCameraPushInit,
    appCameraPushStart,
    appCameraPushPause,
    appCameraPushSwitchCamera,
    appCameraPushSwitchEncode,
    appGetCameraPushStatus,
    appConfirm,
    appAlert,
    erowUploadFile,
    startSocketServer,
    closeSocketServer,
    getShareData,
    clearShareData,
    isAppInstalled,
    doesDeviceInstallMap,
    toApp,
    copyTextToClipboard,
    toOtherPage,
    pageReturn,
    setWindowOrientation,
    takePhotoConfig,
    getFileDownloadStatus,
    updateFileParameter,
    getUserInterNetEnv,
    startAsyncDownloadInApp,
    callThirdPartyToShowFile,
    getOtherToken,
    appViewFile,
    checkApp,
    goAppToConfig,
    goAppSouthSdkSettingAC,
    sendAction,
    saveImgLibrary,
    shareToWX,
    getFileDir,
    checkFileExists,
    downloadFile,
    saveAs,
    deleteFiles,
    getUploadFileList,
    getDownloadFileList,
    showLocalMdFile,
    appSign,
  };

  window.erJsBridge = erJsBridge;
})();
