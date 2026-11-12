import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/wording-20261106`;
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/.ppt-build/merge-iot-20261105/candidate.pptx`));
const slide=p.slides.items[4];
const changes={'标题':'电力工程领域的应用积累','副标题':'','指标名称0':'当前准入分包人员','指标名称1':'近两年准入分包人员','指标名称2':'当前准入分包队伍'};
for(const [name,value] of Object.entries(changes)){
 const sh=slide.shapes.items.find(s=>s.name===name);if(!sh)throw Error(name);
 sh.text.replace(sh.text.toString(),value);
 if(name==='标题')sh.text.style={color:'#64748B'};
}
await fs.writeFile(`${dir}/changes.json`,JSON.stringify(changes,null,2));
await fs.writeFile(`${dir}/preview.png`,new Uint8Array(await(await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
await(await PresentationFile.exportPptx(p)).save(`${dir}/review.pptx`);
console.log('Authored concise wording; figures, units and reporting periods preserved.');
