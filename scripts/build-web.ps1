$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
  & npx expo export --platform web --clear
  if ($LASTEXITCODE -ne 0) {
    throw "Expo web export failed with exit code $LASTEXITCODE."
  }

  $routes = @(
    @{ Path = '/'; File = 'dist/index.html'; Required = @('<!DOCTYPE html>', '<html', '<head', '<body', '<div id="root">') },
    @{ Path = '/auth/login'; File = 'dist/auth/login.html'; Required = @('Aurashape', 'Email', 'Password'); SubmitText = 'Log In' },
    @{ Path = '/auth/signup'; File = 'dist/auth/signup.html'; Required = @('Create Account', 'Email', 'Password'); SubmitText = 'Sign Up' }
  )

  foreach ($route in $routes) {
    $filePath = Join-Path $projectRoot $route.File
    if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
      throw "Static HTML for $($route.Path) was not generated: $($route.File)"
    }

    $html = Get-Content -LiteralPath $filePath -Raw

    if ($route.Path -eq '/') {
      foreach ($required in $route.Required) {
        if ($html -notmatch [regex]::Escape($required)) {
          throw "Generated HTML shell for $($route.Path) is missing: $required"
        }
      }
    } else {
      $bodyMatch = [regex]::Match($html, '<body[^>]*>(?<content>.*?)</body>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
      if (-not $bodyMatch.Success) {
        throw "Static HTML for $($route.Path) is missing a body."
      }

      $visibleBody = [regex]::Replace($bodyMatch.Groups['content'].Value, '<(script|style)\b[^>]*>.*?</\1>', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
      if ($visibleBody -notmatch '<input\b') {
        throw "Static HTML for $($route.Path) is missing visible form controls."
      }
      if ($visibleBody -notmatch [regex]::Escape('tabindex="0"')) {
        throw "Static HTML for $($route.Path) is missing a focusable submit control."
      }
      if ($visibleBody -notmatch [regex]::Escape($route.SubmitText)) {
        throw "Static HTML for $($route.Path) is missing the expected submit text: $($route.SubmitText)"
      }

      foreach ($required in $route.Required) {
        if ($visibleBody -notmatch [regex]::Escape($required)) {
          throw "Static HTML for $($route.Path) is missing visible content: $required"
        }
      }
    }

    Write-Host "PASS $($route.Path): $($route.File) contains generated HTML content."
  }
}
finally {
  Pop-Location
}
