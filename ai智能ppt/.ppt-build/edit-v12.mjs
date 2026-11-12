import fs from 'node:fs/promises';
import { FileBlob, Presentation, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v12`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v11.pptx`));
const s=p.slides.items[11],byName=name=>s.shapes.items.find(x=>x.name===name);
const layout=JSON.parse(await (await s.export({format:'layout'})).text());
const remove=new Set(['圆角矩形 15','圆角矩形 17','圆角矩形 19','圆角矩形 21','圆角矩形 23','矩形 25']);
p.delete(layout.elements.filter(x=>remove.has(x.name)).map(x=>x.id));
const cap=byName('文本框 16');cap.position={left:60,top:178,width:1160,height:26};cap.text.style={typeface:'微软雅黑',fontSize:20,bold:true,color:'#64748B',insets:0,verticalAlignment:'top',lineSpacing:1};
for(const [name,x,w] of [['文本框 18',60,353],['文本框 20',454,353],['文本框 22',848,372]]){
 const sh=byName(name);sh.position={left:x,top:213,width:w,height:30};sh.text.style={typeface:'微软雅黑',fontSize:16,color:'#64748B',insets:0,verticalAlignment:'top',lineSpacing:1.2,wrap:'square',autoFit:'none'};
}
for(const [panel,title,body,x,w] of [['圆角矩形 26','文本框 27','文本框 28',60,353],['圆角矩形 29','文本框 30','文本框 31',454,353],['圆角矩形 32','文本框 33','文本框 34',848,372]]){
 const box=byName(panel);box.position={left:x,top:258,width:w,height:260};box.borderRadius=8;
 const h=byName(title);h.position={left:x+20,top:282,width:w-40,height:28};h.text.style={typeface:'微软雅黑',fontSize:20,bold:true,color:'#0F3B63',insets:0,verticalAlignment:'top',lineSpacing:1};
 const b=byName(body);b.position={left:x+20,top:326,width:w-40,height:152};b.text.style={typeface:'微软雅黑',fontSize:17,color:'#1C2A38',insets:0,verticalAlignment:'top',lineSpacing:1.4,wrap:'square',autoFit:'none'};
 const breaks={
  '文本框 28':'工种、证件、在岗负载、历史履约\n四个维度推荐人选——负载 41%\n优先于负载 86%，忙闲先摆平。',
  '文本框 31':'电工证、登高证、入场教育到期\n自动预警，不合规的人员\n派不出去、上不了岗。',
  '文本框 34':'进度、质量、安全记录沉淀为班组画像，\n作为后续派单、评优与结算的统一依据。',
 };
 b.text=breaks[body];b.text.style={typeface:'微软雅黑',fontSize:17,color:'#1C2A38',insets:0,verticalAlignment:'top',lineSpacing:1.4,wrap:'square',autoFit:'none'};
}
byName('文本框 24').position={left:60,top:532,width:1160,height:23};
byName('文本框 24').text.style={typeface:'微软雅黑',fontSize:14,color:'#64748B',insets:0,verticalAlignment:'top',lineSpacing:1,wrap:'square'};
byName('文本框 36').position={left:80,top:582,width:730,height:26};
byName('文本框 37').position={left:850,top:586,width:350,height:18};
for(const item of layout.elements.filter(x=>x.text)){
 if(byName(item.name)?.text.toString().replace(/\s/g,'')!==item.text.replace(/\s/g,''))throw Error(`Original team wording changed: ${item.name}`);
}
await fs.writeFile(`${dir}/team-after.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(`${dir}/main-edited.pptx`);
function text(slide,name,value,x,y,w,h,size=14,bold=false,color='#64748B',alignment='left'){
 const sh=slide.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=value;
 sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,insets:0,verticalAlignment:'top',lineSpacing:1.15,wrap:'square',autoFit:'none'};return sh;
}
const ui=Presentation.create({slideSize:{width:1280,height:720}});
const specs=[
 {title:'分包队伍 · 系统界面展示',agent:'05',subtitle:'人员、资质与履约信息集中可查',path:`${root}/output/企业画像页面_脱敏版v2.png`,page:13,
  steps:[['人员与资质','集中查看准入、参保与特种作业人员，\n以及企业资质类别和有效期。'],['履约与违章','汇总施工项目、施工评价与违章扣分，\n辅助查看队伍履约和风险情况。'],['人员流动','查看流入流出与借入借出情况，\n辅助掌握队伍人员变化。']],
  callout:['队伍状态集中可查','人员、资质与履约信息同屏呈现，\n辅助项目部选队伍、查风险。']},
 {title:'电子档案 · 档案文件',agent:'06',subtitle:'按目录查看应交资料、缺项与办理状态',path:`${root}/.ppt-build/v6/example-1.png`,page:15,
  steps:[['目录组织','按项目阶段与材料类型查看目录，\n定位需要提交的档案资料。'],['缺项提示','对照必传清单查看未上传与缺份数量，\n结合提交情况发现缺件。'],['审查与归档','查看文件版本、审查情况与归档状态，\n跟踪资料办理进度。']],
  callout:['从清册定位到待办','目录、缺项和状态集中呈现，\n便于项目部按清单补齐资料。']},
 {title:'电子档案 · 共用信息',agent:'06',subtitle:'项目基础信息与专业分项保持对应',path:`${root}/.ppt-build/v6/example-2.png`,page:16,
  steps:[['项目基础信息','集中展示项目编号、名称与建设单位，\n明确资料所属项目。'],['专业分项匹配','查看线路、电缆、变电等专业分项，\n关联对应子项目与匹配电压。'],['来源与待确认','查看信息来源和待确认变更，\n辅助核对项目与专业分项的对应关系。']],
  callout:['项目与档案保持对应','为资料目录、归集与交付，\n提供统一的项目信息依据。']},
];
for(let index=0;index<specs.length;index++){
 const cfg=specs[index],slide=ui.slides.add();slide.background.fill='#FFFFFF';
 text(slide,'界面页眉',`03 ／ 场景智能体 · ${cfg.agent} · 界面展示`,60,60,1160,17,14);
 slide.shapes.add({name:'页眉分隔线',geometry:'rect',position:{left:60,top:87,width:1160,height:1},fill:'#D8E0EA',line:{fill:'none',width:0}});
 text(slide,'界面主标题',cfg.title,60,108,850,44,36,true,'#1C2A38');
 text(slide,'界面副标题',cfg.subtitle,846,127,374,25,17,false,'#64748B','right');
 const bytes=await fs.readFile(cfg.path),w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20),scale=Math.min(828/w,469/h),pw=w*scale,ph=h*scale;
 slide.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:cfg.title,fit:'contain',position:{left:60+(828-pw)/2,top:178,width:pw,height:ph}});
 cfg.steps.forEach(([heading,body],i)=>{
  const y=198+i*112,badge=slide.shapes.add({name:`界面编号${i+1}`,geometry:'roundRect',position:{left:918,top:y,width:40,height:40},fill:'#0F3B63',line:{fill:'none',width:0},borderRadius:9});
  badge.text=String(i+1).padStart(2,'0');badge.text.style={typeface:'微软雅黑',fontSize:17,bold:true,color:'#FFFFFF',alignment:'center',verticalAlignment:'middle',insets:0,lineSpacing:1};
  text(slide,`界面说明标题${i+1}`,heading,974,y,246,24,18,true,'#1C2A38');
  text(slide,`界面说明正文${i+1}`,body,974,y+26,246,74,14);
 });
 slide.shapes.add({name:'界面结果底色',geometry:'roundRect',position:{left:918,top:520,width:302,height:120},fill:'#FBEBD2',line:{fill:'none',width:0},borderRadius:16});
 text(slide,'界面结果标题',cfg.callout[0],940,534,258,28,18,true,'#E8A33D');
 text(slide,'界面结果正文',cfg.callout[1],940,563,258,62,14,false,'#7A5A22');
 text(slide,'界面页码',`${String(cfg.page).padStart(2,'0')} ／ 18`,1164,673,56,17,14,false,'#94A3B8');
 await fs.writeFile(`${dir}/interface-${index+1}.png`,new Uint8Array(await (await ui.export({slide,format:'png',scale:1.5})).arrayBuffer()));
}
await (await PresentationFile.exportPptx(ui)).save(`${dir}/interface-pages.pptx`);
console.log('Optimized agent 05 without altering its logic and authored three static interface pages with concise explanations.');
