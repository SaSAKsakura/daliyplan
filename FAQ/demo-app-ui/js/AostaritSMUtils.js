/***
 * 四川中电启明星版权所有
 * @author bowei_duan
 * @date 2021-3-18
 * @type {{}}
 */
var AostaritSMUtils = function(){

    let sm2Utils    = new Sm2Utils(CipherMode.C1C2C3);
    let keypair     = sm2Utils.generateKeyPair();
    let s4key       = "si_chuan_aostarit";
    let keyHex 		= CommonUtils.utf8StrToHex(s4key);
    let keyData 	= CommonUtils.utf8StrToBytes(s4key);
    let ivText 		= 'sgcc_aostarit_sichuan';
    let ivHex 		= CommonUtils.utf8StrToHex(ivText);
    let ivData 		= CommonUtils.utf8StrToBytes(ivText);

    let options = {
        sm2pubkey   : keypair.pubkeyhex,
        sm2prikey   : keypair.prvkeyhex,
        sm4key      : CommonUtils.utf8StrToHex(s4key),
        sm4keyhex   : keyHex,
        sm4keydata  : keyData,
        sm4ivhex    : ivHex,
        sm4ivdata   : ivData
    };

    let serverOptions = {
        serverSm2PublicKey: options.sm2pubkey,
        appId: ""
    };
    return {
        getOptions : function(){
            return options;
        },
        ajaxJsonNoSign:function(url,type,datas,successCallback,errorCallback,complateCallback){
            let _k4 = AostaritSMUtils.sm4.generateKey();
            let _up = AostaritSMUtils.sign.jsonDataRequestParameter(datas);
            let _ep = AostaritSMUtils.sm2.encrypt(AostaritSMUtils.getServerSM2Public(),_up);
            let _nl = url;
            if(url.indexOf("?")>=0){
                _nl+="&";
            }else
                _nl+="?";
            _nl+="_sign=0&_sm4key="+_k4;
            $.ajax({
                url: _nl,
                dataType:"json",
                type:type,
                data:{_data:_ep},
                success:function(result) {
                    if(result && result.success){
                        if(typeof successCallback == "function"){
                            successCallback(JSON.parse(AostaritSMUtils.sm4.decryptECB(result.data,_k4)));
                        }
                    }
                },
                error:function (er,c,r,e) {
                    if(typeof errorCallback == "function"){
                        errorCallback(er,c,r,e);
                    }
                },
                complete:function (ex,c,r) {
                    if(typeof complateCallback == "function"){
                        complateCallback(ex,c,r);
                    }
                }
            });
        },
        ajaxJson:function(url,type,datas,successCallback,errorCallback,complateCallback){
            let _rp = AostaritSMUtils.sign.jsonDataRequestParameter(datas);
            let _k4 = AostaritSMUtils.sm4.generateKey();
            let _spt = url + "?" + _rp;
            let _nl = AostaritSMUtils.sign.generateSignUrl(url,_spt,_k4,AostaritSMUtils.getAppid());
            let _sb = AostaritSMUtils.sm2.encrypt(AostaritSMUtils.getServerSM2Public(),_rp);
            $.ajax({
                url: _nl,
                type : type,
                dataType : "json",
                data:{_data:_sb},
                success:function(result) {
                    if(result && result.success){
                        if(typeof successCallback == "function"){
                            successCallback(JSON.parse(AostaritSMUtils.sm4.decryptECB(result.data,_k4)));
                        }
                    }
                },
                error:function (er,c,r,e) {
                    if(typeof errorCallback == "function"){
                        errorCallback(er,c,r,e);
                    }
                },
                complete:function (ex,c,r) {
                    if(typeof complateCallback == "function"){
                        complateCallback(ex,c,r);
                    }
                }
            });
        },
        cacheServerSM2Public : function(sm2p){
            serverOptions.serverSm2PublicKey = sm2p;
        },
        getServerSM2Public :function(){
            return serverOptions.serverSm2PublicKey;
        },
        cacheAppid : function(app){
            serverOptions.appId = app;
        },
        getAppid :function(){
            return serverOptions.appId;
        },
        sign : {
            sm2SignFromText : function (plainText , privateKey){
                return sm2Utils.signFromText(privateKey,plainText);
            },
            sm2SignASN1FromText : function (plainText , privateKey) {
                return sm2Utils.signASN1FromText(privateKey,plainText);
            },
            jsonDataRequestParameter : function(jsondata){
                let params = Object.keys(jsondata).map(function (key) {
                    return encodeURIComponent(key)+ "=" + encodeURIComponent(jsondata[key]);
                }).join("&");
                return params;
            },
            generateSignContext : function(plainText, sm4key){
                let sourceText = plainText + "|" + CommonUtils.randomHex(8).toUpperCase() + "|" + new Date().getTime();
                let sm2EncodeText = AostaritSMUtils.sign.sm2SignFromText(sourceText,options.sm2prikey);
                return AostaritSMUtils.sm4.encryptECB(sm2EncodeText+"|"+sourceText,sm4key);
            },
            generateSignUrl :function (url, signPlainText, sm4key, appid) {
                let sign = AostaritSMUtils.sign.generateSignContext(signPlainText,sm4key);
                let qp = "_sm4key="+sm4key + "&_sm2pub="+options.sm2pubkey+"&_signcont="+sign+"&_appid="+appid ;
                if(url.indexOf("?")>=0){
                    return url + "&"+qp ;
                }
                return url + "?" + qp;
            }
        },
        verifySign : {
            sm2FromHex : function (publicKey , sourceText, sign) {
                return sm2Utils.verifySignFromHex(publicKey , sourceText, sign);
            },
            sm2ASN1FromText : function (publicKey , sourceText, sign) {
                return sm2Utils.verifySignASN1FromText(publicKey , sourceText, sign)
            }
        },
        sm2:{
            generateKeyPair:function(){
                // JS端生成公私钥， 仅为前端。便于将公钥传递后端个性化加密
              return sm2Utils.generateKeyPair();
            },
            encrypt: function(publicKey ,plainText){
                return sm2Utils.encryptFromText(publicKey,plainText);
            },
            decrypt: function (privateKey, encText) {
                return sm2Utils.decryptToText(privateKey, encText);
            }
        },
        sm3:{
            encryptText:function(text){
                return Sm3Utils.encryptFromText(text);
            },
            encryptStringToHexToText :function(text){
                return Sm3Utils.encryptFromHex(CommonUtils.utf8StrToHex(text));
            },
            encryptStringToBytesToText:function(text){
                return Sm3Utils.encryptFromData(CommonUtils.utf8StrToBytes(text));
            }
        },
        sm4:{
            generateKey : function(){
                return CommonUtils.randomHex(32).toUpperCase();
            },
            encryptECB: function(plainText,key){
                return Sm4Utils.ECB.encryptFromText(plainText,key);
            },
            decryptECB: function (encText, key) {
                return Sm4Utils.ECB.decryptToText(encText, key);
            },
            encryptCBC:function (plainText, keyText,ivText) {
                //分组链模式，根据keyText And ivText 生成Hex串密钥和Hex串向量。
                return Sm4Utils.CBC.encryptFromText(plainText, keyHex, ivHex);
            },
            decryptCBC:function (encText, keyText,ivText) {
                return Sm4Utils.CBC.decryptToText(encText,keyHex,ivHex);
            }
        }
    }
}();