var erowStr = "";
for (var i = 0; i < 10; i++) {
    erowStr += "erow";
}

var isOnline = false;

String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

var userNumberList = [];
function userMsg(rData) {
    if (rData.type == 0) {
        //appAlert(rData.message);
        goToSignin(rData.message);
        return;
    } else {
        if (appCode == "SNHQ") {
            var resultJson = rData.result.item[0];
            var userNumber = $("#userNumber").val();
            var password = $("#password").val();
            var userNumberInfo = {
                "userNumber": userNumber,
                "password": password
            };
            userNumberList = userNumberList.filter(function (item) {
                return item.userNumber != userNumber;
            });
            userNumberList.push(userNumberInfo);

            _UserID = resultJson.userId;
            _Token = resultJson.Token;
            _UserName = resultJson.userName;
            _ContactTel = resultJson.contactTel;
            _BaseId = resultJson.baseId;
            _BaseName = resultJson.baseName;
            needConfirmFlag = result.needConfirmFlag;
            appSetValue("12345678", "userNumberList", JSON.stringify(userNumberList), userNumberList.length, new Date(), function (val) {
                appSetParameter("userInfo", encodeURIComponent(JSON.stringify(resultJson)), function (val) {
                    SS();
                });
            });
        } else {

            var result = rData.data;
            _UserID = result.userId;
            _Token = result.Token;
            _UserName = result.userName;
            _UserNumber = result.userNumber;
            needConfirmFlag = result.needConfirmFlag;
            appSetParameter("userID", _UserID, function (rData) {
                appSetParameter("token", _Token, function (rData) {
                    appSetParameter("userName", _UserName, function (rData) {
                        appSetParameter("userNumber", _UserNumber, data => {
                            appSetParameter("needConfirmFlag", needConfirmFlag, data => {
                                let loginDate = new Date().Format("yyyyMMdd") + "_" + localStorage.userId;
                                appSetParameter("loginDate", loginDate, function (data) {
                                    SS();
                                });
                            });
                        });
                    });
                });
            });
        }
    }
}

var getApiRouter = [];
function SS() {
    let params = {
        "Token": _Token
    }
    //先获取配置
    var url = "";
    if (outFlag == -1) {
        url = ("http://127.0.0.1:" + portResult + '/' + baseInfo.auth + '/api/main');
    } else {
        url = javaSrPath + "/api/main";
    }
    $.post(url, {
        method: "getApiRouter",
        detail: JSON.stringify({ json: params }),
    }, function (rData) {
        if (rData.type == -1) {
            getApiRouter = rData.data.Table;

            appSetValue(0, "getApiRouter", JSON.stringify(getApiRouter), getApiRouter.length, new Date(), function (rData) {
                if (rData.resultFlag == -1) {
                    let params = {
                        "Token": _Token
                    }
                    //goDefault();
                    erowPostRequest("ss", params, data => {
                        if (data.message.indexOf("登录信息失效") != -1) {
                            appSetParameter("token", "", data => {
                                window.location.reload();
                            });
                            return;
                        }
                        syncData(data);
                    });
                }
            });
        }
    }).fail(function (rData) {
        appAlert("获取配置信息失败");
        return;
    });
}
function erowGetRequest(method, json, success, fail) {
    if (method.indexOf(".ashx") != -1) {
        $.getJSON(ServerPath + method, json, success).fail(fail);
    }
    else {
        erowGetRequestWithCustomDetail(method, { json }, success, fail);
    }
}

function erowPostRequest(method, json, success, fail) {
    if (method.indexOf(".ashx") != -1) {
        $.post(ServerPath + method, json, success).fail(fail);
    }
    else {
        erowPostRequestWithCustomDetail(method, { json }, success, fail);
    }
}

function erowGetRequestWithCustomDetail(method, detail, success, fail) {
    $.getJSON(getServerPath(method) + "api/main", {
        method,
        detail: JSON.stringify(detail),
    }, success).fail(fail);
}

function erowPostRequestWithCustomDetail(method, detail, success, fail) {
    $.post(getServerPath(method) + "api/main", {
        method,
        detail: JSON.stringify(detail),
    }, success).fail(fail);
}
function getServerPath(apiCode) {
    var SERVER_URL = "";
    for (let i = 0; i < getApiRouter.length; i++) {
        if (getApiRouter[i].API_METHOD == apiCode) {
            SERVER_URL = getApiRouter[i].SERVER_URL;
            break;
        }
    }
    if (outFlag == -1) return "http://127.0.0.1:" + portResult + SERVER_URL;
    return outNetDomain + SERVER_URL;
}
//api结束回调
function completeApi(result, apiCode) {
    // console.log(syncCount + "," + apiCode + "," + JSON.stringify(result));

    syncCount--;

    if (syncCount == 0) {
        appHideWaiting();

        goDefault();
    }

    if (apiCodeMap && apiCodeMap[apiCode]) {
        syncDataAPI(apiCodeMap[apiCode]);
    }

}

