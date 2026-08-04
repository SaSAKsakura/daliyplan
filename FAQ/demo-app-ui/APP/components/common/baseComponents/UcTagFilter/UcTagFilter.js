let UcTagFilter = {
  template: `<div class="UcTagFilter">
     <div class="wrap-tags"v-if="wrapTag&&config.ControlProperty.IsExpand!=='flase'">
            <div class="head-tag" style="background-color: #fff"  @click="wrapTag=!wrapTag">全部({{sourceList.length}})<img src="../assets/images/common/open-icon.png" alt=""></div>
            <div v-for="(dataItem,index) in sourceList" :key="index" class="head-tag" :class="getActiveClass(dataItem)"  @click="handleTagClick(dataItem,index,config)">
            {{getTitle(dataItem,config)}}
            </div>
            </div>
          <div class="head-tags"v-if="!wrapTag" >
            <div class="head-tag open-switch"  @click="wrapTag=!wrapTag">全部({{sourceList.length}})<img src="../assets/images/common/open-icon.png" alt="" style="transform: rotate(180deg);"></div>
            <div v-for="(dataItem,index) in sourceList" :key="index"  class="head-tag"  :class="getActiveClass(dataItem)" :style="{marginLeft:index==0?sourceList.length>9?'100px':'95px':''}"  @click="handleTagClick(dataItem,index,config)">
            {{getTitle(dataItem,config)}}
            </div>
            </div>
  </div>`,
  name: "UcTagFilter",
  props: {
    config: Object,
    initDataList: {
      type: Array,
      default: () => [],
    },
    type: String,
  },
  data() {
    return {
      wrapTag: false,
      oldIndex: 0,
      sourceList: [],
      headSourceNumObj: {},
      currentValue: null,
    };
  },
  computed: {
    cacheKey() {
      return "tempSearch_uctag_" + this.config.ControlProperty.ID;
    },
  },
  watch: {
    initDataList: {
      handler(newValue, oldValue) {
        this.getNum("new", newValue.length == oldValue.length);
      },
      deep: true,
    },
  },
  methods: {
    getActiveClass(dataItem) {
      return dataItem.value == this.currentValue ? "head-search-active" : "";
    },
    getTitle(dataItem, controlItem) {
      if (controlItem.ControlProperty.IsComputeCount && controlItem.ControlProperty.IsComputeCount.toLowerCase() == "false") {
        return dataItem.text;
      } else {
        return dataItem.text + "(" + this.headSourceNumObj[dataItem.computedNumField || dataItem.computednumfield] + ")";
      }
    },
    handleTagClick(data, index, contorl) {
      if (contorl.ControlProperty && contorl.ControlProperty.IsFuzzyQuery) {
        this.isFuzzyQuery = contorl.ControlProperty.IsFuzzyQuery == "true" ? true : false;
      }
      this.$nextTick(() => {
        if (this.currentValue == data.value) {
          if (this.type == "grid") {
            this.$emit("filterData", this.initDataList, false);
          } else {
            this.$emit("filterData", contorl.ControlProperty.DataField, "all", false);
          }
          this.currentValue = null;
          localStorage.removeItem(this.cacheKey);
        } else {
          if (this.type == "grid") {
            let dataList = this.initDataList.filter((item) => {
              if (item[this.config.ControlProperty.DataField] == data.value) {
                return true;
              }
            });
            this.$emit("filterData", dataList, true);
          } else {
            this.$emit("filterData", contorl.ControlProperty.DataField, data.value, true);
          }
          this.currentValue = data.value;
          this.oldIndex = index;
          localStorage.setItem(this.cacheKey, this.currentValue);
        }

        this.wrapTag = false;
      });
    },
    filterData(currentDataList, filterObj) {
      let arr = currentDataList;
      let queryObj = filterObj;
      Object.keys(queryObj).forEach((key) => {
        let tempArr = ["All", "ALL", "all"];
        if (queryObj[key] == undefined || queryObj[key] == "" || queryObj[key] == "0" || tempArr.includes(queryObj[key])) return arr;
        arr = arr.filter((p) => p[key] === null || p[key] == queryObj[key]);
      });
      return arr;
    },
    getNum(type, flag) {
      let _this = this;
      let cacheData = localStorage.getItem(this.cacheKey);
      if (cacheData) {
        this.currentValue = cacheData;
      }
      let sourceList = _this.sourceList || _this.config.ControlProperty.DataSourceList;
      if (!sourceList.length || type == "new") {
        let tagParams = [];
        const uniqueValues = new Set();
        _this.initDataList.forEach((item) => {
          const value = item[_this.config.ControlProperty.DataField];
          if (!uniqueValues.has(value)) {
            uniqueValues.add(value);
            tagParams.push({
              text: value,
              value: value,
            });
          }
        });
        tagParams.forEach((item, index) => {
          item.computednumfield = "tab" + index;
        });
        _this.sourceList = tagParams;
        sourceList = tagParams;
      }
      let searchObj = {};
      sourceList.forEach((dataItem) => {
        searchObj[_this.config.ControlProperty.DataField] = dataItem.value;
        let tempArr = _this.filterData(_this.initDataList, searchObj);
        _this.$set(_this.headSourceNumObj, dataItem.computedNumField || dataItem.computednumfield, tempArr.length);
      });
      let sortedArray = Object.entries(_this.headSourceNumObj).sort((a, b) => b[1] - a[1]);
      // 创建一个映射，记录每个 computednumfield 的排序位置
      const orderMap = new Map(sortedArray.map(([key], index) => [key, index]));

      // 进行排序，依据  computednumfield 的顺序
      const sortedList = [...sourceList].sort((a, b) => {
        return orderMap.get(a.computednumfield) - orderMap.get(b.computednumfield);
      });
      _this.sourceList = sortedList;
      //如果当前选择项不为空且数据和之前不一致
      if (this.currentValue != null) {
        let index = this.sourceList.findIndex((item) => item.value == this.currentValue);
        if (index != -1) {
          //this.handleTagClick(this.sourceList[index], index, this.config);
          if (this.type == "grid") {
            let dataList = this.initDataList.filter((item) => {
              if (item[this.config.ControlProperty.DataField] == this.currentValue) {
                return true;
              }
            });
            this.$emit("filterData", dataList, true);
          } else {
            this.$emit("filterData", this.config.ControlProperty.DataField, this.currentValue, true);
          }
        } else {
          this.currentValue = null;
          this.$emit("filterData", this.config.ControlProperty.DataField, "all", false);
        }
      }
    },
    async getSourceData() {
      if (this.config.ControlProperty.DataSourceConfig && this.config.ControlProperty.DataSourceCtnrUID) {
        let sourceVm = this.$parent;
        await apis.sysLoadControlData({
          vm: sourceVm,
          params: {
            menuRowGuid: sourceVm.config.menuRowGuid || "",
            controlGUID: sourceVm.config.ControlGUID,
            // subControlGUID: this.config.ChildContainers[1].ControlGUID,
            pageMode: sourceVm.config.pageMode || "view",
            pValueSet: sourceVm.config.pValueSet || erowConfig.generateUUID(),
            nonce: Date.now(),
          },
          success: (res) => {
            if (res.code == "SUCCESS") {
              this.sourceList = res.data[this.config.ControlProperty.ID].dataList;
              this.getNum();
            }
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
      } else {
        this.getNum();
      }
    },
  },
  created() {
    this.getSourceData();
  },
  mounted() {},
};
