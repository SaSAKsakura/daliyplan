$ErrorActionPreference = 'Stop'
$buildDir = Join-Path (Get-Location) '.ppt-build\v5'
$app = New-Object -ComObject PowerPoint.Application
$presentation = $null
try {
    $presentation = $app.Presentations.Open((Join-Path $buildDir 'pre-animation.pptx'),0,0,0)
    $slide = $presentation.Slides.Item(10)
    $initialNames = @('初始描述标题','初始描述一','初始描述二','初始描述三','初始描述场景')
    $imageShape = $null
    for ($i=1; $i -le $slide.Shapes.Count; $i++) {
        $shape = $slide.Shapes.Item($i)
        if ($shape.Type -eq 13) { $imageShape = $shape }
    }
    if ($null -eq $imageShape) { throw 'Missing dashboard image' }
    $sequence = $slide.TimeLine.MainSequence
    while ($sequence.Count -gt 0) { $sequence.Item(1).Delete() }
    $effectInfo = @()
    for ($i=0; $i -lt $initialNames.Count; $i++) {
        $trigger = if ($i -eq 0) { 1 } else { 2 }
        $effect = $sequence.AddEffect($slide.Shapes.Item($initialNames[$i]),10,0,$trigger)
        $effect.Exit = -1
        $effect.Timing.Duration = 0.30
        $effectInfo += @{Type=$effect.EffectType;Exit=$effect.Exit;Trigger=$effect.Timing.TriggerType;Duration=$effect.Timing.Duration;Target=$effect.Shape.Name}
    }
    $boardNames = @('看板展示标题',$imageShape.Name)
    for ($i=0; $i -lt $boardNames.Count; $i++) {
        $trigger = if ($i -eq 0) { 3 } else { 2 }
        $effect = $sequence.AddEffect($slide.Shapes.Item($boardNames[$i]),10,0,$trigger)
        $effect.Timing.Duration = 0.60
        $effect.Timing.TriggerDelayTime = 0.05
        $effectInfo += @{Type=$effect.EffectType;Exit=$effect.Exit;Trigger=$effect.Timing.TriggerType;Duration=$effect.Timing.Duration;Target=$effect.Shape.Name}
    }
    $presentation.SaveAs((Join-Path $buildDir 'native-animated.pptx'),24)
    $verification = @{
        PowerPointVersion=$app.Version
        EffectCount=$sequence.Count
        Effects=$effectInfo
    }
    $verification | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $buildDir 'native-animation-check.json') -Encoding utf8
    $verification | ConvertTo-Json -Depth 4
} finally {
    if ($null -ne $presentation) { $presentation.Close() }
    if ($app.Presentations.Count -eq 0) { $app.Quit() }
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
