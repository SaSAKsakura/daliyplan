$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$source=Join-Path $root 'output\AI新能源设施建设场景方案v16.pptx'
$target=Join-Path $root 'output\AI新能源设施建设场景方案v17.pptx'
if(Test-Path -LiteralPath $target){throw 'Output already exists'}
$changes=Get-Content -LiteralPath '.ppt-build\wording-20261106\changes.json' -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
$app=New-Object -ComObject PowerPoint.Application
$pres=$null;$check=$null
function Snapshot($p){
 $result=@()
 for($n=1;$n -le $p.Slides.Count;$n++){
  $s=$p.Slides.Item($n);$shapes=@()
  for($j=1;$j -le $s.Shapes.Count;$j++){
   $sh=$s.Shapes.Item($j);$tx=''
   if($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1){$tx=$sh.TextFrame.TextRange.Text}
   $shapes+=@{Name=$sh.Name;Type=$sh.Type;Text=$tx;Left=[double]$sh.Left;Top=[double]$sh.Top;Width=[double]$sh.Width;Height=[double]$sh.Height}
  }
  $result+=@{Page=$n;Shapes=$shapes;Animations=$s.TimeLine.MainSequence.Count}
 }
 return ,$result
}
try {
 $sourceHash=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
 $pres=$app.Presentations.Open($source,-1,0,0)
 $before=Snapshot $pres
 $s=$pres.Slides.Item(5)
 foreach($key in $changes.Keys){$s.Shapes.Item([string]$key).TextFrame.TextRange.Text=[string]$changes[$key]}
 $pres.SaveCopyAs($target,24)
 $pres.Saved=-1
 $pres.Close();$pres=$null
 $check=$app.Presentations.Open($target,-1,0,0)
 $after=Snapshot $check
 if($after.Count -ne $before.Count){throw 'Slide count changed'}
 for($n=0;$n -lt $before.Count;$n++){
  if($before[$n].Shapes.Count -ne $after[$n].Shapes.Count){throw 'Shape count changed'}
  for($j=0;$j -lt $before[$n].Shapes.Count;$j++){
   $old=$before[$n].Shapes[$j];$new=$after[$n].Shapes[$j]
   $expected=$old.Text
   if($n -eq 4 -and $changes.ContainsKey($old.Name)){$expected=[string]$changes[$old.Name]}
   if($new.Text -ne $expected){throw "Unexpected text change: page $($n+1), $($old.Name)"}
   foreach($prop in @('Left','Top','Width','Height')){if([Math]::Abs($old[$prop]-$new[$prop]) -gt 0.1){throw "Geometry changed: $prop"}}
  }
 }
 if((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $sourceHash){throw 'Source was modified'}
 @{SlideCount=$after.Count;EditedPage=5;Output=$target;TextChanges=$changes;OtherTextAndGeometryPreserved=$true;SourceUnchanged=$true} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath '.ppt-build\wording-20261106\native-validation.json' -Encoding UTF8
 Write-Output 'Saved v17; reopened in PowerPoint and verified all 21 pages. Only five intended text fields changed.'
}finally{
 if($null -ne $check){$check.Close()}
 if($null -ne $pres){$pres.Saved=-1;$pres.Close()}
 if($app.Presentations.Count -eq 0){$app.Quit()}
 [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
