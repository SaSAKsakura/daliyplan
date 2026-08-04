;
(function () {
  "use strict";
  const debugMode = false;
  const osType = !/android/i.test(navigator.userAgent) ? "iOS" : "android";
  let osColorScheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches || /ColorScheme\/Dark/i.test(navigator.userAgent)) ? 'dark':'light'
  let erowStr = "";
  for (let i = 0; i < 10; i++) {
    erowStr += "erow";
  }

  String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
  }

  const getVersionNumber = function (callback) {
    let resultObj = {
      result: {
        version_name: htmlVersion,
      },
      resultFlag: -1
    }
    if (callback) callback(resultObj);
  }

  const getUniqueID = function (callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          unique_id: "debugMode862913031759823111"
        },
        resultFlag: -1
      };
      if (callback) callback(resultObj);
      return;
    }
    wx.invoke("ext_DeviceInfo_GetInfo", {
      data: {}
    }, function (res) {
      console.log("当前设备信息: ", res);
      let _unique_id = "igw_" + new Date().getTime();
      try {
        if (res.err_msg.toLowerCase() === 'ext_DeviceInfo_GetInfo:ok'.toLowerCase()) {
          if (res.data == undefined) { // 成功处理
            _unique_id = "igw" + res.deviceUUID;
          } else if (typeof (res.data) == "object") { // 处理ios15特殊
            _unique_id = "igw" + res.data.deviceUUID;
          }
        }
      } catch (ex) {}

      let resultObj = {
        result: {
          unique_id: _unique_id
        },
        resultFlag: -1
      };
      if (callback) callback(resultObj);
    });
  }

  const setParameter = function (code, value, callback) {
    let resultObj = {}
    if (debugMode) {
      localStorage[appCode + "_" + code] = value;
      resultObj = {
        result: "",
        resultFlag: -1
      };
      if (callback) callback(resultObj);
      return;
    }
    wx.invoke("ext_DataCache_SaveInfo", {
      data: {
        key: appCode + "_" + code,
        message: value + erowStr
      }
    }, res => {
      //console.log("结束存储数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
      if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
        resultObj.resultFlag = -1;
      } else if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
        //失败处理
      } else if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
        //取消处理
      }
      if (callback) callback(resultObj);
    });
  }

  const getParameter = function (code, callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          value: localStorage[appCode + "_" + code],
        },
        resultFlag: -1
      };
      callback(resultObj);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + code
      }
    }, res => {
      //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        resultObj.result = {};
        resultObj.result.value = res.result.replaceAll(erowStr, "");
      } else if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
      } else if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
      }
      if (callback) callback(resultObj);
    });
  }

  const setValue = function (userId, code, value, statistics, last_update_date, callback) {
    if (debugMode) {
      localStorage[appCode + "_" + code + userId] = JSON.stringify(value);
      localStorage[appCode + "_" + code + userId + 's'] = statistics;
      localStorage[appCode + "_" + code + userId + "last_update_date"] = last_update_date;
      let resultObj = {
        result: "",
        resultFlag: -1
      };
      if (callback != null) callback(resultObj);
      return;
    }

    let resultObj = {};
    resultObj.resultFlag = 0;
    let valueObj = {};
    valueObj.value = value;
    valueObj.statistics = statistics;
    valueObj.last_update_date = new Date().Format("yyyy/MM/dd hh:mm:ss");
    wx.invoke("ext_DataCache_SaveInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code,
        message: encodeURIComponent(JSON.stringify(valueObj)) + erowStr
      }
    }, res => {
      if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
        resultObj.resultFlag = -1;
      }
      if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
        //失败处理
      }
      if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
        //取消处理
      }
      if (callback) callback(resultObj);
    });
  }

  const getValue = function (userId, code, callback) {
    if (debugMode) {
      let r = localStorage[appCode + "_" + code + userId] || "";
      try {
        r = JSON.parse(r);
      } catch (e) {}
      let resultObj = {
        result: r,
        resultFlag: -1
      };
      if (callback != null) callback(resultObj);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //console.log("开始获取数据：" + code + "," + new Date().getTime());
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    }, res => {
      // console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        let result = res.result.replaceAll(erowStr, "");
        try {
          resultObj.result = JSON.parse(decodeURIComponent(result));
          try {
            resultObj.result = JSON.parse(resultObj.result.value);
          } catch (err) {
            resultObj.result = resultObj.result.value;
          }
        } catch (err) {
          resultObj.result = decodeURIComponent(result);
        }
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
      }
      if (callback) callback(resultObj);
    });
  }

  const getValueUpdateDate = function (userId, code, callback) {
    if (debugMode) {
      let r = localStorage[appCode + "_" + code + userId + "last_update_date"] || "";
      try {
        r = JSON.parse(r);
      } catch (e) {}
      let resultObj = {
        result: r,
        resultFlag: -1
      };
      if (callback) callback(resultObj);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    }, res => {
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        let result = res.result.replaceAll(erowStr, "");
        try {
          resultObj.result = JSON.parse(decodeURIComponent(result)).last_update_date;
        } catch (ex) {
          resultObj.result = result;
        }
      } else if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
      } else if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
      }
      if (callback) callback(resultObj);
    });
  }

  const deleteValue = function (userId, code, callback) {
    if (debugMode) {
      delete localStorage[appCode + "_" + code + userId];
      delete localStorage[appCode + "_" + code + userId + 's'];
      delete localStorage[appCode + "_" + code + userId + "last_update_date"];
      let resultObj = {
        result: "",
        resultFlag: -1
      };
      if (callback) callback(resultObj);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    wx.invoke("ext_DataCache_RemoveInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    }, res => {
      //console.log("结束删除数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
      if (res.err_msg === 'ext_DataCache_RemoveInfo:ok') { // 成功处理
        resultObj.resultFlag = -1;
      } else if (res.err_msg === 'ext_DataCache_RemoveInfo:fail') { // 失败处理

      } else if (res.err_msg === 'ext_DataCache_RemoveInfo:cancel') { // 取消处理
      }
      if (callback) callback(resultObj);
    });
  }

  // 获取支付页面
  const gotoPay = function () {
    wx.invoke("multiWindows_startWidget", {
      agentId: ismAgentId,
      window: {
        windowId: 'windowId',
        url: 'zipapp://appid.' + ismAgentId + '/index.html?mode=pay&appId=' + AppId,
        openType: '0',
        showAppBar: 'false'
      }
    }, res => {
      console.log(res);
    })
  }
  // 前往个人明细页面
  const gotoInfo = function () {
    wx.invoke("multiWindows_startWidget", {
      agentId: ismAgentId,
      window: {
        windowId: 'windowId',
        url: 'zipapp://appid.' + ismAgentId + '/index.html?mode=info&appId=' + AppId,
        openType: '0',
        showAppBar: 'false'
      }
    }, res => {
      console.log(res);
    })
  }
  
  const gotoISM = function (callback) {
    wx.invoke("multiWindows_startWidget", {
      agentId: ismAgentId,
      window: {
        windowId: 'ism',
        url: 'zipapp://appid.' + ismAgentId + '/index.html',
        openType: '0',
        showAppBar: 'false'
      }
    }, res => {
      console.log(res);
      callback(res);
    })
  }

  // 打开客饭券页面
  const gotoISMTicket = function (tkNo, qrData, ts, dig,appId,callback) {
    wx.invoke("multiWindows_startWidget", {
      agentId: ismAgentId,
      window: {
        windowId: 'ism',
        url: 'zipapp://appid.1001687/index.html?mode=ticket&tkNo='+ tkNo +'&qrData='+ qrData +'&ts='+ts+'&dig=' + dig +'&appId=' + appId,
        openType: '0',
        showAppBar: 'false'
      }
    }, res => {
      console.log(res);
      callback(res);
    })
  }

  // 切换横竖屏
  const screenControlDirection = function (e) {
    if (debugMode) {
      console.log(e);
      return;
    }
    wx.invoke("ext_screenControl_direction", {
        data: {
          orientation: e
        }
      },
      function (res) {
        console.log(JSON.stringify(res))
        if (res.error_msg === 'ext_screenControl_direction:ok') {
          //成功处理
          console.log(res.result);
        }
        if (res.error_msg === 'ext_screenControl_direction:fail') {
          //失败处理
          console.log(res.result);
        }
        if (res.error_msg === 'ext_screenControl_direction:cancel') {
          //取消处理
          console.log(res.result);
        }
      })
  }
  
  //获取统计数据
  const getStatistics = function (userId, code, callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          statistics: localStorage[appCode + "_" + code + userId + 's'] || 0
        },
        resultFlag: -1
      }
      if (callback) callback(resultObj);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //console.log("开始获取数据：" + code + "," + new Date().getTime() );
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    }, res => {
      //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        resultObj.result = {};
        //判断是否是json字符串
        let result = res.result.replaceAll(erowStr, "");
        try {
          resultObj.result = JSON.parse(decodeURIComponent(result)).statistics;
        } catch (error) {
          resultObj.result = result;
        }
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
      }
      if (callback) callback(resultObj)
    });
  }

  //获取全部文件
  const getAllFiles = function (userId, callback) {
    if (debugMode) {
      let fileList = [];
      if (localStorage[appCode + "_" + "allFileList_" + window.erUser ? erUser.userId : _UserID] != undefined) {
        fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + window.erUser ? erUser.userId : _UserID]));
      }
      let tempFileList = [];
      for (let i = 0; i < fileList.length; i++) {
        let tempFile = fileList[i];
        if (tempFile.upload_status == "NotUpload") {
          tempFileList.push(tempFile);
        }
      }
      let data = {};
      data.result = tempFileList;
      data.resultFlag = -1;
      data.callback = encodeURIComponent(JSON.stringify({
        "name": "appGetFileList",
        "count": 1
      }));
      if (callback) callback(data);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_appGetAllFileList"
      }
    }, res => {
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        let result = res.result.replaceAll(erowStr, "");
        let fileList = [];
        try {
          fileList = JSON.parse(decodeURIComponent(result));
        } catch (ex) {
          fileList = result || [];
        } finally {
          let tempFileList = [];
          for (let i = 0; i < fileList.length; i++) {
            let tempFile = fileList[i];
            if (tempFile.upload_status == "NotUpload") {
              tempFileList.push(tempFile);
            }
          }
          resultObj.result = tempFileList;
        }
        if (result == "") resultObj.result = [];
      } else if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
        resultObj.resultFlag = -1;
        resultObj.result = [];
      } else if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取
        resultObj.resultFlag = -1;
        resultObj.result = [];
      }
      if (callback) callback(resultObj);
    });
  }

  const getFileList = function (userId, fnCode, instanceGuid, folderCode, callback) {
    if (debugMode) {
      let fileList = [];
      if (localStorage[appCode + "_" + "allFileList_" + window.erUser ? erUser.userId : _UserID] != undefined) {
        fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + window.erUser ? erUser.userId : _UserID]));
      }
      let tempFileList = [];
      for (let i = 0; i < fileList.length; i++) {
        let tempFile = fileList[i];
        if (tempFile.fn_code == fnCode && tempFile.instance_guid == instanceGuid && tempFile.upload_status == "NotUpload") {
          tempFileList.push(tempFile);
        }
      }
      let data = {};
      data.result = tempFileList;
      data.resultFlag = -1;
      data.callback = encodeURIComponent(JSON.stringify({
        "name": "appGetFileList",
        "count": 1
      }));
      if (callback) callback(data);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_appGetAllFileList"
      }
    }, res => {
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        let result = res.result.replaceAll(erowStr, "");
        let files = [];
        try {
          files = JSON.parse(decodeURIComponent(result));
        } catch (ex) {
          files = result || [];
        } finally {
          let arr = [];
          for (let i = 0; i < files.length; i++) {
            let item = files[i];
            if (item.fn_code == fnCode && item.instance_guid == instanceGuid && item.upload_status == "NotUpload") {
              arr.push(item);
            }
          }
          resultObj.result = arr;
        }
        if (result == "") resultObj.result = [];
      } else if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
        resultObj.resultFlag = -1;
        resultObj.result = [];
      } else if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
        resultObj.resultFlag = -1;
        resultObj.result = [];
      }
      if (callback) callback(resultObj);
    });
  }

  const deleteFile = function (userId, fileId, callback) {
    if (debugMode) {
      let fileList = [];
      if (localStorage[appCode + "_" + "allFileList_" + userId] != undefined) {
        fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + userId]));
      }
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].file_Id == fileId) {
          fileList.splice(i, 1);
          break;
        }
      }
      localStorage[appCode + "_" + "allFileList_" + userId] = encodeURIComponent(JSON.stringify(fileList));
      let data = {};
      data.callback = encodeURIComponent(JSON.stringify({
        "name": "appDeleteFile",
        "count": 1
      }));
      data.resultFlag = -1;
      data.result = {
        confirm_value: 'Y',
        remark: ''
      };
      if (callback) callback(data);
      return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    getAllFiles(userId, rData => {
      if (rData.resultFlag == -1) {
        let allFileList = rData.result;
        for (let i = 0; i < allFileList.length; i++) {
          let item = allFileList[i];
          if (item.file_Id == fileId) {
            allFileList.splice(i, 1);
            break;
          }
        }
        wx.invoke("ext_DataCache_SaveInfo", {
          data: {
            key: appCode + "_" + window.erUser ? erUser.userId : _UserID + "_appGetAllFileList",
            message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
          }
        }, function (res) {
          if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
            resultObj.resultFlag = -1;
          } else if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
            //失败处理
          } else if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
            //取消处理
          }
          if (callback != null) callback(resultObj);
        });
      }
    });
  }

  /// TODO: uploadFile
  const uploadFile = function (tokenId, fileName, callback) {

  }

  const getGPS = function (callback) {
    if (debugMode) {
      let resultObj = {
        result: {
          lon: 121.404469 + (Math.floor(Math.random() * 1000) / 10000),
          lat: 31.137021 + (Math.floor(Math.random() * 1000) / 10000)
        },
        resultFlag: -1
      }
      if (callback) callback(resultObj);
      return;
    }
    var resultObj = {};
    resultObj.resultFlag = 0;
    wx.getLocation({
      type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
      success: function (res) {
        //console.log("wx.getLocation成功:" + JSON.stringify(res));
        //var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
        //var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
        //var speed = res.speed; // 速度，以米/每秒计
        //var accuracy = res.accuracy; // 位置精度
        //var gps_status = res.gps_status; //gps状态，-1：应用未获取GPS权限；
        // 0：已获取GPS权限，GPS信号异常；
        // 1：已获取GPS权限，GPS信号正常，AGPS信号异常；
        // 2：已获取GPS权限，GPS信号异常，AGPS信号正常；
        // 3：已获取GPS权限，GPS/AGPS信号正常
        ////console.log(latitude);
        ////console.log(longitude);
        let failure = () => {
          resultObj.resultFlag = -1;
          resultObj.result = {};
          resultObj.result.lon = 121.404469 + (Math.floor(Math.random() * 1000) / 10000);
          resultObj.result.lat = 31.137021 + (Math.floor(Math.random() * 1000) / 10000);
          if (callback) callback(resultObj);
        }
        if (res.gps_status == -1) {
          failure();
        } else {
          resultObj.resultFlag = -1;
          let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
          let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
          resultObj.result = {};

          let url = "https://api.map.baidu.com/geoconv/v1/";
          let params = {
            coords: "" + longitude + "," + latitude,
            from: 3,
            to: 5,
            ak: "nYRPVvWPdvFbj74mL5Gb6AjI",
          }
          $.getJSON(url, params, data => {
            if (data.status == 0) {
              //console.log("坐标转换成功:", data.result[0]);
              resultObj.result.lon = data.result[0].x.toFixed(6);
              resultObj.result.lat = data.result[0].y.toFixed(6);
              if (callback) callback(resultObj);
            } else {
              failure();
            }
          }).fail(failure);
        }
      },
      fail: function (res) {
        //console.log("wx.getLocation失败:" + JSON.stringify(res));
        if (callback != null) {
          resultObj.resultFlag = -1;
          resultObj.result = {};
          resultObj.result.lon = 121.404469 + (Math.floor(Math.random() * 1000) / 10000);
          resultObj.result.lat = 31.137021 + (Math.floor(Math.random() * 1000) / 10000);
          callback(resultObj);
        }
      }
    });
  }

  /// TODO: takePhoto
  const takePhoto = function (userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback) {}

  // options: fileName, fnCode, instanceGuid, uploadAPIPath, bizInfo, willUploadFile, complete
  // options.sourceType: camera, album
  const takePhotoThenUpload = function (options) {
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    getGPS(function (gpsData) {
      let longitude = gpsData.result.lon;
      let latitude = gpsData.result.lat;
      resultObj.gps = {
        lon: longitude,
        lat: latitude,
        locationType: "BD09"
      };
      new Promise((res, rej) => {
        wx.chooseImage({
          count: options.sourceType == "camera" ? 1 : 9, // 默认9
          sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: [options.sourceType], // 可以指定来源是相册还是相机，默认二者都有
          quality: 0.1, //压缩质量，范围0～1，数值越小，质量越低，压缩率越高（仅对jpg有效）
          success: function (data) {
            res(data.localIds);
          },
          fail: function (err) {
            resultObj.errMsg = "拍照组件异常！";
            rej();
          }
        });
      }).then(localIds => {
        return new Promise((res, rej) => {
          if (localIds.length > 0 && options.hasOwnProperty("willUploadFile") && options.willUploadFile) {
            options.willUploadFile();
          }
          (async () => {
            let successCount = 0;
            for (const localId of localIds) {
              await new Promise((resolve, reject) => {
                wx.getLocalImgData({
                  localId: localId,
                  success: function (data) {
                    let fileData = data.localData;
                    let params = {
                      action: "upload",
                      Token: window.hasOwnProperty("erUser") ? window.erUser.token : _Token,
                      instanceGuid: options.instanceGuid,
                      FnCode: options.fnCode,
                      longitude: longitude,
                      latitude: latitude,
                      remark: "",
                      fileName: options.fileName + ".jpg",
                      bizInfo: encodeURIComponent(JSON.stringify(options.bizInfo)),
                      uploadAPIPath: options.uploadAPIPath,
                      localFileName: ""
                    };
                    let file = dataURLtoFile(fileData, params.fileName);
                    if (!file) {
                      reject("获取file异常!");
                      return;
                    }
                    let url = (outFlag == -1 ? ("http://127.0.0.1:" + portResult + "/" + ServerUploadFilePath) : ServerUploadFilePath);
                    let formData = new FormData();
                    formData.append("file", file);
                    formData.append("detail", JSON.stringify({
                      json: params
                    }));
                    $.ajax({
                      url: url,
                      type: "POST",
                      data: formData,
                      processData: false,
                      contentType: false,
                      success: function (ret) {
                        if (ret.type == -1) {
                          resolve();
                        } else {
                          reject("文件上传失败");
                        }
                      },
                      error: function (err) {
                        reject("文件上传失败");
                      }
                    });
                  }
                });
              }).then(() => {
                successCount++;
              }).catch(msg => {});
            }
            resultObj.success_count = successCount;
            if (localIds.length > 0) {
              if (successCount == localIds.length) {
                resultObj.resultFlag = "-1";
                resultObj.errMsg = "";
                res();
              } else {
                resultObj.resultFlag = "0";
                resultObj.errMsg = `上传${localIds.length}个文件，成功${successCount}个`;
                rej();
              }
            } else {
              resultObj.resultFlag = "0";
              resultObj.errMsg = "未获取到文件";
              rej();
            }
          })();
        });
      }).then(() => {
        if (options.hasOwnProperty("complete") && options.complete) options.complete(resultObj);
      }).catch(err => {
        if (options.hasOwnProperty("complete") && options.complete) options.complete(resultObj);
      });
    });
  }

  var _recorderInfo = {
    isRecording: false,
    channelId: "",
    userId: "",
    fileName: "",
    localFileName: "",
    fnCode: "",
    instanceGuid: "",
    folderCode: "",
    fileGuid: "",
    uploadAPIPath: "",
    bizInfo: "",
    filePath: "",
  };
  const audioRecordStart = function (userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback) {
    let resultObj = {
      resultFlag: 0,
      result: "",
      errMsg: "",
    }
    let channelId = "voiceRecord_" + new Date().getTime();
    _recorderInfo.userId = userId;
    _recorderInfo.fileName = fileName + ".mp3";
    _recorderInfo.localFileName = (instanceGuid + "_" + new Date().getTime()) + ".mp3";
    _recorderInfo.fileGuid = fileGuid;
    _recorderInfo.channelId = channelId;
    _recorderInfo.fnCode = fnCode;
    _recorderInfo.instanceGuid = instanceGuid;
    _recorderInfo.bizInfo = bizInfo;
    _recorderInfo.uploadAPIPath = uploadAPIPath;
    _recorderInfo.folderCode = folderCode;
    wx.invoke("multiWindows_subscribe", {
      channelId,
    }, function (res) {
      console.log("multiWindows_subscribe", res);
    });
    new Promise((resolve, reject) => {
      wx.invoke("getZipAppDirectory", {
        type: "STORAGE_ROOT_DIR",
      }, function (res) {
        if (res.err_msg === "getZipAppDirectory:ok") {
          resolve(res.directory);
        } else {
          reject();
        }
      });
    }).then(folderPath => {
      _recorderInfo.filePath = folderPath;
      wx.invoke("ext_VoiceRecord_Start", {
        data: {
          recordFilePath: _recorderInfo.filePath,
          recordFileName: _recorderInfo.localFileName,
          channelId,
        },
      }, function (res) {
        console.log("ext_VoiceRecord_Start", res);
        if (res.err_msg === "ext_VoiceRecord_Start:ok") {
          _recorderInfo.isRecording = true;
          resultObj.resultFlag = -1;
        } else {
          _recorderInfo.isRecording = false;
          resultObj.resultFlag = 0;
          resultObj.errMsg = res.msg;
        }
        if (callback) callback(resultObj);
      });
    }).catch(err => {
      resultObj.resultFlag = 0;
      resultObj.errMsg = "文件夹路径获取失败";
      if (callback) callback(resultObj);
    });
  }

  const audioRecordStopThenUpload = function (complete) {
    let resultObj = {
      resultFlag: 0,
      result: "",
      errMsg: "",
    }
    wx.invoke("ext_VoiceRecord_Stop", {
      data: {
        recordFilePath: _recorderInfo.filePath,
        recordFileName: _recorderInfo.localFileName,
      }
    }, function (res) {
      _recorderInfo.isRecording = false;
      console.log("ext_VoiceRecord_Stop", res);
      if (res.err_msg === "ext_VoiceRecord_Stop:ok") {
        getGPS(function (gpsData) {
          let longitude = gpsData.result.lon;
          let latitude = gpsData.result.lat;
          resultObj.gps = {
            lon: longitude,
            lat: latitude,
            locationType: "BD09"
          };
          let params = {
            action: "upload",
            Token: window.hasOwnProperty("erUser") ? window.erUser.token : _Token,
            instanceGuid: _recorderInfo.instanceGuid,
            FnCode: _recorderInfo.fnCode,
            longitude: longitude,
            latitude: latitude,
            remark: "",
            fileName: _recorderInfo.fileName,
            bizInfo: encodeURIComponent(JSON.stringify(_recorderInfo.bizInfo)),
            uploadAPIPath: _recorderInfo.uploadAPIPath,
            localFileName: _recorderInfo.localFileName,
          };
          let localFilePath = _recorderInfo.filePath + _recorderInfo.localFileName;
          console.log(localFilePath);
          let realChannelId = "event_Net_upLoad_" + new Date().getTime();
          let url = (outFlag == -1 ? ("http://127.0.0.1:" + portResult + "/" + ServerUploadFilePath) : ServerUploadFilePath);
          wx.invoke("ext_Net_Upload", {
            data: {
              url: url,
              data: {
                detail: JSON.stringify({
                  json: params
                }),
              },
              header: {},
              id: realChannelId,
              appCode: "",
              timeout: 120,
              files: {
                keyA: localFilePath
              }
            }
          }, function (res) {
            console.log("ext_Net_Upload :", params.fileName, res);
            try {
              if (res.event.toLowerCase() != "success") {
                resultObj.errMsg = "上传文件失败";
                if (complete) complete(resultObj);
                return;
              }
              let re = JSON.parse(res.result);
              resultObj.resultFlag = re.type;
              resultObj.errMsg = re.type == -1 ? "上传成功" : "上传文件失败";
              if (complete) complete(resultObj);
            } catch (ex) {
              resultObj.errMsg = "上传文件失败";
              if (complete) complete(resultObj);
            }
          });
        });
      } else {
        resultObj.resultFlag = 0;
        resultObj.errMsg = res.msg;
        if (complete) complete(resultObj);
      }
    });
  }

  const videoRecordThenUpload = function (options) {
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    getGPS(function (gpsData) {
      let longitude = gpsData.result.lon;
      let latitude = gpsData.result.lat;
      resultObj.gps = {
        lon: longitude,
        lat: latitude,
        locationType: "BD09"
      };
      wx.invoke("chooseVideo", {
        sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      }, function (res) {
        if (res.err_msg === "chooseVideo:ok") {
          let localIds = typeof res.localIds == 'object' ? res.localIds : JSON.parse(res.localIds); // 返回生成视频的本地ID，需要typeof判断兼容各个终端
          // let thumbnail = res.thumbnail; // 视频封面缩略图
          let params = {
            action: "upload",
            Token: window.hasOwnProperty("erUser") ? window.erUser.token : _Token,
            instanceGuid: options.instanceGuid,
            FnCode: options.fnCode,
            longitude: longitude,
            latitude: latitude,
            remark: "",
            fileName: options.fileName + ".mp4",
            bizInfo: encodeURIComponent(JSON.stringify(options.bizInfo)),
            uploadAPIPath: options.uploadAPIPath,
            localFileName: ""
          };
          if (localIds.length > 0 && options.hasOwnProperty("willUploadFile") && options.willUploadFile) {
            options.willUploadFile();
          }
          wx.invoke("getLocalResPath", {
            localId: localIds[0],
          }, res => {
            if (res.err_msg.toLowerCase() === "getLocalResPath:ok".toLowerCase()) {
              let localFilePath = res.localResPath;
              let realChannelId = "event_Net_upLoad_" + new Date().getTime();
              let url = (outFlag == -1 ? ("http://127.0.0.1:" + portResult + "/" + ServerUploadFilePath) : ServerUploadFilePath);
              wx.invoke("ext_Net_Upload", {
                data: {
                  url: url,
                  data: {
                    detail: JSON.stringify({
                      json: params
                    }),
                  },
                  header: {},
                  id: realChannelId,
                  appCode: "",
                  timeout: 120,
                  files: {
                    keyA: localFilePath
                  }
                }
              }, function (res) {
                console.log("ext_Net_Upload :", params.fileName, res);
                try {
                  if (res.event.toLowerCase() != "success") {
                    resultObj.errMsg = "上传文件失败";
                    if (options.hasOwnProperty("complete")) options.complete(resultObj);
                    return;
                  }
                  let re = JSON.parse(res.result);
                  resultObj.resultFlag = re.type;
                  resultObj.errMsg = re.type == -1 ? "上传成功" : "上传文件失败";
                  if (options.hasOwnProperty("complete")) options.complete(resultObj);
                } catch (ex) {
                  resultObj.errMsg = "上传文件失败";
                  if (options.hasOwnProperty("complete")) options.complete(resultObj);
                }
              });
            } else {
              resultObj.errMsg = "获取本地文件路径失败";
              if (options.hasOwnProperty("complete")) options.complete(resultObj);
            }
          });
        } else {
          if ((res.err_msg || '').toLocaleLowerCase() != "chooseVideo:cancel".toLocaleLowerCase()) {
            resultObj.errMsg = "摄像组件异常！";
          }
          if (options.hasOwnProperty("complete")) options.complete(resultObj);
        }
      });
    });
  }

  const showFile = function (url, name, size) {
    wx.invoke('previewFile', { 
      url: url, 
      isLocalUrl: 0, 
      name: name,
      size: size, 
      hidePreviewMenuList : ["openWithOtherApp","saveToLocal"] 
    })
  }

  const faceRegister = function (userId, steps, openFace, callback) {

  }

  const scanQrcode = function (callback) {
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    wx.scanQRCode({
      desc: 'scanQRCode desc',
      needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: function (res) {
        // 回调
        if (res.errMsg == "scanQRCode:ok") {
          resultObj.result = res.resultStr;
          resultObj.resultFlag = -1;
        } else {
          resultObj.errMsg = res.errMsg;
        }
        if (callback != null) {
          callback(resultObj);
        }
      },
      fail: function (res) {
        if (res.errMsg.indexOf('function_not_exist') > 0) {
          alert('版本过低请升级');
          resultObj.errMsg = "版本过低请升级";
        } else {
          resultObj.errMsg = "扫码组件异常！";
        }
        if (callback != null) {
          callback(resultObj);
        }
      }
    });
  }

  const exitSystem = function () {
    wx.invoke("multiWindows_close", {}, function (res) {});
  }

  const exitToYJK = function () {
    return false;
  }

  const dataURLtoFile = function (dataurl, filename) { //将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
    try {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {
        type: mime
      });
    } catch (ex) {
      return null;
    }
  }

  //  是否有第三方app
  const isAppInstalled = function (appName, callback) {
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    wx.invoke("ext_appInstall_Check",{data:{
      APPId: appName,
    }},function(res){
      if (res.err_msg.toLowerCase() === "ext_appInstall_Check:ok".toLowerCase()) {
        resultObj.resultFlag == -1;
      }
      if (callback != null) {
        callback(resultObj);
      }
    })
  }

  const toApp = function (appName, callback) {
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    wx.invoke("ext_appInstall_openApp",{data:{
      APPId: appName,
    }},function(res){
      if (res.err_msg.toLowerCase() === "ext_appInstall_Check:ok".toLowerCase()) {
        resultObj.resultFlag == -1;
      }
      if (callback != null) {
        callback(resultObj);
      }
    })
  }

  const updateFileParameter = function(fileName,newFileName, appId) {
    let parameter = {
      params: {
        fileName: fileName,
        newFileName: newFileName,
        appId:appId
      }
    };
    jsCallApp("updateFileParameter", parameter);
  }

  const erJsBridge = {
    osType,
    osColorScheme,
    debugMode,
    getUniqueID,
    getVersionNumber,
    setParameter,
    getParameter,
    setValue,
    getValue,
    deleteValue,
    getValueUpdateDate,
    gotoPay,
    gotoInfo,
    gotoISM,
    gotoISMTicket,
    screenControlDirection,
    getStatistics,
    getAllFiles,
    getFileList,
    deleteFile,
    uploadFile,
    getGPS,
    takePhoto,
    takePhotoThenUpload,
    audioRecordStart,
    audioRecordStopThenUpload,
    videoRecordThenUpload,
    faceRegister,
    showFile,
    scanQrcode,
    exitSystem,
    exitToYJK,
    dataURLtoFile,
    isAppInstalled,
    toApp,
    updateFileParameter
  }

  window.erJsBridge = erJsBridge;
})();