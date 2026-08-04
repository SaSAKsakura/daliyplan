var _UniqueID = "";
var _UserID = 0;
var _UserName = "";
var _Token = "";
var _VersionNumber;
var _ContactTel = "";
var _BaseId = "";
var _BaseName = "";
var callbackCount = 0;
var callbackFunction = new Array(1000);
var maxCount = 2000;
//var onDataReady;
var android;
var androidReturnValue;
var recordCallBack;
var osType = 0; //0 android; 1 iOS
console.log("documentElement:" + typeof (document.documentElement));
var viewport = document.querySelector("meta[name=viewport]");
var getApiRouter = [];
var _VConsoleFlag = 0;
var vConsole = null;
var pageLoadCount = 1;
var _pageLoadIntVal = null;
var needConfirmFlag = 0;
var request = {
  QueryString: function (val) {
    var url = window.location.search;
    var re = new RegExp("" + val + "=([^&?]*)", "ig");
    return ((url.match(re)) ? (url.match(re)[0].substr(val.length + 1)) : null);
  }
}
window.onerror = handleError;
function handleError(msg, url, l) {
  console.log(msg);
  console.log(url);
  console.log(l);
}
var erowStr = "";
for (var i = 0; i < 10; i++) {
  erowStr += "erow";
}

String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
}
function getQueryStringByName(name) {
  var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  if (result == null || result.length < 1) {
    return "";
  }
  return result[1];
}
if (!/android/i.test(navigator.userAgent)) {
  osType = 1;
  if (osType) {
    appGetFuntionParam('ScreenWidth', '', function (rData) {
      if (window.hasOwnProperty('screenScale')) return;
      var screenWidth = parseInt(rData.result.ScreenWidth);
      switch (screenWidth) {
        case 320:
          viewport.setAttribute('content', 'width=device-width, initial-scale=0.52, minimum-scale=0.52,maximum-scale=0.52, user-scalable=no');
          break;
        case 375:
          viewport.setAttribute('content', 'width=device-width, initial-scale=0.62, minimum-scale=0.62,maximum-scale=0.62, user-scalable=no');
          break;
        case 390:
          viewport.setAttribute('content', 'width=device-width, initial-scale=0.62, minimum-scale=0.62,maximum-scale=0.62, user-scalable=no');
          break;
        case 414:
          viewport.setAttribute('content', 'width=device-width, initial-scale=0.68, minimum-scale=0.68,maximum-scale=0.68, user-scalable=no');
          break;
        case 428:
          viewport.setAttribute('content', 'width=device-width, initial-scale=0.68, minimum-scale=0.68,maximum-scale=0.68, user-scalable=no');
          break;
        default:
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1,maximum-scale=1, user-scalable=no');
          break;
      }
    });
  }
}
//ios
function appGetFuntionParam(code, value, callback) {
  if (debugMode) {
    localStorage[appCode + "_" + code] = value;
    var resultObj = {
      result: { "ScreenWidth": window.screen.availWidth },
      resultFlag: -1

    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  if (igwMode) {

    var resultObj = {
      result: { "ScreenWidth": window.screen.availWidth },
      resultFlag: -1

    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  } else {
    var parameter = { "params": { "code": code, "value": value }, "callback": recordCallBack("getFuntionParam", callback) };
    jsCallApp('getFuntionParam', parameter);
  }
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
      alert('数值溢出！');
      //throw();
      break;
    }
  }
  callbackFunction[i] = callback;
  callbackCount = i;

  var s = encodeURIComponent(JSON.stringify({ "name": name, "count": i }));

  return s;
}


//
function jsCallApp(func, params) {
  if (igwMode) {

  } else {
    if (osType) {
      if (params == undefined || params == null) {
        webkit.messageHandlers[func].postMessage(null);
      } else {
        webkit.messageHandlers[func].postMessage(JSON.stringify(params));
      }
    } else {
      if (params == undefined || params == null) {
        android[func]();
      } else {
        android[func](JSON.stringify(params));
      }
    }
  }


}

function recordCallBack(name, callback) {
  callbackCount++;
  var i = callbackCount % maxCount;
  var j = 0;
  while (callbackFunction[i] != undefined && callbackFunction[i] != null) {
    i++;
    i = i % maxCount;
    j++;
    if (j > maxCount) {
      alert('数值溢出！');
      break;
    }
  }
  callbackFunction[i] = callback;
  callbackCount = i;
  var s = encodeURIComponent(JSON.stringify({ "name": name, "count": i }));
  return s;
}
console.log("监听DOMContentLoaded");
document.addEventListener('DOMContentLoaded', initData, false);
function openConsole() {
  if (_VConsoleFlag == 0) {
    vConsole = new VConsole();
    _VConsoleFlag = -1;
    appSetParameter("_VConsoleFlag", -1, function (res) {

    });
  } else {
    if (vConsole != null) {
      vConsole.destroy();
      _VConsoleFlag = 0;
      appSetParameter("_VConsoleFlag", 0, function (res) {

      });
    }
  }
}

function initAndroidReturnValue(){
	if (typeof (android) == 'undefined') {
    if (!/android/i.test(navigator.userAgent)) {
      osType = 1; //iOS
      if (top.iOS) {
        android = top.iOS;
        androidReturnValue = top.iOSReturnValue;
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

function initData(callback) {
  console.log("回调DOMContentLoaded");
  document.removeEventListener('DOMContentLoaded', initData, false);
  
  initAndroidReturnValue();

  if (debugMode) {
    appGetVersionNumber(setVersionNumber);
    return;
  }
  console.log("准备注册wxjs");
  if (igwMode) {

    //注册微信js
    var localhref = window.location.href;
    var strLengh = localhref.substring(localhref.indexOf("APP") + ("APP".length + 1), localhref.indexOf(".html")).split("/").length;
    var dir = "";
    for (var i = 0; i < strLengh - 1; i++) {
      dir += "../";
    }

    var wxjsurl = dir + "../js/jweixin-1.2.0.js";

    $.getScript(wxjsurl, function () {
      console.log("js加载成功");


      clearInterval(_pageLoadIntVal);
      _pageLoadIntVal = setInterval(function () {

        if (document.getElementById("__WeixinJSBridgeIframe_SetResult") == null && osType == 0) {//android
          pageLoadCount++;
          console.log("加载失败重新刷新");
          window.location.reload();
        } else {
          clearInterval(_pageLoadIntVal);
        }

      }, 2000);

      var jsApiList = [
        //'onUserCaptureScreen',
        //'getZipAppDirectory',
        //'ext_FileManager_Write',
        //'ext_FileManager_Read',
        //'ext_FileManager_Remove',
        //'ext_FileManager_Create',
        //'ext_FileManager_RemoveDirectory',
        //'ext_FileManager_Exist',
        //'ext_FileManager_IsDirectory',
        //'ext_FileManager_Information',
        //'ext_Socket_Init',
        //'ext_Socket_UnInit',
        //'ext_Socket_CreateChannel',
        //'ext_Socket_CloseChannel',
        //'ext_Socket_SendData',
        //'multiWindows_subscribe',
        //'ext_Database_Open',
        //'ext_Database_Exec',
        //'ext_Database_Query',
        //'ext_Database_Close',
        //'ext_rlble_initBluetoothAdapter',
        //'ext_rlble_scanBluetoothDev',
        //'ext_rlble_startConnectBluetoothDev',
        //'ext_rlble_onBluetoothDevConnDataRecv',
        //'ext_rlble_BluetoothDevSendData',
        //'ext_rlble_closeBluetoothDevConnection',
        //'ext_rlble_stopBluetoothDevScan',
        //'showWatermark',
        //'hideWatermark',
        //'ext_SandBox_WaterMark',
        //"ext_SandBox_ScreenPolicy",
        //"ext_SandBox_ScreenShot",
        //"ext_DataCache_GetInfo",
        //"ext_DataCache_SaveInfo",
        //'multiWindows_subscribe',
        //'ext_Net_Upload',
        //'ext_Net_CancelUpload',
        //'ext_Net_Download',
        //"startRecordVoiceBuffer",
        //"onRecordBufferReceived", "stopRecordVoiceBuffer", "ocr"
        'getZipAppDirectory',

        'ext_FileManager_Write',
        'ext_FileManager_Read',
        'ext_FileManager_Remove',
        'ext_FileManager_Create',
        'ext_FileManager_RemoveDirectory',
        'ext_FileManager_Exist',
        'ext_FileManager_IsDirectory',
        'ext_FileManager_Information',

        'ext_Socket_Init',
        'ext_Socket_UnInit',
        'ext_Socket_CreateChannel',
        'ext_Socket_CloseChannel',
        'ext_Socket_SendData',

        'multiWindows_subscribe',

        'ext_SGMap_init',
        'ext_SGMap_Operation',
        'ext_SGMap_Search',
        'ext_SGMap_Location',

        'ext_Etas_List',
        'ext_Etas_Init',
        'ext_Etas_Reg',
        'ext_Etas_UnReg',
        'ext_Etas_checkStatus',
        'ext_Etas_Verify',
        'ext_Etas_SaveData',
        'ext_Etas_GetData',
        'ext_Etas_RemoveData',
        'ext_Etas_Clear',
        'ext_Etas_OffLineVerify',

        'ext_ISCP_Init',
        'ext_ISCP_ConnectService',
        'ext_ISCP_GetLocalPort',
        'ext_ISCP_Close',
        'ext_ISCP_Status',

        'ext_Database_Open',
        'ext_Database_Exec',
        'ext_Database_Query',
        'ext_Database_Close',

        'ext_rlble_initBluetoothAdapter',
        'ext_rlble_scanBluetoothDev',
        'ext_rlble_startConnectBluetoothDev',
        'ext_rlble_onBluetoothDevConnDataRecv',
        'ext_rlble_BluetoothDevSendData',
        'ext_rlble_closeBluetoothDevConnection',
        'ext_rlble_stopBluetoothDevScan',
        'ext_rlble_onBluetoothDevConnStateChange',
        'ext_rlble_autoBluetoothDevConnection',

        'ext_Popover_Open',
        'ext_Popover_Close',

        "multiWindows_open",
        "multiWindows_close",
        "multiWindows_startWidget",
        "multiWindows_finishWidget",
        "multiWindows_subscribe",
        "multiWindows_publish",

        'selectEnterpriseContact',
        'openChatWithMsg',
        'openUserProfile',

        'onMenuShareAppMessage',
        'onMenuShareWechat',
        'shareAppMessage',
        'shareWechatMessage',
        'onMenuShareTimeline',

        'chooseImage',
        'getLocalImgData',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'previewFile',

        'chooseVideo',
        'uploadVideo',
        'downloadVideo',

        'startRecord',
        'stopRecord',
        'onVoiceRecordEnd',
        'playVoice',
        'playVoice',
        'stopVoice',
        'onVoicePlayEnd',
        'startRecordVoiceBuffer',
        'onRecordBufferReceived',
        'stopRecordVoiceBuffer',
        'uploadVoice',
        'downloadVoice',
        'translateVoice',

        'startWifi',
        'stopWifi',
        'connectWifi',
        'getWifiList',
        'onGetWifiList',
        'onWifiConnected',
        'getConnectedWifi',

        'openBluetoothAdapter',
        'closeBluetoothAdapter',
        'getBluetoothAdapterState',
        'onBluetoothAdapterStateChange',
        'startBluetoothDevicesDiscovery',
        'stopBluetoothDevicesDiscovery',
        'getBluetoothDevices',
        'onBluetoothDeviceFound',
        'getConnectedBluetoothDevices',
        'createBLEConnection',
        'closeBLEConnection',
        'onBLEConnectionStateChange',
        'getBLEDeviceServices',
        'getBLEDeviceCharacteristics',
        'readBLECharacteristicValue',
        'writeBLECharacteristicValue',
        'notifyBLECharacteristicValueChange',
        'onBLECharacteristicValueChange',

        'setClipboardData',
        'getClipboardData',

        'getNetworkType',
        'onNetworkStatusChange',

        'openLocation',
        'getLocation',
        'startAutoLBS',
        'stopAutoLBS',
        'onLocationChange',

        'onHistoryBack',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'onUserCaptureScreen',
        'openUrl',

        'scanQRCode',

        'getStepCount',
        'getAllPhoneContacts',
        'addCalendarEvent',

        'showWatermark',
        'hideWatermark',

        'checkIsSupportSoterAuthentication',
        'checkIsSoterEnrolledInDevice',
        'startSoterAuthentication',
        'bioassayAuthentication',

        'launch3rdApp',
        'request3rdApp',
        'getInstallState',

        'ocr',

        'checkJsApi',

        'ext_gislocation_init',
        'ext_gislocation_start',
        'ext_gislocation_stop',

        'ext_SandBox_Reg',
        'ext_SandBox_StartSubApp',
        'ext_SandBox_CloseSubApp',
        'ext_SandBox_ScreenPolicy',
        'ext_SandBox_isRoot',
        'ext_SandBox_isSimulator',
        'ext_SandBox_WaterMark',
        'ext_SandBox_ScreenShot',
        'ext_SandBox_DelePhoto',
        'ext_SandBox_UploadShot',

        'ext_wxlog_setLogOpen',
        'ext_wxlog_getLogFile',
        'ext_SGMap_init',
        'ext_SGMap_Location',

        'ext_DataCache_Get',
        'ext_DataCache_Save',
        'ext_DataCache_SaveInfo',
        'ext_DataCache_GetInfo',
        'ext_DataCache_RemoveInfo',

        'ext_Net_Upload',
        'ext_Net_CancelUpload',
        'ext_Net_Download',
        'ext_Net_SimpleDownload',
        'ext_Net_MultiDownload',

        'ext_screenControl_direction',

        'ext_WeMeet_Init',
        'ext_WeMeet_Login',
        'ext_WeMeet_Logout',
        'ext_WeMeet_Join',

        'ext_DeviceInfo_GetInfo',

        'ext_Compressor_Size',
        'ext_Compressor_Quality',

        'ext_OfflineFaceRec_add',
        'ext_OfflineFaceRec_delete',
        'ext_OfflineFaceRec_recognition',
        'ext_OfflineFaceRec_capture',
        'ext_OfflineFaceRec_openCamera',

        'ext_unzip_untie',
        'ext_unzip_compression',
        'ext_Intent_Dial',

        'ext_facialLandmarkDetection_init',
        'ext_facialLandmarkDetection_getFaceData',

        'ext_VoiceRecord_Start',
        'ext_VoiceRecord_Stop',
        'ext_VoiceRecord_Pause',
        'ext_VoiceRecord_Continue',
        'ext_VoiceRecord_Delete',
        'ext_VoiceRecord_ShowRecords',

        'ext_FileBrowser_StartPreView',

        'ext_FileManager_BlockComposeFile',
        'ext_FileManager_BlockFetchFile',
        'ext_FileManager_BlockMergeFile',
        'ext_FileManager_fileDelete',

        'ext_LocalServer_BootServer',
        'ext_LocalServer_LocalUrl',
        'ext_LocalServer_StopServer',

        'ext_appInstall_Check',
        'ext_appInstall_start',

        'ext_GPS_GetLocation',

        'changeNaviColor',
        'ext_OCR_SelectRes',
        'ext_OCR_Authentication',
        'ext_OCR_Ocr',

        'ext_Net_PathExtension',

        'ext_Print_Picture',
        'ext_Print_Doc'
      ];
      wx.config({
        beta: true,
        debug: false,
        appId: wxappId,
        timestamp: new Date().getTime(),
        nonceStr: "CF82F13B500E43969998A4E8423F8A71",
        signature: "B96D85B82113469DAF3880A6EFFBF477",
        jsApiList: jsApiList
      });
      wx.ready(function () {
        if(callback!=null){
          callback;
        }
        wx.invoke("agentConfig", {
          agentid: AppId, // 必填，企业应用的agentid
          corpid: wxappId,  // 必填，企业微信的corpid
          timestamp: new Date().getTime(),
          nonceStr: "CF82F13B500E43969998A4E8423F8A71",
          signature: "B96D85B82113469DAF3880A6EFFBF477",
          jsApiList: jsApiList
        }, function (res) {
          console.log("wx.agent config: over", res);
        });
        console.log("wxjs注册成功");
        $.getScript(dir + "../js/vconsole.min.js", function () {

          appGetParameter("_VConsoleFlag", function (res) {
            if (res.result.value == "-1") {
              _VConsoleFlag = -1;
              vConsole = new VConsole();
            }
          });
        });
        
        iscpLoad(function () {
          //initBaseData();
          initConfig();
        }, function () {
          console.log("ISCP通信建立失败");
          //initBaseData();
          initConfig();
        });





      });
      wx.error(function (rData) {
        //alert("微信JS-SDK初始化失败");
        // debugMode = false;
        if (appCode == "SNHQ") {
          onDataReady();
        } else {
          appGetVersionNumber(setVersionNumber);
        }
      });
    });

  } else {
    appGetVersionNumber(setVersionNumber);
  }

}
function initBaseData() {
  appGetParameter("baseInfo", function (res) {
    if (res.length != 6) {//空json
      var data = JSON.parse(decodeURIComponent(res.result.value));
      baseInfo = data;
      WebRoot = data.WebRoot;
      ServerPath = data.ServerPath;
      erpsetId = data.erpsetId;
      javaSrPath = data.javaSrPath;
      wxappId = data.wxappId;
      AppId = data.AppId;
      terces = data.terces;
      IscAppId = data.IscAppId;
      Iscterces = data.Iscterces;
      yekngis = data.yekngis;
      yekcilbuPngis = data.yekcilbuPngis;
      lrucsi = data.lrucsi;
      getWxCodeUrl = data.getWxCodeUrl;
      getlrUtekcitcsI = data.getlrUtekcitcsI;
      PIpcsi = data.PIpcsi;
      connectIp = data.connectIp;
      connectPort = data.connectPort;
      connectUser = data.connectUser;
      connectAppid = data.connectAppid;
      localPortIp = data.localPortIp;
      localPort = data.localPort;
      outFlag = data.outFlag;
      AQJHFlag = data.AQJHFlag;
      validateUserAJGKURL = data.validateUserAJGKURL;
      validateUserIGWURL = data.validateUserIGWURL;
      ServerUploadFilePath = data.ServerUploadFilePath;
      ServerDownloadFilePath = data.ServerDownloadFilePath;
    }

    initConfig();
  });
}
function initConfig() {
  appGetParameter("portResult", function (rData) {
    portResult = rData.result.value;
    if (appCode == "SNHQ") {
      appGetParameter("userInfo", function (val) {
        //console.log(JSON.stringify(val));
        if (val.resultFlag == '-1') {
          var resultJson = {};
          try {
            resultJson = JSON.parse(decodeURIComponent(val.result.value));
            //console.log(resultJson);
            _UserID = resultJson.userId;
            _Token = resultJson.Token;
            _UserName = resultJson.userName;
            _ContactTel = resultJson.contactTel;
            _BaseId = resultJson.baseId;
            _BaseName = resultJson.baseName;
          } catch (e) { }
          //每次登陆时记录登陆时间，登陆一小时之后强制用户退出并刷新数据。
          appSetParameter("lastRefresh", new Date().getTime(), null);
          try {
            /*appGetValue(0, "getApiRouter", function (rData) {
              if (rData.resultFlag == -1) {
                getApiRouter = rData.result;
              }

              onDataReady();
            });*/
            onDataReady();
          } catch (e) {
            console.error(e);
          }
          //如果有全局refreshEvent则自动绑定下拉刷新对象
          if (window.refreshEvent) {
            if (window.pullRefresh) {
              var params = {
                selector: '.mainContent'
              };
              var refresh = new pullRefresh(params, refreshEvent);
            } else {
              console.error('Uncaught ReferenceError: pullRefresh is not defined\n 没有引用pullRefresh.js');
            }
          }
        } else {
          appAlert(val.error);
        }
      });

    } else {

      appGetVersionNumber(setVersionNumber);

    }


  });
}


//获得最新版本号
function appGetVersionNumber(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        version_name: 1.8
      },
      resultFlag: -1
    }
    callback(resultObj);
    return;
  }
  var resultObj = {};
  resultObj.result = { version_name: "1.00" };
  resultObj.resultFlag = -1;
  if (callback != null) {
    callback(resultObj);
  }
}

function setVersionNumber(val) {
  _VersionNumber = val.result.version_name;
  appGetUniqueID(setUniqueID);
}
//获得唯一ID
function appGetUniqueID(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        unique_id: "debugMode" + new Date().getTime()
      },
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }

  wx.invoke("ext_DeviceInfo_GetInfo", { data: {} }, function (res) {
    console.log("当前设备信息");
    console.log(res);
    let _unique_id = "igw_" + new Date().getTime();
    try {
      if (res.err_msg.toLowerCase() === 'ext_DeviceInfo_GetInfo:ok'.toLowerCase()) {

        //成功处理
        if (res.data == undefined) {

          _unique_id = "igw" + res.deviceUUID;
        }
        //处理ios15特殊
        if (typeof (res.data) == "object") {
          _unique_id = "igw" + res.data.deviceUUID;
        }

      }

    } catch (ex) {

    }
    var resultObj = {
      result: {
        unique_id: _unique_id
      },
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
  });

}
function setUniqueID(val) {
  _UniqueID = val.result.unique_id;
  appGetParameter("userID", setUserID);
}
function setUserID(val) {
  if (val.result.value) {
    _UserID = val.result.value;
  }
  appGetParameter("userName", setUserName);
}
function setUserName(val) {
  if (val.result.value) {
    _UserName = val.result.value;
  }
  appGetParameter("token", setToken);
}
function setToken(val) {
  if (val.result.value) {
    _Token = val.result.value;
  }
  if (onDataReady) {
    appGetValue(0, "getApiRouter", function (rData) {
      if (rData.resultFlag == -1) {
        getApiRouter = rData.result;
      }

      onDataReady();
    });
  }
}
//检查是否有网络
function appGetNetworkState(callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        network_state: -1
      },
      resultFlag: -1
    }
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }

  if (igwMode) {
    var network_state = 0;

    wx.getNetworkType({
      success: function (res) {
        var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
        if (networkType != "none") {
          network_state = -1;
        }
        var resultObj = {
          result: {
            network_state: network_state
          },
          resultFlag: -1
        }
        if (callback != null) {
          callback(resultObj);
        }
      },
      fail: function (res) {
        //console.log("wx.getNetworkType:" + JSON.stringify(res));
        var resultObj = {
          result: {
            network_state: network_state
          },
          resultFlag: 0
        }
        if (callback != null) {
          callback(resultObj);
        }
      }
    });
    //暂不支持
    //wx.onNetworkStatusChange(function (res) {
    //    alert(JSON.stringify(res));
    //})
  } else {
    var parameter = { "params": {}, "callback": recordCallBack("appGetNetworkState", callback) };
    jsCallApp('getNetworkState', parameter);
  }


}
//获取参数
function appGetParameter(code, callback) {

  if (debugMode) {
    var resultObj = {
      result: {
        value: localStorage[appCode + "_" + code]
      },
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }

  if (igwMode) {
    //console.log("开始获取数据：" + code + "," + new Date().getTime());
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + code
      }
    },
      function (res) {
        //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
        if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
          resultObj.resultFlag = -1;
          resultObj.result = {};
          resultObj.result.value = res.result.replaceAll(erowStr, "");
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
          //取消处理
        }
        if (callback != null) {
          callback(resultObj);
        }
      });
  } else {
    var parameter = { "params": { "code": code }, "callback": recordCallBack("appGetParameter", callback) };
    jsCallApp('getParameter', parameter);
  }

}
//设置参数
function appSetParameter(code, value, callback) {
  if (debugMode) {
    localStorage[appCode + "_" + code] = value;
    var resultObj = {
      result: "",
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var resultObj = {};
  resultObj.resultFlag = 0;
  if (igwMode) {
    //console.log("开始存储数据：" + code + "," + new Date().getTime());
    wx.invoke("ext_DataCache_SaveInfo", {
      data: {
        key: appCode + "_" + code,
        message: value + erowStr
      }
    },
      function (res) {
        //console.log("结束存储数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
        if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
          resultObj.resultFlag = -1;
        }
        if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
          //取消处理
        }
        if (callback != null) {
          callback(resultObj);
        }
      });
  } else {
    var parameter = { "params": { "code": code, "value": value }, "callback": recordCallBack("appSetParameter", callback) };
    jsCallApp('setParameter', parameter);
  }

}

