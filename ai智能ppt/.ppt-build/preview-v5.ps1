$ErrorActionPreference = 'Stop'
$app = New-Object -ComObject PowerPoint.Application
$presentation=$null
$show=$null
try {
    $presentation=$app.Presentations.Open((Join-Path (Get-Location) '.ppt-build\v5\candidate.pptx'),-1,0,-1)
    $settings=$presentation.SlideShowSettings
    $settings.RangeType=2
    $settings.StartingSlide=10
    $settings.EndingSlide=10
    $settings.ShowType=2
    $show=$settings.Run()
    Write-Output 'Animation preview running on slide 10.'
    $deadline=(Get-Date).AddSeconds(150)
    while ((Get-Date) -lt $deadline -and -not (Test-Path -LiteralPath '.ppt-build\v5\preview-finish.flag')) { Start-Sleep -Milliseconds 250 }
} finally {
    if ($null -ne $show) { try { $show.View.Exit() } catch {} }
    if ($null -ne $presentation) { $presentation.Close() }
    if ($app.Presentations.Count -eq 0) { $app.Quit() }
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
