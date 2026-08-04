/*
 * 辅助方法
 */
(function () {
  var hideFields = ["UcLabel", "UcData", "UcHiddenField"];
  var validateRules = {
    idCard: {
      rule: /(^\d{15}&)|(^\d{18})|(^\d{17}(\d|X|x)$)/,
      message: "身份证号格式不正确",
    },
    telPhone: {
      rule: /^1[3456789][0-9]{9}$/,
      message: "手机号格式不正确",
    },
    email: {
      rule: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
      message: "邮箱格式不正确",
    },
    num: {
      rule: /^[0-9]\d*\,\d*|[0-9]\d*$/,
      message: "只允许为数字格式",
    },
  };
  function message() {
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
  }

  function getOpName(type) {
    let map = {
      DELETE: "删除",
      EDIT: "编辑",
      READ: "查看",
      ADD: "新增",
      SUBMIT: "提交",
      EXPORT: "导出",
      APPROVE: "批准",
      DISAPPROVE: "不批准",
      COMMENT: "评论",
      UNDOSUBMIT: "取消提交",
      WFADJUSTSTEP: "流程调整",
      AGREE: "同意",
      AUDIT: "核准",
      CANCEL: "取消",
      CLOSE: "	关闭单据",
      COMMENT: "评论",
      COMPLAIN: "申诉",
      COMPLETE: "完成",
      CONFIRM: "确认",
      GOBACK: "回退",
      RESCORE: "重新评分",
      REEDIT: "重新修改",
      PRINT: "打印",
      UNDOAUDIT: "取消核准",
      REMODIFY: "重新修改",
    };
    return map[type] ? map[type] : "";
  }
  function isEmpty(obj) {
    if (!obj) {
      //为0的时候不为空
      if (obj === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  function isNumber(val) {
    return Object.prototype.toString.call(val) == "[object Number]";
  }

  function isString(val) {
    return Object.prototype.toString.call(val) == "[object String]";
  }
  //动态加载js
  function loadSource(fileName) {
    if (fileName && fileName.indexOf("css") != -1) {
      document.write(`<link rel="stylesheet" href="${fileName}">`);
    } else {
      document.write(`<script  src=${fileName}></script>`);
    }
  }
  //获取url 后面参数对象
  function getQueryObject(url) {
    url = url == null ? window.location.href : url;
    const search = url.substring(url.lastIndexOf("?") + 1);
    const obj = {};
    const reg = /([^?&=]+)=([^?&=]*)/g;
    search.replace(reg, (rs, $1, $2) => {
      const name = decodeURIComponent($1);
      let val = decodeURIComponent($2);
      val = String(val);
      obj[name] = val;
      return rs;
    });
    return obj;
  }
  //判断属性 对象是否包含某字段,或者包含其中一个
  function hasProp(obj, propName) {
    if (!obj) {
      return false;
    }
    if (!Object.prototype.toString.call(obj) == "[object Object]") {
      return false;
    } else {
      let propNames = [];
      if (Array.isArray(propName)) {
        propNames = propName;
      } else {
        propNames.push(propName);
      }
      var flag = false;
      propNames.forEach((key) => {
        if (obj.hasOwnProperty(key)) {
          flag = true;
        }
      });
      return flag;
    }
  }
  function getActionObj(item) {
    let result = {};
    if (item && item.ControlProperty && Object.prototype.toString.call(item.ControlProperty.AutoPostBackAction) == "[object String]") {
      result = JSON.parse(item.ControlProperty.AutoPostBackAction);
    }
    if (item && item.ControlProperty && Object.prototype.toString.call(item.ControlProperty.AutoPostBackAction) == "[object Object]") {
      result = item.ControlProperty.AutoPostBackAction;
    }

    return result;
  }

  //判断是否有事件
  function isHasEvent(configItem, targetName) {
    if (targetName) {
      return getEventFun(configItem, targetName) ? true : false;
    } else if (configItem.ControlCode == "UcBoundField" && configItem.ControlProperty.DialogActionCtnrGuid) {
      configItem.ControlProperty.actionType = "dialogaction";
      return true;
    } else {
      return configItem.ControlProperty.ClientActions || configItem.ControlProperty.OnClientClick || configItem.ControlProperty.actionType;
    }
  }

  //获取配置里面的事件回调函数名
  function getEventFun(configItem, targetName) {
    let getFun = function (map) {
      let fun = "";
      Object.keys(map).forEach((key) => {
        if (key && key.toLowerCase().indexOf(targetName) != -1) {
          fun = map[key];
        }
      });
      return fun;
    };
    if (configItem && hasProp(configItem.ControlProperty, "ClientActions")) {
      let actions = configItem.ControlProperty.ClientActions;
      if (actions) {
        if (Object.prototype.toString.call(actions) == "[object Object]") {
          let map = actions;
          return getFun(map);
        } else if (Object.prototype.toString.call(actions) == "[object String]") {
          let map = JSON.parse(actions);
          return getFun(map);
        }
      } else {
        return "";
      }
    } else {
      return "";
    }
  }
  //构建换行的数据
  function getNewLineArr(detailConfig) {
    let newObj = {};
    let _p = 0;
    for (let i = 0; i < detailConfig.length; i++) {
      const item = detailConfig[i];
      const flag1 = item["IsNewLine"] && item["IsNewLine"].toLowerCase() === "true";
      const flag2 = item.ControlProperty && item.ControlProperty["IsNewLine"] && item.ControlProperty["IsNewLine"].toLowerCase() === "true";
      if (flag1 || flag2) {
        _p++;
      }
      if (!Array.isArray(newObj[`key${_p}`])) {
        newObj[`key${_p}`] = [];
      }
      newObj[`key${_p}`].push(item);
    }
    return newObj;
  }
  //将offSet 合并成前一项的children
  function getMergeArr(obj) {
    //obj:{key1:[{},{}]}
    Object.keys(obj).forEach((item) => {
      let firstArrIndex = []; //记录第一个有合并标识的元素
      let nextArr = []; //记录后面连接一块的元素

      for (let i = 1; i < obj[item].length; i++) {
        if (hasProp(obj[item][i].ControlProperty, "Offset")) {
          if (
            obj[item][i].ControlProperty.Offset == -1 &&
            (!obj[item][i - 1].ControlProperty.hasOwnProperty("Offset") || obj[item][i - 1].ControlProperty.Offset == 0)
          ) {
            firstArrIndex.push(i);
          }
          if (obj[item][i].ControlProperty.Offset == -1 && obj[item][i - 1].ControlProperty.Offset == -1) {
            nextArr.push(i);
          }
        }
      }
      for (let j = 0; j < firstArrIndex.length; j++) {
        obj[item][firstArrIndex[j] - 1].children = [];
        obj[item][firstArrIndex[j] - 1].children.push(obj[item][firstArrIndex[j]]);
        for (let m = 0; m < nextArr.length; m++) {
          if (j != firstArrIndex.length - 1) {
            if (nextArr[m] > firstArrIndex[j] && nextArr[m] < firstArrIndex[j + 1]) {
              obj[item][firstArrIndex[j] - 1].children.push(obj[item][nextArr[m]]);
            }
          } else {
            if (nextArr[m] > firstArrIndex[j]) {
              obj[item][firstArrIndex[j] - 1].children.push(obj[item][nextArr[m]]);
            }
          }
        }
      }
      if (Array.isArray(obj[item])) {
        obj[item] = obj[item].filter((item, i) => {
          return firstArrIndex.indexOf(i) == -1 && nextArr.indexOf(i) == -1;
        });
      }
    });
    return obj;
  }
  //克隆数组
  function deepClone(obj) {
    let isArr = Array.isArray(obj);
    let isJson = Object.prototype.toString.call(obj) === "[object Object]";
    if (isArr) {
      // 克隆数组
      let newObj = [];
      for (let i = 0; i < obj.length; i++) {
        newObj[i] = deepClone(obj[i]);
      }
      return newObj;
    } else if (isJson) {
      // 克隆Object
      let newObj = {};
      for (let i in obj) {
        newObj[i] = deepClone(obj[i]);
      }
      return newObj;
    }
    // 不是引用类型直接返回
    return obj;
  }
  function isObject(params) {
    return params && Object.prototype.toString.call(params) == "[object Object]" ? true : false;
  }
  //递归将后端返回的refContainer去除取其具体包裹的容器
  function convertConfig(childContainers, extraParams) {
    let temp = [];
    if (Array.isArray(childContainers)) {
      childContainers.forEach((configItem) => {
        if (hasProp(configItem, "TargetContainer")) {
          if (extraParams && isObject(extraParams)) {
            Object.assign(configItem.TargetContainer, configItem.ControlProperty, extraParams);
          }
          if (configItem.ControlCode == "UcTab") {
            let parentControlPropertyObj = {
              parentControlProperty: deepClone(configItem.ControlProperty),
            };
            Object.assign(configItem.TargetContainer, parentControlPropertyObj);
          }
          temp.push(configItem.TargetContainer);
          if (hasProp(configItem.TargetContainer, "ChildContainers")) {
            let res = convertConfig(configItem.TargetContainer.ChildContainers, extraParams);
            configItem.TargetContainer.ChildContainers = res;
          }
          configItem.TargetContainer._TargetControlCode = `${configItem.ControlCode}.${configItem.TargetContainer.ControlCode}`;
          const cssList = [configItem.TargetContainer.ControlProperty.CssClass, configItem.ControlProperty.CssClass, extraParams.CssClass]
            .join(" ")
            .split(" ");
          configItem.TargetContainer.ControlProperty.CssClass = Array.from(new Set(cssList)).join(" ");
        } else {
          if (extraParams && isObject(extraParams)) {
            Object.assign(configItem, extraParams);
          }
          if (configItem.ControlCode == "UcTab") {
            let parentControlPropertyObj = {
              parentControlProperty: deepClone(configItem.ControlProperty),
            };
            Object.assign(configItem.TargetContainer, parentControlPropertyObj);
          }
          temp.push(configItem);
          if (hasProp(configItem, "ChildContainers")) {
            let res = convertConfig(configItem.ChildContainers, extraParams);
            configItem.ChildContainers = res;
          }
        }
      });
    }
    return temp;
  }
  //获取uuid
  function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
  //设置日期格式
  function formatDateReg(date, fmt) {
    //author: meizz
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return fmt;
  }

  function validateForm(obj, rules) {
    let num = 0;
    //同类型错误只弹出一次
    if (num == 0) {
      Object.keys(obj).forEach((item) => {
        let robj = rules[item];
        if (robj) {
          if (rules[item].hasOwnProperty("IsRequired")) {
            let IsRequired = rules[item].IsRequired + ""; //先转成字符串
            if (isEmpty(obj[item]) && IsRequired.toLowerCase() == "true") {
              num++;
              if (num == 1) {
                vant.Toast.fail({
                  message: `必填项${rules[item].RSValue}不能为空`,
                  type: "error",
                });
              }
              return num;
            }
          }

          if (rules[item].hasOwnProperty("FieldVerify")) {
            if (rules[item].FieldVerify) {
              if (validateRules[rules[item].FieldVerify] && obj[item]) {
                if (!validateRules[rules[item].FieldVerify].rule.test(obj[item])) {
                  num++;
                  if (num == 1) {
                    if (rules[item].FieldVerify == "num") {
                      vant.Toast.fail({
                        message: `${rules[item].RSValue} ${validateRules[rules[item].FieldVerify].message}`,
                        type: "error",
                      });
                    } else {
                      vant.Toast.fail({
                        message: validateRules[rules[item].FieldVerify].message,
                        type: "error",
                      });
                    }
                  }

                  return num;
                }
              }
            }
          }
        }
      });
    }
    return num;
  }

  // 判断数据类型
  function getDataType(data) {
    const temp = Object.prototype.toString.call(data);
    const type = temp.match(/\b\w+\b/g);
    return type.length < 2 ? "undefined" : type[1];
  }

  // 根据ID搜索容器
  function searchByID(targetId, uccontainer) {
    if (window.pageComponents[targetId]) {
      return window.pageComponents[targetId];
    }
    let childrens = uccontainer.$children;
    let ans = null;
    for (let child of childrens) {
      if (child.config.ControlProperty.ID === targetId) {
        ans = child;
        break;
      }
      if (child.config.ControlCode == "UcContainer") {
        ans = searchByID(targetId, child);
        break;
      }
    }
    return ans;
  }

  // 构造树结构
  function handleTree(data, id, pid, orderField) {
    let result = [];
    if (!Array.isArray(data)) {
      return result;
    }

    let map = {};
    data.forEach((item) => {
      map[item[id]] = item;
    });

    let field = orderField ? orderField : "show_order";
    data.forEach((item) => {
      let parent = map[item[pid]];
      if (parent) {
        (parent.children || (parent.children = [])).push(item);
        parent.children.sort((a, b) => {
          return a[field] - b[field];
        });
      } else {
        result.push(item);
      }
    });
    return result;
  }

  function getConfigFieldValue(dataField, data = {}) {
    if (dataField && dataField.startsWith(":")) {
      if (dataField.startsWith(":C") && dataField.includes(".")) {
        const [containerId, field] = dataField.slice(1).split(".");
        if (window.pageContext[containerId]) {
          return (pageContext[containerId].initData || pageContext[containerId].detailData || {})[field];
        }
        return undefined;
      } else {
        return data[dataField.slice(1)];
      }
    }
    return dataField;
  }

  function isArray(data) {
    return Object.prototype.toString.call(data) == "[object Array]";
  }

  function debounce(fn, wait, immediate) {
    // 自由变量，debounce执行完成被释放，time也不会被释放
    let time;
    // 返回一个闭包，接受参数
    return function (...args) {
      // 保存闭包被调用时的this
      const this_ = this;
      // 清除上一次的定时器
      if (time) {
        clearTimeout(time);
      }
      // 配置开关
      if (immediate) {
        const action = !time;
        // time没置空前因为time存在，所以fn不会执行
        time = setTimeout(function () {
          // 每隔wait时间将time置为空
          time = null;
        }, wait);
        if (action) {
          fn.apply(this_, args);
        }
      } else {
        // 不再是直接执行fn，在内部传递参数
        time = setTimeout(function () {
          // 通过apply修改fn的this
          fn.apply(this_, args);
        }, wait);
      }
    };
  }

  function bindPageRefreshEvent(callback, params) {
    if (params.config && params.config.ControlProperty && params.config.ControlProperty.PullRefreshDisabled == "true") {
      return;
    }
    if (params.config && params.config.AllowRefresh == "false") {
      return;
    }
    var _element = document.getElementById("app"),
      _refreshText = document.querySelector(".refreshText"),
      _startPos = 0, // 初始的值
      _transitionHeight = 0; // 移动的距离

    let navNode = null;
    let navNextNode = null;
    const refreshTextNodeProxy = _refreshText ? _refreshText.cloneNode() : "";

    var touchEndCallBack = callback;

    _element.addEventListener(
      "touchstart",
      function (e) {
        _startPos = e.touches[0].pageY; // 记录初始位置
        const nav = document.querySelector(".head-nav-container");
        const navNext = nav ? nav.nextElementSibling : "";
        // 没有导航栏走顶部刷新逻辑
        if (!nav) {
          _element.style.position = "relative";
          _element.style.transition = "transform 0s";
          return;
        }

        if (nav && navNext) {
          navNode = nav;
          navNextNode = navNext;
          navNext.style.position = "relative";
          navNext.style.transition = "transform 0s";
          return;
        }
      },
      false
    );
    _element.addEventListener(
      "touchmove",
      function (e) {
        // e.touches[0].pageY 当前位置
        _transitionHeight = e.touches[0].pageY - _startPos; // 记录差值
        //从顶部拉才生效，避免误刷新
        if (_transitionHeight > transitionHeightLever && _transitionHeight < transitionHeightLever + 60 && _startPos < 100) {
          const nav = navNode;

          if (!nav) {
            _refreshText.innerText = "下拉刷新";
            _element.style.transform = "translateY(" + _transitionHeight + "px)";

            if (_transitionHeight > transitionHeightLever + 55) {
              _refreshText.innerText = "释放更新";
            }
            return;
          }

          // 有导航栏的刷新，刷新文案在导航栏下方
          if (nav) {
            refreshTextNodeProxy.innerText = "下拉刷新";
            if (_transitionHeight > transitionHeightLever + 55) {
              refreshTextNodeProxy.innerText = "释放更新";
            }

            if (navNextNode) {
              // debugger;
              navNextNode.style.transform = "translateY(" + _transitionHeight + "px)";
            }
            nav.after(refreshTextNodeProxy);
            return;
          }
        }
      },
      false
    );
    _element.addEventListener(
      "touchend",
      function (e) {
        const nav = navNode;

        if (!nav) {
          _element.style.transition = "transform 0.5s ease 1s";
          _element.style.transform = "translateY(0px)";

          // todo...

          if (_transitionHeight > 70 && _startPos < 100) {
            _refreshText.innerText = "更新中...";
            _transitionHeight = 0;
            touchEndCallBack(params);
          } else {
            _refreshText.innerText = "";
            _transitionHeight = 0;
          }
          return;
        }

        if (nav) {
          if (navNextNode) {
            navNextNode.style.transition = "transform 0.5s ease 1s";
            navNextNode.style.transform = "translateY(0px)";
          }

          if (_transitionHeight > 70 && _startPos < 100) {
            refreshTextNodeProxy.innerText = "更新中...";
            _transitionHeight = 0;
            touchEndCallBack(params);
          } else {
            refreshTextNodeProxy.innerText = "";
            _transitionHeight = 0;
          }
          return;
        }
      },
      false
    );
  }
  //缓存在新增或编辑状态下容器临时填写的数据，formCode 为表单容器ControlCode,gridCode 为grid容器ControlCode
  function cacheTargetContainerTempData(containerContext, formCode, gridCode, result) {
    let pageMode = ["ADD", "EDIT"];
    let totalCode = formCode.concat(gridCode);

    if (pageMode.includes(containerContext.config.pageMode)) {
      if (containerContext && containerContext.childContainers) {
        containerContext.childContainers.forEach((childConfig) => {
          let childRef = Array.isArray(containerContext.$refs[childConfig.ControlProperty.ID])
            ? containerContext.$refs[childConfig.ControlProperty.ID][0]
            : containerContext.$refs[childConfig.ControlProperty.ID];
          if (childRef) {
            if (totalCode.includes(childRef.config.ControlCode)) {
              let tempData = "";
              if (formCode.includes(childRef.config.ControlCode) && childRef.detailData) {
                tempData = JSON.stringify(childRef.detailData);
              }
              if (gridCode.includes(childRef.config.ControlCode) && childRef.listData) {
                tempData = JSON.stringify(childRef.listData);
              }
              let flag = childRef.config.ControlProperty.IsCacheTempData || childRef.config._IsCacheTempData;
              if (flag == "true") {
                result.push({
                  name: childRef.config.ControlProperty.ID + childRef.config.pageMode + childRef.config.keyValue + "TEMP_CACHE",
                  value: tempData,
                  cacheTime: new Date().getTime(),
                  expireTime: 1 * 60 * 60 * 1000,
                });
              }
            } else {
              cacheTargetContainerTempData(childRef, formCode, gridCode, result);
            }
          }
        });
      }
    }
  }

  // window.addEventListener("beforeunload", () => {
  //   sessionStorage.setItem("SearchParamsInheritMap", JSON.stringify({ ...erowConfig.searchParamsInheritMap }));
  // });

  console.hint = (type, message) => {
    console.log(
      `%c${type}%c${message}`,
      `padding: 5px; background: #dea888; border-radius: 3px 0 0 3px`,
      `padding: 5px; background: #8ad7a3; border-radius: 0 3px 3px 0`
    );
  };

  // 节流函数
  function throttle(func, delay, isImmediate = false) {
    let timer = null;
    return function () {
      let context = this;
      let args = arguments;
      if (!timer) {
        if (isImmediate) {
          // 立即执行版
          func.apply(context, args);
        }
        timer = setTimeout(function () {
          if (!isImmediate) {
            // 不会立即执行版
            func.apply(context, args);
          }
          clearTimeout(timer);
          timer = null;
        }, delay);
      }
    };
  }

  // 全局刷新
  function globalUpdate() {
    // 调用接口获取数据的组件要监听 refresh 的事件！
    eventEmitter.emit("refresh", {});
  }

  function runAutoAction({ action, targetControl, configItem, val, rIndex, rData, isHasResult, flag }, vm) {
    //flag   用来判断是否第一次执行
    let formContainer = ["UcFormDetailView", "UcScopeContainer","UcCardContainer"];
    let gridContainer = ["UcGridviewContainer", "UcJsGridContainer"];
    let treeControls = ["UcComboTree", "UcComboTreeField", "UcJsGridComboTreeField", "UcJsGridWebComboField"];

    let result = "";
    Object.keys(action).forEach((key) => {
      let funName = key;
      let paramsMap = action[key];
      if (gridContainer.includes(vm.config.ControlCode) && rData) {
        let id = targetControl.ControlProperty.DataField||targetControl.ControlProperty.field;

        //清理值
        if (flag != "onload" && funName && funName.toLowerCase().indexOf("clearvalue") != -1) {
          if (Array.isArray(rData[id])) {
            rData[id] = [];
          } else if (isNumber(rData[id])) {
            rData[id] = 0;
          } else {
            rData[id] = "";
          }
          vm.dataArr.dataList.splice(rIndex, 1, rData);
        }
        //设置值
        if (funName && funName.toLowerCase().indexOf("setvalue") != -1) {
          let selectItem = configItem.ControlProperty.initData.find((item) => {
            return item[configItem.ControlProperty.DataValueField] === val;
          });

          let field = paramsMap[0]["value"];

          if (field) {
            if (selectItem) {
              rData[id] = selectItem[field];
            } else {
              rData[id] = field;
            }
          }
          vm.dataArr.dataList.splice(rIndex, 1, rData);
        }
        //设置控件下拉数据
        if (funName && funName.toLowerCase().indexOf("setdatasource") != -1) {
          let dataTargetControl = rData.controls.find((control) => {
            return control.ControlProperty.ID == targetControl.ControlProperty.ID;
          });
          // let storeKey = dataTargetControl.ControlProperty.ID + "-" + configItem.ControlProperty.DataField + "-" + val;
          // if (vm.dropListStore.has(storeKey)) {
          //   let dropListData = vm.deepClone(vm.dropListStore.get(storeKey));
          //   dataTargetControl.ControlProperty.initData = dropListData;
          //   dataTargetControl.ControlProperty.dropListData = vm.dropListStore.get(storeKey);
          //   return;
          // }
          let map = {};
          map[configItem.ControlProperty.DataField] = val;
          //获取 当前下拉框的选中的对象
          let selectObj = {};
          if (configItem.ControlProperty.dropListData) {
            selectObj = configItem.ControlProperty.dropListData.find((oneDrop) => {
              return oneDrop[configItem.ControlProperty.DataValueField] == val;
            });
          }
          apis.sysLoadControlData({
            vm: vm,
            params: {
              menuRowGuid: vm.config.menuRowGuid || "",
              controlGUID: vm.config.ControlGUID,
              pageMode: vm.config.pageMode || "view",
              pValueSet: vm.config.pValueSet,
              paramMap: {
                ...selectObj,
                ...map,
              },
            },
            success: (res) => {
              if (res.code == "SUCCESS") {
                let result = res.data[targetControl.ControlProperty.ID];
                if (result) {
                  // vm.dropListStore.set(storeKey, result.dataList);
                  dataTargetControl.ControlProperty.initData = vm.deepClone(result.dataList);
                  if (treeControls.includes(dataTargetControl.ControlCode)) {
                    let idKey = dataTargetControl.ControlProperty.IDKey ? dataTargetControl.ControlProperty.IDKey.toLowerCase() : "id";
                    let pidKey = dataTargetControl.ControlProperty.PIDKey ? dataTargetControl.ControlProperty.PIDKey.toLowerCase() : "pid";

                    dataTargetControl.ControlProperty.dataArr = vm.handleTree(result.dataList, idKey, pidKey);
                  } else {
                    dataTargetControl.ControlProperty.dropListData = result.dataList;
                  }
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
        }
        //更改关联配置项必填、禁用、样式等
        if (funName && funName.toLowerCase().indexOf("setconfig") != -1) {
          if (Array.isArray(paramsMap)) {
            paramsMap.forEach((paramItem) => {
              Object.keys(paramItem).forEach((key) => {
                if (key.toLowerCase() == "isrequired" && gridContainer.includes(vm.config.ControlCode)) {
                  if (typeof rData._requiredFileds !== "object") {
                    vm.$set(rData, "_requiredFileds", []);
                  }
                  rData._requiredFileds.push(targetControl.ControlProperty.DataField);
                  return;
                }
                if (isHasResult) {
                  result = paramItem[key];
                } else {
                  let dataTargetControl = rData.controls.find((control) => {
                    return control.ControlProperty.ID == targetControl.ControlProperty.ID;
                  });
                  vm.$set(dataTargetControl.ControlProperty, key, paramItem[key]);
                }
              });
            });
          }
        }
      } else if (formContainer.includes(vm.config.ControlCode)) {
        let id =targetControl.ControlProperty.ID;

        //清理值
        if (flag != "onload" && funName && funName.toLowerCase().indexOf("clearvalue") != -1) {
          if (targetControl.ControlCode == "UcDropDownList" && targetControl.ControlProperty.SelectedMulti == "true") {
            vm.detailData[id] = [];
          } else {
            if (Array.isArray(vm.detailData[id])) {
              vm.detailData[id] = [];
            } else if (isNumber(vm.detailData[id])) {
              vm.detailData[id] = 0;
            } else {
              vm.detailData[id] = "";
            }
          }
        }
        //设置值
        if (funName && funName.toLowerCase().indexOf("setvalue") != -1) {
          let dataList = vm.controldata[configItem.ControlProperty.ID].dataList;
          let selectItem = dataList.find((item) => {
            return item[configItem.ControlProperty.DataValueField] == val;
          });
          let field = paramsMap[0]["value"];

          if (field) {
            //不是下拉选项的值，取变更后的值，不在表单字段内取原值
            vm.detailData[id] =
              selectItem && selectItem[field]
                ? selectItem[field]
                : vm.detailData[field]
                ? vm.detailData[field]
                : field;
          }
        }
        //设置控件下拉数据
        if (funName && funName.toLowerCase().indexOf("setdatasource") != -1) {
          // let storeKey = targetControl.ControlProperty.ID + "-" + configItem.ControlProperty.DataField + "-" + val;
          // if (vm.dropListStore.has(storeKey)) {
          //   let dropListData = vm.deepClone(vm.dropListStore.get(storeKey));
          //   targetControl.ControlProperty.initData = dropListData;
          //   targetControl.ControlProperty.dropListData = vm.dropListStore.get(storeKey);
          //   return;
          // }
          let map = {};
          map[configItem.ControlProperty.DataField] = val;
          //获取 当前下拉框的选中的对象
          let selectObj = {};
          let dataList = vm.controldata[configItem.ControlProperty.ID].dataList;
          if (dataList) {
            selectObj = dataList.find((oneDrop) => {
              return oneDrop[configItem.ControlProperty.DataValueField] == val;
            });
          }
          apis.sysLoadControlData({
            vm: vm,
            params: {
              menuRowGuid: vm.config.menuRowGuid || "",
              controlGUID: vm.config.ControlGUID,
              pageMode: vm.config.pageMode || "view",
              pValueSet: vm.config.pValueSet,
              paramMap: {
                subControlId: targetControl.ControlProperty.ID,
                ...selectObj,
                ...map,
              },
            },
            success: (res) => {
              if (res.code == "SUCCESS") {
                let result = res.data[targetControl.ControlProperty.ID];
                if (result) {
                  // vm.dropListStore.set(storeKey, result.dataList);
                  vm.controldata[targetControl.ControlProperty.ID].dataList = result.dataList;
                  // targetControl.ControlProperty.initData = vm.deepClone(result.dataList);
                  // targetControl.ControlProperty.dropListData = result.dataList;
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
        }
        //更改关联配置项必填、禁用、样式等
        if (funName && funName.toLowerCase().indexOf("setconfig") != -1) {
          if (Array.isArray(paramsMap)) {
            paramsMap.forEach((paramItem) => {
              Object.keys(paramItem).forEach((key) => {
                if (key && key == "IsRequired") {
                  vm.rules[targetControl.ControlProperty.DataField]["IsRequired"] = paramItem[key];
                }

                if (isHasResult) {
                  result = paramItem[key];
                } else {
                  vm.$set(targetControl.ControlProperty, key, paramItem[key]);
                }
              });
            });
          }
        }
      }
    });

    return result;
  }

  function getTargetControl(childContainers, targetId) {
    if (Array.isArray(childContainers)) {
      return childContainers.find((controlItem) =>
        [controlItem.ControlProperty.ID, controlItem.ID, controlItem.ControlProperty.DataField].includes(targetId)
      );
    } else {
      let res = "";
      Object.keys(childContainers).forEach((key) => {
        let temp = childContainers[key].find((controlItem) => {
          let tempId = controlItem.ControlProperty.ID || controlItem.ID;
          return tempId == targetId;
        });
        if (temp) {
          res = temp;
        }
      });

      return res;
    }
  }
  function runClientAtction({ clientAction, configItem, val, flag, rIndex, rData, isHasResult }, vm) {
    console.log("控件联动");
    let _this = this;

    let getControlAndDoAction = (actions, targetItem, context) => {
      let targetControl = getTargetControl(context.childContainers, targetItem.ControlID);
      let result = "";

      if (targetControl) {
        actions.forEach((action) => {
          targetItem.OnInit = targetItem.OnInit + "";
          if (flag != "onload" || (flag == "onload" && targetItem.OnInit && targetItem.OnInit.toString().toLowerCase() == "true"))
            result = runAutoAction(
              {
                action,
                targetControl,
                configItem,
                val,
                rIndex,
                rData,
                isHasResult,
                flag,
              },
              vm
            );
        });
      }
      return result;
    };
    let res = "";
    if (Array.isArray(clientAction)) {
      for (let i = 0; i < clientAction.length; i++) {
        let ruleItem = clientAction[i];
        let re = eval(ruleItem.regex);
        let testValue = "";
        if (configItem.ControlCode == "UcCheckBoxList" && vm.config.ControlCode == "UcFormDetailView") {
          testValue = vm.deepClone(vm.detailData[configItem.ControlProperty.field].join("|"));
        } else testValue = val;
        if (re.test(testValue)) {
          ruleItem.regulation.forEach((targetItem) => {
            let actions = targetItem.Action;
            if (_this.hasProp(targetItem, "CtnrID") && targetItem.CtnrID != vm.config.ID) {
              //更改其它容器的值
              res = getControlAndDoAction(actions, targetItem, pageContext[targetItem.CtnrID]);
            } else {
              res = getControlAndDoAction(actions, targetItem, vm);
            }
          });
          // break;
        }
      }
    }
    return res;
  }
  function handleError(code, msg) {
    function exitSystem1() {
      erJsBridge.setParameter("userName", "");
      erJsBridge.setParameter("userID", "");
      erJsBridge.setParameter("token", "");
      localStorage.setItem("userId", "");

      setTimeout(function () {
        if (!erJsBridge.exitToYJK()) {
          // 逸集控
          erJsBridge.exitSystem();
        }
      }, 3000);
    }
    if (["FORBIDDEN", "LOGIN_AGAIN", "A0230", "A0300"].includes(code)) {
      exitSystem1();
    } else {
      exitSystem1();
    }
  }
  //动态加载js
  function loadScrpit(url) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement("script");
      scriptElement.type = "text/javascript";
      scriptElement.src = url;
      scriptElement.onload = () => {
        console.log(`${url}加载完成`);
        resolve(url);
      };
      document.body.appendChild(scriptElement);
    });
  }
  /**
   * 动态加载CSS
   * @param {string} url 样式地址
   */
  function loadCss(url) {
    return new Promise((resolve, reject) => {
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      link.onload = () => {
        console.log(`${url}加载完成`);
        resolve(url);
      };
      head.appendChild(link);
    });
  }
  /**
   * 获取关联数据
   * @param {string} keyVal 主键值
   * @param {string} parentField  父级字段
   * @param {string} dataList 包含父子关系的集合
   */
  function getRelativeRowData(keyVal, parentField, dataList) {
    if (!parentField && !dataList) {
      return [];
    }
    let result = dataList.filter((item) => {
      return item[parentField] == keyVal;
    });
    console.log(result);
    return result;
  }
  /**
   * 批量更新数据
   * @param {Array} rows 需要更新的数据集合
   * @param {Object} obj  更新的对象值
   * @param {Array} dataList 总集合
   * @param {string} rowDataKey 行主键
   */
  function mutiChangeRows(rows, obj, dataList, rowDataKey) {
    if (!Array.isArray(rows) && !rows.length && !obj) {
      console.log("mutiChangeRows 类型检查失败");
      return;
    }
    rows.forEach((rItem) => {
      let index = dataList.findIndex((item) => {
        return item[rowDataKey] == rItem[rowDataKey];
      });
      if (index != -1) {
        let temp = dataList[index];
        Object.assign(temp, obj);
        dataList.splice(index, 1, temp);
      }
    });
  }
  function closeForm(config, vm) {
    if (vm.popupList.length) {
      let popConfig = vm.popupList[vm.popupList.length - 1];
      popConfig[popConfig.popKey] = false;
      vm.popupList.splice(-1, 1);
      return;
    }
    //先判断有没有打开弹窗
    let tempArr = vm.layerConfigArr.filter((item) => {
      return item.flag != "hide-close-btn";
    });
    if (tempArr.length) {
      let layerConfig = tempArr[tempArr.length - 1];
      pageContext.root.removeLayer(layerConfig);
      return;
    }

    let childContainers = deepClone(config.ChildContainers);
    childContainers = convertConfig(childContainers, {
      pValueSet: config.pValueSet,
      menuRowGuid: config.menuRowGuid,
      menuConfigKey: config.menuConfigKey,
      pageMode: config.pageMode,
      keyValue: config.keyValue,
    });
    let pageTitleContainer = childContainers.find((child) => {
      return child.ControlCode == "UcPageTitleContainer";
    });
    if (pageTitleContainer) {
      let pageTitleVm = pageContext[pageTitleContainer.ControlProperty.ID];
      const { backAction } = pageTitleContainer.ControlProperty;
      if (backAction) {
        if (erowConfig.hasProp(baseSpecial, backAction)) {
          baseSpecial[backAction](pageTitleVm);
        } else {
          erowSpecial[backAction](pageTitleVm);
        }
      } else {
        pageManager.back();
      }
    } else pageManager.back();
  }

  // 主题色
  function initTopic() {
    const elementList = document.getElementsByTagName("html");
    const htmlEl = elementList ? elementList[0] : "";
    if (!htmlEl) {
      return;
    }

    const topic = window.topic;
    const topicCssClassConstant = window.topicCssClassConstant;
    if (!topic || !topicCssClassConstant) {
      return;
    }

    const htmlClassList = htmlEl.classList;
    const topicCssClassList = Object.values(topicCssClassConstant);
    topicCssClassList &&
      topicCssClassList.forEach((topicClassItem) => {
        htmlClassList.remove(topicClassItem);
      });

    const currentTopicClass = topicCssClassConstant ? topicCssClassConstant[topic] : "";
    htmlClassList && htmlClassList.add(currentTopicClass);
    return htmlEl;
  }

  function getImgFileUrl({ parentFilePath, filename, fileType = "png" }) {
    // 图片类型
    const imageTypeRegex = /^(png|gif)$/;
    if (fileType[0] == ".") {
      fileType = fileType.slice(1);
    }
    if (!imageTypeRegex.test(fileType)) {
      return;
    }

    // 图片父级目录
    let parentFilePathProxy = parentFilePath[0] == "/" ? parentFilePath : "/" + parentFilePath;
    parentFilePathProxy = parentFilePath[parentFilePath.length - 1] == "/" ? parentFilePath : parentFilePath + "/";

    // 主题色公共前缀路径，没有返回公共图片路径
    const topic = window.topic;
    const imgUrlPrefixPathConstant = window.imgUrlPrefixPathConstant;
    if (!topic || !imgUrlPrefixPathConstant) {
      return "../assets/images/" + parentFilePathProxy + filename + "." + fileType;
    }
    if (!parentFilePath && !filename) {
      return "";
    }

    let topicPath = imgUrlPrefixPathConstant[topic];
    topicPath[0] == "/" ? topicPath : "/" + topicPath;
    topicPath = topicPath[topicPath.length - 1] == "/" ? topicPath : topicPath + "/";

    const targetPath = topicPath + parentFilePathProxy + filename + "." + fileType;
    return targetPath;
  }

  function setPageListState() {
    window.pageListCtnr &&
      window.pageListCtnr.forEach((ctnrUID) => {
        pageContext[ctnrUID] && pageContext[ctnrUID].setStateCache();
      });
  }

  const erowConfig = {
    dialogCount: 0, // 显示的弹窗数量，用于控制页面滚动
    searchParamsMap: {}, // 搜索条件映射关系
    searchParamsRealFieldMap: {}, // 搜索条件真实字段映射关系
    highParamsMap: {}, //高亮字段搜索条件
    searchParamsInheritMap: JSON.parse(sessionStorage.getItem("SearchParamsInheritMap") || "{}"), // 跨页面继承搜索条件
    hideFields,
    validateRules,
    validateForm,
    loadSource,
    getQueryObject,
    isHasEvent,
    getEventFun,
    getNewLineArr,
    hasProp,
    getMergeArr,
    deepClone,
    convertConfig,
    closeForm,
    generateUUID,
    formatDateReg,
    isNumber,
    isString,
    isObject,
    getOpName,
    getDataType,
    searchByID,
    handleTree,
    getConfigFieldValue,
    isArray,
    debounce,
    throttle,
    globalUpdate,
    bindPageRefreshEvent,
    cacheTargetContainerTempData,
    runClientAtction,
    getActionObj,
    loadScrpit,
    loadCss,
    getRelativeRowData,
    mutiChangeRows,
    handleError,
    getImgFileUrl,
    initTopic,
    message,
    setPageListState,
  };

  window.erowConfig = erowConfig;
})();
