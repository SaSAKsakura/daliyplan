import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v8`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v7.pptx`));
for(const index of [9,10]){
 const slide=p.slides.items[index];
 for(const pic of slide.images.items){const frame=pic.frame;pic.frame={...frame,top:178};}
 if(index===9){
  // Keep the original description fully covered after the board enters.
  const mask=slide.shapes.items.find(s=>s.name==='看板展示标题');
  mask.position={...mask.position,top:178,height:380};
 }
 await fs.writeFile(`${dir}/after-${index+1}.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
}
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Aligned screenshot tops to the right column without changing their sizes or proportions.');
