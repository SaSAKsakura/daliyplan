import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/plan-ai-20261106`;await fs.mkdir(dir,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();s.background.fill='#FFFFFF';
function txt(name,t,x,y,w,h,size=18,bold=false,color='#1C2A38',align='left'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment:align,insets:0,verticalAlignment:'top',lineSpacing:1.18,wrap:'square',autoFit:'none'};return sh;
}
txt('页眉','03 ／ 场景智能体 · 02 · 未来方案',60,60,1160,20,14,false,'#64748B');
s.shapes.add({name:'分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
txt('主标题','AI 计划编排工作台',60,108,780,46,36,true);
txt('副标题','按目标排期，变动可推演，调整有依据',846,120,374,42,17,false,'#64748B','right');
txt('界面说明','未来场景示意 · 材料晚到后的排期影响与调整',60,177,820,22,14,false,'#94A3B8');
const bytes=await fs.readFile(`${root}/output/计划编排_AI协同未来界面v1.png`),w=808,h=w*bytes.readUInt32BE(20)/bytes.readUInt32BE(16),bottom=210+h;
s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:'未来计划编排AI协同界面。分部分项树、基线与顺延建议甘特图、AI影响推演与调整建议。排期与数据均为示例，建议方案未覆盖基线。',fit:'contain',position:{left:60,top:210,width:w,height:h}});
const items=[['按标准生成计划','结合分部分项、工序依赖与并网\n目标生成排期草稿，工期待校核。'],['变动联动推演','材料晚到后推演后续工序变化，\n标出节点风险，对比原计划。'],['约束校验后调整','核对班组占用、工作面与许可，\n生成备选方案，确认后提交审批。']];
items.forEach(([title,body],i)=>{const y=210+i*110;txt(`序号${i}`,`0${i+1}`,918,y,40,30,23,true,'#123B61');txt(`能力标题${i}`,title,974,y,246,30,21,true);txt(`能力说明${i}`,body,974,y+36,246,63,16,false,'#64748B');});
s.shapes.add({name:'确认边界',geometry:'roundRect',position:{left:918,top:bottom-105,width:302,height:105},fill:'#FBEBD2',line:{fill:'none',width:0},borderRadius:8});
txt('边界标题','AI 推演，确认后调整生效',936,bottom-88,266,28,18,true,'#B87924');
txt('边界说明','遵守工序依赖与资源约束；\n计划基线经审批后更新。',936,bottom-51,266,43,14,false,'#7A5A22');
txt('页码','01 ／ 01',1160,675,60,20,14,false,'#94A3B8','right');
s.speakerNotes.text='本页为计划编排AI协同的未来场景示意，不代表已上线功能。结合先前方案中标准分部分项、节点倒排、材料变化影响、冲突提示等内容，并参考用户认可的蓝白工作区和右侧AI协同界面风格。演示按自然日：组件到货11月18日改为11月20日，晚2天；组件安装11月19—24日改为21—26日，接线检测25—27日改为27—29日，并网调试28—29日改为30日至12月1日，直接顺延完成日12月1日，比11月30日目标晚1天。实际应以项目日历、依赖关系、资源与作业条件重新计算。AI提取变化与提出候选方案；计划计算应有可验证的约束和依据。资源增配仅是待评估建议，不承诺能守住节点。AI生成草稿不得直接覆盖基线，须人工确认并按权限审批生效。';
await(await PresentationFile.exportPptx(p)).save(`${dir}/candidate.pptx`);
await fs.writeFile(`${dir}/preview.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
console.log('Authored one planning AI collaboration slide.');

