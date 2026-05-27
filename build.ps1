# ──────────────────────────────────────────────────────────────
#  FamScript Builder
#  Edit any *.src.bak file, then run:  .\build.ps1
#  This re-encodes every source file and rewrites index.html.
# ──────────────────────────────────────────────────────────────

$base  = $PSScriptRoot
$html  = [System.IO.File]::ReadAllText("$base\index.html", [System.Text.Encoding]::UTF8)

# Order must match the order the scripts appear in index.html
$files = @('protection','utils','parser','validator','mermaidGenerator','importer','export','canvas','app')

# Find every inline eval(atob(...)) block in the current HTML
$pattern = "<script>eval\(atob\('([^']*)'\)\)</script>"
$matches  = [regex]::Matches($html, $pattern)

if ($matches.Count -ne $files.Count) {
    Write-Host "ERROR: expected $($files.Count) script blocks, found $($matches.Count)." -ForegroundColor Red
    Write-Host "       Make sure index.html has not been manually edited." -ForegroundColor Red
    exit 1
}

# Replace each block with the freshly-encoded source file
for ($i = 0; $i -lt $files.Count; $i++) {
    $src  = "$base\$($files[$i]).src.bak"
    if (-not (Test-Path $src)) {
        Write-Host "MISSING: $src" -ForegroundColor Red
        exit 1
    }
    $old  = $matches[$i].Value                                    # existing eval(atob('...')) tag
    $b64  = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($src))
    $new  = "<script>eval(atob('$b64'))</script>"
    $html = $html.Replace($old, $new)
    Write-Host "  encoded $($files[$i]).src.bak" -ForegroundColor DarkGray
}

[System.IO.File]::WriteAllText("$base\index.html", $html, [System.Text.Encoding]::UTF8)
$kb = [math]::Round((Get-Item "$base\index.html").Length / 1KB, 1)
Write-Host ""
Write-Host "Build complete - index.html ($kb KB)" -ForegroundColor Green
