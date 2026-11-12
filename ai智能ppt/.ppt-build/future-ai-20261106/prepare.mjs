import fs from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=`${root}/.ppt-build/future-ai-20261106`;
await fs.mkdir(dir,{recursive:true});
const source='D:/myq/xwechat_files/wxid_729ptvhcxl0q21_f83a/msg/file/2026-11/分部分项协同管理界面设计V2-AI沟通与任务(1).html';
const html=await fs.readFile(source,'utf8');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1760,height:960},deviceScaleFactor:1.5});
 await page.setContent(html,{waitUntil:'load'});
 await page.evaluate(()=>{
  const screen=document.querySelector('#s2 .screen').cloneNode(true);
  const board=document.querySelector('#s3 .kb').cloneNode(true);
  const css=document.querySelector('style').textContent;
  document.body.innerHTML='';
  const wrapper=document.createElement('div');wrapper.id='future-ui';wrapper.appendChild(screen);document.body.appendChild(wrapper);
  const st=document.createElement('style');st.textContent=css+`
  body{background:#f3f6fa;padding:24px;font-family:'Microsoft YaHei',sans-serif}
  #future-ui{width:1712px;margin:0 auto}.screen{margin:0;border-radius:10px;box-shadow:none}
  .scr-title{height:46px}.u-frame{height:802px}.u-side{flex-basis:140px}.u-tree{flex-basis:290px}
  .u-chat{flex-basis:460px;width:460px}.u-top{height:50px}.u-main{min-width:0}
  .ui{font-size:14px}.tn{padding-top:9px;padding-bottom:9px;font-size:14px}.u-tree .th{padding:18px 16px;font-size:13px}
  .d-head{padding:20px 18px 0}.d-meta h4{font-size:17px}.tabs{font-size:14px}.tabs span{padding:16px 10px}
  .d-body{padding:18px}.kb{gap:12px;height:100%}.kb-col{min-width:0}.kh{font-size:15px;padding-bottom:12px}
  .tcard{padding:16px 12px;margin-bottom:14px}.tt{font-size:14px;line-height:1.65}.tm{font-size:12px;flex-wrap:wrap}.src{font-size:11px;flex-wrap:wrap;line-height:1.7}
  .ch-head .t{font-size:15px}.ch-head .s{font-size:12px}.ch-body{padding:12px 14px}.msg{max-width:100%}
  .who{font-size:12px}.bub{font-size:13px;line-height:1.75}.draft{padding:13px;margin:8px 0}.draft .dt{font-size:15px}.dk{font-size:12px}.why{font-size:11px;line-height:1.7}.btn{font-size:12px}
  .u-search{flex-basis:300px}.u-side .it{padding:12px;font-size:13px}.ch-input{padding:12px 14px}
  .ch-head .mem{display:none}.ch-head{padding:12px 16px}.ch-body{padding-top:8px}.msg{margin-bottom:9px}.draft{padding:10px}.why{line-height:1.45}.refcard{margin-top:6px}
  .future-note{padding:12px 18px;background:#eef4fb;border-top:1px solid #d8e1ed;color:#1d4f91;font-size:13px}
  `;document.head.innerHTML='';document.head.appendChild(st);
  screen.querySelector('.scr-title').innerHTML='<b>分部分项 AI 协同工作台</b><span class="role pm">未来方案示意</span><span class="goal">数据与流程均为演示，不代表已上线能力</span>';
  const body=screen.querySelector('.u-detail .d-body');body.removeAttribute('style');body.replaceChildren(board);
  screen.querySelectorAll('.tabs span').forEach(x=>{if(x.textContent.includes('工作任务'))x.classList.add('on')});
  const replacements=[['滨江综合体项目','某新能源示范项目'],['综合楼建设','新能源设施建设'],['单位工程·主体','单位工程·储能区'],['地基与基础','储能基础'],['现场踏勘','基础验收'],['地形测绘','定位放线'],['土方开挖','基础施工'],['主体结构','设备安装'],['王建国','项目经理'],['张三丰','技术负责人'],['周队长','施工负责人'],['赵四','机具管理员'],['罗熙','项目协调员'],['边坡挂网喷浆材料进场确认','储能基础材料进场确认'],['协调喷浆施工队进场（支护作业面）','协调基础施工队进场'],['补充踏勘报告签认归档','补充基础验收记录签认'],['基坑东侧补充踏勘','储能基础补充验收'],['东侧边坡挂网喷浆施工','储能柜基础施工'],['土方外运车辆通行证办理','吊装机具进场手续办理'],['支护作业','基础作业'],['TC-2026-1103-001','YS-DEMO-001'],['TC-…-001','YS-DEMO-001'],['11-06（周四）','11-10'],['11-07（周五）','11-11'],['周四前','11月10日前'],['周五前','11月11日前']];
  const walker=document.createTreeWalker(screen,NodeFilter.SHOW_TEXT);let n;const nodes=[];while(n=walker.nextNode())nodes.push(n);
  for(const n of nodes){for(const [a,b]of replacements)n.textContent=n.textContent.replaceAll(a,b)}
  const msgs=screen.querySelectorAll('.ch-body>.msg');
  msgs[0].querySelector('.bub').innerHTML='储能基础作业面已具备条件，<u>@施工负责人</u> 请在11月10日前组织队伍进场，并补齐进场确认。';
  msgs[1].querySelector('.bub').innerHTML='基础验收记录还缺一处签认，<u>11月11日前</u>补齐，关联验收单已引用。';
  screen.querySelectorAll('.draft .why')[0].textContent='依据：项目经理 10:32 原文；推荐理由：基础作业职责匹配、存在可用工时。日期为演示值。';
  screen.querySelectorAll('.draft .why')[1].textContent='依据：技术负责人 10:35 原文；关联验收单 YS-DEMO-001，待人工核对签认要求。';
  screen.querySelectorAll('.draft .dh').forEach(x=>{const cf=x.querySelector('.cf');if(cf)cf.textContent='待人工确认'});
  screen.querySelectorAll('.kb .tag').forEach(x=>{if(x.textContent.includes('置信'))x.textContent='待确认'});
  const cols=screen.querySelectorAll('.kb-col');
  cols[0].querySelectorAll('.tcard')[1].remove();
  const first=cols[0].querySelector('.tcard');first.querySelector('.tt').innerHTML='协调基础施工队进场 <span class="tag ai">AI 草稿</span>';first.querySelector('.due').textContent='11-10';
  const second=cols[1].querySelector('.tcard');cols[0].appendChild(second);second.style.borderStyle='dashed';second.style.borderColor='var(--ai-line)';second.querySelector('.tt').innerHTML='补充基础验收记录签认 <span class="tag ai">AI 草稿</span>';second.querySelector('.due').textContent='11-11';second.querySelector('.src').textContent='依据：会话 10:35 · 待采纳';
  cols[1].querySelector('.kh span').textContent='1';
  screen.querySelector('.tabs span.on em').textContent='4';
  screen.querySelector('.refcard b').textContent='基础验收单 YS-DEMO-002';screen.querySelector('.refcard span').textContent='储能基础验收记录 · 待签认 · 点击查看';
  const draft2=screen.querySelectorAll('.draft')[1];draft2.innerHTML=draft2.innerHTML.replaceAll('YS-DEMO-001','YS-DEMO-002');
  first.querySelector('.src').textContent='依据：会话 10:32 · 待采纳';
  const note=document.createElement('div');note.className='future-note';note.textContent='拟接入原则：会话、任务与单据绑定同一节点；草稿确认后派发；计划调整走审批；节点进度依据既定计量规则更新。';screen.appendChild(note);
 });
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('#future-ui').screenshot({path:`${dir}/interface.png`});
 await fs.writeFile(`${dir}/future-ui.html`,await page.content());
 console.log('Rendered future interface from the supplied HTML; original styles reused and scenario labels adapted.');
}finally{await browser.close()}
