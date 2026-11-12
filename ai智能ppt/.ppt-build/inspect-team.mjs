import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
await fs.mkdir(`${root}/.ppt-build/v3`,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v2.pptx`));
const s=p.slides.items[9];
await fs.writeFile(`${root}/.ppt-build/v3/before.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${root}/.ppt-build/v3/before-layout.json`,await (await s.export({format:'layout'})).text());
console.log((await p.inspect({kind:'textbox,shape,table',search:'分包|谁合适|负载|合规|证件|画像',maxChars:17000})).ndjson);
