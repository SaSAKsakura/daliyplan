var _UniqueID = "";
var _UserID = 0;
var _UserName = "";
var _Token = "";
var _VersionNumber;

var callbackCount = 0;
var callbackFunction = new Array(1000);
var maxCount = 1000;
var android;
var hosApi;
var androidReturnValue;
var recordCallBack;
var debugMode = false;
var osType = 0; //0 android; 1 iOS 2 HarmonyOS
var request = {
  // val就是参数名称,获取请求参数中对应的参数名称的值
  QueryString: function (val) {
    var url = window.location.search;
    var re = new RegExp("" + val + "=([^&?]*)", "ig");
    return url.match(re) ? url.match(re)[0].substr(val.length + 1) : null;
  },
};

//开启截屏
try {
  android.switchScreenshot(
    JSON.stringify({ params: { enableFlag: "-1" }, callback: null })
  );
} catch (ex) {}

function getQueryStringByName(name) {
  var result = location.search.match(
    new RegExp("[?&]" + name + "=([^&]+)", "i")
  );

  if (result == null || result.length < 1) {
    return "";
  }

  return result[1];
}

document.addEventListener("DOMContentLoaded", initData, false);
function initAndroidReturnValue(){
	if (typeof (android) == 'undefined') {
    if (!/android/i.test(navigator.userAgent)) {
      // 适配鸿蒙 
      if (!/OpenHarmony/i.test(navigator.userAgent)) {
        osType = 1; //iOS 
        if (top.iOS) { 
          android = top.iOS; 
          androidReturnValue = top.iOSReturnValue; 
          recordCallBack = top.recordCallBack; }
      } else {
        osType = 2 // HarmonyOS 
        android = top.hosApi
        androidReturnValue = top.hosReturnValue
        recordCallBack = top.recordCallBack;
      }
    } else if (top != self) {
      android = top.android;
      androidReturnValue = top.androidReturnValue_self;
    }
  } else {
    android = top.android;
    androidReturnValue = top.androidReturnValue_self;
  }
}
function hosReturnValue(val) {
  console.log('val = ', val)
  let data = JSON.parse(val)
  let _callback = JSON.parse(decodeURIComponent(data.callback));
  let name = _callback.name;
  if (name.indexOf("appGetValue") >= 0) {
    let s = decodeURIComponent(data.result);
    if (s != "") {
      try {
        data.result = JSON.parse(s);
      } catch (err) {
        console.log('尝试解码后再转为json对象')
        data.result = JSON.parse(decodeURIComponent(s));
      }
    }
  } else if (name.indexOf("appGetTextValue") >= 0) {
    data.result = decodeURIComponent(data.result);
  }
  let i = _callback.count % maxCount;
  if (callbackFunction[i] != null) {
    callbackFunction[i](data);
    callbackFunction[i] = null;
  }
}

function initData() {
  document.removeEventListener("DOMContentLoaded", initData, false);
  
  // appGetParameter("userName", testParameter);
  // appGetParameter("token", testParameter);
  if (typeof (android) == 'undefined') {
    if (!/android/i.test(navigator.userAgent)) {
      // 适配鸿蒙 
      if (!/OpenHarmony/i.test(navigator.userAgent)) {
        osType = 1; //iOS 
        if (top.iOS) { 
          android = top.iOS; 
          androidReturnValue = top.iOSReturnValue; 
          recordCallBack = top.recordCallBack; }
      } else {
        osType = 2 // HarmonyOS 
        android = top.hosApi
        androidReturnValue = top.hosReturnValue
        recordCallBack = top.recordCallBack;
      }
    } else if (top != self) {
      android = top.android;
      androidReturnValue = top.androidReturnValue_self;
    }
  } else {
    android = top.android;
    androidReturnValue = top.androidReturnValue_self;
  }

  if (!debugMode && isSetFunc("switchScreenshot")) {
    if (location.href.indexOf("SignIn.html") != -1) {
      jsCallApp("switchScreenshot", {
        params: { enableFlag: "0" },
        callback: recordCallBack("switchScreenshot", null),
      });
    } else {
      jsCallApp("switchScreenshot", {
        params: { enableFlag: "-1" },
        callback: recordCallBack("switchScreenshot", null),
      });
    }
  }

  appGetVersionNumber(setVersionNumber);

  appGetUniqueID(setUniqueID);

  //每次登陆时记录登陆时间，登陆一小时之后强制用户退出并刷新数据。
  var lastUpdate = new Date().getTime();
  appSetParameter("lastRefresh", lastUpdate);
}

function recordCallBack(name, callback) {
  callbackCount++;
  var i = callbackCount % maxCount;
  while (callbackFunction[i] !== undefined && callbackFunction[i] != null) {
    i++;
  }
  callbackFunction[i] = callback;
  callbackCount = i;
  var s = encodeURIComponent(JSON.stringify({ name: name, count: i }));
  return s;
}

//iOSreturn返回值回调函数
function appReturnValue(data) {
  var _callback = JSON.parse(decodeURIComponent(data.callback));
  var name = _callback.name;

  if (name.indexOf("appGetValue") >= 0) {
    var s = decodeURIComponent(data.result);
    if (s != "") {
      data.result = JSON.parse(s);
    }
  } else if (name.indexOf("appGetTextValue") >= 0) {
    data.result = decodeURIComponent(data.result);
  }
  var i = _callback.count % maxCount;
  if (callbackFunction[i] != null) {
    callbackFunction[i](data);
    callbackFunction[i] = null;
  }
}

