$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
  & npx expo export --platform web --clear
  if ($LASTEXITCODE -ne 0) {
    throw "Expo web export failed with exit code $LASTEXITCODE."
  }

  $routes = @(
    @{ Path = '/'; File = 'dist/index.html'; Required = @('<!DOCTYPE html>', '<html', '<head', '<body', '<div id="root">'); VisibleRequired = @('Your health, shaped by science.', 'Food', 'Fasting', 'Workouts', 'Community', 'Privacy is part of the product.') },
     @{ Path = '/auth/login'; File = 'dist/auth/login.html'; Required = @('Welcome back', 'Email', 'Password', 'Aurashape health illustration'); SubmitText = 'Log In' },
     @{ Path = '/auth/signup'; File = 'dist/auth/signup.html'; Required = @('Start your journey', 'Email', 'Password', 'Aurashape health illustration'); SubmitText = 'Sign Up' },
     @{ Path = '/auth/forgot-password'; File = 'dist/auth/forgot-password.html'; Required = @('Reset your password', 'Email', 'Aurashape health illustration'); SubmitText = 'Send Reset Link' }
  )

  foreach ($route in $routes) {
    $filePath = Join-Path $projectRoot $route.File
    if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
      throw "Static HTML for $($route.Path) was not generated: $($route.File)"
    }

    $html = Get-Content -LiteralPath $filePath -Raw
    $bodyMatch = [regex]::Match($html, '<body[^>]*>(?<content>.*?)</body>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $bodyMatch.Success) {
      throw "Static HTML for $($route.Path) is missing a body."
    }

    $visibleBody = [regex]::Replace($bodyMatch.Groups['content'].Value, '<(script|style)\b[^>]*>.*?</\1>', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)

    if ($route.Path -eq '/') {
      foreach ($required in $route.Required) {
        if ($html -notmatch [regex]::Escape($required)) {
          throw "Generated HTML shell for $($route.Path) is missing: $required"
        }
      }
      foreach ($required in $route.VisibleRequired) {
        if ($visibleBody -notmatch [regex]::Escape($required)) {
          throw "Generated HTML shell for $($route.Path) is missing visible content: $required"
        }
      }
    } else {
      if ($visibleBody -notmatch '<input\b') {
        throw "Static HTML for $($route.Path) is missing visible form controls."
      }
      if ($visibleBody -notmatch [regex]::Escape('tabindex="0"')) {
        throw "Static HTML for $($route.Path) is missing a focusable submit control."
      }
      if ($visibleBody -notmatch [regex]::Escape($route.SubmitText)) {
        throw "Static HTML for $($route.Path) is missing the expected submit text: $($route.SubmitText)"
      }
      if ($visibleBody -notmatch '<img\b[^>]*auth-health') {
        throw "Static HTML for $($route.Path) is missing the auth-health image reference."
      }

      foreach ($required in $route.Required) {
        if ($visibleBody -notmatch [regex]::Escape($required)) {
          throw "Static HTML for $($route.Path) is missing visible content: $required"
        }
      }
    }

    Write-Host "PASS $($route.Path): $($route.File) contains generated HTML content."
  }

  $landingAssetDirectory = Join-Path $projectRoot 'dist/assets/assets/images'
  foreach ($assetName in @('hero-health', 'feature-food', 'feature-fasting', 'feature-workout', 'feature-community', 'auth-health')) {
    $extension = if ($assetName -eq 'auth-health') { 'png' } else { 'svg' }
    $asset = Get-ChildItem -LiteralPath $landingAssetDirectory -Filter "$assetName.*.$extension" -ErrorAction SilentlyContinue
    if (-not $asset) {
      throw "Landing asset was not generated: $assetName.$extension"
    }
    Write-Host "PASS /: generated local asset $($asset.Name)."
  }
}
finally {
  Pop-Location
}
