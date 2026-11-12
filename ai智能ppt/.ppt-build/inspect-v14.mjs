import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const dir=`${root}/.ppt-build/v14`;await fs.mkdir(dir,{recursive:true});
for(const [label,name] of [['advantages','我们的优势_概数展示单页v2.pptx'],['foundation','系统界面展示_单页样稿v6.pptx'],['current','AI新能源设施建设场景方案v13.pptx']]){
 const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/${name}`));
 const desc=[];
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i];
  const layout=JSON.parse(await (await s.export({format:'layout'})).text());
  desc.push({page:i+1,id:s.id,text:s.shapes.items.map(x=>({name:x.name,text:x.text.toString(),position:x.position})).filter(x=>x.text),images:s.images.items.map(x=>({id:x.id,frame:x.frame})),layout});
  if(label!=='current')await fs.writeFile(`${dir}/${label}-${i+1}.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
 }
 await fs.writeFile(`${dir}/${label}.json`,JSON.stringify(desc,null,2));
 console.log(label,JSON.stringify(desc.map(s=>({page:s.page,text:s.text.map(x=>x.text)}))));
}