//获取指定数据
function appGetValue(userId, code, callback) {
  if (debugMode) {
    var r = localStorage[appCode + "_" + code + userId] || "";
    try {
      r = JSON.parse(r);
    } catch (e) { }
    var resultObj = {
      result: r,
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //console.log("开始获取数据：" + code + "," + new Date().getTime());
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    },
      function (res) {
        //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
        if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
          resultObj.resultFlag = -1;
          //判断是否是json字符串
          var result = res.result.replaceAll(erowStr, "");
          try {
            resultObj.result = JSON.parse(decodeURIComponent(result));
            try {
              resultObj.result = JSON.parse(resultObj.result.value);
            }
            catch (err) {
              resultObj.result = resultObj.result.value;
            }
          }
          catch (err) {
            resultObj.result = decodeURIComponent(result);
          }
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
          //取消处理
        }
        if (callback != null) {
          callback(resultObj);
        }
      });
  } else {
    var parameter = { "params": { "userId": userId, "code": code }, "callback": recordCallBack("appGetValue." + code, callback) };
    jsCallApp('getValue', parameter);
  }
}

function appGetValueUpdateDate(userId, code, callback) {
  if (debugMode) {
    let r = localStorage[appCode + "_" + code + userId + "last_update_date"] || "";
    try {
      r = JSON.parse(r);
    } catch (e) { }
    let resultObj = {
      result: r,
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  let resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.errMsg = "";
  resultObj.result = "";
  if (igwMode) {
    //+ "_" + "last_update_date"
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    }, res => {
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        //判断是否是json字符串
        let result = res.result.replaceAll(erowStr, "");
        if (isJSON(result)) {
          resultObj.result = JSON.parse(decodeURIComponent(result)).last_update_date;
        }
        else {
          resultObj.result = result;
        }
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
      }
      if (callback != null) {
        callback(resultObj);
      }
    });
  } else {
    if (callback) callback(resultObj);
    // var parameter = { "params": { "userId": userId, "code": code }, "callback": recordCallBack("appGetValue." + code, callback) };
    // jsCallApp('getValue', parameter);
  }

}

