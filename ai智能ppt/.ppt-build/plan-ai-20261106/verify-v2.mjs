import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/计划编排_AI协同未来方案单页v2.pptx`));
if(p.slides.items.length!==1||!p.slides.items[0].shapes.items.some(s=>s.text.toString()==='AI 计划编排工作台'))throw Error('Unexpected title or slide count');
await fs.writeFile(`${root}/output/计划编排_AI协同未来方案单页v2.png`,new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1.5})).arrayBuffer()));
console.log('Verified one slide with requested title.');
