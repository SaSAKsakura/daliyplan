var UcBannerContainer = {
  name: "UcBannerContainer",
  mixins: [commonMinxin],
  template: `  
  <div class="UcBannerContainer" style='text-align:center'>
    <van-swipe  v-if="imgList.length" :autoplay="autoplay" @change="onChange" :show-indicators="true" :class='activeClass()'>
      <van-swipe-item v-for="(image, index) in imgList" :key="index" @click="handleSpecialFun($event, config, image)">
        <div class='banner-content'>
          <span class='bannerDelete' v-if='isShowDelete' @click='deleteImage(image)'></span>
          <img @click.stop="showBigImage(index)" :src="image.imagesrc" />
        </div>
        <span  class="imageLabel" :class="activeClass(config, image)">{{ image[config.ControlProperty.DataTextField]}}</span>
      </van-swipe-item>
    </van-swipe>
    <template v-if="!imgList.length">
      <div class="emptyBanner" :class='activeClass()'>
        <img class="emptyBannerImg" :src="config.ControlProperty.DefaultImageUrl?config.ControlProperty.DefaultImageUrl:'../assets/images/common/emptyList.png'">
        <span v-if="config.ControlProperty.DefaultValue" class="imageLabel">{{config.ControlProperty.DefaultValue}}</span>
      </div>
    </template>
    <van-image-preview get-container="body"  class="images-in-fileContainer" :start-position="currentIndex" v-model="showPic" :images="imagePreviewList"></van-image-preview>
  </div>
    `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: [Array, Object, String],
    },
  },
  data: () => ({
    imgList: [],
    currentIndex: 0,
    showPic: false,
    oplist: null,
    indexedDB: null,
  }),
  computed: {
    autoplay() {
      if (this.config.ControlProperty.Interval) {
        return this.config.ControlProperty.Interval;
      }
      return 0;
    },
    imagePreviewList() {
      let tempArr = [];
      this.imgList.forEach((item) => {
        tempArr.push(item.imagesrc);
      });
      return tempArr;
    },
    isShowDelete() {
      if (this.oplist && this.oplist.indexOf("DELETE") !== -1 && this.config.pageMode == "EDIT") {
        return true;
      }
      return false;
    },

  },
  methods: {
    initImageList(){
      let asyncTask = []
      this.imgList.forEach(item=>{
        asyncTask.push(()=>{
          return this.getImage(item)
        })
      })
      baseSpecial.limitRequest(asyncTask, 5).then(()=>{
        if(this.indexedDB){
          this.indexedDB.closeDB()
        }
      })
    },
    showBigImage(index) {
      this.currentIndex = index;
      this.showPic = true;
    },
    async getImage(item) {
      let _this = this
      const type = item.type
      if(type){
        if(type == 'file' && item.file_guid){
          let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
          let file_guid = erTool.encrypt(item.file_guid, token);
          let instance_guid = erTool.encrypt(item.instance_guid, token);
          let url =
            baseUrl +
            erowplatformBackendUrl +
            "/file/downloadfile?fileGuid=" +
            encodeURIComponent(file_guid) +
            "&pValueSet=" +
            encodeURIComponent(this.config.pValueSet) +
            "&json=" +
            // encodeURIComponent(JSON.stringify({
            //   token
            // }));
            encodeURIComponent(
              JSON.stringify({
                [window.pageConfig.st || "token"]: token,
              })
            );
          if (item.fn_code) {
            url += "&fnCode=" + item.fn_code;
          }
          if (instance_guid) {
            url += "&instanceGuid=" + encodeURIComponent(instance_guid);
          }
          _this.$set(item, 'imagesrc', url)
          return url;
        }
        if(type == 'icon' && item.icon_guid && item.icon_hash){
          if(!this.indexedDB){
            this.indexedDB = new CacheManage()
          }
          const db = await this.indexedDB.openDB()
          const cacheKey = item.icon_guid + '_' + item.icon_hash
          //先从本地缓存中获取
          if(db){
            const src = await this.getImageSrcFromCache(item, cacheKey)
            if(src){
              return _this.$set(item, 'imagesrc', src)
            }
          }
          let token = erUser.token;
          return new Promise(resolve=>{
            erRequest.request({
              url: baseUrl + erowplatformBackendUrl + "/file/downloadIconFile",
              data: JSON.stringify({rowGuid: item.icon_guid, iconFileHash: item.icon_hash}),
              headers: {
                Authorization: token,
                DataSign: erTool.generateUUID(),
              },
              contentType: "application/json",
              type: 'post',
              xhrFields: {
                responseType: "blob"
              },
              success(res){
                let blob = res
                const url = window.URL.createObjectURL(blob)
                _this.$set(item, 'imagesrc', url)
                if(db){
                  _this.indexedDB.addOrPutData({...item, src: url, row_guid: cacheKey, data: blob}).then(()=>resolve(1))
                }
              },
              error(error){
                console.log(error)
                _this.$set(item, 'imagesrc', "")
              }
            })
          }) 
        }
        if(type == 'static' && item.file_url){
          const fullPath = item.file_url;
          const lastSlashIndex = fullPath.lastIndexOf('/');
          const parentFilePath = fullPath.substring(0, lastSlashIndex) || '';
          const lastPart = fullPath.substring(lastSlashIndex + 1);
    
          const lastDotIndex = lastPart.lastIndexOf('.');
          let fileName, fileType;
          
          if(lastDotIndex !== -1) {
            fileName = lastPart.substring(0, lastDotIndex);
            fileType = lastPart.substring(lastDotIndex + 1).toLowerCase();
          } else {
            fileName = lastPart;
            fileType = 'png'; 
          }
          const filePath = _this.getImgFileUrl({parentFilePath, filename: fileName, fileType})
          return _this.$set(item, 'imagesrc', filePath)
        }
        if(type == 'http' && item.file_url){
          return _this.$set(item, 'imagesrc', item.file_url)
        }
        if(type == 'custom' && item.request_url){
          let url = item.request_url.startsWith('http')? item.request_url: baseUrl + erowplatformBackendUrl + item.request_url
          return erRequest.request({
            url,
            data: item.request.param,
            success(res){
              if(res.data){
                const blob = new Blob([res.data])
                const url = window.URL.createObjectURL(blob)
                _this.$set(item, 'imagesrc', url)
              }
            }
          })
        }
      }
      if (this.config.ControlProperty.SourceType == "dynamic" && item.file_guid && !item.imagesrc) {
        let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
        let file_guid = erTool.encrypt(item.file_guid, token);
        let instance_guid = erTool.encrypt(item.instance_guid, token);
        let url =
          baseUrl +
          erowplatformBackendUrl +
          "/file/downloadfile?fileGuid=" +
          encodeURIComponent(file_guid) +
          "&pValueSet=" +
          encodeURIComponent(this.config.pValueSet) +
          "&json=" +
          // encodeURIComponent(JSON.stringify({
          //   token
          // }));
          encodeURIComponent(
            JSON.stringify({
              [window.pageConfig.st || "token"]: token,
            })
          );
        if (item.fn_code) {
          url += "&fnCode=" + item.fn_code;
        }
        if (instance_guid) {
          url += "&instanceGuid=" + encodeURIComponent(instance_guid);
        }
        return _this.$set(item, 'imagesrc', url);
      }
      return _this.$set(item, 'imagesrc', item.imagesrc);
    },
    async getImageSrcFromCache(item, cacheKey){
      const cacheImage = await this.indexedDB.getDataByKey(cacheKey)
      if(cacheImage){
        const isExpired = await this.indexedDB.hasExpired(cacheImage)
        const isNeedGetIcon = cacheImage.icon_guid != item.icon_guid || cacheImage.icon_hash != item.icon_hash
        if(!isExpired && cacheImage.data && !isNeedGetIcon){
          const url = window.URL.createObjectURL(cacheImage.data)
          return url
        }
      }
    },
    deleteImage(item) {
      let _this = this;
      if (erowConfig.hasProp(this.config.ControlProperty, "BeforeGetContainerData")) {
        let funcName = this.config.ControlProperty.BeforeGetContainerData;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName]("deleteImage", this, item);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName]("deleteImage", this, item);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          window[fnObj][funcName]("deleteImage", this, item);
        }
      } else {
        this.$dialog
          .confirm({
            title: "系统消息",
            message: "确定删除该图片？",
          })
          .then(() => {
            let params = {
              fileGuid: item.file_guid,
              menuRowGuid: _this.config.menuRowGuid,
              fnCode: item.fn_code,
              controlGuid: _this.config.ControlGUID,
              pValueSet: _this.config.pValueSet,
            };
            erRequest.post(
              erowplatformBackendUrl + "/file/deleteFileNew",
              params,
              (res) => {
                if (res.code === "SUCCESS") {
                  _this.getData();
                } else {
                  console.log(res);
                }
              },
              (error) => {
                console.log(error);
              }
            );
          });
      }
    },
    getOpData() {
      let _this = this;
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadOpList";
      erRequest.post(
        url,
        {
          menuRowGuid: _this.config.menuRowGuid,
          controlGUID: _this.config.ControlGUID,
          pageMode: _this.config.pageMode,
          pValueSet: _this.config.pValueSet || _this.$root.pValueSet,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            let temp = res.data[this.config.ControlProperty.ID];
            eventEmitter.emit("afterGetOpList", {
              opList: temp.join(","),
              controlID: this.config.ControlProperty.ID,
              ctnrUID: this.config.ControlProperty.CtnrUID,
            });

            _this.oplist = temp;
          } else {
            console.log(res);
          }
        },
        (error) => {
          console.log(error);
          _this.$toast.fail(error.msg);
        }
      );
    },
    getData(callback) {
      if (erowConfig.hasProp(this.config.ControlProperty, "BeforeGetContainerData")) {
        let funcName = this.config.ControlProperty.BeforeGetContainerData;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName]("", this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName]("", this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          window[fnObj][funcName]("", this);
        }
      } else {
        let params = {
          controlGUID: this.config.ControlProperty.DataSourceCtnrGuid,
          ctnrUID: this.config.ControlProperty.DataSourceCtnrUID,
          menuConfigKey: this.menuConfigKey || this.$root.menuConfigKey,
          opCode: "VIEW",
          pValueSet: this.pValueSet || this.$root.pValueSet,
          paramMap: {},
        };
        erRequest.post(
          erowplatformBackendUrl + "/appBaseApi/sysLoadPostData",
          params,
          (res) => {
            if (res.code == "SUCCESS") {
              this.imgList = res.data.dataList;
              if (callback) {
                callback();
              }
              this.getOpData();
              this.initImageList()
            }
          },
          (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          }
        );
      }
    },
    onChange() {},
  },
  created() {
    this.getData();
  },
};