function isJSON(str) {
  if (typeof str == 'string') {
    try {
      if (str != "") {
        JSON.parse(decodeURIComponent(str));

        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
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

//插入指定数据
function appSetValue(userId, code, value, statistics, last_update_date, callback) {
  if (debugMode) {
    localStorage[appCode + "_" + code + userId] = value;
    localStorage[appCode + "_" + code + userId + 's'] = statistics;
    localStorage[appCode + "_" + code + userId + "last_update_date"] = last_update_date;
    var resultObj = {
      result: "",
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }

  if (igwMode) {

    //console.log("开始存储数据：" + appCode + "_" + userId + "_" + code + "," + new Date().getTime());
    var resultObj = {};
    resultObj.resultFlag = 0;
    var valueObj = {};
    valueObj.value = value;
    valueObj.statistics = statistics;
    valueObj.last_update_date = new Date().Format("yyyy/MM/dd hh:mm:ss");
    wx.invoke("ext_DataCache_SaveInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code,
        message: encodeURIComponent(JSON.stringify(valueObj)) + erowStr
      }
    },
      function (res) {
        //console.log("结束存储数据：" + appCode + "_" + userId + "_" + code + "," + new Date().getTime());
        /*  //console.log(JSON.stringify(res));*/
        if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
          if (callback != null) {
            resultObj.resultFlag = -1;

          }
        }
        if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
          //取消处理
        }
        if (callback != null) {
          callback(resultObj);
        }
      });
  } else {
    value = encodeURIComponent(value);
    var parameter = { "params": { "userId": userId, "code": code, "value": value, "statistics": statistics, "last_update_date": last_update_date }, "callback": recordCallBack("appSetValue." + code, callback) };
    jsCallApp('setValue', parameter);

  }

}


//删除指定数据
function appDeleteValue(userId, code, callback) {
  if (debugMode) {
    delete localStorage[appCode + "_" + code + userId];
    delete localStorage[appCode + "_" + code + userId + 's'];
    delete localStorage[appCode + "_" + code + userId + "last_update_date"];
    var resultObj = {
      result: "",
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  var resultObj = {};
  resultObj.resultFlag = 0;
  //console.log("开始删除数据：" + code + "," + new Date().getTime());
  wx.invoke("ext_DataCache_RemoveInfo", {
    data: {
      key: appCode + "_" + userId + "_" + code
    }
  }, function (res) {
    //console.log("结束删除数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
    if (res.err_msg === 'ext_DataCache_RemoveInfo:ok') {
      //成功处理
      resultObj.resultFlag = -1;
    }
    if (res.err_msg === 'ext_DataCache_RemoveInfo:fail') {
      //失败处理
    }
    if (res.err_msg === 'ext_DataCache_RemoveInfo:cancel') {
      //取消处理
    }
    if (callback != null) {
      callback(resultObj);
    }
  });
}

function appGetTextValue(userId, code, callback) {
  if (debugMode) {
    var resultObj = {
      result: localStorage[appCode + "_" + code + userId],
      resultFlag: -1
    };
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //console.log("开始获取数据：" + code + "," + new Date().getTime());
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    },
      function (res) {
        //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
        if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
          resultObj.resultFlag = -1;
          //resultObj.result = res.result.replaceAll(erowStr, "");
          //判断是否是json字符串
          var result = res.result.replaceAll(erowStr, "");
          try {
            resultObj.result = JSON.parse(decodeURIComponent(result));
            try {
              resultObj.result = JSON.parse(resultObj.result.value);
            }
            catch (error) {
              resultObj.result = resultObj.result.value;
            }
          }
          catch (error) {
            resultObj.result = decodeURIComponent(result);
          }
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
          //取消处理
        }
        if (callback != null) {
          callback(resultObj);
        }
      });
  } else {
    var parameter = { "params": { "userId": userId, "code": code }, "callback": recordCallBack("appGetTextValue." + code, callback) };
    jsCallApp('getValue', parameter);
  }


}


function appGetStatistics(userId, code, callback) {
  if (debugMode) {
    var resultObj = {
      result: {
        statistics: localStorage[appCode + "_" + code + userId + 's'] || 0
      },
      resultFlag: -1
    }
    setTimeout(function () {
      callback(resultObj);
    }, 1);
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //console.log("开始获取数据：" + code + "," + new Date().getTime() );
    //+ "_" + "statistics"
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_" + code
      }
    },
      function (res) {
        //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
        if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
          resultObj.resultFlag = -1;
          resultObj.result = {};
          //判断是否是json字符串
          let result = res.result.replaceAll(erowStr, "");
          if (isJSON(result)) {
            resultObj.result = JSON.parse(decodeURIComponent(result)).statistics;
          }
          else {
            resultObj.result = result;
          }
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
          //取消处理
        }
        if (callback != null) {
          callback(resultObj);
        }
      });
  } else {
    var parameter = { "params": { "userId": userId, "code": code }, "callback": recordCallBack("appGetStatistics", callback) };
    jsCallApp('getStatistics', parameter);
  }
}

//弹窗提醒
function appAlert(message) {

  if (appCode == "SNHQ") {
    var title = arguments[1] || "系统消息";
    if ($("#alert").length == 0) {
      $("body").append("<div id=\"alert\"><p id=\"alertTitle\">" + title + "</p><p id=\"alertMessage\">" + message + "</p><div class=\"btnGroup\"><div id=\"alertBtnOk\" class=\"btnRed\">确定</div></div></div>");
    } else {
      $("#alertTitle").html(title);
      $("#alertMessage").html(message);
    }
    $("#alert").css("display", "block");
    showOverLay();
    $("#alertBtnOk").click(function () {
      hideOverLay();
      $("#alert").css("display", "none");
      $("#alertBtnOk").unbind("click");
    });

  } else {

    if (debugMode) {
      alert(message);
      return;

    }
    if (igwMode) {
      alert(message);
    } else {
      androidHideWaiting();
      var parameter = { "params": { "message": message }, "callback": recordCallBack("appAlert", null) };
      jsCallApp('alert', parameter);
    }
  }
  return;
}

//对话框确认
function appConfirm(message, callback) {
  if (debugMode) {
    var resultObj = {};
    resultObj.resultFlag = -1;
    var result = { "confirm_value": "N" };
    resultObj.result = result;
    var r = confirm(message);
    if (r == true) {
      resultObj.result.confirm_value = "Y";
    }
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = -1;
    var result = { "confirm_value": "N" };
    resultObj.result = result;
    var r = confirm(message);
    if (r == true) {
      resultObj.result.confirm_value = "Y";
    }
    if (callback != null) {
      callback(resultObj);
    }
  }
  else {
    var parameter = { "params": { "message": message }, "callback": recordCallBack("appConfirm", callback) };
    jsCallApp('confirm', parameter);
  }
}


//获取当前终端位置坐标
function appGetGPS(callback) {
  //console.log("调用appGetGPS");
  if (debugMode) {
    var resultObj = {
      result: {
        lon: 121.404469 + (Math.floor(Math.random() * 1000) / 10000),
        lat: 31.137021 + (Math.floor(Math.random() * 1000) / 10000)
      },
      resultFlag: -1
    }
    if (callback != null) {
      callback(resultObj);
    }
    return;
  }
  if (igwMode) {
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
        }
        else {
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
            }
            else {
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
  } else {
    var parameter = { "params": {}, "callback": recordCallBack("appGetGPS", callback) };
    jsCallApp('getGPS', parameter);
  }

}

//获取全部文件
function appGetAllFileList(userId, callback) {
  if (debugMode) {
    var fileList = [];
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
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
    data.callback = encodeURIComponent(JSON.stringify({ "name": "appGetFileList", "count": 1 }));
    if (callback != undefined) {
      callback(data);
    }
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_appGetAllFileList"
      }
    }, function (res) {
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        var result = res.result.replaceAll(erowStr, "");
        if (isJSON(result)) {

          var fileList = JSON.parse(decodeURIComponent(result));
          var tempFileList = [];
          for (var i = 0; i < fileList.length; i++) {
            var tempFile = fileList[i];
            if (tempFile.upload_status == "NotUpload") {
              tempFileList.push(tempFile);
            }
          }

          resultObj.result = tempFileList;
        } else {
          var fileList = result;
          var tempFileList = [];
          for (var i = 0; i < fileList.length; i++) {
            var tempFile = fileList[i];
            if (tempFile.upload_status == "NotUpload") {
              tempFileList.push(tempFile);
            }
          }

          resultObj.result = tempFileList;
        }
        if (result == "") {
          resultObj.result = [];
        }
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
        resultObj.resultFlag = -1;
        resultObj.result = [];
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理

        resultObj.resultFlag = -1;
        resultObj.result = [];
      }
      if (callback != null) {
        callback(resultObj);
      }
    });
  } else {
    var parameter = { "params": { "userId": userId }, "callback": recordCallBack("appGetAllFileList", callback) };
    jsCallApp('getAllFile', parameter);
  }
}


//获取文件列表
function appGetFileList(userId, fnCode, instanceGuid, folderCode, callback) {
  if (debugMode) {
    var fileList = [];
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
    }
    var tempFileList = [];
    for (var i = 0; i < fileList.length; i++) {
      var tempFile = fileList[i];
      if (tempFile.fn_code == fnCode && tempFile.instance_guid == instanceGuid && tempFile.upload_status == "NotUpload") {
        tempFileList.push(tempFile);
      }
    }
    var data = {};
    data.result = tempFileList;
    data.resultFlag = -1;
    data.callback = encodeURIComponent(JSON.stringify({ "name": "appGetFileList", "count": 1 }));
    if (callback != undefined) {
      callback(data);
    }
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
      data: {
        key: appCode + "_" + userId + "_appGetAllFileList"
      }
    }, function (res) {
      if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
        resultObj.resultFlag = -1;
        //判断是否是json字符串
        var result = res.result.replaceAll(erowStr, "");
        if (isJSON(result)) {
          //{userId:[{"fn_code":"","instanceGuid":""."folderCode":"","fileGuid":"","fileCreateDate":"","fileType":"fileSize":""},{},{}]}
          var currentUserAllFile = JSON.parse(decodeURIComponent(result));
          var arr = [];
          for (var i = 0; i < currentUserAllFile.length; i++) {
            let item = currentUserAllFile[i];
            if (item.fn_code == fnCode && item.instance_guid == instanceGuid && item.upload_status == "NotUpload") {
              arr.push(item);
            }
          }
          resultObj.result = arr;
        } else {
          resultObj.result = [];
        }
        if (result == "") {
          resultObj.result = [];
        }
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
        //失败处理
        resultObj.resultFlag = -1;
        resultObj.result = [];
      }
      if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
        //取消处理
        resultObj.resultFlag = -1;
        resultObj.result = [];
      }
      if (callback != null) {
        callback(resultObj);
      }
    });
  } else {
    var parameter = {
      "params": {
        "userId": userId,
        "fnCode": fnCode,
        "instanceGuid": instanceGuid,
        "folderCode": folderCode
      },
      "callback": recordCallBack("appGetFileList", callback)
    };
    if (!debugMode) {
      jsCallApp('getFileList', parameter);
    }
  }
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
  if (!_IsWaiting) {
    return;
  }
  _IsWaiting = false;
  $("#loadingDiv").css("display", "none");
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
  }
}