//插入一条大数据
function appSetBase64Img(code, value, callback) {
  var parameter = {
    params: {
      dataCode: code,
      dataContent: value,
    },
    callback: recordCallBack("appSetBase64Img", callback),
  };
  jsCallApp("setBase64Img", parameter);
}

//获取大数据
function appGetBase64Img(code, callBack) {
  var parameter = {
    params: {
      dataCode: code,
    },
    callback: recordCallBack("appGetBase64Img", callBack),
  };
  jsCallApp("getBase64Img", parameter);
}

//删除大数据
function appDeleteBase64Img(code, callBack) {
  var parameter = {
    params: { dataCode: code },
    callback: recordCallBack("appDeleteBase64Img", callBack),
  };
  jsCallApp("deleteBase64Img", parameter);
}

/*调用手机的原生方法*/
function jsCallApp(func, params) {
  if (osType==1) {
    if (params == undefined || params == null) {
      webkit.messageHandlers[func].postMessage(null);
    } else {
      webkit.messageHandlers[func].postMessage(JSON.stringify(params));
    }
  } else if(osType==2){
    if (params == undefined || params == null) {
      hosApi[func]()
    } else {
      hosApi[func](JSON.stringify(params))
    }
  } 
  else {
    if (params == undefined || params == null) {
      android[func]();
    } else {
      android[func](JSON.stringify(params));
    }
  }
}

function isSetFunc(func) {
  if (osType==1) {
    if (webkit.messageHandlers[func]) {
      return true;
    } else {
      return false;
    }
  } else if(osType==2){
    if (hosApi[func]) {
      return true
    } else {
      return false
    }
  } else {
    if (android[func]) {
      return true;
    } else {
      return false;
    }
  }
}

function appGetFuntionParam(code, value, callback) {
  if (debugMode) {
    localStorage[code] = value;
    var resultObj = {
      result: "",
      resultFlag: -1,
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var parameter = {
    params: { code: code, value: value },
    callback: recordCallBack("getFuntionParam", callback),
  };
  jsCallApp("getFuntionParam", parameter);
}

function setUniqueID(val) {
  _UniqueID = val.result.unique_id;

  //init 2
  appGetParameter("userID", setUserID);
}

function setUserID(val) {
  if (val.result.value) {
    _UserID = val.result.value;
  }
  //init 3
  appGetParameter("userName", setUserName);
}

function setUserName(val) {
  if (val.result.value) {
    _UserName = val.result.value;
  }
  //init 4
  appGetParameter("token", setToken);
}

function setToken(val) {
  if (val.result.value) {
    _Token = val.result.value;
  }
  appGetParameter("publicFlag", setPublicFLag);
}

function setPublicFLag(val) {
  if (val.result.value) {
    _PublicFlag = val.result.value;
  }
  if (onDataReady) {
    onDataReady();
  }
}

function setVersionNumber(val) {
  _VersionNumber = val.result.version_name;
}

//记录callback函数，返回时候调用
function recordCallBack_self(name, callback) {
  callbackCount++;
  var i = callbackCount % maxCount;
  var j = 0;
  while (callbackFunction[i] != undefined && callbackFunction[i] != null) {
    i++;
    i = i % maxCount;
    j++;
    if (j > maxCount) {
      alert("数值溢出！");
      //throw();
      break;
    }
  }
  callbackFunction[i] = callback;
  callbackCount = i;

  var s = encodeURIComponent(JSON.stringify({ name: name, count: i }));

  return s;
}

//android返回数据
function androidReturnValue_self(val) {
  var data = eval("(" + val + ")");
  var _callback = JSON.parse(decodeURIComponent(data.callback));
  var name = "";
  if (_callback) {
    name = _callback.name;
  }
  if (name.indexOf("appGetValue") >= 0) {
    var s = decodeURIComponent(data.result);
    if (s != "") {
      data.result = JSON.parse(s);
    }
  } else if (name.indexOf("appGetTextValue") >= 0) {
    var s = decodeURIComponent(data.result);
    data.result = s;
  }
  var i = 0;
  if (_callback) {
    i = _callback.count % maxCount;
  }
  if (callbackFunction[i] != null) {
    callbackFunction[i](data);
    callbackFunction[i] = null;
  }
}

//扫描二维码
function appScanQrcode(callback) {
  var parameter = {
    params: {},
    callback: recordCallBack("appScanQrcode", callback),
  };
  jsCallApp("scanQrcode", parameter);
}

//开始录音
function appBeginRecord(
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
  if (debugMode) {
    var newfileName =
      encodeURIComponent(fileName) +
      "_" +
      new Date().Format("yyyy_MM_dd_hh_mm_ss");
    var fileObj = {};
    fileObj.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
    fileObj.create_time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    fileObj.file_guid = "";
    fileObj.file_id = uuid();
    fileObj.file_name = fileName + ".amr";
    fileObj.file_path = fileName + ".amr";
    fileObj.file_size = "0.01MB";
    fileObj.file_type = "Audio";
    fileObj.fn_code = fnCode;
    fileObj.folder_code = folderCode;
    fileObj.instance_guid = instanceGuid;
    fileObj.lat = "31.135091";
    fileObj.lon = "121.362672";
    fileObj.needPrimaryValueWhenInsert = false;
    fileObj.remark = "";
    fileObj.system_id = "42";
    fileObj.upload_api_path = uploadAPIPath;
    fileObj.upload_status = "NotUpload";
    fileObj.user_id = userId;

    if (localStorage["allFileList_" + _UserID] == undefined) {
      localStorage["allFileList_" + _UserID] = encodeURIComponent(
        JSON.stringify([])
      );
    }
    var fileList = JSON.parse(
      decodeURIComponent(localStorage["allFileList_" + _UserID])
    );
    fileList.push(fileObj);
    localStorage["allFileList_" + _UserID] = encodeURIComponent(
      JSON.stringify(fileList)
    );

    var data = {};
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "appBeginRecord", count: 1 })
    );
    data.resultFlag = -1;
    data.result = { fileName: newfileName, confirm_value: "Y", remark: "" };
    if (callback != undefined) {
      callback(data);
    }
    return;
  }
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
    callback: recordCallBack("appBeginRecord", callback),
  };
  jsCallApp("beginRecord", parameter);
}

