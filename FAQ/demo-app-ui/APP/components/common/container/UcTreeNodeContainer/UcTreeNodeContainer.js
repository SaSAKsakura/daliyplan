window.addEventListener("DOMContentLoaded", () => {
  UcTreeNodeContainer.components = {
    "uc-button-container": UcButtonContainer,
  };
});

var UcTreeNodeContainer = {
  name: "UcTreeNodeContainer",
  template: `
      <div class="uc-tree-container" v-if="isRenderTree" :class="activeClass(config)">
        <div style="display: none">
          这个DOM是为了维持dispatchedData的引用关系不在created生命周期执行完之后被回收，如果没有特殊情况请勿删除
          {{dispatchedData}}
        </div>
        <div class="uc-tree-search" v-if="config.ControlProperty.IsHideSearch != 'true'">
        <div class="search-input-container">
          <el-input
            class="search-input"
            v-model="filterText"
            placeholder="请输入"
          ></el-input>
        </div>
        <div class="search-button" @click="handleSerach">搜索</div>
      </div>
        <div class="uc-tree-body" >
             <el-tree
          v-if="menuTreeData.length"
          ref="erowTree"
          :data="menuTreeData"
          :props="customProps"
          :node-key="childField"
          :expand-on-click-node="false"
          :auto-expand-parent="true"
          :default-expanded-keys="defaultKeyArr"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"

          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          :show-checkbox="isAllowMultiSelect"

        >
          <div
            @mouseenter="data.isHover = true"
            @mouseleave="data.isHover = false"
            slot-scope="{ node, data }"
            :class="getNodeClass(node, data)"
            :style="{paddingRight: isAllowMultiSelect ? '12px' : '0'}"
          >
            <img
               v-if="data.icon_url"
              :src="getMenuIcon(node, data)"
              :style="getMenuIconStyle(node, data)"
              class="icon"
              alt=""
            />
            <span :title="node.label" class="font-14" style="margin-left:4px">{{ getNodeLabel(node) }}</span>
            <uc-button-container
                v-if="buttonConfig"
                :ref="buttonConfig.ControlProperty.ID"
                :config="buttonConfig"
                :key="buttonConfig.ControlGUID"
                :initData="data"
                :style="{
                  display: 'inline-flex',
                  borderTop: 'none',
                  marginLeft: 'auto',
                  marginRight: isAllowMultiSelect ? '12px' : '0',
                  minWidth: 'fit-content'
                }"
              >
              </uc-button-container>
          </div>
        </el-tree>
        </div>

      </div>
   `,
  mixins: [commonMinxin],
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    dataToTreeFromOutside: {
      // 当TreeNode渲染在DataListContainer中，在CommonMixin中监听该prop的变化，执行刷新的逻辑
      type: Object,
      default: () => {},
    },
  },
  inject: {
    dispatchDataFromDataList: {
      default: () => null,
    },
  },
  data() {
    return {
      filterText: "",
      menuTreeData: [],
      currentItem: {},
      from: {},
      op: "",
      defaultKeyArr: [], //默认要张开的树节点
      currentConfig: {},
      TreeClickAction: "",
      clickCount: 0,
      opList: "",

      menuVisible: false,
      treeIndexParams: {},
      searchInputWidth: {
        width: "100%",
      },
      customProps: {
        label: "menu_name",
        children: "children",
      },
      treeDefaultValue: "",
      //labelField: "",
      operateBtn: [],

      // 选中的子节点节点
      selectChildDataList: [],
      //选中的所有节点
      selectDataList: [],
      // 树结构得原始以为数据
      originalDataList: [],
      multSetting: [],
      isRenderTree: false,
      // 树节点支持嵌入button功能
      buttonConfig: {},
    };
  },
  watch: {
    dataToTreeFromOutside: {
      handler(val) {
        if (val) {
          let data = val.data;
          this.handleAfterGetData(data[this.config.ControlProperty.ID].dataList);
        }
      },
      immediate: true,
      deep: false,
    },
  },
  computed: {
    maxWidth() {
      if (this.treeIndexParams.MaxWidth) {
        let temp = this.treeIndexParams.MaxWidth.toLowerCase();
        return {
          maxWidth: temp.indexOf("%") == -1 && temp.indexOf("px") == -1 ? temp + "px" : temp,
        };
      } else {
        return {};
      }
    },
    maxSize() {
      if (this.treeIndexParams.MaxSize) {
        let temp = Number(this.treeIndexParams.MaxSize);
        return temp;
      } else {
        return 999;
      }
    },
    operations() {
      let _this = this;
      if (_this.opList && _this.opList != "null") {
        let opArr = _this.opList.split(",");
        let newArr = [];
        for (var i = 0; i < opArr.length; i++) {
          let order = 0;
          if (opArr[i] == "ADD") {
            order = 1;
          } else if (opArr[i] == "READ") {
            order = 2;
          } else if (opArr[i] == "EDIT") {
            order = 3;
          } else if (opArr[i] == "DELETE") {
            order = 4;
          } else {
            order = 5;
          }

          let item = {
            type: opArr[i],
            name: operationCode[opArr[i]],
            order: order,
          };
          newArr.push(item);
        }
        newArr.sort(compare("order"));
        return newArr;
      } else {
        return [];
      }
    },
    isShowOP() {
      if (this.operations.length) {
        let realOpArr = this.operations.filter((item) => {
          return this.hideOps.indexOf(item.type) == -1;
        });
        if (realOpArr.length) {
          return true;
        }
        return false;
      }
      return false;
    },
    isHideTreeOp() {
      if (this.UseTreeOp == "true") {
        return true;
      } else {
        return false;
      }
    },
    hideOps() {
      if (this.config.ControlProperty.HideOps) {
        let temp = this.config.HideOps.split(",");
        temp.map((item) => {
          item && item.toUpperCase();
        });
        return temp;
      } else {
        return [];
      }
    },
    currentConfigOne() {
      return this.currentConfig;
    },
    getPvalueSet() {
      return this.config.pValueSet ? this.config.pValueSet : erowConfig.generateUUID();
    },
    isGroupByField() {
      return erowConfig.hasProp(this.config.ControlProperty, "GroupByFields");
    },
    isAllowMultiSelect() {
      if (erowConfig.hasProp(this.config.ControlProperty, "IsAllowMultiSelect")) {
        return !!this.config.ControlProperty.IsAllowMultiSelect;
      } else {
        return false;
      }
    },
    topButtons() {
      let _this = this;
      let buttonContainer = _this.config.ControlPropertys.find((item) => {
        return item.ControlCode == "UcButtonContainer";
      });
      let buttonArr = [];
      if (buttonContainer) {
        buttonContainer.ControlPropertys.forEach((item) => {
          if (item.ControlProperty.ButtonShowPostion != "popover") {
            if (item.ControlProperty.RelateOpCode && _this.opList.indexOf(item.ControlProperty.RelateOpCode) != -1) {
              buttonArr.push(item);
            } else if (item.ControlProperty.IsCustom == "true") {
              //自定义按钮
              buttonArr.push(item);
            }
          }
        });
      }
      return buttonArr;
    },
    popoverBtns() {
      let _this = this;
      let buttonContainer = _this.config.CtnrControl.find((item) => {
        return item.ControlCode == "UcButtonContainer";
      });
      let buttonArr = [];
      if (buttonContainer) {
        buttonContainer.ControlPropertys.forEach((item) => {
          if (item.ControlProperty.ButtonShowPostion != "top") {
            if (item.ControlProperty.RelateOpCode && _this.opList.indexOf(item.ControlProperty.RelateOpCode) != -1) {
              buttonArr.push(item);
            } else if (item.ControlProperty.IsCustom == "true") {
              //自定义按钮
              buttonArr.push(item);
            }
          }
        });
      }
      let opArr = this.deepClone(_this.operations);
      if (this.config.HidePopverOps) {
        opArr = _this.operations.filter((oneop) => {
          return _this.config.HidePopverOps.indexOf(oneop.type) == -1;
        });
      }
      return [...opArr, ...buttonArr];
    },
    // 更多下拉按钮
    dropdownOperateBtn() {
      const tempArr = [];
      this.operations.forEach((item) => {
        tempArr.push({
          type: "operations",
          data: item,
        });
      });
      this.topButtons.forEach((item) => {
        tempArr.push({
          type: "topButtons",
          data: item,
        });
      });
      if (this.isHideTreeOp) {
        if (tempArr.length > 1) {
          this.operateBtn = [];
          //  tempArr.shift()
          return tempArr;
        }
        this.operateBtn = tempArr;
        return [];
      }
      if (tempArr.length > 4) {
        this.operateBtn = tempArr.slice(0, 3);
        tempArr.splice(0, 3);
        return tempArr;
      } else {
        this.operateBtn = tempArr;
        return [];
      }
    },
    childField() {
      // 将childField和parentField单独作为计算属性使用，因为在initParams函数中，会先深拷贝config再复制
      // 从执行时机考虑，在watch immediate = true 时，handleAfterGetData的childField和parentField为空字符串，导致分组失效。
      const tmp = this.config.ControlProperty.TreeNodeField.split(",");
      return tmp[0];
    },
    parentField() {
      const tmp = this.config.ControlProperty.TreeNodeField.split(",");
      return tmp[1];
    },
    dispatchedData: {
      get() {
        return (this.dispatchDataFromDataList && this.dispatchDataFromDataList(this.config.ControlProperty.ID)) || "";
      },
    },
  },
  methods: {
    baseTreeClick(nodeData) {
      let configItem = this.config;

      if (erowConfig.hasProp(nodeData, "dialogConfig")) {
        let dialogInfo = nodeData.dialogConfig[configItem.ControlProperty.ID];
        let keyField = configItem.ControlProperty.DialogKeyDataField || configItem.ControlProperty.TreeNodeRightFormKey;
        let keyValue = nodeData[keyField];
        let pageMode = "VIEW";
        if (dialogInfo.dialogCtnrUID) {
          pageMode = dialogInfo.dialogCtnrUID.split(".").length > 3 ? dialogInfo.dialogCtnrUID.split(".")[3] : "VIEW";
        }

        localStorage.setItem(
          this.config.ControlProperty.ID,
          JSON.stringify({ id: this.currentItem[this.childField], defaultKeyArr: this.defaultKeyArr })
        );
        pageManager.push("./detail.html", {
          menu_row_guid: configItem.menuRowGuid || "",
          menuConfigKey: configItem.menuConfigKey || "",
          controlGUID: dialogInfo.dialogControlGuid,
          CtnrUID: dialogInfo.dialogCtnrUID || "",
          pValueSet: dialogInfo.dialogPValueSet || erowConfig.generateUUID(),
          pageMode: pageMode,
          keyValue,
          fnCode: dialogInfo.dialogFnCode,
          fnParameter: dialogInfo.dialogFnParameter,
          commonPValueSet: configItem.pValueSet,
        });
      }
    },
    handleSerach() {
      this.$refs.erowTree.filter(this.filterText);
    },
    getNodeClass(node, data) {
      let classStr = "";
      if (!node.childNodes.length) classStr = classStr + "lastLevel";
      else classStr = classStr + "el-icon-arrow-right";
      return node.level == 1 ? classStr + " root align-center-flex" : classStr + " align-center-flex";
    },
    getLabelField(data) {
      if (this.isGroupByField) {
        let isShowChildCount = this.config.IsShowChildNodeCount && this.config.IsShowChildNodeCount.toLowerCase() == "true";
        if (!isShowChildCount) {
          return data.nodeLabel || data.label;
        } else {
          return data.nodeLabel || data.label + "（" + data.deepChildNum + "）";
        }
      } else {
        let treeNodeField = this.config.ControlProperty.TreeNodeField;
        return treeNodeField.split(",").length > 2 ? treeNodeField.split(",")[2] : "menu_name";
      }
    },
    getNodeLabel(node) {
      if (this.isGroupByField) {
        let labelField = this.getLabelField(node.data);
        return labelField;
      } else {
        let labelField = this.getLabelField();

        return node.data[labelField] && node.data[labelField].length > this.maxSize
          ? node.data[labelField].substring(0, this.maxSize) + "..."
          : node.data[labelField];
      }
    },

    filterNode(value, data, node) {
      if (this.multSetting.includes("叶子")) {
        if (!value) {
          //如果数据为空，则返回true,显示所有的数据项
          //node.expanded = false;
          return true;
        } // 查询列表是否有匹配数据，将值小写，匹配英文数据
        let val = value.toLowerCase();
        return this.chooseNode(val, data, node); // 调用过滤二层方法
      } else {
        if (!value) return true;
        return data[this.customProps.label].indexOf(value) !== -1;
      }
    },
    // 过滤父节点 / 子节点 (如果输入的参数是父节点且能匹配，则返回该节点以及其下的所有子节点；如果参数是子节点，则返回该节点的父节点。name是中文字符，enName是英文字符.
    chooseNode(value, data, node) {
      if (data[this.customProps.label] && data[this.customProps.label].indexOf(value) !== -1) {
        return true;
      }
      const level = node.level;
      // 如果传入的节点本身就是一级节点就不用校验了
      if (level === 1) {
        return false;
      }
      // 先取当前节点的父节点
      let parentData = node.parent;
      // 遍历当前节点的父节点
      let index = 0;
      while (index < level - 1) {
        // 如果匹配到直接返回，此处name值是中文字符，enName是英文字符。判断匹配中英文过滤
        if (parentData.data[this.customProps.label] && parentData.data[this.customProps.label].indexOf(value) !== -1) {
          return true;
        }
        // 否则的话再往上一层做匹配
        parentData = parentData.parent;
        index++;
      }
      // 没匹配到返回false
      return false;
    },
    handleNodeExpand(data, ...d) {
      // 保存当前展开的节点
      let flag = false;
      this.defaultKeyArr.some((item) => {
        if (item === data[this.childField]) {
          // 判断当前节点是否存在， 存在不做处理
          flag = true;
          return true;
        }
      });
      if (!flag) {
        // 不存在则存到数组里
        this.defaultKeyArr.push(data[this.childField]);
      }
    },
    handleNodeCollapse(data) {
      const index = this.defaultKeyArr.findIndex((item) => item === data[this.childField]);
      index >= 0 && this.defaultKeyArr.splice(index);
    },
    getMenuIcon(node, data) {
      if (data.icon_url) {
        let icon_name = data.icon_url;
        let iconName = node.isCurrent || data.isHover ? icon_name + "_hover" : icon_name;
        // return `../special/images/menuIcon/${iconName}.png`;
        return this.getImgFileUrl({ parentFilePath: "menu", filename: iconName, fileType: "png" });
      }
      let level = node.level >= 5 ? 4 : node.level - 1;
      let iconName = node.isCurrent || data.isHover ? "menu_level_" + level + "_hover" : "menu_level_" + level;
      return `../assets/images/menuIcon/${iconName}.png`;
    },
    getMenuIconStyle(node, data) {
      if (node.level == 1) {
        return { width: data.icon_size ? data.icon_size + "px" : "16px" };
      }
      return { width: data.icon_size ? data.icon_size + "px" : "14px" };
    },

    handleAfterGetData(list) {
      let _this = this;
      let tempData = (this.originalDataList = list);
      tempData.forEach((item) => {
        _this.$set(item, "isHover", item.id == this.treeDefaultValue);
        if (item.icon_url) {
          let name = "";
          let filearr = item.icon_url.split("/");
          let fileName = filearr && filearr[filearr.length - 1].split(".")[0];
          if (fileName) {
            name = fileName;
          }
          item.icon_url = name;
        }
      });

      if (_this.isGroupByField) {
        let groupFields = JSON.parse(_this.config.GroupByFields);
        this.menuTreeData = erowConfig.convertTreeData({}, tempData, groupFields, 0);
      } else {
        let tempData = list;

        _this.menuTreeData = _this.handleTree(tempData, _this.childField, _this.parentField);
        const defaultExpandNode = tempData.find((item) => item.id == this.treeDefaultValue);
        if (defaultExpandNode) {
          if (defaultExpandNode.pid) {
            const pNode = tempData.find((item) => item.id == defaultExpandNode.pid);
            pNode && this.handleNodeExpand(pNode);
          }
          //this.handleNodeClick(defaultExpandNode);
        } else if (_this.menuTreeData.length > 0) {
          if (_this.menuTreeData[0][_this.childField] != null) {
            if (this.menuTreeData.length == 1) {
              _this.handleNodeExpand(_this.menuTreeData[0]);
            }
          }
        }
      }
    },
    getTreeData() {
      let _this = this;
      let params = {
        menuRowGuid: this.config.menuRowGuid,
        controlGUID: this.config.ControlGUID,
        pageMode: "view",
        pValueSet: this.config.pValueSet,
        keyValue: this.config.keyValue || "",
        page: 1,
        rows: 10000,
        orderBy: "",
        paramMap: {},
      };
      // this.handleAfterGetData(treeData);
      // return;
      apis.sysLoadDBData({
        vm: this,
        params: params,
        success: (res) => {
          if (res.code == "SUCCESS") {
            if (res.data && res.data[this.config.ControlProperty.ID]) {
              this.handleAfterGetData(res.data[this.config.ControlProperty.ID].dataList);
            }
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

    handleNodeClick(data, node) {
      let _this = this;

      _this.menuVisible = false;
      if (node && node.childNodes && node.childNodes.length) {
        node.expanded = !node.expanded;
        if (node.expanded) {
          this.handleNodeExpand(data, node);
        } else {
          this.handleNodeCollapse(data, node);
        }
      }
      _this.currentItem = data;
      if (this.TreeClickAction) {
        this.runSpeicalFun(_this.TreeClickAction, data);
      }
    },

    initParams() {
      let _this = this;
      this.treeIndexParams = erowConfig.deepClone(this.config);
      this.TreeClickAction = this.treeIndexParams.ControlProperty.TreeClickAction;
      let treeNodeField = this.treeIndexParams.ControlProperty.TreeNodeField;
      if (treeNodeField) {
        _this.customProps.label = this.getLabelField();
      }
      this.buttonConfig = this.treeIndexParams.ChildContainers.find((item) => {
        return item.ControlCode == "UcButtonContainer";
      });
      if (this.buttonConfig) {
        this.buttonConfig.ControlProperty.RelativeContainer = this.config.ControlProperty.ID;
        this.buttonConfig.ControlProperty.IsFromTreeNode = true;
      }
      // let ID = this.config.ControlProperty.ID;
      // let cacheData = localStorage.getItem(ID);
      // if (cacheData) {
      //   this.defaultKeyArr = JSON.parse(cacheData).defaultKeyArr;
      //   this.treeDefaultValue = JSON.parse(cacheData).id;
      // }
    },
  },

  async created() {
    await erowConfig.loadCss("../libs/css/element-ui.css");
    await erowConfig.loadScrpit("../libs/js/element-ui.js");
    this.isRenderTree = true;
    this.initParams();
    if (!this.dispatchedData) this.getTreeData();
  },
};
