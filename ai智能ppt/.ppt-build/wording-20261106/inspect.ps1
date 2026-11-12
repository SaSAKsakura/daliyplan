$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$p=$null
try{
$p=$app.Presentations.Open((Join-Path (Get-Location) 'output\AI新能源设施建设场景方案v16.pptx'),-1,0,0)
$slides=@()
for($i=1;$i -le $p.Slides.Count;$i++){
$s=$p.Slides.Item($i);$texts=@()
for($j=1;$j -le $s.Shapes.Count;$j++){$sh=$s.Shapes.Item($j);if($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1){$texts+=@{Name=$sh.Name;Text=$sh.TextFrame.TextRange.Text;Left=$sh.Left;Top=$sh.Top;Width=$sh.Width;Height=$sh.Height;FontSize=$sh.TextFrame.TextRange.Font.Size}}}
$slides+=@{Page=$i;Texts=$texts}
}
$slides | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath '.ppt-build\wording-20261106\source-native.json' -Encoding UTF8
$slides | ForEach-Object { [string]$_.Page + ': ' + (($_.Texts | ForEach-Object {$_.Text}) -join ' / ') }
}finally{if($null -ne $p){$p.Close()};if($app.Presentations.Count -eq 0){$app.Quit()}}
