var fileUpload = {
  name: "fileUpload",
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    containerConfig: {
      type: Object,
      default: () => {},
    },
    defaultfolder: {
      type: [String, Number],
      default: () => 0,
    },
    isInCardFile: {
      type: Boolean,
      default: false
    },
    folderId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      forPreList: [],
      fileList: [],
      showPhotoSheet: false,
      showPicker: false,
      step: 0,
      // fileMaxNum: 8,
      folderid: "",
      folderName: "",
      foleroption: [],
      soundRecordingShow: false,
      soundRecordingInterval: 0,
      soundRecordingTime: 0,
      fileGroup: {},
      folderconfig: {
        ControlCode: "UcDropDownList",
        ControlGuid: "213111",
        ControlProperty: {
          DataTextField: "folder_name",
          DataValueField: "folder_id",
        },
      },
      fileParams: {},
    };
  },
  /* html*/
  template: `<div class="uc-file-upload" :class="activeClass(config, containerdata)" @click.stop="showLayer()"> 
    <div class="upload-button" >{{getText}}</div>

    <van-popup :value="isShowPicker" @input="closeCustomPopup" position="bottom" get-container="#app" >
      <div style="padding:20px;">
        <van-row>
          <van-col :span="6" style="line-height:37px">
            文件类型:
          </van-col>
          <van-col :span="18" style="line-height:37px">
            <form-select
              style="border:1px solid #dcdfe6;padding-left:10px"
              :disabled="false"
              reuquired="required"
              :config="folderconfig"
              :options="foleroption"
              :value="folderid"
              :placeholder="'请选择文件类型'"
              @changeSelect="changeSelect"
            ></form-select>
          </van-col>
        </van-row>
        <van-button type="primary" style="margin-top:20px;width:100%"  @click="toStep2"  round size="small">
          上传文件
        </van-button>
      </div>
    </van-popup>

    <van-action-sheet get-container="#app" :value="isShowFileTypeSheet" @input="closeFileTypeActionSheet" :actions="fileActions" cancel-text="取消" close-on-click-action  @select="photoSheetSelect" >
    </van-action-sheet>  
    <van-popup v-model="soundRecordingShow"   get-container="#app" :close-on-click-overlay="false">
      <div class="soundRecording">
        <div class="countdown">
          {{ soundRecordingTime }}秒
        </div>
        <div class="button" :class="{ 'disabled': 3 > soundRecordingTime }" @click="stopRecord">结束录音</div>
      </div>
    </van-popup>
    </div> `,
  mixins: [commonMinxin],
  components: {
    "form-select": FormSelect,
  },
  computed: {
    fileMaxNum(){
      return this.config.ControlProperty.MaxFileUploadNumber? Number(this.config.ControlProperty.MaxFileUploadNumber) : null;
    },
    filedata() {
      return this.controlProp.RelativeContainer && pageContext[this.controlProp.RelativeContainer]
        ? pageContext[this.controlProp.RelativeContainer].initData: this.containerdata? this.containerdata: {}
    },
    controlProp() {
      return this.config.ControlProperty;
    },
    isUpload() {
      return this.config.pageMode == "ADD" ? false :  this.tempKey && this.controlProp.IsUpload && this.controlProp.IsUpload.toLowerCase() == "true";
    },
    getText() {
      let controlProp = this.config.ControlProperty;
      return controlProp.DataField && this.filedata[controlProp.DataField] ? this.filedata[controlProp.DataField] : controlProp.RSValue;
    },
    fileActions() {
      let controlProp = this.config.ControlProperty;
      let PickFileTypeList = controlProp.PickFileTypeList;
      let defaultSelect = [
        {
          name: "拍照",
          action: "take-image",
        },
        {
          name: "从图库选择",
          action: "pick-image",
        },
      ];
      let isDynamic = PickFileTypeList && PickFileTypeList.startsWith(":");
      if (isDynamic) {
        let field = PickFileTypeList.slice(1);
        let dyData = this.containerdata[field];
        return dyData ? JSON.parse(dyData) : defaultSelect;
      }
      return PickFileTypeList ? JSON.parse(PickFileTypeList) : defaultSelect;
    },
    tempKey() {
      return this.config.pageMode == "ADD"
        ? erowConfig.generateUUID()
        : this.config.ControlProperty.RelativeKeyField
          ? this.filedata[this.config.ControlProperty.RelativeKeyField]
          : this.filedata["row_guid"];
    },
    isShowPicker() {
      const { step, showPicker } = this;
      const isFirstStep = step == 1;
      return isFirstStep && showPicker;
    },
    isShowFileTypeSheet() {
      const { step, showPhotoSheet } = this;
      const isSecondStep = step == 2;
      return isSecondStep && showPhotoSheet;
    },
  },
  methods: {
    handleCardFileUploadInit(){
      if(this.isInCardFile){
        this.folderid = this.folderId || this.containerdata?.folder_id || this.containerdata?.folderId
        this.folderName = this.containerdata?.folderName || this.containerdata?.folder_name
      }
    },
    getContainer() {
      return document.body;
    },
    getAddressFromBaidu(lat, lon) {
      const ak = "C4mCU8H8iETVRDdee7bZIUmzvjM3ZHxw";

      return new Promise((resolve) => {
        if (!lat || !lon) return resolve("");
        window._BMapSecurityConfig = {
          // 代理服务器地址
          serviceHost: baseUrl + "/_BMapService/",
          // serviceHost: 'http://10.103.174.44:8035/_BMapService/'
        };
        const url = baseUrl + `/_BMapService/reverse_geocoding/v3/?` + `output=json&coordtype=wgs84ll&location=${lat},${lon}`;

        $.ajax({
          url,
          type: "GET",
          dataType: "json",
          success(res) {
            if (res.status === 0) {
              resolve(res.result.formatted_address || "");
            } else {
              resolve("");
            }
          },
          error() {
            resolve("");
          },
        });
      });
    },
    getAddressFromBaiduBySDK(lat, lng) {
      return new Promise((resolve, reject) => {
        // 验证输入参数
        if (typeof lng !== "number" || typeof lat !== "number") {
          reject(new Error("经纬度必须是数字"));
          return;
        }
        if (lng < -180 || lng > 180) {
          reject(new Error("经度范围应在-180到180之间"));
          return;
        }
        if (lat < -90 || lat > 90) {
          reject(new Error("纬度范围应在-90到90之间"));
          return;
        }

        // 检查百度地图API是否加载
        if (typeof BMap === "undefined") {
          reject(new Error("百度地图API未加载，请检查AK密钥和网络连接"));
          return;
        }

        // 创建地图实例（用于地理编码）
        const point = new BMap.Point(lng, lat);
        // 创建地理编码实例
        const geoc = new BMap.Geocoder();
        // 设置超时时间（5秒）
        const timeout = setTimeout(() => {
          reject(new Error("获取地址信息超时，请检查网络连接"));
        }, 50000);
        // 使用getLocation方法获取地址
        geoc.getLocation(
          point,
          (result) => {
            clearTimeout(timeout);
            if (result) {
              let comp = result.addressComponents;
              let addr = comp.city + comp.district + comp.street + comp.streetNumber;
              resolve(addr);
            } else {
              reject(new Error("未找到对应的地址信息"));
            }
          },
          {
            // 设置搜索半径（米）
            radius: 1000,
          },
        );
      });
    },
    uploadAllFileWhenADD(newRowGuid) {
      // let fileParams = {
      //   fileName: this.generateFileName(),
      //   rowGuid: this.tempKey,
      //   userId: erUser.userId,
      //   fnCode: this.config.ControlProperty.FnCode,
      //   folderCode: this.folderid + "",
      //   folderName: this.folderName,
      //   bizInfo: {
      //     ClientDate: erowConfig.formatDateReg(new Date(), "yyyy/MM/dd hh:mm:ss"),
      //   },
      //   fileType: fileType,
      //   ControlGUID: this.containerConfig?.ControlGUID,
      // };
      if(!this.fileParams || Object.keys(this.fileParams).length === 0){
        //fileParams不是计算属性，新增时可能还是空对象，空对象时做一下初始化
        this.fileParams = {
          fileName: this.generateFileName(),
          rowGuid: newRowGuid || this.tempKey, //优先使用传递进来的rowGuid，需要根据这个去找新增状态的tempFile，用tempKey可能会因为新增时新生成的guid导致找不到tempFile
          userId: erUser.userId,
          fnCode: this.config.ControlProperty.FnCode,
          folderCode: this.folderid + "",
          folderName: this.folderName,
          bizInfo: {
            ClientDate: erowConfig.formatDateReg(new Date(), "yyyy/MM/dd hh:mm:ss"),
          },
          ControlGUID: this.containerConfig?.ControlGUID,
        };
      }
      let params = this.fileParams;
      let _this = this;
      params.folderCode = params.folderCode + "";
      return new Promise((resolve) => {
        if (!debugMode && params.rowGuid) {
          erJsBridge.getFileList(params.userId, params.fnCode, params.rowGuid, params.folderCode, function (res) {
            if (res.resultFlag == "-1") {
              let fileList = res.result.filter((item) => {
                return item.upload_status != "Uploaded";
              });
              if (res.result.length) {
                let promiseArr = [];
                fileList.forEach((file) => {
                  promiseArr.push(_this.uploadFile(params, file, newRowGuid));
                });
                // _this.$toast.loading("文件上传中，请耐心等待");
                Promise.all(promiseArr)
                  .then((res) => {
                    resolve("success");
                    // _this.$toast.clear();
                  })
                  .catch((err) => {
                    resolve("eror");
                    // _this.$toast.clear();
                  });
              } else {
                resolve("noFile");
              }
            } else {
              resolve("eror");
            }
          });
        } else {
          resolve(2);
        }
      });
    },
    async uploadFile(params, file, newRowGuid) {
      console.log("params, file", params, file);
      let _this = this;
      let bdAddress = await this.getAddressFromBaiduBySDK(Number(file.lat), Number(file.lon));
      const digitalWatermark = [
        { blockId: 1, text: file.create_time },
        { blockId: 2, text: bdAddress || "未知地区" },
        // { blockId: 2, text: "未知地区" },
        { blockId: 3, text: file.lon || "" },
        { blockId: 4, text: file.lat || "" },
        { blockId: 5, text: file.remark || "" },
      ];

      params.bizInfo = params.bizInfo || {};
      params.bizInfo.digitalWatermark = digitalWatermark;
      let rowGuid = this.config.pageMode == "ADD" ? newRowGuid : params.rowGuid;
      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      const uploadUrl =
        baseUrl +
        erowplatformBackendUrl +
        "/file/uploadFile?json=" +
        encodeURIComponent(JSON.stringify({ [window.pageConfig.st || "token"]: token }));
      let uploadFields = null
      if(this.config.UploadFileds){
        uploadFields = Object.prototype.toString.call(this.config.UploadFileds) === "[object Object]"?
        this.config.UploadFileds: typeof this.config.UploadFileds === "string"? 
        JSON.parse(this.config.UploadFileds): this.config.UploadFileds
      }
      if(!uploadFields){
        uploadFields = {}
      }
      let pValueSet = this.config.pValueSet || erowConfig.generateUUID();
      if (igwMode) {
        return new Promise((res, rej) => {
          let formData = new FormData();
          let fileData = erTool.base64ToFile(file, params.fileName + ".png");
          formData.append("file", fileData);
          formData.append("pValueSet", pValueSet);
          formData.append("ControlGUID", params.ControlGUID);
          formData.append("fnCode", params.fnCode);
          formData.append("rowGuid", rowGuid);
          formData.append("fileName", params.fileName);
          formData.append("bizInfo", JSON.stringify(params.bizInfo));
          formData.append("ocrType", fileData.type);
          formData.append("digitalWatermark", JSON.stringify(digitalWatermark));
          Object.keys(uploadFields).forEach(key=>{
            formData.append(key, uploadFields[key])
          })
          console.log("formData", formData);
          $.ajax({
            url: uploadUrl,
            type: "post",
            headers: {
              Authorization: erUser.token,
              "Accept-Charset": "UTF-8",
            },
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
              if (result.code == "SUCCESS") {
                res();
              } else {
                rej(data);;
              }
            },
          });
        });
      }
      return new Promise((res, rej) => {
        erJsBridge.erowUploadFile(
          uploadUrl,
          {
            rowGuid: rowGuid,
            pValueSet: pValueSet,
            fnCode: params.fnCode,
            folderId: params.folderCode + "",
            ControlGUID: params.ControlGUID,
            folderName: params.folderName,
            longitude: params.longitude,
            latitude: params.latitude,
            bizInfo: JSON.stringify(params.bizInfo),
            digitalWatermark: JSON.stringify(digitalWatermark),
            fileName: file.file_name,
            ...uploadFields
          },
          file.file_id,
          "file",
          file.file_name,
          file.file_path,
          "image/jpeg",
          (data) => {
            if (data.resultFlag == -1 && data.result.success_count != 0) {
              res();
            } else {
              rej(data);
              _this.$toast.fail(data.errMsg || '上传失败');
            }
          },
        );
      });
    },
    loadBaiduSdk() {
      return new Promise((resolve, reject) => {
        // 如果已加载直接返回 https://api.map.baidu.com/api?v=3.0&ak=reoWDQXVSoUqRm3ZFuvFVVMSVB4QoEkP
        let BMap_URL = "https://api.map.baidu.com/api?v=3.0&ak=reoWDQXVSoUqRm3ZFuvFVVMSVB4QoEkP&callback=onBMapCallback";
        if (window.BMap) {
          resolve(window.BMap);
          return true;
        }
        // 百度地图异步加载回调处理
        window.onBMapCallback = () => {
          console.log("百度地图脚本初始化成功...");
          resolve(window.BMap);
        };
        // 插入script脚本
        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = BMap_URL;
        document.body.appendChild(scriptElement);
      });
    },
    generateFileName() {
      let dfVal = new Date().getTime() + "";
      let dynamicField = this.controlProp.FileNameField;
      if (dynamicField) {
        let temp = this.filedata[this.controlProp.FileNameField];
        if (temp && temp.indexOf("{{") != -1) {
          //{{}}代表里面可定义日期格式,格式如站班会_{{yyyyMMdd}}
          let startIndex = temp.indexOf("{{");
          let endIndex = temp.indexOf("}}");

          let pre = temp.substring(0, startIndex);
          let forMat = temp.substring(startIndex + 2, endIndex);
          let formatVal = erowConfig.formatDateReg(new Date(), forMat);
          dfVal = pre + formatVal;
        } else {
          dfVal = temp ? temp : dynamicField;
        }
      }
      return dfVal;
    },
    toStep2() {
      this.step = 2;
      this.showPhotoSheet = true;
    },
    closeFileTypeActionSheet(value) {
      this.showPhotoSheet = value;
    },
    changeSelect(params) {
      this.folderid = params.value;
      this.folderName = params.text;
      // this.changeSelect = params.value;
    },
    showLayer() {
      let controlProp = this.config.ControlProperty;
      if (controlProp.DisableField) {
        let realKey = "";
        let allKey = Object.keys(this.filedata);
        let isHasKey = allKey.some((item) => {
          return item[0] == "C";
        });
        if (isHasKey) {
          Object.keys(this.$parent.fieldMap).forEach((key) => {
            if (this.$parent.fieldMap[key] == controlProp.DisableField) {
              realKey = key;
            }
          });
          if (this.filedata[realKey] == "true" || this.filedata[realKey] == "-1") {
            return;
          }
        } else {
          if (this.filedata[controlProp.DisableField] == "true" || this.filedata[controlProp.DisableField] == "-1") {
            return;
          }
        }
      }

      //如果配置了不用分组，直接显示图库
      if (controlProp.IsNeedGroup && controlProp.IsNeedGroup.toLowerCase() === "false") {
        this.toStep2();
        this.folderid = this.filedata[this.controlProp.GroupField]? this.filedata[this.controlProp.GroupField]: this.isInCardFile? this.folderId : "";
        this.folderName = this.foleroption.find((item) => item.folder_id == this.folderid)?.folder_name || "";
      } else if (this.filedata[this.controlProp.visibleToDataField] == -1 || this.filedata[this.controlProp.visibleToDataField] == "true") {
        this.toStep2();
      } else {
        // this.getFolderList();
        if(this.config.ControlProperty.FolderDataSourceCtnrUID && this.config.ControlProperty.FolderDataSourceCtnrUID !== ""){
          this.getFolderListByDataSourceCtnrUID();
        }else{
          this.getFolderList();
        }
        this.step = 1;

        this.showPicker = true;
      }
    },
    closeCustomPopup(value) {
      this.showPicker = value;
    },
    getFolderList() {
      let _this = this;
      let params = {
        fnCode: this.config.ControlProperty.FnCode,
        pValueSet: pageContext.root.pValueSet,
      };
      erRequest.post(
        erowplatformBackendUrl + "/file/getFileFolderNew",
        params,
        (res) => {
          if (res.code == "SUCCESS") {
            _this.foleroption = res.data;
            _this.foleroption.forEach((item) => {
              item.folder_id = item.folder_id + "";
            });
            _this.folderid =
              _this.controlProp.GroupField && _this.filedata[_this.controlProp.GroupField]
                ? _this.filedata[_this.controlProp.GroupField] + ""
                : res.data[0].folder_id + "";
            _this.folderName = _this.foleroption.find((item) => item.folder_id == _this.folderid)?.folder_name || "";
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        },
      );
    },
    getFolderListByDataSourceCtnrUID() {
      let _this = this;
      let params = {
        controlGUID: this.config.ControlProperty.ControlGUID,
        ctnrUID: this.config.ControlProperty.FolderDataSourceCtnrUID,
        menuConfigKey: this.config.menuConfigKey,
        // opCode: "VIEW",
        pValueSet: this.config.pValueSet,
        paramMap: {},
      };
      erRequest.post(
        erowplatformBackendUrl + "/appBaseApi/sysLoadPostData",
        params,
        (res) => {
          if (res.code == "SUCCESS") {
            _this.foleroption = res.data.dataList;
            _this.foleroption.forEach((item) => {
              item.folder_id = item.folder_id + "";
            });
            _this.folderid =
              _this.controlProp.GroupField && _this.filedata[_this.controlProp.GroupField]
                ? _this.filedata[_this.controlProp.GroupField] + ""
                : _this.foleroption[0].folder_id + "";
            _this.folderName = _this.foleroption.find((item) => item.folder_id == _this.folderid)?.folder_name || "";
          } else {
            this.$toast.fail(res.msg);
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );

    },
    photoSheetSelect: function (item, idx) {
      if (this.fileMaxNum && this.forPreList.length >= this.fileMaxNum) {
        this.$toast.fail({
          message: "最多上传" + this.fileMaxNum + "张照片",
        });
        return;
      }
      if (item.action) {
        let ac = item.action.split("-")[0];
        let fileType = item.action.split("-")[1];
        let fileParams = {
          fileName: this.generateFileName(),
          rowGuid: this.tempKey,
          userId: erUser.userId,
          fnCode: this.config.ControlProperty.FnCode,
          folderCode: this.folderid + "",
          folderName: this.folderName,
          bizInfo: {
            ClientDate: erowConfig.formatDateReg(new Date(), "yyyy/MM/dd hh:mm:ss"),
          },
          fileType: fileType,
          ControlGUID: this.containerConfig?.ControlGUID,
        };
        if (this.config.ControlProperty?.DataNavigateUrlFormatString) {
          let DataNavigateUrlFormatString = JSON.parse(this.config.ControlProperty.DataNavigateUrlFormatString);
          if (DataNavigateUrlFormatString.ControlGUID) {
            fileParams.ControlGUID = DataNavigateUrlFormatString.ControlGUID;
          }
        }
        this.fileParams = fileParams;
        if (ac == "take") {
          //调用相关软件，拍照录音摄像
          let map = {
            image: this.takeImage,
            audio: this.takeAudio,
            video: this.takeVideo,
          };
          if (map[fileType]) {
            map[fileType](fileParams);
          } else {
            this.$toast.fail("请检查配置项");
          }
        } else if (ac == "pick") {
          //从手机本地选取文件
          this.pickFile(fileParams);
        } else if (ac == "sign") {
          this.signFile(fileParams);
        }
      }
    },
    handleAfterUpload(params) {
      let _this = this;
      let funname = _this.config.ControlProperty.AfterUploadClientActions;
      if (funname) {
        this.runSpeicalFun(funname, params);
      } else {
        _this.$emit("update", params);
      }
    },
    takeImage(params) {
      let _this = this;
      if (igwMode) {
        new Promise((res, rej) => {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ["camera"], // 可以指定来源是相册还是相机，默认二者都有'album', 'camera'
            quality: 0.6, //压缩质量，范围0～1，数值越小，质量越低，压缩率越高（仅对jpg有效）
            success: function (data) {
              res(data.localIds[0]);
            },
            fail: function (err) {
              resultObj.errMsg = "拍照组件异常！";
              rej();
            },
          });
        }).then((localId) => {
          return new Promise((res) => {
            wx.getLocalImgData({
              localId: localId,
              success: function (data) {
                console.log(data);
                if (data.errMsg == "getLocalImgData:ok") {
                  if (this.isUpload) {
                    let promiseArr = [];
                    _this.$toast.loading("文件上传中，请耐心等待");
                    promiseArr.push(_this.uploadFile(params, data.localData));
                    Promise.all(promiseArr)
                      .then((res) => {
                        _this.$toast.clear();
                        _this.handleAfterUpload(res.data);
                      })
                      .catch((err) => {
                        _this.$toast.clear();
                      });
                  } else {
                    _this.$set(_this.fileGroup, params.folderCode, data.localData);
                    _this.handleAfterTake(params);
                  }
                } else {
                }
              },
            });
          });
        });
      } else {
          let takeImageFun = (gps) => {
            erJsBridge.takePhotoConfig({
              userId: params.userId,
              fileName: params.fileName,
              fnCode: params.fnCode,
              instanceGuid: params.rowGuid,
              folderCode: params.folderCode,
              uploadAPIPath: "",
              bizInfo: params.bizInfo,
              takePicType: _this.config.ControlProperty.takePicType || "",
              picPxW: _this.config.ControlProperty.picPxW,
              picPxH: _this.config.ControlProperty.picPxH,
              callback: (data) => {
                if (data.resultFlag == "-1") {
                  if(gps){
                    let parms1 = Object.assign(params, { latitude: gps.lat, longitude: gps.lon });
                    _this.handleAfterTake(parms1, data);
                  }
                  else{
                    _this.handleAfterTake(params, data);
                  }
                  
                } else {
                  vm.$toast.fail(data.errMsg);
                }
              },
            });
        }
        // if(erJsBridge.osType == 'iOS'){
        if (this.config.ControlProperty.IsNeedGPS=='false') {
          takeImageFun();
          return;
        }
        let loading = _this.$toast.loading("获取定位中，请耐心等待");
        //10s后如果loading还没关闭，说明获取定位失败，关闭loading
        setTimeout(() => {
          loading.clear();
        }, 10000);
        // if(erJsBridge.osType == 'iOS'){
        erJsBridge.getGPS((rData) => {
          loading.clear();
          if (rData.resultFlag == "-1") {
            let gps = rData.result;
            if (!gps.lat && !gps.lon) {
              _this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
            }
            takeImageFun(gps);
            // erJsBridge.takePhoto(params.userId, params.fileName, params.fnCode, params.rowGuid, params.folderCode, "", params.bizInfo, function (data) {
            //   if (data.resultFlag == "-1") {
            //     _this.handleAfterTake(params, data);
            //   } else {
            //     vm.$toast.fail(data.errMsg);
            //   }
            // });
          } else {
            _this.$dialog.fail("获取坐标失败，请检查定位权限");
          }
        });
        // return;
        // }
        // erJsBridge.takePhoto(params.userId, params.fileName, params.fnCode, params.rowGuid, params.folderCode, "", params.bizInfo, function (data) {
        //   if (data.resultFlag == "-1") {
        //     _this.handleAfterTake(params, data);
        //   } else {
        //     vm.$toast.fail(data.errMsg);
        //   }
        // });
      }
    },
    handleAfterTake(params, data = {}) {
      if (this.isUpload) {
        this.getFileListByFolder(params, true);
      } else {
        this.getFileListByFolder(params, false);
      }
    },
    takeAudio(params) {
      let _this = this;
      erJsBridge.audioRecordStart(
        params.userId,
        params.fileName,
        params.fnCode,
        params.rowGuid,
        params.folderCode,
        "",
        "",
        params.bizInfo,
        function (data) {
          if (data.resultFlag == -1) {
            _this.clearSoundTimeInterval();
            _this.soundRecordingShow = true;
            _this.soundRecordingInterval = setInterval(function () {
              _this.soundRecordingTime++;
            }, 1000);
          } else {
            _this.$toast.fail(data.errMsg);
          }
        },
      );
    },
    takeVideo(params) {
      let _this = this;
      erJsBridge.videoRecord(
        params.userId,
        params.fileName,
        params.fnCode,
        params.rowGuid,
        params.folderCode,
        "",
        "",
        params.bizInfo,
        function (data) {
          if (data.resultFlag == "-1") {
            _this.handleAfterTake(params, data);
          } else {
            vm.$toast.fail(data.errMsg);
          }
        },
      );
    },

    clearSoundTimeInterval() {
      if (this.soundRecordingInterval) clearInterval(this.soundRecordingInterval);
      this.soundRecordingInterval = null;
      this.soundRecordingTime = 0;
    },

    stopRecord() {
      let _this = this;

      erJsBridge.audioRecordStop((data) => {
        this.soundRecordingShow = false;
        this.clearSoundTimeInterval();
        if (data.resultFlag == -1) {
          this.handleAfterTake(_this.fileParams, data);
        } else {
          this.$toast.fail(data.errMsg);
        }
      });
    },
    pickFile(params) {
      let _this = this;
      if (igwMode) {
        new Promise((res, rej) => {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ["album"], // 可以指定来源是相册还是相机，默认二者都有'album', 'camera'
            quality: 0.6, //压缩质量，范围0～1，数值越小，质量越低，压缩率越高（仅对jpg有效）
            success: function (data) {
              res(data.localIds[0]);
            },
            fail: function (err) {
              resultObj.errMsg = "相机组件异常！";
              rej();
            },
          });
        }).then((localId) => {
          return new Promise((res) => {
            wx.getLocalImgData({
              localId: localId,
              success: function (data) {
                if (data.errMsg == "getLocalImgData:ok") {
                  if (this.isUpload) {
                    let promiseArr = [];
                    promiseArr.push(_this.uploadFile(params, data.localData));
                    Promise.all(promiseArr).then((res) => {
                      _this.handleAfterUpload(res);
                    });
                  } else {
                    _this.$set(_this.fileGroup, params.folderCode, data.localData);
                    this.handleAfterTake(params);
                  }
                } else {
                  _this.$toast.fail(data.errMsg);
                }
              },
            });
          });
        });
      } else {
         let pickFileFun=()=>{
            let fileType = params.fileType;
            let pickFunc = null;
            switch(fileType) {
              case "image":
                pickFunc = erJsBridge.pickPhoto;
                break;
              case "audio":
              case "video":
              case "application":
              case "text":
              case "all":
                pickFunc = erJsBridge.pickFile;
                break;
              default:
                pickFunc = erJsBridge.pickFile;
                break;
            }
            pickFunc(
              params.userId,
              params.fileName,
              params.fnCode,
              params.rowGuid,
              params.folderCode,
              "",
              params.bizInfo,
              function (data) {
                if (data.resultFlag == "-1") {
                  _this.handleAfterTake(params, data);
                } else {
                  vm.$toast.fail(data.errMsg);
                }
              },
              params.fileType,
            );
        }
        if(_this.config.ControlProperty.IsNeedGPS=='false') {
          pickFileFun();
          return;
        }
        let loading = _this.$toast.loading("获取定位中，请耐心等待");
        //10s后如果loading还没关闭，说明获取定位失败，关闭loading
        setTimeout(() => {
          loading.clear();
        }, 10000);
        // if(erJsBridge.osType == 'iOS'){
        erJsBridge.getGPS((rData) => {
          loading.clear();
          if (rData.resultFlag == "-1") {
            let gps = rData.result;
            if (!gps.lat && !gps.lon) {
              _this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
            }
            pickFileFun();
          } else {
            _this.$dialog.fail("获取坐标失败，请检查定位权限");
          }
        });
      }
    },
    getFileListByFolder(params, IsUpload) {
      let _this = this;
      params.folderCode = params.folderCode + "";
      erJsBridge.getFileList(params.userId, params.fnCode, params.rowGuid, params.folderCode, function (res) {
        if (res.resultFlag == "-1") {
          let fileList = res.result.filter((item) => {
            return item.upload_status != "Uploaded";
          });
          if (res.result.length && IsUpload) {
            let promiseArr = [];
            fileList.forEach((file) => {
              promiseArr.push(_this.uploadFile(params, file));
            });
            _this.$toast.loading("文件上传中，请耐心等待");
            Promise.all(promiseArr)
              .then((res) => {
                _this.$toast.clear();
                _this.handleAfterUpload(res);
              })
              .catch((err) => {
                _this.$toast.clear();
              });
          } else {
            _this.$set(_this.fileGroup, params.folderCode, fileList);
            _this.$emit("update", fileList);
          }
          if (_this.config.ControlProperty.AfterPickFileCallBack) {
            //选择完文件后回调
            apis.runSpeicalFun({ vm: _this, funName: _this.config.ControlProperty.AfterPickFileCallBack, params: fileList });
          }
        }
      });
    },
    getBase64Img(imgUrl, name, fileName, callback) {
      let img = new Image();
      if (img) {
        img.src = imgUrl;
        img.onload = function () {
          // 利用canvas进行转换
          let imgStr = erTool.image2Base64(img); // 转换好的base64编码
          callback(imgStr, fileName);
        };
      }
    },
    delImgBtn(index) {
      erJsBridge.deleteFile(this.fileforPreList[index].file_id, (data) => {
        let fileName = vm.forPreList[index].fileName;
        vm.forPreList = vm.forPreList.filter((el) => {
          console.log(el);
          return el.fileName !== fileName;
        });
      });
    },
    signFile() {
      let _this = this;
      let fileParams = {
        fileName: this.generateFileName(),
        rowGuid: this.tempKey,
        userId: erUser.userId,
        fnCode: this.config.ControlProperty.FnCode,
        folderCode: this.folderid + "",
        folderName: this.folderName,
        bizInfo: {
          ClientDate: erowConfig.formatDateReg(new Date(), "yyyy/MM/dd hh:mm:ss"),
        },
        // fileType: fileType,
        // ControlGUID: this.containerConfig?.ControlGUID,
      };
      if (this.config.ControlProperty?.DataNavigateUrlFormatString) {
        let DataNavigateUrlFormatString = JSON.parse(this.config.ControlProperty.DataNavigateUrlFormatString);
        if (DataNavigateUrlFormatString.ControlGUID) {
          fileParams.ControlGUID = DataNavigateUrlFormatString.ControlGUID;
        }
      }
      erJsBridge.appSign(fileParams.userId, fileParams.fileName, fileParams.fnCode, fileParams.rowGuid, fileParams.folderCode, "", "", fileParams.bizInfo, function (data) {
        if (data.resultFlag == "-1") {
          _this.handleAfterTake(fileParams, data);
        } else {
          vm.$toast.fail(data.errMsg);
        }
      });
    },
  },
  created() {
    this.loadBaiduSdk();
  },
  mounted(){
    this.handleCardFileUploadInit()
  }
};
