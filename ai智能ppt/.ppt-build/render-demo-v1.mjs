import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v10/demo-final`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/系统界面展示v1.pptx`));
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(`${dir}/slide-${i+1}.png`,new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
await fs.writeFile(`${dir}/montage.webp`,new Uint8Array(await (await p.export({format:'webp',montage:true,scale:0.4})).arrayBuffer()));
console.log('Rendered all 3 system interface slides.');
