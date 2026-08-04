var Selector = {
  template: `<div class="full-page">
       <template v-for="configItem in childContainers">
      <page-title-container @offsearch="handleOffSearch" v-if="configItem.ControlCode == 'UcPageTitleContainer'" :key="configItem.ControlGUID" :config="configItem">
      </page-title-container>
      <page-list-content-container
        :ref="'pageList'"
        v-if="configItem.ControlCode == 'UcPageListContainer'"
        :config="configItem"
        :key="configItem.ControlGUID"
        :selectedobj="selectedobj"
      ></page-list-content-container>
      <uc-scope-container
        :ref="configItem.ControlProperty.ID"
        v-if="configItem.ControlCode == 'UcScopeContainer'"
        :config="configItem"
        :key="configItem.ControlGUID"
      ></uc-scope-container>
    </template>
    <div class="uc-button-container">
         <van-button class="flex-1"
          @click.stop="confirmSelect"
          type="info" round size="small">
          确认
         </van-button>
      </div>
    </div>`,
  props: {
    containerData: {
      type: [Object, Array],
      default: () => {},
    },
    config: {
      type: [Object, Array],
      default: () => {},
    },
  },
  components: {
    "page-title-container": PageTitleContainer,
    "page-list-content-container": PageListContentContainer,
    "uc-scope-container": UcScopeContainer,
  },
  data() {
    return {
      childContainers: [],
      containerConfig: "",
      selectedobj: {
        selectedList: [],
        targetKey: "",
      },
      dialogkey: "",
    };
  },
  methods: {
    handleOffSearch() {
      //关闭弹窗时主动卸载发布订阅的search
      let pageListVm = this.$refs.pageList ? this.$refs.pageList[0] : null;
      if (pageListVm) {
        eventEmitter.off("search", pageListVm.handlerAfterSearch, { ctnrUID: pageListVm.config.CtnrUID });
      }
    },
    getRepeatFields(str) {
      let result = [];
      if (str) {
        if (str.indexOf(",") != -1) {
          result = str.split(",");
        } else if (str.indexOf("|") != -1) {
          result = str.split("|");
        } else {
          result = [str];
        }
      }
      return result;
    },
    getArrayDifferences(arr1, arr2, fields) {
      const generateKey = (obj) => {
        return fields
          .map((field) => {
            const value = obj[field];
            if (value === null || value === undefined) {
              return String(value);
            }
            if (typeof value === "object") {
              try {
                return JSON.stringify(value);
              } catch {
                return String(value);
              }
            }
            return String(value);
          })
          .join("|");
      };
      // 创建键的Set集合
      const keys1 = new Set(arr1.map((item) => generateKey(item)));
      const keys2 = new Set(arr2.map((item) => generateKey(item)));
      // 找出差异
      const onlyInArr2 = arr2.filter((item) => !keys1.has(generateKey(item)));
      return onlyInArr2;
    },
    convertCheckData(sourceData, dialogBoundFieldValue, idMap) {
      let result = sourceData.reduce((result, cur) => {
        let temp = {};
        for (let BoundField of dialogBoundFieldValue) {
          let targetKey = BoundField.dialogField || BoundField.targetKey;
          let sourceKey = BoundField.parentField || BoundField.sourceKey;
          if (targetKey) {
            temp[sourceKey] = cur[targetKey];
          }
        }
        if (Object.keys(temp).length) {
          result.push(temp);
        }
        return result;
      }, []);
      return result;
    },
    deleteTargeRows(listData, deleteData, fields, deletedList) {
      const generateKey = (obj) => {
        return fields
          .map((field) => {
            const value = obj[field];
            if (value === null || value === undefined) {
              return String(value);
            }
            if (typeof value === "object") {
              try {
                return JSON.stringify(value);
              } catch {
                return String(value);
              }
            }
            return String(value);
          })
          .join("|");
      };
      const deleteKeys = new Set(deleteData.map((item) => generateKey(item)));
      for (let i = listData.length - 1; i >= 0; i--) {
        let rowKey = generateKey(listData[i]);
        if (deleteKeys.has(rowKey)) {
          deletedList.push(listData[i]);
          listData.splice(i, 1);
        }
      }
    },
    confirmAndSaveInCard(paramsM, vm) {
      let parentVm = vm;
       parentVm.autosave();
    },
    confirmSelect() {
      let pageListVm = this.$refs.pageList[0];
      let deleteRows = pageListVm.deleteRows;
      let checkedData = pageListVm.checkedData;
      //回调
      let afterCloseLayer = this.containerConfig.afterCloseLayer;
      //父页面容器
      let parentCtnrUID = this.containerConfig.parentCtnrUID;
      let afterFunName = this.containerConfig.afterCloseLayerFunName;
      //eventObj相关属性配置,IsMerge,DialogBoundFieldValue
      const eventObj = this.containerConfig.eventObj;
      let formCode = ["UcFormDetailView", "UcCardContainer", "UcScopeViewContainer"];
      let gridCode = ["UcJsGridContainer", "UcGridviewContainer"];
      // {
      //   isMerge:true,
      //   dialogBoundFieldValue:[],
      //   isAllowRepeat:false,
      //   repeatCondition:"id|" ,
      //   separator:conProp.Separator,
      //   parentKeyField: FieldMapping.parentKeyField,
      //   dialogKeyField: FieldMapping.dialogKeyField,
      // };
      if (afterCloseLayer && typeof afterCloseLayer == "function" && !this[afterFunName]) {
        //若配置了afterCloseLayer则执行此回调，
        afterCloseLayer({ deleteRows: deleteRows, checkedData: checkedData });
      } else {
        //不配置默认走回填逻辑
        if (parentCtnrUID && pageContext[parentCtnrUID]) {
          let parentVm = pageContext[parentCtnrUID];
          let idMap = parentVm.idMap;
          let dialogBoundFieldValue = eventObj.dialogBoundFieldValue;
          let isMerge = eventObj.isMerge ? eventObj.isMerge : false;
          let repeatCondition = eventObj.repeatCondition;
          let separator = eventObj.separator || "|";
          let rindex = eventObj.rindex;
          let isMultiSelect = eventObj.isMultiSelect;
          let convertedCheckedData = this.convertCheckData(checkedData, dialogBoundFieldValue);
          //更新一行数据
          let updateOneData = (oldObj, idMap) => {
            for (let BoundField of dialogBoundFieldValue) {
              let targetKey = BoundField.dialogField || BoundField.targetKey;
              let sourceKey = BoundField.parentField || BoundField.sourceKey;
              let realField = idMap ? idMap[sourceKey] : sourceKey;
              if (isMerge) {
                let data = checkedData.map((item) => item[targetKey] + "");
                // oldObj[realField] = data.join(separator);
                this.$set(oldObj, realField, data.join(separator));
              } else {
                if (checkedData.length) {
                  // oldObj[realField] = checkedData[0][targetKey];
                  this.$set(oldObj, realField, checkedData[0][targetKey]);
                } else {
                  // oldObj[realField] = "";
                  this.$set(oldObj, realField, "");
                }
              }
            }
          };
          if (formCode.includes(parentVm.config.ControlCode)) {
            updateOneData(parentVm.detailData, idMap);
            if (this[afterFunName]) {
              this[afterFunName]({ deleteRows: deleteRows, checkedData: checkedData }, parentVm);
            }
          }
          if (gridCode.includes(parentVm.config.ControlCode)) {
            if (isMerge) {
              //多选合并更新行数据
              if (typeof rindex == "number" && rindex >= 0) {
                if (parentVm.listData.length) {
                  // let temp = parentVm.listData[rindex];
                  let temp = erowConfig.deepClone(parentVm.listData[rindex]);
                  updateOneData(temp);
                  parentVm.listData.splice(rindex, 1, temp);
                } else {
                  let obj = parentVm.createNewItem();
                  for (let BoundField of dialogBoundFieldValue) {
                    let targetKey = BoundField.dialogField || BoundField.targetKey;
                    let sourceKey = BoundField.parentField || BoundField.sourceKey;
                    let realField = sourceKey;
                    if (isMerge) {
                      let data = checkedData.map((item) => item[targetKey] + "");
                      obj[realField] = data.join(separator);
                    }
                  }
                  parentVm.listData.push(obj);
                }
              }
            } else {
              //将已选数据追加，注意是否允许重复,若覆盖存在把已填写数据覆盖的情况
              let repeatFields = this.getRepeatFields(repeatCondition); //判断重复数据的字段,一般用主键判断，可能业务上存在用多个字段判断是否重复的情况;
              //rIndex未传入说明触发选择器控件在容器外面，执行追加操作,删除操作
              if (isMultiSelect) {
                let newList = this.getArrayDifferences(parentVm.listData, convertedCheckedData, repeatFields);
                //转换已删除的数据
                let convertedDeleteData = this.convertCheckData(deleteRows, dialogBoundFieldValue);
                //将已取消勾选数据从listData中删除
                this.deleteTargeRows(parentVm.listData, convertedDeleteData, repeatFields, parentVm.deletedList);
                //批量添加
                let tempAddList = newList.reduce((result, cur) => {
                  let obj = parentVm.createNewItem();
                  obj = Object.assign(obj, cur);
                  result.push(obj);
                  return result;
                }, []);
                tempAddList.forEach((item) => {
                  parentVm.listData.push(item);
                });
              } else {
                //单选的场景，更新指定行数据，jsgrid 嵌套form场景
                if (typeof rindex == "number" && rindex >= 0) {
                  if (parentVm.listData.length) {
                    let temp = parentVm.listData[rindex];
                    temp = Object.assign(temp, convertedCheckedData[0]);
                    parentVm.listData.splice(rindex, 1, temp);
                  } else {
                    let tempAddList = convertedCheckedData.reduce((result, cur) => {
                      let obj = parentVm.createNewItem();
                      obj = Object.assign(obj, cur);
                      result.push(obj);
                      return result;
                    }, []);
                    tempAddList.forEach((item) => {
                      parentVm.listData.push(item);
                    });
                  }
                }
              }
            }
          }
          //jsgrid或这个ucgrid处理
          //在jsgrid外场景处理
          //在行内更新一行数据
          //在行内带出多条数据处理
          this.handleOffSearch();
          pageContext.root.removeLayer(this.config);
        }
      }
    },
  },
  created() {
    this.containerConfig = this.config.parentConfig;
    let tempArr = erowConfig.convertConfig(this.containerConfig.ChildContainers, {
      pValueSet: this.containerConfig.pValueSet,
      menuRowGuid: this.containerConfig.menuRowGuid,
      menuConfigKey: this.containerConfig.menuConfigKey,
      rootControlGuid: this.containerConfig.rootControlGuid,
      pageMode: this.containerConfig.pageMode,
      keyValue: this.containerConfig.keyValue,
      refreshFlag: this.containerConfig.refreshFlag,
      searchParams: this.containerConfig.searchParams,
      check_keyValues: this.containerConfig.check_keyValues,
      defaultValueObj: this.containerConfig.defaultValueObj,
    });
    debugger;
    tempArr.forEach((item, index) => {
      if (item.ControlCode == "UcPageListContainer") {
        console.log(item.ControlProperty.CtnrUID);
        if (this.containerConfig.eventObj.isMultiSelect) {
          //多选
          this.$set(item.ControlProperty, "IsSelectable", "");
          this.$set(item.ControlProperty, "SelectedMulti", "true");
        } else {
          //单选
          this.$set(item.ControlProperty, "IsSelectable", "true");
          this.$set(item.ControlProperty, "SelectedMulti", "");
        }
      }
      tempArr.splice(index, 1, item);
    });
    this.childContainers = tempArr;
    this.selectedobj = {
      selectedList: this.containerConfig.check_keyValues,
      targetKey: this.containerConfig.eventObj.dialogKeyField,
    };
    pageContext[this.containerConfig.ControlProperty.CtnrUID] = this;
  },
  beforeDestroy() {
    console.log("beforeDestroy");
  },
};
