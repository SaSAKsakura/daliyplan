import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const d='D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/merge-agents-v23';
for(const n of [5,6,7,12,14]){const p=await PresentationFile.importPptx(await FileBlob.load(`${d}/source-${n}.pptx`));await fs.writeFile(`${d}/before-${n}.png`,new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1})).arrayBuffer()));}
console.log('Inspected current source pages');
