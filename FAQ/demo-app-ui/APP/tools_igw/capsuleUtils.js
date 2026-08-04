(function (win) {
  // 加载capsule.js
  const loadCapsuleScript = () => {
    var script = document.createElement("script");
    script.src = "https://i.sgcc.com.cn:18080/capsule/capsule2.0.js"; //prod
    script.onerror = function () {
      console.log("标准组件加载失败，隐藏右上角button");
      hiddenButton();
    };
    document.body.appendChild(script);
  };

  // 初始化capsule
  function initCapsule() {
    hiddenButton();
    const Capsule = window.CAPSULE;
    if (Capsule) {
      Capsule.__showCapsule__();
      return;
    }
    loadCapsuleScript();
  }
  //隐藏原本的胶囊按钮
  function hiddenButton() {
    var igwCapsule = document.getElementsByClassName(
      "_igw_capsule_className"
    )[0];
    // 失败时隐藏
    if (igwCapsule) {
      igwCapsule.style.visibility = "hidden"; // 显式设置
      igwCapsule.style.pointerEvents = "none";
    }
  }
  win.initCapsule = initCapsule;
})(window);
