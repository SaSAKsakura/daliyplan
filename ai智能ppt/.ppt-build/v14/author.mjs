import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();s.background.fill='#FFFFFF';
function txt(name,value,x,y,w,h,size=14,bold=false,color='#64748B',alignment='left'){const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,insets:0,verticalAlignment:'top',lineSpacing:1.15,wrap:'square',autoFit:'none'};return sh;}
txt('页眉','01 ／ 公司介绍 · 逸视角 · 界面展示',60,60,1160,20);
s.shapes.add({name:'页眉分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
txt('主标题','逸视角 · 智能物联运行管理',60,108,790,44,36,true,'#1C2A38');
txt('副标题','设备状态、现场画面与告警同屏可查',846,120,374,36,17,false,'#64748B','right');
const bytes=await fs.readFile('.ppt-build/iot-v14/sanitized.png');const iw=bytes.readUInt32BE(16),ih=bytes.readUInt32BE(20),factor=Math.min(828/iw,460/ih);
s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:'逸视角运行管理原型脱敏示例。告警区按原型字段重排，项目、设备、坐标及监测数值已脱敏。',fit:'contain',position:{left:60+(828-iw*factor)/2,top:198,width:iw*factor,height:ih*factor}});
const steps=[['项目与设备关联','按项目、站点或设备查看，\n将现场设备与作业票据对应。'],['现场状态同屏查看','布控球、单兵画面与通风测毒\n数据同屏，查看在线及运行状态。'],['分级告警与历史回查','按级别查看告警及恢复状态，\n进入设备详情回查历史数据与视频。']];
steps.forEach(([h,b],i)=>{const y=198+i*92;let sh=s.shapes.add({name:`编号${i+1}`,geometry:'roundRect',position:{left:918,top:y,width:40,height:40},fill:'#0F3B63',line:{fill:'none',width:0},borderRadius:9});sh.text=`0${i+1}`;sh.text.style={typeface:'微软雅黑',fontSize:17,bold:true,color:'#FFFFFF',alignment:'center',verticalAlignment:'middle',insets:0};txt(`说明标题${i+1}`,h,974,y,246,24,18,true,'#1C2A38');txt(`说明正文${i+1}`,b,974,y+26,246,58);});
s.shapes.add({name:'结果底色',geometry:'roundRect',position:{left:918,top:546,width:302,height:112},fill:'#FBEBD2',line:{fill:'none',width:0},borderRadius:16});txt('结果标题','现场感知支撑工程管控',940,560,258,28,18,true,'#E8A33D');txt('结果正文','为安全质量检查提供现场依据，\n辅助项目部定位异常、回查过程。',940,589,258,56,14,false,'#7A5A22');
txt('脱敏说明','原型界面示例，告警区按原字段重排；项目、设备、坐标及监测数值已脱敏',60,670,1000,18,11,false,'#94A3B8');txt('页码','04 ／ 19',1164,673,56,17,14,false,'#94A3B8');
s.speakerNotes.text='内容来源：用户提供的智能物联-运行管理副本.zip 内 index.html 及八个原型画布，结合 AI新能源设施建设场景方案v13.pptx 第3页逸视角介绍。项目维度关联、实时视频和环境监测、分级告警及恢复状态来自运行监测页，历史数据与视频回放来自设备历史页。视频回放需设备在线并获取SD卡文件。原型能力用于功能介绍，不表述为已投产成果。项目及单位名称改为示例名，票据及设备编号替换，精确坐标与监测数值隐藏，视频水印遮挡。告警区原为栅格图片，按原字段重排，移除原数量、时刻、读数和设备编号。';
await fs.writeFile('.ppt-build/v14/preview.png',new Uint8Array(await(await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));await(await PresentationFile.exportPptx(p)).save('.ppt-build/v14/new-slide.pptx');console.log('Authored new interface slide');
