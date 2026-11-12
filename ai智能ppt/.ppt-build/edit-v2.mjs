import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const dir=`${root}/.ppt-build/v2`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v1.pptx`));
const slide=p.slides.items[5];
const shapes=slide.shapes.items;
function byText(value){const matches=shapes.filter(s=>s.text.toString()===value);if(matches.length!==1)throw Error(`Expected one match: ${value}`);return matches[0];}
await fs.writeFile(`${dir}/before.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
const groups=[['标准建库','建标准','汇集企业工法、验收规程与历史项目经验。',178],['按部位生成任务','生结构','导入片区点位清单，按光伏、储能、升压站、充电设施匹配模板，',298],['工序关联校核要求','可校核','每道工序关联工期、风险控制措施、验收要求及应留单据与影像，',418]];
for(const [oldTitle,newTitle,bodyPrefix,y] of groups){
 const title=byText(oldTitle);
 title.text.replace(oldTitle,newTitle);
 title.position={left:566,top:y,width:654,height:24};
 title.text.style={typeface:'微软雅黑',fontSize:20,bold:true,color:'#0F3B63',lineSpacing:1,verticalAlignment:'top',alignment:'left',insets:0};
 const body=shapes.find(s=>s.text.toString().startsWith(bodyPrefix));
 if(!body)throw Error('Body not found');
 const text=body.text.toString();
 body.text=text.split('\n').map(line=>({runs:[{run:line,style:{typeface:'微软雅黑',fontSize:'17px',color:'#1C2A38'}}],spaceBefore:0,spaceAfter:0}));
 body.position={left:566,top:y+34,width:654,height:64};
 body.text.style={typeface:'微软雅黑',fontSize:17,bold:false,color:'#1C2A38',lineSpacing:1.4,alignment:'left',verticalAlignment:'top',insets:0};
 if(body.text.toString()!==text)throw Error('Body text changed');
}
await fs.writeFile(`${dir}/after.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/after-layout.json`,await (await slide.export({format:'layout'})).text());
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Edited headings and spacing; all three body texts retained.');
