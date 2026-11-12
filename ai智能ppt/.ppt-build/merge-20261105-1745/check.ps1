$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$pres=$null
try {
 $root=(Get-Location).Path
 $pres=$app.Presentations.Open((Join-Path $root 'output\AI新能源设施建设场景方案v14_内容整合.pptx'),-1,0,0)
 if($pres.Slides.Count -ne 20){throw 'Expected 20 slides'}
 function TextOf($s){$t=@();for($i=1;$i -le $s.Shapes.Count;$i++){$sh=$s.Shapes.Item($i);if($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1){$t+=$sh.TextFrame.TextRange.Text}};return($t -join "`n")}
 $expected=@{4='我们的优势';10='智能体 04';11='标准任务贯通计划、日志与检查';12='AI 站班会识别';13='施工变更呈现';14='智能体 05';16='智能体 06'}
 foreach($n in $expected.Keys){if((TextOf $pres.Slides.Item([int]$n)) -notmatch [regex]::Escape($expected[$n])){throw "Wrong order at page $n"}}
 $s=$pres.Slides.Item(11);$tables=@();$pics=0
 for($i=1;$i -le $s.Shapes.Count;$i++){
  $sh=$s.Shapes.Item($i)
  if($sh.HasTable -eq -1){$tables+=@{Name=$sh.Name;Top=$sh.Top;Bottom=$sh.Top+$sh.Height;Rows=$sh.Table.Rows.Count;Columns=$sh.Table.Columns.Count}}
  if($sh.Type -eq 13){$pics++}
 }
 if($tables.Count -ne 2 -or $pics -ne 4){throw 'Interface content missing'}
 foreach($n in @(4,11,12,13,14,15,16,17,18)){if($pres.Slides.Item($n).TimeLine.MainSequence.Count -ne 0){throw "Unexpected animation at page $n"}}
 foreach($n in @(4,11)){$pres.Slides.Item($n).Export((Join-Path $root ".ppt-build\merge-20261105-1745\native-$n.png"),'PNG',1920,1080)}
 $result=@{SlideCount=20;AdvantagesPage=4;FoundationPage=11;NativeTables=$tables;InterfaceImages=$pics;Static=$true;ReadOnly=$true}
 $result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath '.ppt-build\merge-20261105-1745\native-check.json' -Encoding UTF8
 $result | ConvertTo-Json -Depth 6
} finally {
 if($null -ne $pres){$pres.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