//停止录音
function appStopRecord(callback) {
  if (debugMode) {
    if (callback) callback({ resultFlag: -1 });
    return;
  }
  var parameter = {
    params: {},
    callback: recordCallBack("appStopRecord", callback),
  };
  jsCallApp("stopRecord", parameter);
}

//开始摄像
function appBeginCamera(
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
  if (debugMode) {
    var newfileName =
      encodeURIComponent(fileName) +
      "_" +
      new Date().Format("yyyy_MM_dd_hh_mm_ss");
    var fileObj = {};
    fileObj.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
    fileObj.create_time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    fileObj.file_guid = "";
    fileObj.file_id = uuid();
    fileObj.file_name = fileName + ".mp4";
    fileObj.file_path = fileName + ".mp4";
    fileObj.file_size = "0.01MB";
    fileObj.file_type = "Video";
    fileObj.fn_code = fnCode;
    fileObj.folder_code = folderCode;
    fileObj.instance_guid = instanceGuid;
    fileObj.lat = "31.135091";
    fileObj.lon = "121.362672";
    fileObj.needPrimaryValueWhenInsert = false;
    fileObj.remark = "";
    fileObj.system_id = "42";
    fileObj.upload_api_path = uploadAPIPath;
    fileObj.upload_status = "NotUpload";
    fileObj.user_id = userId;
    if (localStorage["allFileList_" + _UserID] == undefined) {
      localStorage["allFileList_" + _UserID] = encodeURIComponent(
        JSON.stringify([])
      );
    }
    var fileList = JSON.parse(
      decodeURIComponent(localStorage["allFileList_" + _UserID])
    );
    fileList.push(fileObj);
    localStorage["allFileList_" + _UserID] = encodeURIComponent(
      JSON.stringify(fileList)
    );
    var data = {};
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "appBeginCamera", count: 1 })
    );
    data.resultFlag = -1;
    data.result = { fileName: newfileName, confirm_value: "Y", remark: "" };
    if (callback != undefined) {
      callback(data);
    }
    return;
  } else {
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
      callback: recordCallBack("appBeginCamera", callback),
    };
    jsCallApp("beginCamera", parameter);
  }
}

//拍照
function appTakePhoto(
  userId,
  fileName,
  fnCode,
  instanceGuid,
  folderCode,
  uploadAPIPath,
  bizInfo,
  callback
) {
  if (debugMode) {
    var newfileName =
      encodeURIComponent(fileName) +
      "_" +
      new Date().Format("yyyy_MM_dd_hh_mm_ss");
    var fileObj = {};
    fileObj.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
    fileObj.create_time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    fileObj.file_guid = "";
    fileObj.file_id = uuid();
    fileObj.file_name = fileName + ".jpg";
    fileObj.file_path = fileName + ".jpg";
    fileObj.file_size = "0.01MB";
    fileObj.file_type = "Picture";
    fileObj.fn_code = fnCode;
    fileObj.folder_code = folderCode;
    fileObj.instance_guid = instanceGuid;
    fileObj.lat = "31.135091";
    fileObj.lon = "121.362672";
    fileObj.needPrimaryValueWhenInsert = false;
    fileObj.remark = "";
    fileObj.system_id = "42";
    fileObj.upload_api_path = uploadAPIPath;
    fileObj.upload_status = "NotUpload";
    fileObj.user_id = userId;
    if (localStorage["allFileList_" + _UserID] == undefined) {
      localStorage["allFileList_" + _UserID] = encodeURIComponent(
        JSON.stringify([])
      );
    }
    var fileList = JSON.parse(
      decodeURIComponent(localStorage["allFileList_" + _UserID])
    );
    fileList.push(fileObj);
    localStorage["allFileList_" + _UserID] = encodeURIComponent(
      JSON.stringify(fileList)
    );
    var data = {};
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "appTakePhoto", count: 1 })
    );
    data.resultFlag = -1;
    data.result = { fileName: newfileName, confirm_value: "Y", remark: "" };
    if (callback != undefined) {
      callback(data);
    }
    return;
  } else {
    var pictureMaxSize = "600";
    // 施工日志设置图片最大5120KB
    if (fnCode == "pm_construction_record") pictureMaxSize = "5120";
    var parameter = {
      params: {
        userId: userId,
        fileName: fileName,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
        uploadAPIPath: uploadAPIPath,
        bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
        pictureMaxSize: pictureMaxSize,
        statusname: "",
        fileGuid: "",
      },
      callback: recordCallBack("appTakePhoto", callback),
    };
    jsCallApp("takePhoto", parameter);
  }
}

