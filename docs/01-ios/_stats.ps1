$base = "C:\Users\admin\.openclaw\workspace\ios-interview-content-restructured"
$files = Get-ChildItem -Path $base -Recurse -File
$totalFiles = $files.Count
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum
$dirs = Get-ChildItem -Path $base -Recurse -Directory | Where-Object { $_.Name -notmatch '^00_' }

Write-Output "=== Total ==="
Write-Output "Files: $totalFiles"
Write-Output "Size: $([math]::Round($totalSize/1MB, 2)) MB"
Write-Output "Dirs: $($dirs.Count)"
Write-Output ""
Write-Output "=== By Module ==="
$dirs | Sort-Object Name | ForEach-Object {
    $modFiles = (Get-ChildItem $_.FullName -File).Count
    $modSize = ((Get-ChildItem $_.FullName -File) | Measure-Object -Property Length -Sum).Sum
    Write-Output "$($_.Name): $modFiles files, $([math]::Round($modSize/1KB,1)) KB"
}
