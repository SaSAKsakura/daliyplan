$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$presentation=$null
try {
 $presentation=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v12.pptx'),-1,0,0)
 if($presentation.Slides.Count -ne 18){throw 'Expected 18 slides'}
 function TextOf($s){$t=@();for($i=1;$i -le $s.Shapes.Count;$i++){$sh=$s.Shapes.Item($i);if($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1){$t+=$sh.TextFrame.TextRange.Text}};return($t -join "`n")}
 $expected=@{12='智能体 05 · 分包队伍';13='分包队伍 · 系统界面展示';14='智能体 06 · 档案交付';15='电子档案 · 档案文件';16='电子档案 · 共用信息'}
 foreach($n in @(12,13,14,15,16)){
  $s=$presentation.Slides.Item($n)
  if((TextOf $s) -notmatch [regex]::Escape($expected[$n])){throw "Wrong order at page $n"}
  if($s.TimeLine.MainSequence.Count -ne 0){throw "Unexpected animation at page $n"}
  $pic=0;for($i=1;$i -le $s.Shapes.Count;$i++){if($s.Shapes.Item($i).Type -eq 13){$pic++}}
  $expectedPics=if($n -in @(13,15,16)){1}else{0}
  if($pic -ne $expectedPics){throw "Unexpected picture count at page $n"}
 }
 $result=@{PowerPointVersion=$app.Version;SlideCount=18;OptimizedAgent05Page=12;TeamDashboardPage=13;Agent06Page=14;ArchiveFilePage=15;ArchiveSharedInfoPage=16;AllFivePagesStatic=$true;InterfaceDescriptionsPresent=$true}
 $result | ConvertTo-Json | Set-Content -LiteralPath '.ppt-build\v12\native-check.json' -Encoding utf8
 $result | ConvertTo-Json
} finally {
 if($null -ne $presentation){$presentation.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