//界面跳转
function goDefault() {
    $("#loading").hide();
    if (appCode == "SNHQ") {
        window.location.href = "APP/Main/Index.html?" + "temp=" + new Date().getTime();
    } else {
        if (isOnline) {
            window.location.href = baseInfo.testUrl + "?" + "temp=" + new Date().getTime();
        }
        else {
            if (needConfirmFlag == -1) {
                window.location.href = "APP/Mine/PersonalInfo.html?t=" + new Date().getTime();
            } else {
                window.location.href = "APP/Main/Default.html?" + "temp=" + new Date().getTime();
            }

        }
    }
}

//获取参数
function appGetParameter(code, callback) {
    if (debugMode) {
        var resultObj = {
            result: {
                value: localStorage[code]
            },
            resultFlag: -1
        };
        if (callback != null) {
            callback(resultObj);
        }
        return;
    }

    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
        data: {
            key: appCode + "_" + code
        }
    }, function (res) {
        if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
            resultObj.resultFlag = -1;
            resultObj.result = {};
            resultObj.result.value = res.result.replaceAll(erowStr, "");
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
            //失败处理
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
            //取消处理
        }
        if (callback != null) {
            callback(resultObj);
        }
    });
}
//设置参数
function appSetParameter(code, value, callback) {
    if (debugMode) {
        localStorage[code] = value;
        var resultObj = {
            result: "",
            resultFlag: -1
        };
        if (callback != null) {
            callback(resultObj);
        }
        return;
    }
    var resultObj = {};
    resultObj.resultFlag = 0;
    wx.invoke("ext_DataCache_SaveInfo", {
        data: {
            key: appCode + "_" + code,
            message: value + erowStr
        }
    },
        function (res) {
            if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                resultObj.resultFlag = -1;
            }
            if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                //失败处理
            }
            if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                //取消处理
            }
            if (callback != null) {
                callback(resultObj);
            }
        });



}

//获取指定数据
function appGetValue(userId, code, callback) {
    if (debugMode) {
        var r = localStorage[appCode + "_" + code + userId] || "";
        try {
            r = JSON.parse(r);
        } catch (e) { }
        var resultObj = {
            result: r,
            resultFlag: -1
        };
        if (callback != null) {
            callback(resultObj);
        }
        return;
    }
    if (igwMode) {
        var resultObj = {};
        resultObj.resultFlag = 0;
        resultObj.errMsg = "";
        resultObj.result = "";
        //console.log("开始获取数据：" + code + "," + new Date().getTime());
        wx.invoke("ext_DataCache_GetInfo", {
            data: {
                key: appCode + "_" + userId + "_" + code
            }
        },
            function (res) {
                //console.log("结束获取数据：" + code + "," + new Date().getTime() + "," + JSON.stringify(res));
                if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
                    resultObj.resultFlag = -1;
                    //判断是否是json字符串
                    var result = res.result.replaceAll(erowStr, "");
                    try {
                        resultObj.result = JSON.parse(decodeURIComponent(result));
                        try {
                            resultObj.result = JSON.parse(resultObj.result.value);
                        }
                        catch (err) {
                            resultObj.result = resultObj.result.value;
                        }
                    }
                    catch (err) {
                        resultObj.result = decodeURIComponent(result);
                    }
                }
                if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
                    //失败处理
                }
                if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
                    //取消处理
                }
                if (callback != null) {
                    callback(resultObj);
                }
            });
    } else {
        var parameter = { "params": { "userId": userId, "code": code }, "callback": recordCallBack("appGetValue." + code, callback) };
        jsCallApp('getValue', parameter);
    }
}

