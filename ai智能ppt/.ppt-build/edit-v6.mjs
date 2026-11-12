import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v6`;
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v5.pptx`));
const s=p.slides.items[10];
const original=JSON.parse(await (await s.export({format:'layout'})).text());
const byName=name=>s.shapes.items.find(x=>x.name===name);
function label(name,text,x,y,w,h,size=22,bold=true,color='#0F3B63',fill='none'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});
 sh.text=text;
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',alignment:'left',lineSpacing:1,wrap:'square',autoFit:'none'};
 return sh;
}
// Preserve the original workflow and center it in the wider left column.
for(const item of original.elements){
 if(item.position.left<540&&item.position.top>=209&&item.position.top<=524){
  const sh=byName(item.name);sh.position={...sh.position,left:sh.position.left+105};
 }
}
const cap=byName('文本框 45');cap.position={left:60,top:178,width:680,height:27};cap.text.style={typeface:'微软雅黑',fontSize:20,bold:true,color:'#0F3B63',insets:0,verticalAlignment:'top',lineSpacing:1};
label('档案智能说明标题','智能体辅助归档',778,178,442,28);
for(const [tn,bn,y] of [['文本框 56','文本框 57',218],['文本框 58','文本框 59',330],['文本框 60','文本框 61',442]]){
 const t=byName(tn),b=byName(bn);
 t.position={left:778,top:y,width:442,height:25};t.text.style={typeface:'微软雅黑',fontSize:18,bold:true,color:'#0F3B63',insets:0,verticalAlignment:'top',lineSpacing:1};
 b.position={left:778,top:y+30,width:442,height:78};b.text.style={typeface:'微软雅黑',fontSize:16.5,color:'#1C2A38',insets:0,verticalAlignment:'top',lineSpacing:1.4,wrap:'square',autoFit:'none'};
}
byName('圆角矩形 62').position={left:60,top:570,width:1160,height:48};
byName('文本框 63').position={left:80,top:581,width:325,height:28};
byName('文本框 64').position={left:430,top:586,width:700,height:20};
for(const item of original.elements.filter(x=>x.text)){
 if(byName(item.name).text.toString()!==item.text)throw Error(`Original wording changed: ${item.name}`);
}
await fs.writeFile(`${dir}/state-workflow.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
const inputs=[
 ['1','档案清册与缺项提示','C:/Users/MATEBO~1/AppData/Local/Temp/codex-clipboard-773150e8-61f6-4139-8a5c-134bfdfd41cf.png'],
 ['2','项目信息与专业分项','C:/Users/MATEBO~1/AppData/Local/Temp/codex-clipboard-cc619e3b-3721-4743-8b4a-c7c09bbd8258.png'],
];
for(const [n,title,path] of inputs){
 label(`档案示例${n}标题`,title,60,178,680,36,22,true,'#0F3B63','#FFFFFF');
 label(`档案示例${n}底板`,'',60,208,680,350,16,false,'#1C2A38','#FFFFFF');
 const bytes=await fs.readFile(path);await fs.writeFile(`${dir}/example-${n}.png`,bytes);
 s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:`档案示例${n}：${title}`,fit:'contain',position:{left:60,top:214,width:680,height:680*bytes.readUInt32BE(20)/bytes.readUInt32BE(16)}});
 await fs.writeFile(`${dir}/state-example-${n}.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
}
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Preserved all original archive text; embedded both supplied examples at original image quality.');
