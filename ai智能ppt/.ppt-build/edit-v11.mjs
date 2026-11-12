import fs from 'node:fs/promises';
import { FileBlob, Presentation, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v11`;
await fs.mkdir(dir,{recursive:true});
function text(slide,name,value,x,y,w,h,size=14,bold=false,color='#64748B',alignment='left'){
 const sh=slide.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,insets:0,verticalAlignment:'top',lineSpacing:1.15,wrap:'square',autoFit:'none'};
 return sh;
}
function steps(slide,entries){
 entries.forEach(([title,body],i)=>{
  const y=198+i*112;
  const badge=slide.shapes.add({name:`专项编号${i+1}`,geometry:'roundRect',position:{left:918,top:y,width:40,height:40},fill:'#0F3B63',line:{fill:'none',width:0},borderRadius:9});
  badge.text=String(i+1).padStart(2,'0');badge.text.style={typeface:'微软雅黑',fontSize:17,bold:true,color:'#FFFFFF',alignment:'center',verticalAlignment:'middle',insets:0,lineSpacing:1};
  text(slide,`专项标题${i+1}`,title,974,y,246,24,18,true,'#1C2A38');
  text(slide,`专项正文${i+1}`,body,974,y+26,246,75,14,false,'#64748B');
 });
}
function callout(slide,title,body){
 slide.shapes.add({name:'专项结果底色',geometry:'roundRect',position:{left:918,top:520,width:302,height:120},fill:'#FBEBD2',line:{fill:'none',width:0},borderRadius:16});
 text(slide,'专项结果标题',title,940,534,258,28,18,true,'#E8A33D');
 text(slide,'专项结果正文',body,940,563,258,62,14,false,'#7A5A22');
}
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v10.pptx`));
const safety=p.slides.items[8];
const intro=safety.shapes.items.find(x=>x.name==='V9专项能力引入'),detail=safety.shapes.items.find(x=>x.name==='V9专项能力作用');
intro.text='专项扩展：可引入站班会识别、施工变更呈现等子智能体';
detail.text='站班会核验到岗与资格，变更呈现核查实测走线与施工图差异。';
const change=p.slides.items[9];
const layout=JSON.parse(await (await change.export({format:'layout'})).text());
const keepText=new Set(['03 ／ 安全质量检查 · 专项能力','专项能力 · 施工变更呈现','测绘点位与照片对上原图，走线一变就出对比图','10 ／ 14']);
const frame=layout.elements.find(x=>x.kind==='shape'&&x.geometry==='roundRect'&&x.position.left===616);
const keep=layout.elements.filter(x=>x.kind==='image'||keepText.has(x.text)||(x.position.left===0&&x.position.top===0&&x.position.width===1280)||(x.position.top===87&&x.position.height===1)||x.id===frame.id);
const keepIds=new Set(keep.map(x=>x.id));p.delete(layout.elements.filter(x=>!keepIds.has(x.id)).map(x=>x.id));
const originalFrame=p.resolve(frame.id);originalFrame.position={left:60,top:196,width:828,height:451};originalFrame.fill='#FFFFFF';originalFrame.borderRadius=4;
const picture=change.images.items[0],old=picture.frame;
const height=451,width=height*old.width/old.height;
picture.frame={left:60+(828-width)/2,top:196,width,height};
text(change,'施工变更图片说明','施工变更对比 · 原图与施工实际',60,178,828,18,14,false,'#94A3B8');
steps(change,[
 ['点位与照片自动落图','现场实时测绘点位、照片随时上传，\n坐标、朝向自动挂到对应图纸。'],
 ['逐段比对判定变更','实测走线与原施工图逐段比对，\n超出允许偏差即判定变更，\n标出变更段落与偏移量。'],
 ['对比图与变更单一键生成','原设计与实测路径同图叠放，\n标偏移、标长度，可直接交底、报审。\n全程不靠人工绘图。'],
]);
callout(change,'1 天 → 10 分钟','变更确认与出图耗时（试点目标）');
const oldFooter=change.shapes.items.find(x=>x.text.toString()==='10 ／ 14');oldFooter.text='11 ／ 15';
await fs.writeFile(`${dir}/change-after.png`,new Uint8Array(await (await p.export({slide:change,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(`${dir}/main-edited.pptx`);
const demo=Presentation.create({slideSize:{width:1280,height:720}}),roll=demo.slides.add();roll.background.fill='#FFFFFF';
text(roll,'站班会页眉','03 ／ 安全质量检查 · 专项能力',60,60,1160,17,14,false,'#64748B');
roll.shapes.add({name:'页眉分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
text(roll,'站班会主标题','AI 站班会识别：谁到岗，资格够不够',60,108,850,44,36,true,'#1C2A38');
text(roll,'站班会副标题','一张现场照片，AI 替你把人点清',974,127,246,25,17,false,'#64748B','right');
text(roll,'站班会图片说明','AI 站班会识别记录 · 示例（计划 7 人 / 到岗 5 人）',60,178,828,18,14,false,'#94A3B8');
const data=await fs.readFile(`${root}/output/素材/站班会识别示例_人员匿名.png`),w=data.readUInt32BE(16),h=data.readUInt32BE(20),scale=Math.min(828/w,451/h),pw=w*scale,ph=h*scale;
roll.images.add({blob:new Uint8Array(data),contentType:'image/png',alt:'AI站班会识别系统记录，人员使用匿名代号',fit:'contain',position:{left:60+(828-pw)/2,top:196+(451-ph)/2,width:pw,height:ph}});
steps(roll,[
 ['到岗核验','AI比对站班会照片与人脸库，\n计划人数、实际到岗一次核清。'],
 ['资格校验','与准入台账比对岗位和证书，\n资格缺项当场标红，不具备不上岗。'],
 ['异常成单','人数不足、比对不符或资格缺项，\n自动成单，附现场照片可回查。'],
]);
callout(roll,'异常未销项，任务不闭合','AI识别结果自动写入当日安全质量\n检查清单，派单到责任人。');
text(roll,'站班会页脚','10 ／ 15',1164,673,56,17,14,false,'#94A3B8');
await fs.writeFile(`${dir}/rollcall-after.png`,new Uint8Array(await (await demo.export({slide:roll,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(demo)).save(`${dir}/rollcall-edited.pptx`);
console.log('Built matching left-image/right-description capability layouts and updated agent 04 introduction.');
