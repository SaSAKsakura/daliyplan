$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$presentation=$null
$show=$null
try {
 $presentation=$app.Presentations.Open((Join-Path (Get-Location) '.ppt-build\v5\candidate.pptx'),-1,0,-1)
 $settings=$presentation.SlideShowSettings
 $settings.RangeType=2;$settings.StartingSlide=10;$settings.EndingSlide=10;$settings.ShowType=2
 $show=$settings.Run()
 Start-Sleep -Milliseconds 500
 $before=$show.View.GetClickIndex()
 $count=$show.View.GetClickCount()
 $beforeSlide=$show.View.Slide.SlideIndex
 if($count -ne 1){throw "Expected one animation click; got $count"}
 $show.View.Next()
 Start-Sleep -Milliseconds 1200
 $after=$show.View.GetClickIndex()
 $afterSlide=$show.View.Slide.SlideIndex
 if($before -ne 0 -or $after -ne 1 -or $beforeSlide -ne 10 -or $afterSlide -ne 10){throw "Unexpected playback state: $before/$after; slide $beforeSlide/$afterSlide"}
 $result=@{PowerPointVersion=$app.Version;AnimationClickCount=$count;BeforeClickIndex=$before;AfterClickIndex=$after;BeforeSlide=$beforeSlide;AfterSlide=$afterSlide;PlaybackPassed=$true}
 $result | ConvertTo-Json | Set-Content -LiteralPath '.ppt-build\v5\playback-check.json' -Encoding utf8
 $result | ConvertTo-Json
} finally {
 if($null -ne $show){try{$show.View.Exit()}catch{}}
 if($null -ne $presentation){$presentation.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
