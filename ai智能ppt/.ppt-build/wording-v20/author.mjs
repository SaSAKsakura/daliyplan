import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=root+'/.ppt-build/wording-v20';
const changes={};
for(const page of [7,9,11,13,15,17,18]){const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/.ppt-build/refine-v19/finalsplit-${page}.pptx`));const s=p.slides.items[0];const pairs=[];
for(const sh of s.shapes.items){const old=sh.text?.toString()||'';let n=old.replace(/未来场景示意\s*·\s*/g,'').replace(/场景展示\s*·\s*/g,'').replace(/系统界面展示\s*·\s*/g,'').replace(/场景展示/g,'应用界面').replace(/系统界面展示/g,'业务界面');if(n!==old){sh.text.replace(old,n);pairs.push([old,n]);}}
if(page===15){const im=s.images.items[0];const fr=im.position;console.log('image frame',JSON.stringify(fr));const scale=Math.min(fr.width/1672,fr.height/941),x=fr.left+(fr.width-1672*scale)/2,y=fr.top+(fr.height-941*scale)/2;const sh=s.shapes.add({name:'界面标签清理',geometry:'rect',position:{left:x+134*scale,top:y+63*scale,width:138*scale,height:44*scale},fill:'#FFFFFF',line:{fill:'none',width:0}});}
changes[page]=pairs;await(await PresentationFile.exportPptx(p)).save(`${dir}/edit-${page}.pptx`);await fs.writeFile(`${dir}/preview-${page}.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
}await fs.writeFile(dir+'/changes.json',JSON.stringify(changes,null,2));console.log('Cleaned wording and embedded screenshot label.');