//拍照2
function appTakePhotoV2(
  userId,
  fileName,
  fnCode,
  instanceGuid,
  folderCode,
  uploadAPIPath,
  bizInfo,
  callback
) {
  if (debugMode || !isSetFunc("takePhotoV2")) {
    appTakePhoto(
      userId,
      fileName,
      fnCode,
      instanceGuid,
      folderCode,
      uploadAPIPath,
      bizInfo,
      callback
    );
    return;
  }
  let parameter = {
    params: {
      userId: userId,
      fileName: fileName,
      fnCode: fnCode,
      instanceGuid: instanceGuid,
      folderCode: folderCode,
      uploadAPIPath: uploadAPIPath || "",
      bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      pictureMaxSize: "600",
      statusname: "",
      fileGuid: "",
    },
    callback: recordCallBack("appTakePhotoV2", callback),
  };

  jsCallApp("takePhotoV2", parameter);
}

//从手机相册选择图片
function appPickPhoto(
  userId,
  fileName,
  fnCode,
  instanceGuid,
  folderCode,
  uploadAPIPath,
  bizInfo,
  callback
) {
  if (debugMode) {
    if (callback) callback({ resultFlag: "-1" });
    return;
  }
  if (!isSetFunc("pickPhoto")) {
    appAlert("请先升级app");
    return;
  }
  let params = {
    params: {
      userId,
      fileName,
      fnCode,
      instanceGuid,
      folderCode,
      uploadAPIPath: uploadAPIPath || "",
      bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      pictureMaxSize: "600",
      statusname: "",
      fileGuid: "",
    },
    callback: recordCallBack("appPickPhoto", callback),
  };
  jsCallApp("pickPhoto", params);
}

//直播
function appOnlivePlay(
  userId,
  fnCode,
  constructionRecordId,
  devNo,
  cameraNum,
  uploadAPIPath,
  bizInfo,
  callback
) {
  var parameter = {
    params: {
      userId: userId,
      fnCode: fnCode,
      constructionRecordId: constructionRecordId,
      devNo: devNo,
      cameraNum: cameraNum,
      uploadAPIPath: uploadAPIPath,
      bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
    },
    callback: recordCallBack("appOnlivePlay", callback),
  };
  jsCallApp("onlivePlay", parameter);
}

//签字
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

//获取文件列表
function appGetFileList(userId, fnCode, instanceGuid, folderCode, callback) {
  if (debugMode) {
    var fileList = [];
    if (localStorage["allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(
        decodeURIComponent(localStorage["allFileList_" + _UserID])
      );
    }
    var tempFileList = [];
    for (var i = 0; i < fileList.length; i++) {
      var tempFile = fileList[i];
      //if (tempFile.fn_code == fnCode && tempFile.instance_guid == instanceGuid && tempFile.upload_status == "NotUpload") {
      if (
        tempFile.fn_code == fnCode &&
        tempFile.instance_guid == instanceGuid
      ) {
        tempFileList.push(tempFile);
      }
    }
    var data = {};
    data.result = tempFileList;
    data.resultFlag = -1;
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "appGetFileList", count: 1 })
    );
    if (callback != undefined) {
      callback(data);
    }
    return;
  } else {
    var parameter = {
      params: {
        userId: userId,
        fnCode: fnCode,
        instanceGuid: instanceGuid,
        folderCode: folderCode,
      },
      callback: recordCallBack("appGetFileList", callback),
    };
    jsCallApp("getFileList", parameter);
  }
}

//获取全部文件
function appGetAllFileList(userId, callback) {
  if (debugMode) {
    var fileList = [];
    if (localStorage["allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(
        decodeURIComponent(localStorage["allFileList_" + _UserID])
      );
    }
    var tempFileList = [];
    for (var i = 0; i < fileList.length; i++) {
      var tempFile = fileList[i];
      if (tempFile.upload_status == "NotUpload") {
        tempFileList.push(tempFile);
      }
    }
    var data = {};
    data.result = tempFileList;
    data.resultFlag = -1;
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "appGetFileList", count: 1 })
    );
    if (callback != undefined) {
      callback(data);
    }
    return;
  } else {
    var parameter = {
      params: { userId: userId },
      callback: recordCallBack("appGetAllFileList", callback),
    };
    if (!debugMode) {
      jsCallApp("getAllFile", parameter);
    }
  }
}

Array.prototype.indexOf = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};
Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

//删除某一个文件
function appDeleteFile(fileName, callback) {
  if (debugMode) {
    var fileList = [];
    if (localStorage["allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(
        decodeURIComponent(localStorage["allFileList_" + _UserID])
      );
    }
    for (var i = 0; i < fileList.length; i++) {
      var fileItem = fileList[i];
      if (fileList[i].file_name == fileName) {
        fileList.remove(fileItem);
      }
    }
    localStorage["allFileList_" + _UserID] = encodeURIComponent(
      JSON.stringify(fileList)
    );
    var data = {};
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "appDeleteFile", count: 1 })
    );
    data.resultFlag = -1;
    data.result = { confirm_value: "Y", remark: "" };
    if (callback != undefined) {
      callback(data);
    }
    return;
  } else {
    var parameter = {
      params: { fileName: fileName },
      callback: recordCallBack("appDeleteFile", callback),
    };
    jsCallApp("deleteFile", parameter);
  }
}

