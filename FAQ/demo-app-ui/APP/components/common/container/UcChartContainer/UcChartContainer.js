/**
 * 绘制普通饼图时，只需要传入series[0]的data即可
 *
 * 绘制柱状图&折线图时，需要传入{name:String, data:Array, xAxis:Array}对象，
 */
var chartTemplate = {
  version: "v0.0.1",
  pie1: {
    title: {
      text: "测试",
      subtext: "pie1",
      left: "center",
      bottom: "10",
      itemGap: 0,
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "top",
    },
    series: [
      {
        type: "pie",
        radius: "30%",
        data: [],
      },
    ],
    xAxis: {
      show: false,
    },
  },
  pie2: {
    title: {
      text: "测试",
      subtext: "pie2",
      left: "center",
      itemGap: 0,
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "center",
    },
    series: [
      {
        type: "pie",
        radius: "40%",
        left: "10%",
        data: [],
      },
    ],
    xAxis: {
      show: false,
    },
  },
  pie3: {
    title: {
      text: "测试",
      subtext: "pie3",
      left: "center",
      itemGap: 0,
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      right: "right",
      top: "center",
    },
    series: [
      {
        type: "pie",
        label: {
          show: false,
        },
        radius: "50%",
        left: "-10%",
        data: [],
      },
    ],
    xAxis: {
      show: false,
    },
  },
  pie4: {
    title: {
      text: "测试",
      subtext: "pie4",
      left: "center",
      itemGap: 0,
    },
    tooltip: {
      trigger: "item",
    },
    labelLine: {
      show: false,
    },
    legend: {
      orient: "vertical",
      right: "right",
      top: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "50%"],
        label: {
          show: false,
        },
        left: "-10%",
        data: [],
      },
    ],
    xAxis: {
      show: false,
    },
  },
  // 普通柱状图
  bar1: {
    legend: {},
    tooltip: {},
    // 声明一个 X 轴，类目轴（category）。默认情况下，类目轴对应到 dataset 第一列。
    xAxis: {
      type: "category",
      data: [],
    },
    // 声明一个 Y 轴，数值轴。
    yAxis: {},
    // 声明多个 bar 系列，默认情况下，每个系列会自动对应到 dataset 的每一列。
    series: [],
  },
  // 堆叠折线图
  line1: {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {},
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: true,
      data: [],
    },
    yAxis: {
      type: "value",
    },
    series: [],
  },
};

