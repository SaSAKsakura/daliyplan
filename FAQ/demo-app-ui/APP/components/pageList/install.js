let minxins = ["commonMinxin", "gridMinxin", "formMinxin", "layerMixin", "dynamicMixin", "dataSourceMinxin", "orientationMixin", "touchMixin", "longPressMixin"];
let contianers = [
  "SideMenuContainer",
  "UcButtonContainer",
  "UcMsgContainer",
  "UcBannerContainer",
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
  "UcMapContainer",
  "UcBottomBar",
  "UcTreeNodeContainer",
  "UcDataListContainer",
  "UcTableContainer",
  "UcContainerNoGroup",
  "TabGroupContainer",
  "UcHtmlTemplateContainer",
  "UcContainer",
  "FilePreviewContainer",
  "UcLayerContainer",
  "UcCardFileContainer",
];
let baseComponents = [
  "UcSwitchField",
  "ProgressBar",
  "UcStepList",
  "UcStepperField",
  "UcRateListField",
  "CheckboxList",
  "RadioButtonList",
  "UcAnswerField",
  "ViewComment",
  "FormDate",
  "FormTree",
  "FormCasCader",
  "FormSelect",
  "FormMultipleSelect",
  "UcGpsRangeList",
  "UcTimer",
  "UcWeekCalendar",
  "fileUpload",
  "UcDynamicComponent",
  "UcPhoto",
  "SelectCascader",
  "UcSelect",
  "UcKindEditor",
  "EditComponent",
  "LiveStreamVideo",
  "CameraOperate",
  "UcEvaluation",
  "UcTagFilter",
  "AudioPlayer",
];
if (localStorage.hasOwnProperty("currentConfigKey")) {
  let currentConfigKey = localStorage.getItem("currentConfigKey");
  let BASE_CONFIG = JSON.parse(localStorage.getItem(currentConfigKey + "BASE_CONFIG"));
  window.HTML_PATH = `${window.location.pathname.substring(0, window.location.pathname.indexOf(BASE_CONFIG.rootDir) + BASE_CONFIG.rootDir.length)}`;
} else {
  window.HTML_PATH = window.location.pathname.substring(0, window.location.pathname.indexOf("/APP/") + 4);
}

//引入顺序minxin>base>container
minxins.forEach((fileName) => {
  document.write(`<script src="${window.HTML_PATH}/components/minxin/${fileName}.js"></script>`);
});

baseComponents.forEach((fileName) => {
  document.write(`<script src="${window.HTML_PATH}/components/common/baseComponents/${fileName}/${fileName}.js"></script>`);
});

contianers.forEach((fileName) => {
  document.write(`<script src="${window.HTML_PATH}/components/common/container/${fileName}/${fileName}.js"></script>`);
});
