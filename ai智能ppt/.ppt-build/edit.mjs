import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root = 'D:/工作文档/每月文档/正常工作/ai智能ppt';
const p = await PresentationFile.importPptx(await FileBlob.load(`${root}/AI新能源设施建设场景方案v0.pptx`));
const slide = p.resolve('sl/x8f69ofe');
function change(id,text,position,style={}) {
 const s=p.resolve(id);
 const old=s.text.toString();
 s.text.replace(old,text);
 if(position)s.position=position;
 s.text.style={fontFamily:'微软雅黑',...style};
}
const levels=[
 ['sh/cri9snup','sh/c36twr6x',70,207,450,'专业类型','土建工程、电气安装'],
 ['sh/2lgrmdcn','sh/dofu5wni',102,281,386,'作业部位','光伏区、储能区、升压站、充电区'],
 ['sh/5gfu1gfq','sh/q1obuhor',134,355,322,'作业颗粒','支架安装、储能柜就位、充电桩安装'],
 ['sh/jexcz6xk','sh/r2xc3m5c',166,429,258,'作业工序','定位放线、安装固定、接线检测'],
 ['sh/xcvuxgfu','sh/wzad8vm1',198,503,194,'标准风险点','高处坠落、物体打击'],
];
for (let [label,example,x,y,w,title,body] of levels) {
 change(label,title,{left:x+12,top:y+9,width:w-24,height:23},{fontSize:17,bold:true,alignment:'center'});
 change(example,body,{left:x+12,top:y+36,width:w-24,height:21},{fontSize:14,alignment:'center'});
}
change('sh/qp0rqxcz','按部位拆解作业，形成可复用的工序标准',{left:810,top:127,width:410,height:25},{fontSize:17,alignment:'right'});
change('sh/wbmtobe9','标准建库',null,{fontSize:20,bold:true});
change('sh/vadcv6xo','汇集企业工法、验收规程与历史项目经验。\n按专业、部位和作业颗粒逐级拆解，形成可复用的标准包。',{left:566,top:212,width:654,height:58},{fontSize:17});
change('sh/a94bm1w3','按部位生成任务',null,{fontSize:20,bold:true});
change('sh/98vutwfi','导入片区点位清单，按光伏、储能、升压站、充电设施匹配模板，\n自动生成项目 WBS、工序任务及应交资料清册。',{left:566,top:321,width:654,height:68},{fontSize:17});
change('sh/8nmtkrex','工序关联校核要求',null,{fontSize:20,bold:true});
change('sh/0rqt0bmt','每道工序关联工期、风险控制措施、验收要求及应留单据与影像，\n为计划编排、安全检查和档案交付提供统一依据。',{left:566,top:463,width:654,height:59},{fontSize:17});
await fs.writeFile(`${root}/.ppt-build/after.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile(`${root}/.ppt-build/after-layout.json`,await (await slide.export({format:'layout'})).text());
await (await PresentationFile.exportPptx(p)).save(`${root}/.ppt-build/edited-export.pptx`);
console.log('exported',p.slides.items.length);
