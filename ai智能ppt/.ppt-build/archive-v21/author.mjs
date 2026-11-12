import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const d='D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/archive-v21';
const p=await PresentationFile.importPptx(await FileBlob.load(d+'/incoming-fixed.pptx'));const s=p.slides.items[0];
for(const sh of s.shapes.items){const t=sh.text?.toString()||'';if(t.includes('03 ／ 场景智能体'))sh.text.replace(t,'03 ／ 场景智能体 · 06 · 应用界面');}
const footer=s.shapes.add({name:'统一页码',geometry:'textbox',position:{left:1138,top:675,width:82,height:22},fill:'none',line:{fill:'none',width:0}});footer.text=[{runs:[{run:'17 ／ 20',style:{typeface:'微软雅黑',fontSize:'14px',color:'#94A3B8'}}],spaceBefore:0,spaceAfter:0}];footer.text.style={typeface:'微软雅黑',fontSize:14,color:'#94A3B8',alignment:'right',insets:0,verticalAlignment:'top',wrap:'none',autoFit:'none'};
await(await PresentationFile.exportPptx(p)).save(d+'/authored.pptx');await fs.writeFile(d+'/adapted.png',new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));console.log('Added deck header and page number; retained incoming page composition.');
