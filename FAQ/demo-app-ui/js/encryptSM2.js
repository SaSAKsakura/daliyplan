// import { sm2 } from 'sm-crypto'

//加密
function encryptsm2(content, publickKey) {
    let encryptData = factory.doEncrypt(content, publickKey ,0)
    return '04' + encryptData;
}