//扫描二维码
function appScanQrcode(callback) {
  if (igwMode) {
    //console.log("调用appScanQrcode");
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    wx.scanQRCode({
      desc: 'scanQRCode desc',
      needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: function (res) {
        // 回调
        //console.log("appScanQrcode:成功" + JSON.stringify(res));
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

        //console.log("appScanQrcode:失败" + JSON.stringify(res));
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
  } else {
    var parameter = { "params": {}, "callback": recordCallBack("appScanQrcode", callback) };
    jsCallApp('scanQrcode', parameter);
  }
}

function appTakePhotoV2(userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback) {
  if (igwMode) {
    appTakePhoto(userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback);
  } else {
    let parameter = {
      "params": {
        "userId": userId,
        "fileName": fileName,
        "fnCode": fnCode,
        "instanceGuid": instanceGuid,
        "folderCode": folderCode,
        "uploadAPIPath": uploadAPIPath,
        "bizInfo": encodeURIComponent(JSON.stringify(bizInfo)),
        "pictureMaxSize": "600",
        "statusname": "",
        "fileGuid": ""
      },
      "callback": recordCallBack("appTakePhotoV2", callback)
    };

    jsCallApp('takePhotoV2', parameter);
  }
}

// options: fileName, fnCode, instanceGuid, uploadAPIPath, bizInfo, willUploadFile, complete
// options.sourceType: camera, album
function igwTakePhotoThenUpload(options) {
  let resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = "";
  resultObj.errMsg = "";
  appGetGPS(function (gpsData) {
    let longitude = gpsData.result.lon;
    let latitude = gpsData.result.lat;
    resultObj.gps = { lon: longitude, lat: latitude, locationType: "BD09"};
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
                    Token: _Token,
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
                  formData.append("detail", JSON.stringify({ json: params }));
                  $.ajax({
                    url: url,
                    type: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (ret) {
                      if (ret.type == -1) {
                        resolve();
                      }
                      else {
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
            }
            else {
              resultObj.resultFlag = "0";
              resultObj.errMsg = `上传${localIds.length}个文件，成功${successCount}个`;
              rej();
            }
          }
          else {
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

//开始摄像
function appTakePhoto(userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback) {
  if (debugMode) {
    var newfileName = encodeURIComponent(fileName) + '_' + new Date().Format("yyyy_MM_dd_hh_mm_ss");
    var fileObj = {};
    fileObj.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
    fileObj.create_time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    fileObj.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
    fileObj.file_guid = "";
    fileObj.file_id = uuid();
    fileObj.file_name = fileName + ".jpg";
    fileObj.localFileName = (instanceGuid + "_" + new Date().getTime()) + ".jpg";
    fileObj.file_path = fileName + ".jpg";
    fileObj.file_size = "0.01MB";
    fileObj.file_type = "Picture";
    fileObj.contentType = "image/jpeg";
    fileObj.fn_code = fnCode;
    fileObj.folder_code = folderCode;
    fileObj.instance_Guid = instanceGuid;
    fileObj.lat = "31.135091";
    fileObj.lon = "121.362672";
    fileObj.needPrimaryValueWhenInsert = false;
    fileObj.remark = "";
    fileObj.system_id = "42";
    fileObj.upload_api_path = uploadAPIPath;
    fileObj.upload_status = "NotUpload";
    fileObj.user_id = userId;
    fileObj.Token = _Token;
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] == undefined) {
      localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify([]));
    }
    var fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
    fileList.push(fileObj);
    localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify(fileList));
    var data = {};
    data.callback = encodeURIComponent(JSON.stringify({ "name": "appTakePhoto", "count": 1 }));
    data.resultFlag = -1;
    data.result = { fileName: newfileName, confirm_value: 'Y', remark: '' };
    if (callback != undefined) callback(data);
    return;
  }
  if (igwMode) {
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    let fileInfo = {};
    appGetGPS(function (gpsData) {
      var longitude = gpsData.result.lon;
      var latitude = gpsData.result.lat;
      new Promise((res, rej) => {
        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
          quality: 0.1, //压缩质量，范围0～1，数值越小，质量越低，压缩率越高（仅对jpg有效）
          success: function (data) {
            fileInfo.file_path = data.localIds[0];
            res(fileInfo.file_path);
          },
          fail: function (err) {
            resultObj.errMsg = "拍照组件异常！";
            rej();
          }
        });
      }).then(localId => {
        return new Promise(res => {
          wx.getLocalImgData({
            localId: localId,
            success: function (data) {
              res(data.localData);
            }
          });
        });
      }).then(fileData => {
        return new Promise((res, rej) => {
          __getZipAppDirectory().then(folderPath => {
            res({ folderPath, fileData });
          }).catch(() => {
            resultObj.errMsg = "文件夹路径获取失败";
            rej();
          });
        });
      }).then(file => {

        return new Promise((res, rej) => {
          fileInfo.file_name = fileName + ".jpg";
          if (outFlag == -1) {
            fileInfo.file_path = __mediaFolderName;
          }
          fileInfo.localFileName = (instanceGuid + "_" + new Date().getTime()) + ".jpg";
          console.log("图片地址：" + file.folderPath + fileInfo.localFileName);
          if (outFlag == -1) {
            wx.invoke("ext_FileManager_Write", {
              data: {
                path: file.folderPath,
                /* name: fileInfo.file_name,*/
                name: fileInfo.localFileName,
                data: file.fileData,
                type: "TEXT",
              }
            }, function (ret) {
              if (ret.err_msg === "ext_FileManager_Write:ok") {
                res();
              }
              else {
                resultObj.errMsg = "文件保存失败";
                rej();
              }
            });
          } else {
            res();
          }
        });

      }).then(() => {
        appGetAllFileList(userId, function (rData) {
          if (rData.resultFlag == -1) {
            let allFileList = rData.result;
            fileInfo.user_id = userId;
            fileInfo.Token = _Token;
            fileInfo.fn_code = fnCode;
            fileInfo.instance_guid = instanceGuid;
            fileInfo.folder_code = folderCode;
            fileInfo.upload_api_path = uploadAPIPath;
            fileInfo.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
            fileInfo.pictureMaxSize = "600";
            fileInfo.statusname = "";
            fileInfo.file_guid = "";
            fileInfo.contentType = "image/jpeg";
            fileInfo.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
            fileInfo.file_size = "";
            fileInfo.file_type = "Picture";
            fileInfo.remark = "";
            fileInfo.lon = longitude;
            fileInfo.lat = latitude;
            fileInfo.upload_status = 'NotUpload';
            fileInfo.file_id = uuid();
            allFileList.push(fileInfo);
            wx.invoke("ext_DataCache_SaveInfo", {
              data: {
                key: appCode + "_" + userId + "_appGetAllFileList",
                message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
              }
            }, function (res) {
              if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                resultObj.resultFlag = -1;
              }
              if (callback) callback(resultObj);
            });
          }
        });
      }).catch(err => {
        if (callback) callback(resultObj);
      });
    });
  } else {
    var parameter = {
      "params": {
        "userId": userId,
        "fileName": fileName,
        "fnCode": fnCode,
        "instanceGuid": instanceGuid,
        "folderCode": folderCode,
        "uploadAPIPath": uploadAPIPath,
        "bizInfo": encodeURIComponent(JSON.stringify(bizInfo)),
        "pictureMaxSize": "600",
        "statusname": "",
        "fileGuid": ""
      },
      "callback": recordCallBack("appTakePhoto", callback)
    };
    jsCallApp('takePhoto', parameter);
  }
}

//开始录音
var _RecorduserId, _RecordfileName, _RecordfnCode, _RecordinstanceGuid, _RecordfolderCode, _RecordfileGuid, _RecorduploadAPIPath, _RecordbizInfo = "";
function appBeginRecord(userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback, stopCallback) {
  if (debugMode) {
    var newfileName = encodeURIComponent(fileName) + '_' + new Date().Format("yyyy_MM_dd_hh_mm_ss");
    var fileObj = {};
    fileObj.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
    fileObj.create_time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    fileObj.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
    fileObj.file_guid = "";
    fileObj.file_id = uuid();
    fileObj.file_name = fileName + ".amr";
    fileObj.localFileName = (instanceGuid + "_" + new Date().getTime()) + ".amr";
    fileObj.file_path = fileName + ".amr";
    fileObj.file_size = "0.01MB";
    fileObj.file_type = "Audio";
    fileObj.contentType = "application/octet-stream";
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
    fileObj.Token = _Token;
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] == undefined) {
      localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify([]));
    }
    var fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
    fileList.push(fileObj);
    localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify(fileList));
    var data = {};
    data.callback = encodeURIComponent(JSON.stringify({ "name": "appBeginRecord", "count": 1 }));
    data.resultFlag = -1;
    data.result = { fileName: newfileName, confirm_value: 'Y', remark: '' };
    if (callback != undefined) callback(data);
    return;
  }
  if (igwMode) {
    //console.log("调用appBeginRecord");
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    wx.stopRecord({
      success: function (res) {
        //console.log(" wx.stopRecord成功:" + JSON.stringify(res));
        //console.log("开始录制");
        wx.startRecord();
        //console.log(" wx.startRecord成功:" + JSON.stringify(res));
        resultObj.resultFlag = -1;
        _RecorduserId = userId;
        _RecordfileName = fileName;
        _RecordLocalFileName = (instanceGuid + "_" + new Date().getTime());
        _RecordfnCode = fnCode;
        _RecordinstanceGuid = instanceGuid;
        _RecordfolderCode = folderCode;
        _RecordfileGuid = fileGuid;
        _RecorduploadAPIPath = uploadAPIPath;
        _RecordbizInfo = bizInfo;
        wx.onVoiceRecordEnd({
          // 录音时间超过一分钟没有停止的时候会执行 complete 回调
          complete: function (res) {
            //console.log("录音自动停止：" + JSON.stringify(res));
            var localId = res.localId;
            if (stopCallback != null) {
              stopCallback();
            }
          }
        });
        if (callback != null) callback(resultObj);
      },
      fail: function (res) {
        wx.startRecord();
        //console.log(" wx.startRecord成功:" + JSON.stringify(res));
        resultObj.resultFlag = -1;
        _RecorduserId = userId;
        _RecordfileName = fileName;
        _RecordLocalFileName = (instanceGuid + "_" + new Date().getTime());
        _RecordfnCode = fnCode;
        _RecordinstanceGuid = instanceGuid;
        _RecordfolderCode = folderCode;
        _RecordfileGuid = fileGuid;
        _RecorduploadAPIPath = uploadAPIPath;
        _RecordbizInfo = bizInfo;
        wx.onVoiceRecordEnd({
          // 录音时间超过一分钟没有停止的时候会执行 complete 回调
          complete: function (res) {
            //console.log("录音自动停止：" + JSON.stringify(res));
            var localId = res.localId;
            if (stopCallback != null) stopCallback();
          }
        });
        if (callback != null) {
          callback(resultObj);
        }
      }
    });
  }
  else {
    var parameter = {
      "params": {
        "userId": userId,
        "fileName": fileName,
        "fnCode": fnCode,
        "instanceGuid": instanceGuid,
        "folderCode": folderCode,
        "fileGuid": fileGuid,
        "uploadAPIPath": uploadAPIPath,
        "bizInfo": encodeURIComponent(JSON.stringify(bizInfo)),
      }, "callback": recordCallBack("appBeginRecord", callback)
    };
    jsCallApp('beginRecord', parameter);
  }
}
//停止录音
function appStopRecord(callback) {
  //console.log("调用appStopRecord");
  if (debugMode) {
    var resultObj = {};
    resultObj.resultFlag = -1;
    resultObj.result = "";
    resultObj.errMsg = "";
    if (callback != null) callback(resultObj);
  }
  else {
    if (igwMode) {
      var resultObj = {};
      resultObj.resultFlag = 0;
      resultObj.result = "";
      resultObj.errMsg = "";
      wx.stopRecord({
        success: function (res) {
          //console.log(" wx.stopRecord:成功" + JSON.stringify(res));
          var localId = res.localId;
          appGetGPS(function (gpsData) {
            var longitude = gpsData.result.lon;
            var latitude = gpsData.result.lat;
            //存一下文件记录
            appGetAllFileList(_RecorduserId, function (rData) {
              if (rData.resultFlag == -1) {
                var allFileList = rData.result;
                var fileInfo = {};
                fileInfo.user_id = _RecorduserId;
                fileInfo.Token = _Token;
                fileInfo.file_name = _RecordfileName + ".silk";
                fileInfo.localFileName = _RecordLocalFileName + ".silk";
                fileInfo.fn_code = _RecordfnCode;
                fileInfo.instance_guid = _RecordinstanceGuid;
                fileInfo.folder_code = _RecordfolderCode;
                fileInfo.upload_api_path = _RecorduploadAPIPath;
                fileInfo.biz_info = encodeURIComponent(JSON.stringify(_RecordbizInfo));
                fileInfo.pictureMaxSize = "600";
                fileInfo.statusname = "";
                fileInfo.file_guid = "";
                fileInfo.contentType = "application/octet-stream";
                fileInfo.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
                fileInfo.file_path = localId;
                fileInfo.file_size = "";
                fileInfo.file_type = "Audio";
                fileInfo.remark = "";
                fileInfo.lon = longitude;
                fileInfo.lat = latitude;
                fileInfo.upload_status = 'NotUpload';
                fileInfo.file_id = uuid();
                allFileList.push(fileInfo);
                wx.invoke("ext_DataCache_SaveInfo", {
                  data: {
                    key: appCode + "_" + _RecorduserId + "_appGetAllFileList",
                    message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
                  }
                }, function (res) {
                  if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                    resultObj.resultFlag = -1;
                  }
                  else if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                    //失败处理
                  }
                  else if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                    //取消处理
                  }

                  if (callback != null) callback(resultObj);
                });
              }
            });
          });
        },
        fail: function (res) {
          //console.log(" wx.stopRecord失败:" + JSON.stringify(res));
          resultObj.errMsg = "录音组件异常！";
          if (callback != null) callback(resultObj);
        }
      });
    }
    else {
      var parameter = { "params": {}, "callback": recordCallBack("appStopRecord", callback) };
      jsCallApp('stopRecord', parameter);
    }
  }
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
function appBeginRecordV2(userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback) {
  if (debugMode || !igwMode) {
    appBeginRecord(userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback);
  }
  else {
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
    __getZipAppDirectory().then(folderPath => {
      _recorderInfo.filePath = folderPath;
      wx.invoke("ext_VoiceRecord_Start", {
        data: {
          recordFilePath: _recorderInfo.filePath,
          /*recordFileName: _recorderInfo.fileName,*/
          recordFileName: _recorderInfo.localFileName,
          channelId,
        },
      }, function (res) {
        console.log("ext_VoiceRecord_Start", res);
        if (res.err_msg === "ext_VoiceRecord_Start:ok") {
          _recorderInfo.isRecording = true;
          resultObj.resultFlag = -1;
        }
        else {
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
}

function igwAudioRecordStopThenUpload(complete) {
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
      appGetGPS(function (gpsData) {
        let longitude = gpsData.result.lon;
        let latitude = gpsData.result.lat;
        resultObj.gps = { lon: longitude, lat: latitude, locationType: "BD09" };
        let params = {
          action: "upload",
          Token: _Token,
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
              detail: JSON.stringify({ json: params }),
            },
            header: {},
            id: realChannelId,
            appCode: "",
            timeout: 120,
            files: { keyA: localFilePath }
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
          } 
          catch (ex) {
            resultObj.errMsg = "上传文件失败";
            if (complete) complete(resultObj);            
          }
        });
      });
    }
    else {
      resultObj.resultFlag = 0;
      resultObj.errMsg = res.msg;
      if (complete) complete(resultObj);
    }
  });  
}

