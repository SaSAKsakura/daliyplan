import fs from 'node:fs/promises';import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const p=await PresentationFile.importPptx(await FileBlob.load('output/AI新能源设施建设场景方案v14.pptx'));
await fs.mkdir('.ppt-build/v14/final-render',{recursive:true});
for(let i=0;i<p.slides.items.length;i++){let s=p.slides.items[i];await fs.writeFile(`.ppt-build/v14/final-render/page-${i+1}.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));}
await fs.copyFile('.ppt-build/v14/final-render/page-4.png','output/逸视角_智能物联运行管理_预览.png');console.log('Rendered all 19 final slides');