//上传单个文件
function appUploadFileName(tokenId, fileName, callback) {
  appGetAllFileList(_UserID, data => {
    if (data.resultFlag == -1) {
      let files = data.result.filter(file => file.upload_status == "NotUpload");
      for (const file of files) {
        let size = parseFloat(file.file_size);
        if (file.file_name == fileName && (isNaN(size) || size == 0)) {
          if (callback) callback({
            resultFlag: 0,
            errMsg: `${decodeURIComponent(fileName)}大小为0，不能上传`,
          });
          return;
        }
      }
      var parameter = {
        "params": {
          "tokenId": tokenId,
          "fileName": fileName
        },
        "callback": recordCallBack("fileName", callback)
      };
      jsCallApp('uploadFileName', parameter);
    }
    else {
      if (callback) callback({
        resultFlag: 0,
        errMsg: "文件查找失败",
      });
    }
  });
}

//上传文件列表
function appUploadFile(
  tokenId,
  userId,
  fnCode,
  instanceGuid,
  folderCode,
  callback
) {
  var parameter = {
    params: {
      tokenId: tokenId,
      userId: userId,
      fnCode: fnCode,
      instanceGuid: instanceGuid,
      folderCode: folderCode,
    },
    callback: recordCallBack("appUploadFile", callback),
  };
  if (osType == 1 || top.iOS) {
    jsCallApp("uploadFil", parameter);
    //android.uploadFil(JSON.stringify(parameter));
  } else {
    jsCallApp("uploadFile", parameter);
    //android.uploadFile(JSON.stringify(parameter));
  }
}

//上传全部文件
function appUploadAllFile(tokenId, userId, callback) {
  var parameter = {
    params: { tokenId: tokenId, userId: userId },
    callback: recordCallBack("appUploadAllFile", callback),
  };
  //android.uploadAllFile(JSON.stringify(parameter));
  jsCallApp("uploadAllFile", parameter);
}

//查看某一文件
function appViewFile(fileName, callback, folderCode) {
  var parameter = {
    params: { fileName: fileName, folderCode: folderCode },
    callback: recordCallBack("appViewFile", callback),
  };

  //android.viewFile(JSON.stringify(parameter));
  jsCallApp("viewFile", parameter);
}

//获取当前终端位置坐标
function appGetGPS(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        lon: 121.404469 + Math.floor(Math.random() * 1000) / 10000,
        lat: 31.137021 + Math.floor(Math.random() * 1000) / 10000,
      },
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }

  var parameter = {
    params: {},
    callback: recordCallBack("appGetGPS", callback),
  };
  //android.getGPS(JSON.stringify(parameter));
  jsCallApp("getGPS", parameter);
}

//插入一条本地数据
function appSetItem(code, value) {
  try {
    localStorage.setItem(code, JSON.stringify(value));
    localStorage.setItem(code + "_itemtime", new Date().getTime());
  } catch (e) {
    var now = new Date().getTime();
    for (lKey in localStorage) {
      if (lKey.indexOf("_itemtime") > -1) {
        if (parseInt(localStorage[lKey]) - now > 86400000) {
          appRemoveItem(lKey.substring(0, lKey.indexOf("_itemtime")));
        }
      }
    }
    appSetItem(code, value);
  }
}

//获取一条本地数据
function appGetItem(code) {
  var value = localStorage.getItem(code);
  try {
    value = JSON.parse(value);
  } catch (e) {}
  return value;
}

//删除一条本地数据
function appRemoveItem(code) {
  localStorage.removeItem(code);
  localStorage.removeItem(code + "_itemtime");
}

//获取Json数据
function appGetValue(userId, code, callback) {
  if (debugMode) {
    var r = localStorage[code + userId] || "";
    try {
      r = JSON.parse(r);
    } catch (e) {}
    var resultObj = {
      result: r,
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }
  var parameter = {
    params: { userId: userId, code: code },
    callback: recordCallBack("appGetValue." + code, callback),
  };
  jsCallApp("getValue", parameter);
}

function appGetTextValue(userId, code, callback) {
  if (debugMode) {
    var resultObj = {
      result: localStorage[code + userId],
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }
  var parameter = {
    params: { userId: userId, code: code },
    callback: recordCallBack("appGetTextValue." + code, callback),
  };
  jsCallApp("getValue", parameter);
}

//获取统计数据
function appGetStatistics(userId, code, callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        statistics: localStorage[code + userId + "s"] || 0,
      },
      resultFlag: -1,
    };
    setTimeout(function () {
      callback(resultObj);
    }, 1);
    return;
  }
  var parameter = {
    params: { userId: userId, code: code },
    callback: recordCallBack("appGetStatistics", callback),
  };
  jsCallApp("getStatistics", parameter);
}

window.alert = function (name) {
  var iframe = document.createElement("IFRAME");
  iframe.style.display = "none";
  iframe.setAttribute("src", "data:text/plain,");
  document.documentElement.appendChild(iframe);
  window.frames[0].window.alert(name);
  iframe.parentNode.removeChild(iframe);
};

window.confirm = function (name) {
  var iframe = document.createElement("IFRAME");
  iframe.style.display = "none";
  iframe.setAttribute("src", "data:text/plain,");
  document.documentElement.appendChild(iframe);
  var result = window.frames[0].window.confirm(name);
  iframe.parentNode.removeChild(iframe);
  return result;
};

//对话框确认
function appConfirm(message, callback) {
  if (debugMode) {
    var isConfirm = confirm(message);
    callback({
      result: { confirm_value: isConfirm ? "Y" : "N" },
      resultFlag: -1,
    });
    return;
  }
  var parameter = {
    params: { message: message },
    callback: recordCallBack("appConfirm", callback),
  };
  jsCallApp("confirm", parameter);
}