function appStopRecordV2(callback) {
  if (debugMode || !igwMode) {
    appStopRecord(callback);
  }
  else {
    let resultObj = {
      resultFlag: 0,
      result: "",
      errMsg: "",
    }
    wx.invoke("ext_VoiceRecord_Stop", {
      data: {
        recordFilePath: _recorderInfo.filePath,
        /*recordFileName: _recorderInfo.fileName,*/
        recordFileName: _recorderInfo.localFileName,
      }
    }, function (res) {
      _recorderInfo.isRecording = false;
      console.log("ext_VoiceRecord_Stop", res);
      if (res.err_msg === "ext_VoiceRecord_Stop:ok") {
        appGetGPS(function (gpsData) {
          let longitude = gpsData.result.lon;
          let latitude = gpsData.result.lat;
          //存一下文件记录
          appGetAllFileList(_recorderInfo.userId, function (rData) {
            if (rData.resultFlag == -1) {
              let allFileList = rData.result;
              let fileInfo = {};
              fileInfo.user_id = _recorderInfo.userId;
              fileInfo.Token = _Token;
              fileInfo.file_name = _recorderInfo.fileName;
              fileInfo.localFileName = _recorderInfo.localFileName;
              fileInfo.fn_code = _recorderInfo.fnCode;
              fileInfo.instance_guid = _recorderInfo.instanceGuid;
              fileInfo.folder_code = _recorderInfo.folderCode;
              fileInfo.upload_api_path = _recorderInfo.uploadAPIPath;
              fileInfo.biz_info = encodeURIComponent(JSON.stringify(_recorderInfo.bizInfo));
              fileInfo.statusname = "";
              fileInfo.file_guid = "";
              fileInfo.contentType = "audio/mp3";
              fileInfo.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
              fileInfo.file_path = __mediaFolderName;
              fileInfo.file_size = "";
              fileInfo.file_type = "Audio";
              fileInfo.remark = "";
              fileInfo.lon = longitude;
              fileInfo.lat = latitude;
              fileInfo.upload_status = 'NotUpload';
              fileInfo.file_id = uuid();
              allFileList.push(fileInfo);
              wx.invoke("ext_DataCache_SaveInfo", {
                data: {
                  key: appCode + "_" + _recorderInfo.userId + "_appGetAllFileList",
                  message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
                }
              }, function (res) {
                if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                  resultObj.resultFlag = -1;
                }
                else {
                  resultObj.errMsg = "文件保存失败";
                }

                if (callback) callback(resultObj);
              });
            }
          });
        });
      }
      else {
        resultObj.resultFlag = 0;
        resultObj.errMsg = res.msg;
        if (callback) callback(resultObj);
      }
    });
  }
}

//删除某一个文件
function appDeleteFile(fileName, callback) {
  if (debugMode) {
    var fileList = [];
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
    }
    for (var i = 0; i < fileList.length; i++) {
      var fileItem = fileList[i];
      if (fileList[i].file_name == fileName) {
        fileList.remove(fileItem);
      }
    }
    localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify(fileList));
    var data = {};
    data.callback = encodeURIComponent(JSON.stringify({ "name": "appDeleteFile", "count": 1 }));
    data.resultFlag = -1;
    data.result = { confirm_value: 'Y', remark: '' };
    if (callback != undefined) callback(data);
    return;
  }
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    appGetAllFileList(_UserID, function (rData) {
      if (rData.resultFlag == -1) {
        var allFileList = rData.result;
        for (var i = 0; i < allFileList.length; i++) {
          let item = allFileList[i];
          if (item.file_name == fileName) {
            allFileList.remove(item);
          }
        }
        wx.invoke("ext_DataCache_SaveInfo", {
          data: {
            key: appCode + "_" + _UserID + "_appGetAllFileList",
            message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
          }
        }, function (res) {
          if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
            resultObj.resultFlag = -1;
          }
          else if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
            //失败处理
          }
          else if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
            //取消处理
          }

          if (callback != null) callback(resultObj);
        });
      }
    });
  }
  else {
    var parameter = { "params": { "fileName": fileName }, "callback": recordCallBack("appDeleteFile", callback) };
    jsCallApp('deleteFile', parameter);
  }
}

//查看某一文件
function appViewFile(fileName, callback, folderCode) {
  if (igwMode) {
    var resultObj = {};
    resultObj.resultFlag = -1;
    resultObj.result = "";
    resultObj.errMsg = "";
    appGetAllFileList(_UserID, function (rData) {
      if (rData.resultFlag == -1) {
        var allFileList = rData.result;
        for (var i = 0; i < allFileList.length; i++) {
          let item = allFileList[i];
          if (item.file_name == fileName) {

            let filePath = item.filePath;
            //console.log(filePath);
            let contentType = item.contentType;
            if (contentType == "image/jpeg") {

            }
            else if (contentType == "application/octet-stream") {
              wx.playVoice({
                localId: filePath // 需要播放的音频的本地ID，由stopRecord接口获得
              });
            }
            else if (contentType == "video/mp4") {

            }
            else if (callback != null) {
              callback(resultObj);
            }
          }
        }
      }
    });
  }
  else {
    var parameter = { "params": { "fileName": fileName, "folderCode": folderCode }, "callback": recordCallBack("appViewFile", callback) };
    jsCallApp('viewFile', parameter);
  }
}

function igwShootingThenUpload(options) {
  let resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = "";
  resultObj.errMsg = "";
  appGetGPS(function (gpsData) {
    let longitude = gpsData.result.lon;
    let latitude = gpsData.result.lat;
    resultObj.gps = { lon: longitude, lat: latitude, locationType: "BD09" };
    wx.invoke("chooseVideo", {
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
    }, function (res) {
      if (res.err_msg === "chooseVideo:ok") {
        let localIds = typeof res.localIds == 'object' ? res.localIds : JSON.parse(res.localIds); // 返回生成视频的本地ID，需要typeof判断兼容各个终端
        // let thumbnail = res.thumbnail; // 视频封面缩略图
        let params = {
          action: "upload",
          Token: _Token,
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
                  detail: JSON.stringify({ json: params }),
                },
                header: {},
                id: realChannelId,
                appCode: "",
                timeout: 120,
                files: { keyA: localFilePath }
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
              } 
              catch (ex) {
                resultObj.errMsg = "上传文件失败";
                if (options.hasOwnProperty("complete")) options.complete(resultObj);            
              }
            });
          }
          else {
            resultObj.errMsg = "获取本地文件路径失败";
            if (options.hasOwnProperty("complete")) options.complete(resultObj);
          }
        });
      } 
      else {
        if ((res.err_msg || '').toLocaleLowerCase() != "chooseVideo:cancel".toLocaleLowerCase()) {
          resultObj.errMsg = "摄像组件异常！";
        }
        if (options.hasOwnProperty("complete")) options.complete(resultObj);
      }
    });
  });
}

//开始摄像
function appBeginCamera(userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback) {
  if (debugMode) {
    var newfileName = encodeURIComponent(fileName) + '_' + new Date().Format("yyyy_MM_dd_hh_mm_ss");
    var fileObj = {};
    fileObj.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
    fileObj.create_time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    fileObj.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
    fileObj.file_guid = "";
    fileObj.file_id = uuid();
    fileObj.file_name = fileName + ".mp4";
    fileObj.localFileName = (instanceGuid + "_" + new Date().getTime()) + ".mp4";
    fileObj.file_path = fileName + ".mp4";
    fileObj.file_size = "0.01MB";
    fileObj.file_type = "Video";
    fileObj.contentType = "video/mp4";
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
    fileObj.Token = _Token;
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] == undefined) {
      localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify([]));
    }
    var fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
    fileList.push(fileObj);
    localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify(fileList));

    var data = {};
    data.callback = encodeURIComponent(JSON.stringify({ "name": "appBeginCamera", "count": 1 }));
    data.resultFlag = -1;
    data.result = { fileName: newfileName, confirm_value: 'Y', remark: '' };
    if (callback != undefined) callback(data);
    return;
  }

  if (igwMode) {
    //console.log("调用appBeginCamera");
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    appGetGPS(function (gpsData) {
      let longitude = gpsData.result.lon;
      let latitude = gpsData.result.lat;
      wx.invoke("chooseVideo", {
        sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      }, function (res) {
        //console.log("chooseVideo 回调:" + JSON.stringify(res));
        if (res.err_msg === "chooseVideo:ok") {
          let localIds = typeof res.localIds == 'object' ? res.localIds : JSON.parse(res.localIds); // 返回生成视频的本地ID，需要typeof判断兼容各个终端
          // let thumbnail = res.thumbnail; // 视频封面缩略图
          appGetAllFileList(userId, function (rData) {
            if (rData.resultFlag == -1) {
              var allFileList = rData.result;
              var fileInfo = {};
              fileInfo.user_id = userId;
              fileInfo.Token = _Token;
              fileInfo.file_name = fileName + ".mp4";
              fileInfo.localFileName = (instanceGuid + "_" + new Date().getTime()) + ".mp4";
              fileInfo.fn_code = fnCode;
              fileInfo.instance_guid = instanceGuid;
              fileInfo.folder_code = folderCode;
              fileInfo.upload_api_path = uploadAPIPath;
              fileInfo.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
              fileInfo.pictureMaxSize = "600";
              fileInfo.statusname = "";
              fileInfo.file_guid = "";
              fileInfo.contentType = "video/mp4";
              fileInfo.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
              fileInfo.file_path = localIds[0];
              fileInfo.file_size = "";
              fileInfo.file_type = "Video";
              fileInfo.remark = "";
              fileInfo.lon = longitude;
              fileInfo.lat = latitude;
              fileInfo.upload_status = 'NotUpload';
              fileInfo.file_id = uuid();
              allFileList.push(fileInfo);
              wx.invoke("ext_DataCache_SaveInfo", {
                data: {
                  key: appCode + "_" + userId + "_appGetAllFileList",
                  message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
                }
              }, function (res) {
                if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                  resultObj.resultFlag = -1;
                }
                else if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                  //失败处理
                }
                else if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                  //取消处理
                }

                if (callback != null) callback(resultObj);
              });
            }
          });
        } else {
          if ((res.err_msg || '').toLocaleLowerCase() != "chooseVideo:cancel".toLocaleLowerCase()) {
            resultObj.errMsg = "摄像组件异常！";
          }
          if (callback != null) callback(resultObj);
        }
      });
    });
  }
  else {
    var parameter = {
      "params": {
        "userId": userId,
        "fileName": fileName,
        "fnCode": fnCode,
        "instanceGuid": instanceGuid,
        "folderCode": folderCode,
        "fileGuid": fileGuid,
        "uploadAPIPath": uploadAPIPath,
        "bizInfo": encodeURIComponent(JSON.stringify(bizInfo)),
      }, "callback": recordCallBack("appBeginCamera", callback)
    };
    jsCallApp('beginCamera', parameter);
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

function appUploadFileV2(Token, userId, fnCode, instanceGuid, folderCode, callback) {
  appUploadFile(Token, userId, fnCode, instanceGuid, folderCode, callback);
}

function appUploadFileNameV2(Token, fileName, callback) {
  appUploadFileName(Token, fileName, callback);
}

//上传单个文件
function appUploadFileName(tokenId, fileName, callback) {
  let resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = { success_count: 0 };
  resultObj.errMsg = "";
  appGetAllFileList(_UserID, function (rData) {
    if (rData.resultFlag == -1) {
      let allFileList = rData.result;
      for (let i = 0; i < allFileList.length; i++) {
        let item = allFileList[i];
        if (item.file_name == fileName) {
          let filePath = item.file_path;
          let contentType = item.contentType;

          let param = {
            action: "upload",
            Token: _Token,
            instanceGuid: item.instance_guid,
            FnCode: item.fn_code,
            longitude: item.lon,
            latitude: item.lat,
            remark: item.remark,
            fileName: item.file_name,
            bizInfo: item.biz_info,
            uploadAPIPath: item.upload_api_path,
            localFileName: item.localFileName
          };

          __uploadFile(filePath, contentType, new Date().getTime(), param, item).then(ret => {
            //console.log("__uploadFile :", ret);
            if (ret.type == "-1") {
              item.file_guid = ret.data;
              item.upload_status = "Uploaded";

              let completeCallback = function () {
                resultObj.resultFlag = -1;
                resultObj.result.success_count = 1;
                if (callback != null) callback(resultObj);
              };
              if (!igwMode) {
                completeCallback();
              }
              else {
                let key = appCode + "_" + _UserID + "_appGetAllFileList";
                __syncLocalData(key, allFileList).then(() => {
                  completeCallback();
                }).catch(() => {
                  if (callback != null) callback(resultObj);
                });
              }
            }
            else {
              resultObj.errMsg = "文件上传失败";
              if (callback != null) callback(resultObj);
            }
          }).catch(() => {
            resultObj.errMsg = "文件上传失败";
            if (callback != null) callback(resultObj);
          });
          break;
        }
      }
    }
  });
  // let parameter = { "params": { "tokenId": tokenId, "fileName": fileName }, "callback": recordCallBack("fileName", callback) };
  // jsCallApp('uploadFileName', parameter);
}

function __uploadFile(filePath, contentType, channelId, params, file) {
  return new Promise((resolve, reject) => {
    if (debugMode) {
      debugModeUploadFile(ServerUploadFilePath, params, params.fileName, resolve, reject);
    }
    else if (igwMode) {
      __getLocalResPath(filePath, contentType, (params.localFileName || params.fileName)).then(localFilePath => {
        let realChannelId = "event_Net_upLoad_" + channelId;
        var url = (outFlag == -1 ? ("http://127.0.0.1:" + portResult + "/" + ServerUploadFilePath) : ServerUploadFilePath);
        console.log(url);
        if (file.file_path == __mediaFolderName && file.file_type == "Picture") {

          if (outFlag == -1) {
            wx.invoke("ext_FileManager_Read", {
              data: {
                path: localFilePath,
                type: "TEXT",
              }
            }, function (res) {
              if (res.err_msg === "ext_FileManager_Read:ok") {
                let base64Str = dataURLtoFile(res.result, params.fileName);
                let formData = new FormData();
                formData.append("file", base64Str);
                formData.append("detail", JSON.stringify({ json: params }));
                $.ajax({
                  url: url,
                  type: "POST",
                  data: formData,
                  processData: false,
                  contentType: false,
                  async: true,
                  success: function (rData) {
                    resolve(rData);
                  },
                  error: function (rData) {
                    reject();
                  }
                });
              }
              else {
                reject();
              }
            });
          } else {



          }
        }
        else {
          wx.invoke("ext_Net_Upload", {
            data: {
              url: url,
              data: {
                detail: JSON.stringify({ json: params }),
              },
              header: {},
              id: realChannelId,
              appCode: "",
              timeout: 120,
              files: { keyA: localFilePath }
            }
          }, function (res) {
            console.log("ext_Net_Upload :", params.fileName, res);
            try {
              if (res.event.toLowerCase() === "success") {
                let re = JSON.parse(res.result);
                resolve(re);
              }
              else if (res.event.toLowerCase() === "fail") {
                reject();
              }
            } catch (ex) {
              reject();
            }
          });
        }
      }).catch(() => {
        reject();
      });
    }
    else {
      erowUploadFile(ServerUploadFilePath, {
        detail: JSON.stringify({ json: params }),
      }, file.file_id, "uploadedfile", file.file_name, file.file_path, null, data => {
        if (data.resultFlag == "-1") {
          data.result.type = "-1";
          resolve(data.result);
        }
        else {
          reject();
        }
      });
    }
  });
}

function __getLocalResPath(filePath, contentType, fileName) {
  return new Promise((resolve, reject) => {
    if (contentType == "application/octet-stream") {
      resolve(filePath);
    }
    else if (filePath == __mediaFolderName) {
      __getZipAppDirectory().then(ret => {
        resolve(ret + fileName);
      }).catch(() => {
        reject();
      });
    }
    else {
      wx.invoke("getLocalResPath", {
        localId: filePath,
      }, function (res) {
        resolve(res.localResPath);
      });
    }
  });
}

async function __syncLocalData(key, data) {
  return new Promise((resolve, reject) => {
    if (debugMode) {
      resolve();
    }
    else {
      wx.invoke("ext_DataCache_SaveInfo", {
        data: {
          key,
          message: encodeURIComponent(JSON.stringify(data)) + erowStr
        }
      }, function (res) {
        if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
          resolve();
        }
        else if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {// 失败处理
          reject();
        }
        else if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {// 取消处理
          reject();
        }
      });
    }
  });
}

