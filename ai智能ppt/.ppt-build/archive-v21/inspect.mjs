import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const d='D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/archive-v21';
try{const p=await PresentationFile.importPptx(await FileBlob.load(d+'/incoming-fixed.pptx'));await fs.writeFile(d+'/incoming.png',new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1})).arrayBuffer()));await fs.writeFile(d+'/incoming.layout.json',await(await p.slides.items[0].export({format:'layout'})).text());console.log('Rendered supplied slide');}catch(e){console.log(e.message);process.exitCode=1;}
