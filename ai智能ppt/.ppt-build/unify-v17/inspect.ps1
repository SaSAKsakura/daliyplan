$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$p=$null
try {
$p=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v16.pptx'),-1,0,0)
$slides=@()
for($i=1;$i -le $p.Slides.Count;$i++) {
$s=$p.Slides.Item($i);$shapes=@()
for($j=1;$j -le $s.Shapes.Count;$j++) {$sh=$s.Shapes.Item($j);$tx='';if($sh.HasTextFrame -eq -1){$tx=$sh.TextFrame.TextRange.Text};$shapes+=@{Name=$sh.Name;Type=$sh.Type;Text=$tx;Left=$sh.Left;Top=$sh.Top;Width=$sh.Width;Height=$sh.Height;FontSize=$(if($sh.HasTextFrame -eq -1){$sh.TextFrame.TextRange.Font.Size}else{0})}}
$slides+=@{Page=$i;Shapes=$shapes}
$s.Export((Join-Path (Get-Location) ".ppt-build\unify-v17\before-$i.png"),'PNG',1280,720)
}
$slides | ConvertTo-Json -Depth 8 | Set-Content '.ppt-build\unify-v17\source.json' -Encoding utf8
$slides | ForEach-Object { [string]$_.Page + ': ' + (($_.Shapes | Where-Object Text | ForEach-Object {$_.Text}) -join ' / ') }
} finally {if($p){$p.Close()};if($app.Presentations.Count -eq 0){$app.Quit()}}
