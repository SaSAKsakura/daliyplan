let gridMinxin = {
  data() {
    return {
      defautSearchParams: {},
      scopeControlData: {},
      pageListContainers: [],
      containerDataObj: {},
      selectControl: [],
      initDataList: [],
      filterObj: {},
      headSourceObj: {},
      filterControls: [],
      headSourceNumObj: {},
      selectFieldArr: ["UcWebComboField", "UcDropDownListField", "UcValueSetField", "UcWebComboUserField", "UcJsGridDropDownListField"],
      hideFieldArr: ["UcData", "UcHiddenField", "UcJsGridHiddenField"],
      widthObj: {}, //记录每一列动态设置的宽度
      pageParams: {},
      checkedData: [], //记录当前选中的数据
      disableGetData: false,
    };
  },
  methods: {
    getRowClassName(config, rowData) {
      if (erowConfig.hasProp(config.ControlProperty, "GridRowClass")) {
        return rowData[config.ControlProperty["GridRowClass"]];
      } else if (erowConfig.hasProp(config, "GridRowClass")) {
        return rowData[this.config["GridRowClass"]];
      }
      return "";
    },
    getRelativeRowData(currentRow) {
      let treeNodeField = this.config.TreeNodeField || this.config.ControlProperty.TreeNodeField;
      let treeNodeFieldArr = treeNodeField.split(",");
      let parentField = treeNodeFieldArr.length ? treeNodeFieldArr[1] : "";
      let id = treeNodeFieldArr.length ? treeNodeFieldArr[0] : "";
      let keyVal = currentRow[id];
      let dataList = erowConfig.deepClone(this.listData);
      return erowConfig.getRelativeRowData(keyVal, parentField, dataList);
    },
    getHighlightData(highlightFields, rowData, rIndex, dataList, color) {
      //如果在高亮字段内
      highlightFields.forEach((item) => {
        let textWord = rowData[item.gridRowDataField] + "";

        if (erowConfig.highParamsMap[this.config.ControlProperty.ScopeCtnr]) {
          let inputVal = erowConfig.highParamsMap[this.config.ControlProperty.ScopeCtnr][item.searchParamsField];

          let regText = new RegExp(inputVal, "g");

          let searchRes = "";
          if (inputVal && textWord) {
            searchRes = textWord.replace(regText, (val) => `<span style="color:${color}">${val}</span>`);
          } else {
            searchRes = textWord;
          }
          rowData[item.gridRowDataField] = searchRes;
          dataList.splice(rIndex, 1, rowData);
        }
      });
    },
    handleAfterGetData() {
      let _this = this;
      Array.isArray(this.initDataList) &&
        _this.selectControl.forEach((controlItem) => {
          let temp = [];
          _this.initDataList.forEach((dataItem) => {
            let val = dataItem[controlItem.ControlProperty.DataField];
            if (val) {
              if (!temp.includes(val)) {
                temp.push(val);
              }
            }
          });
          temp = temp.map((item) => {
            return {
              text: item,
              value: item,
            };
          });
          temp.unshift({
            text: controlItem.ControlProperty.RSValue,
            value: "",
          });
          _this.$set(_this.headSourceObj, controlItem.ControlProperty.DataField, temp);
        });
      this.getNum();
    },
    filterData(initDataList, filterObj) {
      let dataList = erowConfig.deepClone(initDataList);
      let arr = dataList;
      let queryObj = filterObj;
      Object.keys(queryObj).forEach((key) => {
        let tempArr = ["All", "ALL", "all"];
        if (queryObj[key] == undefined || queryObj[key] == "" || queryObj[key] == "0" || tempArr.includes(queryObj[key])) return arr;
        arr = arr.filter((p) => p[key] === null || p[key] == queryObj[key]);
      });
      return arr;
    },
    getNum() {
      let _this = this;
      this.filterControls.forEach((controlItem, cIndex) => {
        let searchObj = {};
        let dataList = controlItem.ControlProperty.DataSourceList;
        if (cIndex == 0) {
          dataList.forEach((dataItem) => {
            searchObj[controlItem.ControlProperty.DataField] = dataItem.value;
            let tempArr = _this.filterData(_this.initDataList, searchObj);
            _this.headSourceNumObj[dataItem.computedNumField] = tempArr.length;
          });
        } else {
          let filterControl = _this.filterControls.slice(0, cIndex);
          filterControl.forEach((item) => {
            searchObj[item.ControlProperty.DataField] = _this.filterObj[item.ControlProperty.DataField];
          });

          dataList.forEach((dataItem) => {
            searchObj[controlItem.ControlProperty.DataField] = dataItem.value;
            let tempArr = _this.filterData(_this.initDataList, searchObj);
            _this.headSourceNumObj[dataItem.computedNumField] = tempArr.length;
          });
        }
      });
    },
    getDefaultValueAndSearchList(containers, callback, type, afterSeachCallBack) {
      let scopeCtnrConfig = containers[0].ControlProperty.ScopeCtnrConfig;
      if (!containers[0].ControlProperty.ScopeCtnrGuid) {
        this.getSearchList(containers, callback, type, afterSeachCallBack);
        return;
      }
      apis.sysLoadControlData({
        vm: this,
        params: {
          menuRowGuid: this.config.menuRowGuid || "",
          controlGUID: containers[0].ControlProperty.ScopeCtnrGuid,
          pageMode: this.config.pageMode || "view",
          pValueSet: this.config.pValueSet || erowConfig.generateUUID(),
          nonce: Date.now(),
        },
        success: (res) => {
          if (res.code == "SUCCESS") {
            this.scopeControlData = res.data;
            Object.keys(res.data).forEach((key) => {
              this.defautSearchParams[key] = res.data[key].DefaultValue;
            });
            if (scopeCtnrConfig && scopeCtnrConfig.ControlProperty.AfterGetControlData) {
              let funname = scopeCtnrConfig.ControlProperty.AfterGetControlData;
              if (erowSpecial[funname]) {
                this.defautSearchParams = erowSpecial[funname](res.data, this);
              }
            }
            this.getSearchList(containers, callback, type, afterSeachCallBack);
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
    },
    getSearchList(containers, callback, type, afterSeachCallBack) {
      // const {
      //   menuRowGuid,
      //   pValueSet,
      //   ControlProperty: { ScopeCtnr, ID },
      // } = this.config;
      const {
        menuRowGuid,
        pValueSet,
        ControlProperty: { ScopeCtnr, ID },
      } = containers[0];
      let tempParams = "";
      // 存在缓存条件时，进入页面使用缓存条件搜索
      if (containers.length && containers[0].ControlProperty.ScopeCtnrConfig && containers[0].ControlProperty.ScopeCtnrGuid) {
        const tempItem = containers[0].ControlProperty.ScopeCtnrConfig.ControlProperty.ID;
        const tempItem1 = containers[0].ControlProperty.ScopeCtnrConfig.ControlProperty.CtnrUID;
        //高亮搜索参数缓存，用搜索容器的CtnrUID
        if (containers[0].ControlProperty.ScopeCtnrConfig.ControlProperty.isCache == "true") {
          let tempObj = JSON.parse(localStorage.getItem("searchKey" + tempItem));
          if (tempObj) {
            tempParams = erowConfig.hasProp(tempObj, "data") ? tempObj.data : {};
          }
        } else {
          let tempCachedata = JSON.parse(sessionStorage.getItem("tempSearch" + tempItem));
          if (tempCachedata) {
            tempParams = tempCachedata;
          }
        }
        let tempObj2 = JSON.parse(localStorage.getItem(tempItem1));
        erowConfig.highParamsMap[tempItem1] = erowConfig.hasProp(tempObj2, "data") ? tempObj2.data : {};

        this.pageParams = pageManager.getPageParams();
        let params = {
          menuRowGuid,
          controlGUID: containers[0].ControlProperty.ScopeCtnrGuid,
          pageMode: "view",
          pValueSet,
          paramMap: tempParams || erowConfig.searchParamsMap[ScopeCtnr] || this.defautSearchParams,
          nonce: Date.now(),
        };
        // if (erowConfig.searchParamsInheritMap[ID]) {
        //   params.paramMap = { ...params.paramMap, ...erowConfig.searchParamsInheritMap[ID] };
        // }
        if (this.config.searchParams) {
          Object.keys(this.config.searchParams).forEach((key) => {
            if (key.startsWith("C")) {
              this.defautSearchParams[key] = this.config.searchParams[key];
            } else {
              let scopeCtnrConfig = "";
              if (containers.length && containers[0].ControlProperty.ScopeCtnrConfig) {
                scopeCtnrConfig = containers[0].ControlProperty.ScopeCtnrConfig;
                //获取key
                let child = scopeCtnrConfig.ChildContainers.find((child) => {
                  return child.ControlProperty.DataField == key;
                });
                if (child) params.paramMap[child.ControlProperty.ID] = this.config.searchParams[key];
              } else {
                console.log("未配置关联的搜索容器");
              }
            }
          });
        }
        if (this.pageParams.isFromRemind == -1) {
          params["isFromRemind"] = -1;
          params["extendType"] = erowConfig.isObject(this.pageParams.extendType)
            ? JSON.stringify(this.pageParams.extendType)
            : this.pageParams.extendType;
        }
        erRequest.post(
          `${erowplatformBackendUrl}/appBaseApi/sysSearch?t=${new Date().getTime()}`,
          params,
          (res) => {
            if (res.code == "SUCCESS") {
              if (afterSeachCallBack && typeof afterSeachCallBack == "function") {
                afterSeachCallBack();
              } else {
                this.getPageListData(callback, containers, type);
              }
            }
          },
          (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          },
        );
      } else {
        this.getPageListData(callback, containers, type);
      }
    },
    getPageListData(callback, containers, type, vm) {
      let _this = vm ? vm : this;
      _this.pageParams = pageManager.getPageParams();
      let pValueSet = _this.config.pValueSet;
      // if (Array.isArray(_this.initDataList)) {
      //   _this.checkedData = _this.initDataList.filter((item) => {
      //     return item.checked;
      //   });
      // }
      const controlGuids = (containers || _this.pageListContainers)
        .reduce((pre, cur) => {
          pre.push(cur.ControlGUID);
          return pre;
        }, [])
        .join(",");
      _this.isLoading = true;
      let params = {
        menuRowGuid: _this.config.menuRowGuid,
        controlGUID: controlGuids,
        pageMode: "view",
        pValueSet: pValueSet,
        keyValue: _this.config.keyValue || "",
        page: _this.page,
        rows: _this.rows,
        orderBy: _this.orderBy,
        paramMap: {
          [_this.config.ControlProperty.ID]: _this.detailData,
        },
      };

      if (type == "search") {
        //搜索时调用后端接口
        params["refreshFlag"] = "refresh";
      }
      if (_this.pageParams.isFromRemind == -1) {
        params["isFromRemind"] = -1;
        params["extendType"] = erowConfig.isObject(_this.pageParams.extendType)
          ? JSON.stringify(_this.pageParams.extendType)
          : _this.pageParams.extendType;
      }
      apis.sysLoadDBData({
        vm: _this,
        params: params,
        success: (res) => {
          _this.isLoading = false;
          //如果是在tabgroup 中调用的，则将数据返回到tabgroup,不将数据存到pageList
          if (type == "tab") {
            eventEmitter.emit("afterGetGridData", {
              controlID: _this.config.ControlProperty.ID,
              gridData: res.data,
            });
            return;
          }
          for (const key in res.data) {
            if (pageContext[key]) {
              pageContext[key].containerDataObj = res.data;
              if (res.data[_this.config.ControlProperty.ID])
                _this.sensitiveCode = new Array(res.data[_this.config.ControlProperty.ID].dataList.length).fill(-1);
            }
          }
          eventEmitter.emit("afterGetGridData", {
            controlID: _this.config.ControlProperty.ID,
            gridData: res.data,
          });
          typeof callback == "function" && callback();
          _this.config._isLoadedData = true;
          erowConfig.convertConfig(_this.config.ChildContainers, {
            _isLoadedData: true,
          });
        },
        fail: (error) => {
          _this.isLoading = false;
          console.log(error);
          _this.$toast.fail(error.msg);
        },
        error: (error) => {
          _this.isLoading = false;
          console.log(error);
          _this.$toast.fail(error.msg);
        },
      });
    },
    getWidthObj() {
      let _this = this;
      //监听数据动态设置表格的宽度
      let realField = this.childContainers.filter((item) => {
        return !this.hideFieldArr.includes(item.ControlCode);
      });
      //计算每一列最宽的
      let tempArr = [];
      realField.forEach((item) => {
        let width = _this.flexColumnWidth(item);
        tempArr.push(width);
      });
      //根据所在容器的宽度设置
      tempArr.forEach((item) => {
        _this.$set(_this.widthObj, item.field, item.width);
      });
    },
    // 自适应表格列宽 - 从云端复制，后续可调整
    flexColumnWidth(pContainer, flag = "max") {
      // pContainer(传字符串);
      // flag为可选值，可不传该参数,传参时可选'max'或'equal',默认为'max'
      // flag为'max'则设置列宽适配该列中最长的内容,flag为'equal'则设置列宽适配该列中第一行内容的长度。
      let str = "";
      let tableData = this.listData;

      str = pContainer.ControlProperty.field || pContainer.ControlProperty.DataField;
      if (pContainer.ControlProperty.Width) {
        var number = pContainer.ControlProperty.Width.replace(/[^0-9]/gi, "");
        if (pContainer.ControlProperty.RSValue) {
          if (Number(number) < pContainer.ControlProperty.RSValue.length * 15 + 20) {
            number = pContainer.ControlProperty.RSValue.length * 15 + 20;
          }
        }
        return { field: str, width: number, radio: 0 };
      }

      let columnContent = "";
      if (!tableData || !tableData.length || tableData.length === 0 || tableData === undefined) {
        let w = pContainer.ControlProperty.RSValue
          ? pContainer.ControlProperty.RSValue.length * 18 + 20 > 90
            ? pContainer.ControlProperty.RSValue.length * 15 + 20
            : 90
          : 90; //最小得保证表头完全显示
        return { field: str, width: w, radio: 0 };
      }
      if (!str || !str.length || str.length === 0 || str === undefined) {
        return { field: str, width: "80", radio: 0 };
      }

      // 获取该列中最长的数据(内容)
      let index = 0;

      for (let i = 0; i < tableData.length; i++) {
        if (tableData[i][str] && tableData[i][str] != "null") {
          const now_temp = tableData[i][str] + "";
          const max_temp = tableData[index][str] + "";
          if (!max_temp || max_temp == "null") {
            index = i;
          }
          if (now_temp.length > max_temp.length) {
            index = i;
          }
        }
      }
      columnContent = tableData[index][str] + "";
      if (pContainer.ControlProperty.RSValue) {
        if (!columnContent || columnContent.length <= pContainer.ControlProperty.RSValue.length) {
          columnContent = pContainer.ControlProperty.RSValue;
        }
      }
      // 以下分配的单位长度可根据实际需求进行调整
      let flexWidth = 0;

      if (columnContent && (typeof columnContent == "string" || typeof columnContent == "object")) {
        if (this.selectFieldArr.includes(pContainer.ControlCode)) {
          //如果包含在下拉选项中，设置九个汉字的长度
          flexWidth = 150;
        } else if (pContainer.ControlCode == "UcCheckBoxListField") {
          flexWidth = pContainer.ControlProperty.checkBoxListData.length * 7 * 15;
        } else {
          for (const char of columnContent) {
            if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")) {
              // 如果是英文字符，为字符分配8个单位宽度
              flexWidth += 10;
            } else if (char >= "\u4e00" && char <= "\u9fa5") {
              // 如果是中文字符，为字符分配15个单位宽度
              flexWidth += 18;
            } else {
              // 其他种类字符，为字符分配8个单位宽度
              flexWidth += 10;
            }
          }
        }
        flexWidth = flexWidth + 20;
        if (pContainer.ControlProperty.RSValue) {
          if (flexWidth < pContainer.ControlProperty.RSValue.length * 15 + 40 || flexWidth < 80) {
            // 设置最小宽度
            flexWidth = pContainer.ControlProperty.RSValue.length * 18 + 20 > 90 ? pContainer.ControlProperty.RSValue.length * 15 + 20 : 90; //最小得保证表头完全显示
          }
        } else {
          flexWidth = 90;
        }

        if (flexWidth > 200) {
          // 设置最大宽度
          flexWidth = 200;
        }
        return { field: str, width: flexWidth, radio: 0 };
      } else {
        //如果是空或者复选框列
        flexWidth = 50;
        return { field: str, width: flexWidth, radio: 0 };
      }
    },
  },
};
