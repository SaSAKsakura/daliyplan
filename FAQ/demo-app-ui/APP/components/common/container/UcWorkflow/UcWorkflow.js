var UcWorkflow = {
  name: "UcWorkflow",
  mixins: [commonMinxin],
  components: {},
  template: `
    <div class="workflow" v-if="workflowList.length">
      <div class="workflow-all" :class='activeClass()'>
        <div class="head-nav-container pithy-title-erow mt0">
          <span class="head-title">{{  config.parentControlProperty?config.parentControlProperty.RSValue:config.RSValue }}</span>
        </div>

        <van-steps :active="active" active-icon="circle" active-color='#3076ff' direction="vertical">
          <van-step v-for='(item,index) in workflowList' :key='index'>
            <div class='workflow-item'>
              <div class='workflow-line'></div>
              <div class='workflow-icon'></div>
              <div class='workflow-info'>{{item.from_step_name}} {{item.action_by}}
                <span class='workflow-status' :style="{color: statusColorMap[item.op_name]}">
                  {{item.op_name}}
                </span>
              </div>
              <div class='workflow-idea' :style="computedFont" v-html='item.remark'></div>
              <div class='workflow-date'>{{cutCreateDate(item.create_date)}}</div>
            </div>
          </van-step>
        </van-steps>

        <van-radio-group class="workflow-ops" v-if="currentWork" v-model="opType">
          <van-radio :name="item" v-for="(item, index) in currentWork.operations.split(',')" :key="item" icon-size="15px">{{getOpName(item, index)}}</van-radio>
        </van-radio-group>

        <template v-if="styleType == 'merge' && currentWork" v-show="false">
          <van-field v-model="writeRemark" rows="2" type="textarea" autosize placeholder="请填写审批意见"></van-field>
          <div class="quick-reply-wrapper" v-if="showQuickReply">
            <div class="quick-reply-button" v-for="item in currentWork.opinions[opType]" @click="refillRemark">
              {{item}}
            </div>
          </div>
          <van-button class='workflow-submit' v-if="!hideSubmitButton" :plain="false" @click="submitWorkInfo" :disabled="submitting" type="info" round size="small">
            提交
          </van-button>
        </template>

      </div>

      <div class="workflow-write" v-if="styleType !== 'merge' && currentWork" :class='activeClass()'>
        <div class="head-nav-container pithy-title-erow">
          <span class="head-title">
            备注
            <img v-show="opType&&SettingCtnr" class="workflow-work-setting freely-falling" :src="getImgFileUrl({parentFilePath: 'common', filename: 'SETTINGS_hover', fileType: 'png'})" @click="gotoSetting">
          </span>
          <span class="blue-label-erow">{{currentWork.from_step_name}}</span>
        </div>
        <van-field v-model="writeRemark" rows="2" type="textarea" autosize placeholder="请填写备注"></van-field>
        <div class="quick-reply-wrapper" v-if="showQuickReply">
          <div class="quick-reply-button" v-for="item in currentWork.opinions[opType]" @click="refillRemark">
            {{item}}
          </div>
        </div>
        <van-button class='workflow-submit' v-if="!hideSubmitButton" :plain="false" @click="submitWorkInfo" :disabled="submitting" type="info" round size="small">
          提交
        </van-button>
      </div>

    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    statusColorMap: {
      重新修改: "#ffb117",
      取消: "#ff4141",
      不批准: "#ff4141",
    },
    styleType: "",
    workflowList: [],
    currentWork: null,
    opType: "",
    writeRemark: "",
    errorCount: 0,
    submitting: false,
  }),
  methods: {
    gotoSetting() {
      // window.location = "./workflowSetting.html";
      const settingCtnr = JSON.parse(this.config.ControlProperty.SettingCtnr);
      const pageTitle = pageContext.UcPageTitleContainer && pageContext.UcPageTitleContainer.config.ControlProperty.TitleRSValue;
      pageManager.push("./workflowSetting.html", {
        params: {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: settingCtnr.opinion.ControlGUID,
          opType: this.opType,
          from_step_id: this.currentWork.from_step_id,
        },
        crumbs: [pageTitle, this.currentWork.from_step_name, this.getOpName(this.opType)],
      });
    },
    cutCreateDate(date) {
      return date.substring(0, date.lastIndexOf(":"));
    },
    getOpName(val, index) {
      if(this.currentWork.operationNames){
        if(index !== undefined){
          return this.currentWork.operationNames.split(',')[index]
        }else{
          const idx = this.currentWork.operations.split(',').findIndex(item=>item==val)
          if(idx != -1){
            return this.currentWork.operationNames.split(',')[idx]
          }
        }
      }
      return erowConfig.getOpName(val);
    },
    getWorkInfoData() {
      erRequest.post(
        erowplatformBackendUrl + "/workflow/getProcess?pValueSet=" + this.config.pValueSet,
        { pValueSet: this.config.pValueSet },
        (res) => {
          if (res.code == "SUCCESS") {
            this.workflowList = res.data.filter((item) => item.p_level >= -1);
            this.currentWork = res.data.find((item) => item.operations && item.p_level == -1);
            if (this.currentWork) {
              if (!this.currentWork.operations) {
                this.currentWork.operations = "";
              }
              this.opType = this.currentWork.operations.split(",")[0];
              this.initSubmitButton()
            }
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );
    },
    submitWorkInfo() {
      if (this.opType === "") {
        vant.Toast.fail("未选择审批类型");
        return;
      }
      let containerparams = this.getParams(
        "SUBMIT",
        pageContext.root.$refs["UcContainer"].childContainers,
        pageContext.root.$refs["UcContainer"],
        {}
      );
      if (containerparams.errorCount) {
        this.errorCount = 0;
        return;
      }
      this.submitting = true;
      debugger
      erRequest.post(
        erowplatformBackendUrl + "/workflow/doWFOp",
        {
          pValueSet: this.config.pValueSet,
          remark: this.writeRemark,
          operations: this.opType,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            vant.Toast.success("操作成功");
            setTimeout(() => {
              if (this.config.ControlProperty.WFAutoBackOps) {
                const pageReturnOperatinos = this.config.ControlProperty.WFAutoBackOps.split(",");
                if (pageReturnOperatinos.includes(this.opType)) {
                  if (!pageContext.root.removeLayer(this.config)) {
                    localStorage.removeItem(this.config.pValueSet);
                    pageContext["root"].closeForm();
                  }
                  return;
                }
              }
              this.submitting = false;
              window.location.reload();
              // erowConfig.globalUpdate();
            }, 1000);
          } else {
            this.submitting = false;
            this.$toast.fail(res.msg);
          }
        },
        (error) => {
          this.submitting = false;
          this.$toast.fail(error.msg);
        }
      );
    },
    refillRemark(e) {
      this.writeRemark = e.target.innerText;
    },
    initSubmitButton() {
      if (this.config.pageMode == "VIEW") {
        // this.submitButton = false;
        // let UcButtonContainer = pageContext.root.$refs["UcContainer"].$children.find((item) => item.config && item.config.ControlCode == "UcButtonContainer");
        let lastRootContainer =  pageContext.root.$refs["UcContainer"].$children[pageContext.root.$refs["UcContainer"].$children.length - 1];
        let hasBottomButtonContainer = false;
        if(lastRootContainer.config.ControlCode == "UcButtonContainer") {
          hasBottomButtonContainer = true;
        }
        if (hasBottomButtonContainer) {
          // UcButtonContainer.submitButton = false;
          eventEmitter.emit("addButtonFromWorkFlow",{
            ControlProperty: {
              ID: "submitButton",
              RSValue: "提交",
              OnClientClick: "submitWorkInfo",
              IsCustom: "true",
              relativeContainer: this.config.ControlProperty.ID,
            },
          }, {ctnrUID: this.config.CtnrUID});
        }
      } else if(this.config.pageMode == "EDIT") {
        let UcButtonContainer = pageContext.root.$refs["UcContainer"].$children.find((item) => item.config && item.config.ControlCode == "UcButtonContainer");
        let index = UcButtonContainer.opList.findIndex((item) => item.ControlProperty.ID == "submitButton");
        if (index != -1) {
          UcButtonContainer.opList.splice(index, 1);
        }
      }
    },
  },
  created() {
    this.config.pageMode !== "ADD" && this.getWorkInfoData();
    this.styleType = this.config.ControlProperty.WorkflowStyle;
    eventEmitter.on("refresh", () => {
      this.getWorkInfoData();
      this.writeRemark = "";
    });
    // this.initSubmitButton()
  },
  computed: {
    active() {
      if (this.workflowList && this.workflowList.length) {
        return this.workflowList.findIndex((item) => {
          return !item.create_date;
        });
      } else {
        return 0;
      }
    },
    computedFont() {
      return {
        color: this.config.ControlProperty.contentColor || "#1A1A1A",
      };
    },
    SettingCtnr() {
      return JSON.parse(this.config.ControlProperty.SettingCtnr || '""');
    },
    showQuickReply() {
      if (this.currentWork && this.currentWork.opinions && this.currentWork.opinions[this.opType] && this.currentWork.opinions[this.opType].length) {
        return true;
      }
      return false;
    },
    hideSubmitButton() {
      let lastRootContainer =  pageContext.root.$refs["UcContainer"].$children[pageContext.root.$refs["UcContainer"].$children.length - 1];
      if(lastRootContainer.config.ControlCode == "UcButtonContainer") {
        return true;
      } else  {
        return false;
      }
    }
  },
};
