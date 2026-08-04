var templateFacialRecognition = {       
  template: `<div class="W100 H100" id="templateFRN">
        <div v-if="pageStatus == -1 && facialInfo" class="template-facial-recognition W100 H100">
            <div class="frnotes-title">请确保是<span style="color: #61b2ff;">&nbsp;{{facialInfo.nativeName}}&nbsp;</span>本人操作</div>
            <div style="color: #636D7E;">平视手机，正对光源</div>
            <img class="frnotes-scan" src="../assets/images/template/frnotes-sacn.png">
            <div class="frnotes-info-title">拍摄须知</div>
            <div class="frnotes-info flex_r_vc">
                <div>
                    <img src="../assets/images/template/poor-light.png">
                    <div>光线充足</div>
                </div>
                <div class="frnotes-red">
                    <img class="frnotes-info-red" src="../assets/images/template/frnotes-red.png">
                    <img src="../assets/images/template/without-hat.png">
                    <div>不戴帽子</div>
                </div>
                <div class="frnotes-red">
                    <img class="frnotes-info-red" src="../assets/images/template/frnotes-red.png">
                    <img src="../assets/images/template/without-glasses.png">
                    <div>不戴眼镜</div>
                </div>
                <div class="frnotes-red">
                    <img class="frnotes-info-red" src="../assets/images/template/frnotes-red.png">
                    <img src="../assets/images/template/without-mask.png">
                    <div>不戴口罩</div>
                </div>
            </div>
            <div class="frresults-button">
              <van-button class="W100" type="info" round size="small" @click='takePhoto()'>开始采集</van-button>
            </div>
        </div>
        <div v-if = "pageStatus == 0 || pageStatus == 1" class="template-facial-recognition W100 H100">
            <img class="frresults-photo" :src="facialInfo.fileSrc" :style="pageStatus == 0 ? 'max-height: 90%;':''">
            <div class="frresults-button" v-if = "pageStatus == 0">
                <van-button class="half-button white-button-erow" type="info" round size="small" @click='takePhoto()'>取消</van-button>
                <van-button class="half-button" type="info" round size="small" @click='upload()'>确定</van-button>
            </div>
            <div v-if='pageStatus == 1' class='template-facial-recognition W100' style='padding: 0;'>
               <img class="frresults-icon" :src="resultInfo.flag == -1 ? '../assets/images/template/success.png':'../assets/images/template/fail.png'">
                <div>{{resultInfo.flag == -1 ? '注册成功':'注册失败'}}</div>
                <div v-if="resultInfo.flag == 0" class="frresults-info-fail">
                  <div>提示：</div>
                  <div v-if="Array.isArray(resultInfo.failureMsg) && resultInfo.failureMsg.length">
                    <div v-for="reason in resultInfo.failureMsg">{{reason}}</div>
                  </div>
                  <div v-else>{{resultInfo.failureMsg}}</div>
            
                </div>
                <div class="frresults-info W100" v-if="resultInfo.flag == -1">
                    <div>文件大小：{{resultInfo.fileSize}}</div>
                    <div>采集时间：{{resultInfo.collectDate}}</div>
                </div>
                <div class="frresults-button">
                  <van-button class="W100" type="info" round size="small" @click='takePhoto()'>重新采集</van-button>
                </div>
            </div>
        </div>
    </div>`,
  props: {
    /*格式
    {
    },
     */
    containerData: {
      type: [Object, Array],
      default: () => {},
    },
    config: {
      type: [Object, Array],
      default: () => {},
    },
  },
  data() {
    return {
        /**
         * -1：采集须知；0：采集预览；1：采集结果
        */
        pageStatus: -1,
        facialInfo: {
          nativeName: '',
          fileSrc: "",
          targetUserGuid: "",
          file: "",
          fileName: "",
        },
        resultInfo: {
            flag: -1,    //-1注册成功，0注册失败
            failureMsg: ["照片清晰度不足","失败原因2"],    //注册失败原因
            collectDate: "",
            fileSize: ""
        }
    };
  },
  components: {},
  methods: {
    takePhoto() {
      let fileName = "文件" + new Date().getTime();
      let rowId = erTool.generateUUID();
      let folderCode = "templateFacialRecognition";
      let bizInfo = this.facialInfo;
      let _this = this;
      _this.$set(_this.facialInfo,'fileName',fileName);
      erJsBridge.takePhotoV3(erUser.userId, fileName, this.config.ControlProperty.FnCode, rowId, folderCode, "", bizInfo, (data) => {
        if (data.resultFlag == "-1") {
        console.log('takePhotoV3', data.result.dataCode);
        _this.getBase64ImgPath(data.result.dataCode, fileName)
        }
      });
    },
    getBase64ImgPath(dataCode, fileName) {
      let _this = this;
      erJsBridge.getBase64Img(dataCode,(data)=>{
        console.log('getBase64Img',data);
        _this.pageStatus = 0;
        _this.$set(_this.facialInfo,'fileSrc', data.result.content);
        _this.getBase64Image(data.result.content, fileName, (imgStr, fileName) => {
          _this.$set(_this.facialInfo,'file',imgStr);
        })
      })
    },
    getBase64Image(imgUrl, fileName, callback) {
      let img = new Image();
      if (img) {
          img.src = imgUrl;
          img.onload = function () {
              // 利用canvas进行转换
              let imgStr = erTool.image2Base64(img); // 转换好的base64编码
              callback(imgStr, fileName)
          };
      }
    },
    upload() {
      let _this = this;
      let url = JSON.parse(_this.config.ControlProperty.ExtraConfig).submitUrl;
      let fileData = erTool.base64ToFile(_this.facialInfo.file, _this.facialInfo.fileName + ".png");
      const formData = new FormData();
      formData.append("targetUserGuid", _this.facialInfo.targetUserGuid);
      formData.append("file", fileData);

      $.ajax({
        url: baseUrl + url,
        type: "post",
        headers: {
          Authorization: erUser.token,
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
          if (res.code == "SUCCESS") {          
            _this.resultInfo.flag = Number(res.data.flag);
            if(_this.resultInfo.flag) {
              _this.resultInfo.collectDate = res.data.collectDate;
              _this.resultInfo.fileSize = res.data.fileSize;
            } else {
              _this.resultInfo.failureMsg = res.data.failureMsg;
            }
            _this.pageStatus = 1;
          }
        },
      });
    },
  },
  mounted() {
    let detailData = pageManager.getPageParams().detailData;
    if(detailData) {
      this.facialInfo = detailData;
    } else if(this.containerData) {
      this.facialInfo = this.containerData;
    }
    this.facialInfo.nativeName = this.facialInfo.native_name || this.facialInfo.nativeName|| this.facialInfo.user_name;
    this.facialInfo.targetUserGuid = this.facialInfo.user_guid || this.facialInfo.row_guid || this.facialInfo.targetUserGuid;
    this.facialInfo.collectFlag = this.facialInfo.collect_flag || this.facialInfo.collectFlag;
    if(this.facialInfo.collectFlag && this.facialInfo.collectFlag == '已采集') {
      let _this = this;
      _this.pageStatus = 1;
      let url = JSON.parse(_this.config.ControlProperty.ExtraConfig).getImageUrl;
      let params = {
        userGuid: _this.facialInfo.targetUserGuid
      }
      $.ajax({
        url: baseUrl + url,
        type: "post",
        headers: {
          Authorization: erUser.token,
        },
        data: params,
        success: function (res) {
          if (res.code == "SUCCESS") {  
            _this.resultInfo.collectDate = res.data.date;
            _this.resultInfo.fileSize = res.data.fileSize;
            _this.$set(_this.facialInfo,'fileSrc','data:image/png;base64,'+ res.data.imageContent);
          }
        },
      }); 
    }
  },
}
