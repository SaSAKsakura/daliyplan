let formMinxin = {
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    formcontroldata: {
      type: Object,
      default: () => {},
    },
  },
  provide() {
    return {
      formVm: () => this, // 提供函数，后代组件可以获取实时数据
    };
  },
  //数据
  data() {
    return {
      childContainers: {},
      detailData: {},
      initData: {},
      controldata: {}, //子控件的数据，如下拉框的选择值和其默认值
      defautSearchParams: {},
      rules: {},
      rulesById: {},
      isGetData: false,
      fieldMap: {},
      realFieldData: {},
      isCloseAllDetail: false,
      idMap: {},
    };
  },
  // 方法
  methods: {
      autosave() {
      let parentVm = this;
      let temp = {
        [parentVm.config.ControlProperty.ID]: parentVm.detailData,
      };
      containerparams = { paramMap: temp, controlGuids: parentVm.config.ControlGUID };
      let params = {
        menuRowGuid: parentVm.config.menuRowGuid,
        controlGUID: containerparams.controlGuids,
        pageMode: "EDIT",
        paramMap: containerparams.paramMap,
      };
      params["pValueSet"] = parentVm.config.pValueSet;
      let url = erowplatformBackendUrl + "/appBaseApi/sysDataAction";
      erRequest.post(
        url,
        params,
        (res) => {
          console.log(res);
        },
        (error) => {},
      );
    },
    getData(keyVal, callback) {
      this.getFormData();
    },
    resetData() {
      this.detailData = erowConfig.deepClone(this.initData);
    },
    generateRule(item, field, Id) {
      let obj = {};
      let _this = this;
      if (erowConfig.hideFields.indexOf(item.ControlCode) == -1) {
        if (erowConfig.hasProp(item.ControlProperty, "IsRequired")) {
          if (item.ControlProperty.isHideControl) {
            obj.IsRequired = false;
          } else {
            obj.IsRequired = item.ControlProperty.IsRequired;
          }
        }

        if (erowConfig.hasProp(item.ControlProperty, "FieldVerify")) {
          obj.FieldVerify = item.ControlProperty.FieldVerify;
        }

        obj.RSValue = item.ControlProperty.RSValue;
        _this.$set(_this.rulesById, Id, obj);
        _this.$set(_this.rules, field, obj);
      }

      if (field && Id) {
        _this.$set(_this.fieldMap, Id, field);
        _this.$set(_this.idMap, field, Id);
      }
    },
    isRender() {
      if (this.detailData) {
        return Object.keys(this.detailData).length > 0;
      } else {
        return false;
      }
    },
    handlerAfterGetConfig() {
      let _this = this;
      if (_this.config.ControlProperty.AfterGetContainerConfig) {
        let funcName = _this.config.ControlProperty.AfterGetContainerConfig;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](_this.config.ChildContainers, _this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](_this.config.ChildContainers, _this);
        } else {
          var fnObj = _this.config.ControlProperty.FnCode;
          window[fnObj][funcName](_this.config.ChildContainers, _this);
        }
      }
    },
    getCtnrData() {
      const {
        menuRowGuid,
        ControlGUID,
        pValueSet,
        ControlProperty: { SearchParamsInheritIds, ID },
      } = this.config;
      apis.sysLoadControlData({
        vm: this,
        params: {
          menuRowGuid,
          controlGUID: ControlGUID,
          pValueSet,
          pageMode: this.config.pageMode || "view",
        },
        success: (res) => {
          if (res.code == "SUCCESS") {
            if (this.config.ControlProperty.AfterGetControlData) {
              let funname = this.config.ControlProperty.AfterGetControlData;
              if (erowSpecial[funname]) {
                this.controldata = erowSpecial[funname](res.data, this);
              }
            } else {
              this.controldata = res.data;
            }
            Object.keys(res.data).forEach((key) => {
              this.defautSearchParams[key] = res.data[key].DefaultValue;
            });
            this.generateDetailDataObj();
            if (erowConfig.searchParamsInheritMap[ID]) {
              this.defautSearchParams = {
                ...this.defautSearchParams,
                ...erowConfig.searchParamsInheritMap[ID],
              };
              this.detailData = {
                ...this.detailData,
                ...erowConfig.searchParamsInheritMap[ID],
              };
            }
            this.getFormData();
          } else {
            this.generateDetailDataObj();
            this.getFormData();
          }
          if (SearchParamsInheritIds) {
            SearchParamsInheritIds.replaceAll(" ", "")
              .split(",")
              .forEach((id) => {
                Object.defineProperty(erowConfig.searchParamsInheritMap, id, {
                  get: () => this.detailData,
                  enumerable: true,
                });
              });
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
    handlerAfterGetContainerData() {
      // 处理AfterGetContainerData 如果在jsgrid中，需要处理，不在jsgrid中，不需要处理AfterGetContainerData（api.js sysLoadDBData中有处理）
      if(this.dataFromGrid){
        if (this.config.ControlProperty && this.config.ControlProperty.AfterGetContainerData) {
          let funname = this.config.ControlProperty.AfterGetContainerData;
          if (erowSpecial[funname]) {
            erowSpecial[funname](this.detailData, this);
          }
        }
      }
    },
    setEmptyClass(containerData) {
      if (this.config.ControlCode == "UcFormDetailView") {
        Object.keys(this.childContainers).forEach((key) => {
          if (this.childContainers[key].length == 1 && this.childContainers[key][0].ControlCode == "UcTextBox") {
            let controlItem = this.childContainers[key][0];
            let CssClass = controlItem.ControlProperty.CssClass || "";
            if (this.config.pageMode == "VIEW") {
              if (containerData && !containerData[controlItem.ControlProperty.DataField]) {
                if (CssClass && CssClass.indexOf("hide-control") == -1) {
                  CssClass += " hide-control";
                } else {
                  CssClass += "hide-control";
                }
                console.log(CssClass);
                this.$set(controlItem.ControlProperty, "CssClass", CssClass);
                this.childContainers[key].splice(0, 1, controlItem);
              }
            } else {
              if (CssClass && CssClass.indexOf("hide-control") != -1) {
                CssClass = replace("hide-control", "");
                this.$set(controlItem.ControlProperty, "CssClass", CssClass);
                this.childContainers[key].splice(0, 1, controlItem);
              }
            }
          }
        });
      }
    },
    getFormData(keyValue, callBack) {
      if (this.config.ControlProperty.IsRequestData == "false") {
        console.log("不请求数据");
        return;
      }
      let isHastainerData = erowConfig.isObject(this.containerdata) ? (Object.keys(this.containerdata).length == 0 ? false : true) : false;
      this.pageParams = pageManager.getPageParams();
      if (this.dataFromGrid) {
        this.buildDetailDataObj(this.dataFromGrid);
        eventEmitter.emit("afterGetOpList", {
          opList: this.dataFromGrid["RowRights"].join(","),
          controlID: this.config.ControlProperty.ID,
          ctnrUID: this.config.ControlProperty.CtnrUID,
        });
        this.handlerAfterGetContainerData();
        eventEmitter.emit("afterGetFormData", {
          detailData: this.detailData,
          controlID: this.config.ControlProperty.ID,
          primaryData: this.dataFromGrid,
          initData: this.initData,
        });
        if (!this.config._isLoadedData) {
          this.config._isLoadedData = true;
          erowConfig.convertConfig(this.config.ChildContainers, {
            _isLoadedData: true,
          });
        }
      } else if (this.isGetData && !isHastainerData) {
        apis.sysLoadDBData({
          vm: this,
          params: {
            menuRowGuid: this.config.menuRowGuid,
            controlGUID: this.config.ControlGUID,
            pageMode: this.config.pageMode,
            pValueSet: this.config.pValueSet,
            keyValue: keyValue || this.config.keyValue || pageContext.root._keyValue || pageContext.root.keyValue,
            paramMap: keyValue
              ? undefined
              : {
                  [this.config.ControlProperty.ID]: this.detailData,
                },
          },
          success: (res) => {
            if (res.data) {
              this.buildDetailDataObj(res.data[this.config.ControlProperty.ID]);
              if (this.config.pageMode == "EDIT") {
                this.renderCacheData(); //编辑模式下配置了缓存,跳转另一页回来显示之前填的数据
              }
              this.setEmptyClass(res.data[this.config.ControlProperty.ID]);
              let opList = "";
              if (res.data[this.config.ControlProperty.ID]["RowRights"]) {
                opList = res.data[this.config.ControlProperty.ID]["RowRights"].join(",");
              } else if (res.data[this.config.ControlProperty.ID]["PageRights"]) {
                opList = res.data[this.config.ControlProperty.ID]["PageRights"].join(",");
              }
              //this.handlerAfterGetContainerData();
              eventEmitter.emit("afterGetOpList", {
                opList,
                controlID: this.config.ControlProperty.ID,
                ctnrUID: this.config.ControlProperty.CtnrUID,
              });
              eventEmitter.emit("afterGetFormData", {
                detailData: this.detailData,
                controlID: this.config.ControlProperty.ID,
                primaryData: res.data[this.config.ControlProperty.ID],
                initData: this.initData,
              });
              this.config._isLoadedData = true;

              erowConfig.convertConfig(this.config.ChildContainers, {
                _isLoadedData: true,
              });

              this.getOptionsData();
              if (callBack) callBack();
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
      } else if (this.containerdata) {
        this.buildDetailDataObj(erowConfig.deepClone(this.containerdata));
        this.handlerAfterGetContainerData();
      } else if (this.config.ControlProperty.DataSourceCtnrGuid) {
        let params = {
          controlGUID: this.config.ControlProperty.DataSourceCtnrGuid,
          ctnrUID: this.config.ControlProperty.DataSourceCtnrUID,
          menuConfigKey: this.config.menuConfigKey || this.$root.menuConfigKey,
          opCode: "VIEW",
          pValueSet: this.config.pValueSet || this.$root.pValueSet,
          paramMap: {},
        };
        erRequest.post(
          erowplatformBackendUrl + "/appBaseApi/sysLoadPostData",
          params,
          (res) => {
            if (res.code == "SUCCESS") {
              if (callBack) {
                callBack(res.data);
                return;
              }
              if (res.data.dataList && res.data.dataList.length) {
                this.initData = res.data.dataList[0];
              } else if (res.data) {
                this.initData = res.data;
              }
            }
          },
          (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          }
        );
      } else {
        this.handlerAfterGetContainerData();
        eventEmitter.emit("afterGetFormData", {
          detailData: {},
          primaryData: {},
          controlID: this.config.ControlProperty.ID,
          _isOriginFormData: false,
          initData: this.initData,
        });
        this.config._isLoadedData = true;
        erowConfig.convertConfig(this.config.ChildContainers, {
          _isLoadedData: true,
        });
      }
    },
    setFileCtnrUIDToWindow() {
      if (!window.fileCtnr) {
        window.fileCtnr = [];
      }
      let temp = window.fileCtnr.find((item) => {
        return item.CtnrUID == this.config.CtnrUID && item.rootControlGuid == this.config.rootControlGuid;
      });
      if (!temp) {
        window.fileCtnr.push({ CtnrUID: this.config.CtnrUID, rootControlGuid: this.config.rootControlGuid });
      }
    },
    generateChildContainers() {
      let _this = this;
      let temp = [];
      if (Array.isArray(_this.config.ChildContainers)) {
        _this.config.ChildContainers = erowConfig.convertConfig(_this.config.ChildContainers, { _isLoadedData: true });
        // 判断是否有上传控件
        let isUpload = _this.config.ChildContainers.some((item) => {
          return item.ControlCode == "UcFileUpload";
        });
        if(isUpload){
          _this.setFileCtnrUIDToWindow();
        }
        _this.config.ChildContainers.forEach((item) => {
          let temp1 = item;
          temp1.ControlProperty["FnCode"] = _this.config.ControlProperty.FnCode;
          temp1.menuRowGuid = this.config.menuRowGuid;
          temp1.menuConfigKey = this.config.menuConfigKey;
          temp1.rootControlGuid = this.config.rootControlGuid;
          temp1.pageMode = this.config.pageMode;
          temp1.keyValue = this.config.keyValue;
          temp1.pValueSet = this.config.pValueSet;
          temp.push(temp1);
        });
      }
      if (Array.isArray(temp)) {
        //是否有合并项
        let isMerge = temp.reduce(function (pre, cur) {
          if (erowConfig.hasProp(cur.ControlProperty, "Offset")) {
            pre = true;
          }
          _this.generateRule(cur, cur.ControlProperty.DataField, cur.ControlProperty.ID);
          return pre;
        }, false);
        //构建子容器对象
        _this.childContainers = erowConfig.getNewLineArr(temp);
        if (isMerge) {
          _this.childContainers = erowConfig.getMergeArr(_this.childContainers);
        }

        if (this.config.ControlCode == "UcFormDetailView" && _this.config.pageMode == "ADD") {
          eventEmitter.emit("afterGetOpList", {
            opList: "ADD",
            controlID: _this.config.ControlProperty.ID,
            ctnrUID: _this.config.ControlProperty.CtnrUID,
          });
        }
      }
    },
    //生成表单对象字段并设置默认值
    generateDetailDataObj() {
      let _this = this;
      _this.detailData = {};
      _this.config.keyValue = _this.config.keyValue ? _this.config.keyValue : _this.initData[_this.initData.keyName];
      Object.keys(this.childContainers).forEach((key) => {
        _this.childContainers[key].forEach((configItem) => {
          let setOneDetail=(item)=>{
              if (!["UcLabel", "UcButton"].includes(item.ControlCode)) {
              if (item.ControlProperty.ID) {
                // if (item.ControlCode == "UcCheckBoxList") {
                //   // UcRadioButtonList
                //   _this.$set(_this.detailData, item.ControlProperty.ID, []);
                // } else {
                _this.$set(_this.detailData, item.ControlProperty.ID, "");
                // }
                if (erowConfig.hasProp(this.controldata, item.ControlProperty.ID)) {
                  _this.detailData[item.ControlProperty.ID] = this.controldata[item.ControlProperty.ID].DefaultValue;
                  if (_this.config.searchParams) {
                    if (erowConfig.hasProp(_this.config.searchParams, item.ControlProperty.DataField))
                      _this.detailData[item.ControlProperty.ID] = _this.config.searchParams[item.ControlProperty.DataField];
                  }
                }
                if (_this.config.defaultValueObj && _this.config.pageMode == "ADD") {
                  if (erowConfig.hasProp(_this.config.defaultValueObj, item.ControlProperty.DataField))
                    _this.detailData[item.ControlProperty.ID] = _this.config.defaultValueObj[item.ControlProperty.DataField];
                }
              }
            }
          }
          setOneDetail(configItem);
          if(erowConfig.hasProp(configItem, "children")){
            configItem.children.forEach((child)=>{
              setOneDetail(child);
            })
          }
        });
      });
      _this.initData = erowConfig.deepClone(_this.detailData);

      if (this.config.pageMode == "ADD") {
        this.setClientRowGuid(this.detailData);
        this.renderCacheData(); //新增模式下配置了缓存,跳转另一页回来显示之前填的数据
      }

      let data = localStorage.getItem("searchKey" + this.config.ControlProperty.ID);
      // let data = localStorage.getItem(this.config.pValueSet+'_'+this.config.ControlProperty.ID);

      // 没有缓存时，导航栏搜索回显
      if (_this.config.ControlCode == "UcScopeContainer" && _this.config.ControlProperty.isCache != "true") {
        const CtnrUID = this.config.ControlProperty.CtnrUID;
        const data = erowConfig.searchParamsMap[CtnrUID];
        if (data) {
          _this.detailData = erowConfig.deepClone(data);
        } else {
          let tempData = sessionStorage.getItem("tempSearch" + this.config.ControlProperty.ID);
          if (tempData) {
            _this.detailData = JSON.parse(tempData);
          }
        }
      }
      if (data && _this.config.ControlCode == "UcScopeContainer" && _this.config.ControlProperty.isCache == "true") {
        //判断过期时间
        if (JSON.parse(data).expirationTime > new Date().getTime()) {
          _this.detailData = JSON.parse(data).data;
        } else {
          localStorage.removeItem(this.config.ControlProperty.ID);
        }
      }
    },
    // 点击进入详情页后，根据获取的详情页的数据构建 detailData
    buildDetailDataObj(objs) {
      let _this = this;
      _this.initData = erowConfig.deepClone(objs);
      _this.detailData = {};

      Object.keys(this.childContainers).forEach((key) => {
        _this.childContainers[key].forEach((configItem) => {
          let setOneDetail=(item)=>{
              if (["UcDropDownList", "UcComboTree", "UcFormTree"].includes(item.ControlCode)) {
              if (_this.config.pageMode === "VIEW"&&!this.isConfigSingleEdit) {
                _this.$set(
                  _this.detailData,
                  item.ControlProperty.ID,
                  objs[item.ControlProperty.DataFieldWhenReadMode] || objs[item.ControlProperty.DataField]
                );
              } else {
                _this.$set(_this.detailData, item.ControlProperty.ID, objs[item.ControlProperty.DataField]);

                // 查找需要和UcDropDownList同步更新数据的ID
                for (let key in this.childContainers) {
                  for (let child of this.childContainers[key]) {
                    if (item.ControlProperty.DataFieldWhenReadMode && item.ControlProperty.DataFieldWhenReadMode == child.ControlProperty.DataField) {
                      _this.$set(item, "__sync_data", child.ControlProperty.ID);
                    }
                  }
                }
              }
            } else if (!["UcButton", "UcLabel"].includes(item.ControlCode)) {
              if (item.ControlProperty.ID && item.ControlProperty.DataField) {
                let value =
                  objs[item.ControlProperty.DataField] || objs[item.ControlProperty.DataField] === 0
                    ? objs[item.ControlProperty.DataField]
                    : _this.config.pageMode == "ADD"
                    ? item.ControlProperty.DefaultValue
                    : objs[item.ControlProperty.DataField];
                if (value == undefined || value == null) {
                value = "";
              }
              _this.$set(_this.detailData, item.ControlProperty.ID, value);
              }
            } 
            if (item.ControlCode == "UcCheckBoxList") {
              // UcRadioButtonList
              // _this.$set(_this.detailData, item.ControlProperty.ID, objs[item.ControlProperty.DataField] || []);
              _this.$set(_this.detailData, item.ControlProperty.ID, objs[item.ControlProperty.DataField] || "");
            }
            //脱敏控件 添加属性
            if (item.ControlCode == "UcSensitiveField") {
              let StatusCode = item.ControlProperty.StatusCode;
              _this.$set(_this.initData, StatusCode, -1);
              if (_this.containerdata) {
                _this.$set(_this.containerdata, StatusCode, -1);
              }
            }
            if(item.ControlCode == "UcFileContainer"){
              value = objs[item.ControlProperty.ID];
              _this.$set(_this.detailData, item.ControlProperty.ID, value);
            }

            this.buildComboTree(item, {});
          }
          setOneDetail(configItem);
          if(erowConfig.hasProp(configItem, "children")){
            configItem.children.forEach((child)=>{
              setOneDetail(child);
            })
          }
        });
      });
    },
    getColSpan({ Colspan, ControlProperty = {} }, data) {
      if (ControlProperty.ColsSpanField) {
        return data[ControlProperty.ColsSpanField];
      }
      return Colspan || ControlProperty.Colspan || 1;
    },
    getRowSpan({ Rowspan, ControlProperty = {} }) {
      return Rowspan || ControlProperty.Rowspan || 1;
    },
    hideCols(item, detailData) {
      let controlClass = this.activeClass(item, detailData);
      if (controlClass.indexOf("hide_label") != -1) {
        return { display: "none" };
      }
      if (erowConfig.hasProp(item.ControlProperty, "Colspan")) {
        if (item.ControlProperty.Colspan == "0") {
          return { display: "none" };
        } else {
          return {};
        }
      }
      if (item.ControlCode == "UcData" || item.ControlCode == "UcHiddenField") {
        return { display: "none" };
      } else {
        return {};
      }
    },
    getDataSource(item, callback) {
      let tempUrl = item.ControlProperty.DataSrc;
      tempUrl = tempUrl.replace(/^~/, "");
      tempUrl = tempUrl.replace(/^\//, "");
      let url = tempUrl + "?pValueSet=" + this.config.pValueSet;
      erRequest.post(
        url,
        {},
        function (res) {
          if (res.code == "SUCCESS") {
            callback(res.data);
          } else {
            console.log(res);
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );
    },
    getWebboTreeData(ctnrUID, paramMap, callBack) {
      let _this = this;
      let params = {
        ctnrUID,
        menuConfigKey: _this.config.menuConfigKey || _this.$root.menuConfigKey,
        paramMap: paramMap,
        pValueSet: _this.config.pValueSet,
        controlGUID: _this.config.ControlGUID,
        opCode: "VIEW",
      };
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadPostData";
      erRequest.post(
        url,
        params,
        function (res) {
          callBack(res.data);
        },
        (error) => {
          console.log(error);
          _this.$toast.fail(error.msg);
        }
      );
    },
    setDataArr(data, item, vm) {
      let idKey = item.ControlProperty.IDKey ? item.ControlProperty.IDKey.toLowerCase() : "id";
      let pidKey = item.ControlProperty.PIDKey ? item.ControlProperty.PIDKey.toLowerCase() : "pid";

      vm.$set(item.ControlProperty, "dataArr", erowConfig.handleTree(data, idKey, pidKey));
    },
    buildComboTree(item, paramMap) {
      let _this = this;
      if (item.ControlCode === "UcComboTree" || item.ControlCode === "UcFormTree") {
        let DataSourceDBActionCtnrUID = item.ControlProperty.DataSourceDBActionCtnrUID;
        if (DataSourceDBActionCtnrUID) {
          this.getWebboTreeData(DataSourceDBActionCtnrUID, paramMap, function (res) {
            let initData = erowConfig.deepClone(res.dataList);
            _this.$set(item.ControlProperty, "initData", initData);

            _this.setDataArr(res.dataList, item, _this);
          });
        }

        if (item.ControlProperty.DataSrc) {
          _this.getDataSource(item, function (res) {
            _this.setDataArr(res, item, _this);
          });
        }
      }
    },
    hanldeChangeStatusCode(params) {
      console.log("hanldeChangeStatusCode", params);
      const { code } = params;
      if (code == "switchOpenAndClose") {
        this.handleSwitchOpenAndClose(params);
        return;
      }
    },
    handleSwitchOpenAndClose(params) {
      const { code } = params;
      if (code != "switchOpenAndClose") {
        return;
      }

      const { config: { ControlCode } = {} } = this;
      // 判断组件是否允许收起/展开
      const allowCodeList = ["UcCardContainer", "UcFormDetailView", "UcScopeContainer"];
      const isAllow = allowCodeList.find((code) => {
        return ControlCode == code;
      });
      if (!isAllow) {
        return;
      }

      const configProxy = erowConfig.deepClone(this.config);
      // 判断组件是否有子组件
      const { ChildContainers = [] } = configProxy;
      if (!ChildContainers || ChildContainers.length == 0) {
        return;
      }
      this.isCloseAllDetail = !this.isCloseAllDetail;
      if (this.isCloseAllDetail) {
        configProxy.ChildContainers = erowConfig.deepClone(
          ChildContainers.filter((child) => {
            const { ControlProperty: { IsAllowToggle } = {} } = child;
            return !IsAllowToggle;
          })
        );
      } else {
        configProxy.ChildContainers = erowConfig.deepClone(ChildContainers);
      }

      this.generateChildContainersByConfigProxy(configProxy);
    },
    generateChildContainersByConfigProxy(configProxy) {
      if (!configProxy) {
        return;
      }

      let _this = this;
      let temp = [];
      if (Array.isArray(configProxy.ChildContainers)) {
        configProxy.ChildContainers.forEach((item) => {
          let temp1 = item;
          temp1.ControlProperty["FnCode"] = configProxy.ControlProperty.FnCode;
          temp1.menuRowGuid = configProxy.menuRowGuid;
          temp1.menuConfigKey = configProxy.menuConfigKey;
          temp1.rootControlGuid = configProxy.rootControlGuid;
          temp1.pageMode = configProxy.pageMode;
          temp1.keyValue = configProxy.keyValue;
          temp1.pValueSet = configProxy.pValueSet;
          temp.push(temp1);
        });
      }
      if (Array.isArray(temp)) {
        //是否有合并项
        let isMerge = temp.reduce(function (pre, cur) {
          if (erowConfig.hasProp(cur.ControlProperty, "Offset")) {
            pre = true;
          }
          _this.generateRule(cur, cur.ControlProperty.DataField, cur.ControlProperty.ID);
          return pre;
        }, false);
        //构建子容器对象
        _this.childContainers = erowConfig.getNewLineArr(temp);
        if (isMerge) {
          _this.childContainers = erowConfig.getMergeArr(_this.childContainers);
        }
      }
    },
  },
  computed: {
    colsWidth() {
      if (this.config.ColsWidth) {
        return this.config.ColsWidth.split(",");
      } else if (this.config.ControlProperty && this.config.ControlProperty.ColsWidth) {
        return this.config.ControlProperty.ColsWidth.split(",");
      } else {
        return [];
      }
    },
  },
  created() {
    //构建容器子控件对象
    this.generateChildContainers();
    this.handlerAfterGetConfig();
    this.isGetData = this.config.ControlCode != "UcScopeContainer" && ["VIEW", "EDIT"].includes(this.config.pageMode);
    if (!this.dataFromGrid&&!this.$attrs.datafromlist) {
      this.getCtnrData();
    } else {
      //是UcCardContaienr，构建表单对象，然后再获取表单数据
      this.generateDetailDataObj();
      this.getFormData();
    }
    eventEmitter.on("refresh", () => {
      this.getFormData();
    });
  },
  mounted() {
    if (this.config && this.config.ControlProperty && this.config.ControlProperty.IsDefaultClosed == "true") {
      this.handleSwitchOpenAndClose({
        code: "switchOpenAndClose",
      });
    }
  },
  watch: {
    config: {
      handler(val) {
        this.generateChildContainers();
        this.handlerAfterGetConfig();
        this.isGetData = this.config.ControlCode != "UcScopeContainer" && ["VIEW", "EDIT"].includes(this.config.pageMode);
        if (!this.dataFromGrid) {
          console.log("sopce form watch");
          this.getCtnrData();
        } else {
          //是UcCardContaienr，构建表单对象，然后再获取表单数据
          this.generateDetailDataObj();
          this.getFormData();
        }
      },
      immediate: false,
    },
    containerdata: {
      handler(val) {
        console.log("watch containerdata");
        val && this.buildDetailDataObj(erowConfig.deepClone(val));
        this.getOptionsData && this.getOptionsData();
      },
      deep: true,
    },
    detailData: {
      handler(val) {
        if (val && erowConfig.isObject(val)) {
          Object.keys(val).forEach((key) => {
            // this.realFieldData[this.fieldMap[key]] = val[key];
            if(this.fieldMap[key]) {
              this.$set(this.realFieldData, this.fieldMap[key], val[key]);
            }
          });
        }
        if (this.dataFromGrid) {
          this.$emit("change_detailData", {
            detailData: this.realFieldData,
            rindex: this.$attrs.rindex,
            isgroup: this.$attrs.isgroup,
            categoryid: this.$attrs.categoryid,
          });
        } else {
          this.$emit("change_detailData", val);
        }
      },
      deep: true,
    },
    formcontroldata: {
      handler(val) {
        if ((this.dataFromGrid || this.$attrs.datafromlist) && val) {
          this.controldata = val;
        }
      },
      deep: true,
      immediate: true,
    },
    dataFromGrid: {
      handler(val) {
        if (val) {
          this.getFormData();
        }
      },
      deep: true,
      immediate: true,
    },
  },
};
