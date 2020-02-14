#  This file should be kept in sync with the appveyor.yml file.
# If run successfully to completion, it will
# 1. install dotnet dependencies
# 2. build the dotnet daemon 
# 3. install node dependencies
# 4. build the electron app
# 5. start the app

$env:current_folder = $PSScriptRoot
$env:BUILD_FOLDER = $env:current_folder + "\.."

$env:win_runtime = "win-x86" # win-x64
$env:configuration = "Release" # Debug
$env:arch = "ia32" # x64
$env:plat = "win32"
$env:app_output_name = "app"

cd $env:BUILD_FOLDER
dir
Write-Host "Installing dependencies" -foregroundcolor "magenta"     
Write-Host "--> git submodule" -foregroundcolor "magenta"

git submodule update --init --recursive

Write-Host "--> npm install" -foregroundcolor "magenta"
cd $env:BUILD_FOLDER/StratisCore.UI
npm install --verbose

Write-Host "FINISHED restoring dotnet and npm packages" -foregroundcolor "magenta"
if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode) }

#---------------------------------#
#       build configuration       #
#---------------------------------#

Write-Host "*--------------------------------*" -foregroundcolor "magenta"
Write-Host "current environment variables:" -foregroundcolor "magenta"
Write-Host "Windows runtime: $env:win_runtime" -foregroundcolor "magenta"
Write-Host "Build directory: $env:BUILD_FOLDER" -foregroundcolor "magenta"
Write-Host "Configuration: $env:configuration" -foregroundcolor "magenta"
Write-Host "*--------------------------------*" -foregroundcolor "magenta"

if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode) }
    
Write-Host "running 'dotnet publish'" -foregroundcolor "magenta"
cd $env:BUILD_FOLDER/StratisBitcoinFullNode/src/Stratis.StratisD
dotnet publish -c $env:configuration -v m -r $env:win_runtime -o $env:BUILD_FOLDER\StratisCore.UI\daemon
if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }

Write-Host "Building and packaging StratisCore.UI" -foregroundcolor "magenta"
cd $env:BUILD_FOLDER/StratisCore.UI
npm run package:windows86
if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }     
Write-Host "[$env:configuration][$env:win_runtime] FINISHED StratisCore.UI packaging" -foregroundcolor "magenta"

dir
cd app-builds
# replace the spaces in the name with a dot as CI system have trouble handling spaces in names.
Dir *.exe | rename-item -newname {  $_.name  -replace " ","."  }
dir      
Write-Host "[$env:configuration][$env:win_runtime] Done! Your installer is:" -foregroundcolor "green"
Get-ChildItem -Path "*.exe" | foreach-object {$_.Fullname}
if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }
Read-Host "Press ENTER to exit"