function showOverLay() {
  if ($(".overLay").length == 0) {
    $("body").append('<div class="overLay"></div>');
  }
  $(".overLay").css("display", "block");
}

function hideOverLay() {
  $(".overLay").css("display", "none");
}

//获得唯一ID
function appGetUniqueID(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        unique_id: "debugMode862913031759823111",
      },
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }
  var parameter = {
    params: {},
    callback: recordCallBack("appGetUniqueID", callback),
  };
  jsCallApp("getUniqueID", parameter);
}

//获得最新版本号
function appGetVersionNumber(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        version_name: 1.8,
      },
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }
  var parameter = {
    params: {},
    callback: recordCallBack("appGetVersionNumber", callback),
  };
  jsCallApp("getVersionName", parameter);
}

//插入一条数据
function appSetValue(
  userId,
  code,
  value,
  statistics,
  last_update_date,
  callback
) {
  if (debugMode) {
    localStorage[code + userId] = value;
    localStorage[code + userId + "s"] = statistics;
    var resultObj = {
      result: "",
      resultFlag: -1,
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }

  value = encodeURIComponent(value);
  var parameter = {
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
}

//检查是否有网络
function appGetNetworkState(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        network_state: -1,
      },
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }
  var parameter = {
    params: {},
    callback: recordCallBack("appGetNetworkState", callback),
  };
  jsCallApp("getNetworkState", parameter);
}

//显示缓冲
var _IsWaiting = false;

function appShowWaiting(seconds, msg) {
  if (seconds == undefined) {
    seconds = 30;
  }
  setTimeout(ajaxTimeOut, seconds * 1000);
  _IsWaiting = true;
  $("#loadingDiv").css("display", "block");
  if (msg != undefined) {
    $("#msg").html(msg);
  }
}

//隐藏缓冲
function appHideWaiting() {
  // if (!_IsWaiting) {
  //     return;
  // }
  _IsWaiting = false;
  $("#loadingDiv").css("display", "none");
}

//终端加载中。
function androidShowWaiting(message, seconds) {
  if (debugMode) {
    appShowLoading(seconds, message);
    return;
  }

  if (seconds == undefined) {
    seconds = 30;
  }
  if (message == undefined) {
    message = "数据加载中...";
  }
  setTimeout(waitingTimeOut, seconds * 1000);
  _IsWaiting = true;
  var parameter = { params: { message: message }, callback: "" };
  jsCallApp("showWaiting", parameter);
}

//隐藏终端加载中。。
function androidHideWaiting(callback) {
  if (debugMode) {
    appHideLoading();
    if (callback != null) {
      callback();
    }
    return;
  }
  if (!_IsWaiting) {
    return;
  }
  _IsWaiting = false;
  var parameter = { callback: recordCallBack("androidHidWaiting.", callback) };
  jsCallApp("hideWaiting", parameter);
}

function waitingTimeOut() {
  if (_IsWaiting) {
    androidHideWaiting();
    appAlert("加载数据超时。");
  }
}

function ajaxTimeOut() {
  if (_IsWaiting) {
    $("#loadingDiv").css("display", "none");
    appAlert("加载数据超时。");
    if (window.location.href.indexOf("SS.html") !== -1) {
      appExitToYJK();
    }
  }
}

//多个参数获取数据
function appSetRows() {
  var parameter = {
    params: { userId: userId, tableName: tableName, rows: rowsJson },
    callback: recordCallBack("appSetRows", callback),
  };
  jsCallApp("setRows", parameter);
}

//
function appGetRows() {
  var parameter = {
    params: { userId: userId, tableName: tableName },
    callback: recordCallBack("appGetRows", callback),
  };
  jsCallApp("getRows", parameter);
}

//设置参数
function appSetParameter(code, value, callback) {
  if (debugMode) {
    localStorage[code] = value;
    var resultObj = {
      result: "",
      resultFlag: -1,
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var parameter = {
    params: { code: code, value: value },
    callback: recordCallBack("appSetParameter", callback),
  };
  jsCallApp("setParameter", parameter);
}

//获取参数
function appGetParameter(code, callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        value: localStorage[code],
      },
      resultFlag: -1,
    };
    callback(resultObj);
    return;
  }

  var parameter = {
    params: { code: code },
    callback: recordCallBack("appGetParameter", callback),
  };
  jsCallApp("getParameter", parameter);
}

//弹窗提醒
function appAlert(message) {
  if (debugMode) {
    alert(message);
    return;
  }
  androidHideWaiting();
  var parameter = {
    params: { message: message },
    callback: recordCallBack("appAlert", null),
  };
  jsCallApp("alert", parameter);
}