function isJSON(str) {
    if (typeof str == 'string') {
        try {
            if (str != "") {
                JSON.parse(decodeURIComponent(str));

                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
}

function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

//插入指定数据
function appSetValue(userId, code, value, statistics, last_update_date, callback) {
    if (debugMode) {
        localStorage[appCode + "_" + code + userId] = value;
        localStorage[appCode + "_" + code + userId + 's'] = statistics;
        localStorage[appCode + "_" + code + userId + "last_update_date"] = last_update_date;
        var resultObj = {
            result: "",
            resultFlag: -1
        };
        if (callback != null) {
            callback(resultObj);
        }
        return;
    }

    //console.log("开始存储数据：" + appCode + "_" + userId + "_" + code + "," + new Date().getTime());
    var resultObj = {};
    resultObj.resultFlag = 0;
    var valueObj = {};
    valueObj.value = value;
    valueObj.statistics = statistics;
    valueObj.last_update_date = new Date().Format("yyyy/MM/dd hh:mm:ss");
    wx.invoke("ext_DataCache_SaveInfo", {
        data: {
            key: appCode + "_" + userId + "_" + code,
            message: encodeURIComponent(JSON.stringify(valueObj)) + erowStr
        }
    },
        function (res) {
            //console.log("结束存储数据：" + appCode + "_" + userId + "_" + code + "," + new Date().getTime());
            /*  //console.log(JSON.stringify(res));*/
            if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                if (callback != null) {
                    resultObj.resultFlag = -1;
                    //callback(resultObj);
                }

                //wx.invoke("ext_DataCache_SaveInfo", {
                //    data: {
                //        key: appCode + "_" + userId + "_" + code + "_" + "statistics",
                //        message: statistics + erowStr
                //    }
                //},
                //    function (res) {
                //        console.log("结束存储数据：" + appCode + "_" + userId + "_" + code + "_" + "statistics" + "," + new Date().getTime());
                //        if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                //            console.log("开始存储数据：" + appCode + "_" + userId + "_" + code + "_" + "last_update_date" + "," + new Date().getTime());
                //            wx.invoke("ext_DataCache_SaveInfo", {
                //                data: {
                //                    key: appCode + "_" + userId + "_" + code + "_" + "last_update_date",
                //                    message: last_update_date + erowStr
                //                }
                //            },
                //                function (res) {
                //                    console.log("结束存储数据：" + appCode + "_" + userId + "_" + code + "_" + "last_update_date" + "," + new Date().getTime());
                //                    if (res.err_msg === 'ext_DataCache_SaveInfo:ok') {
                //                        //成功处理
                //                        resultObj.resultFlag = -1;

                //                    }
                //                    if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                //                        //失败处理
                //                    }
                //                    if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                //                        //取消处理
                //                    }
                //                    if (callback != null) {
                //                        callback(resultObj);
                //                    }
                //                });
                //        }
                //        if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                //            //失败处理
                //        }
                //        if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                //            //取消处理
                //        }
                //    });
            }
            if (res.err_msg === 'ext_DataCache_SaveInfo:fail') {
                //失败处理
            }
            if (res.err_msg === 'ext_DataCache_SaveInfo:cancel') {
                //取消处理
            }
            if (callback != null) {
                callback(resultObj);
            }
        });

}


//删除指定数据
function appDeleteValue(userId, code, callback) {
    var resultObj = {};
    resultObj.resultFlag = 0;
    wx.invoke("ext_DataCache_RemoveInfo", {
        data: {
            key: appCode + "_" + userId + "_" + code
        }
    },
        function (res) {
            /* console.log(JSON.stringify(res));*/
            if (res.err_msg === 'ext_DataCache_RemoveInfo:ok') {
                //成功处理
                resultObj.resultFlag = -1;
            }
            if (res.err_msg === 'ext_DataCache_RemoveInfo:fail') {
                //失败处理
            }
            if (res.err_msg === 'ext_DataCache_RemoveInfo:cancel') {
                //取消处理
            }
            if (callback != null) {
                callback(resultObj);
            }
        });
}

function appGetTextValue(userId, code, callback) {
    if (debugMode) {
        var resultObj = {
            result: localStorage[code + userId],
            resultFlag: -1
        };
        if (callback != null) {
            callback(resultObj);
        }
        return;
    }
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    wx.invoke("ext_DataCache_GetInfo", {
        data: {
            key: appCode + "_" + userId + "_" + code
        }
    },
        function (res) {
            if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
                resultObj.resultFlag = -1;
                //resultObj.result = res.result.replaceAll(erowStr, "");
                //判断是否是json字符串
                var result = res.result.replaceAll(erowStr, "");
                if (isJSON(result)) {
                    resultObj.result = JSON.parse(decodeURIComponent(result));
                    if (isJSON(resultObj.result.value)) {
                        resultObj.result = JSON.parse(resultObj.result.value);
                    }
                    else {
                        resultObj.result = resultObj.result.value;
                    }
                }
                else {
                    resultObj.result = result;
                }
            }
            if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
                //失败处理
            }
            if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
                //取消处理
            }
            if (callback != null) {
                callback(resultObj);
            }
        });

}


