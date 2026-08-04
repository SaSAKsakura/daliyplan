(function () {
  function showSearch(params, vm) {
    if (!params.configItem) params.configItem = erowConfig.deepClone(params);
    let paramsObj = {
      menuRowGuid: params.configItem.menuRowGuid,
      controlGUID: params.configItem.ControlProperty.DialogActionCtnrGuid,
      pageMode: "search",
      pValueSet: params.configItem.pValueSet,
    };
    if(window.activeTabScopeCtnr && window.activeTabScopeCtnr.ScopeCtnrGuid) {
      paramsObj.controlGUID = window.activeTabScopeCtnr.ScopeCtnrGuid;
    }
    apis.sysLoadConfigData({
      vm,
      params: paramsObj,
      success(res) {
        let temp = res.data;
        let title = res.data.ControlProperty.NewDialogTitle ? res.data.ControlProperty.NewDialogTitle : "查找";
        temp.TitleRSCode = title;
        temp.menuRowGuid = params.configItem.menuRowGuid;
        temp.pValueSet = params.configItem.pValueSet;
        temp.menuConfigKey = params.configItem.menuConfigKey;
        temp.flag = "searchContainer";
        temp.rootControlGuid=res.data.ControlGUID
        if(vm.config.searchParams) {
          temp.searchParams = vm.config.searchParams;
        }
        pageContext.root.addLayer(temp);
      },
    });
  }
  function confirmMutiSelect(params, vm) {
    //选择数据后回填到jsgrid
    // 获取选择的数据并追加
    console.log("confirmMutiSelect");
    let selectObjs = params.data.filter((item) => item.checked);
    const targetVm = window.pageContext[params.configItem.ControlProperty.ActionTargetID];
    let configItem = params.configItem;
    let rowDataKey = targetVm.rowDataKey;
    // 选择回填根据配置的DialogBoundFieldValue回填指定字段，不配置默认回填全部选择字段
    let reassign = (configItem, sourceList) => {
      if (configItem.ControlProperty.DialogBoundFieldValue) {
        try {
          let map = JSON.parse(configItem.ControlProperty.DialogBoundFieldValue);
          let result = [];
          if (Array.isArray(map) && Array.isArray(sourceList) && sourceList.length) {
            sourceList.forEach((row) => {
              let temp = {};
              map.forEach((item) => {
                if (erowConfig.hasProp(row, item.targetKey)) {
                  temp[item.sourceKey] = row[item.targetKey];
                }
              });
              //RowRights必须要给 不然控制台 form会报错
              if (erowConfig.hasProp(row, "RowRights")) {
                temp["RowRights"] = row["RowRights"];
              }
              if (!temp[rowDataKey]) {
                temp["tempGuid"] = erowConfig.generateUUID();
              }
              result.push(temp);
            });
            return result;
          }
        } catch (error) {
          console.log(error);
          return sourceList;
        }
      }
      return sourceList;
    };
    if (targetVm.config.ControlProperty.RepeatCondition) {
      // const currentConditionArr = targetVm.listData.map((item) => item[targetVm.config.ControlProperty.RepeatCondition]);
      // const repeatArr = selectObjs.filter((item) => currentConditionArr.includes(item[targetVm.config.ControlProperty.RepeatCondition]));
      // const repeatConditionArr = repeatArr.map((item) => item[targetVm.config.ControlProperty.RepeatCondition]);
      // repeatConditionArr.length && vm.$message("warning", `存在重复的项，已自动删除。`);
      // selectObjs = reassign(configItem, selectObjs);
      // //未重复项
      // let realList = selectObjs.filter((item) => !currentConditionArr.includes(item[targetVm.config.ControlProperty.RepeatCondition]));
      // targetVm.$set(targetVm, "listData", targetVm.listData.concat(realList));
      const repeatConditions = targetVm.config.ControlProperty.RepeatCondition.split(',')
      const currentConditionArr = targetVm.listData.map((item) => {
          const conditionObj = {};
          repeatConditions.forEach(cond => {
            if(item[cond]){
              conditionObj[cond] = item[cond];
            }
          });
          return conditionObj;
      });
      // 筛选重复的项
      const repeatArr = selectObjs.filter((item) => {
          return currentConditionArr.some(existing => {
              return repeatConditions.every(cond => {
                  return existing[cond] === (item[cond]);
              });
          });
      });
      // 筛选不重复的新项
      const newItems = selectObjs.filter((item) => {
          return !currentConditionArr.some(existing => {
              return repeatConditions.every(cond => {
                  return existing[cond] === (item[cond]);
              });
          });
      });
      if (repeatArr.length) {
          const repeatConditionArr = repeatArr.map((item) => 
              repeatConditions.map(cond => item[cond]).filter(v => v).join('-')
          );
          vm.$message("warning", `存在重复的项: ${repeatConditionArr.join(",")}，已自动删除。`);
      }
      
      targetVm.$set(
          targetVm,
          "listData",
          targetVm.listData.concat(newItems)
      );
    } else {

      selectObjs = reassign(configItem, selectObjs);
      targetVm.$set(
        targetVm,
        "listData",
        targetVm.listData.concat(selectObjs).map((item) => item)
      );
    }
    targetVm.$forceUpdate();
    // 关闭弹窗
    pageContext.root.removeLayer(vm.config);
  }

  function confirmDropDownMutiSelect(params, vm) {
    const selectObjs = params.data.filter((item) => item.checked);
    let relativeContainer = vm.config.ControlProperty.RelativeContainer;

    let ActionTargetID = params.configItem.ControlProperty.ActionTargetID;
    //ActionTargetID为表单内选择组件的ID
    let IDs = ActionTargetID.split("_");
    //如果是UcScopeContainer的弹窗 需要往下再找一层
    const targetParentVm =
      window.pageContext[IDs[0]].config.flag == "searchContainer" ? window.pageContext[IDs[0]].$children[0] : window.pageContext[IDs[0]];

    const targetVm = targetParentVm.$children.filter((item) => {
      return item.config.ControlProperty.ID === ActionTargetID;
    })[0];

    let DialogBoundFieldValues = targetVm.config.ControlProperty.DialogBoundFieldValue
      ? JSON.parse(targetVm.config.ControlProperty.DialogBoundFieldValue)
      : {};
    let tempObj = {};
    for (let BoundField of DialogBoundFieldValues) {
      let targetKey = BoundField.targetKey;
      let sourceKey = BoundField.sourceKey;
      let readId = "";
      for (let key in targetParentVm.fieldMap) {
        if (targetParentVm.fieldMap[key] == sourceKey) {
          readId = key;
          break;
        }
      }
      if (relativeContainer) {
        //单选清空
        if (pageContext[relativeContainer].config.ControlProperty.IsSelectable == "true") {
          if (!vm.currentLayer.gridCtnrUID) {
            targetParentVm.detailData[readId] = "";
          }
        }
      }
      let data = selectObjs.map((item) => item[targetKey] + "");
      if (targetVm.config.ControlProperty.RepeatCondition) {
        //重复项根据id判断
        let beforeData = targetParentVm.detailData[readId].split(",");
        let repeatConditionArr = [];
        for (let item of data) {
          if (beforeData.includes(item)) {
            repeatConditionArr.push(item);
          } else {
            beforeData.push(item);
          }
        }
        if (repeatConditionArr.length > 0) {
          vm.$message("warning", `存在重复的项，已自动删除。`);
        }
        targetParentVm.detailData[readId] = beforeData.join(",");
      } else {
        //判断是给哪个 给value 还是text
        if (vm.currentLayer.gridCtnrUID) {
          //如果是在jsgrid嵌套form的场景，
          tempObj[sourceKey] = data.join(",");
        } else {
          if (targetParentVm.detailData[readId]) {
            targetParentVm.detailData[readId] = [...targetParentVm.detailData[readId].split(","), ...data].join(",");
          } else {
            targetParentVm.detailData[readId] = data.join(",");
          }
        }
      }
    }
    if (Object.keys(vm.currentLayer).length > 0 && vm.currentLayer.callback) {
      vm.currentLayer.callback(params);
    }
    //jsgrid 内的form
    if (vm.currentLayer.gridCtnrUID) {
      let targetGridVm = pageContext[vm.currentLayer.gridCtnrUID];
      let rindex = vm.currentLayer.rindex;
      let temp = erowConfig.deepClone(targetGridVm.listData[rindex]);
      temp = Object.assign(temp, tempObj);
      targetGridVm.listData.splice(rindex, 1, temp);
    }
    //回填后执行特殊事件
    if(targetVm){
       targetVm.handleClientActionsWidthParams({}, targetVm.config, targetVm.detailData, "", "change")
    }
    pageContext.root.removeLayer(vm.config);
  }

  function confirmDropDownMutiSelectInForm(params, vm) {
    const selectObjs = params.data.filter((item) => item.checked);
    let ActionTargetID = params.configItem.ControlProperty.ActionTargetID;
    let IDs = ActionTargetID.split("_");
    const targetParentVm = window.pageContext[IDs[0]];
    const targetVm = targetParentVm.$children.filter((item) => {
      return item.config.ControlProperty.ID === ActionTargetID;
    })[0];
    let idMap = targetParentVm.idMap;
    let DialogBoundFieldValues = targetVm.config.ControlProperty.DialogBoundFieldValue
      ? JSON.parse(targetVm.config.ControlProperty.DialogBoundFieldValue)
      : {};

    for (let BoundField of DialogBoundFieldValues) {
      let targetKey = BoundField.targetKey;
      let sourceKey = BoundField.sourceKey;
      let data = selectObjs.map((item) => item[targetKey] + "");

      if (targetVm.config.ControlProperty.RepeatCondition && targetParentVm.detailData[idMap[sourceKey]]) {
        let beforeData = targetParentVm.detailData[idMap[sourceKey]].split(",");
        let repeatConditionArr = [];
        for (let item of data) {
          if (beforeData.includes(item)) {
            repeatConditionArr.push(item);
          } else {
            beforeData.push(item);
          }
        }
        if (repeatConditionArr.length > 0) {
          // vm.$message("warning", `存在重复的项，已自动删除。`);
        }
        targetParentVm.detailData[idMap[sourceKey]] = beforeData.join(",");
      } else {
        if (targetParentVm.detailData[idMap[sourceKey]]) {
          targetParentVm.detailData[idMap[sourceKey]] = [...targetParentVm.detailData[idMap[sourceKey]].split(","), ...data].join(",");
        } else {
          targetParentVm.detailData[idMap[sourceKey]] = data.join(",");
        }
      }
    }
    pageContext.root.removeLayer(vm.config);
  }
  function confirmCoverDropDownMutiSelectInForm(params, vm) {
    const selectObjs = params.data.filter((item) => item.checked);
    let ActionTargetID = params.configItem.ControlProperty.ActionTargetID;
    let IDs = ActionTargetID.split("_");
    const targetParentVm = window.pageContext[IDs[0]];
    const targetVm = targetParentVm.$children.filter((item) => {
      return item.config.ControlProperty.ID === ActionTargetID;
    })[0];
    let idMap = targetParentVm.idMap;
    let DialogBoundFieldValues = targetVm.config.ControlProperty.DialogBoundFieldValue
      ? JSON.parse(targetVm.config.ControlProperty.DialogBoundFieldValue)
      : {};

    for (let BoundField of DialogBoundFieldValues) {
      let targetKey = BoundField.targetKey;
      let sourceKey = BoundField.sourceKey;
      let data = selectObjs.map((item) => item[targetKey] + "");
      targetParentVm.detailData[idMap[sourceKey]] = data.join(",");
    }
    pageContext.root.removeLayer(vm.config);
  }
  function showBigImage(params, vm) {
    let temp = {};
    temp.TitleRSCode = "文件预览";
    temp.menuRowGuid = params.configItem.menuRowGuid;
    temp.pValueSet = params.configItem.pValueSet;
    temp.menuConfigKey = params.configItem.menuConfigKey;
    temp.ControlCode = "FilePreviewContainer";
    temp.params = { fileList: [params.data] };
    temp.CssClass = "full-page";
    temp.pValueSet = vm.config.pValueSet;
    temp.fnCode = vm.config.fnCode;
    temp.flag = "hide-close-btn";
    pageContext.root.addLayer(temp);
  }

  function resetFormData(params, vm) {
    for (let key of Object.keys(params.data)) {
      if (erowConfig.isObject(params.data[key])) {
        params.data[key] = {};
      } else if (Array.isArray(erowConfig.isObject(params.data[key]))) {
        params.data[key] = [];
      } else {
        params.data[key] = "";
      }
    }
  }

  function simulateLogin(params, vm) {
    const user = params.data[0];
    if (user) {
      erRequest.post(
        "/token-manager/simulateLogin",
        {
          loginType: "mobile",
          rowGuid: user.row_guid,
          mobileType: "",
          appVersionNumber: "",
          uniqueId: "",
          pValueSet: vm.config.pValueSet,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            getErUserInfo((userInfo) => {
              let count = 0;
              function callback() {
                if (++count == 8) {
                  pageManager.push("./Default.html", {
                    pageMode: "VIEW",
                  });
                }
              }
              erJsBridge.setParameter("oldToken", userInfo.token, callback);
              erJsBridge.setParameter("oldUserId", userInfo.userId, callback);
              erJsBridge.setParameter("oldUserName", userInfo.userName, callback);
              erJsBridge.setParameter("oldUniqueID", userInfo.uniqueID, callback);
              erJsBridge.setParameter("token", res.data.token, callback);
              erJsBridge.setParameter("userId", res.data.userId, callback);
              erJsBridge.setParameter("userName", res.data.nativeName, callback);
              erJsBridge.setParameter("uniqueID", res.data.uniqueID, callback);
            });
          } else {
            console.log(res);
          }
        },
        (error) => {
          console.log(error);
          vm.$message("error", error.msg);
        }
      );
    } else {
      vm.$message("warning", "请先选择模拟用户！");
    }
  }

  function outSimulateLogin() {
    getErUserInfo((userInfo) => {
      let count = 0;
      function callback() {
        if (++count == 8) {
          pageManager.push("./Default.html", {
            pageMode: "VIEW",
          });
        }
      }
      erJsBridge.setParameter("token", userInfo.oldToken, callback);
      erJsBridge.setParameter("userId", userInfo.oldUserId, callback);
      erJsBridge.setParameter("userName", userInfo.oldUserName, callback);
      erJsBridge.setParameter("uniqueID", userInfo.oldUniqueID, callback);
      erJsBridge.setParameter("oldToken", "", callback);
      erJsBridge.setParameter("oldUserId", "", callback);
      erJsBridge.setParameter("oldUserName", "", callback);
      erJsBridge.setParameter("oldUniqueID", "", callback);
    });
  }

  //关闭弹窗
  function closeLayer(params, vm) {
    pageContext.root.removeLayer(vm.config);
  }
  //删除选中数据
  function deleteSelect(params, vm) {
    let _this = vm;
    let targetContainer = pageContext[vm.config.ControlProperty.RelativeContainer];
    console.log(targetContainer);
    let selectList = targetContainer.initDataList.filter((item) => {
      return item.checked;
    });
    if (!selectList.length) {
      vm.$toast.fail("请先选择操作项");
      return;
    }
    let paramMapObj = {};
    paramMapObj[targetContainer.config.ControlProperty.ID] = [];
    //将field 转为id
    for (let oneData of selectList) {
      let data = {};
      for (let child of targetContainer.firstChildContainer.ChildContainers) {
        let id = child.ControlProperty.ID;
        let datafield = child.ControlProperty.DataField;
        if (datafield) {
          data[id] = oneData[datafield] || "";
        }
      }
      paramMapObj[targetContainer.config.ControlProperty.ID].push(data);
    }
    let paramsInfo = {
      menuRowGuid: targetContainer.config.menuRowGuid,
      controlGUID: targetContainer.config.ControlGUID,
      pageMode: "DELETE",
      pValueSet: targetContainer.config.pValueSet,
      paramMap: paramMapObj,
    };
    let url = erowplatformBackendUrl + "/appBaseApi/sysDataAction";
    erRequest.post(
      url,
      paramsInfo,
      (res) => {
        if (res.code == "SUCCESS") {
          //刷新数据
          targetContainer.getPageListData();
        } else {
          _this.$toast.fail(res.msg);
        }
      },
      (error) => {
        _this.$toast.fail(error.msg);
      }
    );
  }

  function deleteData(params, vm) {
    //uccard删除
    let _this = vm;
    if (!vm.config.ControlProperty.ActionTargetID) {
      return;
    }
    let mode = "DELETE";
    let parentConfig = pageContext[vm.config.ControlProperty.ActionTargetID].config;

    let paramMapObj = {};
    //将field 转为id
    let data = {};
    for (let child of _this.parentConfig.ChildContainers) {
      let id = child.ControlProperty.ID;
      let datafield = child.ControlProperty.DataField;
      if (datafield) {
        data[id] = params.data[datafield] || "";
      }
    }
    paramMapObj[parentConfig.ControlProperty.ID] = data;
    console.log(data);

    let paramsInfo = {
      menuRowGuid: _this.config.menuRowGuid,
      controlGUID: parentConfig.ControlGUID,
      pageMode: mode,
      pValueSet: parentConfig.pValueSet,
      paramMap: paramMapObj,
    };
    let url = erowplatformBackendUrl + "/appBaseApi/sysDataAction";
    erRequest.post(
      url,
      paramsInfo,
      (res) => {
        if (res.code == "SUCCESS") {
          //刷新数据
          pageContext[vm.config.ControlProperty.ActionTargetID].getPageListData();
        } else {
          _this.$toast.fail(res.msg);
        }
      },
      (error) => {
        _this.$toast.fail(error.msg);
      }
    );
  }

  function getDistanceText(params, vm) {
    //处理导航距离数据
    erJsBridge.getGPS((rData) => {
      if (rData.resultFlag == "-1") {
        let gps = rData.result;
        if (!gps.lat && !gps.lon) {
          this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
          return;
        }
        let from = {
          lat: Number(gps.lat),
          lon: Number(gps.lon),
        };
        let to = {
          lat: Number(vm.cardFormData.gps_lat),
          lon: Number(vm.cardFormData.gps_lon),
        };
        if (!to.lat && !!to.lon) {
          vm.$toast.fail("未获取到目的地坐标");
          return "0米";
        }
        let distance = erTool.getPointDistance(from, to);
        if (distance > 999) {
          distance = (distance / 1000).toFixed(2) + "公里";
        } else distance = parseInt(distance) + "米";
        vm.initData.distance = distance;
      }
    });
  }

  function circularPieTotal(params, vm) {
    let option = params.option;
    option.series = option.series.reduce((pre, cur, index) => {
      let dataNum = 0;
      let dataArr = cur.data;

      dataArr.forEach((item) => {
        if (params.eventData.selected[item.name]) dataNum += item.value;
      });
      let title1 = option.title[0];
      title1.text = dataNum;
      option.title.splice(0, 1, title1);

      pre.push(cur);
      return pre;
    }, []);
    option.legend["selected"] = params.eventData.selected;

    params.chartInstance.setOption(option, false);
  }

  function copyText(params, vm) {
    let copyDataField = vm.config.ControlProperty.CopyDataField;
    erJsBridge.copyTextToClipboard(vm.containerdata[copyDataField], (res) => {
      vm.$toast.success("复制成功");
    });
  }

  function gotoHome() {
    pageManager.push("./Default.html");
  }

  function timerEndFunc(params, vm) {
    vm.$toast.success("计时器时间已到！");
    // pageManager.back();
  }

  function switchOpenAndClose(params, vm = {}) {
    const { parentConfig: { ControlCode: parentControlCode } = {} } = vm;
    vm.$emit("changeStatusCode", {
      code: "switchOpenAndClose",
    });
    return;
  }
  function dataListContainerSubmitBannerMode(params, vm) {
    // let config = params.configItem;
    let config = params;
    let ActionTargetID = config.ControlProperty.ActionTargetID;
    let targetContainer = window.pageContext[ActionTargetID];
    let fieldMap = targetContainer.$refs.form[0]._data.fieldMap;
    let formList = targetContainer._data.formList;
    let paramMap = formList.map((item) => {
      let res = {};
      Object.keys(fieldMap).forEach((item2) => {
        res[item2] = item[fieldMap[item2]];
      });
      return res;
    });
    // console.log({ paramMap,params,vm });
    let data = {
      paramMap: { [targetContainer.config.ControlProperty.ID]: paramMap },
      pValueSet: targetContainer.config.pValueSet,
      controlGUID: targetContainer.config.ControlGUID,
      menuRowGuid: targetContainer.config.menuRowGuid,
      pageMode: "EDIT",
    };
    // console.log({data}
    let url = erowplatformBackendUrl + "/appBaseApi/sysDataAction";
    let _this = this;
    erRequest.post(
      url,
      data,
      (res) => {
        if (res.code == "SUCCESS") {
          dataListCleanCacheBannerMode(targetContainer.config, vm);
          // targetContainer.config.ControlProperty.AfterEditSaveCallBack = 'submitAfterTest'
          const afterCb = targetContainer.config.ControlProperty.AfterEditSaveCallBack;
          afterCb && erowSpecial[afterCb](params, vm);
        } else {
          _this.$toast.fail(res.msg);
        }
      },
      (error) => {
        _this.$toast.fail(error.msg);
      }
    );
  }
  function dataListCleanCacheBannerMode(config, vm) {
    // let config = params
    // let ActionTargetID = config.ControlProperty.ActionTargetID;
    // let targetContainer = window.pageContext[ActionTargetID];
    config.ControlProperty.IsCacheContainerData = false;
    let cacheKey = apis.generateKey({
      controlGUID: config.controlGUID,
      keyValue: config.keyValue,
      userId: erUser.userId,
    });
    localStorage.removeItem(cacheKey);
  }

  function scanQrcode(params, vm) {
    erJsBridge.scanQrcode(function (data) {
      if (data.resultFlag == -1) {
        let m = decodeURI(data.result);
        let n = m.replace(/%3A/g, ":");
        let x = "{" + n.replace(/%2C/g, ",") + "}";
        let result = x;
        // 扫码返回的处理，在erowSpecial.showScanQrView进行
        if (erowSpecial.hasOwnProperty(showScanQrView)) {
          erowSpecial.showScanQrView(result, vm);
        }
      }
    });
  }

  function deleteFormAndBackList(params, vm) {
    let _this = vm;
    let paramsObj = {
      menuRowGuid: _this.config.menuRowGuid,
      controlGUID: _this.config.ControlGUID,
      pageMode: "DELETE",
      pValueSet: _this.config.pValueSet,
      keyValue: _this.config.keyValue,
    };
    let url = gqjErowplatformBackendUrl + "/appBaseApi/sysDataAction";
    erRequest.post(
      url,
      paramsObj,
      (res) => {
        if (res.code == "SUCCESS") {
          pageManager.back();
        } else {
          vm.$toast.fail(res.msg);
        }
      },
      (error) => {
        vm.$toast.fail(error.msg);
        this.$message("error", error.msg);
      }
    );
  }
  
/**
 * 请求并发控制
 * @param {Array} requests 请求的任务队列
 * @param {Number} concurrency 并发数
 */
  async function limitRequest(requests, concurrency){
    const results = []
    const executing = new Set()
    const processTask = async (task) => {
      const result = typeof task === "function"? task(): await task //只有function和promise会被处理
      const promise = Promise.resolve(result) 
      
      try {
        // 添加到执行集合
        executing.add(promise)
        
        const awaitResult = await promise
        return awaitResult
      } catch (error) {
        console.warn('任务执行失败！' + error)
        throw error
      } finally {
        executing.delete(promise)
      }
    }
    for(let i = 0; i < requests.length; i++){
      if(typeof requests[i] !== 'function' && !(requests[i] instanceof Promise)) continue
      if(executing.size >= concurrency){
        //达到并发数，先等待一个任务完成再继续执行下一个任务
        await Promise.race(executing)
      }
      //执行新任务
      const resultPromise = processTask(requests[i])
      results.push(resultPromise)
    }
    return Promise.allSettled(results) //allSetteld正常捕获异常但不阻塞主线程
  }

  function submitWorkInfo(params, vm) {
    pageContext[params.configItem.ControlProperty.relativeContainer].submitWorkInfo();
  }
  function getSearchParams(conProp, rowData, vm, RelativeContainer) {
    let searchParams = {};
    let tempArr = [];
    let relativeVm = pageContext[RelativeContainer] || null;
    if (erowConfig.hasProp(conProp, "DialogDefaultSearchFields")) {
      let DialogDefaultSearchFields = conProp.DialogDefaultSearchFields;
      tempArr = JSON.parse(DialogDefaultSearchFields);
      //顶部表单数据，若当前行(表单)数据没有则从顶部表单读取
      let currentDetail = vm.config._formPrimaryData;
      let relativeContainerData = relativeVm ? relativeVm.realFieldData : {};
      if (Array.isArray(tempArr)) {
        tempArr.forEach((fielItem) => {
          let sourceKey = fielItem.sourceKey || fielItem.parentField;
          let targetKey = fielItem.targetKey || fielItem.dialogField;
          //如果是搜索框的DataTextField 单独处理，将ucjsgrid 已有的数据传入
          if (erowConfig.hasProp(rowData, sourceKey) && rowData[sourceKey]) {
            searchParams[targetKey] = rowData[sourceKey];
          } else if (erowConfig.hasProp(relativeContainerData, sourceKey)) {
            searchParams[targetKey] = relativeContainerData[sourceKey];
          } else if (erowConfig.hasProp(currentDetail, sourceKey)) {
            searchParams[targetKey] = currentDetail[sourceKey];
          } else {
            searchParams[targetKey] = "";
          }
        });
      }
    }
    return searchParams;
  }

  function getSelectedData(boundFields, rows, spater = "|", isMerge = false) {
    let result = [];
    //合并情况下带出已选数据
    if (isMerge && rows.length == 1) {
      let rowData = rows[0];
      boundFields.forEach((item, index) => {
        let parentField = item.parentField || item.sourceKey;
        let dialogField = item.dialogField || item.targetKey;
        if (erowConfig.hasProp(rowData, parentField)) {
          let valueStr = rowData[parentField] + "";
          let valueArr = valueStr.split(spater);
          valueArr.forEach((item, index) => {
            let temp = result[index];
            if (temp) {
              temp[dialogField] = item;
              result.splice(index, 1, temp);
            } else {
              result.push({ [dialogField]: item });
            }
          });
        }
      });
    } else {
      rows.forEach((rowData) => {
        let tempObj = {};
        boundFields.forEach((item, index) => {
          let parentField = item.parentField || item.sourceKey;
          let dialogField = item.dialogField || item.targetKey;
          if (erowConfig.hasProp(rowData, parentField)) {
            let value = rowData[parentField];
            tempObj[dialogField] = value;
          }
        });
        result.push(tempObj);
      });
    }
    return result;
  }
   function openSelector(params, vm, isMultiSelect) {
    let targetVm = vm;
    let rowData = params.rowData; //当前行数据或表单数据
    let configItem = params.configItem;
    let rindex = params.rindex;
    let conProp = configItem.ControlProperty;
    let RelativeContainer = conProp.RelativeContainer;
    if (conProp.ActionTargetID) {
      targetVm = pageContext[conProp.ActionTargetID];
    }
    //找到所处容器
    //找DialogSelectCtnrUID
    //构建打开所需的参数：已选数据、重复情况、是否合并、字段映射、搜索参数、分隔符
    //触发控件是按钮时,DialogActionCtnrUID和DialogSelectCtnrUID等同，是选择组件则分别对应链接弹窗和编辑时选择器弹窗
    if ((targetVm && erowConfig.hasProp(conProp, "DialogSelectCtnrUID")) || erowConfig.hasProp(conProp, "DialogActionCtnrUID")) {
      let ControlCode = targetVm.config.ControlCode;
      let isGridContainer = ["UcGridviewContainer"].includes(ControlCode);
      let isJsGrid = ["UcJsGridContainer"].includes(ControlCode);
      let newPvalueSet = erowConfig.generateUUID();
      let commonPvalueset = configItem.pValueSet;
      const controlGUID = conProp.DialogSelectCtnrGuid || conProp.DialogActionCtnrGuid;
      //字段映射关系
      let FieldMapping = {};
      FieldMapping = conProp.FieldMapping ? JSON.parse(conProp.FieldMapping) : {};

      let DialogBoundFieldValue = [];
      if (conProp.DialogBoundFieldValue) {
        DialogBoundFieldValue = JSON.parse(conProp.DialogBoundFieldValue);
      }
      if (FieldMapping.values) {
        DialogBoundFieldValue = FieldMapping.values || [];
      }
      let temp = DialogBoundFieldValue.find((item) => {
        return item.parentField == FieldMapping.parentKeyField || item.sourceKey == FieldMapping.parentKeyField;
      });
      if (!temp) {
        DialogBoundFieldValue.push({
          parentField: FieldMapping.parentKeyField,
          dialogField: FieldMapping.dialogKeyField,
        });
      }
      //是否合并,jsgrid默认不合并，其余默认合并
      let isMerge = erowConfig.hasProp(FieldMapping, "isMerge")
        ? (FieldMapping.isMerge + "").toLocaleLowerCase() === "true"
        : (isJsGrid && isMultiSelect) || !isMultiSelect
        ? false
        : true;
      //是否允许重复
      let IsAllowRepeat = erowConfig.hasProp(conProp, "IsAllowRepeat") ? conProp.IsAllowRepeat : false; //jsgrid且回填多行不允许重复，其余默认允许重复
      //重复条件判断字段
      let RepeatCondition = "";
      if (IsAllowRepeat == "false" || IsAllowRepeat === false) {
        RepeatCondition = erowConfig.hasProp(conProp, "RepeatCondition") ? conProp.RepeatCondition : FieldMapping.parentKeyField || "";
      }
      //搜索参数
      searchParams = getSearchParams(conProp, rowData, vm, RelativeContainer);
      //已选数据
      let tempSelect = isJsGrid && !isMerge ? targetVm.listData : rowData ? [rowData] : [];
      tempSelect = tempSelect.filter((item) => item[FieldMapping.parentKeyField]); //选择器主键字段有值进入已选数据
      //如果jsgrid多选回显到一行，只传当前行数据
      let check_keyValues = getSelectedData(DialogBoundFieldValue, tempSelect, conProp.Separator, isMerge);
      let eventObj = {
        isMerge: isMerge,
        dialogBoundFieldValue: DialogBoundFieldValue,
        isAllowRepeat: IsAllowRepeat,
        repeatCondition: RepeatCondition,
        separator: conProp.Separator,
        parentKeyField: FieldMapping.parentKeyField,
        dialogKeyField: FieldMapping.dialogKeyField,
        isMultiSelect: isMultiSelect ? true : false,
        rindex: rindex,
      };

      let defautlConfig = {
        keyValue: "",
        menuConfigKey: configItem.menuConfigKey,
        pValueSet: newPvalueSet,
        menuRowGuid: configItem.menuRowGuid,
        pageMode: "VIEW",
        rootControlGuid: controlGUID,
        commonPValueSet: commonPvalueset,
        eventObj: eventObj,
        searchParams: searchParams,
        check_keyValues: check_keyValues,
        parentCtnrUID: targetVm.config.ControlProperty.CtnrUID,
        parentControlCode: targetVm.config.ControlCode,
      };
      if (erowConfig.hasProp(conProp, "AfterLayerClose")) {
        let funName = conProp.AfterLayerClose;
        defautlConfig.afterCloseLayer = (paramsObj) => {
          apis.runSpeicalFun({ vm: targetVm, funName: funName, params: { ...paramsObj, configItem } });
        };
        defautlConfig.afterCloseLayerFunName=funName;

      }

      apis.sysLoadConfigData({
        vm: targetVm,
        params: {
          menuRowGuid: configItem.menuRowGuid || "",
          controlGUID: controlGUID,
          pageMode: "VIEW",
          pValueSet: newPvalueSet,
          commonPValueSet: commonPvalueset,
          keyValue: "",
        },
        success: (res) => {
          let targetLayer = {
            ControlGUID:res.data.ControlGUID,
            ControlCode: "UcHTMLTemplate",
            ControlProperty: {
              TemplateCode: "Selector.js",
              CssClass: "full-page",
            },
            parentConfig: Object.assign(defautlConfig, res.data),
            rootControlGuid:res.data.ControlGUID
          };
          pageContext.root.addLayer(targetLayer);
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
      console.log("容器未找到");
    }
  }
  function openMultiSelector(parmas, vm) {
    openSelector(parmas, vm, true);
  }
  /**
   * 移动端下载文件
   * @param {Object} param0 
   * @param {Object} {cacheFileFold, downloadUrl} 
   * cacheFileFold --- 文件保存的位置：不传-存储应用缓存里（默认），download-用户的download目录，library-适用于图片的保存到相册，其它-存储到对应的目录
   * downloadUrl --- 自定义的下载地址
   * @param {object} vm 当前调用vm实例
   * @return {Promise} resolve一个Object，{status: -1 | 0 | 1, code: "Succeed" | "Failed", data: Object | null}
   * status --- 标识是在哪一阶段返回的结果： -1-下载阶段，0-异常阶段，1-未下载阶段
   * code --- 原生接口返回的状态信息
   * data --- 原生接口返回的数据信息
   * 异常时：reject异常信息
   */
  function downloadFile({ file_type, file_guid, instance_guid, fn_code, file_name, content_type, content_size, downloadStatus }, {cacheFileFold, downloadUrl}, vm){
    const resultObj = {
      status: 1,
      code: "Succeed",
      data: null
    }
    let url = downloadUrl
    if(!url){
      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      let enyfile_guid = erTool.encrypt(file_guid, token);
      url =
        baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(enyfile_guid) +
        "&pValueSet=" +
        encodeURIComponent(vm.config.pValueSet) +
        "&json=" +
        encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));
      if (fn_code) {
        url += "&fnCode=" + fn_code;
      }
      if (instance_guid) {
        instance_guid = erTool.encrypt(instance_guid, token);
        url += "&instanceGuid=" + encodeURIComponent(instance_guid);
      }
      if (vm.getControlGUID) {
        url += "&controlGuid=" + encodeURIComponent(vm.getControlGUID);
      }
      if (content_type == "ofd") {
        url += "&viewType=pdf";
      }
    }
    return new Promise((resolve, reject)=>{
      try {
        //先判断文件下载状态
        if(downloadStatus === "Succeed"){
          resolve(resultObj)
          return
        }else{
          let file = arguments[0]
          erJsBridge.getFileDownloadStatus(_, file_name, file_guid, (data)=>{
            if(data.resultFlag === "-1"){
              //这里判断的是缓存里是否已经下载了文件
              file.downloadStatus = data.result.downloadStatus
              if(data.result.downloadStatus === "Succeed"){
                if(cacheFileFold){
                  let imgTypes = ["png", "jpg"]
                  if(imgTypes.includes(file_type) && cacheFileFold === "library"){
                    //图片存储到相册里
                    erJsBridge.saveImgLibrary("", "onlineFile", url, (data)=>{
                      if(data.resultFlag === '-1'){
                        resultObj.status = -1
                        resultObj.data = data
                        resolve(resultObj)
                      }else{
                        resultObj.status = 0
                        resultObj.code = "Failed"
                        resultObj.data = data
                        resolve(resultObj)
                      }
                    })
                    return
                  }
                  erJsBridge.saveAs({fileGuid: file_guid, fileName: file_name, cacheType: "downLoad"}, (data)=>{
                    if(data.resultFlag === "-1"){
                      resultObj.status = -1
                      resultObj.data = data
                      resolve(resultObj)
                    }else{
                      resultObj.status = 0
                      resultObj.code = "Failed"
                      resultObj.data = data
                      resolve(resultObj)
                    }
                  })
                  return
                }
                resolve(resultObj)
                return
              }
            }
            //判断当前网络环境
            erJsBridge.getUserInterNetEnv(({result:  {netType}, resultFlag})=>{
              if(resultFlag === "-1"){
                if(netType === "MONET"){
                  vm.$dialog
                    .confirm({
                      title: "提示",
                      message: `您当前处于 数据流量 网络环境下，文件大小预计${content_size},是否继续下载？`,
                    }).then(()=>{
                      //根据文件类型-存储目录调用对应的原生方法下载文件
                      let imgTypes = ["png", "jpg"]
                      if(imgTypes.includes(file_type) && cacheFileFold === "library"){
                        //图片存储到相册里
                        erJsBridge.saveImgLibrary("", "onlineFile", url, (data)=>{
                          if(data.resultFlag === '-1'){
                            resultObj.status = -1
                            resultObj.data = data
                            resolve(resultObj)
                          }else{
                            resultObj.status = 0
                            resultObj.code = "Failed"
                            resultObj.data = data
                            resolve(resultObj)
                          }
                        })
                        return
                      }
                      erJsBridge.downloadFile({fileGuid: file_guid, fnCode: fn_code, fileName: file_name, fileUrl: url, cacheFileFold}, (data)=>{
                        if(data.resultFlag === "-1"){
                          if(data.result.downloadStatus === "Succeed"){
                            if(cacheFileFold){
                              erJsBridge.saveAs({fileGuid: file_guid, fileName: file_name, cacheType: "downLoad"}, (data)=>{
                                if(data.resultFlag === "-1"){
                                  resultObj.status = -1
                                  resultObj.code = "Succeed"
                                  resultObj.data = data
                                  resolve(resultObj)
                                }else{
                                  resultObj.status = 0
                                  resultObj.code = "Failed"
                                  resultObj.data = data
                                  resolve(resultObj)
                                }
                              })
                            }else{
                              resultObj.status = -1
                              resultObj.code = "Succeed"
                              resultObj.data = data
                              resolve(resultObj)
                            }
                          }else{
                            resultObj.status = 0
                            resultObj.code = "Failed"
                            resultObj.data = data
                            resolve(resultObj)
                          }
                        }
                      })
                    })
                }else{
                  //WIFI网络直接下载
                  //根据文件类型-存储目录调用对应的原生方法下载文件
                  let imgTypes = ["png", "jpg"]
                  if(imgTypes.includes(file_type) && cacheFileFold === "library"){
                    //图片存储到相册里
                    erJsBridge.saveImgLibrary("", "onlineFile", url, (data)=>{
                      if(data.resultFlag === '-1'){
                        resultObj.status = -1
                        resultObj.data = data
                        resolve(resultObj)
                      }else{
                        resultObj.status = 0
                        resultObj.code = "Failed"
                        resultObj.data = data
                        resolve(resultObj)
                      }
                    })
                    return
                  }
                  erJsBridge.downloadFile({fileGuid: file_guid, fnCode: fn_code, fileName: file_name, fileUrl: url, cacheFileFold}, (data)=>{
                    if(data.resultFlag === "-1"){
                      if(data.result.downloadStatus === "Succeed"){
                        if(cacheFileFold){
                          erJsBridge.saveAs({fileGuid: file_guid, fileName: file_name, cacheType: "downLoad"}, (data)=>{
                            if(data.resultFlag === "-1"){
                              resultObj.status = -1
                              resultObj.data = data
                              resolve(resultObj)
                            }else{
                              resultObj.status = 0
                              resultObj.code = "Failed"
                              resultObj.data = data
                              resolve(resultObj)
                            }
                          })
                        }else{
                          resultObj.status = -1
                          resultObj.data = data
                          resolve(resultObj)
                        }
                      }else{
                        resultObj.status = 0
                        resultObj.code = "Failed"
                        resultObj.data = data
                        resolve(resultObj)
                      }
                    }
                  })
                }
              }
            })
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  function autosaveInCard(params,vm){
      let cardVm = vm.$parent; //card的实例
      debugger;
      let formCode=["UcCardContainer","UcFormDetailView"];
      while (cardVm && cardVm.config && !formCode.includes(cardVm.config.ControlCode)) {
        cardVm = cardVm.$parent;
      }
      cardVm.autosave();
  }
   window.baseSpecial = {
    showSearch,
    confirmMutiSelect,
    confirmDropDownMutiSelect,
    confirmDropDownMutiSelectInForm,
    resetFormData,
    closeLayer,
    simulateLogin,
    outSimulateLogin,
    showBigImage,
    deleteData,
    deleteSelect,
    getDistanceText,
    copyText,
    circularPieTotal,
    gotoHome,
    timerEndFunc,
    switchOpenAndClose,
    scanQrcode,
    dataListContainerSubmitBannerMode,
    dataListCleanCacheBannerMode,
    deleteFormAndBackList,
    confirmCoverDropDownMutiSelectInForm,
    limitRequest,
    submitWorkInfo,
    openSelector,
    openMultiSelector,
    downloadFile,
    autosaveInCard
  };
})();
