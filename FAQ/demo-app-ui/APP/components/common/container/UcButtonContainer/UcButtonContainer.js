var UcButtonContainer = {
  name: "UcButtonContainer",
  mixins: [commonMinxin],
  components: {},
  template: `
  <div class="uc-button-container" :class='activeClass()' v-if="getShowOpList.length > 0">
  <template v-for="opItem in getShowOpList">

      <span v-if="opItem.ControlProperty.buttonShowType == 'hypeLink'"
      @click.stop="checkConfirm(opItem, handleOp, [opItem.ControlProperty.RelateOpCode, opItem])"
          class="font-14-blue">
         {{ getBtnText(opItem) }}
      </span>

      <img v-else-if="opItem.ControlProperty.buttonShowType == 'image'" class="opImg"
          :title=" getBtnText(opItem)" :src="getBtnImg(opItem)" alt=""
          @click.stop="checkConfirm(opItem, handleOp, [opItem.ControlProperty.RelateOpCode, opItem])" />
                <van-button v-else  :class="activeClass(opItem) + ' ' + (getShowOpList.length==1?'flex1':'')"
      @click.stop="checkConfirm(opItem, handleOp, [opItem.ControlProperty.RelateOpCode, opItem])"
          :key="opItem.ControlGUID" type="info" round size="small">
           <template #icon v-if="opItem.ControlProperty.ImageUrl">
            <img :src="opItem.ControlProperty.ImageUrl" style="width: 20px; height: 20px;" ></img>
          </template>
          {{  getBtnText(opItem) }}
      </van-button>
  </template>
</div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    initData: {
      type: Object,
      default: () => {},
    },
    indexList: {
      type: Number,
      default: 0,
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    cardedit: {
      type: Boolean,
      default: () => false,
    },
  },
  data: function () {
    return {
      opList: [],
      detailData: {}, //相关联容器数据
      opHandCode: ["ADDSAVE", "ADDCANCEL", "EDITSAVE", "EDITCANCEL", "EDIT", "ADD", "DELETE", "SUBMIT", "REEDIT", "UNDOSUBMIT"],
      errorCount: 0,
      buttonClicks: {}, // 根据ID保存已经点击的按钮，保证接口返回前不重新调用函数。
      editBtns: ["beginEdit", "confirmEditSave", "confirmEditCancel"], //卡片编辑按钮
      beginEditBtn: ["beginEdit"],
      extraButtons: [],
    };
  },
  created() {
    //先取一次适用于关联容器获取权限的时间比按钮容器渲染时间更早
    this.getOpList();
    eventEmitter.on("afterGetOpList", ({ controlID, opList, ctnrUID }) => {
      //再取一次适用于关联容器获取权限的时间晚于按钮容器渲染的情况
      this.getOpList(opList, controlID, ctnrUID);
    });
    this.handleOp = erowConfig.debounce(
      function (type, opItem) {
        // 在两秒内重复点击只触发一次,若超过两秒，且上一次点击的请求还没完成，也要对此次请求进行拦截
        let ID = opItem.ControlProperty.ID;
        if (ID && this.buttonClicks[ID]) {
          // 接口没完成
          this.$toast.fail("接口还没完成！");
          return;
        }
        //点击按钮主动清理指定容器的临时缓存
        let params = this.getRelativeContainerParams() || this.containerdata;
        if (
          opItem &&
          opItem.ControlProperty &&
          opItem.ControlProperty.IsCustom == "true" &&
          (opItem.ControlProperty.OnClientClick || erowConfig.hasProp(opItem.ControlProperty, "actionType"))
        ) {
          this.handleSpecialFun("", opItem, params);
          return;
        } else if (opItem && opItem.ControlProperty.OnClientClick) {
          type = opItem.ControlProperty.OnClientClick;
          let map = {
            ADDSAVE: this.saveForm,
            ADDSAVEANDTODETAIL: this.saveAndToDetail,
            ADDSAVEANDBACK: this.saveAndBack,
            ADDCANCEL: this.closeForm,
            EDITSAVE: this.saveForm,
            EDITSAVEANDBACK: this.saveAndBack,
            EDITCANCEL: this.handleEditCancel, //编辑取消
            EDIT: this.beginEdit,
            ADD: this.getConfig,
            // DELETE: this.deleteData,
            REEDIT: this.handleReEDit,
            UNDOSUBMIT: this.handleUndoSubmit,
            SUBMIT: this.submitWorkFlow,
            VIEW: this.getConfig,
            beginEdit: this.beginCardEdit, //card开始编辑
            confirmEditSave: this.confirmCardEditSave, //card确认保存
            confirmEditCancel: this.confirmCardEditCancel, //card确认取消
          };
          if (map[type]) {
            map[type](type, opItem);
            this.removeTargetContainerCache(opItem);
          } else {
            // 获取数据
            this.handleSpecialFun("", opItem, params);
            return;
          }
        }
        // 配置了actionType属性
        else if (opItem && erowConfig.hasProp(opItem.ControlProperty, "actionType")) {
          this.handleSpecialFun("", opItem, params);
        }
      },
      this.debounceTime,
      true,
    );
  },
  methods: {
    getMainCardEdit(){
      //判断主Container中的配置了单项编辑的Card是否处理编辑状态
        let childContainers=pageContext.root.$refs.UcContainer.childContainers||[];
        let flag=false;
        if(childContainers.length>0){
          let cardContainers=childContainers.filter(item=>item.ControlCode=="UcCardContainer");
          if(cardContainers.length>0){
            cardContainers.forEach(item=>{
              if(item.CtnrUID){
                let cardVm=pageContext[item.CtnrUID]
                if(cardVm&&cardVm.isEdit&&cardVm.isConfigSingleEdit&&cardVm.isChange()){
                  flag=true;
                }
              }
            })
          }
        }
        return flag;
    },
    beginCardEdit(type, opItem) {
      let parentVm = this.$parent;
      if (parentVm && parentVm.config.ControlCode == "UcCardContainer") {
        parentVm.isEdit = true;
      }
    },
    getTargetVm() {
      //找到最近的父级card和list
      let cardVm = this.$parent; //card的实例
      let formCode=["UcCardContainer","UcFormDetailView"];
      let gridCode=["UcJsGridContainer", "UcPageListContainer"]
      while (cardVm && cardVm.config && !formCode.includes(cardVm.config.ControlCode)) {
        cardVm = cardVm.$parent;
      }
      let parentVm = cardVm.$parent; //jsgrid,pageListContainer的实例
      while (parentVm && parentVm.config && !gridCode.includes(parentVm.config.ControlCode)) {
        parentVm = parentVm.$parent;
      }
      return { cardVm: cardVm, listVm: parentVm };
    },
    confirmCardEditSave(type, opItem) {
      this.saveForm(
        "cardEdit",
        opItem,
        (vm) => {
          let vmObj = this.getTargetVm();
          let  cardVm=vmObj.cardVm; //card的实例
          cardVm.isEdit = false;
          let parentVm = vmObj.listVm; //jsgrid,pageListContainer的实例
          if (parentVm&&parentVm.config&&parentVm.config.ControlCode == "UcPageListContainer") {
            parentVm.page = 1;
            parentVm.listSize = 2 * parentVm.page * parentVm.rows;
            parentVm.oldDataList = [];
            parentVm.getDataList("", true);
          } else if (parentVm&&parentVm.config&&parentVm.config.ControlCode == "UcJsGridContainer") {
            parentVm.getData();
          } else {
            cardVm.getFormData();
          }
          let refreshContainerIds = opItem.ControlProperty.refreshContainerIds;
          if (refreshContainerIds) {
            updateIds = refreshContainerIds.split(",");
            updateIds.forEach((targetId) => {
              pageContext[targetId] && pageContext[targetId].getData && pageContext[targetId].getData();
            });
          }
        },
        pageContext.root.config.pValueSet,
      );
    },
    confirmCardEditCancel(type, opItem) {
      let parentVm = this.$parent;
      if (parentVm && parentVm.config.ControlCode == "UcCardContainer") {
        parentVm.isEdit = false;
        let temp = erowConfig.deepClone(parentVm.cardFormData);
        Object.keys(parentVm.detailData).forEach((id) => {
          if (parentVm.fieldMap[id] && erowConfig.hasProp(temp, parentVm.fieldMap[id])) {
            parentVm.detailData[id] = temp[parentVm.fieldMap[id]];
          }
        });
      }
    },
    getBtnText(opItem) {
      let DataField = opItem && opItem.ControlProperty.DataField ? opItem.ControlProperty.DataField : "";
      if (DataField) {
        let _formPrimaryData = this.config._formPrimaryData;
        if (erowConfig.hasProp(_formPrimaryData, DataField)) {
          return _formPrimaryData[DataField];
        }
        if (opItem.ControlProperty.RelativeContainer) {
          let refVm = pageContext[opItem.ControlProperty.RelativeContainer];
          if (refVm && erowConfig.hasProp(refVm.initData, DataField)) {
            return refVm.initData[DataField];
          }
        }
      }
      return opItem.ControlProperty.RSValue;
    },
    handleEditCancel(type, opItem) {
      if (this.currentLayer) {
        pageContext.root.removeLayer(this.currentLayer);
      } else {
        type = "VIEW";
        this.getConfig(type, opItem);
      }
    },
    getOpList(opList, controlID, ctnrUID) {
      let RelativeContainer = this.config.ControlProperty.RelativeContainer;
      if (this.config.pageMode !== "ADD" && RelativeContainer) {
        const relativeContainerVm = window.pageContext[RelativeContainer];
        if (relativeContainerVm) {
          let oplist2 = relativeContainerVm.initData && relativeContainerVm.initData.RowRights ? relativeContainerVm.initData.RowRights : [];

          this.handleAfterGetOpList({
            controlID: controlID ? controlID : RelativeContainer,
            opList: opList ? opList : oplist2.join(","),
            ctnrUID: ctnrUID ? ctnrUID : RelativeContainer,
          });
        } else {
          this.opList =
            erowConfig.deepClone(
              this.config.ChildContainers.filter((item) => {
                return !erowConfig.hasProp(item.ControlProperty, "RelateOpCode");
              }),
            ) || [];
        }
      } else {
        this.opList = this.config.ChildContainers || [];
      }
    },
    //取消提交
    handleUndoSubmit(type, opItem, callBack) {
      let ID = opItem.ControlProperty.ID;
      this.buttonClicks[ID] = true;
      erRequest.post(
        erowplatformBackendUrl + "/workflow/unDoSubmit",
        {
          pValueSet: this.config.pValueSet,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            this.$toast.success({
              message: "取消提交成功",
              type: "success",
            });
            if (callBack) {
              this.buttonClicks[ID] = false;
              callBack(this);
            } else {
              this.getConfig("VIEW", null, () => {
                this.buttonClicks[ID] = false;
              });
            }
          } else {
            this.buttonClicks[ID] = false;
            this.$toast.fail(res.msg);
          }
        },
        (error) => {
          console.log(error);
          this.buttonClicks[ID] = false;
          this.$toast.fail(error.msg);
        },
      );
    },
    //重新修改
    handleReEDit(type, opItem) {
      this.$dialog
        .confirm({
          title: "系统消息",
          message: "确定要重新修改吗？",
        })
        .then((res) => {
          let ID = opItem.ControlProperty.ID;
          this.buttonClicks[ID] = true;
          erRequest.post(
            erowplatformBackendUrl + "/workflow/wfGoToStep",
            {
              pValueSet: this.config.pValueSet,
              remark: "重新修改",
              toStepId: this.config.ReEditToStepId || 3,
              currentStepId: pageContext.WorkFlowList.currentWork.from_step_id,
            },
            (res) => {
              if (res.code == "SUCCESS") {
                this.getConfig("VIEW", null, () => {
                  this.buttonClicks[ID] = false;
                });
              } else {
                this.buttonClicks[ID] = false;
                this.$toast.fail(res.msg);
              }
            },
            (error) => {
              console.log(error);
              this.buttonClicks[ID] = false;
              this.$toast.fail(error.msg);
            },
          );
        });
    },
    submitWorkFlow(type, opItem) {
      let ID = opItem.ControlProperty.ID;
      this.buttonClicks[ID] = true;
      this.$toast.loading("提交中");
      erRequest.post(
        erowplatformBackendUrl + "/workflow/doSubmit",
        {
          operations: "SUBMIT",
          remark: "",
          pValueSet: this.config.pValueSet,
          stepId: 1,
        },
        (res) => {
          this.$toast.clear();
          if (res.code == "SUCCESS") {
            let msg= "提交成功";
            if(opItem.ControlProperty.SuccessMessage){
              msg= opItem.ControlProperty.SuccessMessage;
            }
            this.$toast.success({
              message: msg,
              type: "success",
            });
            this.getConfig("VIEW", null, () => {
              this.buttonClicks[ID] = false;
            });
          } else {
            this.buttonClicks[ID] = false;
            this.$toast.fail(res.msg);
          }
        },
        (error) => {
          this.$toast.clear();
          this.buttonClicks[ID] = false;
          console.log(error);
          this.$toast.fail(error.msg);
        },
      );
    },
    getConfig(type, opItem, callback) {
      let ID = opItem ? opItem.ControlProperty.ID : null;
      if (ID) {
        this.buttonClicks[ID] = true;
      }
      if (type == "ADD" && opItem.ControlProperty.DialogActionCtnrGuid) {
        pageManager.push("./detail.html", {
          menu_row_guid: this.config.menuRowGuid,
          menuConfigKey: this.config.menuConfigKey,
          controlGUID: opItem.ControlProperty.DialogActionCtnrGuid,
          pageMode: type,
        });
        return;
      }
      const mode = type == "EDITCANCEL" ? "VIEW" : type;
      const params = {
        menuRowGuid: this.config.menuRowGuid,
        controlGUID: pageContext.root.config.ControlGUID,
        pageMode: type ? type : "VIEW",
        pValueSet: pageContext.root.config.pValueSet,
      };
      apis.sysLoadConfigData({
        vm: this,
        params,
        success: (res) => {
          let initData = res.data;
          let temp = {
            pValueSet: params.pValueSet,
            menuRowGuid: params.menuRowGuid,
            menuConfigKey: pageContext.root.config.menuConfigKey,
            pageMode: mode,
          };
          if (mode != "ADD") {
            temp.keyValue = pageContext.root.keyValue || pageContext.root._keyValue;
          }
          if (!erowConfig.hasProp(initData, ["ClientClass", "CssClass"])) {
            temp.CssClass = "detailContainer";
          }
          if (Array.isArray(this.$root.config.ChildContainers)) {
            this.$root.config.ChildContainers = [];
          }
          pageManager.updateParams(pageManager.pages.length - 1, {
            pageMode: mode,
            keyValue: temp.keyValue,
          });
          this.$root.config = {};
          window.pageContext = {};
          window.pageContext.root = this.$root;

          let url = window.location.href;
          url = url.split("#");
          window.location.replace(url[0]);

          this.$nextTick(() => {
            this.$root.config = Object.assign(initData, temp);
          });

          if (ID) {
            this.buttonClicks[ID] = false;
          }
          callback();
        },
        fail: (error) => {
          console.log(error);
          if (ID) {
            this.buttonClicks[ID] = false;
          }
          this.$toast.fail(error.msg);
        },
        error: (error) => {
          console.log(error);
          if (ID) {
            this.buttonClicks[ID] = false;
          }
          this.$toast.fail(error.msg);
        },
      });
    },
    closeForm() {
      pageManager.back();
    },
    //获取关联容器的数据
    getRelativeContainerParams() {
      if (this.config.ControlProperty.RelativeContainer) {
        let refContainer = pageContext[this.config.ControlProperty.RelativeContainer];
        if (refContainer) {
          this.config.keyValue = refContainer.config.keyValue;
          if (refContainer.config.ControlCode == "UcPageListContainer") {
            if (refContainer.isMutiCheck || refContainer.isRadioCheck) {
              return refContainer.initDataList.filter((item) => {
                // return refContainer.dataList.filter((item) => {
                return item.checked;
              });
            }
            return refContainer.initDataList;
          } else if (refContainer.config.ControlCode == "UcFormDetailView") {
            return refContainer.cardFormData || refContainer.initData;
          } else if (refContainer.config.ControlCode == "UcJsGridContainer") {
            return refContainer.listData;
          } else if (refContainer.config.ControlCode == "UcDataListContainer") {
            return refContainer.formList;
          } else if (this.config.ControlProperty.IsFromTreeNode) {
            //处理UcGridviewContainer以及UcTreeNodeContainer点击节点获取相关参数的逻辑
            return this.initData;
          } else if (refContainer.config.ControlCode == "UcGridviewContainer") {
            if (refContainer.multiSelect) {
              return refContainer.mutiSelections;
            }
          }
        }
      }
    },
    saveAndSubmit(type, opItem) {
      this.saveForm(type, opItem, function (vm) {
        vm.submitWorkFlow(type, opItem);
      });
    },
    saveAndToDetail(type, opItem) {
      let _this = this;
      this.saveForm(type, opItem, function (vm, containerparams, result) {
        let DialogActionCtnrUID = opItem.ControlProperty.DialogActionCtnrUID;
        let actionCtnrUIDArr = DialogActionCtnrUID.split(".");
        let DialogActionCtnrGuid = opItem.ControlProperty.DialogActionCtnrGuid;
        let defaultNum = 2;
        if (_this.currentLayer) {
          defaultNum = 1;
        }
        pageManager.push("./detail.html", {
          menu_row_guid: vm.config.menuRowGuid || vm.$root.config.menuRowGuid,
          menuConfigKey: vm.config.menuConfigKey || vm.$root.config.menuConfigKey,
          controlGUID: DialogActionCtnrGuid,
          CtnrUID: actionCtnrUIDArr[2] || "",
          pValueSet: erowConfig.generateUUID(),
          pageMode: actionCtnrUIDArr[3] || "VIEW",
          keyValue: result.keyValue,
          fnCode: actionCtnrUIDArr[0] || "",
          fnParameter: actionCtnrUIDArr[1] || "",
          detailData: {},
          commonPValueSet: vm.config.pValueSet,
          searchParams: {},
          check_keyValues: [],
          lastPageIndex: pageManager.pages.length - defaultNum,
        });
      });
    },
    saveAndBack(type, opItem) {
      let _this = this;
      this.saveForm(type, opItem, function (vm, containerparams, result) {
        pageManager.back();
      });
    },
    saveForm(type, opItem, callback, commonPValueSet) {
      let _this = this;
      let mode = type.indexOf("ADDSAVE") !== -1 ? "ADD" : "EDIT";
      let containerparams = {};
      if (type != "cardEdit") {
        if (this.currentLayer) {
          let CtnrUID = this.currentLayer.ControlProperty.CtnrUID;
          containerparams = this.getParams(type, pageContext[CtnrUID].$refs.UcContainer.childContainers, pageContext[CtnrUID].$refs.UcContainer, {});
        } else {
          containerparams = this.getParams(type, pageContext.root.$refs["UcContainer"].childContainers, pageContext.root.$refs["UcContainer"], {});
        }
        if (window.fileCtnr && window.fileCtnr.length) {
          let tempItem = window.fileCtnr.find((item) => {
            return item.rootControlGuid == this.config.rootControlGuid;
          });
          if (tempItem) {
            let targetFileVm = pageContext[tempItem.CtnrUID];
            let IsRequired =
              (targetFileVm && targetFileVm.uploaderConfig && targetFileVm.uploaderConfig.ControlProperty.IsRequired) || targetFileVm.config.ControlProperty.IsRequired;
            if (IsRequired == "true" && !targetFileVm.allFileList.length) {
              this.$toast.fail("请上传文件");
              return;
            }
          }
        }
        if (window.cardFileCtnr && window.cardFileCtnr.length) {
          let fileCtnrs = window.cardFileCtnr.filter(item=>item.rootControlGuid == this.config.rootControlGuid)
          if(fileCtnrs.length){
            for(let index = 0; index < fileCtnrs.length; index++){
              let tempItem = fileCtnrs[index]
              if(tempItem && pageContext[tempItem.CtnrUID]){
                let targetFileVm = pageContext[tempItem.CtnrUID]
                let IsRequired = targetFileVm.config.IsRequired || targetFileVm.config.is_required || targetFileVm.config.ControlProperty?.IsRequired || targetFileVm.config.ControlProperty?.is_required
                if(IsRequired){
                  IsRequired = IsRequired.toLowerCase() == "true"? true: false
                }
                if(IsRequired && !targetFileVm.allFileList.length){
                  return this.$toast.fail(`请上传${targetFileVm.config.ControlProperty.folder_name || ""}文件`);
                }
              }
            }
          }
        }
      } else {
        let parentVm = this.$parent;
        let num = erowConfig.validateForm(parentVm.detailData, parentVm.rulesById);
        let temp = {
          [parentVm.config.ControlProperty.ID]: parentVm.detailData,
        };
        if (num) {
          return;
        }
        containerparams = { paramMap: temp, controlGuids: this.$parent.config.ControlGUID };
      }

      if (containerparams.errorCount) {
        this.errorCount = 0;
        return;
      }
      //是否有特殊函数
      if (opItem.ControlProperty.ClientAction) {
        const actions = JSON.parse(opItem.ControlProperty.ClientAction);
        if (erowConfig.hasProp(actions, "SAVE")) {
          let fun = actions["SAVE"];
          if (erowConfig.hasProp(baseSpecial, fun)) {
            baseSpecial[fun](
              {
                configItem: opItem,
                data: containerparams,
              },
              this,
            );
          } else {
            erowSpecial[fun](
              {
                configItem: opItem,
                data: containerparams,
              },
              this,
            );
          }
          return;
        }
      }
      this.$toast.loading("保存中~");
      let params = {
        menuRowGuid: this.config.menuRowGuid,
        controlGUID: containerparams.controlGuids,
        pageMode: mode,
        paramMap: containerparams.paramMap,
      };
      if (commonPValueSet) {
        params["commonPValueSet"] = commonPValueSet;
        params["pValueSet"] = erowConfig.generateUUID();
      } else {
        params["pValueSet"] = pageContext.root.config.pValueSet;
      }
      let url = erowplatformBackendUrl + "/appBaseApi/sysDataAction";
      erRequest.post(
        url,
        params,
        (res) => {
          this.$toast.clear();
          if (res.code == "SUCCESS") {
            this.handleAfterSave(res, containerparams, callback, type, mode, opItem);
          } else {
            this.$toast.fail(res.msg);
          }
        },
        (error) => {
          this.$toast.clear();
          this.$toast.fail(error.msg);
        },
      );
    },
    async uploadRelativeFile(res) {
      const _this = this;
      const errorList = [];
      const rootControlGuid = this.config.rootControlGuid;
      if (!window.fileCtnr?.length && !window.cardFileCtnr?.length) {
        return 1;
      }
      const buildCompareStr = (config) =>
        `${config.FnCode}.${config.FnParameter}.${config.CtnrUID}`.toLowerCase();

      const taskFactories = [];

      const processCtnrs = (ctnrList, startIndex = 0) => {
        ctnrList.forEach((tempItem, idx) => {
          const globalIndex = startIndex + idx;
          const fileVm = pageContext[tempItem.CtnrUID];
          if (!fileVm) return;

          const uploadRef = fileVm.$refs.uploadRef;
          if (!uploadRef) return;

          const relativeContainerCtnr =
            uploadRef.config.ControlProperty.RelativeContainer;
          if (!relativeContainerCtnr) return;

          const relativeContainer = pageContext[relativeContainerCtnr];
          if (!relativeContainer) return;

          const compareStr = buildCompareStr(relativeContainer.config);
          if (!res.data.hasOwnProperty(compareStr)) return;

          // UcFormDetailView 数据回填
          if (relativeContainer.config.ControlCode === "UcFormDetailView") {
            const returnFormData = res.data[compareStr][0];
            Object.keys(returnFormData).forEach((key) => {
              relativeContainer.realFieldData[key] = returnFormData[key];
            });
          }

          const instance_guid =
            relativeContainer.realFieldData[
              uploadRef.config.ControlProperty.RelativeKeyField
            ];

          if (!instance_guid) return;

          taskFactories.push(() => {
            return uploadRef
              .uploadAllFileWhenADD(instance_guid)
              .then((uploadRes) => {
                // uploadRes: success / eror / noFile / 2
                if (uploadRes === "eror") {
                  errorList.push({
                    index: globalIndex,
                    ctnrUID: tempItem.CtnrUID
                  });
                }
                return uploadRes;
              });
          });
        });
      };

      const fileCtnrs = (window.fileCtnr || []).filter(
        (item) => item.rootControlGuid === rootControlGuid
      );
      const cardFileCtnrs = (window.cardFileCtnr || []).filter(
        (item) => item.rootControlGuid === rootControlGuid
      );

      processCtnrs(fileCtnrs, 0);
      processCtnrs(cardFileCtnrs, fileCtnrs.length);

      if (!taskFactories.length) {
        return 1;
      }

      _this.$toast.loading({
        message: "文件上传中，请稍等...",
        forbidClick: true,
        duration: 0
      });

      try {
        const concurrency = this.config.uploadConcurrency || 3;
        await baseSpecial.limitRequest(taskFactories, concurrency);

        if (errorList.length) {
          _this.$toast({
            message: "文件上传完成，部分文件上传失败！",
            type: "error"
          });
          console.warn("上传失败列表：", errorList);
        } else {
          _this.$toast({
            message: "文件上传完成",
            type: "success"
          });
        }
      } catch (err) {
        console.error("uploadRelativeFile 异常：", err);
        _this.$toast({
          message: "文件上传异常",
          type: "error"
        });
      } finally {
        _this.$toast.clear();
      }

      return 1;
    },
    async handleAfterSave(res, containerparams, callback, type, mode, opItem) {
      let _this = this;
      if (_this.currentLayer) {
        if (mode === "ADD") {
          await this.uploadRelativeFile(res);
        }
        if (callback) {
          callback(_this, containerparams, res.data);
        }
        pageContext.root.removeLayer(_this.currentLayer);
        let refreshContainerIds = opItem.ControlProperty.refreshContainerIds;
        if (refreshContainerIds) {
          updateIds = refreshContainerIds.split(",") || [];
          updateIds.forEach((targetId) => {
            pageContext[targetId].getData && pageContext[targetId].getData();
          });
        }
      } else {
        if (type != "cardEdit") {
          pageContext.root._keyValue = res.data.keyValue;
        }
        if (mode === "ADD") {
          pageContext.root.keyValue = res.data.keyValue;
          await this.uploadRelativeFile(res);
        }
        if (callback) {
          callback(_this, containerparams, res.data);
        } else {
          this.getConfig("VIEW");
        }
      }
    },
    beginEdit() {
      this.getConfig("EDIT");
    },
    handleAfterGetOpList(optionInfo) {
      let RelativeContainer = this.config.ControlProperty.RelativeContainer;
      if (RelativeContainer && (RelativeContainer == optionInfo.controlID || RelativeContainer == optionInfo.ctnrUID)) {
        const opCodeList = optionInfo.opList ? optionInfo.opList.split(",") : [];
        const relativeContainerData = pageContext[this.config.ControlProperty.RelativeContainer].initData;
        //未配置RelateOpCode属性，则默认显示
        this.opList = this.config.ChildContainers.filter((op) => {
          return (
            opCodeList.includes(op.ControlProperty.RelateOpCode) ||
            (op.ControlProperty.IsCustom && op.ControlProperty.IsCustom.toLowerCase() == "true") ||
            !erowConfig.hasProp(op.ControlProperty, "RelateOpCode")
          );
        });
        this.opList = this.opList.filter((op) => {
          let flag = this.getVisible(op, relativeContainerData);
          return flag;
        });
      }
    },
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
  computed: {
    isInTopContainer(){
      //是否处于最外层容器
     if(pageContext.root.$refs.UcContainer){
       let childContainers=pageContext.root.$refs.UcContainer.childContainers||[];
       return childContainers.filter(item=>item.ControlGUID==this.config.ControlGUID).length>0
     }else{
      return false
     }
    },
    debounceTime() {
      let DelayTime = this.config.ControlProperty.DelayTime;
      return !isNaN(Number(DelayTime)) ? Number(DelayTime) * 1000 : 2000;
    },
    currentLayer() {
      let layerConfigArr = pageContext.root.layerConfigArr || [];
      let layer = layerConfigArr.find((item) => {
        return item.ControlGUID == this.config.rootControlGuid;
      });
      return layer;
    },
    isShowSave() {
      if (this.config) {
        if (this.config.pageMode == "ADD") {
          return true;
        }
        return false;
      }
      return false;
    },
    isEdit() {
      if (this.config) {
        if (this.config.pageMode == "EDIT") {
          return true;
        }
        return false;
      }
      return false;
    },
    getShowOpList() {
      let data = null;
      //
      if (this.config.ControlProperty.RelativeContainer && pageContext[this.config.ControlProperty.RelativeContainer]) {
        data = pageContext[this.config.ControlProperty.RelativeContainer].initData;
      }
      let result = this.opList.filter((item) => {
        let actionName = item.ControlProperty.OnClientClick;
        if (this.editBtns.includes(actionName)) {
          let flag1 = this.isShowOp(item, data);
          let flag2 = true;
          //编辑
          if (this.beginEditBtn.includes(actionName) && this.cardedit) {
            flag2 = false;
          }
          //保存取消
          if (!this.beginEditBtn.includes(actionName) && !this.cardedit) {
            flag2 = false;
          }
          return flag1 && flag2;
        } else {
          let flag1 = this.isShowOp(item, data);
          let flag2 = this.getVisible(item, data);
          return flag1 && flag2;
        }
      });
      if(this.extraButtons.length) {
        result = result.concat(this.extraButtons);
      }
      let saveIndex = -1;
      let cancelIndex = -1;
      for (let i = 0; i < result.length; i++) {
        let text = this.getBtnText(result[i]);
        if (text === "保存" && saveIndex === -1) {
          saveIndex = i;
        }
        if (text === "取消" && cancelIndex === -1) {
          cancelIndex = i;
        }
      }
      if (saveIndex !== -1 && cancelIndex !== -1 && saveIndex < cancelIndex) {
        let temp = result[saveIndex];
        result[saveIndex] = result[cancelIndex];
        result[cancelIndex] = temp;
      }
      return result;
    },
    keyName() {
      if (this.config.ControlProperty.RelativeContainer && pageContext[this.config.ControlProperty.RelativeContainer]) {
        return pageContext[this.config.ControlProperty.RelativeContainer].keyName;
      }
      return this.detailData ? this.detailData.keyName : this.config.keyValue;
    },
  },
  mounted() {
    this.$nextTick(() => {
      var isLoadScript = false;
      if (erowConfig.hasProp(this.config, "ChildContainers")) {
        for (var i = 0; i < this.config.ChildContainers.length; i++) {
          var item = this.config.ChildContainers[i];
          if (item.ControlProperty.OnClientClick) {
            isLoadScript = true;
            break;
          }
        }
      }

      // if (isLoadScript) this.loadScript("../special/" + this.config.ControlProperty.FnCode + ".js");
    });
    if(this.config.IsFooter)  {
      eventEmitter.on("addButtonFromWorkFlow", (buttonConfig) => {
        // this.extraButtons.push(buttonConfig);
          this.extraButtons.push(buttonConfig);
      }, {ctnrUID: this.config.ctnrUID});
    }
  },
  watch: {
    config: {
      handler(newVal, oldVal) {
        // 监听config._formPrimaryData的变化，如果变化了，则重新触发getShowOpList，处理深层次监听不到异常问题
        if (newVal._formPrimaryData) {
          this.opList = [...this.opList];
        }
      },
      deep: true,
      immediate: true,
    },
  },
};
