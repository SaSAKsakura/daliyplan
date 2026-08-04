const activeStyleMap = {
  UcJsGridContainer: {
    Height: (style, data) => (style.maxHeight = data),
  },
  UcPageListContainer: {
    Height: (style, data) => (style.height = data),
  },
  UcTabGroup: {
    Height: (style, data) => (style.maxHeight = data),
  },
};

function addThousandSeparator(num, separator = ",") {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
function deleteThousandSeparator(numberString, separator = ",") {
  return numberString.replace(new RegExp(separator, "g"), "");
}

var commonMinxin = {
  data() {
    return {
      isTablet: sessionStorage.getItem("isTablet") === "true",
      pValueSet: "",
      pullRefreshLoading: false,
      tipVisible: false,
      tipHideEvent: null,
      tooltipTypeConstants: {
        INFO: "info",
        WARNING: "warning",
        QUESTION: "question",
      },
    };
  },
  mounted() {
    this.genertePageContext();
  },
  methods: {
    setClientRowGuid(obj, value) {
      let key = "new_row_guid";
      this.$set(obj, key, value || erowConfig.generateUUID());
    },
    //获取AutoPostBackAction对象，传入控件配置
    getActionObj(item) {
      let result = {};
      if (item && item.ControlProperty && Object.prototype.toString.call(item.ControlProperty.AutoPostBackAction) == "[object String]") {
        result = JSON.parse(item.ControlProperty.AutoPostBackAction);
      }
      return result;
    },
    runSpeicalFun(funName, params) {
      if (typeof this[funName] === "function") {
        this[funName](params);
      } else {
        apis.runSpeicalFun({ vm: this, funName, params });
      }
    },
    loadScript(url, callback) {
      var script = document.createElement("script");
      script.src = url;
      if (callback) {
        script.onload = callback;
      }
      document.getElementsByTagName("head")[0].appendChild(script);
    },
    setDefautImg({ target }) {
      if (target._setDefautImg) return;
      target._setDefautImg = true;
      target.src = window.PAGE_CONFIG.menuDefaultImage;
    },
    getImageSrc(type) {
      if (this.config.ControlProperty.CustomFunctionName) {
        let funcName = this.config.ControlProperty.CustomFunctionName;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          return baseSpecial[funcName](type, this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          return erowSpecial[funcName](type, this);
        }
      }
      if (this.config.ControlProperty.SourceType == "dynamic") {
        let DataImageUrlFormatString = this.config.ControlProperty.DataImageUrlFormatString
          ? JSON.parse(this.config.ControlProperty.DataImageUrlFormatString)
          : {};
        let fileGuid = this.containerdata[DataImageUrlFormatString.fileGuidKey];
        if (fileGuid) {
          let params = {
            fnCode: DataImageUrlFormatString.fnCodeKey ? this.containerdata[DataImageUrlFormatString.fnCodeKey] : this.config.fnCode,
            fileGuid: fileGuid,
            instanceGuid: this.containerdata[DataImageUrlFormatString.instanceGuidKey],
            type,
          };
          return this.getDownLoadUrl(params, this);
        } else {
          return this.config.ControlProperty.DefaultImageUrl || window.PAGE_CONFIG.emptyListImage;
        }
      }
      return this.config.ControlProperty.ImageUrl || this.config.ControlProperty.DefaultImageUrl;
    },
    getDownLoadUrl({ fnCode, fileGuid, instanceGuid, type }, vm) {
      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      let file_guid = erTool.encrypt(fileGuid, token);
      let url =
        baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(file_guid) +
        "&pValueSet=" +
        encodeURIComponent(vm.config.pValueSet) +
        "&json=" +
        // encodeURIComponent(JSON.stringify({ token }));
        encodeURIComponent(JSON.stringify({ [window.pageConfig.st || "token"]: token }));
      if (fnCode) {
        url += "&fnCode=" + fnCode;
      }
      if (instanceGuid) {
        instanceGuid = erTool.encrypt(instanceGuid, token);
        url += "&instanceGuid=" + encodeURIComponent(instanceGuid);
      }
      if (type) {
        url += "&thumbnailFlag=-1";
      }
      return url;
      // let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      // file.file_guid = erTool.encrypt(file.file_guid, token);
      // let url =
      //   baseUrl +
      //   erowplatformBackendUrl +
      //   "/file/downloadfile?fileGuid=" +
      //   encodeURIComponent(file.file_guid) +
      //   "&pValueSet=" +
      //   encodeURIComponent(this.config.pValueSet) +
      //   "&json=" +
      //   encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));
      // if (file.fn_code) {
      //   url += "&fnCode=" + file.fn_code;
      // }
      // if (file.instance_guid) {
      //   file.instance_guid = erTool.encrypt(file.instance_guid, token);
      //   url += "&instanceGuid=" + encodeURIComponent(file.instance_guid);
      // }
      // if (this.getControlGUID) {
      //   url += "&controlGuid=" + encodeURIComponent(this.getControlGUID);
      // }
      // return url;
    },
    $messageShow: (() => {
      const messageRootDom = document.createElement("div");
      messageRootDom.className = "message-root";
      window.addEventListener("load", () => {
        window.document.body.appendChild(messageRootDom);
      });
      // type: success, warning, error
      return function message(type, message) {
        const messageDom = document.createElement("div");
        messageDom.className = `message-item message-item-${type}`;
        messageDom.innerText = message;
        messageRootDom.appendChild(messageDom);
        setTimeout(() => {
          messageRootDom.removeChild(messageDom);
        }, 3000);
      };
    })(),
    checkConfirm(config, callback, params) {
      if (config.ControlProperty.ConfirmMessage) {
        vant.Dialog.confirm({
          title: "系统消息",
          message: config.ControlProperty.ConfirmMessage,
          cancelButtonColor: true,
          className: "checkConfirm",
        })
          .then(() => {
            callback.apply(this, params);
          })
          .catch(() => {});
      } else {
        callback.apply(this, params);
      }
    },
    activeStyle() {
      const style = {};
      const property = this.config.ControlProperty;
      const styleMap = activeStyleMap[this.config.ControlCode];
      styleMap &&
        Object.entries(styleMap).forEach(([propertyName, call]) => {
          property[propertyName] && call(style, property[propertyName]);
        });
      return style;
    },
    handleClientActions() {
      let actions = {};
      if (this.config.ControlProperty.ClientActions) {
        actions = JSON.parse(this.config.ControlProperty.ClientActions);
      } else if (this.config.ControlProperty.AutoPostBackAction) {
        actions = JSON.parse(this.config.ControlProperty.AutoPostBackAction);
      } else {
        return {};
      }

      return Object.entries(actions).reduce((events, [eventName, callbakName]) => {
        if (eventName.startsWith("on")) {
          eventName = eventName.slice(2).toLowerCase();
        }
        if (erowConfig.hasProp(baseSpecial, callbakName)) {
          events[eventName] = baseSpecial[callbakName].bind(this, this.config, this);
        } else if (erowSpecial.hasOwnProperty(callbakName)) {
          events[eventName] = erowSpecial[callbakName].bind(this, this.config, this);
        }
        return events;
      }, {});
    },
    commomClientActions(params, config, vm) {
      let actions = {};
      if (config.ControlProperty.ClientActions) {
        actions = JSON.parse(config.ControlProperty.ClientActions);
        Object.entries(actions).reduce((events, [eventName, callbakName]) => {
          if (erowConfig.hasProp(baseSpecial, callbakName)) {
            baseSpecial[callbakName](params, vm);
          } else if (erowSpecial.hasOwnProperty(callbakName)) {
            erowSpecial[callbakName](params, vm);
          }
        }, {});
      }
    },
    searchForm() {
      pageManager.updateParams(pageManager.pages.length - 1, { isFromRemind: 0, extendType: "" });
      erowConfig.searchParamsMap[this.config._searchControlCtnrUID || this.config.CtnrUID] = this.containerdata || this.detailData;
      erowConfig.highParamsMap[this.config._searchControlCtnrUID || this.config.CtnrUID] = this.realFieldData;
      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/sysSearch?t=${new Date().getTime()}`,
        {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.config._searchControlGUID || this.config.ControlGUID,
          pageMode: "view",
          pValueSet: this.config.pValueSet,
          paramMap: this.containerdata || this.detailData,
        },
        (res) => {
          this.pullRefreshLoading = false;
          if (res.code == "SUCCESS") {
            eventEmitter.emit("search", this.config._searchControlGUID || this.config.ControlGUID);
          }
        },
        (error) => {
          this.pullRefreshLoading = false;
          this.$toast.fail(error.msg);
        },
      );
    },
    handleClientActionsWidthParams(event, configItem, data = {}, actionType, eventName) {
      let params = {
        event,
        configItem,
        data,
      };
      let temp = eventName ? eventName : "click";
      let fun = erowConfig.getEventFun(configItem, temp);
      if (fun) {
        if (this[fun]) {
          this[fun](params, this);
        } else if (erowConfig.hasProp(baseSpecial, fun)) {
          baseSpecial[fun](params, this);
        } else {
          erowSpecial[fun](params, this);
        }
      }
    },
    showTopNav(TopNavMenuId, menuData) {
      if (!this.navMenus) {
        const targetMenu = menuData.find((item) => item.fn_code === TopNavMenuId);

        if (!targetMenu) return;
        if (targetMenu.childrenMenu && Array.isArray(targetMenu.childrenMenu)) {
          this.navMenus = targetMenu.childrenMenu;
        } else {
          this.navMenus = menuData.filter((item) => item.menu_pid === Number(targetMenu.menu_id));
        }
      }
      this.isShowTopNav = !this.isShowTopNav;
    },
    tryShowTopNav(TopNavMenuId) {
      this.isHadTopNav = true;
      const menuPostData = JSON.parse(sessionStorage.getItem("menuPostData"));
      if (!menuPostData) {
        erRequest.post(erowplatformBackendUrl + this.config.ControlProperty.DataSrc, {}, (res) => {
          if (res.code !== "SUCCESS") return;
          sessionStorage.setItem("menuPostData", JSON.stringify(res.data));
          this.showTopNav(TopNavMenuId, res.data);
        });
      } else {
        this.showTopNav(TopNavMenuId, menuPostData);
      }
    },
    getPlaceHolerByConfig(config) {
      if (!this.config._isLoadedData) return "";
      return (config.pageMode == "EDIT" || config.pageMode == "ADD") && !this.getDisabled(config)
        ? config.PlaceHodler || config.ControlProperty.PlaceHolderRSCode
        : "";
    },
    handleEnterFun({ key, keyCode, which }, config, data) {
      if (key === "Enter" || keyCode === "13" || which === 13) {
        if (config.ControlProperty.keyEnterAction) {
          this.runSpeicalFun(config.ControlProperty.keyEnterAction, data);
        }
      }
    },
    renderCacheData(listData) {
      let formContainer = ["UcFormDetailView"];
      let gridContainer = ["UcJsGridContainer"];
      if (formContainer.includes(this.config.ControlCode)) {
        let key = this.config.ControlProperty.ID + this.config.pageMode + this.config.keyValue + "TEMP_CACHE";
        app.db.get(key, (res) => {
          if (res && res.value) {
            Object.assign(this.detailData, JSON.parse(res.value));
          }
        });
      }
      if (gridContainer.includes(this.config.ControlCode)) {
        let key = this.config.ControlProperty.ID + this.config.pageMode + this.config.keyValue + "TEMP_CACHE";
        app.db.get(key, (res) => {
          if (res && res.value) {
            let cacheList = JSON.parse(res.value);

            if (Array.isArray(cacheList) && listData.length) {
              listData.forEach((item, index) => {
                if (cacheList[index]) {
                  listData.splice(index, 1, cacheList[index]);
                }
              });
            }
          }
        });
      }
    },
    removeTempCache(configItem) {
      if (configItem && erowConfig.hasProp(configItem.ControlProperty, "IsRemoveTempCache")) {
        if (configItem.ControlProperty.IsRemoveTempCache.toLocaleLowerCase() == "true") app.db.deleDataWidthName("TEMP_CACHE");
      }
    },
    removeTargetContainerCache(configItem) {
      if (erowConfig.hasProp(configItem.ControlProperty, "RemoveCacheTargetIDS")) {
        let targetIDS = configItem.ControlProperty.RemoveCacheTargetIDS;
        if (targetIDS) {
          let idsObj = erowConfig.isObject(targetIDS) ? targetIDS : JSON.parse(targetIDS);
          Array.isArray(idsObj.form) &&
            idsObj.form.forEach((id) => {
              app.db.delete(id + "TEMP_CACHE", function () {
                console.log("delete insucc");
              });
            });
          Array.isArray(idsObj.grid) &&
            idsObj.grid.forEach((id) => {
              app.db.delete(id + "TEMP_CACHE", function () {
                console.log("delete insucc");
              });
            });
        }
      }
    },
    CacheTargetContainer(configItem) {
      if (erowConfig.hasProp(configItem.ControlProperty, "CacheTargetIDS") && configItem.pageMode != "VIEW") {
        let targetIDS = configItem.ControlProperty.CacheTargetIDS;
        if (targetIDS) {
          let idsObj = erowConfig.isObject(targetIDS) ? targetIDS : JSON.parse(targetIDS);
          Array.isArray(idsObj.form) &&
            idsObj.form.forEach((id) => {
              if (pageContext[id] && pageContext[id].detailData) {
                app.db.save(
                  {
                    name: id + "TEMP_CACHE",
                    value: JSON.stringify(pageContext[id].detailData),
                    cacheTime: new Date().getTime(),
                    expireTime: 1 * 60 * 60 * 1000,
                  },
                  function () {
                    console.log("insert editdata succ");
                  },
                );
              }
            });

          Array.isArray(idsObj.grid) &&
            idsObj.grid.forEach((id) => {
              if (pageContext[id] && pageContext[id].detailData) {
                app.db.save(
                  {
                    name: id + "TEMP_CACHE",
                    value: JSON.stringify(pageContext[id].listData),
                    cacheTime: new Date().getTime(),
                    expireTime: 1 * 60 * 60 * 1000,
                  },
                  function () {
                    console.log("insert editdata succ");
                  },
                );
              }
            });
        }
      }
    },
    async handleSpecialFun(event, configItem, data = {}, actionType, eventName, fieldIndex, dialogConfig) {
      let _this = this;
      if (configItem.ControlProperty.TopNavMenuId && this.position === "topTitleRight") {
        this.tryShowTopNav(configItem.ControlProperty.TopNavMenuId);
        return;
      }

      let params = {
        event,
        configItem,
        data,
      };

      //this.CacheTargetContainer(configItem); //缓存指定的容器数据
      //this.removeTargetContainerCache(configItem); //删除指定的缓存数据

      // 配置了OnClientClick属性，自定义按钮逻辑
      if (erowConfig.hasProp(configItem.ControlProperty, "OnClientClick")) {
        let funcName = configItem.ControlProperty.OnClientClick;
        if (funcName === "searchForm") {
          this.searchForm();
          return;
        }
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](params, this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](params, this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          window[fnObj][funcName](params, this, configItem); //eval(fnObj)
        }
        return;
      }

      // 配置了actionType属性
      if (erowConfig.hasProp(configItem.ControlProperty, "actionType") || actionType) {
        let type = (configItem.ControlProperty.actionType || actionType).toLowerCase();

        // dbAction直接调通用接口
        if (type === "dbaction") {
          const action = (params) => {
            let url = erowplatformBackendUrl + "/appBaseApi/sysLoadPostData";
            erRequest.post(
              url,
              params,
              (res) => {
                if (res.code == "SUCCESS") {
                  let SuccessMessage = configItem.ControlProperty.SuccessMessage;
                  let AfterDbAction = configItem.ControlProperty.AfterDbAction;
                  if (SuccessMessage) {
                    _this.$toast.success(SuccessMessage);
                  }
                  if (AfterDbAction) {
                    let funName = AfterDbAction;
                    _this.runSpeicalFun(funName, {
                      event,
                      configItem,
                      data,
                    });
                  }
                  // 刷新数据
                  let refreshContainerIds = configItem.ControlProperty.refreshContainerIds;
                  if (refreshContainerIds) {
                    updateIds = refreshContainerIds.split(",") || [];
                    updateIds.forEach((targetId) => {
                      pageContext[targetId].getData && pageContext[targetId].getData();
                    });
                  } else {
                    let url = window.location.href;
                    url = url.split("#");
                    window.location.replace(url[0]);
                    window.location.reload();
                  }
                } else {
                  this.$toast.fail(res.msg);
                }
              },
              (error) => {
                this.$toast.fail(error.msg);
              },
            );
          };
          let check_keyValues = Array.isArray(data)
            ? data
                .map((item) => {
                  return item[this.keyName];
                  // return item[this.config.keyValue];
                })
                .join(",")
            : data
              ? this.config.keyValue
              : // ? data[this.config.keyValue]
                "";
          let loadPostParams = {
            ctnrUID: configItem.ControlProperty.dbActionCtnrUid,
            menuConfigKey: configItem.menuConfigKey,
            // paramMap: data,
            paramMap: Array.isArray(data) && data.length ? data[0] : data,
            pValueSet: configItem.pValueSet,
            controlGUID: configItem.ControlProperty.DbActionCtnrGuid,
            opCode: "VIEW",
            check_keyValues: check_keyValues,
          };
          action(loadPostParams);
        }

        // dialogAction弹出弹框
        else if (type === "dialogaction") {
          let dialogActionUrl = configItem.ControlProperty.dialogActionUrl;
          let newParams2 = {};
          let fields = configItem.ControlProperty.paramterDataField ? configItem.ControlProperty.paramterDataField.split(",") : [];

          if (data && fields.length > 0) {
            fields.forEach((key) => {
              newParams2[key] = data[key];
            });
          } else {
            newParams2 = data;
          }

          if (dialogActionUrl) {
            // 自定义链接
            let title = configItem.ControlProperty.NewDialogTitle || "";

            pageManager.push(dialogActionUrl, {
              params: newParams2,
              title,
              formKey: data[configItem.ControlProperty.DialogKeyDataField],
              menu_row_guid: configItem.menuRowGuid,
              menuConfigKey: configItem.menuConfigKey,
              controlGUID: configItem.ControlProperty.DialogActionCtnrGuid,
            });
          } else {
            let dialogType = (configItem.ControlProperty.DialogType || "dialog").toLowerCase();

            let [fnCode, fnParameter, ctnrUID, pageMode] = configItem.ControlProperty.DialogActionCtnrUID.split(".");

            let controlGUID = configItem.ControlProperty.DialogActionCtnrGuid || "";
            let pValueSet = configItem.pValueSet || erowConfig.generateUUID();
            let keyValue = this.keyValue || configItem.keyValue || "";
            let commonPValueSet = configItem.pValueSet || "";
            if (configItem.ControlProperty.DialogActionCtnrUID[0] == ":") {
              if (erowConfig.hasProp(data, "dialogConfig")) {
                controlGUID = data.dialogConfig[configItem.ControlProperty.ID].dialogControlGuid;
              } else {
                controlGUID = dialogConfig ? dialogConfig[configItem.ControlProperty.ID].dialogControlGuid : "";
              }
              let ctnrField = configItem.ControlProperty.DialogActionCtnrUID.slice(1);
              let relativeId = this.idMap[ctnrField];
              let value = data[relativeId] || data[ctnrField];
              [fnCode, fnParameter, ctnrUID, pageMode] = value.split(".") || "";
              if (fieldIndex >= -1 && configItem.ControlProperty.Separator) {
                //多个超链接
                [fnCode, fnParameter, ctnrUID, pageMode] =
                  data[configItem.ControlProperty.DialogActionCtnrUID.slice(1)].split(configItem.ControlProperty.Separator)[fieldIndex].split(".") ||
                  "";
              }
              if (erowConfig.hasProp(data, "dialogConfig")) {
                pValueSet =
                  data.dialogConfig[configItem.ControlProperty.ID].dialogPValueSet || dialogConfig[configItem.ControlProperty.ID].dialogPValueSet;
              } else {
                pValueSet = dialogConfig ? dialogConfig[configItem.ControlProperty.ID].dialogPValueSet : erowConfig.generateUUID();
              }
            }
            if (configItem.ControlProperty.DialogKeyDataField) {
              let field = configItem.ControlProperty.DialogKeyDataField;
              //取控件ID
              let otherField = this.idMap && this.idMap[field] ? this.idMap[field] : "xxxxxx";
              //优先从字段Field取，取不到从ID取
              let tempValue = data[field] || data[otherField];
              if (fieldIndex >= -1 && configItem.ControlProperty.Separator) {
                keyValue = tempValue.split(configItem.ControlProperty.Separator)[fieldIndex];
              } else {
                keyValue = tempValue;
              }
            }
            let IsNeedNewPValueSet = configItem.ControlProperty.IsNeedNewPValueSet;
            if (configItem.ControlProperty.dialogPValueSet && IsNeedNewPValueSet == "true") {
              //重新从sysLoadConfigData中取一次dialogPValueSet
              await this.getDialogPValueSet(configItem).then((res) => {
                console.log(res);
                commonPValueSet = res;
              });
            }
            //已选中数据,存放弹窗中已选中数据的主键
            let check_keyValues = [];

            if (configItem.ControlProperty.FieldMapping) {
              let FieldMapping = JSON.parse(configItem.ControlProperty.FieldMapping);
              if (configItem.ControlProperty.RelativeContainer) {
                try {
                  let refVm = pageContext[configItem.ControlProperty.RelativeContainer];
                  if (FieldMapping.parentKeyField && refVm) {
                    let list = [];
                    if (refVm.config.ControlCode == "UcJsGridContainer") {
                      list = refVm.listData;
                    }
                    if (list.length) {
                      let result = [];
                      list.forEach((onedata) => {
                        result.push(onedata);
                      });
                      check_keyValues = result;
                    }
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            }
            //添加打开弹窗传递参数逻辑
            let searchParams = {};
            if (configItem.ControlProperty.DialogDefaultSearchFields) {
              let obj = JSON.parse(configItem.ControlProperty.DialogDefaultSearchFields);
              if (configItem.ControlProperty.RelativeContainer) {
                try {
                  let refVm = pageContext[configItem.ControlProperty.RelativeContainer];

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
                if (Array.isArray(obj) && data) {
                  obj.forEach((item) => {
                    let id = "";
                    if (this.idMap && this.idMap[item.sourceKey]) {
                      id = this.idMap[item.sourceKey];
                    }
                    searchParams[item.targetKey] = data[item.sourceKey] || data[id];
                  });
                }
              }
            }
            //添加带出默认值逻辑
            let defaultValueObj = {};
            let boundFields = configItem.ControlProperty.DialogDefaultValueFields || configItem.ControlProperty.DialogBoundFieldValue;
            if (boundFields) {
              let obj = JSON.parse(boundFields);
              if (Array.isArray(obj) && data) {
                obj.forEach((item) => {
                  let id = "";
                  let sourceKey = item.sourceKey || item.parentField;
                  let targetKey = item.targetKey || item.dialogField;
                  if (this.idMap && this.idMap[sourceKey]) {
                    id = this.idMap[sourceKey];
                  }
                  defaultValueObj[targetKey] = data[sourceKey] || data[id];
                });
              }
            }
            //判断是否可以打开
            if (configItem.ControlProperty.ClientActionParams) {
              let ClientActionParams = configItem.ControlProperty.ClientActionParams ? JSON.parse(configItem.ControlProperty.ClientActionParams) : {};

              if (ClientActionParams["oncardClick"]) {
                let paramsMap = ClientActionParams["oncardClick"];
                if (paramsMap["disableToDetailField"]) {
                  if (data[paramsMap["disableToDetailField"]] != -1) {
                    this.$toast.fail(data[paramsMap["alertMessageField"]]);
                    return;
                  }
                }
              }
            }
            // 打开新页面
            if (dialogType === "page") {
              pageManager.push("./detail.html", {
                menu_row_guid: configItem.menuRowGuid || "",
                menuConfigKey: configItem.menuConfigKey || "",
                controlGUID,
                CtnrUID: ctnrUID || "",
                pValueSet,
                pageMode: pageMode || "VIEW",
                keyValue,
                fnCode: fnCode || "",
                fnParameter: fnParameter || "",
                detailData: newParams2,
                rootControlGuid: controlGUID,
                commonPValueSet,
                searchParams: searchParams,
                check_keyValues: check_keyValues,
                defaultValueObj: defaultValueObj,
              });
            }
            // 在原页面打开
            else if (dialogType === "selfpage") {
              pageManager.replace("./detail.html", {
                menu_row_guid: configItem.menuRowGuid || "",
                menuConfigKey: configItem.menuConfigKey || "",
                controlGUID,
                CtnrUID: ctnrUID || "",
                pValueSet,
                pageMode: pageMode || "VIEW",
                keyValue,
                fnCode: fnCode || "",
                fnParameter: fnParameter || "",
                detailData: newParams2,
                rootControlGuid: controlGUID,
                commonPValueSet,
                searchParams: searchParams,
                check_keyValues: check_keyValues,
                defaultValueObj: defaultValueObj,
              });
            } else if (dialogType === "dialog") {
              // 弹窗
              const keyValue2 =
                keyValue ||
                (this.containerdata &&
                  this.config.ControlProperty.DialogKeyDataField &&
                  this.containerdata[this.config.ControlProperty.DialogKeyDataField]);

              apis.sysLoadConfigData({
                vm: this,
                params: {
                  menuRowGuid: configItem.menuRowGuid || "",
                  controlGUID,
                  // ctnrUID: ctnrUID || "",
                  pageMode: pageMode || "VIEW",
                  // fnCode: fnCode || "",
                  // fnParameter: fnParameter || "",
                  pValueSet,
                  commonPValueSet,
                  keyValue,
                },
                success: (res) => {
                  let temp = {
                    keyValue: keyValue2 || "",
                    menuConfigKey: configItem.menuConfigKey,
                    pValueSet: configItem.pValueSet,
                    menuRowGuid: configItem.menuRowGuid,
                    pageMode: pageMode || "VIEW",
                    rootControlGuid: controlGUID,
                    searchParams: searchParams,
                    check_keyValues: check_keyValues,
                    defaultValueObj: defaultValueObj,
                  };
                  if (configItem && configItem.ControlProperty && configItem.ControlProperty.AfterLayerClose) {
                    let funName = configItem.ControlProperty.AfterLayerClose;
                    temp["AfterLayerClose"] = (params) => {
                      apis.runSpeicalFun({ vm: _this, funName, params });
                    };
                  }
                  pageContext.root.addLayer(Object.assign(temp, res.data));
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
            }
          }
        }
      } else if (
        this.$parent &&
        this.$parent.$parent &&
        this.$parent.$parent.config &&
        this.$parent.$parent.config.ControlCode == "UcCardContainer"
      ) {
        this.$parent.$parent.opClick();
      }
    },
    // 重新获取dialogPValueSet
    getDialogPValueSet(configItem) {
      let _this = this;
      let controlGUID = this.config.ControlGUID;
      if(this.config.ControlCode!='UcButtonContainer'){
        //说明是子控件  
        if(this.parentConfig){
          controlGUID = this.parentConfig.ControlGUID;
        }
      }
      const params = {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID,
          pageMode: this.config.pageMode,
          pValueSet:this.config.pValueSet,
          fnCode: this.config.ControlProperty.FnCode || "",
          fnParameter: this.config.ControlProperty.FnParameter || "",
          ctnrUID: this.config.ControlProperty.CtnrUID || "",
      };
      return  new Promise((resolve, reject) => {
        apis.sysLoadConfigData({
          vm: this,
          params,
          success: (res) => {
            if(res.code=='SUCCESS'){
              let childContainers = res.data.ChildContainers;
              let dialogPValueSet = "";
              childContainers.forEach((child) => {
                if (child.ControlProperty.ID == configItem.ControlProperty.ID) {
                  dialogPValueSet = child.ControlProperty.dialogPValueSet;
                }
              });
              resolve(dialogPValueSet);
            }
            else{
              this.$toast.fail(res.msg);
              reject(res);  
            }
          },
          fail: (error) => {
            this.$toast.fail(error.msg);
            reject(error);
          },
          error: (error) => {
            this.$toast.fail(error.msg);
            reject(error);
          },
        });
      })
    },
    getParams(type, childContainers, refContainer, resutlMap = {}, controlGuids = []) {
      childContainers.forEach((configItem) => {
        if (configItem.ControlCode == "UcFormDetailView") {
          if (configItem.ControlProperty.ID) {
            let id = configItem.ControlProperty.ID;
            let target = refContainer.$refs[id] ? refContainer.$refs[id][0] : null;
            if (target) {
              resutlMap[id] = erowConfig.deepClone(target.detailData);
              controlGuids.push(configItem.ControlGUID);
              if (type == "EDITSAVE" && configItem.ControlProperty.EnableSaveCheckRequired == "false") {
                this.errorCount = 0;
              } else {
                if (this.config.pageMode == "ADD") {
                  let num = erowConfig.validateForm(resutlMap[id], target.rulesById);
                  this.errorCount += num;
                } else {
                  let num = erowConfig.validateForm(resutlMap[id], target.rulesById);
                  this.errorCount += num;
                }
              }

              Object.keys(resutlMap[id]).forEach((key) => {
                if (Object.prototype.toString.call(resutlMap[id][key]) == "[object Boolean]") {
                  resutlMap[id][key] = resutlMap[id][key] ? -1 : 0;
                }
              });
            }
          }
        } else if (configItem.ControlCode == "UcTabGroup") {
          let childs = refContainer.$refs[configItem.ControlProperty.ID][0].config.ChildContainers;
          let childRef = refContainer.$refs[configItem.ControlProperty.ID][0];
          this.getParams(type, childs, childRef, resutlMap, controlGuids);
        } else if (configItem.ControlCode == "UcJsGridContainer") {
          if (configItem.ControlProperty.ID) {
            let id = configItem.ControlProperty.ID;
            let target = refContainer.$refs[id] ? refContainer.$refs[id][0] : null;
            if (target) {
              controlGuids.push(configItem.ControlGUID);
              resutlMap[id] = erowConfig.deepClone(target.detaildata);
              let tempId = id.replace("C", "D");
              resutlMap[tempId] = erowConfig.deepClone(target.deletedListWidthID);

              // 检验jsGird每一行数据的必填项
              let form = configItem.ChildContainers.find((item) => {
                return item.ControlCode == "UcFormDetailView";
              });
              if (form) {
                resutlMap[id].forEach((data, rindex) => {
                  let num = erowConfig.validateForm(data, target.$refs[form.ControlProperty.ID][rindex].rulesById);
                  this.errorCount += num;
                });
              } else {
                resutlMap[id].forEach((data) => {
                  let num = erowConfig.validateForm(data, target.rulesById);
                  this.errorCount += num;
                });
              }
            }
          }
        } else if (configItem.ControlCode == "UcPageListContainer") {
          if (configItem.ControlProperty.ID) {
            let id = configItem.ControlProperty.ID;
            let target = refContainer.$refs[id] ? refContainer.$refs[id][0] : null;
            if (target) {
              let list = [];
              if (target.$refs.card && Array.isArray(target.$refs.card)) {
                target.$refs.card.forEach((cardVm) => {
                  //只有card可编辑时才传参
                  if (cardVm.isCanEdit) {
                    list.push(cardVm.detailData);
                  }
                });
              }
              if (list.length) {
                controlGuids.push(configItem.ControlGUID);
                resutlMap[id] = list;
                let tempId = id.replace("C", "D");
                resutlMap[tempId] = []; //pageList删除的数组传空，不存在前端删除
              }
            }
          }
        } else if (configItem.ControlCode == "UcContainer") {
          if (refContainer.$refs[configItem.ControlProperty.ID] && refContainer.$refs[configItem.ControlProperty.ID].length) {
            this.getParams(type, configItem.ChildContainers, refContainer.$refs[configItem.ControlProperty.ID][0], resutlMap, controlGuids);
          }
        } else if (configItem.ControlCode == "UcDataListContainer") {
          if (configItem.ControlProperty.ID) {
            controlGuids.push(configItem.ControlGUID);
            let id = configItem.ControlProperty.ID;
            let target = refContainer.$refs[id][0];
            resutlMap[id] = erowConfig.deepClone(target.formList);
          }
        }
      });

      return {
        paramMap: resutlMap,
        controlGuids: controlGuids.join(","),
        errorCount: this.errorCount,
      };
    },
    genertePageContext() {
      if (!window.pageContext) {
        window.pageContext = {};
      }
      if (this.config && this.config.ControlProperty) {
        if(this.config.ControlProperty.ID) window.pageContext[this.config.ControlProperty.ID] = this;
        if(this.config.ControlProperty.CtnrUID) window.pageContext[this.config.ControlProperty.CtnrUID] = this;
        if(this.config.ControlCode) window.pageContext[this.config.ControlCode] = this;
      }
    },
    activeClassWidthWrap(config = this.config, data = this.initData, wrapper) {
      //加了wrapper 表明是子控件外部包裹元素样式类
      let initClass = this.activeClass(config, data);
      if (initClass) {
        let cArr = initClass.split(" ").reduce((pre, citem) => {
          pre.push(citem + "--" + wrapper);
          return pre;
        }, []);
        return cArr.join(" ");
      } else {
        return "";
      }
    },
    activeClass(config = this.config, data = this.initData, wrapper) {
      //加了wrapper 表明是子控件外部包裹元素样式类
      const classList = [];
      // CssClass指定类名
      if (config.ControlProperty && config.ControlProperty.CssClass) {
        classList.push(config.ControlProperty.CssClass);
      } else if (config.CssClass) {
        let temp = config.CssClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          let funcName = config.CssClass;
          if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
            classList.push(baseSpecial[funcName](config, this));
          } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
            classList.push(erowSpecial[funcName](config, this));
          }
          //classList.push(erowSpecial[config.CssClass](config, data));
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

      if (wrapper) {
        classList.forEach((oneclass, index) => {
          // classList[index] = wrapper + "_" + oneclass;
          classList[index] = oneclass
            .split(" ")
            .map((item) => wrapper + "_" + item)
            .join(" ");
        });
      }

      // 返回类名：动态获取类名 > ClientClass > CssClass
      return classList.join(" ");
    },
    isShowOp(itemConfig) {
      if (!itemConfig) {
        console.warn("item's config is undefined!");
        return;
      }
      const pageMode = this.config.pageMode ? this.config.pageMode.toUpperCase() : "";
      // 新增状态
      if (itemConfig.ControlProperty.hasOwnProperty("IsVisibleWhenAdd") && pageMode == "ADD") {
        let isVisibleAdd = itemConfig.ControlProperty.IsVisibleWhenAdd;
        if (isVisibleAdd) {
          return ("" + isVisibleAdd).toLowerCase() == "true";
        } else {
          return false;
        }
      } else if (
        // 编辑状态
        itemConfig.ControlProperty.hasOwnProperty("IsVisibleWhenEdit") &&
        pageMode == "EDIT"
      ) {
        let isVisibleEdit = itemConfig.ControlProperty.IsVisibleWhenEdit;
        if (isVisibleEdit) {
          return ("" + isVisibleEdit).toLowerCase() == "true";
        } else {
          return false;
        }
      } else if (
        // 查看状态
        itemConfig.ControlProperty.hasOwnProperty("IsVisibleWhenView") &&
        pageMode == "VIEW"
      ) {
        let isVisibleView = itemConfig.ControlProperty.IsVisibleWhenView;
        if (isVisibleView) {
          return ("" + isVisibleView).toLowerCase() == "true";
        } else {
          return false;
        }
      }

      // 其它情况下默认显示按钮
      return true;
    },
    getviewPosition(config) {
      let textAlign = "";
      if (erowConfig.hasProp(config.ControlProperty, "Position")) {
        textAlign = config.ControlProperty.Position;
      } else if (erowConfig.hasProp(config.ControlProperty, "TextAlign")) {
        textAlign = config.ControlProperty.TextAlign;
      }
      if (textAlign) textAlign = textAlign.toLocaleLowerCase();
      let map = {
        left: "",
        right: "justify-content: flex-end;",
        middle: "justify-content: space-around;",
        center: "justify-content: space-around;",
      };
      return map[textAlign] ? map[textAlign] : "";
    },
    getEye(item, data) {
      if (data[item.ControlProperty["StatusCode"]] == -1) {
        // return "../assets/images/public/blue-eye.png";
        return this.getImgFileUrl({ parentFilePath: "public", filename: "blue-eye", fileType: "png" });
      } else {
        // return "../assets/images/public/hui-eye.png";
        return this.getImgFileUrl({ parentFilePath: "public", filename: "hui-eye", fileType: "png" });
      }
    },
    getSensitiveImgShow(item) {
      if (["VIEW"].includes(item.pageMode)) {
        if (item.ControlProperty.ShowEyeTool) {
          if (item.ControlProperty.ShowEyeToolValueCode) {
            return this.detailData[item.ControlProperty.ShowEyeToolValueCode];
          }
          return true;
        }
        return false;
      }
      if (item.pageMode == "EDIT" && item.ControlProperty.IsReadOnlyWhenUpdate == "true") {
        return true;
      }
      return false;
    },
    //脱敏控件
    getSensitiveInfo(item, detailData, type) {
      let _this = this;
      if (item.isloading == true) {
        return Promise.resolve();
      }
      item.isloading = true;
      let paramMap = {
        keyValue: this.keyValue ? this.keyValue : this.config.keyValue ? this.config.keyValue : detailData["keyName"],
      };
      paramMap[item.ControlProperty.StatusCode] = detailData[item.ControlProperty.StatusCode] == -1 ? 0 : -1;
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadControlData";

      return new Promise((resolve, reject) => {
        erRequest.post(
          url,
          {
            menuRowGuid: this.config.menuRowGuid || "",
            controlGUID: this.parentConfig ? this.parentConfig.ControlGUID : this.$parent.config.ControlGUID, //取cardContainer的ControlGUID
            pageMode: this.config.pageMode || "view",
            paramMap: paramMap,
            subControlGUID: item.ControlGUID,
            pValueSet: this.config.pValueSet || erowConfig.generateUUID(),
          },
          (res) => {
            if (res.code == "SUCCESS") {
              let result = res.data[item.ControlProperty.ID];
              if (detailData[item.ControlProperty.StatusCode] == -1) {
                let decryData = erTool.decrypt(result.value, erUser.token, 16);
                detailData[item.ControlProperty.DataField] = decryData;
                if (type == "editConponent") {
                  _this.detailData[item.ControlProperty.ID] = decryData;
                } else {
                  _this.containerdata[item.ControlProperty.ID] = decryData;
                }
              } else {
                detailData[item.ControlProperty.DataField] = result.value;
                if (type == "editConponent") {
                  _this.detailData[item.ControlProperty.ID] = result.value;
                } else {
                  _this.containerdata[item.ControlProperty.ID] = result.value;
                }
              }
              detailData[item.ControlProperty.StatusCode] = result[[item.ControlProperty.StatusCode]];
              this.$emit("changeStatusCode", {
                code: result[[item.ControlProperty.StatusCode]],
                cardIdx: this.cardIdx,
              });
              item.isloading = false;
              resolve(res);
            } else {
              item.isloading = false;
              reject(res);
            }
          },
          (error) => {
            item.isloading = false;
            console.log(error);
            this.$toast.fail(error.msg);
            reject(error);
          },
        );
      });
    },
    isLink(item) {
      if (
        erowConfig.hasProp(item.ControlProperty, "DialogActionCtnrUID") ||
        erowConfig.hasProp(item.ControlProperty, "dialogCtnrUID") ||
        erowConfig.hasProp(item.ControlProperty, "NavigateUrl")
      ) {
        return true;
      } else {
        return false;
      }
    },
    isHtmlEncode(config) {
      return config.ControlProperty && config.ControlProperty.HtmlEncode && config.ControlProperty.HtmlEncode.toLowerCase() == "true" ? true : false;
    },
    getVisible(config = this.config, data) {
      if (config.ControlCode == "UcButton" && config.pageMode == "Edit" && config.ControlProperty.IsVisiableWhenEdit == "false") {
        return false;
      }

      if (config.ControlProperty.visibleToDataField) {
        if (this.containerdata && Object.keys(this.containerdata).length && !data) {
          data = this.containerdata;
        } else if(this.detailData && Object.keys(this.detailData).length){
          data = this.detailData
        } else if (this.initData && Object.keys(this.initData).length && !data) {
          data = this.initData;
        } else if (config._formPrimaryData && Object.keys(config._formPrimaryData).length && !data) {
          data = config._formPrimaryData;
        }
        if (data) {
          let visiableValue = data[config.ControlProperty.visibleToDataField] + "";
          return !["false", "0"].includes(visiableValue);
        } else {
          return true;
        }
      }

      return true;
    },
    // 用于 table 布局中隐藏 td
    visibleToDataField(config = this.config) {
      let data = "";
      let visibleToDataField = config.ControlProperty.visibleToDataField;
      if (visibleToDataField) {
        if (this.containerdata && Object.keys(this.containerdata).length) {
          data = this.containerdata;
        }else if(this.detailData && Object.keys(this.detailData).length){
          data = this.detailData
        } else if (this.initData && Object.keys(this.initData).length) {
          data = this.initData;
        } else if (config._formPrimaryData && Object.keys(config._formPrimaryData).length) {
          data = config._formPrimaryData;
        }
        if (data) {
          let temp = {};
          Object.keys(data).forEach((key) => {
            if (key && key.startsWith("C") && this.fieldMap && this.fieldMap[key]) {
              temp[this.fieldMap[key]] = data[key];
            }
          });
          let visiableVal = "";
          if (erowConfig.hasProp(temp, visibleToDataField)) {
            visiableVal = temp[visibleToDataField] + "";
          } else {
            visiableVal = data[visibleToDataField] + "";
          }
          let trueValue = ["true", "-1", "True", "TRUE"];
          return trueValue.includes(visiableVal) ? true : false;
        } else {
          return true;
        }
      }
      return true;
    },
    pullRefresh() {
      if (this.isHasEvent(this.config, "PullRefreshAction")) {
        let funcName = this.getEventFun(this.config, "PullRefreshAction");
        this.handleClientActionsWidthParams("", this.config, (data = {}), "", funcName);
      } else {
        this.searchForm();
      }
    },
    // 提示条
    getTooltipContent(configItem) {
      if (configItem.TipContent) {
        return configItem.TipContent;
      } else if (configItem.ControlProperty && configItem.ControlProperty.TipContent) {
        return configItem.ControlProperty.TipContent;
      } else {
        return "";
      }
    },
    getTooltipPlacement(configItem) {
      if (configItem.TipPosition) {
        return configItem.TipPosition;
      } else if (configItem.ControlProperty && configItem.ControlProperty.TipPosition) {
        return configItem.ControlProperty.TipPosition;
      } else {
        return "";
      }
    },
    getTooltipType(configItem) {
      if (configItem.TipType) {
        return configItem.TipType;
      } else if (configItem.ControlProperty && configItem.ControlProperty.TipType) {
        return configItem.ControlProperty.TipType;
      } else {
        return "";
      }
    },
    isShowTip(configItem) {
      return this.isInfoTip(configItem) || this.isWarningTip(configItem) || this.isQuestionTip(configItem);
    },
    isInfoTip(configItem) {
      const tipType = this.getTooltipType(configItem);
      return this.tooltipTypeConstants.INFO == tipType;
    },
    isWarningTip(configItem) {
      const tipType = this.getTooltipType(configItem);
      return this.tooltipTypeConstants.WARNING == tipType;
    },
    isQuestionTip(configItem) {
      const tipType = this.getTooltipType(configItem);
      return this.tooltipTypeConstants.QUESTION == tipType;
    },
    getItemTooltipType() {
      const { TipType, TipTypeField, containerdata: data } = this;
      const dynamicTipType = TipTypeField && erowConfig.hasProp(data, TipTypeField) ? data[TipTypeField] : "";
      return TipType || dynamicTipType;
    },
    getItemTooltipContent() {
      const { TipContent, TipContentField, containerdata: data } = this;
      const dynamicTipContent = TipContentField && erowConfig.hasProp(data, TipContentField) ? data[TipContentField] : "";
      return TipContent || dynamicTipContent;
    },
    isShowItemTip() {
      const configItem = {
        TipType: this.getItemTooltipType(),
        ControlProperty: {},
      };

      const tooltipContent = this.getItemTooltipContent();
      return this.isShowTip(configItem) && tooltipContent;
    },
    isItemInfoTip() {
      return this.isInfoTip({
        TipType: this.getItemTooltipType(),
        ControlProperty: {},
      });
    },
    isItemWarningTip() {
      return this.isWarningTip({
        TipType: this.getItemTooltipType(),
        ControlProperty: {},
      });
    },
    isItemQuestionTip() {
      return this.isQuestionTip({
        TipType: this.getItemTooltipType(),
        ControlProperty: {},
      });
    },
    handleTipClick() {
      this.tipVisible = true;
    },
    initTipHideEvent() {
      if (!this.isShowItemTip() || this.tipHideEvent) {
        return;
      }

      this.tipHideEvent = () => {
        this.tipVisible = false;
      };

      document.addEventListener(
        "touchmove",
        () => {
          this.tipHideEvent();
        },
        false,
      );
    },
    destoryTipHideEvent() {
      if (this.isShowItemTip() && this.tipHideEvent) {
        document.removeEventListener("touchmove", this.tipHideEvent);
      }
    },
    //UcHypeLink和UcHypeLinkField的通用方法，参考云端
    //UcLink的绑定方法，可配置弹出自定以弹框，也可执行其它前端方法
    showTargetLayer(item, data) {
      let _this = this;
      let parentVM = _this.$parent
      let paraObj = {};
      if (item.ControlProperty.hasOwnProperty("DataNavigateUrlFormatString")) {
        if (Object.prototype.toString.call(item.ControlProperty.DataNavigateUrlFormatString) == "[object String]") {
          item.ControlProperty.DataNavigateUrlFormatString = JSON.parse(
            item.ControlProperty.DataNavigateUrlFormatString
          );
        }
        Object.keys(item.ControlProperty.DataNavigateUrlFormatString).forEach((key) => {
          let val;
          if (key == "rowGuid") {
            val =
              data[item.ControlProperty.DataNavigateUrlFormatString[key]] || data[item.ControlProperty.NewAddTempGuid];
          } else {
            val = data[item.ControlProperty.DataNavigateUrlFormatString[key]];
          }
          if (val) {
            paraObj[key] = val;
          } else {
            paraObj[key] = key != "rowGuid" ? item.ControlProperty.DataNavigateUrlFormatString[key] : "";
          }
        });
        if (!paraObj.hasOwnProperty("fnCode")) {
          paraObj["fnCode"] = parentVM.config.cFnCode;
        }
      }
      if (item.ControlProperty.hasOwnProperty("DataLinkClientScriptFunction")) {
        let fun = item.ControlProperty.DataLinkClientScriptFunction;
        let isDyFun = fun && fun.trim().indexOf(":") == 0 ? true : false;
        if (isDyFun) {
          let dataFiled = fun.trim().substr(1, fun.length);
          let funName = data[dataFiled];
          if(funName){
            if(baseSpecial[funName]){
              baseSpecial[funName](data, _this, item)
            }else if(erowSpecial[funName]){
              erowSpecial[funName](data, _this, item)
            }
          }
        } else {
          let funName = item.ControlProperty.DataLinkClientScriptFunction
          if(funName){
            if(baseSpecial[funName]){
              baseSpecial[funName](data, _this, item)
            }else if(erowSpecial[funName]){
              erowSpecial[funName](data, _this, item)
            }
          }
        }
        return;
      }
      if (item.ControlProperty.hasOwnProperty("NavigateUrl")) {
        this.viewOnYJK({
          file_guid: _this.containerdata[item.ControlProperty.DataLinkFiled],
          instance_guid: _this.config._formPrimaryData.row_guid,
          fn_code: parentVM.config.FnCode,
        })
      }
    },
    viewOnYJK({ file_type, file_guid, instance_guid, fn_code, file_name, content_type, content_size, downloadStatus }, url) {
      if (file_type && file_type.toLowerCase() === "pdf" || content_type && content_type.toLowerCase() === "ofd") {
        let fileInfo = {
          file_type,
          file_guid,
          fn_code,
          instance_guid,
          pValueSet: this.config.pValueSet,
          file_name,
        };
        erJsBridge.setParameter("fileInfo", encodeURIComponent(JSON.stringify(fileInfo)), () => {
          window.location.href = `./FileViewer.html`;
        });
        return;
      }
      // 判断下载状态
      if (downloadStatus !== "Succeed") {
        let file = arguments[0];
        // 获取用户网络环境
        erJsBridge.getUserInterNetEnv(({ result: { netType }, resultFlag }) => {
          if (resultFlag === "-1") {
            if (netType === "MONET") {
              this.$dialog
                .confirm({
                  title: "提示",
                  message: `您当前处于 数据流量 网络环境下，文件大小预计${content_size},是否继续下载？`,
                })
                .then(() => {
                  this.$set(file, "view_icon_url", "../assets/images/icon/loading.png");
                  // 开始后台下载文件
                  erJsBridge.startAsyncDownloadInApp(url, file_name, file_guid, this.config.FnCode, "", (data) => {
                    if (data.resultFlag === "-1") {
                      if (data.result.downloadStatus === "Succeed") {
                        this.$set(file, "downloadStatus", data.result.downloadStatus);
                        this.$set(file, "view_icon_url", this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
                      }
                    }
                  });
                })
                .catch((e) => {
                  throw new Error("用户取消下载");
                });
            } else {
              // WIFI网络直接开始下载
              erJsBridge.startAsyncDownloadInApp(url, file_name, file_guid, this.config.FnCode, "", (data) => {
                if (data.resultFlag === "-1") {
                  if (data.result.downloadStatus === "Succeed") {
                    this.$set(file, "downloadStatus", data.result.downloadStatus);
                    this.$set(file, "view_icon_url", this.getImgFileUrl({ parentFilePath: "icon", filename: "view", fileType: "png" }));
                    this.$toast.success(`${file_name}下载完成`);
                  }
                }
              });
            }
          }
        });
      } else {
        erJsBridge.callThirdPartyToShowFile("", file_name, file_guid);
      }
    },
  },
  computed: {
    getEventHandlers() {
      return function (item, containerData, rowIndex = 0, colIndex = 0, type) {
        // val, item, rIndex, rData, cIndex, flag
        const handlers = {};
        let ClientActions = item.ControlProperty?.ClientActions;
        //AutoPostBackAction
        let AutoPostBackAction = item.ControlProperty?.AutoPostBackAction;
        if (AutoPostBackAction) {
          if (this.isString(AutoPostBackAction)) {
            AutoPostBackAction = JSON.parse(AutoPostBackAction);
          }
          if (typeof this.selectChange == "function") {
            handlers["change"] = (currentVal) => {
              if (type == "form") {
                this.selectChange(currentVal, item);
              } else {
                this.selectChange(currentVal, item, rowIndex, containerData, colIndex);
              }
            };
          }
        }
        if (ClientActions) {
          if (Object.prototype.toString.call(ClientActions) == "[object String]") {
            ClientActions = JSON.parse(ClientActions);
          }
          for (let [eventType, config] of Object.entries(ClientActions)) {
            eventType = eventType && eventType.startsWith("on") ? eventType.slice(2) : eventType;
            handlers[eventType] = (currentVal) => {
              // 构造自定义事件对象，包含索引和动态参数
              const customEvent = {
                currentVal,
                containerData, // 当前项数据
                controlItem: item,
                rowIndex,
                colIndex,
                eventType,
              };
              let handleraArr = config.split(",").filter(() => true);
              handleraArr.forEach((handler) => {
                if (this[handler]) {
                  this[handler](customEvent, this);
                } else {
                  if (typeof fnObj[handler] == "function") fnObj[handler](customEvent, this);
                  else {
                    console.log(`${handler}未定义`);
                  }
                }
              });
              // 调用对应的处理函数
            };
          }
        }
        return handlers;
      };
    },
    getRequired() {
      return function (item) {
        let val = item.ControlProperty.hasOwnProperty("IsRequired")
          ? item.ControlProperty.IsRequired == "true" || item.ControlProperty.IsRequired == "True" || item.ControlProperty.IsRequired == true
            ? "required"
            : "norequired"
          : "norequired";
        return val;
      };
    },
    getDisabled() {
      return function (item) {
        if (item.ControlProperty.hasOwnProperty("disabled")) {
          if (item.ControlProperty.disabled) {
            if (item.ControlProperty.disabled.toString().toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        }
        if (this.config.pageMode == "VIEW" && item.ControlProperty.IsCanEditWhenView == "true") {
          return false;
        }
        if (this.isincard && !this.isedit && this.$parent.isConfigSingleEdit) {
          //卡片内，没有点击卡片编辑，默认不可编辑
          return true;
        }
        if (this.config.pageMode == "VIEW") {
          if (erowConfig.hasProp(this.$props, "isedit")) {
            return !this.isedit;
          }
          //查看状态下支持个别字段允许编辑的情况
          return !this.getSubControlEditable(item);
          // return true;
        }
        let disabledField = item.ControlProperty.DataField + "_disable";
        if (this.containerdata && this.containerdata[disabledField]) {
          return [-1, "true"].includes(this.containerdata[disabledField]);
        }
        if (item.ControlProperty.hasOwnProperty("disabled")) {
          if (item.ControlProperty.disabled) {
            if (item.ControlProperty.disabled.toString().toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        }
        if (item.ControlProperty.hasOwnProperty("ReadOnly")) {
          if (item.ControlProperty.ReadOnly) {
            if (item.ControlProperty.ReadOnly.toString().toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        }
        if (this.config.pageMode == "ADD" && item.ControlProperty.hasOwnProperty("IsReadOnlyWhenInsert")) {
          if (item.ControlProperty.IsReadOnlyWhenInsert) {
            if (item.ControlProperty.IsReadOnlyWhenInsert.toString().toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        }
        if (this.config.pageMode != "ADD" && item.ControlProperty.hasOwnProperty("IsReadOnlyWhenUpdate")) {
          if (item.ControlProperty.IsReadOnlyWhenUpdate) {
            if (item.ControlProperty.IsReadOnlyWhenUpdate.toString().toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      };
    },
    getSubControlEditable(item) {
      return function (item) {
        if (item.ControlProperty.hasOwnProperty("IsReadOnlyWhenInsert")) {
          const IsReadOnlyWhenInsert = item.ControlProperty.IsReadOnlyWhenInsert.toLowerCase();
          if (IsReadOnlyWhenInsert && IsReadOnlyWhenInsert === "true") {
            return false;
          }
        }
        if (item.ControlProperty.hasOwnProperty("IsReadOnlyWhenUpdate")) {
          const IsReadOnlyWhenUpdate = item.ControlProperty.IsReadOnlyWhenUpdate;
          if (IsReadOnlyWhenUpdate && IsReadOnlyWhenUpdate.toLowerCase() === "true") {
            return false;
          }
        }
        if (item.ControlProperty.hasOwnProperty("IsReadOnlyWhenAdd")) {
          const IsReadOnlyWhenAdd = item.ControlProperty.IsReadOnlyWhenAdd;
          if (IsReadOnlyWhenAdd && IsReadOnlyWhenAdd.toLowerCase() === "true") {
            return false;
          }
        }
        const IsCanEditWhenView = item.ControlProperty.IsCanEditWhenView;
        return IsCanEditWhenView ? IsCanEditWhenView.toLowerCase() === "true" : false;
      };
    },
    pullRefreshDisabled() {
      return function (item) {
        if (item.ControlProperty.hasOwnProperty("AllowRefresh") && item.ControlProperty.AllowRefresh == "false") {
          return false;
        } else {
          return true;
        }
      };
    },
    TipType() {
      const { config = {} } = this;
      const { TipType, ControlProperty = {} } = config;
      const { TipType: TipTypeProxy } = ControlProperty;
      return TipTypeProxy || TipType;
    },
    TipTypeField() {
      const { config = {} } = this;
      const { TipTypeField, ControlProperty = {} } = config;
      const { TipTypeField: TipTypeFieldProxy } = ControlProperty;
      return TipTypeFieldProxy || TipTypeField;
    },
    TipContent() {
      const { config = {} } = this;
      const { TipContent, ControlProperty = {} } = config;
      const { TipContent: TipContentProxy } = ControlProperty;
      return TipContentProxy || TipContent;
    },
    TipContentField() {
      const { config = {} } = this;
      const { TipContentField, ControlProperty = {} } = config;
      const { TipContentField: TipContentFieldProxy } = ControlProperty;
      return TipContentFieldProxy || TipContentField;
    },
    TipPosition() {
      const { config = {} } = this;
      const { TipPosition, ControlProperty = {} } = config;
      const { TipPosition: TipPositionProxy } = ControlProperty;
      return TipPositionProxy || TipPosition;
    },
  },
  directives: {
    numFormat: function (el, binding, vnode) {
      const separator = binding.value || ",";
      if (el.innerHTML) {
        el.innerHTML = addThousandSeparator(el.innerText, separator);
      }
      el.addEventListener("focus", (e) => {
        const value = e.target.value;
        e.target.value = deleteThousandSeparator(value, separator);
      });
      el.addEventListener("blur", (e) => {
        const value = e.target.value;
        if (value.indexOf(",") === -1) {
          vnode.context.detailData[e.target.dataset.field] = value;
        }
        e.target.value = addThousandSeparator(value, separator);
      });
    },
  },
};