//饼图
var pieOptions = {
  //基础饼图
  "base-pie": {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [],
      },
    ],
  },

  //环形饼图
  "circular-pie": {
    tooltip: {
      trigger: "item",
    },
    title: [
      {
        text: "",
        subtext: "",
        top: "40%",
        left: "27%",
        textAlign: "center",
        itemGap: 6,
        textStyle: {
          fontSize: "18px",
          color: "#1a1a1a",
        },
        subtextStyle: {
          fontSize: "14px",
          color: "#999999",
        },
      },
    ],
    legend: {
      top: "center",
      right: "2%",
      orient: "vertical",
      icon: "circle",
      align: "left",
      inactiveBorderWidth: "auto",
      itemGap: 14,
      textStyle: {
        color: "#1a1a1a",
        height: 10,
        rich: {
          a: {
            color: "#8291A9",
            fontSize: 14,
            width: 20,
            padding: [0, 70, 0, 0], // 1.左边的文字添加右边距10(可自己调整)
            verticalAlign: "middle",
          },
          b: {
            color: "#1a1a1a",
            fontSize: 14,
            width: 35,
            backgroundColor: "transparent", // 2.右边的值添加背景色
            align: "left", // 3.右对齐
            padding: [0, -90, 0, 0], // 4.设置右边距为-100(-70/-80..可自己调整)
            verticalAlign: "middle",
          },
        },
      },
    },
    color: ["#97D7F1", "#AECF8E", "#E3E689", "#FFD87E", "#F4A788", "#F4B0CB"],
    series: [
      {
        name: "",
        type: "pie",
        width: "100%",
        height: "100%",
        radius: ["30%", "50%"],
        center: ["28%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  },
};
pieOptions["circular-pie-num"] = pieOptions["circular-pie"];
//柱状图
var barOptions = {
  "base-bar": {
    title: [
      {
        text: "",
        subtext: "",
        top: "45%",
        left: "20%",
        textStyle: {
          fontSize: "20px",
          color: "#1a1a1a",
        },
        subtextStyle: {
          fontSize: "12px",
          color: "#999999",
        },
      },
    ],
    color: ["#01D3B6", "#48A9FF", "#FFC389"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          opacity: 0,
        },
      },
    },
    grid: {
      left: "0%",
      right: "0%",
      bottom: "5%",
      top: "10%",
      height: "85%",
      containLabel: true,
      z: 22,
    },
    xAxis: [
      {
        type: "category",
        gridIndex: 0,
        data: [],
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: "rgb(170,170,170)",
          fontSize: 10,
        },
        axisLine: {
          lineStyle: {
            color: "#DCDFE6",
          },
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {
          show: true,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "rgb(170,170,170)",
        },
      },
    ],
    series: [
      {
        name: "",
        type: "bar",
        barWidth: 18,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          normal: {
            barBorderRadius: 10,
          },
        },

        data: [],
      },
    ],
  },
  "base-horizontal-bar": {
    title: [
      {
        text: "",
        subtext: "",
        top: "45%",
        left: "20%",
        textStyle: {
          fontSize: "20px",
          color: "#1a1a1a",
        },
        subtextStyle: {
          fontSize: "12px",
          color: "#999999",
        },
      },
    ],
    grid: {
      left: "2%",
      right: "2%",
      bottom: "2%",
      top: "2%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "none",
      },
      formatter: function (params) {
        return params[0].name + " : " + params[0].value;
      },
    },
    xAxis: [
      {
        show: false,
        type: "value",
      },
    ],
    yAxis: [
      {
        type: "category",
        inverse: true,
        axisLabel: {
          show: true,
          textStyle: {
            color: "#8291A9",
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        data: [],
      },
    ],
    series: [
      {
        name: "",
        type: "bar",
        itemStyle: {
          normal: {
            barBorderRadius: 0,
          },
        },
        barWidth: 18,
        barCategoryGap: "5%",
        data: [],
      },
    ],
  },
  "base-stack-bar": {
    title: [
      {
        text: "",
        subtext: "",
        top: "10%",
        left: "20%",
        textStyle: {
          fontSize: "20px",
          color: "#1a1a1a",
        },
        subtextStyle: {
          fontSize: "12px",
          color: "#999999",
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        textStyle: {
          color: "#fff",
        },
      },
    },
    grid: {
      left: "0%",
      right: "0%",
      bottom: "5%",
      top: "10%",
      height: "85%",
      containLabel: true,
      z: 22,
    },
    legend: {
      left: "center",
      top: "0",
      itemWidth: 7,
      itemHeight: 7,
      textStyle: {
        color: "#90979c",
        height: 10,
        rich: {
          a: {
            verticalAlign: "middle",
          },
        },
      },
      data: [],
    },
    color: ["#FF4DB7", "#F5222D", "#01D3B6", "#1E91FF", "#8291A9", "#61b2ff"],
    calculable: true,
    xAxis: [
      {
        type: "category",
        axisLine: {
          lineStyle: {
            color: "#DCDFE6",
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitArea: {
          show: false,
        },
        axisLabel: {
          color: "#8291A9",
          interval: 0,
          fontSize: 10,
          width: 100,
        },
        data: [],
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {
          show: true,
          lineStyle: {
            color: "#DCDFE6",
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#8291A9",
        },
        splitArea: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: "",
        type: "bar",
        stack: "",
        barMaxWidth: 35,
        barWidth: 20,
        barGap: "20%",
        barCategoryGap: "20%",
        itemStyle: {
          normal: {},
        },
        data: [],
      },
    ],
  },
  "base-stack-horizontal-bar": {
    title: [
      {
        text: "",
        subtext: "",
        top: "45%",
        left: "20%",
        textStyle: {
          fontSize: "16px",
          color: "#1a1a1a",
        },
        subtextStyle: {
          fontSize: "12px",
          color: "#999999",
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        textStyle: {
          color: "#fff",
        },
      },
    },
    grid: {
      borderWidth: 0,
      top: 50,
      bottom: 30,
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      left: "center",
      top: "20",
      textStyle: {
        color: "#90979c",
      },
      data: [],
    },
    color: ["#FF4DB7", "#F5222D", "#01D3B6", "#1E91FF", "#8291A9", "#61b2ff"],
    calculable: true,
    xAxis: [
      {
        type: "value",
        splitLine: {
          show: true,
          lineStyle: {
            color: "#DCDFE6",
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#8291A9",
        },
        splitArea: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: "category",
        axisLine: {
          lineStyle: {
            color: "#DCDFE6",
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitArea: {
          show: false,
        },
        axisLabel: {
          color: "#8291A9",
        },
        data: [],
      },
    ],

    series: [
      {
        name: "",
        type: "bar",
        stack: "",
        barMaxWidth: 35,
        barGap: "10%",
        itemStyle: {
          normal: {
            color: "",
          },
        },
        data: [],
      },
    ],
  },
};
//折线图
var lineOptions = {
  "base-line": {
    title: [
      {
        text: "",
        subtext: "",
        top: "0%",
        left: "40%",
        textStyle: {
          fontSize: "20px",
          color: "#1a1a1a",
        },
        subtextStyle: {
          fontSize: "12px",
          color: "#999999",
        },
      },
    ],
    color: ["#3398DB"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          opacity: 0,
        },
      },
    },
    grid: {
      left: "0%",
      right: "0%",
      bottom: "5%",
      top: "7%",
      height: "85%",
      containLabel: true,
      z: 22,
    },
    xAxis: [
      {
        type: "category",
        gridIndex: 0,
        data: [],
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: "rgb(170,170,170)",
          fontSize: 16,
        },
        axisLine: {
          lineStyle: {
            color: "#DCDFE6",
          },
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {
          show: true,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "rgb(170,170,170)",
        },
      },
    ],
    series: [
      {
        name: "",
        type: "line",
        lineStyle: {
          normal: {
            width: 8,
            color: {
              type: "linear",

              colorStops: [
                {
                  offset: 0,
                  color: "#A9F387", // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: "#48D8BF", // 100% 处的颜色
                },
              ],
              globalCoord: false, // 缺省为 false
            },
            shadowColor: "rgba(72,216,191, 0.3)",
            shadowBlur: 10,
            shadowOffsetY: 20,
          },
        },
        data: [],
      },
    ],
  },
};
lineOptions["line-and-bar"] = erowConfig.deepClone(lineOptions["base-line"]);
lineOptions["line-and-bar"].series = [];
//矩阵树图
var treemapOption = {
  title: {
    show: false,
  },
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c}",
  },
  toolbox: {
    show: false,
    feature: {
      mark: { show: false },
      dataView: { show: false, readOnly: false },
      restore: { show: false },
      saveAsImage: { show: false },
    },
  },
  calculable: false,
  color: ["#61b2ff"],
  series: [
    {
      name: "",
      type: "treemap",
      width: "90%",
      height: "90%",
      roam: false,
      silent: true,
      breadcrumb: {
        show: false,
      },
      nodeClick: false,
      // label: {
      //   show: true,
      //   position: "inside",
      //   formatter: function (params) {
      //     // return [`${params.name}\n` + `${params.value}`].join("");
      //     return [`{a|${params.name}}\n` + `{b|${params.value}}`].join("");
      //   },
      //   rich: {
      //     a: {
      //       fontSize: 12,
      //       padding: [0, 10, 0, 0],
      //     },
      //     b: {
      //       height: 24,
      //       fontSize: 14,
      //       align: "center",
      //       verticalAlign: "middle",
      //     },
      //   },
      // },
      label: {
        formatter: "{c}",
        top: 0,
      },
      itemStyle: {
        normal: {
          borderWidth: 1,
        },
      },
      data: [],
    },
    {
      name: "",
      type: "treemap",
      width: "90%",
      height: "90%",
      roam: false,
      silent: true,
      breadcrumb: {
        show: false,
      },
      nodeClick: false,
      // label: {
      //   show: true,
      //   position: "inside",
      //   formatter: function (params) {
      //     // return [`${params.name}\n` + `${params.value}`].join("");
      //     return [`{a|${params.name}}\n` + `{b|${params.value}}`].join("");
      //   },
      //   rich: {
      //     a: {
      //       fontSize: 12,
      //       padding: [0, 10, 0, 0],
      //     },
      //     b: {
      //       height: 24,
      //       fontSize: 14,
      //       align: "center",
      //       verticalAlign: "middle",
      //     },
      //   },
      // },
      label: {
        formatter: "{b}",
        position: "insideTopLeft",
      },
      itemStyle: {
        normal: {
          borderWidth: 1,
        },
      },
      data: [],
    },
  ],
};
//仪表盘
var guageOptions = {
  title: {
    text: "",
    bottom: "30px",
    left: "center",
    textStyle: {
      color: "#1A1A1A",
      fontSize: 22,
      fontWeight: "normal",
    },
  },
  series: [
    {
      name: "gaugeName",
      type: "gauge",
      pointer: {
        show: true,
        width: "15%",
        length: "15%",
        icon: "triangle",
        offsetCenter: ["0%", "-25%"],
        itemStyle: { color: "#FF9658" },
      },
      min: 0,
      max: 100,
      radius: "70%",
      startAngle: 220,
      endAngle: -40,
      splitNumber: 0,
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [[1, "#FFF3E8"]],
          width: 30,
        },
      },
      splitLine: {
        //分隔线样式
        show: false,
        length: 30,
        distance: 0,
        lineStyle: {
          color: "#ffb53e",
        },
      },
      axisLabel: {
        //刻度标签
        show: false,
      },

      detail: {
        show: true,
        offsetCenter: [0, "20%"],
        textStyle: {
          fontSize: 22,
          color: "#1a1a1a",
          fontWeight: "normal",
        },
        formatter: function (value) {
          return `${value}{name|%}`;
        },
        rich: {
          name: {
            fontSize: 15,
            color: "#1a1a1a",
          },
        },
      },
      data: [
        {
          value: "",
          itemStyle: {
            normal: {
              color: "#969696",
            },
          },
        },
      ],
    },
    {
      name: "gaugeName",
      type: "gauge",
      pointer: {
        show: false,
        width: "5%",
      },
      min: 0,
      max: 100,
      radius: "70%",
      startAngle: 220,
      endAngle: 142,
      splitNumber: 0,
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [[1, "#FFC48B"]],
          width: 30,
          opacity: 1,
        },
      },
      splitLine: {
        //分隔线样式
        show: false,
      },
      axisLabel: {
        //刻度标签
        show: false,
      },
      axisTick: {
        //刻度样式
        show: false,
      },
      detail: {
        show: false,
      },
    },
    {
      name: "gaugeName",
      type: "gauge",
      pointer: {
        show: false,
        width: "5%",
      },
      min: 0,
      max: 100,
      radius: "70%",
      startAngle: 220,
      endAngle: 219,
      splitNumber: 0,
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [[1, "#FFC48B"]],
          width: 32,
          opacity: 1,
        },
      },
      splitLine: {
        //分隔线样式
        show: false,
      },
      axisLabel: {
        //刻度标签
        show: false,
      },
      axisTick: {
        //刻度样式
        show: false,
      },
      detail: {
        show: false,
      },
    },
    {
      name: "gaugeName",
      type: "gauge",
      pointer: {
        show: false,
        width: "5%",
      },
      min: 0,
      max: 100,
      radius: "70%",
      startAngle: -39,
      endAngle: -40,
      splitNumber: 0,
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [[1, "#FFC48B"]],
          width: 32,
          opacity: 1,
        },
      },
      splitLine: {
        //分隔线样式
        show: false,
      },
      axisLabel: {
        //刻度标签
        show: false,
      },
      axisTick: {
        //刻度样式
        show: false,
      },
      detail: {
        show: false,
      },
    },
  ],
};
//水波图
var liquidFilloption = {
  title: {
    text: "",
    subtext: "",
    bottom: "0%",
    left: "center",
    textStyle: {
      fontSize: "10px",
      color: "#636D7E",
    },
    subtextStyle: {
      fontSize: "10px",
      color: "#636D7E",
    },
  },
  series: [
    {
      outline: {
        borderDistance: 5,
        itemStyle: {
          borderColor: "#E2F1FF", //边框颜色
          borderWidth: 3, //边框宽度
          shadowBlur: 0,
        },
      },
      radius: "70%",
      center: ["50%", "40%"],
      type: "liquidFill",
      data: [],
      itemStyle: {
        opacity: 0.95,
        shadowBlur: 0,
        shadowColor: "rgba(0, 0, 0, 0)",
      },
      color: ["#BDDFFF"],
      backgroundStyle: {
        borderWidth: 1, //边框宽度
        borderColor: "#BDDFFF", //边框颜色
        color: "white", //背景色
      },
      label: {
        color: "#1a1a1a",
        insideColor: "#1a1a1a",
        fontSize: 14,
      },
    },
  ],
};

