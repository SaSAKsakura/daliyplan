var UcScopeContainer = {
  data() {
    return {};
  },
  template: `
    <div class="UcScopeContainer editer-form card-tr-underline"  :class='activeClass()'>
      <table class="FormViewTable">

        <colgroup>
          <col :width="item" v-for="(item, i) in colsWidth" :key="i" />
        </colgroup>

        <tbody>
          <tr v-for="key in Object.keys(childContainers)" :key="key" style="margin-left:7px">
            <td v-for="configItem in childContainers[key]" :class="activeClass(configItem,detailData,'td')" :key="configItem.ControlGUID" :style="hideCols(configItem)" :colspan="getColSpan(configItem)">

              <template >
                <div class='component-outer' v-if="configItem.ControlCode=='UcLabel'&&!isRender()" >
                  <span class='editer-form-label' :class='activeClass(configItem)'>{{configItem.ControlProperty.RSValue}}</span>
                <el-tooltip
                v-if="isShowItemTip(configItem)"
        class="header-corner"
      >
        <div slot="content">
          <div v-html="getItemTooltipContent(configItem)"></div>
        </div>
        <span @click.stop="handleTipClick">
         <img v-if="isItemInfoTip(configItem)" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip(configItem)" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip(configItem)" src="../assets/images/icon/real-color-question.png" alt=""/>
        </span>
      </el-tooltip>
                  </div>
                <edit-component
                  v-if="isRender()"
                  :config="toEdit(configItem)"
                  :detailData="detailData"
                  :containerdata="detailData"
                  :controldata="controldata"
                  :keyfield="configItem.ControlProperty.ID"
                  :isCloseAllDetail="isCloseAllDetail"
                  :fieldMap='fieldMap'
                  @changeStatusCode="hanldeChangeStatusCode"
                >
                </edit-component>
              </template>

            </td>
          </tr>
        </tbody>

      </table>
    </div>
  `,
  components: {
    "view-comment": ViewComment,
    "edit-component": EditComponent,
  },
  mixins: [formMinxin, commonMinxin],
  methods: {
    toEdit(config) {
      return {
        ...config,
        pageMode: "EDIT",
        _searchControlGUID: this.config.ControlGUID,
        _searchControlCtnrUID:this.config.CtnrUID,
        _dataLoaded: true,
      };
    },
    isShowItemTip(item){
      return item.ControlProperty.TipContent;
    },
    getItemTooltipContent(item){
      return item.ControlProperty.TipContent;
    },
    isItemInfoTip(item){
      return item.ControlProperty.TipType=='info'
    },
    isItemWarningTip(item){
      return item.ControlProperty.TipType=='warning'
    },
    isItemQuestionTip(item){
      return item.ControlProperty.TipType=='question'
    },
  },
};
