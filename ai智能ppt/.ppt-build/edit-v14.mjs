import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/merge-20261105-1745`;
await fs.mkdir(dir,{recursive:true});
function format(sh,value,pos,size,bold,color,alignment='left',verticalAlignment='top',wrap='none'){
 sh.text=[{runs:[{run:value,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.position=pos;sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,verticalAlignment,insets:0,lineSpacing:1,wrap,autoFit:'none'};
}
function find(s,name){const sh=s.shapes.items.find(x=>x.name===name);if(!sh)throw Error(name);return sh;}
function header(s,eyebrowName,titleName,eyebrow,title,page){
 format(find(s,eyebrowName),eyebrow,{left:60,top:60,width:1160,height:20},14,false,'#64748B','left','middle');
 format(find(s,titleName),title,{left:60,top:108,width:1160,height:44},36,true,'#1C2A38','left','middle');
 s.shapes.add({geometry:'line',name:'统一页眉分隔线',position:{left:60,top:87.5,width:1160,height:0},fill:'none',line:{fill:'#D3DDE9',width:0.65,style:'solid'}});
 const foot=s.shapes.add({geometry:'textbox',name:'统一页码',position:{left:1160,top:675,width:60,height:20},fill:'none',line:{fill:'none',width:0}});
 format(foot,`${String(page).padStart(2,'0')} ／ 20`,{left:1160,top:675,width:60,height:20},14,false,'#94A3B8','right','middle');
}
const adv=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/我们的优势_概数展示单页v2.pptx`));
const a=adv.slides.items[0];
header(a,'栏目','标题','01 ／ 公司介绍','我们的优势',4);
format(find(a,'副标题'),'电力工程领域的应用积累',{left:60,top:166,width:1160,height:30},19,false,'#64748B');
for(const n of ['指标数值3','指标名称3','指标单位3'])find(a,n).delete();
for(let i=0;i<3;i++){
 const x=60+i*400;
 const value=find(a,`指标数值${i}`),label=find(a,`指标名称${i}`),unit=find(a,`指标单位${i}`);
 format(value,value.text.toString(),{left:x,top:302,width:360,height:108},76,true,'#123B61');
 format(label,label.text.toString(),{left:x,top:440,width:360,height:34},22,false,'#1C2A38');
 format(unit,unit.text.toString(),{left:x,top:488,width:360,height:28},18,false,'#64748B');
}
a.speakerNotes.text='数据来源：用户提供。展示采用向下取整的概数，原始数据为目前准入的分包人员34681人、两年内准入的分包人员45443人、目前准入的分包队伍1322支。统计截止日期未提供。';
await (await PresentationFile.exportPptx(adv)).save(`${dir}/advantages-edited.pptx`);
await fs.writeFile(`${dir}/advantages-edited.png`,new Uint8Array(await(await adv.export({slide:a,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/advantages-edited.layout.json`,await(await a.export({format:'layout'})).text());
const foundation=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/系统界面展示_单页样稿v6.pptx`));
const f=foundation.slides.items[0];
header(f,'页眉','主标题','03 ／ 场景智能体 · 01—04 · 界面展示','标准任务贯通计划、日志与检查',11);
format(find(f,'副标题'),'同一套分部分项，衔接后台标准、每日安排与现场执行',{left:60,top:166,width:1160,height:28},18,false,'#64748B');
for(let i=1;i<=4;i++){
 const x=60+(i-1)*300;
 const title=find(f,`环节${i}`),body=find(f,`说明${i}`);
 format(title,title.text.toString(),{left:x,top:208,width:260,height:29},22,true,'#123B61');
 format(body,body.text.toString(),{left:x,top:243,width:260,height:24},16,false,'#64748B');
}
find(f,'示例信息说明').delete();
format(find(f,'智能体衔接标签'),'智能体衔接',{left:60,top:654,width:120,height:22},17,true,'#E8A33D');
format(find(f,'智能体衔接内容'),'按标准生成任务，辅助排期与日志归集，提示检查缺项及整改期限',{left:195,top:656,width:925,height:22},16,false,'#123B61');
f.speakerNotes.text='界面依据用户提供的截图和样稿整理。各区域来自不同项目的展示示例，不代表同一项目的实时关联数据。计划区域是按原截图字段重排的可编辑摘要表，保留周计划周期、两条分部分项及数量，以及9月24至30日全部七天的作业时段和状态。智能体衔接文字属于方案能力定义。';
await (await PresentationFile.exportPptx(foundation)).save(`${dir}/foundation-edited.pptx`);
await fs.writeFile(`${dir}/foundation-edited.png`,new Uint8Array(await(await foundation.export({slide:f,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/foundation-edited.layout.json`,await(await f.export({format:'layout'})).text());
console.log('Adapted two source pages to the current deck typography, header placement and slide numbering.');
