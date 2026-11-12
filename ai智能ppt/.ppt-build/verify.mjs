import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const version=Number(process.argv[2]||1);
const build=version===1?`${root}/.ppt-build`:`${root}/.ppt-build/v${version}`;
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v${version}.pptx`));
await fs.mkdir(`${build}/final-render`,{recursive:true});
for(let i=0;i<p.slides.items.length;i++){
 await fs.writeFile(`${build}/final-render/slide-${i+1}.png`,new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
}
await fs.writeFile(`${build}/final-montage.webp`,new Uint8Array(await (await p.export({format:'webp',montage:true,scale:0.4})).arrayBuffer()));
console.log('Rendered',p.slides.items.length);
