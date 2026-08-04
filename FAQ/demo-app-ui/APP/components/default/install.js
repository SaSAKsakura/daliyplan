let minxins = ["commonMinxin", "gridMinxin", "formMinxin", "layerMixin", "dynamicMixin", "dataSourceMinxin", "orientationMixin", "touchMixin", "longPressMixin"];
let baseComponents = [
  "UcSwitchField",
  "ProgressBar",
  "UcStepList",
  "CheckboxList",
  "RadioButtonList",
  "UcAnswerField",
  "ViewComment",
  "FormDate",
  "UcStepperField",
  "UcRateListField",
  "FormTree",
  "FormCasCader",
  "FormSelect",
  "FormMultipleSelect",
  "UcTimer",
  "fileUpload",
  "UcGpsRangeList",
  "UcWeekCalendar",
  "UcPhoto",
  "UcDynamicComponent",
  "SelectCascader",
  "UcSelect",
  "EditComponent",
  "LiveStreamVideo",
  "CameraOperate",
  "UcEvaluation",
  "UcTagFilter",
  "IgwCapsule",
];
let contianers = [
  "UcButtonContainer",
  "UcMsgContainer",
  "UcBannerContainer",
  "SideMenuContainer",
  "UcMenuContainer",
  "UcAscx",
  "PageTitleContainer",
  "UcScopeContainer",
  "UcFormContainer",
  "UcFileContainer",
  "UcCardContainer",
  "UcJsGridContainer",
  "UcGridContainer",
  "PageListContentContainer",
  "UcWorkflow",
  "UcChartContainer",
  "UcTreeNodeContainer",
  "UcDataListContainer",
  "UcTableContainer",
  "UcContainerNoGroup",
  "TabGroupContainer",
  "UcMapContainer",
  "UcBottomBar",
  "UcHtmlTemplateContainer",
  "UcContainer",
  // "UcContainerNoGroup",
  "FilePreviewContainer",
  "UcLayerContainer",
  "UcCardFileContainer",
];

minxins.forEach((fileName) => {
  document.write(`<script src="../components/minxin/${fileName}.js"></script>`);
});

baseComponents.forEach((fileName) => {
  document.write(`<script src="../components/common/baseComponents/${fileName}/${fileName}.js"></script>`);
});

contianers.forEach((fileName) => {
  document.write(`<script src="../components/common/container/${fileName}/${fileName}.js"></script>`);
});