chartTemplate = Object.assign(chartTemplate, pieOptions, barOptions, lineOptions);
chartTemplate["treemap"] = treemapOption;
chartTemplate["base-guage"] = guageOptions;
chartTemplate["liquid-fill"] = liquidFilloption;

let UcChartContainer = {
  name: "UcMobileChartsContainer",
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chartInstance: "",
      chartData: null,
      defautSearchParams: {},
    };
  },
  template: `<div :id="config.ControlProperty.ID" class="chart-wrapper" :class="activeClass(config, containerdata)" :style="chartStyle"></div>`,
  mixins: [commonMinxin],
  computed: {
    chartStyle() {
      let styleObj = {};
      if (this.config.ControlProperty.Style) {
        styleObj = Object.assign(styleObj, JSON.parse(this.config.ControlProperty.Style));
      }
      if (this.config.ControlProperty.Width) {
        styleObj["width"] = this.config.ControlProperty.Width;
      }
      if (this.config.ControlProperty.Height) {
        styleObj["height"] = this.config.ControlProperty.Height;
      }
      if (!styleObj.height) {
        styleObj = { height: "200px" };
      }

      return styleObj;
    },
  },
  methods: {
    runSpecialFun(fun, params) {
      if (fun) {
        if (erowConfig.hasProp(baseSpecial, fun)) {
          baseSpecial[fun](params, this);
        } else {
          erowSpecial[fun](params, this);
        }
      }
    },
    /**
     * 专门处理series中data数组的JSON字符串属性
     * @param {Object} option - ECharts配置对象
     */
    processSeriesDataJsonProperties(option) {
      if (option && option.series && Array.isArray(option.series)) {
        option.series.forEach((seriesItem) => {
          if (seriesItem && seriesItem.data && Array.isArray(seriesItem.data)) {
            seriesItem.data.forEach((dataItem) => {
              if (dataItem && typeof dataItem === "object") {
                // 遍历data数组中每个对象的所有属性
                Object.keys(dataItem).forEach((key) => {
                  const value = dataItem[key];
                  // 检查是否为JSON字符串
                  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
                    try {
                      dataItem[key] = JSON.parse(value);
                    } catch (e) {
                      console.warn(`Failed to parse JSON for ${key}:`, value);
                    }
                  }
                });
              }
            });
          }
        });
      }
    },
    mergeObj(source, target) {
      if (source === undefined) {
        source = {};
      }
      if (erowConfig.isObject(target)) {
        Object.keys(target).forEach((key) => {
          if (erowConfig.hasProp(source, key)) {
            //如果不是对象和数组直接赋值
            if (!erowConfig.isObject(target[key]) && !erowConfig.isArray(target[key])) {
              source[key] = target[key];
            } else {
              if (erowConfig.isObject(target[key])) {
                this.mergeObj(source[key], target[key]);
              }
              if (erowConfig.isArray(target[key])) {
                if (!source[key].length || (target[key].length && !erowConfig.isObject(target[key][0]))) {
                  //数组为空或不为空时里面值不是对象直接赋值
                  source[key] = target[key];
                } else {
                  //里面是对象时执行递归执行
                  target[key].forEach((item, index) => {
                    if (source[key][index] === undefined) {
                      source[key].push(item);
                    } else {
                      this.mergeObj(source[key][index], item);
                    }
                  });
                }
              }
            }
          } else {
            //如果没有直接赋值
            source[key] = target[key];
          }
        });
      } else {
        source = target;
      }
    },
    handleAfterGetChartData(option, chartData) {
      let extraConfig = {};

      //单独处理ChartData 的图表
      if (this.config.ControlProperty.ExtraConfig) {
        extraConfig = JSON.parse(this.config.ControlProperty.ExtraConfig);
      }

      this.mergeObj(option, extraConfig);

      this.mergeObj(option, chartData);

      // 合并完成后，处理series中data数组的JSON字符串属性
      this.processSeriesDataJsonProperties(option);

      this.runSpecialFun(this.config.ControlProperty.AfterGetContainerData, { option: option, chartData: chartData });
    },
    setOptionAndEvent(option) {
      let _this = this;
      console.log(option);
      this.chartInstance.setOption(option, true);
      if (this.config && this.config.ControlProperty.OnClientClick && _this.config.ControlProperty.DialogActionCtnrUID) {
        // if (this.config && this.config.ControlProperty.OnClientClick) {
        this.chartInstance.off("click");
        this.chartInstance.on("click", function (params) {
          _this.runSpecialFun(_this.config.ControlProperty.OnClientClick, {
            eventData: params,
            config: _this.config,
            option: option,
            chartInstance: _this.chartInstance,
          });
        });
      }
      if (this.config && _this.config.ControlProperty.LegendSelectChanged) {
        this.chartInstance.off("legendselectchanged");
        this.chartInstance.on("legendselectchanged", function (params) {
          _this.runSpecialFun(_this.config.ControlProperty.LegendSelectChanged, {
            eventData: params,
            config: _this.config,
            option: option,
            chartInstance: _this.chartInstance,
          });
        });
      }

      if (this.config && _this.config.ControlProperty.DialogActionCtnrUID) {
        this.chartInstance.off("click");
        this.chartInstance.on("click", function (paramter) {
          if (_this.config.ControlProperty.DialogActionCtnrUID) {
            let [fnCode, fnParameter, ctnrUID, pageMode] = _this.config.ControlProperty.DialogActionCtnrUID.split(".");
            if (_this.config.ControlProperty.DialogActionCtnrUID[0] === ":" && _this.containerdata) {
              [fnCode, fnParameter, ctnrUID, pageMode] = (_this.containerdata[_this.config.ControlProperty.DialogActionCtnrUID.slice(1)] || "").split(
                "."
              );
            }
            let controlGUID = _this.config.ControlProperty.DialogActionCtnrGuid;
            if (_this.containerdata && _this.containerdata.dialogConfig && _this.containerdata.dialogConfig[_this.config.ControlProperty.ID]) {
              controlGUID = _this.containerdata.dialogConfig[_this.config.ControlProperty.ID].dialogControlGuid;
            }
            let params = {
              menu_row_guid: _this.config.menuRowGuid,
              menuConfigKey: _this.config.menuConfigKey,
              controlGUID,
              CtnrUID: ctnrUID,
              pageMode: pageMode || "VIEW",
              fnParameter,
              fnCode,
              keyValue: paramter.data.value,
              detailData: paramter.data,
            };
            let clientClickFlag = erowConfig.hasProp(boardSpecial, _this.config.ControlProperty.OnClientClick);
            if (_this.config.ControlProperty.OnClientClick && clientClickFlag) {
              _this.runSpecialFun(_this.config.ControlProperty.OnClientClick, {
                paramter: paramter,
                eventData: params,
                config: _this.config,
                option: option,
                chartInstance: _this.chartInstance,
              });
              // boardSpecial[_this.config.ControlProperty.OnClientClick](_this, paramter, params)
            } else {
              pageManager.push("./detail.html", params);
            }
          }
        });
      }
    },
    loadECharts(chartData) {
      this.chartInstance = echarts.init(document.getElementById(this.config.ControlProperty.ID));
      let chartType = this.config.ControlProperty.ChartType;
      if (chartTemplate[chartType]) {
        //有匹配的ChartTyep 处理
        let option = erowConfig.deepClone(chartTemplate[chartType]);
        let oldTypes = ["pie1", "pie2", "pie3", "pie4", "bar1", "line1"];
        this.config.ControlProperty.ChartColorArray
          ? (option.color = JSON.parse(this.config.ControlProperty.ChartColorArray.replace(/'/g, '"')))
          : "";
        if (this.config.ControlProperty.ChartTitleRsCode) {
          let temp = Array.isArray(option.title) ? option.title[0] : option.title;
          temp.text = this.config.ControlProperty.ChartTitleRsCode;
          Array.isArray(option.title) && option.title.splice(0, 1, temp);
        }
        if (this.config.ControlProperty.ChartSubTitleRsCode) {
          let temp = Array.isArray(option.title) ? option.title[0] : option.title;
          temp.subtext = this.config.ControlProperty.ChartSubTitleRsCode;
          Array.isArray(option.title) && option.title.splice(0, 1, temp);
        }

        // this.config.ControlProperty.ChartSubTitleRsCode ? (option.title.subtext = this.config.ControlProperty.ChartSubTitleRsCode) : "";
        if (oldTypes.includes(chartType)) {
          //之前配置的处理逻辑
          if (chartType.includes("pie")) {
            this.$set(option.series[0], "data", chartData);
          } else if (chartType.includes("bar")) {
            chartData.forEach((item) => {
              item.type = "bar";
            });
            option.series = chartData;
          } else if (chartType.includes("line")) {
            chartData.forEach((item) => {
              item.type = "line";
            });
            option.series = chartData;
          }
          chartData && chartData.xAxis
            ? (option.xAxis.data = data.xAxis)
            : (option.xAxis.data = ["类目1", "类目2", "类目3", "类目4", "类目5", "类目6", "类目7"]);
        } else {
          //新加的ChartType逻辑处理
          //多柱处理

          if (chartType == "base-bar" && chartData.series.length > 1) {
            chartData.series.forEach((item, index) => {
              item.barWidth = option.series[0].barWidth;
              item.itemStyle = {
                normal: {
                  barBorderRadius: 0,
                },
              };
              chartData.series.splice(index, 1, item);
            });
          }
          //环形饼图的处理,默认显示图例数字和title 计算数字
          if (chartType.indexOf("circular-pie") != -1) {
            option.legend.formatter = function (name) {
              let targetValue;
              let total = 0;
              chartData.series[0].data.forEach((item) => {
                total += item.value;
              });
              chartData.series[0].data.forEach((item) => {
                if (item.name == name) {
                  if (chartType.indexOf("num") == -1) {
                    targetValue = ((item.value / total) * 100).toFixed(2) + "%";
                  } else {
                    targetValue = item.value;
                  }
                }
              });
              return [`{a|${name}}`, `{b|${targetValue}}`].join("");
            };
            let temp = option.title[0];
            temp.text = chartData.series[0].data.reduce(function (pre, cur) {
              if (cur) {
                pre += Number(cur.value);
              }
              return pre;
            }, 0);
            option.title.splice(0, 1, temp);
            // debugger;
          }

          if (chartType == "base-horizontal-bar" && chartData.series.length == 1) {
            option.series[0].itemStyle.normal["color"] = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: "#4B89F0",
              },
              {
                offset: 1,
                color: "#82BEF9",
              },
            ]);
          }

          if (chartType == "liquid-fill") {
            let temp = chartData.series[0].data[0];
            if (temp > 0.2) {
              chartData.series[0].data.push(temp - 0.02);
            } else {
              chartData.series[0].data.push(temp - 0.0001);
            }
            option.series[0].color = [
              new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: "#ffffff",
                },
                {
                  offset: 1,
                  color: "#BDDFFF",
                },
              ]),
            ];
          }
          //对于堆叠的图表，默认从color 数组中取值
          if (chartType.indexOf("stack") != -1) {
            chartData.series.forEach((item, index) => {
              console.log(item);
              console.log(option.color[index]);
              item.itemStyle = {
                normal: {
                  color: option.color[index],
                },
              };
              if (this.config.ControlProperty.ChartType.indexOf("bar") != -1) {
                item.barCategoryGap = "20%";
                item.barGap = "20%";
                // item.barMaxWidth = "60";
                // item.barWidth = "60";
              }
              chartData.series.splice(index, item);
            });
          }

          if (chartType == "base-guage") {
            let temp1 = option.series[1];
            let max = chartData.series[0].max;
            let val = chartData.series[0].data[0].value;
            temp1.endAngle = 220 - (val / max) * 260;
            option.series.splice(1, 1, temp1);
            //设置对应颜色

            option.series.forEach((item, index) => {
              let temp = item;
              //颜色设置
              if (Array.isArray(option.color) && option.color.length > 1) {
                if (index == 0) {
                  temp.pointer.itemStyle.color = option.color[0];
                  temp.axisLine.lineStyle.color = [[1, option.color[1]]];
                } else {
                  temp.axisLine.lineStyle.color = [[1, option.color[0]]];
                }
              }

              option.series.splice(index, 1, temp);
            });
          }

          if (chartType.indexOf("bar") != -1 || chartType.indexOf("line") != -1) {
            let endData = 0;
            if (chartData.series.length > 0 && chartType == "base-bar") {
              //多柱
              let totalLen = chartData.xAxis[0].data.length * chartData.series.length;
              if (Array.isArray(chartData.xAxis) && totalLen > 7) {
                let radio = Number(5 / totalLen.toFixed(2));
                endData = Math.ceil(100 * radio);
              } else {
                endData = 75;
              }
            } else if (this.config.ControlProperty.ChartType.indexOf("horizontal") != -1) {
              if (Array.isArray(chartData.yAxis) && chartData.yAxis.length > 7) {
                let radio = Number(5 / chartData.yAxis.length.toFixed(2));
                endData = Math.ceil(100 * radio);
              } else {
                endData = 100;
              }
            } else {
              if (Array.isArray(chartData.xAxis) && chartData.xAxis[0].data.length > 7) {
                let radio = Number(5 / chartData.xAxis[0].data.length.toFixed(2));
                endData = Math.ceil(100 * radio);
              } else {
                endData = 100;
              }
            }
            option["dataZoom"] = [
              {
                type: "inside", // 内置在坐标系中
                start: 0, // 数据窗口范围的起始百分比。范围是：0 ~ 100。表示 0% ~ 100%。
                end: endData, // 数据窗口范围的结束百分比。范围是：0 ~ 100。
                zoomLock: true, // 是否锁定选择区域（或叫做数据窗口）的大小。
              },
            ];
          }

          if (chartType == "treemap") {
            const { series } = chartData;
            if (series && series.length > 0) {
              const { data = [] } = series[0];
              const l = [-30, -20, -15, -10, 0, 10, 25, 20, 30, 35];
              let sum = 0;
              let count = 0;
              data.forEach((item) => {
                const { value } = item;
                sum = sum + value;
                count++;
              });

              const aver = Math.min(sum / count);
              data.forEach((item) => {
                const { value } = item;
                let index = 4;
                const res = value - aver;
                if (res >= 10 && res < 20) {
                  index = index - 1;
                } else if (res >= 20 && res < 30) {
                  index = index - 2;
                } else if (res >= 30) {
                  index = index - 3;
                } else if (res < 0 && res > -10) {
                  index = index + 1;
                } else if (res <= -10 && res > -20) {
                  index = index + 2;
                } else if (res <= -20) {
                  index = index + 3;
                }

                item.itemStyle = {
                  // 此节点特殊的 itemStyle 定义（如果需要的话）。
                  color: `hsl(209, 100%, ${50 + l[index]}%)`,
                };
              });

              const obj = erowConfig.deepClone(series[0]);
              series.push(obj);
            }
          }

          this.handleAfterGetChartData(option, chartData);
        }
        console.log(option, "1299");
        this.setOptionAndEvent(option);
      } else {
        //无直接看ExtraConfig
        let option = {};
        this.handleAfterGetChartData(option, chartData);
        this.setOptionAndEvent(option);
      }
    },
    requestData(paramter) {
      if (!paramter) paramter = {};
      if (this.config.ControlProperty.DataSrc) {
        let params = {
          controlGUID: this.config.ControlProperty.DataSourceCtnrGuid,
          ctnrUID: this.config.ControlProperty.DataSourceCtnrUID,
          menuConfigKey: this.menuConfigKey || this.$root.menuConfigKey,
          opCode: "VIEW",
          pValueSet: this.pValueSet || this.config.pValueSet || this.$root.pValueSet,
          paramMap: paramter,
        };
        erRequest.post(
          this.config.ControlProperty.DataSrc,
          params,
          (res) => {
            if (res.code == "SUCCESS") {
              this.chartData = res.data;
              this.loadECharts(res.data);
            } else {
              console.log(res);
              this.loadECharts(res.data);
            }
          },
          (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          }
        );
      } else {
        apis.sysLoadDBData({
          vm: this,
          params: {
            controlCode: this.config.ControlCode,
            pValueSet: this.config.pValueSet,
            controlGUID: this.config.ControlGUID,
            menuRowGuid: this.config.menuRowGuid,
            keyValue: this.config.keyValue || "",
            pageMode: "VIEW",
            paramMap: paramter,
          },
          success: (res) => {
            let data = res.data[this.config.ControlProperty.ID];
            this.chartData = data;
            this.loadECharts(data);
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
    },
    getDefaultValueAndSearchList() {
      apis.sysLoadControlData({
        vm: this,
        params: {
          menuRowGuid: this.config.menuRowGuid || "",
          controlGUID: this.config.ControlProperty.ScopeCtnrGuid,
          pageMode: this.config.pageMode || "view",
          pValueSet: this.config.pValueSet || erowConfig.generateUUID(),
          nonce: Date.now() + Math.floor(Math.random() * (100 - 1)) + 1,
        },
        success: (res) => {
          if (res.code == "SUCCESS") {
            Object.keys(res.data).forEach((key) => {
              let child = this.config.ControlProperty.ScopeCtnrConfig.ChildContainers.find((item) => {
                return item.ControlProperty.ID == key;
              });
              this.defautSearchParams[child.ControlProperty.DataField] = res.data[key].DefaultValue;
            });
            this.requestData(this.defautSearchParams);
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
  },
  mounted() {
    let _this = this;
    eventEmitter.on("changeChartData", (params) => {
      if (this.config.ControlProperty.ScopeCtnrConfig) {
        if (params.id == this.config.ControlProperty.ScopeCtnrConfig.ControlProperty.ID) {
          _this.requestData(params.paramMap);
        }
      }
    });
    eventEmitter.on("refresh", () => {
      this.requestData();
    });
    eventEmitter.on("search", (controlGUID) => {
      let tempGuid = this.config.UcScopeContainer ? this.config.UcScopeContainer.ControlGUID : "";
      let scopeGuid = this.config.ControlProperty.ScopeCtnrGuid || tempGuid;
      let scopCtnr = this.config.ControlProperty.ScopeCtnr;
      if (scopeGuid == val || scopCtnr == val) {
        this.requestData();
      }
    });
    if (!window.echarts) {
      const script = document.createElement("script");
      // 这里的相对路径，是组件的js文件相对echarts依赖的路径，不是引用组件的html相对echarts依赖的路径
      script.src = "../libs/js/echarts.min.js";
      script.onload = () => {
        const script1 = document.createElement("script");
        // 这里的相对路径，是组件的js文件相对echarts依赖的路径，不是引用组件的html相对echarts依赖的路径
        script1.src = "../libs/js/echarts-liquidfill.js";
        script1.onload = () => {
          if (_this.config.ControlProperty.ScopeCtnrGuid) {
            _this.getDefaultValueAndSearchList(this.pageListContainers, this.getDataListCallBack);
          } else {
            this.requestData();
          }
          //this.requestData();
        };
        document.head.appendChild(script1);
      };
      document.head.appendChild(script);
    } else {
      if (_this.config.ControlProperty.ScopeCtnrGuid) {
        _this.getDefaultValueAndSearchList(this.pageListContainers, this.getDataListCallBack);
      } else {
        this.requestData();
      }
    }
  },
};
