from pathlib import Path
src=Path(r'D:/myq/xwechat_files/wxid_729ptvhcxl0q21_f83a/temp/RWTemp/2026-11/5948aa2afc61f2400322a6770799d646/AI辅助规划分部分项-POC.html').read_text('utf8')
src=src.replace('AI 辅助规划分部分项 · 储能电站 EPC · POC','AI 分部分项规划工作台').replace('POC · AI 辅助规划分部分项 · 储能电站 EPC','分部分项规划').replace('罗熙 · 项目总工（×× 100MW/200MWh 储能电站 EPC）','项目负责人 A').replace('重置演示','重置').replace('×× 100MW/200MWh 储能电站','某储能示范项目').replace('PRJ-ESS1','PRJ-DEMO-ESS').replace('AI 辅助规划分部分项</h1>','AI 分部分项规划工作台</h1>')
src=src.replace('从项目规划阶段拆解结构：先出候选、带依据、人工采纳；AI 不写基线、不自动发布','按阶段生成分部、分项与作业颗粒，查看依据后确认采纳')
src=src.replace("running:false, stepIdx:0, generated:false,","running:false, stepIdx:0, generated:true,")
src=src.replace('12 台 PCS 舱 × 单舱基础 27 m³，含筏板与电缆沟预埋','按同类项目与本项目 PCS 舱规模估算，包含筏板与电缆沟预埋，工程量须结合设计复核')
css='''
<style id="deck-style">
:root{--erow-primary:#2563eb;--erow-navy:#123b61;--erow-border:#dce4ef;--erow-muted:#64748b;--erow-surface:#fff;--erow-bg:#f4f7fb}
body{font-size:14px;color:#1c2a38;background:var(--erow-bg)}
.top{height:50px;background:white;color:var(--erow-navy);border-bottom:1px solid var(--erow-border);padding:0 20px;gap:14px}
.brand{font-size:14px;white-space:nowrap}.brand span{display:none}.who{color:var(--erow-muted);font-size:12px}
nav{gap:5px;margin-left:16px}nav button{color:#64748b;font-size:13px;border-radius:4px}nav button.on{background:#eaf1ff;color:var(--erow-primary)}
#btnReset{background:white;border-color:var(--erow-border);color:var(--erow-muted);height:30px;font-size:12px}
main{max-width:none;padding:17px 20px 20px}.page-h{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 16px}.page-h h1{font-size:22px;width:100%;line-height:1.35}.page-h .desc{font-size:13px;color:#64748b}.page-h>.chip{font-size:12px}.page-h .spacer{min-width:10px}
.g3{grid-template-columns:266px minmax(0,1fr) 382px;gap:14px}.pane{border-color:var(--erow-border);border-radius:8px}.pane-h{font-size:15px;height:44px;padding:12px 14px;background:white;border-bottom-color:var(--erow-border)}.pane-h .mini{font-size:11px}.pane-b,.pane-b.tall{max-height:calc(100vh - 187px);padding:14px;overflow:auto;scrollbar-width:thin;scrollbar-color:#cad5e4 transparent}
#v-ai>.g3>.pane:nth-child(3)>.pane-h{color:#7257d9}
label.f{font-size:12px;margin:12px 0 6px}input[type=text],input[type=number],select,textarea{font-size:13px;border-radius:4px;border-color:var(--erow-border);min-height:32px}textarea{height:105px}.ph{gap:6px}.ph button{font-size:13px;padding:7px 9px;border-radius:5px}.ph button.on{border-color:#2563eb;color:#123b61;background:#edf4ff}.ph button span.n{font-size:11px}
.row{padding:7px 8px;gap:8px;border-radius:5px}.row.sel{background:#edf4ff;border-color:#bcd1fa}.row.l2{margin-left:20px}.nm{font-size:14px}.tg{width:20px;height:20px;font-size:11px;border-radius:5px}.tgS{background:#123b61}.tgI{background:#7257d9}.conf{font-size:11px;line-height:18px}.input-check{width:16px;height:16px;accent-color:#2563eb}.basis b{font-size:10px;line-height:17px}.items{gap:4px;margin:3px 0 8px 29px}.items .it{font-size:11px;line-height:19px}.items .it .pos{color:#ba7926}
.banner{font-size:12px;border-color:#d6e4fb;background:#f1f6ff;color:#355b84;padding:10px 12px}.tiny{font-size:11px}.muted{color:#8291a9}.basis-card{background:#f8faff;border-color:var(--erow-border);padding:12px}.basis-card .bh{font-size:12px}.basis-card .bt{font-size:14px;line-height:1.6}.basis-card .bd{font-size:13px;line-height:1.75}.kv{font-size:13px;grid-template-columns:84px 1fr;gap:7px 8px}.card{border-color:var(--erow-border);border-radius:6px}.card h3{font-size:14px!important}.card h3 .mini{font-size:11px}table.dt{font-size:12px}table.dt th{background:#eff5fd}table.dt td{padding:10px 8px}
.btn{font-size:13px;min-height:32px;border-radius:4px}.btn.sm{font-size:12px;min-height:29px}.btn.pri{background:#2563eb;border-color:#2563eb}.btn.pri:hover{background:#1d4ed8}.btn:focus-visible,.ph button:focus-visible,.row:focus-visible{outline:2px solid #8bb3ff;outline-offset:2px}.row .ops{max-width:26%}.card .btn{white-space:nowrap}
@media(max-width:1300px){.g3{grid-template-columns:235px minmax(0,1fr) 310px;gap:10px}main{padding:14px 12px}.pane-b,.pane-b.tall{padding:10px}.brand{font-size:13px}nav{margin-left:4px}nav button{font-size:12px;padding:5px 7px}.items .it{font-size:10.8px}.row{gap:5px}.nm{font-size:13px}.who{display:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
</style>
'''
src=src.replace('</head>',css+'</head>')
Path('output/分部分项_AI规划工作台.html').write_text(src,'utf8')
print('Adapted supplied prototype to deck UI style; preserved candidate, basis, and adoption workflows.')
