(function () {
  let _pageLoadTimer = null;
  let pageLoadCount = 1;
  const jsApiList = [
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
    "getZipAppDirectory",

    "ext_FileManager_Write",
    "ext_FileManager_Read",
    "ext_FileManager_Remove",
    "ext_FileManager_Create",
    "ext_FileManager_RemoveDirectory",
    "ext_FileManager_Exist",
    "ext_FileManager_IsDirectory",
    "ext_FileManager_Information",

    "ext_Socket_Init",
    "ext_Socket_UnInit",
    "ext_Socket_CreateChannel",
    "ext_Socket_CloseChannel",
    "ext_Socket_SendData",

    "multiWindows_subscribe",

    "ext_SGMap_init",
    "ext_SGMap_Operation",
    "ext_SGMap_Search",
    "ext_SGMap_Location",

    "ext_Etas_List",
    "ext_Etas_Init",
    "ext_Etas_Reg",
    "ext_Etas_UnReg",
    "ext_Etas_checkStatus",
    "ext_Etas_Verify",
    "ext_Etas_SaveData",
    "ext_Etas_GetData",
    "ext_Etas_RemoveData",
    "ext_Etas_Clear",
    "ext_Etas_OffLineVerify",

    "ext_ISCP_Init",
    "ext_ISCP_ConnectService",
    "ext_ISCP_GetLocalPort",
    "ext_ISCP_Close",
    "ext_ISCP_Status",

    "ext_Database_Open",
    "ext_Database_Exec",
    "ext_Database_Query",
    "ext_Database_Close",

    "ext_rlble_initBluetoothAdapter",
    "ext_rlble_scanBluetoothDev",
    "ext_rlble_startConnectBluetoothDev",
    "ext_rlble_onBluetoothDevConnDataRecv",
    "ext_rlble_BluetoothDevSendData",
    "ext_rlble_closeBluetoothDevConnection",
    "ext_rlble_stopBluetoothDevScan",
    "ext_rlble_onBluetoothDevConnStateChange",
    "ext_rlble_autoBluetoothDevConnection",

    "ext_Popover_Open",
    "ext_Popover_Close",

    "multiWindows_open",
    "multiWindows_close",
    "multiWindows_startWidget",
    "multiWindows_finishWidget",
    "multiWindows_subscribe",
    "multiWindows_publish",

    "selectEnterpriseContact",
    "openChatWithMsg",
    "openUserProfile",

    "onMenuShareAppMessage",
    "onMenuShareWechat",
    "shareAppMessage",
    "shareWechatMessage",
    "onMenuShareTimeline",

    "chooseImage",
    "getLocalImgData",
    "previewImage",
    "uploadImage",
    "downloadImage",
    "previewFile",

    "chooseVideo",
    "uploadVideo",
    "downloadVideo",

    "startRecord",
    "stopRecord",
    "onVoiceRecordEnd",
    "playVoice",
    "playVoice",
    "stopVoice",
    "onVoicePlayEnd",
    "startRecordVoiceBuffer",
    "onRecordBufferReceived",
    "stopRecordVoiceBuffer",
    "uploadVoice",
    "downloadVoice",
    "translateVoice",

    "startWifi",
    "stopWifi",
    "connectWifi",
    "getWifiList",
    "onGetWifiList",
    "onWifiConnected",
    "getConnectedWifi",

    "openBluetoothAdapter",
    "closeBluetoothAdapter",
    "getBluetoothAdapterState",
    "onBluetoothAdapterStateChange",
    "startBluetoothDevicesDiscovery",
    "stopBluetoothDevicesDiscovery",
    "getBluetoothDevices",
    "onBluetoothDeviceFound",
    "getConnectedBluetoothDevices",
    "createBLEConnection",
    "closeBLEConnection",
    "onBLEConnectionStateChange",
    "getBLEDeviceServices",
    "getBLEDeviceCharacteristics",
    "readBLECharacteristicValue",
    "writeBLECharacteristicValue",
    "notifyBLECharacteristicValueChange",
    "onBLECharacteristicValueChange",

    "setClipboardData",
    "getClipboardData",

    "getNetworkType",
    "onNetworkStatusChange",

    "openLocation",
    "getLocation",
    "startAutoLBS",
    "stopAutoLBS",
    "onLocationChange",

    "onHistoryBack",
    "hideOptionMenu",
    "showOptionMenu",
    "closeWindow",
    "hideMenuItems",
    "showMenuItems",
    "hideAllNonBaseMenuItem",
    "showAllNonBaseMenuItem",
    "onUserCaptureScreen",
    "openUrl",

    "scanQRCode",

    "getStepCount",
    "getAllPhoneContacts",
    "addCalendarEvent",

    "showWatermark",
    "hideWatermark",

    "checkIsSupportSoterAuthentication",
    "checkIsSoterEnrolledInDevice",
    "startSoterAuthentication",
    "bioassayAuthentication",

    "launch3rdApp",
    "request3rdApp",
    "getInstallState",

    "ocr",

    "checkJsApi",

    "ext_gislocation_init",
    "ext_gislocation_start",
    "ext_gislocation_stop",

    "ext_SandBox_Reg",
    "ext_SandBox_StartSubApp",
    "ext_SandBox_CloseSubApp",
    "ext_SandBox_ScreenPolicy",
    "ext_SandBox_isRoot",
    "ext_SandBox_isSimulator",
    "ext_SandBox_WaterMark",
    "ext_SandBox_ScreenShot",
    "ext_SandBox_DelePhoto",
    "ext_SandBox_UploadShot",

    "ext_wxlog_setLogOpen",
    "ext_wxlog_getLogFile",
    "ext_SGMap_init",
    "ext_SGMap_Location",

    "ext_DataCache_Get",
    "ext_DataCache_Save",
    "ext_DataCache_SaveInfo",
    "ext_DataCache_GetInfo",
    "ext_DataCache_RemoveInfo",

    "ext_Net_Upload",
    "ext_Net_CancelUpload",
    "ext_Net_Download",
    "ext_Net_SimpleDownload",
    "ext_Net_MultiDownload",

    "ext_screenControl_direction",

    "ext_WeMeet_Init",
    "ext_WeMeet_Login",
    "ext_WeMeet_Logout",
    "ext_WeMeet_Join",

    "ext_DeviceInfo_GetInfo",

    "ext_Compressor_Size",
    "ext_Compressor_Quality",

    "ext_OfflineFaceRec_add",
    "ext_OfflineFaceRec_delete",
    "ext_OfflineFaceRec_recognition",
    "ext_OfflineFaceRec_capture",
    "ext_OfflineFaceRec_openCamera",

    "ext_unzip_untie",
    "ext_unzip_compression",
    "ext_Intent_Dial",

    "ext_facialLandmarkDetection_init",
    "ext_facialLandmarkDetection_getFaceData",

    "ext_VoiceRecord_Start",
    "ext_VoiceRecord_Stop",
    "ext_VoiceRecord_Pause",
    "ext_VoiceRecord_Continue",
    "ext_VoiceRecord_Delete",
    "ext_VoiceRecord_ShowRecords",

    "ext_FileBrowser_StartPreView",

    "ext_FileManager_BlockComposeFile",
    "ext_FileManager_BlockFetchFile",
    "ext_FileManager_BlockMergeFile",
    "ext_FileManager_fileDelete",

    "ext_LocalServer_BootServer",
    "ext_LocalServer_LocalUrl",
    "ext_LocalServer_StopServer",

    "ext_appInstall_Check",
    "ext_appInstall_start",

    "ext_GPS_GetLocation",

    "changeNaviColor",
    "ext_OCR_SelectRes",
    "ext_OCR_Authentication",
    "ext_OCR_Ocr",

    "ext_Net_PathExtension",

    "ext_Print_Picture",
    "ext_Print_Doc",

    "ext_PDFPreview_Preview",
    "ext_PDFPreview_AddWaterMark",
    "ext_PDFPreview_RemoveWaterMark",
    "ext_PDFPreview_ClosePreviewPage",
    'ext_ISCP_RhConfig',
    'ext_ISCP_RhConnectCtrl',
    'ext_ISCP_RhConnState',
    'ext_ISCP_RhLocalPortCtrl',

    // 弹窗
    "setFloatWindow", //开启浮窗
    "openChatWithMsg", //会话框
    "shareAppMessage", //分享
    "getZipAppDirectory", //获取h5包路径
    "multiWindows_startWidget", //打开应用 2.0
    "multiWindows_open", //打开窗口 2.0
    'ext_FileManager_AppList',//获取应用缓存
    'ext_Intent_Dial',//打电话
  ];
  const wxNonceStr = "CF82F13B500E43969998A4E8423F8A71";
  const wxSignature = "B96D85B82113469DAF3880A6EFFBF477";

  const initialize = (callback) => {
    let wxjsurl = `${window.ROOT_PATH}/js/jweixin-1.2.0.js`;
    $.getScript(wxjsurl, function () {
      console.log("js加载成功");
      clearInterval(_pageLoadTimer);
      let platform = window.hasOwnProperty("erJsBridge") ? erJsBridge.osType : window.osType == 0 ? "android" : "iOS";
      _pageLoadTimer = setInterval(function () {
        if (document.getElementById("__WeixinJSBridgeIframe_SetResult") == null && platform == "android") {
          // android
          pageLoadCount++;
          console.log("加载失败重新刷新");
          window.location.reload();
        } else {
          clearInterval(_pageLoadTimer);
        }
      }, 2000);

      wx.config({
        beta: true,
        debug: false,
        appId: wxappId,
        timestamp: new Date().getTime(),
        nonceStr: wxNonceStr,
        signature: wxSignature,
        jsApiList: jsApiList,
      });
      wx.ready(() => {
        wx.invoke(
          "agentConfig",
          {
            agentid: AppId, // 必填，企业应用的agentid
            corpid: wxappId, // 必填，企业微信的corpid
            timestamp: new Date().getTime(),
            nonceStr: wxNonceStr,
            signature: wxSignature,
            jsApiList: jsApiList,
          },
          (res) => {
            console.log("wx.agent config: over", res);
          }
        );
        console.log("wxjs注册成功");
        loadVSConsole();
        iscpLoad(
          () => {
            complete();
          },
          () => {
            console.log("ISCP通信建立失败");
            complete();
          }
        );
      });
      wx.error((err) => {
        // wxjs-sdk注册失败
        complete();
      });
    });
    const complete = () => {
      Promise.all([
        new Promise((res) => {
          getApiRouter(res);
        }),
        new Promise((res) => {
          if (window.hasOwnProperty("pageManager")) {
            window.pageManager.initialize(res);
          } else {
            res();
          }
        }),
        new Promise((res) => {
          if (window.getErUserInfo) {
            window.getErUserInfo((user) => {
              res(user);
            });
          }
        }),
        new Promise((res) => {
          const width = 375;
          const scale = window.innerWidth / width;
          let meta = document.querySelector("meta[name=viewport]");
          let content = `width=${width}, initial-scale=${scale}, user-scalable=no`;
          if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "viewport");
            document.head.appendChild(meta);
          }
          meta.setAttribute("content", content);
          res();
        }),
      ]).then(() => {
        initCapsule();
        if (callback) callback();
      });
    };
    if (debugMode) {
      complete();
      return;
    }
  };

  /// 跟ISCP建立通信的完整流程
  const iscpLoad = (callback, callbackError) => {
    iscpClose();
    iscpInit(() => {
      iscpConnect(() => {
        getLocalPort(callback, callbackError);
      }, callbackError);
    }, callbackError);
  };

  /// 关闭ISCP连接
  const iscpClose = () => {
    wx.invoke(
      "ext_ISCP_Close",
      {
        data: {
          PIpcsi: PIpcsi,
        },
      },
      (res) => {
        console.log("安全链接关闭:" + JSON.stringify(res));
      }
    );
  };

  /// ISCP初始化
  const iscpInit = (callback, callbackError) => {
    const businessServiceInfoList = [{
      "acl_id": Number(AppId),
      "businessInfo": {
        "sip": localPortIp,
        "sport": Number(localPort)
      },
      gateway_id: Number(AppId)
    }];
    const gatewayServiceInfoList = [{
      "gatewayInfo": {
        ip: connectIp,
        port: Number(connectPort),
        resource: {
          "acl_id_list": [Number(AppId)],
          "appId": connectAppid
        },
        type: 2
      },
      gateway_id: Number(AppId)
    }];
    const data = {
      "businessServiceInfoList": businessServiceInfoList,
      "gatewayServiceInfoList": gatewayServiceInfoList
    };
    console.log("ext_ISCP_RhConfig配置", data);
    wx.invoke("ext_ISCP_RhConfig", { data },
      (res) => {
        console.log("ext_ISCP_RhConfig ", res, res.err_msg);
        if (res.err_msg == "ext_ISCP_RhConfig:ok") {
          if (callback) callback();
        } else {
          alert("ISCP初始化失败");
          if (callbackError) callbackError();
        }
      }
    );
  };

  /// 建立安全交互平台链接
  const iscpConnect = (callback, callbackError) => {
    console.log("建立安全交互平台链接");
    wx.invoke("ext_ISCP_RhConnectCtrl", {
      data: {
        "gatewayServiceId": Number(AppId),
        "connCtrlType": "1"
      }
    }, res => {
      console.log("ext_ISCP_RhConnectCtrl ", res, res.err_msg)
      if (res.err_msg == 'ext_ISCP_RhConnectCtrl:ok') {
        if (callback) callback();
      }
      else {
        alert("建立安全交互平台链接失败");
        if (callbackError) callbackError();
      }
    });
  }

  /// 获取业务后台在本地的映射端口
  const getLocalPort = (callback, callbackError) => {
    console.log("获取业务后台在本地的映射端口:");
    const tid = /android/i.test(navigator.userAgent) ? AppId : Number(AppId); // 安卓String， 苹果Number
    wx.invoke("ext_ISCP_RhLocalPortCtrl", {
      data: {
        "gatewayServiceId": tid,
        "aclId": tid
      }
    }, res => {
      console.log("ext_ISCP_RhLocalPortCtrl ", res, res.err_msg);
      if (res.err_msg == 'ext_ISCP_RhLocalPortCtrl:ok') {
        if (typeof (callback) == 'function') {
          window.portResult = res.port ? res.port : res.result.replace('端口号:');
          baseUrl = baseUrl.replace(/(?:\/\/)([^\/:]+)/, '//127.0.0.1').replace(/:(\d+)(?=\/)/, window.portResult);
          if (callback) callback();
        }
      }
      else {
        alert("获取业务后台在本地的映射端口失败");
        if (callbackError) callbackError();
      }
    })
  }

  const loadVSConsole = () => {
    $.getScript(`${window.ROOT_PATH}/js/vconsole.min.js`, function () {
      if (window.hasOwnProperty("erJsBridge")) {
        erJsBridge.getParameter("_VConsoleFlag", (res) => {
          if (res.result.value == "-1") {
            _VConsoleFlag = -1;
            vConsole = new VConsole();
          }
        });
      } else {
        appGetParameter("_VConsoleFlag", (res) => {
          if (res.result.value == "-1") {
            _VConsoleFlag = -1;
            vConsole = new VConsole();
          }
        });
      }
    });
  };

  const getApiRouter = (callback) => {
    if (window.hasOwnProperty("erJsBridge")) {
      erJsBridge.getValue(0, "getApiRouter", (data) => {
        if (data.resultFlag == -1) {
          window.getApiRouter = data.result;
        }
        if (callback) callback();
      });
    } else {
      appGetValue(0, "getApiRouter", (data) => {
        if (data.resultFlag == -1) {
          window.getApiRouter = data.result;
        }
        if (callback) callback();
      });
    }
  };

  const erMain = {
    initialize,
  };

  window.erMain = erMain;
})();
