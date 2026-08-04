var TemplateFileSync = {
  name: "TemplateFileSync",
  /* html */
  template: `
  <div class="template-file-sync">
    <div class="head-nav-container">
      <img class="nav-left-icon" src="../assets/images/common/back-white.png" @click="handleBack" />
      <div class="nav-title head-title">{{ navTitle  }}</div>
      <img class="nav-right-icon" src="../assets/images/common/upload_all.png" @click="handleUploadAllFile"/>
    </div>
    <div class="template-file-sync-header">
      <div class="header-tab">
        <div class="tab-item"  @click="handleTabClick(typeContants.local)">
          <span class="tab-item-content" :class="getCurrentClass(typeContants.local)">未上传({{localFileCount}})</span>
        </div>
        <div class="tab-item" @click="handleTabClick(typeContants.online)">
          <span class="tab-item-content" :class="getCurrentClass(typeContants.online)">已上传({{onlineFileCount}})</span>
        </div>
      </div>
    </div>

    <div class="template-file-sync-body">
      <div class="body-file-list">
        <div class="body-file-item" v-for="file in currentFileList" :key="file.file_id" @click="handleViewFile(file)">
          <div class="body-file-item-left" >
            <div class="file-item-name">{{file.file_name}}</div>
            <div class="file-item-size">{{file.file_size}}</div>
          </div>
          <div class="body-file-item-right">
            <img v-if="isAudio(file)" class="item-right-icon"  :src="getAudioIcon(file)" />
            <img v-if="isLocalType" class="item-right-icon" @click.stop="handleUploadFile(file)"  src="../assets/images/common/shangchuan.png" />
            <img v-if="isLocalType" class="item-right-icon" @click.stop="handleDeleteFile(file)" src="../assets/images/common/delete.png" />
            
          </div>
        </div>
      </div>
    </div>
    <van-image-preview v-model="showPic" :images="images"></van-image-preview>
  </div>`,
  mixins: [commonMinxin],
  props: {
    /*格式
    {
        flow_name: "发布批准",
        flow_order: 6,
        down_flow: -1, // -1已完成，0未完成
        plan_time_flow_remark: "计划时间: 2032/2/9",
        ppan_time_flow_remark: "计划时间: 2032/2/9",
        wstermark: '',
        special_mark: -1
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
  components: {
    // UcGridviewContainer: () => import("@/common/layout/components/UcGridviewContainer"),
  },
  data() {
    const typeContants = {
      local: "local",
      online: "online",
    };
    return {
      typeContants,
      currentType: typeContants.local,
      localFileList: [],
      onlineFileList: [],
      // 音频
      curAmr: null,
      time: null,
      // 图片
      showPic: false,
      images: [],
    };
  },
  computed: {
    localFileCount() {
      const { localFileList = [] } = this;
      return localFileList.length;
    },
    onlineFileCount() {
      const { onlineFileList = [] } = this;
      return onlineFileList.length;
    },
    currentFileList() {
      const { currentType, typeContants, localFileList = [], onlineFileList = [] } = this;
      if (currentType == typeContants.local) {
        return localFileList;
      }
      if (currentType == typeContants.online) {
        return onlineFileList;
      }

      return [];
    },
    isLocalType() {
      const { currentType, typeContants } = this;
      return currentType == typeContants.local;
    },
    isOnlineType() {
      const { currentType, typeContants } = this;
      return currentType == typeContants.online;
    },
    menuConfigKey() {
      return this.config.menuConfigKey || this.$root.menuConfigKey;
    },
    menuRowGuid() {
      return this.config?.menuRowGuid;
    },
    configPValueSet() {
      const { config = {} } = this;
      const { pValueSet } = config;
      return pValueSet || this?.$root?.pValueSet || erowConfig.generateUUID();
    },
    UcDSContainerConfig() {
      return this.ControlProperty?.DataSourceConfig;
    },
    ControlProperty() {
      return this?.config?.ControlProperty || {};
    },
    ExtraConfig() {
      const { config = {} } = this;
      const { ExtraConfig = "", ControlProperty = {} } = config || {};
      const { ExtraConfig: otherExtraConfig = "" } = ControlProperty;
      return otherExtraConfig || ExtraConfig;
    },
    ExtraConfigObj() {
      const { ExtraConfig } = this;
      if (!ExtraConfig) {
        return null;
      }

      let ExtraConfigObj = null;
      try {
        ExtraConfigObj = JSON.parse(ExtraConfig);
      } catch (e) {
        return null;
      }
      return ExtraConfigObj || {};
    },
    navTitle() {
      const { ExtraConfigObj } = this;
      return ExtraConfigObj?.navTitle || "文件同步";
    },
  },
  async mounted() {
    await this.initLoadScript();
    this.init();
  },
  methods: {
    handleBack() {
      pageManager.back();
    },
    async init() {
      const toast = this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中",
      });

      this.pauseAudio();
      await Promise.all([this.initLocalFileList(), this.initOnlineFileList()]).finally((res) => {
        toast.clear();
      });
    },
    async initLoadScript() {
      const toast = this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "加载中",
      });
      // const androidPrommise = new Promise((resolve, reject) => {
      //   this.loadScript("../../js/android.js", () => {
      //     resolve();
      //   });
      // });
      const BenzAMRRecorderPrommise = new Promise((resolve, reject) => {
        this.loadScript("../libs/js/BenzAMRRecorder.min.js", () => {
          resolve();
        });
      });

      await Promise.all([BenzAMRRecorderPrommise]).finally(() => {
        toast.clear();
      });
    },
    async getAllFiles() {
      const data = await new Promise((resolve, reject) => {
        erJsBridge.getAllFiles(erUser.userId, (data) => {
          if (data && data.resultFlag == "-1") {
            return resolve(data.result);
          }
          return reject([]);
        });
      });
      return data;
    },
    async initLocalFileList() {
      const fileList = await this.getAllFiles();
      const reslist = fileList?.filter((file) => file.upload_status == "NotUpload");
      this.handleFileList(fileList);
      this.localFileList = reslist;
    },
    // 获取数据
    async getOnlineFileList() {
      const { ControlProperty, UcDSContainerConfig, configPValueSet, menuRowGuid } = this;
      const params = {
        controlCode: UcDSContainerConfig?.ControlCode,
        pValueSet: configPValueSet,
        controlGUID: ControlProperty?.DataSourceCtnrGuid,
        menuRowGuid,
        keyValue: this.config.keyValue,
        pageMode: "VIEW",
      };
      const res = await new Promise((resolve, reject) => {
        apis.sysLoadDBData({
          vm: this,
          params,
          success: (res) => {
            resolve(res);
          },
          fail: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            reject(error);
          },
          error: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            reject(error);
          },
        });
      });

      const ID = UcDSContainerConfig?.ControlProperty?.ID;
      const fileList = res?.data?.[ID]?.dataList;

      return fileList;
    },
    async initOnlineFileList() {
      const fileList = await this.getOnlineFileList();
      this.handleFileList(fileList);
      this.onlineFileList = fileList;
    },
    handleFileList(fileList) {
      fileList.forEach((item) => {
        // 类型处理
        item["file_type"] = item.file_name && item.file_name.slice(item.file_name.lastIndexOf(".") + 1).toLowerCase();
        if (!item.content_type) {
          item["content_type"] = item.file_type;
        }
        const contentType = item.content_type.toLowerCase();
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
    handleTabClick(type) {
      const { typeContants } = this;
      if (type == typeContants.local) {
        this.handleLocalFileClick(type);
        return;
      }

      if (type == typeContants.online) {
        this.handleOnloneFileClick(type);
        return;
      }
    },
    handleLocalFileClick(type) {
      this.currentType = type;
      this.pauseAudio();
      this.initLocalFileList();
    },
    handleOnloneFileClick(type) {
      this.currentType = type;
      this.pauseAudio();
      this.initOnlineFileList();
    },
    pauseAudio() {
      if (this.curAmr) {
        this.curAmr.pause();
      }
    },
    getCurrentClass(type) {
      return this.currentType == type ? "current" : "";
    },
    // 上传文件
    async handleUploadFile(file) {
      if (!file) {
        return;
      }
      await this.$dialog.confirm({
        title: "系统消息",
        message: "确定[上传]该文件？",
        className: "checkConfirm",
      });

      // 上传文件
      const toast = this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "上传中",
      });
      await this.initUploadFile(file).finally(() => {
        toast.clear();
      });
      this.$toast.success("上传成功");
      this.init();
      return;
    },
    async handleUploadAllFile() {
      const { localFileList = [] } = this;
      await this.$dialog.confirm({
        title: "系统消息",
        message: "确定[上传]所有本地文件？",
        className: "checkConfirm",
      });

      // 上传文件
      const toast = this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "上传中",
      });
      const reqList = [];
      localFileList.forEach((file) => {
        const promiseItem = this.initUploadFile(file);
        reqList.push(promiseItem);
      });
      await Promise.all(reqList)
        .catch((data) => {
          this.$toast.fail(data.errMsg);
          return Promise.reject(data);
        })
        .finally(() => {
          toast.clear();
        });
      this.$toast.success("上传成功");
      this.init();
      return;
    },
    async initUploadFile(file) {
      return await this.uploadFile(file);
    },
    async uploadFile(file) {
      if (file && file.upload_status === "NotUpload") {
        let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
        return await new Promise((resolve, reject) => {
          erJsBridge.erowUploadFile(
            baseUrl + erowplatformBackendUrl + "/file/uploadFile?json=" + encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token })),
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
            },
            file.file_id,
            "file",
            file.file_name,
            file.file_path,
            file.file_type,
            (res) => {
              resolve(res);
            }
          );
        });
      }
    },
    // 删除文件
    async handleDeleteFile(file) {
      if (!file) {
        return;
      }
      await this.$dialog.confirm({
        title: "系统消息",
        message: "确定[删除]该文件？",
        className: "checkConfirm",
      });

      const toast = this.$toast.loading({
        forbidClick: true,
        duration: 0,
        message: "删除中",
      });
      const data = await this.initDeleteFile(file)
        .catch((data) => {
          this.$toast.fail(data.errMsg);
          return Promise.reject(data);
        })
        .finally(() => {
          toast.clear();
        });
      if (data.resultFlag == "-1") {
        this.init();
        this.$toast.success("删除成功");
        return;
      }
    },
    async initDeleteFile(file) {
      return await this.deleteFile(file);
    },
    async deleteFile(file) {
      if (file) {
        return await new Promise((resolve, reject) => {
          erJsBridge.deleteFile(file.file_id, (data) => {
            if (data.resultFlag == "-1") {
              return resolve(data);
            }

            return reject(data.errMsg);
          });
        });
      }
    },
    // 预览
    isPicture(file) {
      const type = file?.content_type?.toLowerCase();
      if (["png", "jpg", "jpeg"].includes(type)) return true;
      return false;
    },
    isAudio(file) {
      const type = file?.content_type?.toLowerCase();
      if (["amr", "wav", "mp3", "m4a"].includes(type)) return true;
      return false;
    },
    handleViewFile(file) {
      const { currentType, typeContants } = this;
      if (currentType == typeContants.local) {
        this.viewLocalFile(file);
        return;
      }
      if (currentType == typeContants.online) {
        this.viewOnlineFile(file);
        return;
      }
    },
    viewLocalFile(file) {
      if (erJsBridge.osType != 1 && this.isPicture(file)) {
        let filePath = file.file_path;
        filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1) + encodeURIComponent(file.file_name);
        this.images = [filePath];
        this.showPic = true;
        return;
      }
      if (this.isAudio(file)) {
        this.handleMediaPlay(file, file.file_path);
        return;
      }

      erJsBridge.appViewFile(file.file_name, null, file.folder_code);
    },
    viewOnlineFile(file = {}) {
      let { file_type, file_name } = file;
      const url = this.getOnlineFileUrl(file);

      // 图片
      if (this.isPicture(file)) {
        this.images = [url];
        this.showPic = true;
        return;
      }
      // 音频
      if (this.isAudio(file)) {
        this.handleMediaPlay(file, url);
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
    viewOnIGW(url, file_type, file_name) {
      erJsBridge.showFile(url, file_type, file_name, "");
    },
    viewOnYJK({ file_type, file_guid, instance_guid, fn_code, file_name, content_type, content_size, downloadStatus }, url) {
      const { configPValueSet } = this;
      if (file_type.toLowerCase() === "pdf" || content_type.toLowerCase() === "ofd") {
        let fileInfo = {
          file_type,
          file_guid,
          fn_code,
          instance_guid,
          pValueSet: configPValueSet,
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
                  className: "checkConfirm",
                })
                .then(() => {
                  this.$set(file, "view_icon_url", "../assets/images/icon/loading.png");
                  // 开始后台下载文件
                  erJsBridge.startAsyncDownloadInApp(url, file_name, file_guid, this.config.FnCode, "", (data) => {
                    if (data.resultFlag === "-1") {
                      if (data.result.downloadStatus === "Succeed") {
                        this.$set(file, "downloadStatus", data.result.downloadStatus);
                        this.$set(file, "view_icon_url", "../assets/images/icon/view.png");
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
                    this.$set(file, "view_icon_url", "../assets/images/icon/view.png");
                    this.$toast.success(`${file_name}下载完成`);
                  }
                }
              });
            }
          }
        });
      } else {
        erJsBridge.callThirdPartyToShowFile("", file_name, file_guid);
      }
    },
    handleMediaPlay(file, url) {
      let _this = this;
      let vm = this;
      let amr = file.amr;
      if (_this.curAmr != amr) {
        if (_this.curAmr != null) _this.curAmr.pause();
        _this.curAmr = amr;
      }
      if (!amr.isInit()) {
        _this.$toast.loading({
          forbidClick: true,
          duration: 0,
          message: "音频加载中",
        });
        amr
          .initWithUrl(url)
          .then(function () {
            vm.$toast.clear();
            file.amrDuration = amr.getDuration();
            amr.play();
          })
          .catch((err) => {
            vm.$toast.fail("音频加载异常");
          });
        amr.onPlay(function () {
          file.amrStatus = "play";
          if (this.time != null) clearInterval(_this.time);
          this.time = setInterval(function () {
            file.amrCurPos = amr.getCurrentPosition();
          }, 100);
        });
        amr.onStop(function () {
          file.amrStatus = "stop";
          clearInterval(_this.time);
          _this.time = null;
          _this.curAmr = null;
        });
        amr.onPause(function () {
          file.amrStatus = "pause";
          clearInterval(_this.time);
          _this.time = null;
        });
        amr.onEnded(function () {
          file.amrStatus = "stop";
          file.amrCurPos = file.amrDuration;
          clearInterval(_this.time);
          _this.time = null;
          _this.curAmr = null;
        });
        amr.onResume(function () {
          file.amrStatus = "play";
          if (_this.time != null) clearInterval(_this.time);
          _this.time = setInterval(function () {
            file.amrCurPos = amr.getCurrentPosition();
          }, 100);
        });
      } else if (amr.isPlaying()) {
        amr.pause();
      } else {
        amr.playOrResume();
      }
    },
    isPlaying(file) {
      if (file?.amrStatus == "play") return true;
      return false;
    },
    getAudioIcon(file) {
      if (this.isPlaying(file)) {
        return "../assets/images/common/pause.png";
      }

      return "../assets/images/common/play.png";
    },
    getOnlineFileUrl(file = {}) {
      let { file_guid, instance_guid, fn_code, content_type } = file;
      const token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      const enyfile_guid = erTool.encrypt(file_guid, token);
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
      if (content_type == "ofd") {
        url += "&viewType=pdf";
      }
      return url;
    },
  },
};