//插入一条数据
function appSetTable(
  userId,
  tbName,
  keyValue,
  colName,
  colValue,
  showOrder,
  colNameValues,
  lastUpdateDate,
  callback
) {
  if (debugMode) {
    localStorage[tbName + "|" + keyValue + "|" + userId] = JSON.stringify({
      user_id: userId,
      tb_name: tbName,
      key_value: keyValue,
      col_name: colName,
      col_value: colValue,
      show_order: showOrder,
      col_name_values: colNameValues,
      last_update_date: lastUpdateDate,
    });
    var resultObj = {
      result: "",
      resultFlag: -1,
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var parameter = {
    params: {
      userId: userId,
      tbName: tbName,
      keyValue: keyValue,
      colName: colName,
      colValue: colValue,
      showOrder: showOrder,
      colNameValues: colNameValues,
      lastUpdateDate: lastUpdateDate,
    },
    callback: recordCallBack("appSetTable", callback),
  };
  jsCallApp("setTable", parameter);
}

//获取一条数据
function appGetTable(userId, tbName, keyValue, callback) {
  if (debugMode) {
    var r = localStorage[tbName + "|" + keyValue + "|" + userId] || {};
    try {
      r = JSON.parse(r);
    } catch (e) {}
    var resultObj = {
      result: r,
      resultFlag: -1,
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var parameter = {
    params: { userId: userId, tbName: tbName, keyValue: keyValue },
    callback: recordCallBack("appGetTable", callback),
  };
  jsCallApp("getTable", parameter);
}

//删除一条记录
function appDeleteTable(userId, tbName, callback) {
  if (debugMode) {
    localStorage.removeItem(tbName + "|" + keyValue + "|" + userId);
    var resultObj = {
      result: "",
      resultFlag: -1,
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var parameter = {
    params: { userId: userId, tbName: tbName },
    callback: recordCallBack("appDeleteTable", callback),
  };
  jsCallApp("deleteTable", parameter);
}

//停电时退出系统操作
function appExitSystem() {
  if (_UserID == 2170) {
    appSetParameter("guestInfo", "", null);
  }
  appSetParameter("userName", "", null);
  appSetParameter("userID", "", null);
  appSetParameter("token", "", clearToken);
  //android.exitSystem();
  jsCallApp("exitSystem");
  if (top.iOS || osType) {
    window.location.href = "./SignIn.html";
  }
}

//更新页面文件
function appUpdatePageFile() {
  //android.updatePageFile();
  jsCallApp("updatePageFile");
}

//终端网络状态变化时终端调用的接口，可能由3G到wifi切换，但仍返回-1
function networkStateChange(val) {
  var data = eval("(" + val + ")");
  var networkState = data.network_state;
  if (networkState == "-1") {
    //appAlert('网络恢复正常');
  } else {
    //appAlert('网络异常');
  }
}

function appShowFile(url, callback) {
  var parameter;
  if (callback == undefined) {
    parameter = { params: { url: url }, callback: null };
  } else {
    parameter = {
      params: { url: url },
      callback: recordCallBack("showFile", callback),
    };
  }
  jsCallApp("showFile", parameter);
}

function getTemp() {
  var date = new Date();
  var temp = "temp=" + date.getTime();
  return temp;
}

function getTempAndCallback(callbackFuncName) {
  callbackFuncName = callbackFuncName ? callbackFuncName + "&=?" : "?";
  return getTemp() + "&callback=" + callbackFuncName;
}

/// 以下功能新泰原生暂未支持

// 智能取照
function appSmartTakePicture(
  userId,
  fileType,
  fnCode,
  instanceGuid,
  folderCode,
  uploadAPIPath,
  bizInfo,
  callback
) {
  var pictureMaxSize = "600";
  // 施工日志设置图片最大5120KB
  if (fnCode == "pm_construction_record") pictureMaxSize = "5120";
  var parameter = {
    params: {
      userId: userId,
      fileType: fileType,
      fnCode: fnCode,
      instanceGuid: instanceGuid,
      folderCode: folderCode,
      uploadAPIPath: uploadAPIPath,
      bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      pictureMaxSize: pictureMaxSize,
      statusname: "",
      fileGuid: "",
    },
    callback: recordCallBack("appSmartTakePicture", callback),
  };

  if (isSetFunc("smartTakePicture")) {
    jsCallApp("smartTakePicture", parameter);
  } else {
    appAlert("您的app可能不是最新版本，请更新。");
  }
}

function appGetAudioCommandConfig() {
  var parameter = {
    params: { token: _Token },
    callback: recordCallBack("getAudioCommandConfig", null),
  };
  jsCallApp("getAudioCommandConfig", parameter);
}

function appPlayAudio(
  fileGuid,
  fileName,
  playStartCallback,
  playCompleteCallback
) {
  var parameter = {
    params: { fileGuid: fileGuid, fileName: fileName },
    playStartCallback: recordCallBack("playAudioStart", playStartCallback),
    playCompleteCallback: recordCallBack(
      "playAudioComplete",
      playCompleteCallback
    ),
  };
  jsCallApp("playAudio", parameter);
}

function appPauseAudio(callback) {
  var parameter = { callback: recordCallBack("pauseAudio", callback) };
  jsCallApp("pauseAudio", parameter);
}

function appFaceRegister(pRegisterType) {
  var parameter = { params: { registerType: pRegisterType } };
  jsCallApp("faceRegister", parameter);
}

function appPhoneRecognize(
  pUserType,
  pUserId,
  pInstanceGuid,
  pDeviceNo,
  dist,
  callback
) {
  if (!isSetFunc("phoneRecognize")) {
    appAlert("请先更新app。");
    return;
  }

  var parameter = {
    params: {
      userType: pUserType,
      userId: pUserId,
      instanceGuid: pInstanceGuid,
      deviceNo: pDeviceNo,
      token: _Token,
      dist: dist,
    },
    callback: recordCallBack("phoneRecognize", callback),
  };
  jsCallApp("phoneRecognize", parameter);
}

/**
 * 新增关于视屏许可的相关方法
 */

function loginToMessageServer(username, callback) {
  var parameter = {
    params: { userName: username, heartBeatInterval: "10" },
    callback: recordCallBack("loginToMessageServer", callback),
  };
  jsCallApp("loginToMessageServer", parameter);
}

function sendVideoCallRequest(
  userid,
  recordid,
  subprojectcode,
  subprojectname,
  constructionusername,
  callback
) {
  var parameter = {
    callback: recordCallBack("sendVideoCallRequest", callback),
    params: {
      userId: userid,
      constructionRecordId: recordid,
      subProjectCode: subprojectcode,
      subProjectName: subprojectname,
      constructionUser: constructionusername,
    },
  };
  jsCallApp("sendVideoCallRequest", parameter);
}

function sendMessage(params, userId, msgType, callback) {
  params.userId = userId;
  params.msgType = msgType;
  var parameter = {
    callback: recordCallBack("sendMessage", callback),
    params: params,
  };
  jsCallApp("sendMessage", parameter);
}

function setGPSAutoNotify() {
  if (isSetFunc("setGPSAutoNotify")) jsCallApp("setGPSAutoNotify");
}

function setGPSLocSpan() {
  if (isSetFunc("setGPSLocSpan")) jsCallApp("setGPSLocSpan");
}

function appExitToYJK() {
  if (isSetFunc("exitToYJK")) {
    jsCallApp("exitToYJK");
    return true;
  }
  return false;
}

function appNewOnlivePlay(
  isOnline,
  videoSource,
  urlData,
  fnCode,
  cameraName,
  bizInfo,
  callback
) {
  var parameter = {
    params: {
      isOnline: isOnline,
      videoSource: videoSource,
      urlData: urlData,
      userId: _UserID,
      token: _Token,
      fnCode: fnCode,
      cameraName: cameraName,
      bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
      unifyexamId: urlData.unifyexamId,
    },
    callback: recordCallBack("appNewOnlivePlay", callback),
  };
  jsCallApp("vlcPlay", parameter);
}

function appLowestVersion() {
  return {
    iOSLowestVer: "2.1.0",
    YJKiOSLowestVer: "1.3",
    iOSChannel: 1,
  };
}

//播放多个视频
function showMultiVideo(videos, callback) {
  var parameter = {
    callback: recordCallBack("showMultiVideo", callback),
    params: {
      videos: videos,
    },
  };
  jsCallApp("showMultiVideo", parameter);
}

function stopMultiVideo(callback) {
  var parameter = {
    callback: recordCallBack("stopMultiVideo", callback),
  };
  jsCallApp("stopMultiVideo", parameter);
}

function dataURLtoFile(dataurl, filename) {
  //将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

var _fileItem = {};

function erowUploadFile(
  url,
  params,
  fileId,
  partName,
  fileName,
  filePath,
  mimeType,
  callback
) {
  if (debugMode) {
    var fileList = [];
    if (localStorage["allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(
        decodeURIComponent(localStorage["allFileList_" + _UserID])
      );
    }
    var fileCount = 0;
    var successCount = 0;
    for (var i = 0; i < fileList.length; i++) {
      var fileItem = fileList[i];
      if (fileList[i].file_name == fileName) {
        fileCount++;
      }
    }
    for (var i = 0; i < fileList.length; i++) {
      _fileItem = fileList[i];
      if (
        fileList[i].file_name == fileName &&
        fileList[i].upload_status == "NotUpload"
      ) {
        //上传文件
        var File = null;
        if (_fileItem.file_type == "Picture") {
          var imgBase64 =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAABnWAAAZ1gEY0crtAAAADklEQVR42mP4DwYMEAoAU7oL9YXEbhEAAAAASUVORK5CYII=";
          File = dataURLtoFile(imgBase64, _fileItem.file_name);
        }
        if (_fileItem.file_type == "Audio") {
          var amrBase64 =
            "data:audio/amr;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAABnWAAAZ1gEY0crtAAAADklEQVR42mP4DwYMEAoAU7oL9YXEbhEAAAAASUVORK5CYII=";
          File = dataURLtoFile(amrBase64, _fileItem.file_name);
        }
        if (_fileItem.file_type == "Video") {
          var videoBase64 =
            "data:video/mp4;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAABnWAAAZ1gEY0crtAAAADklEQVR42mP4DwYMEAoAU7oL9YXEbhEAAAAASUVORK5CYII=";
          File = dataURLtoFile(videoBase64, _fileItem.file_name);
        }
        var formData = new FormData();
        formData.append("file", File);
        for (var val in params) {
          formData.append(val, params[val]);
        }
        $.ajax({
          url: url,
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          async: false,
          success: function (rData) {
            if (rData.type) {
              if (rData.type == -1) {
                successCount++;
                _fileItem.file_guid = rData.data;
                _fileItem.upload_status = "Uploaded";
                appDeleteFile(_fileItem.file_name, function (rData) {
                  var _fileList = JSON.parse(
                    decodeURIComponent(localStorage["allFileList_" + _UserID])
                  );
                  _fileList.push(_fileItem);
                  localStorage["allFileList_" + _UserID] = encodeURIComponent(
                    JSON.stringify(_fileList)
                  );
                });
              }
            }
          },
          error: function (rData) {},
        });
      }
    }

    var data = {};
    data.callback = encodeURIComponent(
      JSON.stringify({ name: "erowUploadFile", count: 1 })
    );
    data.resultFlag = -1;
    data.errMsg = "";
    data.result = { success_count: successCount };
    if (callback != undefined) {
      callback(data);
    }
    return;
  } else {
    let parameter = {
      callback: recordCallBack("erowUploadFile", callback),
      params: {
        url,
        params,
        file: {
          fileId: fileId + "",
          partName,
          fileName,
          filePath,
          mimeType,
        },
      },
    };
    jsCallApp("erowUploadFile", parameter);
  }
}

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}
