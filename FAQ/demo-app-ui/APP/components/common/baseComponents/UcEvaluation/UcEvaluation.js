var UcEvaluation = {
  name: "UcEvaluation",
  mixins: [commonMinxin],
  template: `
   <div class="uc-evaluation" :class="activeClass(config)">
    <div v-if="title" class="uc-evaluation-header uc-title-bar-icon flex items-center mb-15">
      <div class="header-title">{{ title }}</div>
    </div>
    <div class="uc-evaluation-body flex flex-column justify-center items-center">
      <div class="uc-evaluation-thumb flex items-center">
        <div class="uc-evaluation-btn flex justify-center items-center" :class="getEvaluationBtnClass('up')" @click="toggle('agree')">
          <img :src="getImage('agree')"  />
          <div class="text">满意</div>
        </div>
        <div class="uc-evaluation-btn flex justify-center items-center" :class="getEvaluationBtnClass('down')" @click="toggle('disagree')">
          <img :src="getImage('disagree')"  />
          <div class="text">不满意</div>
        </div>
      </div>
      <div class="uc-evaluation-remark mt-15">
        <van-field
          class="uc-evaluation-remark-input"
          type="textarea"
          v-model="remark"
          :placeholder="placeholder"
          :disabled="getRemarkDisabled()"
          rows="2"
          autosize
          maxlength="200"
          show-word-limit
        >
        <img slot="right-icon" class="uc-evaluation-remark-icon" src="../assets/images/public/enter.png" width='18px' @click="save('remark')" v-if="showIcon"/>
        </van-field>
      </div>
    </div>
  </div>
  `,
  props: {
    config: Object,
    // options: Object,
    // disabled: Boolean,
    // value: String,
    // detailData: Object,
  },
  data() {
    return {
      satisfy_level: "none", //初始化为none，up代表赞同，down代表不赞同
      closeFlag: 0,
      remark: "",
      totalParams: {},
      currentLevel: "none", //保存上一次的选项
      // icon: {
      //   thumbUp: "../assets/images/public/thumb-up.png",
      //   thumbDown: "../assets/images/public/thumb-down.png",
      // },
      icon: {
        thumbUp: this.getImgFileUrl({ parentFilePath: "public", filename: "thumb-up", fileType: "png" }),
        thumbDown: this.getImgFileUrl({ parentFilePath: "public", filename: "thumb-down", fileType: "png" }),
      },
    };
  },
  mounted() {
    this.getData();
  },
  computed: {
    title() {
      return this.config.TitleRSCode;
    },
    configPValueSet() {
      const { config = {} } = this;
      const { pValueSet } = config;
      return pValueSet || this.$root.pValueSet || erowConfig.generateUUID();
    },
    ID() {
      const { config = {} } = this;
      const { ControlProperty = {} } = config;
      const { ID } = ControlProperty;
      return ID;
    },
    placeholder() {
      return this.config.ControlProperty.PlaceHolderRSCode || "请输入评论";
    },
    showIcon() {
      return this.config.ControlProperty.ShowIcon == "true" || false;
    },
  },
  watch: {
    satisfy_level: erowConfig.debounce(function (val) {
      this.save("icon");
    }, 1000),
  },
  methods: {
    getEvaluationBtnClass(type) {
      if (!type) {
        return;
      }

      let classObj = {};
      const { satisfy_level } = this;
      classObj = {
        ...classObj,
        active: satisfy_level == type,
      };

      return classObj;
    },
    getRemarkDisabled() {
      return this.closeFlag == 0 ? false : true;
    },
    activeClass(config = this.config, data = this.initData) {
      const classList = [];
      // CssClass指定类名
      if (config.ControlProperty && config.ControlProperty.CssClass) {
        classList.push(config.ControlProperty.CssClass);
      } else if (config.CssClass) {
        let temp = config.CssClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          classList.push(erowSpecial[config.CssClass](config, data));
        }
        classList.push(config.CssClass);
      }
      // ClientClass指定类名
      if (config.ControlProperty && config.ControlProperty.ClientClass) {
        let temp = config.ControlProperty.ClientClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          classList.push(erowSpecial[config.ControlProperty.ClientClass](config, data));
        }
        classList.push(config.ControlProperty.ClientClass);
      } else if (config.ClientClass) {
        let temp = config.ClientClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          classList.push(erowSpecial[config.ClientClass](config, data));
        }
        classList.push(config.ClientClass);
      }

      // 动态获取类名
      if (config.ControlProperty && config.ControlProperty.CssClassField && data) {
        if (data[config.ControlProperty.CssClassField]) {
          classList.push(data[config.ControlProperty.CssClassField]);
        }
      }

      // 返回类名：动态获取类名 > ClientClass > CssClass
      return classList.join(" ");
    },
    toggle(type) {
      if (this.closeFlag == -1) {
        return;
      }
      if (type == "agree") {
        this.satisfy_level = this.satisfy_level == "up" ? "none" : "up";
      } else {
        this.satisfy_level = this.satisfy_level == "down" ? "none" : "down";
      }
    },
    save(flag) {
      const { configPValueSet, ID } = this;
      if (flag == "icon" && this.currentLevel == this.satisfy_level) {
        return;
      } else if (flag == "remark" && !this.remark) {
        this.$toast.fail("请输入评论内容");
        return;
      }
      let newParams = {
        remark: this.remark,
        satisfy_level: this.satisfy_level,
        // keyValue: this.config.formKey,
        pValueSet: configPValueSet,
        controlGUID: this.config.ControlGUID,
      };
      let temp = Object.assign(this.totalParams, newParams);
      if (flag == "remark") {
        this.$toast.loading("保存中~");
      }
      let params = {
        menuRowGuid: this.config.menuRowGuid,
        controlGUID: this.config.ControlGUID,
        pageMode: "EDIT",
        pValueSet: configPValueSet,
        paramMap: {
          [ID]: temp,
        },
      };
      let url = erowplatformBackendUrl + "/appBaseApi/sysDataAction";
      erRequest.post(
        url,
        params,
        (res) => {
          this.$toast.clear();
          if (res.code == "SUCCESS") {
            this.getData();
          } else {
            this.$toast.fail(res.msg);
          }
        },
        (error) => {
          this.$toast.clear();
          this.$toast.fail(error.msg);
        }
      );
    },
    async getData() {
      let _this = this;

      const { configPValueSet } = this;
      const params = {
        controlCode: _this.config.ControlCode,
        pValueSet: configPValueSet,
        controlGUID: _this.config.ControlGUID,
        menuRowGuid: this.config.menuRowGuid,
        keyValue: this.config.keyValue,
        pageMode: "EDIT",
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

      if (res.code == "SUCCESS" && res.data) {
        const { ID } = this;
        const data = res?.data?.[ID] || {};
        this.closeFlag = data.close_flag;
        this.satisfy_level = data.satisfy_level;
        this.currentLevel = data.satisfy_level;
        this.remark = "";

        Object.keys(data).forEach((key) => {
          if (key != "RowRights") {
            this.$set(this.totalParams, key, data[key]);
          }
        });
      }
    },
    getImage(type) {
      const { icon } = this;
      if (type == "agree") {
        const fileName = icon.thumbUp;
        return fileName;
      } else {
        const fileName = icon.thumbDown;
        return fileName;
      }
    },
  },
};
