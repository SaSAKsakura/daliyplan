import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=root+'/.ppt-build/refine-v19',old=root+'/.ppt-build/revise-v18';
function tx(s,name,t,x,y,w,h,size=20,bold=false,color='#1C2A38',alignment='left',verticalAlignment='top'){const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});style(sh,t,size,bold,color,alignment,verticalAlignment);return sh;}
function style(sh,t,size=20,bold=false,color='#1C2A38',alignment='left',verticalAlignment='top'){sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment,alignment,wrap:'square',autoFit:'none',lineSpacing:1.2};}
function box(s,name,x,y,w,h,fill='#EFF4FA'){return s.shapes.add({name,geometry:'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0},borderRadius:8});}
function line(s,name,x,y,w,h=0){s.shapes.add({name,geometry:'line',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'#A5B9CF',width:1.5}});}
async function save(p,n){await(await PresentationFile.exportPptx(p)).save(`${dir}/${n}.pptx`);await fs.writeFile(`${dir}/${n}.png`,new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1})).arrayBuffer()));}
const plan=await PresentationFile.importPptx(await FileBlob.load(old+'/finalsplit-8.pptx'));const s=plan.slides.items[0];
for(const sh of [...s.shapes.items]){const b=sh.position;if(b.top>=200&&b.top<450)sh.delete();}
const cols=[
[60,'编排依据','分部分项标准','工序前后依赖','历史工期参数','并网目标日期'],
[460,'自动计算','按目标倒排起止时间','核对班组与作业面','计算变化后的下游排期','识别节点与资源冲突'],
[860,'计划输出','任务起止与工序安排','班组及作业面占用','节点影响与风险清单','滚动更新后的计划方案']
];
for(const [x,title,...lines] of cols){box(s,'流程底色'+x,x,222,360,226);box(s,'流程标题底色'+x,x,222,360,48,'#123B61');tx(s,'流程标题'+x,title,x+20,232,320,30,22,true,'#FFFFFF');lines.forEach((t,i)=>{tx(s,'流程内容'+x+'-'+i,t,x+22,286+i*36,316,30,19,false,'#123B61');});}
// Editable process connectors between the three stages.
for(const x of [420,820]){tx(s,'流程衔接'+x,'›',x+6,303,32,46,36,true,'#7E9AB6','center');}
s.speakerNotes.text='按用户要求移除原甘特示例，替换为自动编排的输入、计算与输出流程。自动倒排、变动后滚动重排和冲突预警沿用原稿方案内容，计划基线确认后更新。流程为可编辑原生对象。';await save(plan,'plan');
const log=await PresentationFile.importPptx(await FileBlob.load(old+'/finalsplit-10.pptx'));const l=log.slides.items[0];
for(const sh of l.shapes.items){const b=sh.position,t=sh.text?.toString()||'';
 if(b.top>160&&b.top<550&&b.left<600)sh.position={left:b.left,top:b.top,width:520,height:b.height};
 if(t==='10 分钟 → 1 分钟'){sh.position={left:78,top:575,width:230,height:36};style(sh,t,26,true,'#E8A33D');}
 else if(t.includes('单点日志耗时')){sh.position={left:78,top:614,width:500,height:26};style(sh,'单点耗时，完整率 ≥95%（试点目标）',16,false,'#64748B');}
 else if(b.top>550&&b.top<625&&!t)sh.position={left:60,top:558,width:520,height:88};
}
tx(l,'日志流转标题','日志形成与流转',640,180,560,34,23,true,'#123B61');
const inputs=[['现场记录','语音 · 照片\n人员与完成量'],['业务单据','报审 · 报验\n审批与验收'],['系统信息','天气 · 进度\n关联事件']];
inputs.forEach(([h,b],i)=>{const x=640+i*194;box(l,'日志输入底色'+i,x,235,172,104,i===0?'#123B61':i===1?'#316FA6':'#D8E5F2');const c=i<2?'#FFFFFF':'#123B61';tx(l,'日志输入标题'+i,h,x+14,249,144,28,20,true,c,'center');tx(l,'日志输入说明'+i,b,x+10,284,152,44,16,false,c,'center');});
line(l,'来源汇集线',726,356,388);[726,920,1114].forEach((x,i)=>line(l,'来源连接'+i,x,339,0,17));line(l,'归集连接',920,356,0,28);
tx(l,'补齐提示','提取字段，缺项追问，人工确认',640,380,560,26,17,false,'#64748B','center');
box(l,'结构化日志底色',640,423,560,85);tx(l,'结构化日志标题','结构化施工日志',662,436,516,30,23,true,'#123B61');tx(l,'结构化日志说明','人员、机械、作业部位、完成量与天气',662,474,516,24,18,false,'#64748B');
line(l,'报告连接',920,508,0,29);
box(l,'报表输出底色',640,537,560,109,'#D8E5F2');tx(l,'报表输出标题','日报、周报自动输出',662,553,516,32,23,true,'#123B61');tx(l,'报表输出说明','按监理与业主既有格式生成，附当日影像。\n每条记录保留关联单据与信息来源。',662,594,516,44,17,false,'#64748B');
l.speakerNotes.text='按用户要求补充日志形成与流转机制，改善去掉右侧示例后的留白。右侧为信息来源、结构化日志与报告输出的说明流程，不含具体项目示例或虚构业务数据。原语音成稿、单据事件自动入账、日报周报自动生成及试点目标保留。';await save(log,'log');
for(const page of [7,9,11,13,15,17,18]){const p=await PresentationFile.importPptx(await FileBlob.load(`${old}/finalsplit-${page}.pptx`));const sl=p.slides.items[0];let found=0;for(const sh of [...sl.shapes.items]){const b=sh.position,t=sh.text?.toString().trim();if(['01','02','03'].includes(t)&&b.left>900&&b.left<970&&b.top>220&&b.top<530){const badge=box(sl,'统一深色序号'+t,b.left,b.top,40,40,'#123B61');style(badge,t,20,true,'#FFFFFF','center','middle');sh.delete();found++;}}if(found!==3)throw Error('Badge count '+page+' '+found);await save(p,'scene-'+page);}
console.log('Authored plan/log changes and 21 dark numbered badges.');
