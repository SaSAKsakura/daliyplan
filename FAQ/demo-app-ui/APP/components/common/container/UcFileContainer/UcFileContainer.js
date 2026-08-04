let UcFileContainer = {
  name: "UcFileContainer",
  props: {
    config: {
      type: Object,
      default: () => { },
    },
    rowGuid: {
      type: String,
    },
    data: {
      type: Object,
      default: () => { },
    },
    keyValue: {
      default: "",
    },
    isincard: {
      type: Boolean,
      default: false,
    },
    isedit: {
      type: Boolean,
      default: false,
    },
    isInCardFile: {
      type: Boolean,
      default: false
    },
    cardFileIndex: {
      type: Number,
    },
    folderId: {
      type: [String, Number]
    }
  },
  components: {
    "file-upload": fileUpload,
  },
  data() {
    return {
      onlineFileList: [],
      tempFileList: [],
      audioMap: {
        stop: this.getImgFileUrl({ parentFilePath: "icon", filename: "audio", fileType: "png" }),
        pause: this.getImgFileUrl({ parentFilePath: "icon", filename: "audio-play", fileType: "png" }),
        play: this.getImgFileUrl({ parentFilePath: "icon", filename: "audio-pause", fileType: "png" }),
      },
      showPhotoSheet: false,
      showPic: false,
      images: [],
      fileKeyName: "",
      folderCode: this.config.ControlProperty.folderCode || "commonFile",
      osType: !/android/i.test(navigator.userAgent) ? "iOS" : "android",
      imageIndex: [], //图片预览数组对应的index索引
      currentIndex: 0,
      time: null,
      curAmr: null,
      opList: ["READ"],
      paginationPages: 1,
      initialListSize: 0,
      // allFileList: [],
      longPressActions: [
        {
          name: "保存",
          operation: "save",
        },
        {
          name: "分享",
          operation: "share",
        },
      ],
      longPressStatus: false,
      audioPlayer: null,
      currentMode: "grid",
      viewTypeObj: {
        thumbnail: "按图片显示",
        grid: "按列表显示",
      },
      soundRecordingShow: false,
      soundRecordingInterval: 0,
      soundRecordingTime: 0,
      fileParams: {},
      uploadProgressVisible: false,
      uploadProgressCurrentRate: 0,
      uploadProgressRate: 0,
    };
  },
  /* html */
  template: `
    <div class="uc-file-container" :class="activeClass()">
      <div class="upload-file-mobile-box" v-if="labelText">
        <div class="upload-file-mobile-button">
          <img v-if="config.ControlProperty.TitleImgUrl" class="upload-file-title-img" :src="config.ControlProperty.TitleImgUrl" />
          <span style="color: #1a1a1a; font-size: 0.875rem; font-weight: 900">{{labelText}}</span>

          <!-- 新文件选项配置 -->
          <span class="underline upload-file-right-button" 
            v-if="(config.pageMode !== 'VIEW' || config.ControlProperty.IsAllowUploadWhenView == 'true')&&viewType!='thumbnail' &&
            config.ControlProperty.IsHideADD !== 'true' && !this.isDisabled">
            <div class='uploaderContainer ImgPreview-list'>
              <file-upload v-show="isShowThumbnailUpload" :config="uploaderConfig" :containerdata="fileData" @update="afterFileUpload" :is-in-card-file="isInCardFile" :folder-id="folderId" ref="uploadRef" :containerConfig="config">
              </file-upload>
            </div>
          </span>
          <!-- 原始文件选项兼容 -->
          <span class="underline upload-file-right-button" @click="showPhotoSheet=true" v-if="config.pageMode !== 'VIEW'&&viewType!='thumbnail' && config.ControlProperty.IsHideADD !== 'true' && !Object.keys(uploaderConfig).length ">
            {{ buttonText }}
          </span>
        </div>
      </div>
      <div v-if="isRenderEmpty" class="list-empty" >
          <img :src="emptyImage" />
          <p>暂无文件</p>
      </div>
      <div v-if="viewTypes.length >= 2">
        <van-radio-group
          v-model="currentMode"
          direction="horizontal"
          class="file-view-radio-box"
        >
          <van-radio v-for="item in viewTypes" :key="item" :name="item">{{viewTypeObj[item]}}</van-radio>
        </van-radio-group>
      </div>
      <div v-if="!isRenderEmpty" :class="selfActiveClass" >
        <template v-if="viewType=='grid'">
          <div
            v-for="item in onlineFileList"
            :key="item.row_guid"
            class="forPreview-list online-list">
              <div
                style="display: flex;align-items: center; justify-content: flex-start"
                @click="viewOnlineFile(item)">
                <img
                  v-if="fileIconUrl(item)"
                  :src="fileIconUrl(item)" style="width: 1.46rem;height: 1.46rem;margin-right: .625rem;vertical-align: middle;object-fit:scale-down" alt="">
                <div class="upLoadListItem" >
                  {{decodeURIComponent(item.file_name)}}
                </div>
              </div>
              <div style="display: flex;align-items: center; justify-content: flex-end">

                <img
                  v-if="config.pageMode == 'VIEW'&&item.view_icon_url&&audioControlType(item) != 1"
                  :src="item.view_icon_url"
                  style="width: 1.5rem;height: 1.5rem;vertical-align: middle;object-fit:scale-down"
                  @click="viewOnlineFile(item)" />
                <span
                  v-if="config.pageMode == 'VIEW'&&audioControlType(item) == 1"
                  @click="viewOnlineFile(item)"
                  class="audiobtn">
                  {{ amrStautsTitle(item) }}
                </span>
                <div
                  class="forPreview-list-right-icon-trash"
                  @click="delFile(item)"
                  v-if="isRenderDeleteIcon">
                </div>
                <div v-if="isRenderDownload">
                  <span class="file-op-btn" @click="handleDownLoadFile(item)">{{downloadBtnName}}</span>
                </div>
              </div>
          </div>
          <div
            v-for="item in tempFileList"
            :key="item.row_guid"
            class="forPreview-list local-list">
              <div
                style="display: flex;align-items: center; justify-content: flex-start"
                @click="viewOnlineFile(item)">
                <img
                  v-if="fileIconUrl(item)"
                  :src="fileIconUrl(item)" style="width: 1.46rem;height: 1.46rem;margin-right: .625rem;vertical-align: middle;object-fit:scale-down" alt="">
                <div class="upLoadListItem" >
                  {{decodeURIComponent(item.file_name)}}
                </div>
                <div
                  class="list-local-tag"
                >
                  未上传
                </div>
              </div>
              <div style="display: flex;align-items: center; justify-content: flex-end">
                <img
                  v-if="config.pageMode == 'VIEW'&&item.view_icon_url&&audioControlType(item) != 1"
                  :src="item.view_icon_url"
                  style="width: 1.5rem;height: 1.5rem;vertical-align: middle;object-fit:scale-down"
                  @click="viewOnlineFile(item)" />
                <span
                  v-if="config.pageMode == 'VIEW'&&audioControlType(item) == 1"
                  @click="viewOnlineFile(item)"
                  class="audiobtn">
                  {{ amrStautsTitle(item) }}
                </span>

                <div
                  class="forPreview-list-right-icon-trash"
                  @click="delFile(item)"
                  v-if="isRenderDeleteIcon">
                </div>
                <div v-if="isRenderDownload">
                  <span class="file-op-btn" @click="handleDownLoadFile(item)">{{downloadBtnName}}</span>
                </div>
              </div>
          </div>
        </template>
        <template v-else-if="viewType=='thumbnail'">
          <div class='uploaderContainer ImgPreview-list' v-show="isShowThumbnailUpload">
            <file-upload  :config="uploaderConfig" :containerdata="fileData" @update="afterFileUpload" ref="uploadRef" :is-in-card-file="isInCardFile" :folder-id="folderId" :containerConfig="config">
            </file-upload>
          </div>
          <div v-for="item in onlineFileList" :key="item.row_guid" class="ImgPreview-list">
            <div
              class="imgContontainer"
              :class="{audioContainer:audioControlType(item) == 1 }"
              @click="viewOnlineFile(item)">
              <img :src="item.download_path" alt="" />
              <div v-if="audioControlType(item) == 1" class="amrAudio">
                <!-- <span class="audiobtn">{{ amrStautsTitle(item) }}</span> -->
              </div>
              <div
                v-else-if="!['png', 'jpg', 'jpeg'].includes(item.file_type) && IsShowFileName"
                class="upLoadListItem"
              >
                {{decodeURIComponent(item.file_name)}}
              </div>
            </div>
            <div class="imgFileName" v-if="['png', 'jpg', 'jpeg'].includes(item.file_type)&&IsShowFileName">{{item.file_name}}</div>
            <div style="position: absolute; top: 3px; right: 3px" >
              <van-icon name="clear" size="16" color="#737476" @click.stop="delFile(item)" v-if="isRenderDeleteIcon" />
            </div>
          </div>
          <div v-for="item in tempFileList" :key="item.row_guid" class="ImgPreview-list local-list">
            <div
              class="imgContontainer"
              :class="{audioContainer:audioControlType(item) == 1 }"
              @click="viewOnlineFile(item)">
              <img :src="item.download_path" alt="" />
              <div v-if="audioControlType(item) == 1" class="amrAudio">
                <!-- <span class="audiobtn">{{ amrStautsTitle(item) }}</span> -->
              </div>
              <div
                v-else-if="!['png', 'jpg', 'jpeg'].includes(item.file_type)"
                class="upLoadListItem"
              >
                {{decodeURIComponent(item.file_name)}}
              </div>
            </div>
            <div style="position: absolute; top: 0; right: 0" >
              <van-icon name="clear" size="16" color="#737476" @click.stop="delFile(item)" v-if="isRenderDeleteIcon" />
            </div>
            <div
              class="thumbnail-local-tag left-top-corner"
            >
              本地
            </div>
          </div>
         
        </template>
       
      </div>
      <van-image-preview get-container="body" class="images-in-fileContainer" :start-position="currentIndex" v-model="showPic" :images="imageList" @close="handleClosePreviewImg" @change="handleImageChange">
        <template #index="index">
          <div class="file-container-img-preview-header">
            <div class="preview-img-index">
              {{index.index + 1}} / {{imageList.length}}
            </div>

            <img class="toggle-orientation" src="../assets/images/common/orient.png" @click.stop="handleToggleOrientation"/>
          </div>
        </template>
      </van-image-preview>
      <van-action-sheet
        v-model="showPhotoSheet"
        :actions="fileActions"
        cancel-text="取消"
        close-on-click-action
        @select="photoSheetSelect"></van-action-sheet>
      <van-popup v-model="soundRecordingShow" get-container="#app" :close-on-click-overlay="false">
        <div class="soundRecording">
          <div class="countdown">
            {{ soundRecordingTime }}秒
          </div>
          <div class="button" :class="{ 'disabled': 3 > soundRecordingTime }" @click="stopRecord">结束录音</div>
        </div>
      </van-popup>
      <van-popup
        v-model="uploadProgressVisible"
        get-container="#app"
        :close-on-click-overlay="false"
        style="background: transparent;">
        <div
          class="upload-progress-popup"
          style="width: 200px; padding: 28px 0 30px; border-radius: 12px; background: rgba(255, 255, 255, 0.96); text-align: center;">
          <van-circle
            v-model="uploadProgressCurrentRate"
            :rate="uploadProgressRate"
            :speed="80"
            :stroke-width="80"
            size="96px"
            color="#78b3ff"
            layer-color="#e8edf5"
            :text="Math.round(uploadProgressCurrentRate) + '%'" />
          <div style="margin-top: 24px; color: #8995ab; font-size: 24px; line-height: 1.35;">文件导入中...</div>
          <div style="margin-top: 4px; color: #8995ab; font-size: 24px; line-height: 1.35;">请稍后</div>
        </div>
      </van-popup>
      <div class="file-container-upload-message" v-if="isRenderUploadMessage">
        <div class="file-container-upload-message-header" v-if="uploadMessageTitle">
          <i class="file-container-upload-message-icon"></i>
          <div class="file-container-upload-message-title">{{uploadMessageTitle}}</div>
        </div>
        <div class="file-container-upload-message-content" v-if="uploadMessageContent" v-html="uploadMessageContent"></div>
      </div>
      <div class="jsGrid-footer file-container-pager" style="padding-left:15px;padding-right:15px;" v-if="isRenderFooter">
        <div></div>
        <div class="jsGrid-total">
          共
          <span>{{dataSize}}</span>
          条
        </div>
      </div>
      <van-action-sheet
        v-model="longPressStatus"
        :actions="longPressActions"
        @select="selectActionAfterLongPress"
        cancel-text="取消"
        get-container="body"
        close-on-click-action />
    </div>
  `,
  mixins: [commonMinxin, orientationMixin],
  computed: {
    fileMaxNum(){
      return this.config.ControlProperty.MaxFileUploadNumber? Number(this.config.ControlProperty.MaxFileUploadNumber) : null;
    },
    downloadBtnName(){
      let name = "下载";
      let ExtraConfig = this.config.ExtraConfig ? JSON.parse(this.config.ExtraConfig) : 
      this.config.ControlProperty.ExtraConfig? JSON.parse(this.config.ControlProperty.ExtraConfig): {};
      if (ExtraConfig && ExtraConfig.AliasName) {
         if (ExtraConfig.AliasName.DOWNLOAD){
          name=ExtraConfig.AliasName.DOWNLOAD
         }
      }
      return name;
    },
    isRenderDownload(){
      let IsShowDownload = this.config.IsShowDownload || this.config.ControlProperty.IsShowDownload
      IsShowDownload = IsShowDownload? IsShowDownload.toString().toLowerCase() === "true": false
      return this.opList.includes("FILEDOWNLOAD") && IsShowDownload
    },
    isRenderDeleteIcon() {
      if (this.isincard) {
        if (this.$parent.isConfigSingleEdit) {
          return this.isedit && !this.isDisabled;
        }
      }
      return (
        (this.config.pageMode !== "VIEW" || this.config.ControlProperty.IsAllowUploadWhenView == "true") &&
        this.config.ControlProperty.IsHideDELETE !== "true" &&
        !this.isDisabled
      );
    },
    isRenderEmpty() {
      let viewFlag = this.config.pageMode == "VIEW" && this.config.ControlProperty.IsAllowUploadWhenView !== "true";
      let cardEdit = this.isedit && this.isincard && this.$parent.isConfigSingleEdit;
      if (this.isincard) {
        //如果是配置单个卡片编辑
        if (this.$parent && this.$parent.isConfigSingleEdit) {
          if (cardEdit) {
            return false;
          }
          return this.isEmpty && (viewFlag || !cardEdit);
        }
      }
      return this.isEmpty && viewFlag;
    },
    isDisabled() {
      return this.getDisabled(this.config);
    },
    isRenderFooter() {
      if (this.isincard) {
        return this.config.ControlProperty.isShowTotal == "true";
      }
      return this.config.ControlProperty.isShowTotal !== "false";
    },
    uploadMessageTitle() {
      return this.config.ControlProperty?.MessageTitle || "";
    },
    uploadMessageContent() {
      const MessageField = this.config.ControlProperty?.MessageField;
      if (!MessageField) {
        return "";
      }
      const { fileData } = this;
      return (fileData && fileData[MessageField]) || "";
    },
    isRenderUploadMessage() {
      const controlProperty = this.config.ControlProperty || {};
      return !!(controlProperty.MessageTitle || controlProperty.MessageField);
    },
    RelativeContainer() {
      const { config } = this;
      return config.ControlProperty ? config.ControlProperty.RelativeContainer : "";
    },
    RelativeKeyField() {
      const { config } = this;
      return config.ControlProperty ? config.ControlProperty.RelativeKeyField : "";
    },
    fileData() {
      const { data, RelativeContainer, RelativeKeyField } = this;
      if (data) {
        return data;
      } else if (RelativeContainer && pageContext && pageContext[RelativeContainer]) {
        return pageContext[RelativeContainer].realFieldData;
      } else {
        return {};
      }
    },
    instanceGuid() {
      const { RelativeKeyField, fileData } = this;
      if(this.config.pageMode == "ADD") {
        return erowConfig.generateUUID()
      }
      return RelativeKeyField ? fileData[RelativeKeyField] : fileData["row_guid"];
    },
    allFileList() {
      const { onlineFileList = [], tempFileList = [] } = this;
      const allFileList = [...onlineFileList, ...tempFileList];
      return allFileList;
    },
    isEmpty() {
      const { onlineFileList, tempFileList, IsUpload } = this;
      if (IsUpload) {
        return onlineFileList.length == 0;
      }

      if (!IsUpload) {
        const length = onlineFileList.length + tempFileList.length;
        return length == 0;
      }
      return true;
    },
    emptyImage() {
      return this.config.ControlProperty.EmptyImage || window.PAGE_CONFIG.emptyListImage;
    },
    getControlGUID() {
      return erowConfig.hasProp(this.config, "controlGUID") && this.config.controlGUID ? this.config.controlGUID : this.config.ControlGUID;
    },
    selfActiveClass() {
      if (this.dataSize == 0) {
        return "empty-box thum-4cols";
      }
      let selfActiveClass = this.activeClass();
      const thumbnailDefaultClass = "thum-4cols";
      if (selfActiveClass) {
        return `${thumbnailDefaultClass} ` + selfActiveClass;
      }
      if (this.viewType == "thumbnail") {
        // return "thumbnailList";
        return thumbnailDefaultClass;
      }

      return "gridList";
    },

    buttonText() {
      return this.config.ControlProperty.AddCommandRSCode || "点此上传";
    },
    labelText() {
      return this.config.ControlProperty.TitleRSValue ? this.config.ControlProperty.TitleRSValue : false;
    },
    viewType() {
      if(this.viewTypes.length > 1){
        return this.currentMode
      }
      return this.config.ControlProperty.ViewType ? this.config.ControlProperty.ViewType : "grid";
    },
    uploaderConfig() {
      let temp = this.config.ChildContainers.filter((item) => {
        return item.ControlCode == "UcFileUpload";
      });
      let uploaderObj = temp.length ? temp[0] : {};
      if (!Object.keys(uploaderObj).length) {
        return {};
      }
      uploaderObj.ControlProperty.FnCode = this.config.ControlProperty.FnCode;
      uploaderObj.UploadFileds = this.config.UploadFileds || this.config.ControlProperty.UploadFileds
      if (this.config.ControlProperty.RelativeContainer) {
        uploaderObj.ControlProperty.RelativeContainer = this.config.ControlProperty.RelativeContainer;
      }

      if (this.RelativeKeyField) {
        uploaderObj.ControlProperty.RelativeKeyField = this.config.ControlProperty.RelativeKeyField;
      }
      if (this.config.ControlProperty.PickFileTypeList) {
        uploaderObj.ControlProperty.PickFileTypeList = this.config.ControlProperty.PickFileTypeList;
      }
      if (this.config.ControlProperty.IsNeedGroup) {
        uploaderObj.ControlProperty.IsNeedGroup = this.config.ControlProperty.IsNeedGroup;
      }
      if(this.config.ControlProperty.IsNeedGPS) {
        uploaderObj.ControlProperty.IsNeedGPS = this.config.ControlProperty.IsNeedGPS;
      }
      if (this.config.ControlProperty.MaxFileUploadNumber) {
        uploaderObj.ControlProperty.MaxFileUploadNumber = this.config.ControlProperty.MaxFileUploadNumber;
      }
      return uploaderObj;
    },
    IsUpload() {
      return this.config.pageMode == "ADD"
        ? false
        : this.uploaderConfig && this.uploaderConfig.ControlProperty && this.uploaderConfig.ControlProperty.IsUpload != "false";
    },
    imageList() {
      let images = [];
      this.imageIndex = [];
      this.allFileList.forEach((item, index) => {
        if (["png", "jpg", "jpeg"].includes(item.file_type)) {
          let url = this.getImgSrc(item);
          images.push(url);
          this.imageIndex.push(index);
        }
      });
      return images;
    },
    audioTypeList: function () {
      return ["amr", "wav", "mp3", "m4a"];
    },
    audioControlType: function () {
      return (file) => {
        let type = file.content_type.toLowerCase();
        if (type == "amr" || type == "wav" || type == "mp3" || type == "m4a") return 1;
        return 0;
      };
    },
    audioSrc: function () {
      return (file) => {
        let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
        file.file_guid = erTool.encrypt(file.file_guid, token);
        let url =
          baseUrl +
          erowplatformBackendUrl +
          "/file/downloadfile?fileGuid=" +
          encodeURIComponent(file.file_guid) +
          "&pValueSet=" +
          encodeURIComponent(this.config.pValueSet) +
          "&json=" +
          encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));
        if (file.fn_code) {
          url += "&fnCode=" + file.fn_code;
        }
        if (file.instance_guid) {
          file.instance_guid = erTool.encrypt(file.instance_guid, token);
          url += "&instanceGuid=" + encodeURIComponent(file.instance_guid);
        }
        if (this.getControlGUID) {
          url += "&controlGuid=" + encodeURIComponent(this.getControlGUID);
        }
        return url;
      };
    },
    rows() {
      return erowConfig.hasProp(this.config.ControlProperty, "PagingDefaultRows") ? this.config.ControlProperty.PagingDefaultRows : 50;
    },
    dataSize() {
      return isNaN(this.initialListSize + this.tempFileList.length) ? 0 : this.initialListSize + this.tempFileList.length;
    },
    // 是否显示缩略图的上传
    isShowThumbnailUpload() {
       //超出最大上传数量，不显示上传
      if(this.fileMaxNum && this.allFileList.length >=this.fileMaxNum){
        return false;
      }
      const { config, uploaderConfig, isedit } = this;
      if (this.isincard) {
        if (this.$parent.isConfigSingleEdit) {
          return this.isedit && !this.isDisabled;
        }
      }
      return (
        (config?.pageMode !== "VIEW" || config?.ControlProperty?.IsAllowUploadWhenView == "true") &&
        Object.keys(uploaderConfig).length &&
        config?.ControlProperty?.IsHideADD !== "true" &&
        !this.isDisabled
      );
    },
    placeholderList() {
      const { onlineFileList, tempFileList, isShowThumbnailUpload } = this;
      let count = 0;
      if (isShowThumbnailUpload) {
        count = 1;
      }

      const fileListSize = onlineFileList.length + tempFileList.length;
      const total = count + fileListSize;
      const rowSize = 5;
      const res = total % rowSize;
      let placeholderListSize = 0;
      if (res) {
        placeholderListSize = rowSize - res;
      }

      return Array(placeholderListSize).fill({});
    },
    IsShowFileName() {
      const { config = {} } = this;
      const { ControlProperty } = config;
      const { IsShowFileName } = ControlProperty;
      return IsShowFileName != "false";
    },
    viewTypes() {
      let result = ["grid"];
      if (this.config.ViewType) {
        result = this.config.ViewType.split(",");
      }else if(this.config.ControlProperty.ViewType){
        result = this.config.ControlProperty.ViewType.split(",")
      }
      return result;
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
      let parseActionList = (value) => {
        try {
          let actionList = JSON.parse(value);
          return Array.isArray(actionList) ? actionList : defaultSelect;
        } catch (e) {
          return defaultSelect;
        }
      };
      if (isDynamic) {
        let field = PickFileTypeList.slice(1);
        let dyData = this.fileData[field];
        return dyData ? parseActionList(dyData) : defaultSelect;
      }
      return PickFileTypeList ? parseActionList(PickFileTypeList) : defaultSelect;
    },
  },
  mounted() {
    console.log("UcFileContainer mounted, initializing...");
    this.init();
    eventEmitter.on("refresh", () => {
      this.init("refresh");
    });
    this.loadScript("../libs/js/BenzAMRRecorder.min.js", () => {
      console.log("UcFileContainer BenzAMRRecorder loaded");
      const observeTarget = document.querySelector(".uc-file-container");
      this.addLazyObserve(observeTarget);
    });
    this.setFileCtnrUIDToWindow();
  },
  beforeDestroy() {
    this.clearSoundTimeInterval();
    this.removeFileCtnrUIDInWindow()
  },
  methods: {
    updateUploadProgress(progress) {
      let rate = Number(progress);
      if (isNaN(rate)) {
        rate = 0;
      }
      if (rate > 0 && rate <= 1) {
        rate = rate * 100;
      }
      rate = Math.max(0, Math.min(100, Math.round(rate)));
      if (rate < 100 && rate - this.uploadProgressRate < 1) {
        return;
      }
      this.uploadProgressRate = rate;
      console.log("updateUploadProgress", rate);
      this.uploadProgressVisible = true;
    },
    hideUploadProgress() {
      this.uploadProgressVisible = false;
      setTimeout(() => {
        this.uploadProgressCurrentRate = 0;
        this.uploadProgressRate = 0;
      }, 300);
    },
    setFileCtnrUIDToWindow() {
      if(this.isInCardFile && this.cardFileIndex != undefined){
        //cardFileContainer里的文件容器是共用的同一个文件容器，需要单独处理
        if(!window.cardFileCtnr){
          window.cardFileCtnr = []
        }
        let temp = window.cardFileCtnr.find(item=>item.CtnrUID == this.config.CtnrUID + this.cardFileIndex)
        if(!temp){
          window.cardFileCtnr.push({CtnrUID: this.config.CtnrUID + this.cardFileIndex, rootControlGuid: this.config.rootControlGuid, index: this.cardFileIndex})
        }
        if(!window.pageContext){
          window.pageContext = {}
        }
        //保存到pageContext中，方便后续获取该组件的数据
        window.pageContext[this.config.CtnrUID + this.cardFileIndex] = this
        return
      }
      if (!window.fileCtnr) {
        window.fileCtnr = [];
      }
      let temp = window.fileCtnr.find((item) => {
        return item.CtnrUID == this.config.CtnrUID && item.rootControlGuid == this.config.rootControlGuid;
      });
      if (!temp) {
        window.fileCtnr.push({ CtnrUID: this.config.CtnrUID, rootControlGuid: this.config.rootControlGuid });
      }
    },
    removeFileCtnrUIDInWindow(){
      //移除对应的pageContext，cardFileCtnrUID，避免内存泄漏以及其他影响
      if(this.isInCardFile && this.cardFileIndex != undefined){
        if(window.cardFileCtnr){
          const targetUID = this.config.CtnrUID + this.cardFileIndex;
          const index = window.cardFileCtnr.findIndex(item => item.CtnrUID == targetUID);
          if (index !== -1) {
            window.cardFileCtnr.splice(index, 1);
          }
        }
        if(window.pageContext[this.config.CtnrUID + this.cardFileIndex]){
          delete window.pageContext[this.config.CtnrUID + this.cardFileIndex]
        }
      }
    },
    init() {
      this.requestList();
      if (!this.IsUpload) {
        this.getTempFileList();
      }
      this.getOpList();
    },
    amrStautsTitle(file) {
      if (file.amrStatus == "play") return "暂停";
      return "播放";
    },
    // 通过文件content_type属性返回文件icon路径
    fileIconUrl(file) {
      if (["png", "bmp", "JPEG", "tif", "jpg", "gif", "jfif", "jpeg", "PNG", "JPG"].includes(file.content_type)) {
        return "../assets/images/icon/images.png";
      } else if (["rar", "zip"].includes(file.content_type)) {
        return "../assets/images/icon/zip.png";
      } else if (["mp4", "mp3"].includes(file.content_type)) {
        return "../assets/images/icon/video.png";
      } else if (["doc", "docx", "DOC", "DOCX"].includes(file.content_type)) {
        return "../assets/images/icon/word.png";
      } else if (["pdf", "PDF"].includes(file.content_type)) {
        return "../assets/images/icon/pdf.png";
      } else if (["xlsx", "xls"].includes(file.content_type)) {
        return "../assets/images/icon/excel.png";
      }
      return "../assets/images/icon/other.png";
    },
    photoSheetSelect(item) {
      if (this.fileMaxNum && this.dataSize >= this.fileMaxNum) {
        this.$toast.fail({
          message: "最多上传" + this.fileMaxNum + "个文件",
        });
        return;
      }

      if (!item || !item.action) {
        this.$toast.fail("请检查配置项");
        return;
      }

      let [actionType, fileType = "image"] = item.action.split("-");
      if (actionType == "take") {
        if (fileType == "image") {
          this.takePhoto();
        } else if (fileType == "audio") {
          this.takeAudio();
        } else if (fileType == "video") {
          this.takeVideo();
        } else {
          this.$toast.fail("请检查配置项");
        }
      } else if (actionType == "pick") {
        this.pickFile(fileType);
      } else {
        this.$toast.fail("请检查配置项");
      }
    },
    buildFileParams(fileType) {
      let tempKey = this.instanceGuid;
      return {
        fileName: "文件" + new Date().getTime(),
        rowGuid: tempKey,
        userId: erUser.userId,
        fnCode: this.config.ControlProperty.FnCode,
        folderCode: this.folderCode,
        bizInfo: {
          ucSiteInspectionId: tempKey,
        },
        fileType: fileType,
      };
    },
    handleData(res) {
      let data = res.data ? res.data[this.config.ControlProperty.ID] : res[this.config.ControlProperty.ID];
      if(!data) {
        return;
      }
      this.initialListSize = data.listSize;
      this.fileKeyName = data.keyName;
      this.opList = data.PageRights;

      // console.trace()
      data.dataList.forEach((item) => {
        item["file_type"] = item.file_name && item.file_name.slice(item.file_name.lastIndexOf(".") + 1).toLowerCase();
        if (!item.content_type) {
          item["content_type"] = item.file_type;
        }
        let contentType = item.content_type.toLowerCase();
        if (contentType == "amr" || contentType == "mp3" || contentType == "wav" || contentType == "m4a") {
          if (typeof BenzAMRRecorder !== "undefined") {
            item.amr = new BenzAMRRecorder();
          }
          this.$set(item, "amrStatus", "stop");
          item.amrDuration = 0;
          item.amrCurPos = 0;
        } else if (!["mp4", "pdf", "jpg", "png", "jpeg"].includes(contentType)) {
          // 既不是音视频，也不是PDF或图片，大概率为需要调用第三方APP的文件类型
          erJsBridge.getFileDownloadStatus("", item.file_name, item.file_guid, (data) => {
            if (data.resultFlag === "-1") {
              item.downloadStatus = data.result.downloadStatus;
              if (data.result.downloadStatus !== "Succeed") {
                this.$set(item, "view_icon_url", this.getImgFileUrl({ parentFilePath: "icon", filename: "download", fileType: "png" }));
              } else {
                this.$set(item, "view_icon_url", this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
              }
            }
          });
        }
        item["download_path"] = this.getImgSrc(item, "-1");
      });
      data.dataList.reduce((prev, cur) => {
        if (prev.findIndex((i) => i.file_guid === cur.file_guid) === -1) {
          prev.push(cur);
        }
        return prev;
      }, this.onlineFileList);
      this.config._isLoadedData = true;
      erowConfig.convertConfig(this.config.ChildContainers, {
        _isLoadedData: true,
      });
      this.$nextTick(() => {
        if (data.listSize > this.paginationPages * this.rows) {
          // 存在下一页数据，页码+1,更新Observer。
          this.paginationPages += 1;
          let listClassName;
          if (this.viewType === "grid") {
            listClassName = ".forPreview-list";
          } else if (this.viewType === "thumbnail") {
            listClassName = ".ImgPreview-list";
          }
          // 获取List主体DOM
          const L = document.querySelectorAll(listClassName);
          // 获取最后一个ListItem的IMG标签，监听load事件，在load事件触发时，默认当前视图内所有图片渲染完毕。
          const img = L[L.length - 1] ? L[L.length - 1].querySelector("img") : "";
          if (img) {
            const f = function (e) {
              this.addLazyObserve(img);
            }.bind(this);
            // 只监听一次
            img.addEventListener("load", f, { once: true });
          }
        }
      });
    },
    handleFileList(fileList) {
      fileList.forEach((item) => {
        // 类型处理
        item["file_type"] = item.file_name && item.file_name.slice(item.file_name.lastIndexOf(".") + 1).toLowerCase();
        if (!item.content_type) {
          item["content_type"] = item.file_type;
        }
        const contentType = item.content_type.toLowerCase();
        item["download_path"] = this.getImgSrc(item, "-1");
        // 音频
        if (this.isAudio(item)) {
          item.amr = new BenzAMRRecorder();
          this.$set(item, "amrStatus", "stop");
          // item.amrStatus = "stop";
          item.amrDuration = 0;
          item.amrCurPos = 0;
          return;
        }

        // 特殊类型
        if (!["mp4", "pdf", "jpg", "png", "jpeg"].includes(contentType)) {
          // 既不是音视频，也不是PDF或图片，大概率为需要调用第三方APP的文件类型
          erJsBridge.getFileDownloadStatus("", item.file_name, item.file_guid, (data) => {
            if (data.resultFlag === "-1") {
              item.downloadStatus = data.result.downloadStatus;
              if (data.result.downloadStatus !== "Succeed") {
                item.view_icon_url = "../assets/images/icon/download.png";
              }
            }
          });
        }
      });
    },
    requestList(flag = "") {
      if (this.data && flag != "refresh") {
        this.handleData(this.data);
      } else {
        let paramMap={
              instance_guid: this.instanceGuid,
              folder_id: this.folderId? this.folderId: this.fileData ? this.fileData.folder_id : 0,
        }
        if(this.RelativeKeyField){
          paramMap[this.RelativeKeyField]=this.instanceGuid
        }
        apis.sysLoadDBData({
          vm: this,
          params: {
            controlCode: this.config.ControlCode,
            pValueSet: this.config.pValueSet,
            controlGUID: this.config.ControlGUID,
            menuRowGuid: this.config.menuRowGuid,
            keyValue: this.keyValue || this.config.keyValue || "",
            pageMode: this.config.pageMode,
            page: this.paginationPages,
            rows: this.rows,
            paramMap:paramMap,
          },
          success: (res) => {
            this.handleData(res.data);
          },
          fail: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          },
          error: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          },
        });
      }
    },
    takePhoto() {
      let fileParams = this.buildFileParams("image");
      this.fileParams = fileParams;
      let _this = this;
      let takeImageFun=()=>{
          erJsBridge.takePhotoConfig({
            userId: fileParams.userId,
            fileName: fileParams.fileName,
            fnCode: fileParams.fnCode,
            instanceGuid: fileParams.rowGuid,
            folderCode: fileParams.folderCode,
            uploadAPIPath: "",
            bizInfo: fileParams.bizInfo,
            takePicType: this.config.ControlProperty.takePicType || "",
            picPxW: this.config.ControlProperty.picPxW,
            picPxH: this.config.ControlProperty.picPxH,
            callback: (data) => {
              if (data.resultFlag == "-1") {
                _this.getFileListByFolder(fileParams.folderCode);
              } else {
                _this.$toast.fail(data.errMsg);
              }
            },
          });
      }
      if(this.config.ControlProperty.IsNeedGPS=='false') {
        takeImageFun();
        return;
      }
      let loading = _this.$toast.loading("获取定位中，请耐心等待");
      //10s后如果loading还没关闭，说明获取定位失败，关闭loading
      setTimeout(() => {
        loading.clear();
      }, 10000);
      erJsBridge.getGPS((rData) => {
        loading.clear();
        if (rData.resultFlag == "-1") {
          let gps = rData.result;
          if (!gps.lat && !gps.lon) {
            _this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
          }
          takeImageFun();
        } else {
          _this.$dialog.fail("获取坐标失败，请检查定位权限");
        }
      });
    },
    pickPhoto() {
      let fileParams = this.buildFileParams("image");
      this.fileParams = fileParams;
      let _this = this;
      let pickImageFun = () => {
        erJsBridge.pickPhoto(
          fileParams.userId,
          fileParams.fileName,
          fileParams.fnCode,
          fileParams.rowGuid,
          fileParams.folderCode,
          "",
          fileParams.bizInfo,
          (data) => {
            if (data.resultFlag == "-1") {
              _this.getFileListByFolder(fileParams.folderCode);
            } else {
              _this.$toast.fail(data.errMsg);
            }
          },
        );
      };
      if (this.config.ControlProperty.IsNeedGPS == "false") {
        pickImageFun();
        return;
      }
      let loading = _this.$toast.loading("获取定位中，请耐心等待");
      setTimeout(() => {
        loading.clear();
      }, 10000);
      erJsBridge.getGPS((rData) => {
        loading.clear();
        if (rData.resultFlag == "-1") {
          let gps = rData.result;
          if (!gps.lat && !gps.lon) {
            _this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
          }
          pickImageFun();
        } else {
          _this.$dialog.fail("获取坐标失败，请检查定位权限");
        }
      });
    },
    takeAudio() {
      let fileParams = this.buildFileParams("audio");
      this.fileParams = fileParams;
      let _this = this;
      erJsBridge.audioRecordStart(
        fileParams.userId,
        fileParams.fileName,
        fileParams.fnCode,
        fileParams.rowGuid,
        fileParams.folderCode,
        "",
        "",
        fileParams.bizInfo,
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
    takeVideo() {
      let fileParams = this.buildFileParams("video");
      this.fileParams = fileParams;
      let _this = this;
      erJsBridge.videoRecord(
        fileParams.userId,
        fileParams.fileName,
        fileParams.fnCode,
        fileParams.rowGuid,
        fileParams.folderCode,
        "",
        "",
        fileParams.bizInfo,
        function (data) {
          if (data.resultFlag == "-1") {
            _this.getFileListByFolder(fileParams.folderCode);
          } else {
            _this.$toast.fail(data.errMsg);
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
      erJsBridge.audioRecordStop((data) => {
        this.soundRecordingShow = false;
        this.clearSoundTimeInterval();
        if (data.resultFlag == -1) {
          this.getFileListByFolder(this.fileParams.folderCode);
        } else {
          this.$toast.fail(data.errMsg);
        }
      });
    },
    pickFile(fileType = "all") {
      let fileParams = this.buildFileParams(fileType);
      this.fileParams = fileParams;
      let _this = this;
      let pickFileFun = () => {
        let pickFunc = fileParams.fileType == "image" ? erJsBridge.pickPhoto : erJsBridge.pickFile;
        pickFunc(
          fileParams.userId,
          fileParams.fileName,
          fileParams.fnCode,
          fileParams.rowGuid,
          fileParams.folderCode,
          "",
          fileParams.bizInfo,
          (data) => {
            if (data.resultFlag == "-1") {
              _this.getFileListByFolder(fileParams.folderCode);
            } else {
              _this.$toast.fail(data.errMsg);
            }
          },
          fileParams.fileType,
        );
      };
      if (this.config.ControlProperty.IsNeedGPS == "false") {
        pickFileFun();
        return;
      }
      let loading = _this.$toast.loading("获取定位中，请耐心等待");
      setTimeout(() => {
        loading.clear();
      }, 10000);
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
    },
    delFile(file) {
      let _this = this;
      this.$dialog
        .confirm({
          title: "系统消息",
          message: "确定[删除]该文件？",
        })
        .then(() => {
          if (!file.IsTemp) {
            let params = {
              menuRowGuid: this.config.menuRowGuid,
              controlGUID: this.config.ControlGUID,
              keyValue: file[this.fileKeyName],
              pValueSet: this.config.pValueSet,
              pageMode: "DELETE",
            };
            erRequest.post(
              erowplatformBackendUrl + "/appBaseApi/sysDataAction",
              params,
              (res) => {
                if (res.code === "SUCCESS") {
                  let idx = _this.onlineFileList.findIndex((i) => i["file_guid"] === file["file_guid"]);
                  if (idx !== -1 && _this.onlineFileList.length) {
                    _this.onlineFileList.splice(idx, 1);
                    _this.initialListSize -= 1;
                  }
                } else {
                  console.log(res);
                  _this.$message("error", res.msg);
                }
              },
              (error) => {
                console.log(error);
                _this.$toast.fail(error.msg);
              },
            );
          } else {
            erJsBridge.deleteFile(file.file_id, (data) => {
              if (data.resultFlag == "-1") {
                const idx = this.tempFileList.findIndex((item) => item.file_id === file.file_id);
                _this.tempFileList.splice(idx, 1);
              } else {
                this.$toast.fail(data.errMsg);
              }
            });
          }
        });
    },
    isPicture(file) {
      const type = file && file.content_type ? file.content_type.toLowerCase() : "";
      if (["png", "jpg", "jpeg"].includes(type)) return true;
      return false;
    },
    isAudio(file) {
      const type = file && file.content_type ? file.content_type.toLowerCase() : "";
      if (["amr", "wav", "mp3", "m4a"].includes(type)) return true;
      return false;
    },
    viewOnlineFile({ file_type, file_guid, instance_guid, fn_code, file_name, content_type, content_size, downloadStatus }) {
      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      let enyfile_guid = erTool.encrypt(file_guid, token);
      let url =
        baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(enyfile_guid) +
        "&pValueSet=" +
        encodeURIComponent(this.config.pValueSet) +
        "&json=" +
        encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));
      if (fn_code) {
        url += "&fnCode=" + fn_code;
      }
      if (instance_guid) {
        instance_guid = erTool.encrypt(instance_guid, token);
        url += "&instanceGuid=" + encodeURIComponent(instance_guid);
      }
      if (this.getControlGUID) {
        url += "&controlGuid=" + encodeURIComponent(this.getControlGUID);
      }
      if (content_type == "ofd") {
        url += "&viewType=pdf";
      }

      // 图片无需区分设备类型和下载状态，优先处理
      if (["png", "jpg", "jpeg"].includes(file_type)) {
        let index = this.allFileList.findIndex((file) => {
          if (file.file_guid) {
            return file.file_guid == file_guid;
          } else {
            return file.file_name == file_name;
          }
        });
        this.currentIndex = this.imageIndex.findIndex((i) => {
          return i == index;
        });
        this.showPic = true;
        return;
      }
      // 判断是否为音频
      if (this.audioControlType({ content_type }) == 1) {
        let file = arguments[0];
        this.handleMediaPlay(file);
        return;
      }
      // 其他类型(MP4,Docx, xlsx, txt...)
      // i国网环境下中除图片/音视频以外的文件直接调用i国网API去展示
      // 非图片类型，判断是否为pdf文件，是pdf则跳转至预览页面进行查看
      if (igwMode) {
        this.viewOnIGW(url, file_type, file_name, "");
      } else {
        this.viewOnYJK(arguments[0], url);
      }
    },
    handleMediaPlay(file) {
      if (this.audioPlayer) {
        this.audioPlayer.$destroy();
        if (this.audioPlayer.$el && this.audioPlayer.$el.parentNode) {
          this.audioPlayer.$el.parentNode.removeChild(this.audioPlayer.$el);
        }
        this.audioPlayer = null;
      }
      const AudioPlayerConstructor = Vue.extend(AudioPlayer);
      const audioPlayerInstance = new AudioPlayerConstructor({
        propsData: {
          file: file,
          autoPlay: true,
          config: this.config,
        },
      });
      const playerEl = document.createElement("div");
      document.body.appendChild(playerEl);
      audioPlayerInstance.$mount(playerEl);
      audioPlayerInstance.openPlayer();
      this.audioPlayer = audioPlayerInstance;
      audioPlayerInstance.$once("player-close", () => {
        if (this.audioPlayer === audioPlayerInstance) {
          audioPlayerInstance.$destroy();
          if (audioPlayerInstance.$el && audioPlayerInstance.$el.parentNode) {
            audioPlayerInstance.$el.parentNode.removeChild(audioPlayerInstance.$el);
          }
          this.audioPlayer = null;
        }
      });
      return;
      // let _this = this;
      // let amr = file.amr;
      // if (_this.curAmr != amr) {
      //   if (_this.curAmr != null) _this.curAmr.pause();
      //   _this.curAmr = amr;
      // }
      // // console.log(file);
      // if (!amr.isInit()) {
      //   // _this.$toast.loading({
      //   //   duration: 0,
      //   //   message: "音频加载中",
      //   // });
      //   let audioUrl = _this.audioSrc(file);
      //   if (file && file.IsTemp) {
      //     audioUrl = file.file_path;
      //   }
      //   amr
      //     .initWithUrl(audioUrl)
      //     .then(function () {
      //       vm.$toast.clear();
      //       file.amrDuration = amr.getDuration();
      //       amr.play();
      //     })
      //     .catch((err) => {
      //       vm.$toast.fail("音频加载异常");
      //     });

      //   // 绑定事件
      //   amr.onPlay(function () {
      //     file.amrStatus = "play";
      //     if (this.time != null) clearInterval(_this.time);
      //     this.time = setInterval(function () {
      //       file.amrCurPos = amr.getCurrentPosition();
      //     }, 100);
      //   });
      //   amr.onStop(function () {
      //     file.amrStatus = "stop";
      //     clearInterval(_this.time);
      //     _this.time = null;
      //     _this.curAmr = null;
      //   });
      //   amr.onPause(function () {
      //     file.amrStatus = "pause";
      //     clearInterval(_this.time);
      //     _this.time = null;
      //   });
      //   amr.onEnded(function () {
      //     file.amrStatus = "stop";
      //     file.amrCurPos = file.amrDuration;
      //     clearInterval(_this.time);
      //     _this.time = null;
      //     _this.curAmr = null;
      //   });
      //   amr.onResume(function () {
      //     file.amrStatus = "play";
      //     if (_this.time != null) clearInterval(_this.time);
      //     _this.time = setInterval(function () {
      //       file.amrCurPos = amr.getCurrentPosition();
      //     }, 100);
      //   });
      // } else if (amr.isPlaying()) {
      //   amr.pause();
      // } else {
      //   amr.playOrResume();
      // }
    },
    getImgSrc({ file_type, file_guid, instance_guid, fn_code, file_name, amrStatus, IsTemp, file_path }, flag) {
      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      file_guid = erTool.encrypt(file_guid, token);
      let url =
        baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(file_guid) +
        "&pValueSet=" +
        encodeURIComponent(this.config.pValueSet) +
        "&json=" +
        encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));
      if (fn_code) {
        url += "&fnCode=" + fn_code;
      }
      if (instance_guid) {
        instance_guid = erTool.encrypt(instance_guid, token);
        url += "&instanceGuid=" + encodeURIComponent(instance_guid);
      }
      if (this.getControlGUID) {
        url += "&controlGuid=" + encodeURIComponent(this.getControlGUID);
      }
      if (flag == -1) {
        url += "&thumbnailFlag=-1";
      }
      // 图片当页展示, PDF重定向，其他格式调起第三方APP展示
      if (["png", "jpg", "jpeg"].includes(file_type)) {
        if (IsTemp) {
          return file_path;
        } else {
          return url;
        }
      } else {
        //pdf word 返回默认图片
        if (file_type == "pdf") {
          return "../assets/images/icon/pdf.png";
        } else if (["docx", "doc"].includes(file_type)) {
          return "../assets/images/icon/word.png";
        } else if (["xlsx", "xls"].includes(file_type)) {
          return "../assets/images/icon/excel.png";
        } else if (this.audioTypeList.includes(file_type)) {
          return this.audioMap[amrStatus];
        } else {
          return "../assets/images/icon/txt.png";
        }
      }
    },
    getFileListByFolder(folder) {
      let key = this.instanceGuid;
      let _this = this;
      erJsBridge.getFileList(erUser.userId, this.config.ControlProperty.FnCode, key, folder, (data) => {
        if (data.resultFlag == "-1") {
          let tempData = data.result;
          tempData.forEach((file) => {
            file.file_path =
              file.file_path.substring(0, file.file_path.lastIndexOf("/") + 1) + file.file_path.substring(file.file_path.lastIndexOf("/") + 1);
            file.file_name = file.file_path.substring(file.file_path.lastIndexOf("/") + 1);
          });
          // 上传文件
          let uploadFields = null
          if(_this.config.uploadFields){
            uploadFields = Object.prototype.toString.call(_this.config.uploadFields) === "[object Object]"?
            _this.config.uploadFields: typeof _this.config.uploadFields === "string"? 
            JSON.parse(_this.config.uploadFields): _this.config.uploadFields
          }
          if(!uploadFields){
            uploadFields = {}
          }
          // this.config.ControlProperty.IsShowUploadProgress = "true"
          let progressConfig = this.config.ControlProperty.IsShowUploadProgress || this.config.ControlProperty.EnableShowProgress == "true"
          let isShowProgress = progressConfig == "true" || typeof progressConfig == "boolean" && progressConfig
          tempData.forEach((file, index) => {
            if (file.upload_status === "NotUpload") {
              let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
              erJsBridge.erowUploadFile(
                baseUrl +
                erowplatformBackendUrl +
                "/file/uploadFile?json=" +
                encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token })),
                {
                  rowGuid: file.instance_guid,
                  controlGUID: this.config.ControlGUID,
                  pValueSet: this.config.pValueSet,
                  action: "upload",
                  fnCode: file.fn_code,
                  instanceGuid: file.instance_guid,
                  folderCode: file.folder_code || "",
                  longitude: file.lon || "",
                  latitude: file.lat || "",
                  remark: file.remark || "",
                  bizInfo: file.biz_info || "",
                  fileCreateDate: file.create_time || "",
                  fileName: file.file_name,
                  ...uploadFields
                },
                file.file_id,
                "file",
                file.file_name,
                file.file_path,
                file.file_type,
                (...arguments) => {
                  let res = arguments[0];
                  if(isShowProgress) {
                    if(res.resultFlag === "-1") {
                      let result = res.result || {};
                      if(result.isProgress == "true" || typeof result.isProgress == "boolean" && result.isProgress) {
                        _this.updateUploadProgress(result.progress);
                      } else if(result.success_count != 0) {
                        _this.hideUploadProgress();
                        _this.$toast.success("上传成功");
                        _this.requestList();
                      } else {
                        _this.hideUploadProgress();
                        _this.$toast.fail(res.errMsg || "上传失败");
                      }
                    } else {
                      _this.hideUploadProgress();
                      _this.$toast.fail(res.errMsg || "上传失败");
                    }
                  }
                  else  {
                    if (index === tempData.length - 1 &&res.resultFlag === "-1" && res.result.success_count != 0) {
                      _this.$toast.success("上传成功");
                      _this.requestList();
                    } else  {
                      _this.$toast.fail("上传失败");
                    }
                  }
                },
                isShowProgress,
              );
            }
          });
        }
      });
    },
    addLazyObserve(observeTarget) {
      let observe = new IntersectionObserver(
        ([entries]) => {
          if (entries.isIntersecting) {
            this.requestList();
            this.getOpList();
            observe.disconnect();
            observe = null;
          }
        },
        {
          // 观察阈值，超过该比例执行回调。
          threshold: 0.1,
        },
      );
      observe.observe(observeTarget);
    },
    getTempFileList() {
      let key = this.instanceGuid;
      let folder_id = this.$refs.uploadRef ? this.$refs.uploadRef.folder_id || "" : "";
      erJsBridge.getFileList(erUser.userId, this.config.ControlProperty.FnCode, key, folder_id, (data) => {
        debugger;
        if (data.resultFlag == "-1") {
          let resFileList = data.result.filter((item) => {
            return item.upload_status != "Uploaded";
          });
          resFileList = resFileList.filter((item) => {
            const { biz_info: bizInfo } = item;

            if (bizInfo) {
              try {
                const bizInfoStr = decodeURIComponent(bizInfo);
                const bizInfoObj = JSON.parse(bizInfoStr);
                const isShowInFileContainer = bizInfoObj ? bizInfoObj.isShowInFileContainer : "";
                if (isShowInFileContainer === false) {
                  return false;
                }
                return true;
              } catch (e) {
                return true;
              }
            }
            return true;
          });

          const file = resFileList.reduce((prev, item) => {
            item.IsTemp = true;
            item["file_type"] = item.file_name && item.file_name.slice(item.file_name.lastIndexOf(".") + 1).toLowerCase();
            item["content_type"] = item["file_type"];
            prev.push(item);
            return prev;
          }, []);
          this.handleFileList(file);
          this.tempFileList = [...file];
        }
      });
    },
    viewOnIGW(url, file_type, file_name) {
      erJsBridge.showFile(url, file_type, file_name, "");
    },
    viewOnYJK({ file_type, file_guid, instance_guid, fn_code, file_name, content_type, content_size, downloadStatus }, url) {
      if (file_type.toLowerCase() === "pdf" || content_type.toLowerCase() === "ofd") {
        let fileInfo = {
          file_type,
          file_guid,
          fn_code,
          instance_guid,
          pValueSet: this.config.pValueSet,
          file_name,
        };
        erJsBridge.setParameter("fileInfo", encodeURIComponent(JSON.stringify(fileInfo)), () => {
          window.location.href = `./FileViewer.html`;
        });
        return;
      }
      // 判断下载状态
      if (downloadStatus !== "Succeed") {
        let file = arguments[0];
        // 获取用户网络环境
        erJsBridge.getUserInterNetEnv(({ result: { netType }, resultFlag }) => {
          if (resultFlag === "-1") {
            if (netType === "MONET") {
              this.$dialog
                .confirm({
                  title: "提示",
                  message: `您当前处于 数据流量 网络环境下，文件大小预计${content_size},是否继续下载？`,
                })
                .then(() => {
                  this.$set(file, "view_icon_url", "../assets/images/icon/loading.png");
                  // 开始后台下载文件
                  erJsBridge.startAsyncDownloadInApp(url, file_name, file_guid, this.config.FnCode, "", (data) => {
                    if (data.resultFlag === "-1") {
                      if (data.result.downloadStatus === "Succeed") {
                        this.$set(file, "downloadStatus", data.result.downloadStatus);
                        this.$set(file, "view_icon_url", this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
                      }
                    }
                  });
                })
                .catch((e) => {
                  throw new Error("用户取消下载");
                });
            } else {
              // WIFI网络直接开始下载
              erJsBridge.startAsyncDownloadInApp(url, file_name, file_guid, this.config.FnCode, "", (data) => {
                if (data.resultFlag === "-1") {
                  if (data.result.downloadStatus === "Succeed") {
                    this.$set(file, "downloadStatus", data.result.downloadStatus);
                    this.$set(file, "view_icon_url", this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
                    this.$toast.success(`${file_name}下载完成`);
                    }
                  }
                });
            }
          }
        });
      } else {
        if(file_type != "md") {
          erJsBridge.callThirdPartyToShowFile("", file_name, file_guid);
        } else {
          
              erJsBridge.getFileDir({fileGuid:file_guid, fileName:file_name, appId:'', cacheType:"downLoad"}, (data) => {
                if(data.resultFlag === "-1") {
                  erJsBridge.showLocalMdFile({filePath:data.result.cacheFilePath}, (data2) => {
                    if(data2.resultFlag === "-1") {
                      // erJsBridge.callThirdPartyToShowFile("", file_name, file_guid);
                    } else {
                      this.$toast.fail(data2.errMsg);
                    }
                  });
                } else  {
                  this.$toast.fail(data.errMsg);
                }
              });
        }
      }
    },
    handleDownLoadFile(fileInfo){
      let _this = this
      let cacheFileFold = ""
      let downloadUrl = ""
      if(this.config.ExtraConfig){
        const ExtraConfig = typeof this.config.ExtraConfig === "string"? JSON.parse(this.config.ExtraConfig): this.config.ExtraConfig
        if(ExtraConfig.DownloadConfig){
          cacheFileFold = ExtraConfig.DownloadConfig.cacheFileFold
          downloadUrl = ExtraConfig.DownloadConfig.downloadUrl
        }
      }
      if(fileInfo && fileInfo.downloadStatus && fileInfo.downloadStatus === "Succeed"){
        this.viewOnlineFile(fileInfo)
        return
      }
      baseSpecial.downloadFile(fileInfo, {cacheFileFold, downloadUrl}, this).then(res=>{
        /**
         * code: "Succeed"：操作成功
         * status: -1 | 0 | 1，标识执行阶段
         * data: 返回的数据信息
         */
        if(res.code === "Succeed"){
          if(res.status === -1){
            //下载阶段成功，设置下载状态
            _this.$set(fileInfo, "downloadStatus", res.data?.result?.downloadStatus || "Succeed")
            _this.$set(fileInfo, "view_icon_url", _this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
            if(cacheFileFold){
              if(["png", "jpg"].includes(fileInfo.file_type)){
                _this.$toast.success(`${fileInfo.file_name}已保存至相册`)
              }else{
                _this.$toast.success(`${fileInfo.file_name}已保存至download目录`)
              }
            }else{
              _this.$toast.success(`${fileInfo.file_name}下载成功`)
            }
          }else if(res.status === 1){
            //未下载阶段，此时应该是文件已下载，所以返回了成功
            if(cacheFileFold){
              if(["png", "jpg"].includes(fileInfo.file_type)){
                _this.$toast.success(`${fileInfo.file_name}已保存至相册`)
              }else{
                _this.$toast.success(`${fileInfo.file_name}已保存至download目录`)
              }
            }else{
              //此时直接调用预览
              _this.$set(fileInfo, "downloadStatus", res.data?.result?.downloadStatus || "Succeed")
              _this.$set(fileInfo, "view_icon_url", _this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
              _this.viewOnlineFile(fileInfo)
            }
          }else{
            _this.$toast.fail(`${fileInfo.file_name}下载失败`)
          }
        }else{
          _this.$toast.fail(`下载失败`);
        }
      }).catch(error=>{
        _this.$toast.fail("下载异常")
      })
    },
    getOpList() {
      // let _this = this;
      // console.log('getOpList')
      // let url = erowplatformBackendUrl + "/appBaseApi/sysLoadOpList";
      // erRequest.post(
      //   url,
      //   {
      //     menuRowGuid: this.config.menuRowGuid,
      //     controlGUID: this.config.ControlGUID,
      //     pageMode: this.config.pageMode,
      //     pValueSet: this.config.pValueSet || this.$root.pValueSet,
      //   },
      //   (res) => {
      //     if (res.code == "SUCCESS") {
      //       // console.log({res})
      //       this.opList = res.data[this.config.ControlProperty.ID]
      //     }
      //   },
      //   (error) => {
      //     console.log(error);
      //     this.$toast.fail(error.msg);
      //   }
      // );
    },
    handleClosePreviewImg() {
      this.setOrientationToVertical();
    },
    handleImageChange(index) {
      this.currentIndex = index;
    },
    afterFileUpload(file = []) {
      if (this.IsUpload) {
        this.requestList("refresh");
        return;
      }
      if (!this.IsUpload) {
        file = file.filter((item) => {
          const { biz_info: bizInfo } = item;
          if (bizInfo) {
            try {
              const bizInfoStr = decodeURIComponent(bizInfo);
              const bizInfoObj = JSON.parse(bizInfoStr);
              const isShowInFileContainer = erowConfig.hasProp(bizInfoObj, "isShowInFileContainer") ? bizInfoObj.isShowInFileContainer : "";
              if (isShowInFileContainer === false) {
                return false;
              }
              return true;
            } catch (e) {
              return true;
            }
          }
          return true;
        });
        file.forEach((item) => {
          item.IsTemp = true;
          item["file_type"] = item.file_name && item.file_name.slice(item.file_name.lastIndexOf(".") + 1).toLowerCase();
          item["content_type"] = item["file_type"];
        });

        this.handleFileList(file);
        this.tempFileList = [...file];
        return;
      }
    },
    changeImageIndex(index) {
      this.currentIndex = index;
    },
    longPressCallBack(e) {
      this._longPressTimer = setTimeout(() => {
        this.longPressStatus = true;
      }, 700);
    },
    cancelLongPressCallBack(e) {
      clearTimeout(this._longPressTimer);
    },
    selectActionAfterLongPress({ name, operation }) {
      const apiMap = {
        save: "handleSaveAfterLonePress",
        share: "handleShareAfterLonePress",
      };
      const img = this.allFileList[this.imageIndex[this.currentIndex]];
      this[apiMap[operation]](img);
    },
    handleSaveAfterLonePress(file) {
      function cb({ resultFlag }) {
        if (Number(resultFlag)) {
          vant.Toast.success("保存成功！请前往相册内查看");
        }
      }
      const path = this.getImgSrc(file, 0);
      erJsBridge.saveImgLibrary("", "onlineFile", path, cb);
    },
    handleShareAfterLonePress(file) {
      function cb({ resultFlag }) {
        console.log(resultFlag, "分享结果");
      }
      const path = this.getImgSrc(file, 0);
      erJsBridge.shareToWX(0, "image", { imageUrl: path, thumbUrl: "" }, cb);
    },
  },
  watch: {
    keyValue: {
      handler(newVal, oldVal) {
        if (oldVal !== newVal) {
          this.init();
        }
      },
      immediate: false,
    },
    data: {
      handler(newVal, oldVal) {
        if (oldVal !== newVal) {
          // this.allFileList = this.allFileList.filter(item => item?.IsTemp)
          // this.onlineFileList = [];
          this.handleData(this.data);
        }
      },
    },
    showPic: {
      handler(n, o) {
        this.$nextTick(() => {
          const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
              if (mutation.type === "childList" && mutation.previousSibling) {
                const img = mutation.previousSibling;
                img.dataset.eventsettled = "true";
                img.addEventListener("touchstart", this.longPressCallBack);
                img.addEventListener("touchend", this.cancelLongPressCallBack);
              }
            }
            this._longPressEventSettled = true;
          }.bind(this);
          const obs = new MutationObserver(callback);
          if (n && !this._longPressEventSettled) {
            const previewWrappers = document.querySelectorAll(".images-in-fileContainer");
            const config = { attributes: false, childList: true, subtree: true };
            previewWrappers.forEach((previewWrapper) => {
              obs.observe(previewWrapper, config);
            });
            this._obs = obs;
          } else {
            if (this._obs) {
              this._obs.disconnect();
              this._obs = undefined;
            }
          }
        });
      },
    },
    allFileList: {
      handler(newV, oldV){
        if(newV){
          this.$emit("file-count-change", {
            fileCount: newV.length,
            index: this.cardFileIndex
          })
        }
      }
    }
  },
};
