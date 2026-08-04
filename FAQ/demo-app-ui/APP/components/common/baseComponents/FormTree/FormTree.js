var FormTree = {
  name: "FormTree",
  template: `
 <div class="FormTree">
    <div class="input-text-box">
      <van-field
        readonly
        clickable
        :reuquired="required"
        :value="showText"
        :disabled="disabled"
        :rules="rules"
        :placeholder="placeholder"
        @click.native="handleShowTree"
        right-icon="arrow"
      />
    </div>
     <van-popup v-model="isShowTree" get-container="#app"  class="w100 h100" :overlay-style="{background:'white'}">
      <div class="form-tree-container" v-if="isShowTree">
        <div class="form-tree-nav head-nav-container" @click="getLeafCheckedNodes">
          <img class="nav-left-icon" src="../assets/images/common/back.png" @click="handleBack" />
          <div class="nav-title head-title">{{ rSValue || "请选择" }}</div>
        </div>
        <div class="form-tree-search">
          <div class="search-input-container">
            <el-input class="search-input" v-model="searchContent" placeholder="请输入"></el-input>
          </div>
          <div class="search-button" @click="handleSerach">搜索</div>
        </div>
        <div class="form-tree-body" :class="getFromTreeBodyClass">
          <el-tree
            ref="tree"
            :node-key="valueKey"
            :data="datatree"
            show-checkbox
            :default-expanded-keys="defaultExpandedKeys"
            :props="fieldNames"
            :filter-node-method="filterNode"
            @check="handleTreeNodeCheck"
            @node-click="handleNodeClick"
          >
            <span class="form-tree-item" slot-scope="{ node, data }">
              <img
                v-if="node.level != 1 || (node.level == 1 && data.icon_url)"
                :src="getMenuIcon(node, data)"
                :style="getMenuIconStyle(node, data)"
                class="icon"
                alt=""
              />
              <div class="form-tree-item-label" :style="returnStyle(node, data)">{{ data[textKey] }}</div>
            </span>
          </el-tree>
        </div>
        <div class="form-tree-footer">
          <van-button @click="handleClear" type="info" round size="small" class="white-button-erow form-tree-footer-btn-clear"> 清空 </van-button>
          <van-button @click="handleConfirm" type="info" round size="small" class="form-tree-footer-btn-confirm"> 确定 </van-button>
        </div>
      </div>
    </van-popup>
  </div>
 `,
  mixins: [commonMinxin],
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    required: {
      type: String,
      default: "",
    },
    value: {
      type: [Number, String],
      default: "",
    },
    label: {
      type: String,
      default: "请选择",
    },
    placeholder: {
      type: String,
      default: "",
    },
    rules: {
      // 规则
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  computed: {
    fieldNames() {
      // prop对应的字段
      let valueKey = this.valueKey;
      let textKey = this.textKey;
      return {
        label: textKey,
        value: valueKey,
        children: "children",
      };
    },
    valueKey() {
      return this.config.ControlProperty.DataValueField ? this.config.ControlProperty.DataValueField.toLowerCase() : this.idKey;
    },
    textKey() {
      let field = "name";
      let ControlProperty = this.config.ControlProperty;
      if (ControlProperty.NodeName) {
        field = ControlProperty.NodeName.toLowerCase();
      } else if (erowConfig.hasProp(ControlProperty, "TreeNodeField")) {
        field = ControlProperty.TreeNodeField ? ControlProperty.TreeNodeField.split(",")[2] : "name";
      }
      return field;
    },
    multiple() {
      if (erowConfig.hasProp(this.config.ControlProperty, "IsSelectable") && this.config.ControlProperty.IsSelectable.toLowerCase() == "true") {
        return false;
      }
      if (
        erowConfig.hasProp(this.config.ControlProperty, "IsAllowMultiSelect") &&
        this.config.ControlProperty.IsAllowMultiSelect.toLowerCase() == "true"
      ) {
        return true;
      }
      if (erowConfig.hasProp(this.config.ControlProperty, "SelectedMulti") && this.config.ControlProperty.SelectedMulti.toLowerCase() == "true") {
        return true;
      }

      return false;
    },
    isAllowSelectParent() {
      // 是否只允许子节点多选
      if (erowConfig.hasProp(this.config.ControlProperty, "IsAllowSelectParent")) {
        let flag = this.config.ControlProperty.IsAllowSelectParent.toLowerCase() == "true";
        return flag;
      } else {
        return true;
      }
    },
    showText() {
      if (this.config.pageMode === "VIEW") {
        return this.value;
      }
      return this.checkedNodeListNames;
    },
    dataFieldWhenReadMode() {
      if (erowConfig.hasProp(this.config.ControlProperty, "DataFieldWhenReadMode")) {
        return this.config.ControlProperty.DataFieldWhenReadMode;
      } else {
        return "";
      }
    },
    rSValue() {
      if (erowConfig.hasProp(this.config.ControlProperty, "rSValue")) {
        return this.config.ControlProperty.rSValue;
      } else {
        return "";
      }
    },
    idKey() {
      // 节点id对应的的key，一般为id
      if (erowConfig.hasProp(this.config.ControlProperty, "IDKey")) {
        return this.config.ControlProperty.IDKey ? this.config.ControlProperty.IDKey.toLowerCase() : "id";
      } else if (erowConfig.hasProp(this.config.ControlProperty, "TreeNodeField")) {
        return this.config.ControlProperty.TreeNodeField ? this.config.ControlProperty.TreeNodeField.split(",")[0] : "id";
      } else {
        return "id";
      }
    },
    pidKey() {
      if (erowConfig.hasProp(this.config.ControlProperty, "PIDKey")) {
        return this.config.ControlProperty.PIDKey ? this.config.ControlProperty.PIDKey.toLowerCase() : "pid";
      } else if (erowConfig.hasProp(this.config.ControlProperty, "TreeNodeField")) {
        return this.config.ControlProperty.TreeNodeField ? this.config.ControlProperty.TreeNodeField.split(",")[1] : "pid";
      } else {
        return "pid";
      }
    },
    datalist() {
      if (erowConfig.hasProp(this.config.ControlProperty, "initData")) {
        return this.config.ControlProperty.initData;
      } else if (this.$attrs.initdata) {
        return this.$attrs.initdata;
      } else {
        return [];
      }
    },
    datatree() {
      if (erowConfig.hasProp(this.config.ControlProperty, "dataArr")) {
        return this.config.ControlProperty.dataArr;
      } else if (this.$attrs.options) {
        return this.$attrs.options;
      } else {
        return [];
      }
    },
    OnClientClick() {
      if (erowConfig.hasProp(this.config.ControlProperty, "OnClientClick")) {
        return this.config.ControlProperty.OnClientClick;
      } else {
        return [];
      }
    },
    getFromTreeBodyClass() {
      let res = {};
      if (!this.multiple) {
        res = {
          ...res,
          "single-select": true,
        };
      }
      return res;
    },
    checkedNodeListNames() {
      return this.checkedNodeList
        .map((node) => {
          const text = node[this.textKey];
          return text;
        })
        .join("|");
    },
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "label",
      },
      isShowTree: false,
      searchContent: null,
      checkedNodeList: [],
      defaultExpandedKeys: [],
    };
  },
  methods: {
    handleBack() {
      this.hideTree();
    },
    // 点击内容框，显示树型
    handleShowTree() {
      // 显示树型控件

      this.showTree(() => {
        // 处理已选值回显和展开
        this.handleSetCheckedNodes();
      });
    },
    handleSetCheckedNodes() {
      const { datalist = [], value } = this;
      let valueList = [];
      if (this.multiple) {
        const valueSet = new Set(value.split("|"));
        for (let v of valueSet) {
          valueList.push(v);
        }
      }
      if (!this.multiple) {
        valueList = [value];
      }

      // 组成map拿nodeData
      const dataMap = new Map();

      datalist.forEach((data) => {
        const realValue = data[this.valueKey];
        dataMap.set(realValue.toString(), data);
      });

      // 找到已选节点
      const checkedNodeList = [];
      for (let value of valueList) {
        const data = dataMap.get(value.toString());
        if (data) {
          checkedNodeList.push(data);
        }
      }

      // 将值回显并默认展开
      this.defaultExpandedKeys = valueList;
      this.checkedNodeList = checkedNodeList;
      this.$nextTick(() => {
        this.setCheckedKeys(valueList);
      });
    },
    async showTree(callback) {
      if (!this.dataArr || !this.dataArr.length) {
        await this.buildComboTree();
      }
      if (callback) {
        callback();
      }

      let popupList = pageContext.root ? pageContext.root.popupList : [];
      this.popKey = "isShowTree";
      popupList.push(this);
      this.isShowTree = true;
    },
    hideTree() {
      let popupList = pageContext.root ? pageContext.root.popupList : [];
      popupList.splice(-1, 1);
      this.isShowTree = false;
    },
    // 搜索功能
    handleSerach() {
      this.$refs.tree.filter(this.searchContent);
    },
    filterNode(value, data) {
      const { textKey, searchContent } = this;
      if (!searchContent) return true;
      if (data[textKey]) {
        return data[textKey].indexOf(this.searchContent) !== -1;
      }
    },
    // 赋值回填功能
    handleConfirm() {
      const leafNodes = this.getLeafCheckedNodes();
      this.checkedNodeList = leafNodes;
      const resValue = this.checkedNodeList
        .map((node) => {
          const value = node[this.valueKey];
          return value;
        })
        .join("|");
      this.$emit("change", {
        value: resValue,
      });
      this.hideTree();
    },
    // 清除功能
    handleClear() {
      this.clearCheckedKeys();
    },
    async buildComboTree() {
      const { ControlProperty: { DataSourceDBActionCtnrUID } = {} } = this.config;
      if (DataSourceDBActionCtnrUID) {
        const res = await this.getWebboTreeData(DataSourceDBActionCtnrUID, {});
        const { dataList = [] } = res || {};
        let initData = erowConfig.deepClone(dataList);
        if (!this.config.ControlProperty.hasOwnProperty("initData")) {
          this.$set(this.config.ControlProperty, "initData", initData);
        } else this.config.ControlProperty.initData = initData;
        this.setDataArr(dataList);
      }
    },
    async getWebboTreeData(ctnrUID, paramMap) {
      let params = {
        ctnrUID,
        menuConfigKey: this.config.menuConfigKey || this.$root.menuConfigKey,
        paramMap: paramMap,
        pValueSet: this.config.pValueSet,
        controlGUID: this.config.ControlGUID,
        opCode: "VIEW",
      };
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadPostData";
      return await new Promise((resolve, reject) => {
        erRequest.post(
          url,
          params,
          function (res) {
            resolve(res.data);
          },
          (error) => {
            reject(error);
          }
        );
      });
    },
    setDataArr(data) {
      let idKey = this.idKey.toLowerCase();
      let pidKey = this.pidKey.toLowerCase();

      this.$set(this.config.ControlProperty, "dataArr", erowConfig.handleTree(data, idKey, pidKey));
    },
    handleTreeNodeCheck(data, node, vm) {
      if (this.multiple) {
        return;
      }
      const { valueKey } = this;
      const value = data[valueKey];
      this.setCheckedKeys([value]);
    },
    handleNodeClick(...rest) {},
    getLeafCheckedNodes() {
      return this.$refs.tree.getCheckedNodes(true) || [];
    },
    clearCheckedKeys() {
      this.$refs.tree.setCheckedKeys([]);
    },
    setCheckedKeys(checkedKeys = []) {
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedKeys(checkedKeys);
      }
    },
    getMenuIcon(node, data) {
      if (data.icon_url) {
        let icon_name = data.icon_url;
        let iconName = node.isCurrent || data.isHover ? icon_name + "_hover" : icon_name;
        return "@/assets/images/icon/" + iconName + ".png";
      }
    },
    getMenuIconStyle(node, data) {
      if (data.icon_url) {
        if (node.level == 1) {
          return { width: data.icon_size ? data.icon_size + "px" : "16px" };
        }
        return { width: data.icon_size ? data.icon_size + "px" : "14px" };
      }
      return "width: 0;";
    },
    returnStyle(node, data) {
      if (node.childNodes.length == 0 && node.level == 1) {
        return "padding-left: 0";
      }
      return "padding-left: 10px";
    },
  },
  created() {
    this.handleSetCheckedNodes();
  },
  watch: {
    "config.ControlProperty.initData": {
      // 编辑状态下数据回填给弹窗，默认勾选已选项
      handler(val) {
        if (this.config.pageMode === "EDIT") {
          this.handleSetCheckedNodes();
        }
      },
    },
    value: {
      handler(val) {
        this.handleSetCheckedNodes();
      },
    },
  },
};
