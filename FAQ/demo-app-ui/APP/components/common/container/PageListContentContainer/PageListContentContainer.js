var PageListContentContainer = {
  name: "PageListContentContainer",
  mixins: [gridMinxin, commonMinxin],
  components: {
    "card-item-container": UcCardContainer,
    "uc-tag-filter": UcTagFilter,
  },
  /* html */
  template: `
    <div class="listContent" :class='getPageListClass()' v-if="!isHiddenPageList">
    <van-search
      v-if="serchControls.length"
      v-model="serchData"
      show-action
      :placeholder="serchControls[0].ControlProperty.PlaceHolderRSCode||'请输入'"
      @blur="onSearch(serchControls[0])"
      @search="onSearch(serchControls[0])"
    >
      <template #action>
        <div @click="onSearch(serchControls[0])">搜索</div>
      </template>
    </van-search>
      <van-dropdown-menu v-if="selectControl.length" active-color="#61b2ff">
        <template v-for="(controlItem,index) in selectControl">
          <van-dropdown-item :key="controlItem.ControlGuid" v-model="filterObj[controlItem.ControlProperty.DataField]" :options="headSourceObj[controlItem.ControlProperty.DataField]" />
        </template>
      </van-dropdown-menu>

      <template v-for="controlItem in filterControls">
        <van-tabs class="hideContent" v-if="controlItem.ControlCode=='UcHeadTabList'" v-model:active="filterObj[controlItem.ControlProperty.DataField]" :key="controlItem.ControlGUID">
          <van-tab v-for="(dataItem,index) in controlItem.ControlProperty.DataSourceList" :key="index" :title="getTitle(dataItem,controlItem) " :name="dataItem.value" />
        </van-tabs>
        <uc-tag-filter v-if="controlItem.ControlCode=='UcTagFilter'" type="page" @filterData="tagQuery" :config="controlItem" :initDataList="oldDataList.concat(containerDataObj[config.ControlProperty.ID]?containerDataObj[config.ControlProperty.ID].dataList:[])"></uc-tag-filter> 
        <van-radio-group class="my-radio-group" v-if="controlItem.ControlCode=='UcHeadRadioList'" v-model="filterObj[controlItem.ControlProperty.DataField]" direction="horizontal" :shape="'dot'">
          <van-radio :name="dataItem.value" v-for="(dataItem,index) in controlItem.ControlProperty.DataSourceList" :key="index">{{getTitle(dataItem,controlItem)}}</van-radio>
        </van-radio-group>
      </template>

      <div class="list-wrap" :class="activeClass()" @scroll.stop='handleScroll' ref='handleScroll'>
        <div v-if="config.Title" :class="config.TitleClass?config.TitleClass:'titleContainer'">
          <div class="title">{{ config.Title }}</div>
          <img class="arrow" src="../assets/images/home/arrowRightBlack.png" @click="handleSpecialFun(event,config,containerdata)" />
        </div>
        <div class="wrap-operation">
          <div>
            <div class="selectContainer" v-if="isMutiCheck">
              <van-checkbox :disabled="isDisableMutiSelect()" v-model="selectAll" @click.stop="toggllSelectAll">
              全选
              <template #icon="props">
                <img :src="getSelectAllStatusImg()" />
              </template>
              </van-checkbox>
            </div>
          </div>
           
          <div v-if="isShowTotal" class="total-size-container">
            <div class="total-size-label">
              共计：
            </div>
            <div class="total-size">
              {{ listSize }}
            </div>
            <div class="total-size-unit">
              条
            </div>
          </div>
        </div>
       <template v-if='!config.ControlProperty.categoryFiled'>
          <div class="pageList-category no-category">
            <div class="pageList-category-list" :class="generateCssStrByConfigAndCustom()">
                <div v-for="(dataItem, index) in initDataList" @click="pickerCard(dataItem, index)" :class="{active: pirckerIndex == index}" class="pageList-category-list-item">
                      <div class="pagelist-workflow-line" v-if="isRenderWorkflow"></div>
                      <img class="pagelist-workflow-icon" :src="getWorkflowIcon(dataItem)"  v-if="isRenderWorkflow"/>
                      <card-item-container
                        :ref="'card'"
                        :class="getCardClass(dataItem)"
                        :datafromlist="true"
                        :indexList="index"
                        :containerdata="dataItem"
                        :keyName='keyName'
                        :config="firstChildContainer"
                        :formcontroldata="formControlData"
                        :deletable="isRenderDelete"
                        :delete-overlay-visible="activeDeleteOverlayKey === getCardOverlayKey(dataItem, index)"
                        @delete-overlay-open="onCardDeleteOverlayOpen(getCardOverlayKey(dataItem, index))"
                        @delete-overlay-close="onCardDeleteOverlayClose"
                        @delete="onPageListCardDelete"
                        v-if="firstChildContainer.ControlCode == 'UcCardContainer'">
                      <van-checkbox :disabled="isDisableMutiSelect()" v-if="isMutiCheck" class='list-select-icon'>
                          <img slot="icon" @click.stop="itemMutiCheck(dataItem)" :src="getCheckItemStatusImg(dataItem.checked)" />
                        </van-checkbox>
                        <div v-if="isRadioCheck" class="list-select-icon">
                          <img slot="icon" @click="itemRadioSelect(dataItem)" :src="getRadioStatusImg(dataItem.checked)" />
                        </div>
                      </card-item-container>
                  </div>
                <div v-show='!disableGetData&&hadMore && ((!loading&&isLoading)||loading)' class='list-loading'>
                  <img :src="getImgFileUrl({parentFilePath: 'common', filename: 'loading', fileType: 'png'})" />
                  {{ hadMore ? '加载中...' : '' }}
                </div>
            </div>
          </div>
       </template>
       <template v-else>
          <div v-for="(category, index) in categorys" class="pageList-category" :class="category.isExpend?'categoryExpend':(config.ControlProperty.categoryFiled?'categoryHide':'')">
            <div v-if="category.name" :id="isShowAnchorList && anchorList[index] && anchorList[index].id" class="pageList-category-info" @click.stop="toggleGroup(category)"">
              {{category.name}}
              <span class="pageList-category-total">({{category.total}})</span>
              <img class="pageList-category-arrow" src="../assets/images/icon/arrowUpwards.png"/>
            </div>
            <div class="pageList-category-list" :class="generateCssStrByConfigAndCustom()" v-if="category.isExpend">
              <div v-for="(dataItem, index) in getFilterDataList(category.name).visibleItems" @click="pickerCard(dataItem, index)" :class="{active: pirckerIndex == index}" class="pageList-category-list-item">
                <card-item-container
                  :ref="'card'"
                  :indexList="index"
                  :containerdata="dataItem"
                  :datafromlist="true"
                  :keyName='keyName'
                  :config="firstChildContainer"
                  :deletable="isRenderDelete"
                  :delete-overlay-visible="activeDeleteOverlayKey === getCardOverlayKey(dataItem, index)"
                  @delete-overlay-open="onCardDeleteOverlayOpen(getCardOverlayKey(dataItem, index))"
                  @delete-overlay-close="onCardDeleteOverlayClose"
                  @delete="onPageListCardDelete"
                  v-if="firstChildContainer.ControlCode == 'UcCardContainer'">
                  <van-checkbox v-if="isMutiCheck" :disabled="isDisableMutiSelect()" class='list-select-icon'>
                    <img slot="icon" @click.stop="itemMutiCheck(dataItem)" :src="getCheckItemStatusImg(dataItem.checked)" />
                  </van-checkbox>
                  <div v-if="isRadioCheck" class="list-select-icon">
                    <img slot="icon" @click="itemRadioSelect(dataItem)" :src="getRadioStatusImg(dataItem.checked)" />
                  </div>
                </card-item-container>
              </div>
                 <!-- 加载更多指示器 -->
                <div 
                  v-if="getFilterDataList(category.name).hasMore"
                  class="item-loader list-loading"
                  :ref="'loader-' + category.name"
                >
                  <img :src="getImgFileUrl({parentFilePath: 'common', filename: 'loading', fileType: 'png'})" />
                  {{  '加载中...' }}
                </div>
            </div>
          </div>
       </template>

        <div v-if="listSize == 0 && !IsHiddenEmptyInfo && !isLoading && !loading" class="list-empty">
          <img :src="emptyImage" />
          <p>{{emptyText}}</p>
        </div>
        <!--锚点-分组相关-->
        <div class="pagelist-category-anchor" v-if="anchorList.length && isShowAnchorList">
          <span :class=" activeAnchor && activeAnchor.id ===anchor.id? 'anchor-active': ''" @click="hanldeAnchorClick(anchor)" v-for="(anchor, index) in anchorList">{{anchor.label}}</span>
        </div>
      </div>
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: [Object, Array],
    },
    isloaddata: {
      type: Boolean,
      default: true,
    },
    loading: {
      // 父组件加载状态
      type: Boolean,
      default: false,
    },
    selectedobj: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    dataList: {
      handler(val, oldVal) {
        //initDataList 等于dataList,多次分页后符合查询条件的值
        let _this = this;
        // 数据更新时重置懒加载状态
        if (val.length) {
          if (this.config.ControlProperty.SelectedMulti || this.config.ControlProperty.IsSelectable) {
            let IsSaveAndSetTopCheckedData = this.config.ControlProperty.IsSaveAndSetTopCheckedData;
            //列表主键字段
            let keyName = this.containerDataObj[this.config.ControlProperty.ID] ? this.containerDataObj[this.config.ControlProperty.ID].keyName : "";
            this.selectAll = false; //把全选还原成false
            if (this.tempScopeCache.checkedData) {
              this.checkedData = erowConfig.deepClone(
                val.filter((item) => {
                  return this.tempScopeCache.checkedData.includes(item[_this.keyName]);
                })
              );
              this.checkedData = this.checkedData.map((item) => {
                if (!item.hasOwnProperty("checked")) {
                  this.$set(item, "checked", true);
                } else {
                  item.checked = true;
                }
                return item;
              });
            }
            let check_keyValues =this.selectedobj?this.selectedobj.selectedList:this.config.check_keyValues;
            if (check_keyValues) {
              this.checkedData = check_keyValues.reduce((result, cur) => {
                let selectItem = cur;
                //找到列表中已选项的值数据的值，将其字段补充进已选数据中
                let temp = val.find((item1) => {
                  return item1[keyName] == selectItem[keyName];
                });
                if (temp) {
                  selectItem = Object.assign(selectItem, temp);
                }
                if (!selectItem.hasOwnProperty("checked")) {
                  this.$set(selectItem, "checked", true);
                } else {
                  selectItem.checked = true;
                }
                result.push(selectItem);
                return result;
              }, []);
            }
            if ((IsSaveAndSetTopCheckedData && IsSaveAndSetTopCheckedData.toLowerCase() == "true") || this.checkedData.length) {
              //配置了保留当前勾选项和置顶后，对数据进行处理
              //过滤不在勾选项的数据
              let tempArr = val.filter((item) => {
                let temp = this.checkedData.find((item1) => {
                  return item1[keyName] == item[keyName];
                });
                return !temp;
              });
              tempArr = tempArr.map((item) => {
                let data = erowConfig.deepClone(item);
                let flag = item.select_flag == -1 ? true : false;
                if (!data.hasOwnProperty("checked")) {
                  this.$set(data, "checked", flag);
                } else {
                  data.checked = data.checked == "true" ? true : false;
                }
                return data;
              });
              this.initDataList = [...this.checkedData, ...tempArr];
            } else {
              this.initDataList = val.map((item) => {
                let data = erowConfig.deepClone(item);
                let flag = item.select_flag == -1 ? true : this.selectAll;
                if (!data.hasOwnProperty("checked")) {
                  this.$set(data, "checked", flag);
                } else {
                  data.checked = data.checked == "true" ? true : false;
                }
                return data;
              });
            }
          } else {
            this.initDataList = val.map((item) => erowConfig.deepClone(item));
          }
          //重置后判断是否已经全选
          this.setSelectAll();
          //高亮处理
          let HighlightFields = this.config.ControlProperty.HighlightFields;
          let HighlightColor = this.config.ControlProperty.HighlightColor;

          if (HighlightFields) {
            let highlightFields = JSON.parse(HighlightFields);
            this.initDataList.forEach((rowData, rIndex) => {
              this.getHighlightData(highlightFields, rowData, rIndex, this.initDataList, HighlightColor || "red"); //高亮显示文字
            });
          }
          this.initDataList.forEach((item, index) => {
            let temp = item;
            this.initDataList.splice(index, 1, temp);
          });

          const {
            ControlProperty: { categoryFiled, IsExpand },
          } = this.config;
          if (!categoryFiled) {
            return;
          }
          this.lazyLoadStates = {};
          this.$nextTick(this.initAllObservers);
          const categoryTotals = {};
          this.initDataList.forEach((item) => {
            if (!categoryTotals[item[categoryFiled]]) {
              categoryTotals[item[categoryFiled]] = 0;
            }
            categoryTotals[item[categoryFiled]]++;
          });
          this.categorys = Object.entries(categoryTotals).map(([name, total]) => {
            let isExpend = IsExpand === undefined? !categoryFiled: typeof IsExpand === "string"? IsExpend.toLowerCase() === "true": Boolean(IsExpand);
            if (this.tempScopeCache && this.tempScopeCache.categoryData && this.tempScopeCache.categoryData.includes(name)) {
              isExpend = this.tempScopeCache.categoryData.includes(name);
            }
            return {
              name: name === "undefined" ? undefined : name,
              total,
              isExpend: isExpend,
            };
          });
        } else {
          this.initDataList = [];
          this.categorys = [];
        }
      },
      immediate: true,
    },
    activeAnchor: {
      handler(val){
        if(val){
          if(this.isClickAnchor){
            return
          }
          const activeAnchorEl = document.querySelector(".anchor-active")
          if(activeAnchorEl){
            activeAnchorEl.scrollIntoView({
              behavior: "auto",
              block: "center",
              inline: "nearest"
            })
          }
        }
      },
      deep: true
    }
  },
  computed: {
    currentLayer() {
      let layerItem = pageContext.root.layerConfigArr.find((item) => {
        return item.ControlGUID == this.config.rootControlGuid;
      });
      return layerItem;
    },
    emptyImage() {
      return this.config.ControlProperty.EmptyImage || window.PAGE_CONFIG.emptyListImage;
    },
    emptyText() {
      return this.config.ControlProperty.EmptyText || "暂无内容";
    },
    keyName() {
      if (this.containerDataObj && this.containerDataObj[this.config.ControlProperty.ID]) {
        return this.containerDataObj[this.config.ControlProperty.ID].keyName;
      }
      return "";
    },
    // 单选
    isRadioCheck() {
      if (this.config.ControlProperty.IsSelectable) {
        return this.config.ControlProperty.IsSelectable == "true";
      }
      return false;
    },
    // 多选
    isMutiCheck() {
      let flag = false;
      let controlProp = this.config.ControlProperty;
      if (controlProp.SelectedMulti) {
        flag = controlProp.SelectedMulti == "true" ? true : false;
      }
      return flag;
    },
    isShowTotal() {
      const { ControlProperty: { isShowTotal } = {} } = this.config || {};
      return isShowTotal;
    },
    // 是否存在更多的数据
    hadMore() {
      if (this.config.ControlProperty.categoryFiled) {
        return false;
      } else if (this.page > Number(this.config.ControlProperty.MaxPage)) {
        return false;
      } else {
        return this.page * this.rows < this.listSize;
      }
    },
    childContainers() {
      let temp = [];
      if (erowConfig.hasProp(this.config.ControlProperty, "LinkCtnrGuid")) {
        this.config.ChildContainers.forEach((item) => {
          let tempItem = item;
          tempItem.LinkCtnrGuid = this.config.ControlProperty.LinkCtnrGuid;
          temp.push(tempItem);
        });
      } else {
        temp = this.config.ChildContainers;
      }
      return temp;
    },
    firstChildContainer() {
      // return this.childContainers[0] || {};
      return this.childContainers.find((item) => !["UcData", "UcHiddenField"].includes(item.ControlCode)) || {};
    },
    dataList() {
      let dataList = [];
      // isloaddata 为false,不单独从接口取数据，直接用属性containerdata 的数据
      if (!this.isloaddata) {
        if (this.containerdata) {
          dataList = this.containerdata.dataList || [];
          this.listSize = this.containerdata.listSize;
        }
      } else {
        dataList = this.containerDataObj[this.config.ControlProperty.ID] ? this.containerDataObj[this.config.ControlProperty.ID].dataList || [] : [];
        if (this.containerDataObj[this.config.ControlProperty.ID]) {
          this.listSize = this.containerDataObj[this.config.ControlProperty.ID].listSize;
        }
      }
      return this.filterData(this.oldDataList.concat(dataList), this.filterObj);
    },
    checkedNum() {
      return this.dataList.reduce((sum, cur) => {
        return cur.checked ? sum + 1 : sum;
      }, 0);
    },
    IsHiddenEmptyInfo() {
      return this.config.ControlProperty.IsHiddenEmptyInfo ? this.config.ControlProperty.IsHiddenEmptyInfo == "true" : false;
    },
    isGrid() {
      if (!this.config.ControlProperty.IsGridMode) return false;
      return this.config.ControlProperty.IsGridMode === "true";
    },
    isHiddenPageList() {
      // pagelist为空时是否显示pagelist，true表示不显示，默认值为false
      if (this.isLoading) {
        return false;
      }
      if (this.initDataList.length === 0) {
        let isHiddenWhenEmpty = this.config.ControlProperty.isHiddenWhenEmpty;
        if (isHiddenWhenEmpty) {
          return isHiddenWhenEmpty === "true";
        } else {
          return false;
        }
      }
      return false;
    },
    containerCtnrUID() {
      let FnCode = this.config.FnCode;
      let FnParameter = this.config.FnParameter || ".";
      let CtnrUID = this.config.CtnrUID;
      return [FnCode, FnParameter, CtnrUID].join(".");
    },
    ViewType() {
      return this.config.ControlProperty.ViewType;
    },
    Legend() {
      let tempLegend = this.config.ControlProperty.Legend;
      let temp = {};
      return tempLegend ? JSON.parse(tempLegend) : temp;
    },
    isRenderWorkflow() {
      return this.ViewType == "workflow" ? true : false;
    },
    isShowAnchorList(){
      let temp = false
      if(this.config.ControlProperty.IsShowAnchorList){
        if(typeof this.config.ControlProperty.IsShowAnchorList === "string"){
          temp = this.config.ControlProperty.IsShowAnchorList.toLowerCase() === "true"
        }
      }
      return temp
    },
    anchorList(){
      let temp = []
      if(this.config.ControlProperty.categoryFiled && this.isShowAnchorList){
        //默认取分组name的第一个字符作为锚点显示的label
        this.categorys.forEach((cate, index)=>{
          temp.push({
            label: cate.name.charAt(0),
            id: cate.name + index
          })
        })
        this.activeAnchor = temp.length? temp[0]: null //初始化时，默认定位到第一项
      }
      return temp
    },
    isRenderDelete() {
      const cp = this.config.ControlProperty || {};
      return (
        cp.IsHideDELETE == "false" &&
        this.opList.some((op) => op.type === "DELETE")
      );
    },
  },
  methods: {
    hanldeAnchorClick(anchor){
      //点击之后定位到对应锚点的位置
      const el = document.getElementById(anchor.id)
      if(el){
        this.isClickAnchor = true
        el.scrollIntoView({behavior: "auto"})
        this.activeAnchor = anchor
        this.$nextTick(()=>{
          this.isClickAnchor = false
        })
      }
    },
    setActiveAnchor(anchorId){
      if(anchorId){
        this.activeAnchor = this.anchorList.find(anchor=>anchor.id === anchorId)
      }
    },
    getCardClass(dataItem) {
      let temp = this.deleteRows.find((item) => {
        return item[this.selectedobj.targetKey] == dataItem[this.selectedobj.targetKey];
      });
      return temp ? "delete-row" : "";
    },
    getCardOverlayKey(dataItem, index) {
      if (this.keyName && dataItem && dataItem[this.keyName] != null) {
        return String(dataItem[this.keyName]);
      }
      return `idx-${index}`;
    },
    onCardDeleteOverlayOpen(key) {
      this.activeDeleteOverlayKey = key;
    },
    onCardDeleteOverlayClose() {
      this.activeDeleteOverlayKey = null;
    },
    refreshCurrentPageAfterDelete() {
      this.getDataList("search", true, false, true);
    },
    onPageListCardDelete(payload) {
      console.log({payload})
      const dataItem = payload.containerdata;
      vant.Dialog.confirm({
        message: "请确认删除",
        cancelButtonText: "取消",
        confirmButtonText: "删除",
        cancelButtonColor: true,
        className: "checkConfirm",
      })
        .then(() => {
          let params = {
            menuRowGuid: this.config.menuRowGuid,
            controlGUID: this.config.ControlGUID,
            keyValue:dataItem[this.keyName],
            pValueSet: this.config.pValueSet,
            pageMode: "DELETE",
          };
          console.log({params})
          erRequest.post(
            erowplatformBackendUrl + "/appBaseApi/sysDataAction",
            params,
            (res) => {
                if (res.code === "SUCCESS") {
                    this.refreshCurrentPageAfterDelete();
                } else {
                  this.$toast.fail(res.msg);
                }
            },
            (error) => {
              this.$toast.fail(error.msg);
            }
          );
          this.onCardDeleteOverlayClose();
        })
        .catch(() => {});
    },
    generateDeleteRows(val) {
      if (this.selectedobj && this.selectedobj.targetKey) {
        if (!val.checked) {
          //若未勾选，则往            删除数据的中添加
          let deleteValue = val[this.selectedobj.targetKey];
          let index = this.selectedobj.selectedList.findIndex((item) => {
            return item[this.selectedobj.targetKey] == deleteValue;
          });
          if (index != -1) {
            let mapval = this.selectedobj.selectedList[index][this.selectedobj.targetKey];
            let row = this.initDataList.find((item) => {
              return item[this.selectedobj.targetKey] == mapval;
            });
            this.deleteRows.push(row);
            this.selectedobj.selectedList.splice(index, 1);
          }
        } else {
          //若勾选，则从已删除数据中删除
          let deleteValue = val[this.selectedobj.targetKey];
          let index = this.deleteRows.findIndex((item) => {
            return item[this.selectedobj.targetKey] == deleteValue;
          });
          if (index != -1) {
            this.deleteRows.splice(index, 1);
            this.selectedobj.selectedList.push(val);
          }else{
            if(this.deleteRows.length==0){
              this.selectedobj.selectedList.push(val);
            }
          }
        }
      }
    },
    getWorkflowIcon(rowData) {
      let typeField = this.Legend.typeField;
      let defaultUrl = "../assets/images/icon/add.png";
      if (typeField) {
        let value = rowData[typeField];
        let legendList = this.Legend.legendList || [];
        let temp = legendList.find((item) => {
          return item.code == value;
        });
        return temp ? temp.url : defaultUrl;
      } else {
        return defaultUrl;
      }
    },
    getData() {
      this.page = 1;
      this.listSize = 2 * this.page * this.rows;
      this.oldDataList = [];
      this.getDataList("", true);
    },
    isDisableMutiSelect() {
      let flag = false;
      let controlProp = this.config.ControlProperty;
      if (controlProp.IsDisableMutiSelectWhenView && this.config.pageMode == "VIEW") {
        flag = controlProp.IsDisableMutiSelectWhenView == "true";
      }
      return flag;
    },
    // 初始化所有分组的观察器
    initAllObservers() {
      this.$nextTick(() => {
        this.categorys.forEach((category) => {
          const loader = this.$refs[`loader-${category.name}`]?.[0];
          if (loader) {
            this.getFilterDataList(category.name).initObserver(loader);
          }
        });
      });
    },
    // 修改toggleGroup方法
    toggleGroup(category) {
      category.isExpend = !category.isExpend;
      if (category.isExpend) {
        this.$nextTick(() => {
          const loader = this.$refs[`loader-${category.name}`]?.[0];
          if (loader) {
            this.getFilterDataList(category.name).initObserver(loader);
          }
        });
      }
    },
    tagQuery(DataField, val, flag) {
      this.filterObj[DataField] = val;
      this.disableGetData = flag;
    },
    pickerCard(dataItem, index) {
      if (this.activeDeleteOverlayKey) {
        this.onCardDeleteOverlayClose();
      }
      if (this.isLoading) {
        return;
      }
      if (this.isHasEvent(this.firstChildContainer, "click")) {
        this.handleClientActionsWidthParams("click", this.firstChildContainer, { dataItem, index });
        return;
      }
      if (this.pirckerIndex == index) {
        this.pirckerIndex = -1;
      } else {
        const { PickerFormID, PickerValueField, PickerContainerIDs } = this.config.ControlProperty;
        if (PickerFormID && PickerValueField && dataItem[PickerValueField]) {
          this.pirckerIndex = index;
          const formTarget = window.pageContext[PickerFormID];
          if (formTarget) {
            formTarget.getFormData(dataItem[PickerValueField], () => {
              if (PickerContainerIDs) {
                let PickerIDs = PickerContainerIDs.split(",");
                if (PickerIDs.length) {
                  PickerIDs.forEach((el) => {
                    var PickerTarget = window.pageContext[el];
                    if (PickerTarget) PickerTarget.getData();
                  });
                }
              }
            });
          } else {
            console.hint();
          }
        }
      }
    },
    getFilterDataList(categoryName) {
      console.log("getFilterDataList");
      // const {
      //   ControlProperty: { categoryFiled },
      // } = this.config;
      // if (categoryFiled && name) {
      //   return this.initDataList.filter((item) => item[categoryFiled] == name);
      // } else {
      //   return this.initDataList;
      // }
      let _this = this;
      const {
        ControlProperty: { categoryFiled },
      } = this.config;
      // 获取该分组的完整列表
      const fullList = categoryFiled && categoryName ? this.initDataList.filter((item) => item[categoryFiled] == categoryName) : this.initDataList;

      // 初始化或获取该分组的懒加载状态
      if (!this.lazyLoadStates[categoryName || "all"]) {
        this.$set(this.lazyLoadStates, categoryName || "all", {
          loadedItems: 10, // 初始加载10条
          observer: null,
          isLoading: false,
        });
      }
      const state = this.lazyLoadStates[categoryName || "all"];

      // 返回当前可见的项目
      return {
        visibleItems: fullList.slice(0, state.loadedItems),
        hasMore: state.loadedItems < fullList.length,
        loadMore() {
          if (state.isLoading) return;
          state.isLoading = true;
          // 模拟异步加载
          setTimeout(() => {
            state.loadedItems = Math.min(
              state.loadedItems + 10, // 每次加载20条
              fullList.length
            );
            state.isLoading = false;
          }, 100);
        },
        initObserver(el) {
          if (state.observer) state.observer.disconnect();
          state.observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting && state.loadedItems < fullList.length) {
                _this.$nextTick(() => {
                  _this.getFilterDataList(categoryName).loadMore();
                });
              }
            },
            {
              root: _this.$refs.handleScroll,
              threshold: 0.1,
            }
          );
          state.observer.observe(el);
        },
      };
    },
    toggllSelectAll() {
      this.initDataList.forEach((item) => {
        if (this.selectAll) item.checked = true;
        else {
          item.checked = false;
        }
      });
      this.checkedData = this.initDataList.filter((item) => {
        return item.checked;
      });
      this.isHasSelected = this.selectAll;
      let tempStr = this.config.ClientActions || this.config.ControlProperty.ClientActions || this.config.HtmlAttributes || this.containerConfig.HtmlAttributes;
      if (typeof tempStr === 'string') {
        let obj = JSON.parse(tempStr);
        if (erowConfig.hasProp(obj, "select")) {
          if(erowSpecial[obj["select"]]){
            erowSpecial[obj["select"]]({selection: this.checkedData}, this)
          }else if(baseSpecial[obj["select"]]){
            baseSpecial[obj["select"]]({selection: this.checkedData}, this)
          }
        }
      }
    },
    setHandler() {
      this.handleScroll = erowConfig.debounce((e) => {
        if (this.activeDeleteOverlayKey) {
          this.onCardDeleteOverlayClose();
        }
        // if (this.config.ControlProperty.categoryFiled) {
        //   //分组展示
        //   return;
        // }
        const { scrollHeight, scrollTop, clientHeight } = this.$refs.handleScroll;
        if (scrollHeight - scrollTop - clientHeight < 100 && !this.isLoading && !this.disableGetData && !this.config.ControlProperty.categoryFiled) {
          this.getDataList("", false, true);
        }
        if(this.isShowAnchorList){
          //滚动的时候动态设置激活锚点
          const sections = document.querySelectorAll('.pageList-category-info');
          let currentActiveId = null;
          const threshold = 10; 
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            // 获取元素相对于其定位祖先元素（即滚动容器）的顶部距离
            const offsetTop = section.offsetTop;
            if (offsetTop <= scrollTop + e.target.offsetTop + threshold) {
              currentActiveId = section.id; 
              break;
            }
          }
          this.setActiveAnchor(currentActiveId)
        }
      }, 100)
    },

    getTitle(dataItem, controlItem) {
      if (controlItem.ControlProperty.IsComputeCount && controlItem.ControlProperty.IsComputeCount.toLowerCase() == "false") {
        return dataItem.text;
      } else {
        return dataItem.text + "(" + this.headSourceNumObj[dataItem.computedNumField] + ")";
      }
    },
    initFilterControl() {
      let _this = this;
      this.selectControl = this.config.ChildContainers.filter((item) => {
        return item.ControlCode == "UcHeadSelect";
      });
      this.selectControl.forEach((item) => {
        this.$set(this.headSourceObj, item.ControlProperty.DataField, []);
        this.$set(this.filterObj, item.ControlProperty.DataField, "");
      });
      this.filterControls = this.config.ChildContainers.filter((item) => {
        return item.ControlCode == "UcHeadTabList" || item.ControlCode == "UcHeadRadioList" || item.ControlCode == "UcTagFilter";
      });
      this.filterControls.forEach((item) => {
        if (erowConfig.hasProp(item.ControlProperty, "DataSourceList")) {
          item.ControlProperty.DataSourceList = JSON.parse(item.ControlProperty.DataSourceList);
        } else {
          item.ControlProperty.DataSourceList = [];
        }
        let dataList = item.ControlProperty.DataSourceList;
        if (item.ControlProperty.IsComputeCount != "false") {
          dataList.forEach((sourceItem) => {
            _this.$set(_this.headSourceNumObj, sourceItem.computedNumField, 0);
          });
        }
        let defaultVal = Array.isArray(dataList) && dataList.length ? dataList[0].value : "";
        this.$set(this.filterObj, item.ControlProperty.DataField, defaultVal);
      });
    },
    getDataListCallBack() {
      this.$nextTick(() => {
        // 临时缓存恢复
                if (this.tempScopeCache.page) {
          this.page = this.tempScopeCache.page;
          this.rows = +this.config.ControlProperty.PagingDefaultRows || 15;
          this.$refs.handleScroll.scrollTo(0, this.tempScopeCache.scrollTop);
          this.tempScopeCache = {};
        }
        this.isLoading = false;
        $(".loadOverLay").css("height", "100%");
        $(".loadOverLay").css("width", "100%");
        $(".loadingContent").css("display", "block");
        this.handleAfterGetData();
        if (this.config.ControlProperty && this.config.ControlProperty.AfterGetContainerData) {
          let funname = this.config.ControlProperty.AfterGetContainerData;
          if (erowSpecial[funname]) {
            erowSpecial[funname](this.detailData, this);
          }
        }
      });
    },
    getDataList(params, searchType = false, isLoadMore, refreshCurrentPage) {
      if (!searchType) {
        if (this.isLoading || (this.page!==1&&!this.hadMore && !this.config.ControlProperty.categoryFiled)) return;
      }
      if (isLoadMore&&this.hadMore) {
        this.page++;
      }
      if (this.page !== 1 && !refreshCurrentPage) {
        $(".loadOverLay").css("height", "0");
        $(".loadOverLay").css("width", "0");
        $(".loadingContent").css("display", "none");
        this.oldDataList = erowConfig.deepClone(this.dataList);
      } else {
        $(".loadOverLay").css("height", "100%");
        $(".loadOverLay").css("width", "100%");
        $(".loadingContent").css("display", "block");
      }
      this.getPageListData(this.getDataListCallBack, "", params);
    },
    handleOp(opItem) {
      if (this.config.ControlProperty.LinkCtnrGuid) {
        let currenPage = pageManager.pages[pageManager.pages.length - 1];
        currenPage.params.active = this.config.UcTabGroupActive;
        pageManager.push("./detail.html", {
          menu_row_guid: this.config.menuRowGuid,
          menuConfigKey: this.config.menuConfigKey,
          controlGUID: this.config.ControlProperty.LinkCtnrGuid,
          pageMode: opItem.type,
        });
      }
    },
    onSearch(configItem) {
      if (configItem.ControlProperty?.ClientActions) {
        let funcName = JSON.parse(configItem.ControlProperty?.ClientActions)["onclick"];
        erowSpecial[funcName](this.serchData, this);
      }
    },
    getOpList() {
      let _this = this;
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadOpList";
      erRequest.post(
        url,
        {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.config.ControlGUID,
          pageMode: "view",
          pValueSet: this.config.pValueSet || this.$root.pValueSet,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            let temp = res.data[this.config.ControlProperty.ID];
            eventEmitter.emit("afterGetOpList", {
              opList: temp.join(","),
              ctnrUID: this.config.ControlProperty.CtnrUID,
              controlID: this.config.ControlProperty.ID,
              ctnrUID: this.config.ControlProperty.CtnrUID,
            });
            let map = {
              READ: "查看",
              EDIT: "编辑",
              ADD: "新增",
              DELETE: "删除",
            };
            if (Array.isArray(temp)) {
              temp.forEach((type) => {
                _this.menuOpList.push({
                  type: type,
                  name: map[type],
                });
              });
            }
            _this.opList = _this.menuOpList;
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );
    },
    itemMutiCheck(item) {
      if (this.isDisableMutiSelect()) {
        return;
      }
      if (erowConfig.hasProp(item, "checked")) {
        item.checked = !item.checked;
      } else this.$set(item, "checked", !item.checked);
      this.checkedData = this.initDataList.filter((data) => {
        return data.checked;
      });
      this.generateDeleteRows(item);
      this.setSelectAll(); //设置全选标志
      let tempStr = this.config.ClientActions || this.config.ControlProperty.ClientActions || this.config.HtmlAttributes 
      if (typeof tempStr === 'string') {
        let obj = JSON.parse(tempStr);
        if (erowConfig.hasProp(obj, "select")) {
          if(erowSpecial[obj["select"]]){
            erowSpecial[obj["select"]]({rowData: item, selection: this.checkedData}, this)
          }else if(baseSpecial[obj["select"]]){
            baseSpecial[obj["select"]]({rowData: item, selection: this.checkedData}, this)
          }
        }
      }
    },
    setSelectAll() {
      let n = this.initDataList.filter((item) => {
        return item.checked;
      }).length;
      if (n == this.initDataList.length) {
        this.selectAll = true;
        return;
      }
      this.isHasSelected = n > 0;
      this.selectAll = false;
    },
    itemRadioSelect(item) {
      if (item.checked) {
        this.isHasSelected = item.checked = false;
        this.selectedobj.selectedList=[];
      } else {
        this.initDataList.forEach((dataItem) => {
          dataItem.checked = false;
        });
        this.isHasSelected = item.checked = true;
         this.selectedobj.selectedList=[];
        this.selectedobj.selectedList.push(item);
      }
      this.checkedData = this.initDataList.filter((data) => {
        return data.checked;
      });
     
    },
    convertUcTabConfig(config) {
      return (config = Object.assign(config, {
        UcTabGroupActive: this.config.UcTabGroupActive,
      }));
    },
    getPageListClass() {
      let cssStrFromConfig = this.activeClass();
      if (this.ViewType == "workflow") {
        cssStrFromConfig += " pagelist-workflow";
      }
      return cssStrFromConfig;
    },
    generateCssStrByConfigAndCustom() {
      // 根据isGrid拼接新配置的css和原有css
      let cssStrFromConfig = this.activeClass();
      const { PickerFormID, PickerValueField } = this.config.ControlProperty;
      if (PickerFormID && PickerValueField) {
        cssStrFromConfig += " listPicker";
      }
      if (this.isGrid) {
        cssStrFromConfig += " waterfall-flow";
      }
      return cssStrFromConfig;
    },
    // 发射事件总条数
    emitTotalSize(isShowTotal, totalSize) {
      eventEmitter.emit("pageListContentContainer", {
        totalSize: totalSize,
        isShowTotal,
      });
    },
    handleBeforeUnload(event) {
      console.log("handleBeforeUnload");
      if (this.isUnloading) return;
      this.isUnloading = true;
      // console.log({event})
      const navigationEntries = performance.getEntriesByType("navigation")[0];
      // console.log(navigationEntries.type)
      if (navigationEntries.type !== "reload") {
        // sessionStorage.removeItem('tempSearch'+ this.config.ControlProperty.ID)
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i); // 获取键名
          // 如果键名包含指定的子字符串
          if (key.includes("tempSearch")) {
            sessionStorage.removeItem(key); // 删除该键
            // console.log(`删除键: ${key}`); // 打印已删除的键
          }
        }
      }
    },
    // 保存状态
    setStateCache() {
      //改和页面url存放在一块，方便清除
      let _this = this;
      let checkedData = this.initDataList
        .filter((item) => {
          return item.checked;
        })
        .map((item) => item[this.keyName]);

      let info = {
        scrollTop: _this.$refs.handleScroll.scrollTop,
        page: _this.page,
        rows: _this.rows,
        checkedData: checkedData,
        ctnrUID: _this.containerCtnrUID,
      };
      let categoryFiled = this.config.ControlProperty.categoryFiled;
      if (categoryFiled) {
        //有分类，把分类展开的数据存储
        let categoryData = this.categorys
          .filter((item) => {
            return item.isExpend;
          })
          .map((item) => {
            return item.name;
          });
        info["categoryData"] = categoryData;
      }
      if (pageManager.pages.length - 2 >= 0) {
        let pageParams = pageManager.pages[pageManager.pages.length - 2].params;
        if (pageParams.pageListInfo) {
          let index = pageParams.pageListInfo.findIndex((item) => item.ctnrUID == info.ctnrUID);
          if (index == -1) {
            pageParams.pageListInfo.push(info);
          } else {
            pageParams.pageListInfo.splice(index, 1, info);
          }
        } else {
          pageParams.pageListInfo = [info];
        }
        pageManager.updateParams(pageManager.pages.length - 2, { pageListInfo: pageParams.pageListInfo });
      }
    },
    getStateCache() {
      let pageParams = pageManager.getPageParams();
      if (pageParams.pageListInfo) {
        let temp = pageParams.pageListInfo.find((item) => item.ctnrUID == this.containerCtnrUID);
        if (temp) {
          this.tempScopeCache = temp;
        }
      }
    },
    getSelectAllStatusImg() {
      const { selectAll, isHasSelected } = this;
      if (selectAll) {
        return this.getImgFileUrl({ parentFilePath: "icon", filename: "checked-true", fileType: "png" });
      }

      if (isHasSelected) {
        return this.getImgFileUrl({ parentFilePath: "icon", filename: "checked-half", fileType: "png" });
      }

      return this.getImgFileUrl({ parentFilePath: "icon", filename: "checked-false", fileType: "png" });
    },
    getCheckItemStatusImg(checked) {
      if (checked) {
        return this.getImgFileUrl({ parentFilePath: "icon", filename: "checked-true", fileType: "png" });
      }
      return this.getImgFileUrl({ parentFilePath: "icon", filename: "checked-false", fileType: "png" });
    },
    getRadioStatusImg(checked) {
      if (checked) {
        return this.getImgFileUrl({ parentFilePath: "common", filename: "radio_checked", fileType: "png" });
      }
      return this.getImgFileUrl({ parentFilePath: "common", filename: "radio", fileType: "png" });
    },
    handlerAfterSearch(val) {
      if (this.config.ControlProperty.ScopeCtnrGuid == val) {
        this.page = 1;
        this.listSize = 2 * this.page * this.rows;
        this.oldDataList = [];
        this.getDataList("search", true);
      }
    },
    getFormCtnrData(config) {
      const {
        menuRowGuid,
        ControlGUID,
        pValueSet,
        ControlProperty: { SearchParamsInheritIds, ID },
      } = config;

      return new Promise((resolve, rej) => {
        apis.sysLoadControlData({
          vm: this,
          params: {
            menuRowGuid,
            controlGUID: ControlGUID,
            pValueSet,
            pageMode: config.pageMode || "view",
          },
          success: (res) => {
            if (res.code == "SUCCESS") {
              this.formControlData = res.data;
              resolve();
            }
          },
          fail: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            rej();
          },
          error: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            rej();
          },
        });
      });
    },
    setPageListToWindow() {
      //将ctnr挂在全局方便使用
      if (!window.pageListCtnr) {
        window.pageListCtnr = [];
      }
      let temp = window.pageListCtnr.find((item) => {
        return item == this.config.CtnrUID;
      });
      if (!temp && !this.currentLayer) {
        window.pageListCtnr.push(this.config.CtnrUID);
      }
    },
  },
  data: () => ({
    menuOpList: [],
    opList: [],
    oldDataList: [],
    page: 1,
    rows: 15,
    listSize: 100,
    orderBy: "",
    isLoading: false,
    initDataList: [], // 作为循环数据源，不可使用computed属性，其中check是检测不到变化的
    selectAll: false,
    categorys: [],
    pirckerIndex: -1,
    isHasSelected: false,
    tempScopeCache: {}, //非缓存模式下跳转detail用的临时缓存
    isUnloading: false, // 放置webView触发window.onbeforeunload两次的标识
    serchControls: [],
    serchData: "",
    lazyLoadStates: {}, //懒加载状态管理
    formControlData: {},
    deleteRows: [],
    activeDeleteOverlayKey: null,
    activeAnchor: null,
    isClickAnchor: false
  }),
  async created() {
    this.initFilterControl();
    this.setHandler();
    this.getStateCache();
    if (this.isloaddata) {
      this.pageListContainers = [this.config];
      if (!this.tempScopeCache.page) {
        this.rows = +this.config.ControlProperty.PagingDefaultRows || this.rows;
      } else {
        // scope获取缓存的页码拉取所有数据
        this.rows = this.tempScopeCache.page * (this.config.ControlProperty.PagingDefaultRows || this.rows);
      }
      let formConfig = this.config.ChildContainers.find((item) => {
        return item.ControlCode == "UcCardContainer";
      });
      if (formConfig) {
        await this.getFormCtnrData(formConfig);
      }
            if (this.config.ControlProperty.ScopeCtnrGuid) {
        this.getDefaultValueAndSearchList(this.pageListContainers, this.getDataListCallBack);
      } else {
        this.getDataList();
      }
      eventEmitter.on("pageListSearch", () => {
        this.page = 1;
        this.listSize = 2 * this.page * this.rows;
        this.oldDataList = [];
        this.getDataList("", true);
      });
      eventEmitter.on("afterUpload", () => {
        this.page = 1;
        this.listSize = 2 * this.page * this.rows;
        this.oldDataList = [];
        this.getDataList("", true);
      });
      eventEmitter.on("search", this.handlerAfterSearch, { ctnrUID: this.config.CtnrUID });
    } else {
      this.getDataListCallBack();
    }
    this.getOpList();
  },
  mounted() {
    // window.onbeforeunload = this.handleBeforeUnload;
    let _this = this;
    this.initAllObservers();
    this.setPageListToWindow();
  },
  beforeDestroy() {
    // 导航栏显示总条数重置
    // this.emitTotalSize(false, 0);
    //清理所有观察器
    eventEmitter.off("search", this.handlerAfterSearch, { ctnrUID: this.config.CtnrUID });
    Object.values(this.lazyLoadStates).forEach((state) => {
      if (state.observer) state.observer.disconnect();
    });
  },
};
