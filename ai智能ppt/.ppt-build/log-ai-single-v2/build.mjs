import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/log-ai-single-v2`;await fs.mkdir(dir,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}});
function txt(s,name,t,x,y,w,h,size=18,bold=false,color='#1C2A38',align='left'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=[{runs:[{run:t,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment:align,insets:0,verticalAlignment:'top',lineSpacing:1.18,wrap:'square',autoFit:'none'};return sh;
}
function rect(s,n,x,y,w,h,fill='#EEF4FB',line='none'){return s.shapes.add({name:n,geometry:'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1},borderRadius:8});}
function slide(title,sub,page){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 txt(s,'页眉','03 ／ 场景智能体 · 03 · 未来方案',60,60,1160,20,14,false,'#64748B');
 s.shapes.add({name:'分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
 txt(s,'主标题',title,60,108,780,46,36,true);
 txt(s,'副标题',sub,846,120,374,42,17,false,'#64748B','right');
 txt(s,'页码',`${String(page).padStart(2,'0')} ／ 01`,1160,675,60,20,14,false,'#94A3B8','right');
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
 const s=slide('施工日志 AI 协同','日志、任务与办理回执关联可查',1);
 txt(s,'界面标注','拟实现界面示意 · 储能基础作业',60,177,820,22,14,false,'#94A3B8');
 const b=await fs.readFile(`${root}/output/施工日志_AI协同核心界面v2.png`),w=808,h=w*b.readUInt32BE(20)/b.readUInt32BE(16);
 s.images.add({blob:new Uint8Array(b),contentType:'image/png',alt:'用户指定的施工日志核心区域，含时间轴、日志详情与AI助手；演示数据与拟实现流程。',fit:'contain',position:{left:60,top:210,width:w,height:h}});
 const items=[['信息补齐','从语音和单据提取字段，\n缺少完成量时追问，确认成稿。'],['异常转任务','识别材料未到与计划影响，\n推荐责任人，确认后派发。'],['处理回写','到货回执关联日志和任务，\n原始问题与办理结果同屏可查。']];
 items.forEach(([a,b],i)=>{const y=210+i*110;txt(s,`序号${i}`,`0${i+1}`,918,y,40,30,23,true,'#123B61');txt(s,`标题${i}`,a,974,y,246,30,21,true);txt(s,`说明${i}`,b,974,y+36,246,63,16,false,'#64748B');});
 rect(s,'边界',918,555,302,105,'#FBEBD2');txt(s,'确认原则','AI 建议，业务确认生效',936,572,266,28,18,true,'#B87924');txt(s,'确认说明','日志报量不直接替代审批工程量；\n节点进度仍按配置规则核算。',936,609,266,43,14,false,'#7A5A22');
 s.speakerNotes.text='界面是按用户指定区域生成的未来功能示意，未包含全局侧边导航和品牌栏。原始记录、12m³、3张照片、任务及签收单均为演示数据。界面时点在处理已完成之后，因此同时显示最初问题与后续回执。';
}

await(await PresentationFile.exportPptx(p)).save(dir+'/candidate.pptx');
await fs.writeFile(dir+'/preview.png',new Uint8Array(await(await p.export({slide:p.slides.items[0],format:'png',scale:1.5})).arrayBuffer()));
console.log('Created one-slide interface presentation');
