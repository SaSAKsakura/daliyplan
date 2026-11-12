$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$presentation=$null
try {
 $presentation=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v9.pptx'),-1,0,0)
 if($presentation.Slides.Count -ne 14){throw 'Expected 14 slides'}
 function SlideText($slide){
  $parts=@();for($i=1;$i -le $slide.Shapes.Count;$i++){$sh=$slide.Shapes.Item($i);if($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1){$parts+=$sh.TextFrame.TextRange.Text}}
  return ($parts -join "`n")
 }
 $safety=SlideText $presentation.Slides.Item(9)
 $special=SlideText $presentation.Slides.Item(10)
 if($safety -notmatch '可引入施工变更呈现子智能体'){throw 'Missing child-agent introduction'}
 if($special -notmatch '专项能力 · 施工变更呈现' -or $special -match '智能体'){throw 'Incorrect specialist-page positioning or title'}
 if($presentation.Slides.Item(11).TimeLine.MainSequence.Count -ne 2){throw 'Team-page animation changed'}
 if($presentation.Slides.Item(12).TimeLine.MainSequence.Count -ne 6){throw 'Archive-page animation changed'}
 $result=@{PowerPointVersion=$app.Version;SlideCount=14;SafetyPage=9;SpecialistCapabilityPage=10;TeamPage=11;ArchivePage=12;SubAgentIntroductionPresent=$true;PreviousAnimationsPreserved=$true}
 $result | ConvertTo-Json | Set-Content -LiteralPath '.ppt-build\v9\native-order-check.json' -Encoding utf8
 $result | ConvertTo-Json
} finally {
 if($null -ne $presentation){$presentation.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
