$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$deck=$null
try{
 $deck=$app.Presentations.Open((Join-Path (Get-Location) 'output/AI新能源设施建设场景方案v14.pptx'),-1,0,0)
 if($deck.Slides.Count -ne 19){throw 'Expected 19 slides'}
 $dir=Join-Path (Get-Location) '.ppt-build/v14/native-render'
 New-Item -ItemType Directory -Path $dir -Force | Out-Null
 $deck.Export($dir,'PNG',1280,720)
 $deck.Slides.Item(4).Export((Join-Path (Get-Location) 'output/逸视角_智能物联运行管理_预览.png'),'PNG',1920,1080)
 [ordered]@{SlideCount=$deck.Slides.Count;NewPage=4;StaticNewPage=($deck.Slides.Item(4).TimeLine.MainSequence.Count -eq 0);PowerPointVersion=$app.Version} | ConvertTo-Json
}finally{if($null -ne $deck){$deck.Close()};if($app.Presentations.Count -eq 0){$app.Quit()};[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)}
