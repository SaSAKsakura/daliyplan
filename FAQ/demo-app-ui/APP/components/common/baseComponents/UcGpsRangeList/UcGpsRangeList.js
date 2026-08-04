var UcGpsRangeList = {
  name: "UcGpsRangeList",
  mixins: [commonMinxin],
  // template: `
  //   <van-checkbox-group   class='ucGpsRangeList' :style="style" :class="activeClass(config)" :disabled="disabled" v-model="checks" @change="handleChange">
  //     <van-checkbox v-for="item in itemList" :name="String(item[config.ControlProperty.DataValueField])" :key="item[config.ControlProperty.DataValueField]">
  //       <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
  //       {{ item[config.ControlProperty.DataTextField] }}
  //     </van-checkbox>
  //   </van-checkbox-group>
  //   `,
  components: {
    "form-multiple-select": FormMultipleSelect,
  },
  template: `
      <form-multiple-select
        :style="style" :class="activeClass(config)"
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        :config="config"
        :value="detailData[config.ControlProperty.ID]"
        :label="getPlaceHolerByConfig(config)"
        :placeholder="getPlaceHolerByConfig(config)"
        :columns="muiltiSelectDataList"
        @confirm="changeSelect"
        :isShowSearch="false"
        :isShowAll="true"
        popup_max_height="260px"
      ></form-multiple-select>
      `,
  props: {
    config: Object,
    options: Object,
    disabled: Boolean,
    value: String,
    detailData: Object,
    containerdata: Object,
  },
  data: () => ({
    newValue: "",
    itemList: [],
    checks: [],
    callFlag: false,
    icon: {
      active: "../assets/images/icon/checked-true.png",
      normal: "../assets/images/icon/checked-false.png",
    },
  }),
  computed: {
    style() {
      return {
        grid: `auto / repeat(${this.config.ControlProperty.RepeatColumns}, 1fr)`,
      };
    },
    separator() {
      return (this.config && this.config.ControlProperty.Separator) || "|";
    },
    muiltiSelectDataList() {
      return this.itemList.map((item) => {
        return {
          text: item[this.config.ControlProperty.DataTextField || "text"],
          value: item[this.config.ControlProperty.DataValueField || "value"],
        };
      });
    },
  },
  watch: {
    value() {
      !this.callFlag && this.reset();
    },
    options: {
      handler() {
        this.reset();
      },
      immediate: true,
    },
  },
  methods: {
    handleChange(data) {
      this.callFlag = true;
      setTimeout(() => (this.callFlag = false), 0);

      this.$emit("input", this.checks.join(this.separator));
      if (this.config._isLoadedData && data.join(this.separator) !== this.value) {
        this.$nextTick(() => {
          this.handleSpecialFun({}, this.config, this.detailData, "", "change");
        });
      }
    },
    changeSelect(val, num, flag) {
      console.log({val})
      this.containerdata[this.config.ControlProperty.ID] = val.value;
      this.detailData[this.config.ControlProperty.ID] = val.value;
      if (this.config.__sync_data) {
        this.detailData[this.config.__sync_data] = val.text;
      }
      //判断控件联动
      let AutoPostBackActionObj = this.getActionObj(this.config);
      if (erowConfig.hasProp(AutoPostBackActionObj, "ClientAction")) {
        erowConfig.runClientAtction(
          {
            clientAction: AutoPostBackActionObj.ClientAction,
            configItem: this.config,
            val: val.value,
            flag,
          },
          this.$parent
        );
      }
      if (erowConfig.isHasEvent(this.config, "change")) {
        this.handleClientActionsWidthParams({}, this.config, this.containerdata, "", "change");
      }
    },
    reset() {
      if (typeof this.value === "undefined") {
        if (this.options.DefaultValue) {
          this.checks = this.options.DefaultValue.split(this.separator);
        }
      } else if (typeof this.value === "string") {
        this.checks = this.value.split(this.separator).filter((item) => item !== "");
      } else {
        this.checks = this.checks;
      }
      this.itemList = this.options.dataList;
    }
  },
  created() {
    if(!this.config.ControlProperty.Separator){
      this.$set(this.config.ControlProperty,'Separator','|')
    }
  },
};
