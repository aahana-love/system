# Installs dependencies OUTSIDE OneDrive and links them into app\node_modules.
#
# Why: this folder lives on a OneDrive-synced Desktop. A normal `npm install`
# would put ~30k files into OneDrive and upload them. npm also deletes a
# junction it finds at node_modules, so installs run in a cache folder and the
# app sees them through a junction that npm never touches.
#
# Usage (from the app folder):
#   powershell -File tools\install-deps.ps1                 # install from package.json
#   powershell -File tools\install-deps.ps1 -Add zod        # add a dependency
#   powershell -File tools\install-deps.ps1 -Add vitest -Dev
param(
  [string[]]$Add = @(),
  [switch]$Dev
)
$ErrorActionPreference = 'Stop'
$app = Split-Path -Parent $PSScriptRoot
$deps = Join-Path $env:USERPROFILE '.cache\study-plan-deps'
New-Item -ItemType Directory -Force $deps | Out-Null

Copy-Item (Join-Path $app 'package.json') $deps -Force
if (Test-Path (Join-Path $app 'package-lock.json')) { Copy-Item (Join-Path $app 'package-lock.json') $deps -Force }

Push-Location $deps
try {
  if ($Add.Count -gt 0) {
    $flags = @('install', '--save-exact')
    if ($Dev) { $flags += '-D' }
    & npm @flags @Add
  } else {
    & npm install
  }
  if ($LASTEXITCODE -ne 0) { throw "npm failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }

# npm may have changed package.json (when adding) and the lockfile.
Copy-Item (Join-Path $deps 'package.json') $app -Force
Copy-Item (Join-Path $deps 'package-lock.json') $app -Force

$link = Join-Path $app 'node_modules'
$item = Get-Item $link -Force -ErrorAction SilentlyContinue
if ($item -and -not ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
  throw "app\node_modules is a real folder. Move it out of OneDrive before linking."
}
if (-not $item) { cmd /c mklink /J "$link" "$(Join-Path $deps 'node_modules')" | Out-Null }
Write-Host "Dependencies ready in $deps (linked at app\node_modules)."
