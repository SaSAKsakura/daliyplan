var ViewCommentItem = {
  name: "ViewCommentItem",
  mixins: [commonMinxin],
  components: {
    "uc-progress-bar": ProgressBar,
    "uc-answer-field": UcAnswerField,
  },
  /* html */
  template: `
    <div class='component-outer' :style="getviewPosition(config)" ref="viewCommentRef">

      <uc-progress-bar :class="activeClass(config, containerdata)" v-if="config.ControlCode == 'UcProgressBar'" :config="config" :value="realVlaue"></uc-progress-bar>

      <div class="ucImage" v-else-if="config.ControlCode=='UcImageField'">
        <img @click.stop="handleSpecialFun($event, config, containerdata)" v-on="handleClientActions()" :class="activeClass(config, containerdata)" v-if="config.ControlCode=='UcImageField'" :src="realVlaue" class="icon" />
        <p v-if="config.ControlProperty.UseBadge && cornerMarkContent" class="corner-mark">{{ cornerMarkContent }}</p>
      </div>

      <div class="ucImage" v-else-if="config.ControlCode=='UcImage'">
        <img @click.stop="handleSpecialFun($event, config, containerdata)" v-on="handleClientActions()" :class="activeClass(config, containerdata)" class="icon rightIcon" :src="getImageSrc(thumbnailFlag)"/>
        <p v-if="config.ControlProperty.UseBadge && cornerMarkContent" class="corner-mark">{{ cornerMarkContent }}</p>
      </div>
      <span @click.stop="handleSpecialFun($event, config, containerdata)" v-on="handleClientActions()" :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcLabel'" class="one-hide inline-flex justify-center items-center editer-form-label">
        <span>{{ config.ControlProperty.RSValue }}</span>
        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" :src="getImgFileUrl({parentFilePath: 'icon', filename: 'real-color-info', fileType: 'png'})" alt="" />
            <img v-if="isItemWarningTip()" :src="getImgFileUrl({parentFilePath: 'icon', filename: 'real-color-warning', fileType: 'png'})" alt=""/>
            <img v-if="isItemQuestionTip()" :src="getImgFileUrl({parentFilePath: 'icon', filename: 'real-color-question', fileType: 'png'})" alt=""/>
          </span>
        </el-tooltip>
      </span>

      <div @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata])" v-on="handleClientActions()" :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcBoundField'&&!isHtmlEncode(config)&&!config.ControlProperty.Separator" class="bound bound-no flex justify-center items-center" style="line-height:1"  ref="commentItemRef">
      <el-tooltip
        v-if="isTextOverflow"
        popper-class="max-width-355 font-13 back-color-dark-9"
        :visible-arrow="false"
        placement="top"
        :hide-after="0"
        :value="overflowTooltipVisible"
        trigger="manual"
      >
        <span slot="content">{{ realVlaue }}</span>
        <span 
          @touchstart.stop="overflowTooltipVisible = true"
          @touchend.stop="overflowTooltipVisible = false"
          @touchcancel.stop="overflowTooltipVisible = false"
        >{{realVlaue}}</span>
      </el-tooltip>
      <span v-else>{{realVlaue}}</span>
        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
          </span>
        </el-tooltip>
      <div class="expandAndClose" @click.stop="changeExpand" ref="opBtnCloRef" v-if="config.ControlProperty.IsOperateShowOneLine" style="display:none">
        <span v-if="isExpand&&isShowExpand"> 收起 </span>
      </div>
      </div>

<div :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcBoundField'&&!isHtmlEncode(config)&&config.ControlProperty.Separator" class="bound bound-no items-center"  ref="commentItemRef">
      <div
        v-for="(linkText, index) in realVlaue.split(
          config.ControlProperty.Separator
        )"
        :key="linkText"
        @click.stop="handleSpecialFun($event, config, containerdata,'','',index)" 
        v-on="handleClientActions()"
        style="margin-right: 10px;color: #409eff;"
      >{{linkText}}</div>     

        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
          </span>
        </el-tooltip>
      </div>

      <div @click.stop="handleSpecialFun($event, config, containerdata)" v-on="handleClientActions()" :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcBoundField'&&isHtmlEncode(config)" class="bound bound-html flex items-center" ref="commentItemRef" >
        <div v-html="realVlaue"></div>
        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
          </span>
        </el-tooltip>
      </div>

     <template
        v-else-if="
          config.ControlCode == 'UcButton' &&
          config.ControlProperty.OnClientClick === 'switchOpenAndClose'
        "
      >
        <span
          :class="activeClass(config, containerdata)"
          v-if="isCloseAllDetail"
          @click.stop="
            checkConfirm(config, handleSpecialFun, [
              $event,
              config,
              containerdata,
            ])
          "
          v-on="handleClientActions()"
          class="linkbtn"
          >展开</span
        >
        <span
          :class="activeClass(config, containerdata)"
          v-else
          @click.stop="
            checkConfirm(config, handleSpecialFun, [
              $event,
              config,
              containerdata,
            ])
          "
          v-on="handleClientActions()"
          class="linkbtn"
          >收起</span
        >
      </template>
       <img :class="activeClass(config, containerdata)" v-else-if="config.ControlCode == 'UcButton' && config.ControlProperty.buttonShowType == 'image'" class="opImg"
          :title="config.ControlProperty.DataField?detailData[config.ControlProperty.DataField]: config.ControlProperty.RSValue" :src="getBtnImg(config)" alt=""
          @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata])" v-on="handleClientActions()" />
      <span :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcButton'" @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata])" v-on="handleClientActions()"  class="linkbtn" >{{ config.ControlProperty.DataField?containerdata[config.ControlProperty.DataField]: config.ControlProperty.RSValue }}</span>

      <div :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcBorder'" class="border-bottom"></div>

      <span :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcSensitiveField'" class="sensitiveField">
        <span @click.stop="takeAPhoneCall(config)">
            {{ containerdata[config.ControlProperty.DataField] }}
        </span>
        <img :src="getEye(config,containerdata)" v-show="getSensitiveImgShow(config) && containerdata[config.ControlProperty.DataField]" alt="" @click.stop="getSensitiveInfo(config, containerdata)" />
      </span>

      <div class="tag-wrapper" v-else-if="config.ControlCode === 'UcTagGroup'">
        <div v-for="(item, index) in tagData"
             :key="item.content"
             class="uc-tag"
             :class="item.cssName">
               <img v-if="item.iconUrl" :src="item.iconUrl" width="15px" height="15px" alt="">
               <img v-if="config.ControlProperty.TagMode === 'imgMix'" :src="item.content" alt="">
               <span v-if="config.ControlProperty.TagMode === 'textMix'">{{item.content}}</span>
        </div>
      </div>
      <div :class="activeClass(config, containerdata)" v-else-if="config.ControlCode=='UcKindEditor'" class="bound bound-html flex items-center" ref="commentItemRef" >
        <div v-html="realVlaue"></div>
      </div>

      <span :class="activeClass(config, containerdata)" v-else>{{ realVlaue }}</span>


      <div v-if="isHadTopNav" v-show="isShowTopNav" class="topNav">
        <div class="topNav-mask" @click="isShowTopNav = false"></div>
        <div class="topNav-items">
          <div class="topNav-item" v-for="item in navMenus" @click="goMenu(item)">
            <img :src="getImgSrc(item)" @error="setDefautImg">
            <p>{{item.menu_name}}</p>
          </div>
        </div>
      </div>

      <!-- 导航组件 -->
      <van-popup  class='directionPop' v-model="isShowDirectionPup" position="bottom" get-container="body">
        <div class='direction-content'>
          <div @click.stop=dirveSheetSelect(item) class='one' :key='item.index' v-for="(item) in driveActions">
          <span>{{item.name}}</span>
          </div>
        </div>
      </van-popup>

      <uc-answer-field v-if="config.ControlCode == 'UcAnswerField'" :config="config" :class="activeClass(config)"></uc-answer-field>

      <div class="expandAndClose" @click.stop="changeExpand" ref="opBtnExRef" v-if="config.ControlProperty.IsOperateShowOneLine" style="display:none">
        <span v-if="!isExpand&&isShowExpand"> 展开 </span>
      </div>
      <van-action-sheet
        v-model="phoneCallSheet"
        :actions="phoneCallActions"
        @select="phoneCallSheetSelect"
        cancel-text="取消"
        close-on-click-action
        get-container="body"
        @cancel="phoneCallSheetCancel" />
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => { },
    },
    dataValue: {
      type: [String, Number],
      default: () => "" || 0,
    },
    containerdata: {
      type: Object,
      default: () => { },
    },
    detailData: {
      type: Object,
      default: () => { },
    },
    keyValue: {
      default: "",
    },
    parentConfig: {
      type: Object,
      default: () => { },
    },
    position: {
      type: String,
      default: "",
    },
    cardIdx: {
      default: 0,
      type: Number,
    },
    isCloseAllDetail: {
      default: false,
      type: Boolean,
    },
    fieldMap: {
      type: Object,
      default: () => { },
    },
    idMap: {
      type: Object,
      default: () => { },
    },
  },
  data: () => ({
    isHadTopNav: false,
    isShowTopNav: false,
    navMenus: null,
    isShowDirectionPup: false,
    driveActions: [
      { name: "百度地图", index: 0 },
      { name: "高德地图", index: 1 },
      { name: "腾讯地图", index: 2 },
    ],
    menuPre: "../assets/images/menu/",
    phoneCallSheet: false,
    phoneCallActions: [
      { name: "复制手机号", code: "copy" },
      { name: "呼叫", code: "call" },
    ],
    isExpand: false,
    isShowExpand: false,
    isTextOverflow: false,
    overflowTooltipVisible: false,
  }),
  async created() {
    if (erJsBridge.osType == "iOS") {
      this.driveActions.push({ name: "地图", index: 3 });
    }
    this.initTipHideEvent();
  },
  computed: {
    realVlaue() {
      if (this.config.ControlProperty.DataField) {
        if (this.containerdata) {
          if (this.containerdata[this.config.ControlProperty.DataField] != undefined) {
            return this.containerdata[this.config.ControlProperty.DataField];
          }
          if (this.containerdata[this.config.ControlProperty.ID] != undefined) {
            return this.containerdata[this.config.ControlProperty.ID];
          } else {
            return "";
          }
        } else {
          return "";
        }
      }
      return this.dataValue || this.config.ControlProperty.RSValue;
    },
    tagData() {
      if (this.config.ControlCode !== "UcTagGroup") {
        return [];
      }
      let dataField = this.config.ControlProperty.DataField;
      let cssField = this.config.ControlProperty.CssClassField;
      let separator = this.config.ControlProperty.Separator || ",";
      let iconUrlField = this.config.ControlProperty.IconUrlField ? this.config.ControlProperty.IconUrlField : "";
      // 如果dataField不存在，则表明无tag数据,无需后续
      if (!this.containerdata[dataField]) return [];
      let textArr = this.containerdata[dataField].split(separator);
      let cssArr = this.containerdata[cssField].split(separator);
      let iconUrlArr = iconUrlField !== "" ? this.containerdata[iconUrlField].split(separator) : [];
      return textArr.map((item, idx) => {
        let obj = {
          content: item,
        };
        if (cssArr[idx]) {
          obj["cssName"] = cssArr[idx];
        }
        if (iconUrlArr[idx]) {
          obj["iconUrl"] = iconUrlArr[idx];
        }
        return obj;
      });
    },
    cornerMarkContent() {
      if (this.config && this.config.ControlProperty) {
        const BadgeFiled = this.config.ControlProperty.BadgeField;
        const value = Number(this.containerdata[BadgeFiled]);
        return value > 99 ? "99+" : value;
      }
    },
    thumbnailFlag() {
      let thumbnail = 'thumbnail'
      if(this.config.ControlCode === 'UcImage'){
        let falseValue = [0, false, "false", "0"]
        if(this.config.ThumbnailFlag !== undefined){
          if(falseValue.includes(this.config.ThumbnailFlag)){
            thumbnail = false
          }
        }else if(this.config.ControlProperty.ThumbnailFlag !== undefined){
          if(falseValue.includes(this.config.ControlProperty.ThumbnailFlag)){
            thumbnail = false
          }
        }
      }
      return thumbnail
    }
  },
  beforeDestroy() {
    this.destoryTipHideEvent();
  },
  methods: {
    /**
     * 是否显示展开关闭按钮(一行显示操作)
     */
    checkOverflow() {
      const viewCommentRef = this.$refs.viewCommentRef;
      const commentItemRef = this.$refs.commentItemRef;
      commentItemRef.style["width"] = "100%";
      const opBtnExRef = this.$refs.opBtnExRef;
      if (viewCommentRef && commentItemRef) {
        const computedStyle = window.getComputedStyle(commentItemRef);
        const height = commentItemRef.clientHeight;
        const lineHeight = parseInt(computedStyle.lineHeight, 10);
        if (height > lineHeight) {
          this.isShowExpand = true;
        }
        if (viewCommentRef.offsetWidth && viewCommentRef.offsetWidth <= commentItemRef.offsetWidth) {
          commentItemRef.style.overflow = "hidden";
          commentItemRef.style["text-overflow"] = "ellipsis";
          commentItemRef.style["white-space"] = "nowrap";
          commentItemRef.style["display"] = "inline-block";
          commentItemRef.style["width"] = "100%";
          opBtnExRef.style.display = "block";
        }
      }
    },
    /**
     * 检查文本是否溢出（用于多行省略的 tooltip 显示）
     */
    checkTextOverflow() {
      const commentItemRef = this.$refs.commentItemRef;
      if (commentItemRef) {
        // 判断元素内容是否溢出
        // scrollHeight > clientHeight 表示内容高度超过了可见高度，即发生了溢出
        // 增加 2px 的阈值，避免浏览器渲染精度导致的 1px 误差
        const heightDiff = commentItemRef.scrollHeight - commentItemRef.clientHeight;
        this.isTextOverflow = heightDiff > 2;
      }
    },
    /**
     * 点击展开与关闭操作
     */
    changeExpand() {
      const commentItemRef = this.$refs.commentItemRef;
      const opBtnExRef = this.$refs.opBtnExRef;
      const opBtnCloRef = this.$refs.opBtnCloRef;
      this.isExpand = !this.isExpand;
      if (this.isExpand) {
        commentItemRef.style["white-space"] = "inherit";
        commentItemRef.style["width"] = "auto";
        commentItemRef.style["width"] = "100%";
        opBtnCloRef.style["display"] = "inline-block";
        opBtnExRef.style["display"] = "none";
        opBtnCloRef.style["width"] = "30px";
      } else {
        opBtnCloRef.style["display"] = "none";
        opBtnExRef.style["display"] = "inline-block";
        commentItemRef.style["white-space"] = "nowrap";
      }
    },

    dirveSheetSelect({ name, index }) {
      let gps = {
        lat: this.containerdata.gps_lat,
        lon: this.containerdata.gps_lon,
      };
      if (!gps.lat && !gps.lon) {
        this.$toast.fail("未获取到目的地坐标");
        return;
      }
      //获取数据
      if (index == 0) {
        // bmap
        let mapInfo = MAP_CONFIG ? MAP_CONFIG.baidu : "";
        if (!mapInfo) {
          return;
        }
        let appName = mapInfo.appName;
        if (erJsBridge.osType == "iOS") {
          appName = mapInfo.appNameIOS;
        }
        erJsBridge.isAppInstalled(appName, (data) => {
          if ((erJsBridge.osType != "iOS" && data.resultFlag == -1 && data.isInstalled) || data.resultFlag == -1) {
            let url = `${mapInfo.baseUrl}?${mapInfo.navigationSuffix}&destination=${gps.lat},${gps.lon}`;
            erJsBridge.toApp(url, (data) => {
              if (data.resultFlag != -1) {
                this.$toast.fail(data.errMsg);
              }
            });
          } else {
            this.$toast.fail("请先安装百度地图");
          }
        });
      } else if (index == 1) {
        // amap   //高德地图
        let mapInfo = MAP_CONFIG ? MAP_CONFIG.gaode : "";
        if (!mapInfo) {
          return;
        }
        let appName = mapInfo.appName;
        if (erJsBridge.osType == "iOS") {
          appName = mapInfo.appNameIOS;
        }
        erJsBridge.isAppInstalled(appName, (data) => {
          if ((erJsBridge.osType != "iOS" && data.resultFlag == -1 && data.isInstalled) || data.resultFlag == -1) {
            // if (data.resultFlag == -1&&res.isInstalled) {
            erTool.gpsConvertor(gps, "bd09", "gcj02", (data) => {
              if (data.resultFlag == -1) {
                let url = `${mapInfo.baseUrl}?${mapInfo.navigationSuffix}&dlat=${data.result.lat}&dlon=${data.result.lon}`;
                erJsBridge.toApp(url, (data) => {
                  if (data.resultFlag != -1) {
                    this.$toast.fail(data.errMsg);
                  }
                });
              } else {
                this.$toast.fail(data.errMsg);
              }
            });
          } else {
            this.$toast.fail("请先安装高德地图");
          }
        });
      } else if (index == 2) {
        // qqmap  腾讯地图
        let mapInfo = MAP_CONFIG ? MAP_CONFIG.tencent : "";
        if (!mapInfo) {
          return;
        }
        let appName = mapInfo.appName;
        if (erJsBridge.osType == "iOS") {
          appName = mapInfo.appNameIOS;
        }
        erJsBridge.isAppInstalled(appName, (data) => {
          if ((erJsBridge.osType != "iOS" && data.resultFlag == -1 && data.isInstalled) || data.resultFlag == -1) {
            // if (data.resultFlag == -1&&res.isInstalled) {
            erTool.gpsConvertor(gps, "bd09", "gcj02", (data) => {
              if (data.resultFlag == -1) {
                let url = `${mapInfo.baseUrl}?${mapInfo.navigationSuffix}&tocoord=${data.result.lat},${data.result.lon}`;
                erJsBridge.toApp(url, (data) => {
                  if (data.resultFlag != -1) {
                    this.$toast.fail(data.errMsg);
                  }
                });
              } else {
                this.$toast.fail(data.errMsg);
              }
            });
          } else {
            this.$toast.fail("请先安装腾讯地图");
          }
        });
      } else if (index == 3) {
        //苹果地图

        erTool.gpsConvertor(gps, "bd09", "gcj02", (data) => {
          if (data.resultFlag == -1) {
            let mapInfo = MAP_CONFIG ? MAP_CONFIG.ios : "";
            if (!mapInfo) {
              return;
            }
            let url = `${mapInfo.baseUrl}?daddr=${data.result.lat},${data.result.lon}`;
            erJsBridge.toApp(url, (data) => {
              if (data.resultFlag != -1) {
                this.$toast.fail(data.errMsg);
              }
            });
          } else {
            this.$toast.fail(data.errMsg);
          }
        });
      }
    },
    goMenu(item) {
      if (item.page_url) {
        const [pageUrl, params] = item.page_url.split("?");
        if (params) {
          params.split("&").forEach((kv) => {
            const [k, v] = kv.split("=");
            item[k] = v;
          });
        }
        if (!item.pageMode) {
          item.pageMode = "VIEW";
        }
        pageManager.push(pageUrl, item);
      }
    },
    getImgSrc(item) {
      let temp = this.menuPre + item.fn_code;
      if (item.fn_parameter) {
        temp += "_";
        temp += item.fn_parameter;
      }
      return temp + ".png";
    },
    /**
     * 脱敏控件点击呼出
     */
    async takeAPhoneCall(config) {
      const { DataField, IsTakePhoneCall } = config.ControlProperty;
      if (IsTakePhoneCall !== "true") return;
      let phoneNum = this.containerdata[DataField].toString();
      const reg = /^1[3-9]\d{9}$/;
      // 如果此时还未脱敏，则先脱敏再打电话
      if (phoneNum.includes("*")) {
        phoneNum = await this.getSensitiveInfo(config, this.containerdata);
      }
      if (!reg.test(phoneNum.toString())) return;
      this._tempPhoneNumber = phoneNum;
      this.phoneCallSheet = true;
    },
    async phoneCallSheetSelect({ code }) {
      try {
        const osType = !/android/i.test(navigator.userAgent) ? "iOS" : "android";
        if (code === "copy") {
          const type = "text/plain";
          erJsBridge.copyTextToClipboard(this._tempPhoneNumber, (res) => {
            vm.$toast.success("复制成功");
          });
        } else {
          if (osType === "iOS") {
            window.location.href = `tel://${this._tempPhoneNumber}`;
          } else {
            window.open(`tel://${this._tempPhoneNumber}`);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        this._tempPhoneNumber = "";
      }
    },
    phoneCallSheetCancel(...args) { },
    getBtnImg(configItem) {
      let field = configItem.ControlProperty.ImageUrl;
      if (field) {
        return field;
      } else {
        if (configItem.ControlProperty.OnClientClick == "beginEdit") {
          return this.getImgFileUrl({ parentFilePath: "icon", filename: "edit", fileType: "png" });
        }
        return this.getImgFileUrl({ parentFilePath: "icon", filename: "add", fileType: "png" });
      }
    },
  },
  watch: {
    realVlaue: {
      handler(val) {
        if (val && this.config.ControlProperty.IsOperateShowOneLine) {
          this.$nextTick(() => {
            this.checkOverflow();
          });
        }
        // 检查文本是否溢出（用于 tooltip 显示）
        if (val) {
          this.$nextTick(() => {
            this.checkTextOverflow();
          });
        }
      },
      immediate: true,
    },
  },
};

