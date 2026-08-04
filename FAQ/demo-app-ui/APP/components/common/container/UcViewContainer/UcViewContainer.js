/**
 *  文件预览组件，有两种进入途径
 *
 *  1、通过文件列表点击进入，此时传入的fileInfo必定有值。
 *
 *  2、在页面中直接配置该容器，此时文件类型可能为： jpg、png、pdf、docx等。
 *
 *  通过判断fileInfo是否有值来区分是通过重定向到PDFViewer.html使用的组件，还是直接配置该容器使用的组件。
 */
const fileTypePass = ["jpg", "jpeg", "png", "pdf", "ofd", "docx"];
let UcViewContainer = {
  name: "UcViewContainer",
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    fileInfo: {
      type: Object,
      // 因为需要对对象是否存在做判断，所以需要默认值为undefined
      default: void 0,
    },
  },
  data() {
    return {
      pdfUrl: "",
      imgSrc: "",
      cannotShow: false,
      wordText: "",
      pdfh5: null,
      pdfDoc: null, // PDF.js 文档对象
      searchText: "",
      currentMatchIndex: 0,
      matches: [],
      visiblePage: 1, // 当前可见页
    };
  },
  /* html */
  template: `
  <div class="uc-view-container" style="height: 100%; width: 100%;">
    <div class="head-nav-container">
      <div class="head-left">
        <img
          src="../assets/images/common/back-white.png"
          class="leftIcon back-image-unset"
          @click="close"
        />
      </div>
      <span class="head-title file-view-title">{{fileInfo.file_name}}</span>
      <div class="head-right font-color-white">
        <img class="toggle-orientation" src="../assets/images/common/orient.png" @click.stop="handleToggleOrientation">
      </div>
    </div>
    
    <div class="toolbar" v-if="pdfUrl&&getShowSearchBar()">
      <van-field
          v-model="searchText"
          center
          clearable
          label=""
          placeholder="请输入搜索关键词"
        >
        </van-field>
      <span class="link" @click="startSearch">查找</span>
      <van-icon  v-show="currentMatchIndex  > 0" @click="prevMatch" name="arrow-left" /></van-icon>
      <van-icon v-show="currentMatchIndex  <matches.length - 1" @click="nextMatch" name="arrow" ></van-icon>
    </div>
    <div id="demo" style="width: 100%;" v-if="pdfUrl"></div>
    <!-- 高亮层 -->
    <template v-if="pdfUrl">
     <div 
      class="highlight" 
      v-for="(match, index) in visibleHighlights" 
      :key="index"
      :style="getHighlightStyle(match)"
    ></div>
    </template>
    <div style="width: 100%;" v-if="wordText" v-html="wordText"></div>
    <div style="width: 90%;margin: 0 auto;" v-if="imgSrc">
      <img :src="imgSrc" style="width: 100%;" alt="">
    </div>
    <div style="width: 100%; text-align: center; font-size: 20px" v-if="cannotShow">
      <span>该文件类型暂不支持预览</span>
    </div>
  </div>`,
  // mixins: [commonMinxin],
  mixins: [orientationMixin],
  computed: {
    // 只显示当前页的高亮
    visibleHighlights() {
      return this.matches.filter((match) => match.page === this.visiblePage);
    },
    fileType(){
      let type = this.config?.ControlProperty.type.toLowerCase();
      if(!type && this.fileInfo){
        type = this.fileInfo.file_type
      }
      return type
    }
  },
  mounted() {
    if (!window.Pdfh5) {
      const dependencies = ["pdf", "pdf.worker", "pdfh5"];
      dependencies.forEach((item, index, array) => {
        const script = document.createElement("script");
        script.src = `../libs/js/${item}.js`;
        script.async = false;
        document.head.appendChild(script);
        if (index === array.length - 1) {
          script.onload = () => {
            this.fileInfo ? this.handleRedirectShow() : this.handleSinglePageShow();
          };
        }
      });
    } else {
      this.fileInfo ? this.handleRedirectShow() : this.handleSinglePageShow();
    }
  },
  methods: {
    getShowSearchBar() {
      return pageConfig.showFileViewSearchBar == false?false:true;
    },
    async close() {
      await this.setOrientationToVertical();
      window.history.back();
    },
    async handleRedirectShow() {
      let { file_guid, fn_code, pValueSet, instance_guid } = this.fileInfo;
      if (window.erUser && pValueSet) {
        let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
        file_guid = erTool.encrypt(file_guid, token);
        instance_guid = erTool.encrypt(instance_guid, token);
        let pdfUrlBlob = "";
        await this.generateFilePath(file_guid, pValueSet, fn_code, instance_guid, token).then((url) => {
          pdfUrlBlob = url;
        });
        // requestAnimationFrame(() => {
        console.log(pdfUrlBlob);
        this.pdfh5 = new Pdfh5("#demo", {
          pdfurl: pdfUrlBlob,
          renderType: "canvas", // 强制使用canvas渲染
          maxZoom: 5, // 增大最大缩放比例
          cMapUrl: pdfCMapUrl, // 字符映射
          cMapPacked: true,
          backTop: false,
          // lazy: true, // 启用懒加载
          // maxPage: 20 // 限制预渲染页数
        });
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrlBlob,
          cMapUrl: pdfCMapUrl,
          cMapPacked: true,
          disableFontFace: false,
        });
        this.pdfDoc = await loadingTask.promise;
        // 监听pdfh5页面变化
        this.pdfh5.on("pageChange", (page) => {
          this.visiblePage = page;
        });
        // });
      } else {
        window.location.reload();
      }
    },
    handleSinglePageShow() {
      const type = this.config.ControlProperty.type.toLowerCase();
      if (fileTypePass.includes(type)) {
        let fn_code = this.config.FnCode || this.config.ControlProperty.FnCode;
        let pValueSet = this.config.pValueSet;
        let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
        let rowGuid = erTool.encrypt(pageManager.getPageParams().detailData.row_guid, token);
        this.generateFilePath(rowGuid, pValueSet, fn_code, void 0, token).then((url) => {
          if (type === "pdf") {
            this.pdfh5 = new Pdfh5("#demo", {
              pdfurl: url,
              renderType: "canvas", // 强制使用canvas渲染
              maxZoom: 5, // 增大最大缩放比例
              cMapUrl: pdfCMapUrl, // 字符映射
              cMapPacked: true,
              backTop: false,
              lazy: true, // 启用懒加载
              maxPage: 20, // 限制预渲染页数
            });
          } else {
            this.imgSrc = url;
          }
        });
      } else {
        this.cannotShow = true;
      }
    },
    /**
     * 该函数只做拼接，需要传入加密后的参数,
     *
     * 返回的Promise用于流程控制，确保在展示PDF的DOM在渲染之前就已经就绪
     * @type {Promise}
     */
    generateFilePath(guid, pValueSet, fn_code, instance_guid, token) {
      let url =
        baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(guid) +
        "&pValueSet=" +
        encodeURIComponent(pValueSet) +
        "&json=" +
        // encodeURIComponent(JSON.stringify({ token: token }));
        encodeURIComponent(JSON.stringify({ [window.pageConfig.st || "token"]: token }));
      if (instance_guid) {
        url += "&instanceGuid=" + encodeURIComponent(instance_guid);
      }
      if (fn_code) {
        url += "&fnCode=" + fn_code;
      }
      if(["pdf", "ofd"].includes(this.fileType?.toLowerCase())){
        this.pdfUrl = url;
      }
      return Promise.resolve(url);
    },
    async startSearch() {
      if (!this.searchText.trim()) return;

      this.clearHighlights();
      this.matches = [];
      this.currentMatchIndex = 0;

      // 搜索所有页面
      for (let i = 1; i <= this.pdfDoc.numPages; i++) {
        const pageMatches = await this.searchPage(i);
        this.matches.push(...pageMatches);
      }

      if (this.matches.length > 0) {
        this.currentMatchIndex = 0;
        this.scrollToMatch(0);
      } else {
        this.$toast("未找到匹配内容");
      }
    },

    async searchPage(pageNum) {
      const page = await this.pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      // 合并文本项
      let fullText = "";
      const textPositions = [];

      textContent.items.forEach((item) => {
        const startPos = fullText.length;
        fullText += item.str;

        textPositions.push({
          text: item.str,
          start: startPos,
          end: fullText.length,
          transform: item.transform,
          width: item.width,
          height: item.height,
          page: pageNum,
        });
      });

      // 查找匹配项
      const matches = [];
      let pos = fullText.indexOf(this.searchText);
      if (pos == -1) {
        //从前面30% 或者后面30%
        const searchTextLength = this.searchText.length;
        const rear30PercentLength = Math.ceil(searchTextLength * 0.3);
        const rear30PercentText = this.searchText.slice(-rear30PercentLength);
        pos = fullText.indexOf(rear30PercentText);
        if (pos == -1) {
          // 3. 如果后30%匹配失败，尝试匹配searchText的前30%
          const front30PercentLength = Math.ceil(searchTextLength * 0.3);
          const front30PercentText = this.searchText.slice(0, front30PercentLength);
          pos = fullText.indexOf(front30PercentText);
        }
      }

      while (pos !== -1) {
        const matchedItems = textPositions.filter((item) => pos >= item.start && pos < item.end);

        if (matchedItems.length > 0) {
          const firstItem = matchedItems[0];
          const lastItem = matchedItems[matchedItems.length - 1];

          matches.push({
            page: pageNum,
            x: firstItem.transform[4],
            y: viewport.height - firstItem.transform[5],
            width: lastItem.transform[4] - firstItem.transform[4] + lastItem.width,
            height: firstItem.height,
          });
        }

        pos = fullText.indexOf(this.searchText, pos + 1);
      }

      return matches;
    },

    getHighlightStyle(match) {
      // 计算缩放比例（适配pdfh5的缩放）
      const scale = this.pdfh5?.scale || 1;

      return {
        left: `${match.x * scale}px`,
        top: `${match.y * scale}px`,
        width: `${match.width * scale}px`,
        height: `${match.height * scale}px`,
      };
    },

    scrollToMatch(index) {
      if (!this.matches[index]) return;

      this.currentMatchIndex = index;
      const match = this.matches[index];

      // 跳转到目标页
      this.pdfh5.goto(match.page);
      // 延迟确保页面加载完成
      // setTimeout(() => {
      //   const highlight = document.querySelector(
      //     `.highlight]`
      //   );
      //   let currentHigh=highlight[index];
      //   if (highlight&&currentHigh) {
      //     currentHigh.scrollIntoView({
      //       behavior: 'smooth',
      //       block: 'center'
      //     });
      //   }
      // }, 300);
    },

    clearHighlights() {
      document.querySelectorAll(".highlight").forEach((el) => el.remove());
    },
    prevMatch() {
      if (this.currentMatchIndex > 0) {
        this.scrollToMatch(this.currentMatchIndex - 1);
      }
    },
    nextMatch() {
      if (this.currentMatchIndex < this.matches.length - 1) {
        this.scrollToMatch(this.currentMatchIndex + 1);
      }
    },
  },
  beforeUnmount() {
    // 销毁实例
    if (this.pdfh5) {
      this.pdfh5.destroy();
    }
  },
};
