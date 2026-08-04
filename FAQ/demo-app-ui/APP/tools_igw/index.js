if (localStorage.hasOwnProperty("BASE_CONFIG")) {
  let BASE_CONFIG = JSON.parse(localStorage.getItem("BASE_CONFIG"));
  window.ROOT_PATH = window.location.pathname.substring(0, window.location.pathname.indexOf(BASE_CONFIG.rootDir));
  window.HTML_PATH = `${window.location.pathname.substring(0, window.location.pathname.indexOf(BASE_CONFIG.rootDir) + BASE_CONFIG.rootDir.length)}`;
} else {
  window.ROOT_PATH = window.location.pathname.substring(0, window.location.pathname.indexOf("/APP/"));
  window.HTML_PATH = window.location.pathname.substring(0, window.location.pathname.indexOf("/APP/") + 4);
}


document.write(`<script src="${window.HTML_PATH}/js/config.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/libs/js/jquery-3.1.0.min.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/tools/erMain.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/tools/igwJsBridge.js?v=${new Date().getTime()}"></script>`);
document.write(`<script src="${window.HTML_PATH}/tools/erPageController.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/tools/erUser.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/tools/erTool.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/request/commonRequest.js"></script>`);
document.write(`<script src="${window.HTML_PATH}/request/erRequest.js"></script>`);


function getRight() {
  var url = mealServerPath + "mealDelay/getNewDelayApplication";
  $.ajax({
    url: url,
    type: "post",
    headers: {
      Authorization: erUser.token
    },
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
  var url = mealServerPath + "mealDelay/getNewDelayApplication";
  $.ajax({
    url: url,
    type: "post",
    headers: {
      Authorization: erUser.token
    },
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
window.onload = function () {
  // getRight();
};