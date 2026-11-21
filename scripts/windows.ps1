param(
    [switch]$Run,
    [switch]$Release
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$buildRoot = Join-Path $env:TEMP 'timer202611-windows-build'
$profile = if ($Release) { 'release' } else { 'debug' }
$outputRoot = Join-Path $projectRoot 'windows-app'

# WSL のソースは正本として維持し、コンパイルは Windows のローカルディスクで行う。
New-Item -ItemType Directory -Force -Path "$buildRoot\src-tauri\src", "$buildRoot\src-tauri\icons", "$buildRoot\dist" | Out-Null
Copy-Item "$projectRoot\timer.html" "$buildRoot\dist\index.html" -Force
foreach ($name in @('Cargo.toml', 'Cargo.lock', 'build.rs', 'tauri.conf.json')) {
    Copy-Item "$projectRoot\src-tauri\$name" "$buildRoot\src-tauri\$name" -Force
}
Copy-Item "$projectRoot\src-tauri\src\*" "$buildRoot\src-tauri\src" -Force
Copy-Item "$projectRoot\src-tauri\icons\*" "$buildRoot\src-tauri\icons" -Force

Push-Location $buildRoot
try {
    $buildArguments = @('build', '--manifest-path', 'src-tauri/Cargo.toml', '--locked', '--features', 'custom-protocol')
    if ($Release) { $buildArguments += '--release' }
    & cargo @buildArguments
    if ($LASTEXITCODE -ne 0) { throw 'Windows build failed.' }
} finally {
    Pop-Location
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
Copy-Item "$buildRoot\src-tauri\target\$profile\focus-timer.exe" "$outputRoot\focus-timer.exe" -Force
Write-Output "Built ($profile): $outputRoot\focus-timer.exe"
if ($Run) {
    # 実行時も Windows ローカルの exe を使用する。
    Start-Process -FilePath "$buildRoot\src-tauri\target\$profile\focus-timer.exe" -WorkingDirectory $buildRoot
}
