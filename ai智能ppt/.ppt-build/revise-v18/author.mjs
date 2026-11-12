import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=root+'/.ppt-build/revise-v18',old=root+'/.ppt-build/unify-v17';
function tx(s,name,t,x,y,w,h,size=20,bold=false,color='#1C2A38'){const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',wrap:'square',autoFit:'none',lineSpacing:1.25};return sh;}
function fmt(sh,t,x,y,w,h,size=20,bold=false,color='#1C2A38'){sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];sh.position={left:x,top:y,width:w,height:h};sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',wrap:'square',autoFit:'none',lineSpacing:1.25};}
// Reuse the original editable scheduling diagram while rebuilding the page around automatic scheduling.
const plan=await PresentationFile.importPptx(await FileBlob.load(old+'/split-8.pptx'));const s=plan.slides.items[0];
for(const sh of [...s.shapes.items]){const b=sh.position,t=sh.text?.toString()||'';const gantt=b.top>=174&&b.top<436&&b.left>=60;
 if(gantt){sh.position={left:b.left,top:212+(b.top-174)*0.88,width:b.width,height:b.height*0.88};}
 else if(b.top>160&&b.top<650)sh.delete();
 else if(t.includes('按并网节点'))fmt(sh,'按并网节点倒排，变动自动滚动重排',60,164,1160,30,19,false,'#64748B');
 else if(/\d+\s*／\s*21/.test(t))fmt(sh,'08 ／ 21',1160,675,60,22,14,false,'#94A3B8');
}
// Original example retained. Explain the two editable bar series.
tx(s,'图例','浅蓝：原计划    深蓝：自动重排结果',766,414,390,22,14,false,'#64748B');
const blocks=[['自动编排','结合分部分项与工序依赖，参考历史工期，\n按并网日期自动倒排到天。'],['变动自动滚动重排','材料晚到、雨天停工后，自动重算下游排期，\n标出对并网节点与剩余缓冲的影响。'],['冲突提前预警','自动检查班组撞档、作业面未移交等约束，\n在任务派发前提示冲突与节点风险。']];
blocks.forEach(([h,b],i)=>{const x=60+i*400;tx(s,`能力标题${i}`,h,x,480,370,34,23,true,'#123B61');tx(s,`能力正文${i}`,b,x,528,370,68,18,false,'#64748B');});
tx(s,'编排结论','自动生成排期，变化后自动重算，风险提前提醒',60,627,850,32,22,true,'#123B61');
tx(s,'生效说明','计划基线确认后更新',940,633,280,22,16,false,'#64748B');
s.speakerNotes.text='基于用户提供 v16 原计划编排页重制，保留自动倒排、自动滚动重排、冲突预警内容。甘特图沿用原稿的示例工序和示意排期，非实际项目计划。AI 自动生成与重算排期，计划基线确认后更新。';
await(await PresentationFile.exportPptx(plan)).save(dir+'/plan.pptx');await fs.writeFile(dir+'/plan.png',new Uint8Array(await(await plan.export({slide:s,format:'png',scale:1})).arrayBuffer()));
// Restore the original log copy and remove its right-hand example timeline.
const log=await PresentationFile.importPptx(await FileBlob.load(old+'/split-10.pptx'));const l=log.slides.items[0];
for(const sh of [...l.shapes.items]){const b=sh.position,t=sh.text?.toString()||'';
 if(b.left>=600&&b.top>160&&b.top<650){sh.delete();continue;}
 if(b.top>160&&b.top<560&&b.left<600){sh.position={left:b.left,top:b.top,width:1160,height:b.height};}
 if(t==='10 分钟 → 1 分钟')fmt(sh,t,78,580,280,36,28,true,'#E8A33D');
 else if(t.includes('单点日志耗时'))fmt(sh,t,378,589,800,24,17,false,'#64748B');
 else if(b.top>550&&b.top<620&&!t){sh.position={left:60,top:558,width:1160,height:62};}
 else if(/\d+\s*／\s*21/.test(t))fmt(sh,'10 ／ 21',1160,675,60,22,14,false,'#94A3B8');
}
l.speakerNotes.text='恢复 v16 原施工日志介绍内容。按用户要求去掉右侧日志时间轴示例，保留语音成稿、单据事件自动入账、日报周报自动生成，以及原试点目标。';
await(await PresentationFile.exportPptx(log)).save(dir+'/log.pptx');await fs.writeFile(dir+'/log.png',new Uint8Array(await(await log.export({slide:l,format:'png',scale:1})).arrayBuffer()));
console.log('Rebuilt automatic scheduling page and removed log example.');
