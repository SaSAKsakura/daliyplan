import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/分部分项_AI协同未来方案单页v1.pptx`));
if(p.slides.items.length!==1)throw Error('Expected one slide');
await fs.writeFile(`${root}/output/分部分项_AI协同未来方案展示图v1.png`,new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1.5})).arrayBuffer()));
await fs.copyFile(`${root}/.ppt-build/future-ai-20261106/interface.png`,`${root}/output/分部分项_AI协同未来界面v1.png`);
console.log('Reimported final PPT and rendered the final presentation image.');
