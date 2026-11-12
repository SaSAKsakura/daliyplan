import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const d='D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/merge-agents-v23';const p=await PresentationFile.importPptx(await FileBlob.load(d+'/source-6.pptx'));const s=p.slides.items[0];
function fmt(sh,t,x,y,w,h,size=20,bold=false,color='#1C2A38'){sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];sh.position={left:x,top:y,width:w,height:h};sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',wrap:'square',autoFit:'none',lineSpacing:1.2};}
for(const sh of s.shapes.items){const t=sh.text?.toString()||'';const b=sh.position;
 if(t==='智能体 01 · 标准分部分项')fmt(sh,'智能体 01 · 标准分部分项与计划编排',60,108,1160,48,36,true);
 else if(t.includes('按部位拆解作业'))fmt(sh,'以标准生成工序任务，按并网目标自动排期，变化后滚动重排',60,166,1160,28,18,false,'#64748B');
 else if(t==='建标准')fmt(sh,'标准建库与任务生成',566,216,654,30,23,true,'#123B61');
 else if(t.startsWith('汇集企业工法'))fmt(sh,'按专业、部位和工序维护标准，关联风险与应交资料。\n匹配点位模板，生成项目 WBS、工序任务及资料清册。',566,256,654,76,20);
 else if(t==='生结构')fmt(sh,'按并网目标自动编排',566,346,654,30,23,true,'#123B61');
 else if(t.startsWith('导入片区点位'))fmt(sh,'结合历史工期与工序依赖，按并网日期自动倒排到天，\n核对班组、作业面与作业许可，形成任务计划。',566,386,654,76,20);
 else if(t==='可校核')fmt(sh,'滚动重排与冲突预警',566,476,654,30,23,true,'#123B61');
 else if(t.startsWith('每道工序关联'))fmt(sh,'材料晚到、雨天停工后，自动重算下游排期，\n标出并网节点影响、班组撞档与作业面冲突。',566,516,654,76,20);
 else if(t==='1 天 → 1 小时')fmt(sh,'标准与计划联动',586,618,270,28,22,true,'#E8A33D');
 else if(t==='WBS 编制耗时')fmt(sh,'计划基线确认后更新',870,623,330,24,16,false,'#64748B');
 else if(!t&&b.left>550&&b.top>530&&b.top<610)sh.position={left:566,top:606,width:654,height:48};
 else if(/^06\s*／/.test(t))fmt(sh,'06 ／ 16',1160,675,60,22,14,false,'#94A3B8');
}
s.speakerNotes.text='标准分部分项与计划编排合并为一个智能体。覆盖标准建库、WBS 与任务生成、自动倒排、滚动重排及冲突预警。业务主线仍分别保留标准分部分项和计划编排两个环节。';await(await PresentationFile.exportPptx(p)).save(d+'/merged.pptx');await fs.writeFile(d+'/merged.png',new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));console.log('Merged agent introduction');
