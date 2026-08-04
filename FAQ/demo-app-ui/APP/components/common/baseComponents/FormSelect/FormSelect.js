var FormSelect = {
  template: `
    <div>
      <div class="input-text-box" :class="[{'text-pr-32': getIcon()}]">
        <div class="input-text">{{ titleName }}</div>
        <van-field
          readonly
          clickable
          name="picker"
          :reuquired="reuquired"
          :value="newValue"
          :disabled="disabled"
          :rules="rules"
          :right-icon="getIcon()"
          :placeholder="placeholder"
          @click="openPicker"
        />
      </div>
      <!-- 下拉组件 -->
      <van-popup v-model="showPicker" position="bottom" get-container="body">
        <van-picker
          show-toolbar
          :columns="realOptions"
          @confirm="onConfirm"
          @cancel="showPicker = false"
        />
      </van-popup>
    </div>
  `,
  props: {
    config: Object,
    options: Array, //下拉数组
    placeholder: String, //提示
    titleName: String, //标题
    rules: Array, //规则
    disabled: Boolean,
    reuquired: String,
    value: [String, Number], //值
    typeNumber: [String, Number], //父组件显示回显值顺序数字
  },
  data() {
    return {
      newValue: "",
      showPicker: false,
      onload: false,
    };
  },
  inject: {
    formVm: {
      default: () => null,
    },
  },
  computed: {
    realOptions() {
      const temp = [];
      if (this.config.ControlProperty.IsInsertItem && this.config.ControlProperty.IsInsertItem.toUpperCase() == "TRUE") {
        temp.push({
          text: "",
          value: "",
        });
      }
      if(this.config.ControlCode == 'UcDdlWFStepList') {
        this.options.forEach((item) => {
          temp.push({
            text: item.step_name,
            value: item.id,
          });
        });
      } else {
        this.options.forEach((item) => {
          temp.push({
            text: item[this.config.ControlProperty.DataTextField],
            value: item[this.config.ControlProperty.DataValueField],
          });
        });
      }
      return temp;
    },
    isDialog() {
      return this.config.ControlProperty.custom && this.config.ControlProperty.custom === "search";
    },
  },
  methods: {
    getIcon() {
      return this.isDialog ? "search" : "arrow-down";
    },
    //点击确认
    onConfirm(selectObj) {
      this.showPicker = false;
      this.newValue = selectObj.text;
      this.onload = true; // 用户主动选择，阻止 watch.value 重复触发 changeSelect
      this.$emit("changeSelect", selectObj, this.typeNumber); //传递父级
    },
    openPicker() {
      if (!this.disabled) {
        if (this.isDialog) {
          this.openSearchDialog();
        } else {
          this.showPicker = true;
        }
      }
    },
    openSearchDialog() {
      //判断自定义事件
      let _this = this;
      let funName =_this.config.ControlProperty.OnClientClick;
      let searchFuns = ["openSelector", "openMultiSelector"];
      if (funName) {
        if (searchFuns.includes(funName)) {
          let targetVm = _this;
          let rindex=0
          let flag=false
          if (_this.formVm) {
            targetVm = _this.formVm(); //找到所处form、card、scope的this
             flag=targetVm.datafromlist||targetVm.$attrs.datafromlist
            if (targetVm.dataFromGrid ||flag ) {
              //form、card处于pagelist和jsgrid时，找上一级的数据
              rindex=targetVm.$attrs.rindex
            }
          }
          apis.runSpeicalFun({
            vm:flag?targetVm.$parent:targetVm,
            funName,
            params: {
              rowData: targetVm.realFieldData,
              configItem: _this.config,
              rindex:rindex,
              isInGrid:targetVm.dataFromGrid||targetVm.$attrs.dataFromGrid?true:false,//是否在grid
              isInPageList:flag,//card是否在pageList和jsgrid 里面
            },
          });
        } else {
          apis.runSpeicalFun({ vm: _this, funName });
        }

        return;
      }
      const [fnCode, fnParameter, ctnrUID, pageMode] = this.config.ControlProperty.DialogSelectCtnrUID.split(".");
      const controlGUID = this.config.ControlProperty.DialogSelectCtnrGuid;
      let newPvalueSet = erowConfig.generateUUID();
      let commonPvalueset = this.config.pValueSet;
      let parentForm = _this.$parent ? _this.$parent.$parent : null;
      let isInGrid = parentForm && parentForm.dataFromGrid ? true : false;
      let searchParams = {};
      if (this.config.ControlProperty.DialogDefaultSearchFields) {
        let obj = JSON.parse(this.config.ControlProperty.DialogDefaultSearchFields);
        if (this.config.ControlProperty.RelativeContainer) {
          try {
            let refVm = pageContext[this.config.ControlProperty.RelativeContainer];
            if (Array.isArray(obj) && refVm) {
              let list = [];
              if (refVm.config.ControlCode == "UcJsGridContainer") {
                list = refVm.listData;
              }
              if (list.length) {
                obj.forEach((item) => {
                  searchParams[item.targetKey] = list
                    .map((onedata) => {
                      return onedata[item.sourceKey];
                    })
                    .join(",");
                });
              }
            }
          } catch (e) {
            console.log(e);
          }
        } else {
          //未配置关联容器取当前的数据
          if (Array.isArray(obj) && this.$parent && this.$parent.detailData) {
            let parentVm = this.$parent;
            let formData = this.$parent.detailData;
            obj.forEach((item) => {
              let id = "";
              if (parentVm.idMap && parentVm.idMap[item.sourceKey]) {
                id = parentVm.idMap[item.sourceKey];
              }
              searchParams[item.targetKey] = formData[item.sourceKey] || formData[id];
            });
          }
        }
      }
      let defautlConfig = {
        keyValue: "",
        menuConfigKey: this.config.menuConfigKey,
        pValueSet: newPvalueSet,
        menuRowGuid: this.config.menuRowGuid,
        pageMode: "VIEW",
        rootControlGuid: controlGUID,
        commonPValueSet: commonPvalueset,
        searchParams: searchParams,
      };
      if (isInGrid) {
        //如果是grid嵌套form里面的选中组件把当前行的索引，grid的CtnrUID传入，方便更改数据
        defautlConfig["gridCtnrUID"] = parentForm.$parent.config.ControlProperty.CtnrUID;
        defautlConfig["rindex"] = parentForm.$attrs.rindex;
      }
      apis.sysLoadConfigData({
        vm: this,
        params: {
          menuRowGuid: this.config.menuRowGuid || "",
          controlGUID: this.config.ControlProperty.DialogSelectCtnrGuid,
          pageMode: pageMode || "VIEW",
          pValueSet: newPvalueSet,
          commonPValueSet: commonPvalueset,
          keyValue: "",
        },
        success: (res) => {
          pageContext.root.addLayer(Object.assign(defautlConfig, res.data));
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
    },
  },
  created() {},
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.newValue = newVal;
        this.realOptions.forEach((option) => {
          if (newVal!== "" && newVal == option.value) {
            console.log("option", option.text,this.config._isLoadedData);
            this.newValue = option.text;
            if (this.config._isLoadedData && !this.onload) {
              
              this.$emit("changeSelect", option, newVal, "onload"); //传递父级
              this.onload = true;
            }
          }
        });
      },
      immediate: true,
    },
    //监听数组变化，将value重新赋值
    realOptions: {
      handler(newVal, oldVal) {
        console.log("数组变化");
        this.realOptions.forEach((option) => {
          if (this.newValue === option.value) {
            this.newValue = option.text;
          }
        });
      },
      deep: true,
    },
  },
};
