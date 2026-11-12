import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const dir='D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/refine-v19';
for(let i=1;i<=21;i++){const p=await PresentationFile.importPptx(await FileBlob.load(`${dir}/finalsplit-${i}.pptx`));await fs.writeFile(`${dir}/final-${i}.png`,new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1})).arrayBuffer()));console.log(i);}



