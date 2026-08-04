osColorSchemeFun();
document.write(`<script src="${window.HTML_PATH}/libs/js/encrypt/crypto-js.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/libs/js/encrypt/sm2.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/libs/js/purify.js"></script>`);

if (igwMode) {
  document.write(
    `<script src="${window.HTML_PATH}/tools_igw/capsuleUtils.js"></script>`
  );
  document.write(`<script src="${window.HTML_PATH}/libs/js/jquery-3.1.0.min.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools_igw/erMain.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools_igw/igwJsBridge.js?v=${new Date().getTime()}"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools_igw/erPageController.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools_igw/erUser.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools_igw/erTool.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/erRequest.js"></script>`);
} else {
  document.write(`<script src="${window.HTML_PATH}/tools/android.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/erPageController.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/erUser.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/erTool.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/erMain.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/libs/js/jquery-3.1.0.min.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/ajaxAppend.js"></script>`);
  document.write(`<script src="${window.HTML_PATH}/tools/erRequest.js"></script>`);
}

function osColorSchemeFun() {
    const osColorScheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches || /ColorScheme\/Dark/i.test(navigator.userAgent)) ? 'dark':'light';
    let flag = true;
    if(osColorScheme == 'dark') {
      flag = false;
    }
    const root = document.documentElement;
    root.style.setProperty('--color-gray-2', flag ? '#f8f8f8':'#4f4e4e');
    root.style.setProperty('--color-white', flag ? '#fff':'#3a3a3a');
    root.style.setProperty('--bg-gray-1', flag ? '#f7f7f7':'#484848');
    root.style.setProperty('--bg-gray-2', flag ? '#F6F6F6':'#3b3b3b');
    root.style.setProperty('--text-color', flag ? '#1a1a1a':'#f7f7f7');
    root.style.setProperty('--text-color-2', flag ? '#323233':'#9e9e9e');
    root.style.setProperty('--text-color-3', flag ? '#333333':'#999999');
    root.style.setProperty('--box-shadow', flag ? 'rgba(0, 0, 0, 0.08)':'rgba(255, 255, 255, 0.07)');
}

function returnHome() {
   pageManager.go(-pageManager.pages.length)
}
function getRight() {
  var url = ServerPath + "mealDelay/getNewDelayApplication";
  $.ajax({
    url: url,
    type: "post",
    headers: { Authorization: erUser.token },
    async: true,
    success: function (res) {
      if (res.code == "SUCCESS") {
        if (res.data.rightFlag == -1) {
          setInterval(function () {
            getAudioTip();
          }, 5000);
        }
      }
    },
    error: function (res) {
      console.log(res);
    },
  });
}
function getAudioTip() {
  var url = ServerPath + "mealDelay/getNewDelayApplication";
  $.ajax({
    url: url,
    type: "post",
    headers: { Authorization: erUser.token },
    async: true,
    success: function (res) {
      if (res.code == "SUCCESS") {
        if (res.data.newFlag == -1) {
          let synth = window.speechSynthesis;
          let utterThis = new SpeechSynthesisUtterance("你有一条吃饭申请");
          synth.speak(utterThis);
          //playSound();
        }
      }
    },
    error: function (res) {
      console.log(res);
    },
  });
}
//根据fncode获取menukKey
function GetMenuConfigKey(fnCode, fnParams) {
  return new Promise((resolve, rej) => {
    var url = ServerPath + "public/GetMenuConfigKey";
    let params = {
      fnCode: fnCode,
      fnParameter: fnParams
    }
    $.ajax({
      url: url,
      type: "post",
      contentType: 'application/json',
      data: JSON.stringify(params),
      headers: { Authorization: erUser.token },
      async: true,
      success: function (res) {
        if (res.code == "SUCCESS") {
          resolve(res)
        }
        else {
          rej(res.msg)
        }
      },
      error: function (res) {
        rej(res)
      },
    });
  })
}

//通用接口
function sysLoadPostData(url,ctnrUID,params,menuConfigKey,opCode){
  return new Promise((resolve,rej)=>{
    let data = {
      ctnrUID,
      menuConfigKey,
      paramMap: params,
      opCode,
      nonce:new Date().getTime()
    }
    $.ajax({
      url: url,
      type: "post",
      contentType: "application/json",
      data: JSON.stringify(data),
      headers: { Authorization: erUser.token },
      async: true,
      success: function (res) {
        if (res.code == "SUCCESS") {
          resolve(res)
        }
        else {
          rej(res.msg)
        }
      },
      error: function (res) {
        rej(res)
      },
    });
  })
}
function playSound() {
  var borswer = window.navigator.userAgent.toLowerCase();
  if (!!window.ActiveXObject || "ActiveXObject" in window) {
    //IE内核浏览器
    var strEmbed =
      '<embed name="embedPlay" src="../audio/chifan.mp3" autostart="true" hidden="true" loop="false"></embed>';
    if ($("body").find("embed").length <= 0) {
      $("body").append(strEmbed);
    } else {
      $("body").find("embed").remove();
      $("body").append(strEmbed);
    }
    var embed = document.embedPlay;
    //浏览器不支持 audion，则使用 embed 播放
    embed.volume = 100;
  } else {
    //非IE内核浏览器
    var strAudio =
      "<audio id='audioPlay' src='../audio/chifan.mp3' hidden='true'>";
    if ($("body").find("audio").length <= 0) {
      $("body").append(strAudio);
    }
    var audio = document.getElementById("audioPlay");
    //浏览器支持 audion
    audio.play();
  }
}
window.PAGE_CONFIG = {
  /** 是否启动平板模式 */
  useTabletMode: false,
  /* 首页头部左方头像地址，如果设置则显示图片，没有则显示用户名 */
  homeHeadSculpture: "../special/images/head-sculpture.png",
  homeHeadRightRemind: false,
  /* 菜单默认图标 */
  menuDefaultImage: "../assets/images/menu/members_board_pda.png",
  /*菜单card模式默认图标*/
  menuDefaultImageCard: "../assets/images/menu/card_menu_bg_default2.png",
  /* 空列表图片 */
  emptyListImage: "../assets/images/common/emptyList.png",
  ...window.pageConfig,
};

