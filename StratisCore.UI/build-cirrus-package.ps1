Param(
  [Parameter(Mandatory = $false)][ValidateSet("true", "false")][string]$edge = "false"
)
$StratisCoreDir = Resolve-Path "./../"
$Arg = "electron-builder build --macos --x64 --config ./electron-sidechain-builder.json"
if (Test-Path -Path $StratisCoreDir\StratisCore.UI\app-builds)
{
  Remove-Item $StratisCoreDir\StratisCore.UI\app-builds -Force -Recurse
}
if (Test-Path -Path $StratisCoreDir\StratisCore.UI\daemon)
{
  Remove-Item $StratisCoreDir\StratisCore.UI\daemon -Force -Recurse
}
(Get-Content .\main.ts).Replace("const buildForSidechain = false;", "const buildForSidechain = true;") | Set-Content .\main.ts

if ($edge = "true")
{
  (Get-Content .\main.ts).Replace("const edge = false;", "const edge = true;") | Set-Content .\main.ts
}
if ($edge = "false")
{
  (Get-Content .\main.ts).Replace("const edge = true;", "const edge = false;") | Set-Content .\main.ts
}

Start-Process npm -ArgumentList "install" -Wait
Start-Process npm -ArgumentList "install npx" -Wait
Start-Process npm -ArgumentList "run build:prod" -Wait
Start-Process "npx" -ArgumentList $Arg -Wait
