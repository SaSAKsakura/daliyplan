const {chromium}=require('C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"});const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('file:///D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/iot-v14/pm2mt2i4613ef6z1a-mt2i4uxc/index.html');await p.waitForTimeout(4000);console.log((await p.locator('body').innerText()).slice(0,15000));await p.screenshot({path:'.ppt-build/iot-v14/prototype.png'});await b.close()})()


