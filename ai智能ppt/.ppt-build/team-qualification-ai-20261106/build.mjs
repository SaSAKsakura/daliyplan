import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/team-qualification-ai-20261106`;await fs.mkdir(dir,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();s.background.fill='#FFFFFF';
function txt(name,t,x,y,w,h,size=18,bold=false,color='#1C2A38',align='left'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment:align,insets:0,verticalAlignment:'top',lineSpacing:1.18,wrap:'square',autoFit:'none'};return sh;
}
txt('页眉','03 ／ 场景智能体 · 05 · 未来方案',60,60,1160,20,14,false,'#64748B');
s.shapes.add({name:'分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
txt('主标题','AI 分包队伍资格分析工作台',60,108,780,46,36,true);
txt('副标题','对照作业要求，资格风险提前识别',846,120,374,42,17,false,'#64748B','right');
txt('界面说明','未来场景示意 · 按施工范围、岗位与施工周期核对资格资料',60,177,820,22,14,false,'#94A3B8');
const bytes=await fs.readFile(`${root}/output/分包队伍_AI资格分析未来界面v1.png`),w=808,h=w*bytes.readUInt32BE(20)/bytes.readUInt32BE(16),bottom=210+h;
s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:'分包队伍资格分析未来界面。按项目配置要求核对企业资料、岗位证件与施工期，定位两项待补正问题，AI建议辅助人工审核。均为示例数据。',fit:'contain',position:{left:60,top:210,width:w,height:h}});
const items=[['资质按作业匹配','结合专业范围、施工周期与项目\n规则，逐项核对企业资格资料。'],['人员证件逐项核对','比对人员岗位、证件与有效期，\n提示资料缺失或施工期覆盖不足。'],['风险清单辅助审核','提供问题依据与补正建议，\n补齐后复核，保留审核记录。']];
items.forEach(([title,body],i)=>{const y=210+i*110;txt(`序号${i}`,`0${i+1}`,918,y,40,30,23,true,'#123B61');txt(`能力标题${i}`,title,974,y,246,30,21,true);txt(`能力说明${i}`,body,974,y+36,246,63,16,false,'#64748B');});
s.shapes.add({name:'审核边界',geometry:'roundRect',position:{left:918,top:bottom-105,width:302,height:105},fill:'#FBEBD2',line:{fill:'none',width:0},borderRadius:8});
txt('边界标题','AI 辅助核对，审核决定准入',936,bottom-88,266,28,18,true,'#B87924');
txt('边界说明','证照真实性与适用性仍需复核；\n关键风险按项目规则处理。',936,bottom-51,266,43,14,false,'#7A5A22');
txt('页码','01 ／ 01',1160,675,60,20,14,false,'#94A3B8','right');
s.speakerNotes.text='本页为分包队伍资格分析未来方案示意，沿用用户认可的施工日志、计划编排单页的蓝白界面与右侧AI分析形式。企业资料3项、人员3人及待补正2项均为演示数据，非实际企业审核结果。施工期2026年11月10日至30日，人员01证件11月15日到期，因此未覆盖完整施工期；人员02岗位所需证件未上传；人员03记录已上传仍待核验。资格类别和核对项应由项目实际规则与专业要求配置，不对特定证书法定范围作判断。AI可抽取资料字段、匹配项目规则并定位风险，但不能凭影像确认真伪或代替授权审核。需要核对权威信息或由审核人复核，资料上传不代表审核通过。审核、补正、复核和准入结论需保留来源、版本和操作记录。';
await(await PresentationFile.exportPptx(p)).save(`${dir}/candidate.pptx`);
await fs.writeFile(`${dir}/preview.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
console.log('Authored one qualification analysis slide.');
