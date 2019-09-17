$StratisCoreDir = Resolve-Path "./../"
$Arg = "electron-builder build --macos --x64 --config ./electron-builder.json"
if ( Test-Path -Path $StratisCoreDir\StratisCore.UI\app-builds )
{
  Remove-Item $StratisCoreDir\StratisCore.UI\app-builds -Force -Recurse
}
if ( Test-Path -Path $StratisCoreDir\StratisCore.UI\daemon )
{
  Remove-Item $StratisCoreDir\StratisCore.UI\daemon -Force -Recurse
}
Set-Location $StratisCoreDir\StratisBitcoinFullNode\src
Start-Process dotnet -ArgumentList "clean" -Wait
Set-Location .\Stratis.StratisD
Start-Process dotnet -ArgumentList "publish -r osx-x64 -o $StratisCoreDir\StratisCore.UI\daemon" -Wait
Set-Location $StratisCoreDir\StratisCore.UI
Start-Process npm -ArgumentList "install" -Wait
Start-Process npm -ArgumentList "install npx" -Wait
Start-Process npm -ArgumentList "run build:prod" -Wait
Start-Process "npx" -ArgumentList $Arg -Wait
