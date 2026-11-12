import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';const dir=root+'/.ppt-build/unify-v17';
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/split-7.pptx'));
await fs.writeFile(dir+'/inspect.ndjson',(await p.inspect({kind:'slide,textbox,shape,image,table,layout',maxChars:1000000})).ndjson);
for(let i=0;i<p.slides.items.length;i++){const s=p.slides.items[i];await fs.writeFile(`${dir}/test-${i+1}.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));}
console.log('Rendered '+p.slides.items.length);

