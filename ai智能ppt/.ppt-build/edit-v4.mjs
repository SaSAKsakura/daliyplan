import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const dir=`${root}/.ppt-build/v4`;
await fs.mkdir(dir,{recursive:true});
// Restore the original team dispatch logic from v2; v3 only changed slide 10.
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v2.pptx`));
const s=p.slides.items[9];
const layout=JSON.parse(await (await s.export({format:'layout'})).text());
const remove=new Set(['圆角矩形 15','文本框 16','圆角矩形 17','文本框 18','圆角矩形 19','文本框 20','圆角矩形 21','文本框 22','圆角矩形 23','文本框 24','矩形 25','圆角矩形 26','圆角矩形 29','圆角矩形 32']);
p.delete(layout.elements.filter(x=>remove.has(x.name)).map(x=>x.id));
const caption=s.shapes.add({name:'线上页面截图标题',geometry:'textbox',position:{left:60,top:178,width:680,height:26},fill:'none',line:{fill:'none',width:0}});
caption.text='队伍画像看板';
caption.text.style={typeface:'微软雅黑',fontSize:22,color:'#0F3B63',bold:true,insets:0};
const decision=s.shapes.add({name:'智能体决策标题',geometry:'textbox',position:{left:778,top:178,width:442,height:28},fill:'none',line:{fill:'none',width:0}});
decision.text='智能体辅助决策';
decision.text.style={typeface:'微软雅黑',fontSize:22,color:'#0F3B63',bold:true,insets:0};
const subtitle=s.shapes.items.find(x=>x.name==='文本框 14');
subtitle.text='看板掌握队伍状态，智能体辅助匹配与预警';
subtitle.position={left:800,top:127,width:420,height:25};
subtitle.text.style={typeface:'微软雅黑',fontSize:17,color:'#64748B',insets:0,alignment:'right'};
const bytes=await fs.readFile(`${root}/output/企业画像页面_脱敏版v2.png`);
// The actual supplied PNG is embedded without repainting or changing its data.
const width=680;
const imageHeight=width*bytes.readUInt32BE(20)/bytes.readUInt32BE(16);
s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:'队伍画像线上页面',fit:'contain',position:{left:60,top:214,width,height:imageHeight}});
const names=[['文本框 27','文本框 28',218],['文本框 30','文本框 31',330],['文本框 33','文本框 34',442]];
for(const [tn,bn,y] of names){
 const title=s.shapes.items.find(x=>x.name===tn);
 const body=s.shapes.items.find(x=>x.name===bn);
 title.position={left:778,top:y,width:442,height:25};
 title.text.style={typeface:'微软雅黑',fontSize:18,bold:true,color:'#0F3B63',insets:0,verticalAlignment:'top',lineSpacing:1};
 body.position={left:778,top:y+30,width:442,height:78};
 body.text.style={typeface:'微软雅黑',fontSize:16.5,color:'#1C2A38',insets:0,verticalAlignment:'top',lineSpacing:1.4,wrap:'square',autoFit:'none'};
}
const metric=s.shapes.items.find(x=>x.name==='文本框 36');
metric.position={left:80,top:582,width:730,height:25};
const target=s.shapes.items.find(x=>x.name==='文本框 37');
target.position={left:850,top:586,width:350,height:18};
// Confirm that the three original logic paragraphs and target metrics stay exact.
for(const name of ['文本框 27','文本框 28','文本框 30','文本框 31','文本框 33','文本框 34','文本框 36','文本框 37']){
 const before=layout.elements.find(x=>x.name===name).text;
 if(s.shapes.items.find(x=>x.name===name).text.toString()!==before)throw Error(`Original logic text changed: ${name}`);
}
await fs.writeFile(`${dir}/after.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/after-layout.json`,await (await s.export({format:'layout'})).text());
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Embedded the screenshot; preserved all original dispatch, certificate, performance and target wording.');
