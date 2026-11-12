$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$presentation=$null
try {
 $presentation=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v13.pptx'),-1,0,0)
 if($presentation.Slides.Count -ne 18){throw 'Expected 18 slides'}
 $spec=Get-Content -LiteralPath '.ppt-build\v13\alignment-spec.json' -Raw -Encoding UTF8 | ConvertFrom-Json
 foreach($h in $spec.headers){
  $s=$presentation.Slides.Item([int]$h.page);$found=$false
  for($i=1;$i -le $s.Shapes.Count;$i++){
   $sh=$s.Shapes.Item($i)
   if($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1 -and $sh.TextFrame.TextRange.Text -eq $h.title){
    $found=$true
    if([Math]::Abs($sh.Left-45) -gt 0.1 -or [Math]::Abs($sh.Top-81) -gt 0.1 -or [Math]::Abs($sh.Width-570) -gt 0.1 -or [Math]::Abs($sh.Height-33) -gt 0.1 -or [Math]::Abs($sh.TextFrame.TextRange.Font.Size-27) -gt 0.1){throw "Inconsistent title geometry at page $($h.page)"}
   }
  }
  if(-not $found){throw "Missing title at page $($h.page)"}
 }
 foreach($n in @(10,11,12,13,14,15,16)){
  if($presentation.Slides.Item($n).TimeLine.MainSequence.Count -ne 0){throw "Unexpected animation at page $n"}
 }
 $result=@{PowerPointVersion=$app.Version;SlideCount=18;UniformTitlePages='10-17';TitlesNativeVerified=$true;AllInterfacePagesStatic=$true;ReadOnly=$true}
 $result | ConvertTo-Json | Set-Content -LiteralPath '.ppt-build\v13\native-check.json' -Encoding utf8
 $result | ConvertTo-Json
} finally {
 if($null -ne $presentation){$presentation.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