var __zipAppDirectory = ""; // 勿手动赋值
const __mediaFolderName = "mediaFiles";
function __getZipAppDirectory() {
  return new Promise((resolve, reject) => {
    if (__zipAppDirectory == "") {
      wx.invoke("getZipAppDirectory", {
        type: "STORAGE_ROOT_DIR",
        //type: "APP_ROOT_DIR",
      }, function (res) {
        if (res.err_msg === "getZipAppDirectory:ok") {
          __zipAppDirectory = res.directory;
          resolve(__zipAppDirectory);
        }
        else {
          reject();
        }
      });
    }
    else {
      resolve(__zipAppDirectory);
    }
  });
}

function __getMediaFilesPath() {
  return new Promise((resolve, reject) => {
    __getZipAppDirectory().then(ret => {
      resolve(ret + __mediaFolderName + "/");
    }).catch(() => {
      reject();
    });
  });
}

// 上传全部文件
function appUploadAllFile(Token, userId, callback) {
  let resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = { success_count: 0 };
  resultObj.errMsg = "";
  new Promise((resolve, reject) => {
    appGetAllFileList(userId, function (data) {
      if (data.resultFlag == -1) {
        let allFileList = data.result;
        if (Array.isArray(allFileList) && allFileList.length > 0) {
          resolve(allFileList);
          return;
        }
      }
      resultObj.errMsg = "没有待上传的文件";
      reject(resultObj);
    });
  }).then(async ret => {
    let successCnt = 0;
    let tot = 0;
    for (let file of ret) {
      if (file.upload_status != "NotUpload") continue;
      tot++;
      let filePath = file.file_path;
      // let fileId = file.fileId;
      let contentType = file.contentType;
      let params = {
        action: "upload",
        Token: _Token,
        instanceGuid: file.instance_guid,
        FnCode: file.fn_code,
        longitude: file.lon,
        latitude: file.lat,
        remark: file.remark,
        fileName: file.file_name,
        bizInfo: file.biz_info,
        localFileName: file.localFileName
      };
      await __uploadFile(filePath, contentType, new Date().getTime(), params, file).then(async ret => {
        //console.log("__uploadFile " + params.fileName + " :", ret);
        if (ret.type == "-1") {
          file.file_guid = ret.data;
          file.upload_status = "Uploaded";
          successCnt++;
        }
      })
    }
    let completeCallback = function () {
      resultObj.resultFlag = -1;
      resultObj.result.success_count = successCnt;
      if (successCnt < tot) {
        resultObj.errMsg = "上传失败";
      }
      if (callback != null) callback(resultObj);
    };
    if (!igwMode) {
      completeCallback();
    }
    else {
      let key = appCode + "_" + _UserID + "_appGetAllFileList";
      await __syncLocalData(key, ret).then(() => {
        completeCallback();
      }).catch(() => {
        if (callback != null) callback(resultObj);
      });
    }
  }).catch(err => {
    if (callback) callback(resultObj);
  });
  // var parameter = { "params": { "tokenId": tokenId, "userId": userId }, "callback": recordCallBack("appUploadAllFile", callback) };
  // jsCallApp('uploadAllFile', parameter);
}

//上传文件列表
function appUploadFile(tokenId, userId, fnCode, instanceGuid, folderCode, callback) {
  let resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = { success_count: 0 };
  resultObj.errMsg = "";

  new Promise((resolve, reject) => {
    appGetAllFileList(userId, function (data) {
      if (data.resultFlag == -1) {
        let allFileList = data.result;
        if (Array.isArray(allFileList) && allFileList.length > 0) {
          resolve(allFileList);
          return;
        }
      }
      resultObj.errMsg = "没有待上传的文件";
      reject(resultObj);
    });
  }).then(async ret => {
    let successCnt = 0;
    let tot = 0;
    for (let file of ret) {
      if (file.upload_status != "NotUpload" ||
        file.fn_code != fnCode ||
        file.instance_guid != instanceGuid ||
        file.folder_code != folderCode ||
        file.user_id != userId)
        continue;
      tot++;
      let filePath = file.file_path;
      let contentType = file.contentType;
      let params = {
        action: "upload",
        Token: _Token,
        instanceGuid: file.instance_guid,
        FnCode: file.fn_code,
        longitude: file.lon,
        latitude: file.lat,
        remark: file.remark,
        fileName: file.file_name,
        bizInfo: file.biz_info,
        localFileName: file.localFileName
      };
      await __uploadFile(filePath, contentType, new Date().getTime(), params, file).then(async ret => {
        //console.log("__uploadFile " + params.fileName + " :", ret);
        if (ret.type == "-1") {
          file.file_guid = ret.data;
          file.upload_status = "Uploaded";
          successCnt++;
        }
      });
    }
    let completeCallback = function () {
      resultObj.resultFlag = -1;
      resultObj.result.success_count = successCnt;
      if (successCnt < tot) {
        resultObj.errMsg = "上传失败";
      }
      if (callback != null) callback(resultObj);
    };
    if (!igwMode) {
      completeCallback();
    }
    else {
      let key = appCode + "_" + _UserID + "_appGetAllFileList";
      await __syncLocalData(key, ret).then(() => {
        completeCallback();
      }).catch(() => {
        if (callback != null) callback(resultObj);
      });
    }
  }).catch(() => {
    if (callback) callback(resultObj);
  });
  // var parameter = { "params": { "tokenId": tokenId, "userId": userId, "fnCode": fnCode, "instanceGuid": instanceGuid, "folderCode": folderCode }, "callback": recordCallBack("appUploadFile", callback) };
  // if (osType) {
  //   jsCallApp('uploadFil', parameter);
  // } else {
  //   jsCallApp('uploadFile', parameter);
  // }
}

function appGetAudioCommandConfig() {
  var resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = "";
  resultObj.errMsg = "";
  return;
}

function appPreFeature(userId, userType, userName, callback) {
  var resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = "";
  resultObj.errMsg = "";
  if (callback != null) {
    return resultObj;
  }
}

//刷新本地文件记录
function updateLocalFileData(fileName, fnCode, instanceGuid, fileGuid, callback) {
  var resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.result = "";
  resultObj.errMsg = "";
  appGetAllFileList(_UserID, function (rData) {
    if (rData.resultFlag == -1) {
      var allFileList = rData.result;
      for (var i = 0; i < allFileList.length; i++) {
        if (allFileList[i].file_name == fileName && allFileList[i].fn_code == fnCode && allFileList[i].instance_guid == instanceGuid) {
          allFileList[i].file_guid = fileGuid;
          allFileList[i].upload_status = "Uploaded";
          break;
        }
      }
      wx.invoke("ext_DataCache_SaveInfo", {
        data: {
          key: appCode + "_" + _UserID + "_appGetAllFileList",
          message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
        }
      }, function (res) {
        if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
          resultObj.resultFlag = -1;
        }
        if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
          //失败处理
        }
        if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
          //取消处理
        }

        if (callback != null) {
          callback(resultObj);
        }
      });
    }
  });
}

//插入一条数据  后勤用
function appSetTable(userId, tbName, keyValue, colName, colValue, showOrder, colNameValues, lastUpdateDate, callback) {
  //alert("appSetTable");
  if (igwMode) {
    if (debugMode) {
      localStorage[appCode + "_" + tbName + '|' + keyValue + '|' + userId] = JSON.stringify({
        user_id: userId,
        tb_name: tbName,
        key_value: keyValue,
        col_name: colName,
        col_value: colValue,
        show_order: showOrder,
        col_name_values: colNameValues,
        last_update_date: lastUpdateDate
      });
      var resultObj = {
        result: "",
        resultFlag: -1
      };
      if (callback != null) {
        callback(resultObj);
      }
      return;
    }
  } else {
    var parameter = { "params": { "userId": userId, "tbName": tbName, "keyValue": keyValue, "colName": colName, "colValue": colValue, "showOrder": showOrder, "colNameValues": colNameValues, "lastUpdateDate": lastUpdateDate }, "callback": recordCallBack("appSetTable", callback) };
    jsCallApp('setTable', parameter);
  }
}

//获取一条数据  后勤用
function appGetTable(userId, tbName, keyValue, callback) {
  //alert("appGetTable");
  if (igwMode) {
    if (debugMode) {
      var r = localStorage[appCode + "_" + tbName + '|' + keyValue + '|' + userId] || {};
      try {
        r = JSON.parse(r);
      } catch (e) { }
      var resultObj = {
        result: r,
        resultFlag: -1
      };
      if (callback != null) {
        callback(resultObj);
      }
      return;
    }
  } else {
    var parameter = { "params": { "userId": userId, "tbName": tbName, "keyValue": keyValue }, "callback": recordCallBack("appGetTable", callback) };
    jsCallApp('getTable', parameter);
  }
}

//删除一条记录   后勤用
function appDeleteTable(userId, tbName, callback) {
  //alert("appDeleteTable");
  if (igwMode) {
    if (debugMode) {
      localStorage.removeItem(appCode + "_" + tbName + '|' + keyValue + '|' + userId);
      var resultObj = {
        result: "",
        resultFlag: -1
      };
      if (callback != null) {
        callback(resultObj);
      }
      return;
    }
  } else {
    var parameter = { "params": { "userId": userId, "tbName": tbName }, "callback": recordCallBack("appDeleteTable", callback) };
    jsCallApp('deleteTable', parameter);
  }
}

//终端网络状态变化时终端调用的接口，可能由3G到wifi切换，但仍返回-1  后勤用
function networkStateChange(val) {
  var data = eval('(' + val + ')');
  var networkState = data.network_state;
  if (networkState == '-1') {
    //appAlert('网络恢复正常');
  } else {
    //appAlert('网络异常');
  }
}

function showOverLay() {
  if ($(".overLay").length == 0) {
    $("body").append("<div class=\"overLay\"></div>");
  }
  $(".overLay").css("display", "block");
}

function hideOverLay() {
  $(".overLay").css("display", "none");
}


///author: qczhong  后勤用
///date: 2017/04/24
///description: 设置角标，num == 0时隐藏角标，num > 0时显示角标，支持重写的badge元素;
///params: selector -> 要设置角标元素的jquery选择器，要设置角标的元素必须为双标签，num -> 显示的数字;
function appSetBadge(selector, num) {
  num = num || 0;
  var classStr = "badge";
  var badgeLength = $(selector).children('.badge').length;
  if (num == 0 && badgeLength > 0) {
    $(selector).children('.badge').css("display", "none");
  } else if (num > 0) {
    if (num > 9) {
      num = num > 99 ? "99+" : num;
      classStr += " longBadge";
    }
    if (badgeLength == 0) {
      $(selector).css("position", "relative");
      $(selector).append("<span class=\"" + classStr + "\">" + num + "</span>");
    } else {
      $(selector).children('.badge').html(num);
      $(selector).children('.badge').addClass(classStr);
    }
    $(selector).children('.badge').css("display", "block");
  }
}

