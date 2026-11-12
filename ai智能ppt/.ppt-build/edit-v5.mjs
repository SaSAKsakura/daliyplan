import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt', dir=`${root}/.ppt-build/v5`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v4.pptx`));
const s=p.slides.items[9];
const layout=JSON.parse(await (await s.export({format:'layout'})).text());
p.delete(layout.elements.filter(x=>x.kind==='image'||x.name==='线上页面截图标题').map(x=>x.id));
function text(name,value,x,y,w,h,size=18,bold=false,color='#1C2A38',fill='none'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});
 sh.text=value.split('\n').map(line=>({runs:[{run:line,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}));
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',alignment:'left',lineSpacing:1.4,wrap:'square',autoFit:'none'};
 return sh;
}
const originals=[
 ['初始描述标题','现在：派活靠电话',60,178,680,28,22,true,'#0F3B63'],
 ['初始描述一','谁熟悉、谁在场就派谁，忙闲不均',80,242,640,36,20,false,'#64748B'],
 ['初始描述二','证件到期靠人盯，合规靠抽查',80,314,640,36,20,false,'#64748B'],
 ['初始描述三','干得好不好没有记录，结算各说各话',80,386,640,36,20,false,'#64748B'],
 ['初始描述场景','新能源点位分散，一个班组同时跑三四个点，靠电话对表迟早出错。',80,478,640,55,17,false,'#64748B'],
];
for(const args of originals)text(...args);
await fs.writeFile(`${dir}/state-text.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
text('看板展示标题','队伍画像看板',60,178,680,36,22,true,'#0F3B63','#FFFFFF');
const bytes=await fs.readFile(`${root}/output/企业画像页面_脱敏版v2.png`);
s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:'队伍画像线上页面',fit:'contain',position:{left:60,top:214,width:680,height:680*bytes.readUInt32BE(20)/bytes.readUInt32BE(16)}});
await fs.writeFile(`${dir}/state-dashboard.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Prepared the original description state and dashboard state.');
