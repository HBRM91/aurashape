$ErrorActionPreference = 'Stop'
$distDir = Join-Path $PSScriptRoot '..' 'dist'

if (-not (Test-Path -LiteralPath $distDir -PathType Container)) {
  Write-Error "dist/ directory not found. Run 'npm run build:web' first."
  exit 1
}

$htmlFiles = Get-ChildItem -LiteralPath $distDir -Recurse -Filter '*.html'
if ($htmlFiles.Count -eq 0) {
  Write-Error "No HTML files found in dist/"
  exit 1
}

Write-Host "PASS: $($htmlFiles.Count) HTML files found in dist/"
exit 0
