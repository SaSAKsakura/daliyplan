import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const dir=`${root}/.ppt-build/v3`;
process.on('uncaughtException',error=>{console.error(error.message);console.error(error.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v2.pptx`));
const s=p.slides.items[9];
const keep=new Set(['矩形 10','文本框 11','矩形 12','文本框 13','文本框 14','圆角矩形 35','文本框 36','文本框 37','文本框 38']);
const layout=JSON.parse(await (await s.export({format:'layout'})).text());
p.delete(layout.elements.filter(x=>!keep.has(x.name)).map(x=>x.id));
function text(name,value,x,y,w,h,size=17,bold=false,color='#1C2A38'){
 const item=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 item.text=value.split('\n').map(line=>({runs:[{run:line,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}));
 item.text.style={typeface:'微软雅黑',fontSize:size,bold,color,lineSpacing:1.4,insets:0,verticalAlignment:'top',alignment:'left'};
 return item;
}
function update(name,value,pos,size,color,bold=false){
 const sh=s.shapes.items.find(x=>x.name===name);
 sh.text=value;
 sh.position=pos;
 sh.text.style={typeface:'微软雅黑',fontSize:size,color,bold,insets:0,verticalAlignment:'middle',alignment:'left',lineSpacing:1};
}
update('文本框 14','以队伍画像支撑准入、派单与履约评价',{left:850,top:127,width:370,height:25},17,'#64748B');
text('画像数据标题','六类数据，汇成队伍画像',60,181,660,30,22,true,'#0F3B63');
const values=[
 ['画像维度','接入的数据','主要用途'],
 ['综合评价','总分、分项得分、排名','辅助排序'],
 ['企业资质','资质类别、等级、有效期','准入筛选'],
 ['人员储备','准入、参保、特种作业、核心人员','人岗匹配'],
 ['工程业绩','项目类型、数量、施工评价','履约推荐'],
 ['违章记录','一般与严重违章、扣分、检查来源','风险分级'],
 ['人员流动','流入流出、借入借出、工种分布','流动核验'],
];
const table=s.tables.add({rows:7,columns:3,left:60,top:220,width:660,height:308,columnWidths:[108,410,142],values});
table.styleOptions={headerRow:true,bandedRows:false};
table.borders.assign({style:'solid',fill:'#D8E0EA',width:0.75});
for(let r=0;r<7;r++){
 table.rows[r].height=r===0?32:46;
 for(let c=0;c<3;c++){
  const cell=table.getCell(r,c);
  cell.fill=r===0?'#0F3B63':(r%2===1?'#F4F7FA':'#FFFFFF');
  cell.text.style={typeface:'微软雅黑',fontSize:r===0?17:16.5,color:r===0?'#FFFFFF':(c===0?'#0F3B63':'#1C2A38'),bold:r===0||c===0,alignment:'left',verticalAlignment:'middle',lineSpacing:1.15,insets:{left:12,right:8,top:6,bottom:6}};
 }
}
text('数据关联说明','以企业／班组为主档，关联人员、项目、证书与评价记录',60,538,660,22,14,false,'#64748B');
const groups=[
 ['派单看匹配','先核资质与持证条件，结合项目类型与施工评价推荐。\n再按工序需求、排班和现场占用确定可派队伍。',184],
 ['证件到期先知','关联企业资质、人员证件与入场教育有效期。\n到期前提醒，过期或缺项触发准入校验。',306],
 ['履约有画像','归集施工评价、违章扣分与人员流动记录。\n分级提示风险，支撑复派、评优与结算审核。',428],
];
for(const [title,body,y] of groups){
 text(`场景-${title}`,title,760,y,460,25,20,true,'#0F3B63');
 text(`正文-${title}`,body,760,y+34,460,72,17);
}
update('文本框 36','证件过期 0 起    关键工序一次匹配率 ≥90%',{left:80,top:581,width:720,height:26},20,'#E8A33D',true);
update('文本框 37','试点目标',{left:1100,top:584,width:100,height:21},14,'#FFFFFF');
s.speakerNotes.text=[s.speakerNotes.text||'', '数据维度参考：用户提供的企业画像页面截图。综合评价、企业资质、人员储备、工程业绩、违章记录、人员流动对应截图已有信息维度。', '人员储备与人员流动不能直接代表实时可派人数；派单需结合工序要求、排班、在岗状态和项目占用。证件、入场教育及班组层级关联需根据实际业务数据配置。', '页面展示建议应用逻辑；底部指标保留为试点目标。'].filter(Boolean).join('\n');
await fs.writeFile(`${dir}/after.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${dir}/after-layout.json`,await (await s.export({format:'layout'})).text());
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Updated slide 10 with six data dimensions and three application scenarios.');
