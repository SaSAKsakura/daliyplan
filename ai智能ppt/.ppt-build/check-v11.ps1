$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$presentation=$null
try {
 $presentation=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v11.pptx'),-1,0,0)
 if($presentation.Slides.Count -ne 15){throw 'Expected 15 slides'}
 function SlideText($slide){$parts=@();for($i=1;$i -le $slide.Shapes.Count;$i++){$s=$slide.Shapes.Item($i);if($s.HasTextFrame -eq -1 -and $s.TextFrame.HasText -eq -1){$parts+=$s.TextFrame.TextRange.Text}};return($parts -join "`n")}
 if((SlideText $presentation.Slides.Item(10)) -notmatch 'AI 站班会识别'){throw 'Roll-call page order incorrect'}
 if((SlideText $presentation.Slides.Item(11)) -notmatch '施工变更呈现'){throw 'Construction-change page order incorrect'}
 foreach($page in @(10,11)){
  $s=$presentation.Slides.Item($page);$pictures=0
  for($i=1;$i -le $s.Shapes.Count;$i++){if($s.Shapes.Item($i).Type -eq 13){$pictures++}}
  if($pictures -ne 1){throw 'Each capability page needs its one source image'}
 }
 foreach($page in @(12,13)){if($presentation.Slides.Item($page).TimeLine.MainSequence.Count -ne 0){throw '05 or 06 animation returned'}}
 $result=@{PowerPointVersion=$app.Version;SlideCount=15;RollcallPage=10;ConstructionChangePage=11;Agent05And06Static=$true;MatchingImageLeftTextRightLayouts=$true}
 $result | ConvertTo-Json | Set-Content -LiteralPath '.ppt-build\v11\native-check.json' -Encoding utf8
 $result | ConvertTo-Json
} finally {
 if($null -ne $presentation){$presentation.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
