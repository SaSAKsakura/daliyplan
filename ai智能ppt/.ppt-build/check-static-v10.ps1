$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$main=$null;$demo=$null
try {
 $main=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v10.pptx'),-1,0,0)
 if($main.Slides.Count -ne 14){throw 'Wrong main slide count'}
 foreach($n in @(11,12)){
  $slide=$main.Slides.Item($n)
  if($slide.TimeLine.MainSequence.Count -ne 0){throw "Animations remain on main page $n"}
  for($i=1;$i -le $slide.Shapes.Count;$i++){if($slide.Shapes.Item($i).Type -eq 13){throw "Interface screenshot remains on main page $n"}}
 }
 $demo=$app.Presentations.Open((Join-Path (Get-Location) 'output\系统界面展示v1.pptx'),-1,0,0)
 if($demo.Slides.Count -ne 3){throw 'Wrong demo slide count'}
 for($n=1;$n -le 3;$n++){
  $slide=$demo.Slides.Item($n);$pictures=0
  if($slide.TimeLine.MainSequence.Count -ne 0){throw 'Unexpected demo animation'}
  for($i=1;$i -le $slide.Shapes.Count;$i++){if($slide.Shapes.Item($i).Type -eq 13){$pictures++}}
  if($pictures -ne 1){throw 'Expected one system screenshot per demo page'}
 }
 $result=@{PowerPointVersion=$app.Version;MainSlideCount=14;Agent05AnimationCount=0;Agent06AnimationCount=0;SeparateInterfaceSlideCount=3;ScreenshotsShownSeparately=$true}
 $result | ConvertTo-Json | Set-Content -LiteralPath '.ppt-build\v10\native-static-check.json' -Encoding utf8
 $result | ConvertTo-Json
} finally {
 if($null -ne $demo){$demo.Close()};if($null -ne $main){$main.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
