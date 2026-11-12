import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {PresentationFile,FileBlob} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const build=path.join(root,'.ppt-build/interface-onepage-v3');
const skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
const source=path.join(root,'output/系统界面展示_单页样稿v2.pptx');
await fs.mkdir(build,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const s=p.slides.items[0];
const snap=await p.inspect({kind:'image,shape,textbox',maxChars:100000});
const records=snap.ndjson.split('\n').filter(Boolean).map(x=>JSON.parse(x));
const remove=records.filter(r=>r.id&&(r.kind==='image'&&r.position.left>=650||['shape','textbox'].includes(r.kind)&&r.name?.startsWith('示例')&&r.name!=='示例信息说明')).map(r=>r.id);
p.delete(remove);
const c={label:'#8F9AA6',value:'#263442',blue:'#5AAEFF',green:'#62C83D',red:'#FF525C'};
function txt(name,value,x,y,w,h=17,size=11,bold=false,color=c.value,fill='none'){
 const sh=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});
 sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,bold,color,insets:0,verticalAlignment:'top',lineSpacing:1.2,wrap:'square',autoFit:'none'};return sh;
}
function field(name,label,value,x,y,link=false){
 txt(name+'_字段',label,x,y,86,17,11,false,c.label);
 if(value)txt(name+'_内容',value,x+86,y,168,17,11,true,link?c.blue:c.value);
}
const lx=666;
const fields=[
 ['日志编号','AR000000655'],['项目账号','C09022024021JZ01'],
 ['项目名称','示例新能源建设项目'],['工作负责人','示例负责人'],
 ['作业单位','示例施工单位'],['项目地址','某新能源项目施工区域'],
 ['作业风险等级','四级'],['计划工作内容','电缆线路及配套施工'],
];
fields.forEach(([label,value],i)=>field('移动日志_'+label,label,value,lx,274+i*21));
txt('移动日志_管控状态','未管控',875,274,45,17,11,true,c.red);
txt('移动日志_专业','变电',666,447,38,18,11,true,c.blue,'#EFF7FF');
txt('移动日志_工作票','二票',716,447,38,18,11,true,c.blue,'#EFF7FF');
txt('移动日志_电压等级','交流330kV',766,447,99,18,11,true,c.blue,'#EFF7FF');
txt('移动日志_特殊作业','修剪树木、涉燃气电力施工',666,471,254,18,11,true,c.red);
txt('移动日志_文件','准备文件：0 / 0',666,495,150,18,11,true,c.blue);
txt('移动日志_入口','进入日志 >',852,495,68,18,11,true);
txt('移动日志_工序标题','工序内容',666,529,254,20,12.5,true);
txt('移动日志_工序清单','掏挖式杆洞开挖；法兰基础制作；\n钢管杆套筒压桩；基础拆除；\n灌注桩基础制作；现场浇筑基础；\n铁塔基础；承台基础制作；\n掏挖式杆洞开挖（采用机械方式）；\n基础拆除（采用机械方式）',666,553,254,81,11,true);
txt('移动日志_分配数量','数量 1',867,531,53,17,11,true,c.label);
txt('移动检查_标题','施工操作 · 施工中阶段',966,272,254,22,12.5,true);
const checkRows=[['三措检查','已完成 13:34',c.green],['施工内容','已完成 13:35',c.green],['质量取照','未完成',c.label]];
checkRows.forEach(([name,status,color],i)=>{
 txt('移动检查_'+name,name,966,309+i*35,108,19,11,true);
 txt('移动检查_'+name+'_状态',status,1080,309+i*35,140,19,11,true,color);
});
txt('移动整改_标题','整改信息',966,424,254,22,12.5,true);
field('移动整改_推送人','整改推送人','示例负责人',966,453);
field('移动整改_抄送人','整改抄送人','',966,477);
field('移动整改_截止','整改截至日期','',966,501);
field('移动整改_单据','整改单据编号','ZG00000682',966,525,true);
txt('工艺整改_标题','工艺标准整改信息',966,562,254,22,12.5,true);
field('工艺整改_要求','整改要求','按工艺标准整改（示例）',966,590);
field('工艺整改_截止','整改截止日期','2026/08/27',966,618);
const note=s.shapes.items.find(x=>x.name==='示例信息说明');
note.text='移动端界面按原截图重排，名称及描述为脱敏示例';
s.speakerNotes.text+='\n字体统一修订：移动端片段转换为可编辑文本，统一为微软雅黑，字段名与字段值均为11px，字段名浅灰，字段值加粗，区块标题12.5px。检查状态、时间、整改关联和工序清单按原截图保留；不补充空白业务字段。移动端为根据原截图重排的展示，不是新的系统截图。';
await fs.writeFile(path.join(build,'preview.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:2})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const link=fs.link.bind(fs);fs.link=async(a,b)=>{try{return await link(a,b)}catch(e){if(!['EPERM','ENOTSUP'].includes(e.code))throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL)}};
const finalPath=path.join(root,'output/系统界面展示_单页样稿v4.pptx');
await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:1,fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation-v4.json')});
const final=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.writeFile(path.join(root,'output/系统界面展示_单页样稿v4.png'),new Uint8Array(await (await final.export({slide:final.slides.items[0],format:'png',scale:2})).arrayBuffer()));
console.log('Unified mobile typography:',finalPath);

