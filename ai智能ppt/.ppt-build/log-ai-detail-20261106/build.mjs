import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/log-ai-detail-20261106`;await fs.mkdir(dir,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}});
function txt(s,name,t,x,y,w,h,size=18,bold=false,color='#1C2A38',align='left'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment:align,insets:0,verticalAlignment:'top',lineSpacing:1.18,wrap:'square',autoFit:'none'};return sh;
}
function rect(s,n,x,y,w,h,fill='#EEF4FB',line='none'){return s.shapes.add({name:n,geometry:'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1},borderRadius:8});}
function slide(title,sub,page){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 txt(s,'页眉','03 ／ 场景智能体 · 03 · AI 详细实现方案',60,60,1160,20,14,false,'#64748B');
 s.shapes.add({name:'分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
 txt(s,'主标题',title,60,108,780,46,36,true);
 txt(s,'副标题',sub,846,120,374,42,17,false,'#64748B','right');
 txt(s,'页码',`${String(page).padStart(2,'0')} ／ 06`,1160,675,60,20,14,false,'#94A3B8','right');
 return s;
}
function band(s,title,body,y=605){rect(s,'结论底色',60,y,1160,54,'#0F3B63');txt(s,'结论',title,80,y+13,600,29,21,true,'#E8A33D');if(body)txt(s,'补充',body,690,y+17,505,25,15,false,'#DDE8F3','right');}
function table(s,values,y,widths,rowH=46,size=16){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:60,top:y,width:1160,height:values.length*rowH,columnWidths:widths,values});
 t.borders.assign({fill:'#D8E0EA',width:0.7,style:'solid'});
 for(let r=0;r<values.length;r++){
  t.rows[r].height=rowH;
  for(let c=0;c<values[0].length;c++){
   const cell=t.getCell(r,c);cell.fill=r===0?'#123B61':r%2?'#FFFFFF':'#F4F7FB';
   cell.text.style={typeface:'微软雅黑',fontSize:size,bold:r===0||c===0,color:r===0?'#FFFFFF':'#1C2A38',insets:{left:12,right:12,top:8,bottom:8},verticalAlignment:'middle',lineSpacing:1.08,wrap:'square',autoFit:'none'};
  }
 }return t;
}
// 1: UI and visible AI cooperation.
{
 const s=slide('施工日志 AI 协同实现方案','日志、任务与办理回执关联可查',1);
 txt(s,'界面标注','拟实现界面示意 · 储能基础作业',60,177,820,22,14,false,'#94A3B8');
 const b=await fs.readFile(`${root}/output/施工日志_AI协同核心界面v2.png`),w=808,h=w*b.readUInt32BE(20)/b.readUInt32BE(16);
 s.images.add({blob:new Uint8Array(b),contentType:'image/png',alt:'用户指定的施工日志核心区域，含时间轴、日志详情与AI助手；演示数据与拟实现流程。',fit:'contain',position:{left:60,top:210,width:w,height:h}});
 const items=[['信息补齐','从语音和单据提取字段，\n缺少完成量时追问，确认成稿。'],['异常转任务','识别材料未到与计划影响，\n推荐责任人，确认后派发。'],['处理回写','到货回执关联日志和任务，\n原始问题与办理结果同屏可查。']];
 items.forEach(([a,b],i)=>{const y=210+i*110;txt(s,`序号${i}`,`0${i+1}`,918,y,40,30,23,true,'#123B61');txt(s,`标题${i}`,a,974,y,246,30,21,true);txt(s,`说明${i}`,b,974,y+36,246,63,16,false,'#64748B');});
 rect(s,'边界',918,555,302,105,'#FBEBD2');txt(s,'确认原则','AI 建议，业务确认生效',936,572,266,28,18,true,'#B87924');txt(s,'确认说明','日志报量不直接替代审批工程量；\n节点进度仍按配置规则核算。',936,609,266,43,14,false,'#7A5A22');
 s.speakerNotes.text='界面是按用户指定区域生成的未来功能示意，未包含全局侧边导航和品牌栏。原始记录、12m³、3张照片、任务及签收单均为演示数据。界面时点在处理已完成之后，因此同时显示最初问题与后续回执。';
}
// 2: Editable processing diagram, with separate model and business gates.
{
 const s=slide('数据接入与 AI 处理链路','多源汇入，模型建议与业务写入分层',2);
 txt(s,'引导','先统一项目、节点、日志日期与来源，再调用模型；写入业务数据前经过校验和确认。',60,183,1160,38,19,false,'#64748B');
 const steps=[['多源接入','语音转写、文字填报\n单据事件、影像引用'],['绑定节点','项目权限校验\n匹配节点与当日计划'],['AI 提取','提取日志字段\n识别缺项及异常'],['规则校验','结构、单位、日期\n去重、权限和依据'],['人工确认','补齐、编辑并成稿\n确认任务后派发']];
 steps.forEach(([a,b],i)=>{const x=60+i*236;rect(s,`链路${i}`,x,250,216,170,i===4?'#123B61':'#EEF4FB');txt(s,`链路标题${i}`,a,x+16,271,184,32,22,true,i===4?'#FFFFFF':'#123B61');txt(s,`链路说明${i}`,b,x+16,326,184,66,17,false,i===4?'#DDE8F3':'#64748B');if(i<4)s.shapes.add({name:`流向${i}`,geometry:'rightArrow',position:{left:x+219,top:319,width:14,height:18},fill:'#94A3B8',line:{fill:'none',width:0}});});
 const groups=[['输入对象','原始记录、附件引用、业务事件\n保留来源 ID、时间与操作者'],['AI 输出对象','日志草稿、缺项列表、异常建议\n每个结果附来源定位与依据'],['业务写入对象','确认版日志、正式任务、办理关联\n保留版本、确认记录与状态事件']];
 groups.forEach(([a,b],i)=>{const x=60+i*400;txt(s,`对象标题${i}`,a,x,475,360,29,21,true,'#123B61');txt(s,`对象说明${i}`,b,x,520,360,58,17,false,'#64748B');});
 band(s,'模型生成建议，业务服务控制生效','缺少权限、关键字段或依据时，退回人工处理');
 s.speakerNotes.text='拟采用链路：接入层保留原始来源；上下文层根据用户权限限定节点资料；模型输出结构化候选字段、证据与缺项；业务服务负责格式校验、幂等、人工确认与写入。模型不得持有直接修改计划或确认工程量的权限。未指定厂商、模型或生产接口，落地时需与现有系统确认。';
}
// 3: Native editable field/rule mapping.
{
 const s=slide('日志抽取与缺项校验','每个字段都有来源，缺项先问再填',3);
 txt(s,'说明','以原话、表单与已关联单据为依据；无法确定的内容标记待补充，不推测填值。',60,183,1160,32,18,false,'#64748B');
 table(s,[['字段','建议生成方式','校验与人工处理','界面落点'],['部位与工序','结合当前节点提取','限制在节点字典内；歧义时让班组选择','结构化日志'],['完成量与单位','从语音或关联单据读取','数量、单位成对校验；缺少即追问','AI 信息补齐'],['人员与机械','读取填报与已授权记录','区分计划安排和实际投入；冲突待确认','日志明细'],['现场影像','挂接上传附件及来源','核对节点、日期与附件可用性','现场影像'],['日志日期与天气','日期取业务日；天气按来源带入','相对日期按日历解析；缺失时人工填报','日志基本信息'],['异常事项','提取问题与影响对象','保留原话；与节点计划匹配后给建议','问题与处理记录']],216,[180,280,440,260],48,16);
 band(s,'原文缺少完成量，先追问；班组补充后写入 12 m³','演示值与单据数值冲突时，停止自动成稿',620);
 s.speakerNotes.text='表内为字段建议与业务校验设计，非已部署功能。天气不由模型臆测。完成量须区分填报量、核验量及审批量。图片首先是带来源的附件证据，图像识别结果如未来接入也仅作辅助，不自动证明施工质量合格。';
}
// 4: Suggestion and task workflow.
{
 const s=slide('异常识别与任务确认','问题关联计划，责任人与期限由人确认',4);
 txt(s,'原始异常','原始记录：“东侧预埋件还没到，明天安装可能受影响。”',60,191,1160,44,23,false,'#123B61');
 txt(s,'左标题','AI 生成任务建议',60,271,520,32,24,true,'#123B61');
 txt(s,'建议字段','任务：催办东侧预埋件到货\n影响：关联本节点次日安装计划\n人选：材料员，依据岗位职责推荐\n要求：次日安装前到货，具体时点待确认\n来源：当前日志及原始语音记录',60,325,520,200,19);
 txt(s,'右标题','业务服务校验后再派发',690,271,530,32,24,true,'#123B61');
 txt(s,'业务校验','确认同项目、同节点及计划关联关系\n核对责任人权限、职责与可用状态\n同一日志、同一问题避免重复建任务\n要素缺失时保持草稿，提示补齐\n项目经理采纳后创建正式任务并通知',690,325,530,200,19);
 rect(s,'任务状态背景',60,548,1160,48,'#EEF4FB');txt(s,'任务状态','草稿待补齐　／　待确认　／　已派发　／　办理中　／　核验后完成',80,560,1120,28,19,true,'#123B61');
 band(s,'任务采纳不直接调整施工计划','需要调整工期或基线时，另行提交变更审批',620);
 s.speakerNotes.text='建议默认人工分派。日志里的“明天”以记录时间和项目日历解析；安装前的具体时点不明确时由项目经理补齐。任务具有来源日志、问题指纹和节点关联，业务层在创建时实施幂等与去重。派发后允许接收、说明困难和申请改派，所有动作留痕。';
}
// 5: Return events and consistency.
{
 const s=slide('办理回执与日志回写','同一问题保留原始记录和后续处理事实',5);
 const groups=[['01 接收办理事件','材料员提交到货回执、签收单与照片。\n业务服务核验任务、节点和单据状态，\n满足预设条件后触发回写。'],['02 更新关联状态','记录任务状态变更及处理结果。\n以任务 ID、单据 ID、日志 ID 建立回链，\n追加处理事件，保留原始问题。'],['03 展示处理结果','时间轴增加“材料到货回执”。\n日志展示签收单与处理时间，\nAI 助手引用回执说明问题处理情况。']];
 groups.forEach(([a,b],i)=>{const x=60+i*400;txt(s,`回写标题${i}`,a,x,219,360,36,23,true,'#123B61');txt(s,`回写说明${i}`,b,x,287,360,135,18);});
 rect(s,'回执示例',60,451,1160,112,'#EEF4FB');txt(s,'回执事实','15:40 预埋件已到货，关联签收单 QS-DEMO-001',80,471,1120,33,24,true,'#123B61');txt(s,'回执引用','日志 RZ-DEMO-1109 可定位来源任务；任务可查看回执；签收单可回查原日志。',80,521,1120,28,17,false,'#64748B');
 band(s,'重复事件只处理一次，失败回写可重试','留存操作者、时间、版本及错误记录',605);
 s.speakerNotes.text='QS-DEMO-001与RZ-DEMO-1109为界面演示编号。服务端使用事件唯一标识或业务幂等键防止重复回写，支持失败重试、状态校验和异常人工处理。日志处理过程采用追加事件而非覆盖原始事实；日报生成引用确认版日志，已发布内容需要更正时保留修订版本。任务完成不直接等于节点工程量完成，进度由既定规则单独计算。';
}
// 6: Deliverable stages and acceptance.
{
 const s=slide('分阶段接入与验收','先验证数据与人工确认，再扩展协同能力',6);
 const phases=[['一期：日志成稿','接入语音、附件与节点信息\n字段抽取、缺项追问、确认成稿'],['二期：问题协同','异常关联计划，生成任务建议\n人工确认分派，接收办理回执'],['三期：汇总与扩展','日报生成、节点问题汇总\n评估资格及负载推荐等扩展']];
 phases.forEach(([a,b],i)=>{const x=60+i*400;txt(s,`阶段标题${i}`,a,x,205,360,33,22,true,'#123B61');txt(s,`阶段说明${i}`,b,x,255,360,70,18,false,'#64748B');});
 table(s,[['验收场景','应达到的业务表现'],['语音缺少完成量','提示补充；未经确认的数字不写成正式填报值'],['异常缺少责任人或截止时间','保留草稿；人工补齐前不自动派发'],['回执重复推送或回写失败','重复事件不重复处理；失败可重试并可人工追踪'],['跨项目查询与进度更新','按用户权限限制数据；日志报量不绕过计量审批规则']],359,[340,820],46,16);
 band(s,'评估指标：字段采纳率、人工修订量、追问有效性','试点采集基线后设定目标，不预设虚构收益',620);
 s.speakerNotes.text='验收场景为建议，不代表已完成系统能力。落地前需确认现有日志、节点、计划、单据和任务接口与状态字典，以及项目日历、审批链和权限规则。评估按抽样日志与业务回放进行，建议记录字段采纳率、人工修订量、缺项追问有效性、重复任务率及回执关联成功率，目标值由试点基线确定。没有给出成本、工期或收益保证。';
}
await(await PresentationFile.exportPptx(p)).save(`${dir}/candidate.pptx`);
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(`${dir}/page-${i+1}.png`,new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/montage.webp`,new Uint8Array(await(await p.export({format:'webp',montage:true,scale:0.5})).arrayBuffer()));
console.log('Authored six implementation slides with editable diagrams, tables and descriptions.');
