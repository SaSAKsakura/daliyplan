import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/log-ai-20261106`;await fs.mkdir(dir,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();s.background.fill='#FFFFFF';
function txt(name,text,x,y,w,h,size=18,bold=false,color='#1C2A38',alignment='left'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=[{runs:[{run:text,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,insets:0,verticalAlignment:'top',lineSpacing:1.22,wrap:'square',autoFit:'none'};return sh;
}
txt('页眉','03 ／ 场景智能体 · 03 · 未来方案',60,60,1160,20,14,false,'#64748B');
s.shapes.add({name:'页眉分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
txt('主标题','施工日志 AI 协同',60,108,760,44,36,true);
txt('副标题','现场记录自动归集，问题有人跟，结果可回查',846,120,374,42,17,false,'#64748B','right');
txt('示例标签','现场上报示例 · 储能基础作业',60,200,1160,24,15,true,'#B47B2C');
txt('现场原话','“今天完成储能柜基础浇筑，附现场照片。\n东侧预埋件还没到，明天安装可能受影响。”',60,238,1160,75,25,false,'#123B61');
const blocks=[
 {title:'01  日志自动整理',body:'提取部位、工序与现场影像，\n追问完成量、人员等缺失信息。',result:'班组补充后，确认形成日志'},
 {title:'02  问题联动任务',body:'识别预埋件未到的影响，\n关联次日计划，生成催办建议。',result:'项目经理确认责任人与期限'},
 {title:'03  结果回写日志',body:'材料到场后关联签收单、\n现场照片与处理回执，保留过程。',result:'日志、任务与单据相互可查'}
];
blocks.forEach((b,i)=>{const x=60+i*400;txt(`环节${i+1}`,b.title,x,354,360,32,22,true,'#123B61');txt(`说明${i+1}`,b.body,x,408,360,68,18);txt(`协同结果${i+1}`,b.result,x,501,360,28,17,true,'#64748B');});
s.shapes.add({name:'协同价值底色',geometry:'roundRect',position:{left:60,top:575,width:1160,height:58},fill:'#0F3B63',line:{fill:'none',width:0},borderRadius:8});
txt('协同价值','记录有依据，问题有责任，处理有回执',80,591,1120,31,22,true,'#E8A33D');
txt('业务边界','拟接入能力示意。日志由人工确认；日志报量与节点进度按既定计量、审批规则核算。',60,650,1100,22,13,false,'#94A3B8');
txt('页码','01 ／ 01',1160,675,60,20,14,false,'#94A3B8','right');
s.speakerNotes.text='本页依据本轮讨论整理施工日志AI协同的未来方案。储能基础浇筑、预埋件未到及后续材料到场均为说明流程的假设示例，未填造完成量或效率指标。逻辑为现场上报、AI整理与缺项追问、识别问题并关联计划、人工确认责任人与期限、任务处理后关联单据影像与回执。任务采纳不会直接修改计划基线，日志报量不能直接作为已审批工程量。完成与进度由既定业务规则认定。本页为独立单页，建议接在施工日志智能体介绍后。';
await(await PresentationFile.exportPptx(p)).save(`${dir}/candidate.pptx`);
await fs.writeFile(`${dir}/preview.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
console.log('Created one editable slide for construction log AI collaboration.');
