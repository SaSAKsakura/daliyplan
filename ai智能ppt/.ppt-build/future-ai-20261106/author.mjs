import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/future-ai-20261106`;
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();s.background.fill='#FFFFFF';
function txt(name,text,x,y,w,h,size=14,bold=false,color='#64748B',alignment='left'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=[{runs:[{run:text,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,insets:0,verticalAlignment:'top',lineSpacing:1.15,wrap:'square',autoFit:'none'};return sh;
}
txt('页眉','03 ／ 场景智能体 · 分部分项 · 未来方案',60,60,1160,20);
s.shapes.add({name:'页眉分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
txt('主标题','分部分项 AI 协同工作台',60,108,760,44,36,true,'#1C2A38');
txt('副标题','从节点沟通提炼任务，确认后执行并留痕',846,120,374,38,17,false,'#64748B','right');
txt('界面说明','未来界面示意：节点定位、任务办理与 AI 沟通同屏协同',60,174,820,20,14,false,'#94A3B8');
const bytes=await fs.readFile(`${dir}/interface.png`),iw=bytes.readUInt32BE(16),ih=bytes.readUInt32BE(20),w=808,h=w*ih/iw;
s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:'基于用户HTML设计适配的未来AI协同界面。左侧分部分项树，中间任务看板，右侧节点沟通与待确认任务草稿。示例数据不代表已上线能力。',fit:'contain',position:{left:60,top:204,width:w,height:h}});
const rows=[['理解当前节点','围绕当前分部分项读取标准、计划、\n关联单据与节点沟通，回答有据可查。'],['提炼任务，推荐责任人','从消息识别事项、期限与交付要求，\n结合岗位和负载推荐人选，保留原文。'],['确认派发，结果回到节点','人工采纳后通知办理，关联单据与\n办理结果，汇总节点待办及异常。']];
rows.forEach(([title,body],i)=>{
 const y=204+i*110;
 const sh=s.shapes.add({name:`编号${i+1}`,geometry:'roundRect',position:{left:918,top:y,width:40,height:40},fill:'#0F3B63',line:{fill:'none',width:0},borderRadius:9});
 sh.text=`0${i+1}`;sh.text.style={typeface:'微软雅黑',fontSize:17,bold:true,color:'#FFFFFF',alignment:'center',verticalAlignment:'middle',insets:0};
 txt(`能力标题${i+1}`,title,974,y,246,26,18,true,'#1C2A38');
 txt(`能力说明${i+1}`,body,974,y+31,246,64,14,false,'#64748B');
});
const bottom=204+h;
s.shapes.add({name:'确认边界底色',geometry:'roundRect',position:{left:918,top:bottom-98,width:302,height:98},fill:'#FBEBD2',line:{fill:'none',width:0},borderRadius:16});
txt('边界标题','AI 给建议，业务确认生效',938,bottom-85,262,26,17,true,'#E8A33D');
txt('边界说明','计划基线调整走审批；任务完成以办理\n确认或关联单据审批结果为准。',938,bottom-53,262,44,14,false,'#7A5A22');
txt('页码','01 ／ 01',1160,675,60,20,14,false,'#94A3B8','right');
s.speakerNotes.text='方案来源：用户提供的本地HTML《分部分项协同管理界面设计V2-AI沟通与任务(1).html》。原页面属于设计稿，无法证明功能已上线。本页保留其节点会话绑定、任务草稿、看板流转、分派留痕等设计，并适配为新能源储能基础示例。AI读取标准、资格校验、异常汇总为拟扩展方向。默认建议模式，人工采纳后派发。计划基线不得由AI直接修改，任务完成必须有业务事实；节点进度应按工程量或作业计数等已配置口径计算，草稿不计入进度，避免重复累计。自动分派需项目显式授权、通过权限与资格校验，条件不足转人工。所有演示日期为明确日期，不沿用原稿中不一致的星期换算。';
await(await PresentationFile.exportPptx(p)).save(`${dir}/candidate.pptx`);
await fs.writeFile(`${dir}/preview.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/layout.json`,await(await s.export({format:'layout'})).text());
console.log('Created one-page future concept slide with editable title and descriptions.');
