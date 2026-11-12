import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v9`;
const input='D:/myq/xwechat_files/wxid_729ptvhcxl0q21_f83a/temp/RWTemp/2026-11/04bf4d647cfd851136a8a25c39aba3ba/场景智能体-施工变更呈现.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v8.pptx`));
const s=p.slides.items[8];
function label(slide,name,value,x,y,w,h,size,bold,color){
 const sh=slide.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',lineSpacing:1,wrap:'square',autoFit:'none'};
 return sh;
}
label(s,'V9专项能力引入','专项扩展：可引入施工变更呈现子智能体',60,480,560,24,16,true,'#0F3B63');
label(s,'V9专项能力作用','对接测绘点位、现场照片与施工图，辅助核查施工偏差。',60,510,560,24,14,false,'#64748B');
await fs.writeFile(`${dir}/after-04.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(`${dir}/main-edited.pptx`);
const ref=await PresentationFile.importPptx(await FileBlob.load(input));
const added=ref.slides.items[0];
const eyebrow=added.shapes.items.find(x=>x.text.toString()==='03 ／ 场景智能体 · 变更呈现');
const title=added.shapes.items.find(x=>x.text.toString()==='智能体 · 施工变更呈现');
if(!eyebrow||!title)throw Error('Missing source titles');
eyebrow.text.replace('03 ／ 场景智能体 · 变更呈现','03 ／ 安全质量检查 · 专项能力');
title.text.replace('智能体 · 施工变更呈现','专项能力 · 施工变更呈现');
title.position={left:60,top:108,width:620,height:44};
for(const sh of added.shapes.items){if(sh.text.toString())sh.text.style={typeface:'微软雅黑'};}
label(added,'V9专项页脚','10 ／ 14',1164,673,56,17,14,false,'#94A3B8');
await fs.writeFile(`${dir}/after-special.png`,new Uint8Array(await (await ref.export({slide:added,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(ref)).save(`${dir}/special-edited.pptx`);
console.log('Authored the sub-agent introduction and renamed the supplied page as a specialist capability.');
