var dynamicMixin = {
  data: function () {
    return {
      dycontroldata: {},
      gridControl: ["UcGridviewContainer", "UcJsGridContainer"],
    };
  },
  methods: {
    async runAsyncTasks(tasks) {
      const results = [];

      for (const task of tasks) {
        const result = await task();
        results.push(result);
      }
      return results;
    },
    getFieldData(item) {
      let temp = {};
      Object.keys(item).forEach((key) => {
        if (!["RowRights", "controls"].includes(key)) temp[key] = item[key];
      });
      return temp;
    },
    getSingleOptionData(params) {
      return new Promise((resolve) => {
        erRequest.post(
          `${erowplatformBackendUrl}/appBaseApi/sysLoadControlData`,
          params,
          (res) => {
            if (res.code == "SUCCESS") {
              Object.keys(res.data).forEach((key) => {
                if (!this.dycontroldata[key]) {
                  this.$set(this.dycontroldata, key, res.data[key]);
                } else {
                  Object.assign(this.dycontroldata[key], res.data[key]);
                }
              });
              resolve();
            } else {
              this.$message("error", res.msg);
              resolve();
            }
          },
          (error) => {
            this.$toast.fail(error.msg);
            resolve();
          }
        );
      });
    },
    buildTotalObj(arr, rowItem, rIndex, total) {
      let optionControl = ["UcDropDownList", "UcCheckBoxList", "UcRadioButtonList"];
      arr.forEach((dyControlItem) => {
        let children = dyControlItem.ControlPropertys || dyControlItem.ChildContainers;
        if (children.length) {
          let currentControl = children.find((controlItem) => {
            return controlItem.ControlProperty.ViewType == rowItem[dyControlItem.ControlProperty.TypeField];
          });
          if (currentControl && optionControl.includes(currentControl.ControlCode)) {
            let temp = {};
            temp[dyControlItem.ID + "_" + rIndex] = rowItem;
            if (!total[dyControlItem.ID]) {
              total[dyControlItem.ID] = [];
              total[dyControlItem.ID].push(temp);
            } else {
              total[dyControlItem.ID].push(temp);
            }
          }
        }
      });
      return total;
    },
    getOptionsData() {
      let _this = this;
      let total = {};

      if (this.config.ControlCode == "UcFormDetailView") {
        this.buildTotalObj(this.dynamicComponent, _this.containerdata, 0, total);
      }

      if (this.gridControl.includes(this.config.ControlCode)) {
        this.dataArr.dataList.forEach((item, index) => {
          let temp = _this.getFieldData(item);
          this.buildTotalObj(this.dynamicComponent, temp, index, total);
        });
      }

      //多个动态组件分开请求
      let finial = {};

      Object.keys(total).forEach((key) => {
        for (let i = 0; i < Math.ceil(total[key].length / 6); i++) {
          if (!finial[key]) {
            finial[key] = [total[key].slice(i * 6, (i + 1) * 6)]; //每六个为一组
          } else {
            finial[key].push(total[key].slice(i * 6, (i + 1) * 6));
          }
        }
      });
      let allRequest = [];
      if (Object.keys(finial).length) {
        Object.keys(finial).forEach((key) => {
          finial[key].forEach((item) => {
            let temp = {};
            temp[key] = item;
            temp["subControlId"] = key;
            let params = {
              controlGUID: _this.config.ControlGUID,
              pValueSet: _this.config.pValueSet,
              paramMap: temp,
              pageMode: _this.config.pageMode || "VIEW",
              menuRowGuid: _this.config.menuRowGuid,
            };
            allRequest.push(() => _this.getSingleOptionData(params));
          });
        });
      }
      if (allRequest.length) {
        this.runAsyncTasks(allRequest).then((res) => {});
      }
    },
  },
  computed: {
    dynamicComponent() {
      let _this = this;
      let formContainer = ["UcFormDetailView"];

      if (formContainer.includes(this.config.ControlCode)) {
        let childContainers = [];
        Object.keys(_this.childContainers).forEach((key) => {
          _this.childContainers[key].forEach((item) => {
            childContainers.push(item);
          });
        });
        return childContainers.filter((item) => {
          return item.ControlCode == "UcDynamicComponent";
        });
      } else {
        return this.childContainers.filter((item) => {
          return item.ControlCode == "UcDynamicComponent";
        });
      }
    },
  },
};