var ViewComment = {
  name: "ViewComment",
  mixins: [commonMinxin],
  components: {
    "view-comment-item": ViewCommentItem,
  },
  methods: {
    changeStatusCode(params) {
      this.$emit("changeStatusCode", params);
    },
  },
  template: `
    <div  class="viod"   :class="activeClassWidthWrap(config, containerdata,'wrap')"    v-if="getVisible() && isHasEvent(config)"  v-on="handleClientActions()" >
      <view-comment-item
        :detailData=detailData
        @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata])"
        v-on="handleClientActions()"
        :parentConfig='parentConfig'
        :keyValue='keyValue'
        :config='config'
        :dataValue='dataValue'
        :containerdata='containerdata'
        :isCloseAllDetail="isCloseAllDetail"
        :fieldMap='fieldMap'
        :idMap="idMap"
        @changeStatusCode='changeStatusCode'
      ></view-comment-item>
    </div>
    <div class="viod"  :class="activeClassWidthWrap(config, containerdata,'wrap')"  v-else-if='getVisible()' >
      <view-comment-item
        :detailData=detailData
        :parentConfig='parentConfig'
        :keyValue='keyValue'
        :config='config'
        :dataValue='dataValue'
        :containerdata='containerdata'
        :position="position"
        :fieldMap='fieldMap'
        :idMap="idMap"
        @changeStatusCode='changeStatusCode'
      ></view-comment-item>
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => { },
    },
    dataValue: {
      type: [String, Number],
      default: () => "" || 0,
    },
    containerdata: {
      type: Object,
      default: () => { },
    },
    detailData: {
      type: Object,
      default: () => { },
    },
    keyValue: {
      default: "",
    },
    keyName: {
      default: "",
    },
    parentConfig: {
      type: Object,
      default: () => { },
    },
    position: {
      type: String,
      default: "",
    },
    isCloseAllDetail: {
      default: false,
      type: Boolean,
    },
    fieldMap: {
      type: Object,
      default: () => { },
    },
    idMap: {
      type: Object,
      default: () => { },
    },
  },
};