function appGetStatistics(userId, code, callback) {
    if (debugMode) {
        var resultObj = {
            result: {
                statistics: localStorage[code + userId + 's'] || 0
            },
            resultFlag: -1
        }
        setTimeout(function () {
            callback(resultObj);
        }, 1);
        return;
    }
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //-- + "_" + "statistics"
    wx.invoke("ext_DataCache_GetInfo", {
        data: {
            key: appCode + "_" + userId + "_" + code
        }
    },
        function (res) {
            if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
                resultObj.resultFlag = -1;
                resultObj.result = {};
                //判断是否是json字符串
                let result = res.result.replaceAll(erowStr, "");
                if (isJSON(result)) {
                    resultObj.result = JSON.parse(decodeURIComponent(result)).statistics;
                }
                else {
                    resultObj.result = result;
                }
            }
            if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
                //失败处理
            }
            if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
                //取消处理
            }
            if (callback != null) {
                callback(resultObj);
            }
        });

}

function appGetValueUpdateDate(userId, code, callback) {
    if (debugMode) {
        let r = localStorage[appCode + "_" + code + userId + "last_update_date"] || "";
        try {
            r = JSON.parse(r);
        } catch (e) { }
        let resultObj = {
            result: r,
            resultFlag: -1
        };
        if (callback != null) {
            callback(resultObj);
        }
        return;
    }
    let resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.errMsg = "";
    resultObj.result = "";
    //-- + "_" + "last_update_date"
    wx.invoke("ext_DataCache_GetInfo", {
        data: {
            key: appCode + "_" + userId + "_" + code
        }
    }, res => {
        if (res.err_msg === 'ext_DataCache_GetInfo:ok') {
            resultObj.resultFlag = -1;
            //判断是否是json字符串
            let result = res.result.replaceAll(erowStr, "");
            if (isJSON(result)) {
                resultObj.result = JSON.parse(decodeURIComponent(result)).last_update_date;
            }
            else {
                resultObj.result = result;
            }
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:fail') {
            //失败处理
        }
        if (res.err_msg === 'ext_DataCache_GetInfo:cancel') {
            //取消处理
        }
        if (callback != null) {
            callback(resultObj);
        }
    });
}

function getTemp() {
    var date = new Date();
    var temp = "temp=" + date.getTime();
    return temp;
}
function getTempAndCallback(callbackFuncName) {
    callbackFuncName = callbackFuncName ? callbackFuncName + "&=?" : "?";
    return getTemp() + "&callback=" + callbackFuncName;
}

//显示缓冲
var _IsWaiting = false;

function appShowWaiting(seconds, msg) {
    if (seconds == undefined) {
        seconds = 30;
    }
    setTimeout(ajaxTimeOut, seconds * 1000);
    _IsWaiting = true;
    $("#loadingDiv").css("display", "block");
    if (msg != undefined) {
        $("#msg").html(msg);
    }
}

//隐藏缓冲
function appHideWaiting() {
    if (!_IsWaiting) {
        return;
    }
    _IsWaiting = false;
    $("#loadingDiv").css("display", "none");
}
function waitingTimeOut() {
    if (_IsWaiting) {
        androidHideWaiting();
    }
}

function ajaxTimeOut() {
    if (_IsWaiting) {
        $("#loadingDiv").css("display", "none");
    }
}
function appGetAudioCommandConfig() {
    var resultObj = {};
    resultObj.resultFlag = 0;
    resultObj.result = "";
    resultObj.errMsg = "";
    return;
}

function appPreFeature(userId, userType, userName, callback) {
    return;
}


var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}
function reverseString(str) {
    var newstr = str.split("").reverse().join("");
    return newstr;
}
function utf16to8(str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}
function aesMinEncrypt(word) {
    var _word = CryptoJS.enc.Utf8.parse(word),
        _key = CryptoJS.enc.Utf8.parse("ihaierForTodoKey"),
        _iv = CryptoJS.enc.Utf8.parse("ihaierForTodo_Iv");
    var encrypted = CryptoJS.AES.encrypt(_word, _key, {
        iv: _iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
//弹窗提醒
function appAlert(message) {

    if (appCode == "SNHQ") {
        var title = arguments[1] || "系统消息";
        if ($("#alert").length == 0) {
            $("body").append("<div id=\"alert\"><p id=\"alertTitle\">" + title + "</p><p id=\"alertMessage\">" + message + "</p><div class=\"btnGroup\"><div id=\"alertBtnOk\" class=\"btnRed\">确定</div></div></div>");
        } else {
            $("#alertTitle").html(title);
            $("#alertMessage").html(message);
        }
        $("#alert").css("display", "block");
        showOverLay();
        $("#alertBtnOk").click(function () {
            hideOverLay();
            $("#alert").css("display", "none");
            $("#alertBtnOk").unbind("click");
        });

    } else {

        if (debugMode) {
            alert(message);
            return;
        }
        alert(message);
    }
    return;
}
