$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$presentation=$null
$show=$null
try {
 $presentation=$app.Presentations.Open((Join-Path (Get-Location) '.ppt-build\v6\candidate.pptx'),-1,0,-1)
 if($presentation.Slides.Count -ne 13){throw 'Slide count changed'}
 if($presentation.Slides.Item(10).TimeLine.MainSequence.Count -ne 2){throw 'Previous team animation changed'}
 $sequence=$presentation.Slides.Item(11).TimeLine.MainSequence
 if($sequence.Count -ne 6){throw "Expected 6 coordinated entrance effects; got $($sequence.Count)"}
 $effects=@()
 for($i=1;$i -le 6;$i++){
  $e=$sequence.Item($i);$expected=if($i -eq 1 -or $i -eq 4){1}else{2}
  if($e.EffectType -ne 10 -or $e.Exit -ne 0 -or $e.Timing.TriggerType -ne $expected){throw "Incorrect animation at $i"}
  $effects+=@{Index=$i;Trigger=$e.Timing.TriggerType;Target=$e.Shape.Name;Duration=$e.Timing.Duration}
 }
 $settings=$presentation.SlideShowSettings
 $settings.RangeType=2;$settings.StartingSlide=11;$settings.EndingSlide=11;$settings.ShowType=2
 $show=$settings.Run()
 Start-Sleep -Milliseconds 300
 $count=$show.View.GetClickCount()
 if($count -ne 2){throw "Expected 2 clicks; got $count"}
 $states=@($show.View.GetClickIndex())
 for($i=1;$i -le 2;$i++){
  $show.View.Next();Start-Sleep -Milliseconds 900
  $index=$show.View.GetClickIndex();$states+= $index
  if($index -ne $i -or $show.View.Slide.SlideIndex -ne 11){throw 'Incorrect playback progression'}
 }
 $result=@{PowerPointVersion=$app.Version;PreviousPageAnimationPreserved=$true;AnimationClickCount=$count;PlaybackStates=$states;Effects=$effects;PlaybackPassed=$true}
 $result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath '.ppt-build\v6\playback-check.json' -Encoding utf8
 $result | ConvertTo-Json -Depth 5
} finally {
 if($null -ne $show){try{$show.View.Exit()}catch{}}
 if($null -ne $presentation){$presentation.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