///author: qczhong  后勤用
///date: 2017/04/24
///description: 设置小角标，当前没有小角标则显示，有则隐藏，支持自己重写的smallBadge元素;
///params: selector -> 要设置角标元素的jquery选择器，要设置角标的元素必须为双标签;
function appSetSmallBadge(selector) {
  if ($(selector).children('.smallBadge').length == 0) {
    $(selector).css("position", "relative");
    $(selector).append("<span class=\"smallBadge\"></span>");
  } else {
    if ($(selector).children(".smallBadge").css("display") == "block") {
      $(selector).children(".smallBadge").css("display", "none");
    } else {
      $(selector).children(".smallBadge").css("display", "block");
    }
  }
}


///author: qczhong   后勤用
///date: 2017/06/15
///description: 显示录音计时;
///params: stopCallback -> 录音结束时触发的回调函数;
function showAudioPanel(stopCallback) {
  if ($("#audioPanel").length == 0) {
    $("body").append("<div id=\"audioPanel\"><p id=\"audioTimer\"></p><div class=\"btnGroup\"><div id=\"audioBtnEnd\" class=\"btnDefault\">结束录音</div></div></div>");
  }
  var seconds = 0;
  var audioTimerText = "";
  var audioTimer = document.getElementById("audioTimer");
  audioTimer.innerHTML = "0秒";
  var interval = setInterval(function () {
    seconds += 1;
    audioTimerText = (seconds > 60 ? parseInt(seconds / 60) + "分" : "") + seconds % 60 + "秒";
    audioTimer.innerHTML = audioTimerText;
  }, 1000);
  $("#audioPanel").css("display", "block");
  showOverLay();
  $("#audioBtnEnd").click(function () {
    hideOverLay();
    appStopRecord(stopCallback);
    clearInterval(interval);
    $("#audioPanel").css("display", "none");
    $("#audioBtnEnd").unbind("click");
  });
}



// 后勤用
function appCallTel(phoneNumber, message, callback) {
  alert("appCallTel");
}

//对话框确认  
// 后勤用
function appPrompt(title, callback) {
  showOverLay();
  if ($("#prompt").length == 0) {
    $("body").append("<div id=\"prompt\"><p id=\"promptTitle\">" + title + "</p><div id=\"promptDiv\"><input type=\"text\" id=\"promptValue\" style='border:1px solid black;' /></div><div class=\"btnGroup\"><div id=\"promptBtnOk\" class=\"btnRed\">确定</div><div id=\"promptBtnCancel\" class=\"btnDefault\">取消</div></div></div>");
  } else {
    $("#promptTitle").html(title);
  }
  $("#prompt").css("display", "block");

  $("#promptBtnOk").click(function () {
    var promptValue = $.trim($("#promptValue").val());
    if (promptValue == "") {
      alert("值不能为空！");
      return;
    }
    promptCallbackOk(promptValue);
  });
  $("#promptBtnCancel").click(function () {
    promptCallbackCancel();
  });
  function promptCallbackOk(promptValue) {
    hideOverLay();
    $("#prompt").css("display", "none");
    callback({ "result": { "prompt_value": promptValue }, "resultFlag": -1 });
    $("#promptBtnOk").unbind("click");
    $("#promptBtnCancel").unbind("click");
  }

  function promptCallbackCancel() {
    hideOverLay();
    $("#prompt").css("display", "none");

    $("#promptBtnOk").unbind("click");
    $("#promptBtnCancel").unbind("click");
  }
}







function appExitToYJK() {
  if (igwMode) {
    return false;
  } else {
    if (isSetFunc("exitToYJK")) {
      jsCallApp('exitToYJK');
      return true;
    }
    return false;
  }
}



function appExitSystem() {
  if (debugMode) {
    window.location.href = "../Signin.html?t=" + new Date().getTime();
    return;
  }
  if (igwMode) {

    wx.invoke("multiWindows_close", {}, function (res) {
      //console.log('exit app')
      //console.log("WINDOW CLOSE END", res);
    })
  } else {
    if (_UserID == 2170) {
      appSetParameter("guestInfo", "", null);
    }
    appSetParameter("userName", "", null);
    appSetParameter("userID", "", null);
    appSetParameter("token", "", clearToken);
    jsCallApp('exitSystem');
    if (top.iOS || osType) {
      window.location.href = "./SignIn.html";
    }
  }
}

function appFaceRegister(pRegisterType) {
  if (igwMode) {

  } else {
    if (!isSetFunc("faceRegister")) {
      appAlert('请先升级app');
      return true;
    }
    var parameter = { "params": { "registerType": pRegisterType } };

    jsCallApp('faceRegister', parameter);
  }
}

function appPhoneRecognize(pUserType, pUserId, pInstanceGuid, pDeviceNo, dist, callback) {
  if (igwMode) {
    let failureCallback = message => {
      if (callback) callback({
        result: 0,
        errMsg: message,
      });
    }
    let successCallback = (similarity, result) => {
      if (callback) callback({
        similarity,
        result,
      });
    }

    appGetGPS(gps => {
      let lon = gps.result.lon;
      let lat = gps.result.lat;
      wx.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        quality: 0.1,
        success: res => {
          let ids = res.localIds;
          // console.log("照片本地id：", ids[0]);
          wx.invoke("getLocalResPath", {
            localId: ids[0],
          }, res => {
            // console.log("获取照片：", res);
            let realChannelId = "event_Net_upLoad_" + (new Date().getTime() % 100000);
            wx.invoke("ext_Net_Upload", {
              data: {
                url: ServerPath + "API/IGW/UploadFaceFile.ashx",
                data: {
                  Token: _Token,
                  userType: pUserType,
                  toUserId: pUserId,
                  instanceGuid: pInstanceGuid,
                },
                header: {},
                id: realChannelId,
                appCode: "",
                timeout: 120,
                files: {
                  keyA: res.localResPath,
                },
              },
            }, res => {
              if (res.event === "success") {
                let recognizeResult = JSON.parse(res.result);
                let similarity = recognizeResult.probability;
                let reuslt = similarity >= dist ? -1 : 0;
                let params = {
                  Token: _Token,
                  deviceNo: pDeviceNo,
                  toUserId: pUserId,
                  instanceGuid: pInstanceGuid,
                  recognizeResult: reuslt,
                  dist: similarity,
                  longitude: lon,
                  latitude: lat,
                }
                let url = ServerPath + "API/IGW/UploadFaceRecognizeResult.ashx";
                $.getJSON(url, params, data => {
                  //console.log(data);
                  if (data.type == -1) {
                    successCallback(similarity, reuslt);
                  }
                  else {
                    failureCallback("识别失败，请重新尝试");
                  }
                }).fail(() => {
                  failureCallback("识别失败，请重新尝试");
                });
              }
              else if (res.event === "fail") {
                failureCallback(res.result);
              }
            });
          });
        },
      });
    });
  } else {
    if (!isSetFunc("phoneRecognize")) {
      appAlert('请先升级app');
      return true;
    }
    var parameter = { "params": { "userType": pUserType, "userId": pUserId, "instanceGuid": pInstanceGuid, "deviceNo": pDeviceNo, "token": _Token, "dist": dist }, "callback": recordCallBack("phoneRecognize", callback) };
    jsCallApp('phoneRecognize', parameter);
  }

}

function appPickPhoto(userId, fileName, fnCode, instanceGuid, folderCode, uploadAPIPath, bizInfo, callback) {
  if (debugMode) {
    appAlert("暂不支持！");
  } else {
    if (igwMode) {
      appGetGPS(function (gpsData) {
        let longitude = gpsData.result.lon;
        let latitude = gpsData.result.lat;
        wx.chooseImage({
          count: 9,
          sizeType: ['compressed'],
          sourceType: ['album'],
          success: function (res) {
            let localIds = res.localIds;
            let files = [];
            for (let idx = 0; idx < localIds.length; idx++) {
              let localId = localIds[idx];
              let fileInfo = {};
              fileInfo.user_id = userId;
              fileInfo.Token = _Token;
              fileInfo.file_name = fileName + "_" + idx + ".jpg";
              fileInfo.fn_code = fnCode;
              fileInfo.instance_guid = instanceGuid;
              fileInfo.folder_code = folderCode;
              fileInfo.upload_api_path = uploadAPIPath;
              fileInfo.biz_info = encodeURIComponent(JSON.stringify(bizInfo));
              fileInfo.pictureMaxSize = "600";
              fileInfo.statusname = "";
              fileInfo.file_guid = "";
              fileInfo.contentType = "image/jpeg";
              fileInfo.fileCreateDate = new Date().Format("yyyyMMddhhmmss");
              fileInfo.file_path = localId;
              fileInfo.file_size = "";
              fileInfo.file_type = "Picture";
              fileInfo.remark = "";
              fileInfo.lon = longitude;
              fileInfo.lat = latitude;
              fileInfo.upload_status = 'NotUpload';
              fileInfo.file_id = uuid();
              files.push(fileInfo);
            }

            if (files.length > 0) {
              appGetAllFileList(userId, function (rData) {
                if (rData.resultFlag == -1) {
                  let allFileList = rData.result.concat(files);
                  wx.invoke("ext_DataCache_SaveInfo", {
                    data: {
                      key: appCode + "_" + userId + "_appGetAllFileList",
                      message: encodeURIComponent(JSON.stringify(allFileList)) + erowStr
                    }
                  }, res => {
                    let resultObj = {};
                    resultObj.resultFlag = 0;
                    resultObj.result = "";
                    resultObj.errMsg = "";
                    if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                      resultObj.resultFlag = -1;
                    }
                    if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                      //失败处理
                    }
                    if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                      //取消处理
                    }
                    if (callback != null) {
                      callback(resultObj);
                    }
                  });
                }
              });
            }
          },
        });
      });
    } else {
      if (!isSetFunc("pickPhoto")) {
        appAlert('请先升级app');
        return;
      }
      let params = {
        params: {
          userId,
          fileName,
          fnCode,
          instanceGuid,
          folderCode,
          uploadAPIPath,
          bizInfo: encodeURIComponent(JSON.stringify(bizInfo)),
          pictureMaxSize: "600",
          statusname: "",
          fileGuid: "",
        },
        callback: recordCallBack("appPickPhoto", callback),
      };
      jsCallApp("pickPhoto", params);
    }
  }


}





function appShowMultiVideo(videos, callback) {
  if (debugMode) {
    if (callback) callback();
    return;
  }
  if (igwMode) {








  } else {
    let parameter = {
      callback: recordCallBack("showMultiVideo", callback),
      params: {
        videos
      }
    }
    jsCallApp('showMultiVideo', parameter);
  }
}

function appStopMultiVideo(callback) {
  if (debugMode) {
    if (callback) callback();
    return;
  }
  if (igwMode) {

  } else {
    let parameter = {
      callback: recordCallBack("stopMultiVideo", callback)
    };
    jsCallApp('stopMultiVideo', parameter);
  }
}

function erowGetRequest(method, json, success, fail) {
  if (method.indexOf(".ashx") != -1) {
    $.getJSON(ServerPath + method, json, success).fail(fail);
  }
  else {
    erowGetRequestWithCustomDetail(method, { json }, success, fail);
  }
}

function erowPostRequest(method, json, success, fail) {
  if (method.indexOf(".ashx") != -1) {
    $.post(ServerPath + method, json, success).fail(fail);
  }
  else {
    erowPostRequestWithCustomDetail(method, { json }, success, fail);
  }
}

function erowGetRequestWithCustomDetail(method, detail, success, fail) {
  $.getJSON(getServerPath(method) + "api/main", {
    method,
    detail: JSON.stringify(detail),
  }, success).fail(fail);
}

function erowPostRequestWithCustomDetail(method, detail, success, fail) {
  //$.post(getServerPath(method) + "api/main", {
  //    method,
  //    detail: JSON.stringify(detail),
  //}, success).fail(fail);
  $.ajax({
    url: getServerPath(method) + "api/main",
    type: "POST",
    async: true,
    data: {
      method,
      detail: JSON.stringify(detail),
    },
    success,
    fail
  });
}
function getServerPath(apiCode) {
  var SERVER_URL = "";
  for (let i = 0; i < getApiRouter.length; i++) {
    if (getApiRouter[i].API_METHOD == apiCode) {
      SERVER_URL = getApiRouter[i].SERVER_URL;
      break;
    }
  }
  if (outFlag == -1) return "http://127.0.0.1:" + portResult + SERVER_URL;
  return outNetDomain + SERVER_URL;
}

