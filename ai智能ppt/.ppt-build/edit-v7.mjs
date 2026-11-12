import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v7`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v6.pptx`));
const changes=[{index:9,name:'看板展示标题',text:'队伍画像看板'},{index:10,name:'档案示例1标题',text:'档案清册与缺项提示'},{index:10,name:'档案示例2标题',text:'项目信息与专业分项'}];
for(const index of [9,10]){
 const slide=p.slides.items[index];
 await fs.writeFile(`${dir}/before-${index+1}.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
 for(const change of changes.filter(x=>x.index===index)){
  const shape=slide.shapes.items.find(x=>x.name===change.name);
  if(!shape||shape.text.toString()!==change.text)throw Error(`Unexpected title: ${change.name}`);
  shape.text.replace(change.text,'');
 }
 await fs.writeFile(`${dir}/after-${index+1}.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
}
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Removed screenshot caption text on slides 10 and 11.');
