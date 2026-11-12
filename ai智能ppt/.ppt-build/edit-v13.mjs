import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.on('uncaughtException',e=>{console.error(e.message);console.error(e.stack?.split('\n').slice(-3).join('\n'));process.exit(1);});
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/v13`;
await fs.mkdir(dir,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/output/AI新能源设施建设场景方案v12.pptx`));
function format(sh,value,pos,size,bold,color,alignment='left',verticalAlignment='top',wrap='none'){
 sh.text=[{runs:[{run:value,style:{typeface:'微软雅黑',fontSize:`${size}px`,bold,color}}],spaceBefore:0,spaceAfter:0}];
 sh.position=pos;sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,alignment,verticalAlignment,insets:0,lineSpacing:1,wrap,autoFit:'none'};
}
const headers=[];
for(let index=9;index<=16;index++){
 const slide=p.slides.items[index],layout=JSON.parse(await (await slide.export({format:'layout'})).text());
 const main=layout.elements.filter(e=>e.kind==='textbox'&&e.position.top>=100&&e.position.top<=115&&e.style.fontSize>=30);
 if(main.length!==1)throw Error(`Ambiguous main heading on page ${index+1}`);
 const heading=p.resolve(main[0].id);
 const title=index===10?'施工变更呈现：原图与现场对比':heading.text.toString();
 format(heading,title,{left:60,top:108,width:760,height:44},36,true,'#1C2A38','left','middle');
 const eyebrow=layout.elements.find(e=>e.kind==='textbox'&&e.position.top===60);
 if(eyebrow){const sh=p.resolve(eyebrow.id);format(sh,sh.text.toString(),{left:60,top:60,width:1160,height:20},14,false,'#64748B','left','middle');}
 const subtitle=layout.elements.find(e=>e.kind==='textbox'&&e.position.top>=120&&e.position.top<=130&&e.position.left>600&&e.style.fontSize<25);
 if(subtitle){const sh=p.resolve(subtitle.id);format(sh,sh.text.toString(),{left:846,top:120,width:374,height:36},17,false,'#64748B','right','middle');}
 headers.push({page:index+1,title,position:heading.position,fontSize:36});
}
const anonymous=await fs.readFile(`${root}/output/素材/站班会识别示例_头像打码.png`);
const roll=p.slides.items[9],image=roll.images.items[0],frame=image.frame,crop=image.crop;
image.replace({blob:new Uint8Array(anonymous),contentType:'image/png',alt:'AI站班会识别示例，全部可见人脸及头像已打码',fit:'contain'});image.frame=frame;image.crop=crop;
const comparisons=[];
for(const index of [9,10,12,14,15]){
 const slide=p.slides.items[index],photo=slide.images.items[0];
 photo.frame={...photo.frame,top:198};
 const bottom=photo.frame.top+photo.frame.height;
 const prefix=index===9||index===10?'专项':'界面';
 for(let i=1;i<=3;i++){
  const badge=slide.shapes.items.find(s=>s.name===`${prefix}编号${i}`);
  const title=slide.shapes.items.find(s=>s.name===(prefix==='专项'?`专项标题${i}`:`界面说明标题${i}`));
  const body=slide.shapes.items.find(s=>s.name===(prefix==='专项'?`专项正文${i}`:`界面说明正文${i}`));
  if(!badge||!title||!body)throw Error(`Missing right column on page ${index+1}`);
  const y=198+(i-1)*92;
  badge.position={left:918,top:y,width:40,height:40};
  format(title,title.text.toString(),{left:974,top:y,width:246,height:24},18,true,'#1C2A38');
  body.position={left:974,top:y+26,width:246,height:58};body.text.style={typeface:'微软雅黑',fontSize:14,color:'#64748B',insets:0,lineSpacing:1.15,verticalAlignment:'top',wrap:'square',autoFit:'none'};
 }
 const box=slide.shapes.items.find(s=>s.name===`${prefix}结果底色`);
 const title=slide.shapes.items.find(s=>s.name===`${prefix}结果标题`);
 const body=slide.shapes.items.find(s=>s.name===`${prefix}结果正文`);
 const top=bottom-112;
 box.position={left:918,top,width:302,height:112};
 format(title,title.text.toString(),{left:940,top:top+14,width:258,height:28},18,true,'#E8A33D');
 body.position={left:940,top:top+43,width:258,height:56};body.text.style={typeface:'微软雅黑',fontSize:14,color:'#7A5A22',insets:0,lineSpacing:1.15,verticalAlignment:'top',wrap:'square',autoFit:'none'};
 if(index===9||index===10){
  const caption=slide.shapes.items.find(s=>s.name===(index===9?'站班会图片说明':'施工变更图片说明'));
  format(caption,caption.text.toString(),{left:60,top:174,width:828,height:18},14,false,'#94A3B8');
 }
 if(index===10){
  const layout=JSON.parse(await (await slide.export({format:'layout'})).text());
  const border=layout.elements.find(e=>e.kind==='shape'&&e.geometry==='roundRect'&&e.position.left===60&&e.position.width===828);
  if(border)p.resolve(border.id).position={left:60,top:198,width:828,height:photo.frame.height};
 }
 comparisons.push({page:index+1,imageTop:photo.frame.top,imageBottom:bottom,rightTop:198,rightBottom:box.position.top+box.position.height});
}
for(const index of [9,10,11,12,13,14,15,16]){
 const slide=p.slides.items[index];
 await fs.writeFile(`${dir}/page-${index+1}.png`,new Uint8Array(await (await p.export({slide,format:'png',scale:1.5})).arrayBuffer()));
}
await fs.writeFile(`${dir}/alignment-spec.json`,JSON.stringify({headers,comparisons},null,2));
await (await PresentationFile.exportPptx(p)).save(`${dir}/edited-export.pptx`);
console.log('Unified main headings and image/text boundaries; replaced roll-call faces with mosaic-redacted asset.');
