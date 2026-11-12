import fs from 'node:fs/promises';
import { FileBlob, Presentation, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v10`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v2.pptx`));
const archive=p.slides.items[10];
const byName=name=>archive.shapes.items.find(x=>x.name===name);
// Match the user's reference: five horizontal stages and three text columns.
for(let i=0;i<5;i++){
 const x=60+i*235;
 byName(`圆角矩形 ${46+2*i}`).position={left:x,top:210,width:220,height:132};
 byName(`圆角矩形 ${46+2*i}`).borderRadius=8;
 const title=byName(`文本框 ${47+2*i}`);
 title.position={left:x+14,top:234,width:192,height:26};
 title.text.style={typeface:'微软雅黑',fontSize:16,bold:true,insets:0,verticalAlignment:'top',lineSpacing:1,wrap:'square',autoFit:'none'};
 const sub=byName(`文本框 ${65+i}`);
 sub.position={left:x+16,top:281,width:188,height:36};
 sub.text.style={typeface:'微软雅黑',fontSize:12,insets:0,verticalAlignment:'top',lineSpacing:1.2,wrap:'square',autoFit:'none'};
}
for(const [titleName,bodyName,x,width] of [['文本框 56','文本框 57',60,353],['文本框 58','文本框 59',453,353],['文本框 60','文本框 61',846,374]]){
 const title=byName(titleName),body=byName(bodyName);
 title.position={left:x,top:392,width,height:27};
 title.text.style={typeface:'微软雅黑',fontSize:20,bold:true,insets:0,verticalAlignment:'top',lineSpacing:1};
 body.position={left:x,top:444,width,height:82};
 body.text.style={typeface:'微软雅黑',fontSize:16,insets:0,verticalAlignment:'top',lineSpacing:1.4,wrap:'square',autoFit:'none'};
}
byName('圆角矩形 62').position={left:60,top:564,width:1160,height:59};
byName('文本框 63').position={left:87,top:581,width:380,height:29};
byName('文本框 64').position={left:533,top:588,width:550,height:20};
byName('文本框 70').text='12 ／ 14';
await fs.writeFile(`${dir}/archive-static.png`,new Uint8Array(await (await p.export({slide:archive,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(`${dir}/archive-edited.pptx`);
// A separate, static presentation shows the actual system screenshots.
const demo=Presentation.create({slideSize:{width:1280,height:720}});
const screenshots=[
 ['分包队伍 · 系统界面',`${root}/output/企业画像页面_脱敏版v2.png`],
 ['档案交付 · 档案文件',`${root}/.ppt-build/v6/example-1.png`],
 ['档案交付 · 共用信息',`${root}/.ppt-build/v6/example-2.png`],
];
for(let i=0;i<screenshots.length;i++){
 const [title,path]=screenshots[i],slide=demo.slides.add();slide.background.fill='#FFFFFF';
 const heading=slide.shapes.add({geometry:'textbox',name:'界面展示标题',position:{left:60,top:46,width:1160,height:48},fill:'none',line:{fill:'none',width:0}});
 heading.text=title;heading.text.style={typeface:'微软雅黑',fontSize:32,bold:true,color:'#1C2A38',insets:0,verticalAlignment:'top',lineSpacing:1};
 const bytes=await fs.readFile(path),w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20),scale=Math.min(1160/w,535/h),dw=w*scale,dh=h*scale;
 slide.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:title,fit:'contain',position:{left:60+(1160-dw)/2,top:135+(535-dh)/2,width:dw,height:dh}});
 const footer=slide.shapes.add({geometry:'textbox',name:'界面展示页码',position:{left:1140,top:690,width:80,height:17},fill:'none',line:{fill:'none',width:0}});
 footer.text=`${String(i+1).padStart(2,'0')} ／ 03`;footer.text.style={typeface:'微软雅黑',fontSize:12,color:'#94A3B8',insets:0,alignment:'right',lineSpacing:1};
 slide.speakerNotes.text='界面来源：用户提供的系统截图。';
 await fs.writeFile(`${dir}/demo-${i+1}.png`,new Uint8Array(await (await demo.export({slide,format:'png',scale:1})).arrayBuffer()));
}
await (await PresentationFile.exportPptx(demo)).save(`${dir}/demo-candidate.pptx`);
console.log('Prepared the requested static archive layout and a separate 3-slide system interface deck.');