function dataURLtoFile(dataurl, filename) {//将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
  try {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  catch (ex) {
    return null;
  }
}
var _fileItem = {};
var _uploadResultData = {};
function debugModeUploadFile(url, params, fileName, resolve, reject) {
  if (debugMode) {
    var fileList = [];
    if (localStorage[appCode + "_" + "allFileList_" + _UserID] != undefined) {
      fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
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
      if (fileList[i].file_name == fileName && fileList[i].upload_status == "NotUpload") {
        //上传文件
        var File = null;
        if (_fileItem.file_type == "Picture") {
          var imgBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAABnWAAAZ1gEY0crtAAAADklEQVR42mP4DwYMEAoAU7oL9YXEbhEAAAAASUVORK5CYII=";
          File = dataURLtoFile(imgBase64, _fileItem.file_name);
        }
        if (_fileItem.file_type == "Audio") {

          var amrBase64 = "data:audio/amr;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAABnWAAAZ1gEY0crtAAAADklEQVR42mP4DwYMEAoAU7oL9YXEbhEAAAAASUVORK5CYII=";
          File = dataURLtoFile(amrBase64, _fileItem.file_name);
        }
        if (_fileItem.file_type == "Video") {

          var videoBase64 = "data:video/mp4;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAABnWAAAZ1gEY0crtAAAADklEQVR42mP4DwYMEAoAU7oL9YXEbhEAAAAASUVORK5CYII=";
          File = dataURLtoFile(videoBase64, _fileItem.file_name);
        }
        var formData = new FormData();
        formData.append("file", File);
        formData.append("detail", JSON.stringify({ json: params }));

        $.ajax({
          url: url,
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          async: false,
          success: function (rData) {
            _uploadResultData = rData;
            if (rData.type) {
              if (rData.type == -1) {
                successCount++;
                _fileItem.file_guid = rData.data;
                _fileItem.upload_status = "Uploaded";
                appDeleteFile(_fileItem.file_name, function (rData) {
                  var _fileList = JSON.parse(decodeURIComponent(localStorage[appCode + "_" + "allFileList_" + _UserID]));
                  _fileList.push(_fileItem);
                  localStorage[appCode + "_" + "allFileList_" + _UserID] = encodeURIComponent(JSON.stringify(_fileList));

                });
              }
            }
          },
          error: function (rData) {
            reject();
          }
        });
      }

    }
    if (resolve != undefined) {
      resolve(_uploadResultData);
    }
    return;
  }
}

//签字
function appSign(userId, fileName, fnCode, instanceGuid, folderCode, fileGuid, uploadAPIPath, bizInfo, callback) {
  var parameter = {
    "params": {
      "userId": userId,
      "fileName": fileName,
      "fnCode": fnCode,
      "instanceGuid": instanceGuid,
      "folderCode": folderCode,
      "fileGuid": fileGuid,
      "uploadAPIPath": uploadAPIPath,
      "bizInfo": encodeURIComponent(JSON.stringify(bizInfo))
    },
    "callback": recordCallBack("appSign", callback)
  };
  jsCallApp('sign', parameter);
}

//上传base64文件
function uploadSign(fileName, params, ImgBase64, callback) {
  var successCount = 0;
  var resultObj = {};
  resultObj.resultFlag = 0;
  resultObj.successCount = successCount;
  /* if (debugMode) {*/
  File = dataURLtoFile(ImgBase64, fileName);
  var formData = new FormData();
  formData.append("file", File);
  formData.append("detail", JSON.stringify({ json: params }));
  var url = (outFlag == -1 ? ("http://127.0.0.1:" + portResult + "/" + ServerUploadFilePath) : ServerUploadFilePath);
  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    async: false,
    success: function (rData) {
      _uploadResultData = rData;
      if (rData.type) {
        if (rData.type == -1) {
          successCount++;
          resultObj.resultFlag = -1;
          resultObj.successCount = successCount;
        }
      }
    },
    error: function (rData) {
    }
  });
  if (callback != null) {
    callback(resultObj);
  }
}

function appGetLocalImgData(file, success) {
  if (debugMode) return;
  if (file.file_path == __mediaFolderName) {
    if (outFlag == -1) {
      __getLocalResPath(file.file_path, file.contentType, file.file_name).then(filePath => {
        wx.invoke("ext_FileManager_Read", {
          data: {
            path: filePath,
            type: "TEXT",
          }
        }, function (res) {
          if (success) success(res.result);
        });
      });
    } else {
      if (file.file_type == "Picture") {
        wx.getLocalImgData({
          localId: file.file_path,
          success: function (res) {
            if (success) success(res.localData); // localData是图片的base64数据，可以用img标签显示
          },
        });
      } else {

        __getLocalResPath(file.file_path, file.contentType, file.file_name).then(filePath => {
          wx.invoke("ext_FileManager_Read", {
            data: {
              path: filePath,
              type: "TEXT",
            }
          }, function (res) {
            if (success) success(res.result);
          });
        });
      }

    }
  }
  else {
    wx.getLocalImgData({
      localId: file.file_path,
      success: function (res) {
        if (success) success(res.localData); // localData是图片的base64数据，可以用img标签显示
      },
    });
  }
}
//插入一条本地数据
function appSetItem(code, value) {
  try {
    localStorage.setItem(code, JSON.stringify(value));
    localStorage.setItem(code + '_itemtime', new Date().getTime());
  } catch (e) {
    var now = new Date().getTime();
    for (lKey in localStorage) {
      if (lKey.indexOf('_itemtime') > -1) {
        if (parseInt(localStorage[lKey]) - now > 86400000) {
          appRemoveItem(lKey.substring(0, lKey.indexOf('_itemtime')));
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
  } catch (e) { }
  return value;
}

//删除一条本地数据
function appRemoveItem(code) {
  localStorage.removeItem(code);
  localStorage.removeItem(code + '_itemtime');
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
  }
  else if (name.indexOf("appGetTextValue") >= 0) {
    data.result = decodeURIComponent(data.result);
  }
  var i = _callback.count % maxCount;
  if (callbackFunction[i] != null) {
    callbackFunction[i](data);
    callbackFunction[i] = null;
  }
}


//失败回调
function failCallBack(rData) {
}

function isSetFunc(func) {
  if (igwMode) {
    return true;
  } else {
    if (osType) {
      if (webkit.messageHandlers[func]) {
        return true;
      } else {
        return false;
      }
    } else {
      if (android[func]) {
        return true;
      } else {
        return false;
      }
    }
  }
}

function appSetLocationHref(url, params) {
  if (typeof url !== "string" || url.indexOf(".html") == -1) return;
  let pagename = url.split("?")[0].split("/").reverse()[0];
  appSetValue(_UserID, pagename, JSON.stringify(params), 1, new Date(), data => {
    if (data.resultFlag == -1) {
      window.location.href = url;
    }
  });
}

function appGetLocationHref(callback) {
  let pagename = window.location.pathname.split("/").reverse()[0];
  appGetValue(_UserID, pagename, data => {
    if (data.resultFlag == -1) {
      callback(data.result);
    }
    else {
      callback({});
    }
  });
}

function appClearLocationHref(url, callback) {
  if (typeof url !== "string" || url.indexOf(".html") == -1) return;
  let pagename = url.split("?")[0].split("/").reverse()[0];
  appSetValue(_UserID, pagename, "", 0, new Date(), data => {
    if (callback) callback(data);
  });
}
//android返回数据
function androidReturnValue_self(val) {
  var data = eval('(' + val + ')');
  var _callback = JSON.parse(decodeURIComponent(data.callback));
  var name = _callback.name;

  if (name.indexOf("appGetValue") >= 0) {

    var s = decodeURIComponent(data.result);
    if (s != "") {
      data.result = JSON.parse(s);
    }
  }
  else if (name.indexOf("appGetTextValue") >= 0) {
    var s = decodeURIComponent(data.result);
    data.result = s;
  }
  var i = _callback.count % maxCount;
  if (callbackFunction[i] != null) {
    callbackFunction[i](data);
    callbackFunction[i] = null;
  }
}

function erowUploadFile(url, params, fileId, partName, fileName, filePath, mimeType, callback) {
  let file = {
    fileId: fileId + "",
    partName,
    fileName,
    filePath,
  }
  if (mimeType) file.mimeType = mimeType;
  let parameter = {
    callback: recordCallBack("erowUploadFile", callback),
    params: {
      url,
      params,
      file,
    },
  }
  jsCallApp('erowUploadFile', parameter);
}


//跟ISCP建立通信的完整流程
function iscpLoad(callback, callbackError) {
  closeiscp();
  initiscp(function () {//初始化
    connect(function () {//建立安全链接
      getlocalport(function () {//获取本地监听端口
        if (typeof (callback) == 'function') callback();
      }, callbackError)
    }, callbackError)
  }, callbackError)
}

//ISCP初始化
function initiscp(callback, callbackError) {
  console.log("ISCP初始化 ext_ISCP_Init");
  wx.invoke("ext_ISCP_Init", {
    data: {
      "iscpIP": PIpcsi
    }
  }, function (res) {
    console.log("ext_ISCP_Init ", res, res.err_msg);
    if (res.err_msg == 'ext_ISCP_Init:ok') {
      if (typeof (callback) == 'function') callback();
    } else {
      alert("ISCP初始化失败");
      if (typeof (callbackError) == 'function') callbackError();
    }
  })
}
//建立安全交互平台链接
function connect(callback, callbackError) {
  //console.log("建立安全交互平台链接:" + JSON.stringify(connectData));
  console.log("建立安全交互平台链接");
  wx.invoke("ext_ISCP_ConnectService", {
    data: connectData
  }, function (res) {
    console.log("ext_ISCP_ConnectService ", res, res.err_msg)
    if (res.err_msg == 'ext_ISCP_ConnectService:ok') {
      if (typeof (callback) == 'function') callback();
    } else {
      alert("建立安全交互平台链接失败");
      if (typeof (callbackError) == 'function') callbackError();
    }
  })
}
//获取业务后台在本地的映射端口
function getlocalport(callback, callbackError) {
  console.log("获取业务后台在本地的映射端口:");
  wx.invoke("ext_ISCP_GetLocalPort", {
    data: getlocalportData
  }, function (res) {
    console.log("ext_ISCP_GetLocalPort ", res, res.err_msg);
    if (res.err_msg == 'ext_ISCP_GetLocalPort:ok') {
      if (typeof (callback) == 'function') {
        portResult = res.result;
        //console.log("安全交互平台端口号：" + portResult);
        appSetParameter("portResult", portResult + "", function (rData) {
          if (typeof (callback) == 'function') callback();
        });
      }
    } else {
      alert("获取业务后台在本地的映射端口失败");
      if (typeof (callbackError) == 'function') callbackError();
    }
  })
}
//关闭安全链接
function closeiscp() {
  //console.log("先关闭安全链接 ");
  wx.invoke("ext_ISCP_Close", {
    data: {
      "PIpcsi": PIpcsi
    }
  },
    function (res) {
      console.log("安全链接关闭:" + JSON.stringify(res));
    }
  )
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
  var parameter = { "callback": recordCallBack("androidHidWaiting.", callback) };
  jsCallApp('hideWaiting', parameter);
}

//*camera,album*
function appFaceRegisterV2(userId, steps, openFace, callback) {
    appFaceRegisterV2(userId, steps, openFace, "camera", callback);
}
function appFaceRegisterV2(userId, steps, openFace, sourceType,callback) {
    if (debugMode) {
        appAlert('暂不支持');
        return;
    } else {
        if (igwMode) {

            var resultJson = {};
            resultJson.resultFlag = 0;
            resultJson.errMsg = "";
            resultJson.result = [];
            resultJson.callback = encodeURIComponent(JSON.stringify({ "name": "appFaceRegisterV2", "count": 12 }));
            var array = [];
            var json = {};
            json.NEED_PICTURE_COUNT = steps[0].NEED_PICTURE_COUNT;
            json.STEP_CODE = steps[0].STEP_CODE;
            json.STEP_NAME = steps[0].STEP_NAME;
            json.STEP_TIP = steps[0].STEP_TIP;
            array.push(json);
            resultJson.result = array;
            var typeArr = [];
            typeArr.push(sourceType);
            new Promise((res, rej) => {
                wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: typeArr, // 可以指定来源是相册还是相机，默认二者都有
                    quality: 0.1, //压缩质量，范围0～1，数值越小，质量越低，压缩率越高（仅对jpg有效）
                    success: function (data) {
                        var file_path = data.localIds[0];
                        var images = [];
                        var itemImg = {};
                        var nowTime = new Date().Format("yyyyMMddhhmmss");
                        itemImg.create_time = nowTime;
                        itemImg.file_name = userId + "_" + steps[0].STEP_CODE + "_" + nowTime + "jpg";
                        itemImg.file_path = file_path;
                        itemImg.file_size = "0MB";
                        itemImg.user_id = userId;
                        images.push(itemImg);
                        resultJson.result[0].images = images;
                        resultJson.resultFlag = -1;
                        res(data.localIds[0]);
                    },
                    fail: function (err) {
                        resultObj.errMsg = "拍照组件异常！";
                        rej();
                    }
                });
            }).then(localId => {
                return new Promise(res => {
                    wx.getLocalImgData({
                        localId: localId,
                        success: function (data) {
                            resultJson.result[0].images[0].base64Str = data.localData;
                            //res(data.localData);
                            //base64
                            if (callback != null) {
                                callback(resultJson);
                            }
                        }
                    });
                });
            }).catch(err => {
                if (callback != null) {
                    callback(resultObj);
                }
            });


        } else {

            if (!isSetFunc("faceRegisterV2")) {
                appAlert('请先升级app');
                return;
            }
            let params = {
                params: {
                    userId: "" + userId,
                    steps,
                    openFace,
                },
                callback: recordCallBack("appFaceRegisterV2", callback),
            }
            jsCallApp("faceRegisterV2", params);
        }
    }
}

function erowPostForm(method, formData, success, fail) {
  /*var formData = new FormData();
  formData.append("file", File);
  formData.append("detail", JSON.stringify({ json: params }));*/
  formData.append("method", method);
  $.ajax({
    url: getServerPath(method) + "api/main",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    async: true,
    success: function (rData) {
      if (success != null) {
        success(rData);
      }
    },
    error: function (rData) {
      if (fail != null) {
        fail(rData);
      }
    }
  });

}





