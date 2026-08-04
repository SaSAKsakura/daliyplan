(function () {
  if (window.jQuery) {
    function appShowLoading() {
      if ($(".loadOverLay").length == 0) {
        $("body").append(`<div class="loadOverLay overLay">
        <div class="loadingContent"><div class="loading"></div><span id="loadingMessage">数据加载中......</span></div>
        </div>`);
      }
      $(".loadOverLay").css("display", "block");
    }
    function appHideLoading() {
      $(".loadOverLay").css("display", "none");
    }

    function handleError(code, msg) {
      function exitSystem1() {
        erJsBridge.setParameter("userName", "");
        erJsBridge.setParameter("userID", "");
        erJsBridge.setParameter("token", "");
        localStorage.setItem("userId", "");
        let pageParams = pageManager.getPageParams();
        localStorage.setItem(
          "lastMenu",
          JSON.stringify({ menu_row_guid: pageParams.menu_row_guid })
        );
        erJsBridge.exitToYJK();
      }
      let tokenErrorCode = [
        "A0200",
        "A0201",
        "A0210",
        "A0212",
        "A0220",
        "A0223",
        "A0230",
        "A0300",
        "FORBIDDEN",
        "LOGIN_AGAIN",
        "A0300",
      ];

      if (tokenErrorCode.includes(code)) {
        // vant.Dialog.alert({
        //   title: "系统提示",
        //   message: "登录状态已过期,请重新登录",
        // }).then(function () {
        exitSystem1();
        // });
      } else if (code == "ERROR") {
        let flag1 =
          msg && msg.indexOf("登录") != -1 && msg.indexOf("过期") != -1;
        let flag2 =
          msg && msg.indexOf("登陆") != -1 && msg.indexOf("过期") != -1;
        let flag3 =
          msg && msg.indexOf("令牌") != -1 && msg.indexOf("存在") != -1;
        if (flag3 || flag1 || flag2) {
          // vant.Dialog.alert({
          //   title: "系統提示",
          //   message: "登录状态已过期,请重新登录",
          // }).then(function () {
          localStorage.setItem("lastMenu", JSON.stringify());
          exitSystem1();
          // });
        } else {
          // vant.Toast.fail(msg);
        }
      }
    }

    var ajaxCount = 0;
    var endLoad = false;
    // ajax预处理
    jQuery(document)
      // 前置处理
      .bind("ajaxSend", function (event, request, settings) {
        ajaxCount++;
        if (ajaxCount > 0) {
          //非初次加载的多个请求 可能其他操作的请求
          if (endLoad == true && ajaxCount == 1) {
            endLoad = false;
          }
          if (!endLoad) {
            // appShowLoading();
          }
          setTimeout(() => {
            appHideLoading();
            endLoad = true;
          }, 1500);
          setTimeout(() => {
            endLoad = false;
          }, 5000);
        }
      })
      // 后置处理
      .bind("ajaxComplete", function (event, xhr, settings) {
        ajaxCount--;
        if (xhr.status == 200 && xhr.responseText) {
          try {
            handleError(xhr.responseJSON.code, xhr.responseJSON.msg);
          } catch (e) {
            console.error(e);
          }
        } else if (xhr.responseJSON) {
          handleError(xhr.responseJSON.code, xhr.responseJSON.msg);
        }
        if (ajaxCount == 0) {
          appHideLoading();
        }
      });
  }
})();
