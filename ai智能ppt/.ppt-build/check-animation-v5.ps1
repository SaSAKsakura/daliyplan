$ErrorActionPreference = 'Stop'
$app = New-Object -ComObject PowerPoint.Application
$presentation = $null
try {
    $presentation = $app.Presentations.Open((Join-Path (Get-Location) '.ppt-build\v5\candidate.pptx'),-1,0,0)
    $slide = $presentation.Slides.Item(10)
    $sequence = $slide.TimeLine.MainSequence
    if ($sequence.Count -ne 2) { throw "Expected 2 entrance effects; got $($sequence.Count)" }
    $info = @()
    for ($i=1; $i -le $sequence.Count; $i++) {
        $effect=$sequence.Item($i)
        $expectedTrigger=if($i -eq 1){1}else{2}
        if ($effect.EffectType -ne 10 -or $effect.Exit -ne 0 -or $effect.Timing.TriggerType -ne $expectedTrigger) { throw 'Unexpected effect type or trigger.' }
        $info+=@{Index=$i;Type=$effect.EffectType;Exit=$effect.Exit;Trigger=$effect.Timing.TriggerType;Duration=$effect.Timing.Duration;Target=$effect.Shape.Name}
    }
    $result=@{PowerPointVersion=$app.Version;SlideCount=$presentation.Slides.Count;Effects=$info;OpenedWithoutRepair=$true}
    $result | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath '.ppt-build\v5\native-animation-check.json' -Encoding utf8
    $result | ConvertTo-Json -Depth 4
} finally {
    if ($null -ne $presentation) { $presentation.Close() }
    if ($app.Presentations.Count -eq 0) { $app.Quit() }
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
