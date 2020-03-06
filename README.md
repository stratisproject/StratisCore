| Windows | Mac OS | Linux
| :---- | :------ | :---- |
| [![Build Status](https://dev.azure.com/StratisProject/StratisCore/_apis/build/status/Hosted%20Windows%20Container)](https://dev.azure.com/StratisProject/StratisCore/_build/latest?definitionId=16) | [![Build Status](https://dev.azure.com/StratisProject/StratisCore/_apis/build/status/Hosted%20macOS)](https://dev.azure.com/StratisProject/StratisCore/_build/latest?definitionId=18) | [![Build Status](https://dev.azure.com/StratisProject/StratisCore/_apis/build/status/Hosted%20Ubuntu%201604)](https://dev.azure.com/StratisProject/StratisCore/_build/latest?definitionId=17)

# Stratis Core

This is the repository of the Stratis Core Wallet, a full node staking wallet using Electron and Angular at the front-end and .NET Core with C# in the back-end.

# Building and running the Stratis Core daemon

The Stratis Core daemon is the backend REST service, hosting a Stratis node upon which Stratis Core depends.  
The Stratis Core daemon is hosted in another repository. All information on building and running the daemon can be found [here](https://github.com/stratisproject/StratisBitcoinFullNode/blob/master/Documentation/getting-started.md).

# Building and running the Stratis Core user interface

## Install NodeJS

Download and install the latest Long Term Support (LTS) version of NodeJS at: https://nodejs.org/. 

## Getting Started

Clone this repository locally:

``` bash
git clone https://www.github.com/stratisproject/StratisCore
```

Navigate to the StratisCore.UI folder in a terminal:
``` bash
cd ./StratisCore/StratisCore.UI
```

## Install dependencies with npm:

From within the StratisCore.UI directory run:

``` bash
npm install
```

## Run the UI in development mode

#### Terminal Window 1
[Run the daemon](https://github.com/stratisproject/StratisBitcoinFullNode/blob/master/Documentation/getting-started.md)  

#### Terminal Window 2
Use `npm run mainnet` to start the UI in mainnet mode or `npm run testnet` to start the UI in testnet mode.  
This will compile the Angular code and spawn the Electron process.

## Build the UI for production

|Command|Description|
|--|--|
|`npm run build:prod`| Compiles the application for production. Output files can be found in the dist folder |
|`npm run package:linux`| Builds your application and creates an app consumable on linux system |
|`npm run package:linuxarm`| Builds your application and creates an app consumable on linux-arm system (i.e., Raspberry Pi) |
|`npm run package:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run package:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

**When packaging StratisCore, StratisBitcoinFullNode daemon needs to be independently run. Otherwise, you may publish the project to StratisCore.UI/daemon so that the StratisD daemon is self-contained in the package. This is done by running the `dotnet publish` command within StratisCore/StratisBitcoinFullNode/src/Stratis.StratisD:**

```bash
dotnet publish --runtime <RUNTIME_IDENTIFIER> --self-contained -output <OUTPUT_DIR>`
```
Example commands to package StratisCore for Linux environment:
```bash
cd /home/user/StratisCore/StratisBitcoinFullNode/src/Stratis.StratisD
dotnet publish --runtime linux-x64 --self-contained -output /home/user//StratisCore/StratisCore.UI/daemon
cd /home/user/StratisCore/StratisCore.UI
npm run package:linux
```

*Refer to the RID Catalog for selecting the correct RUNTIME_IDENTIFIER for your target operating system: https://docs.microsoft.com/en-us/dotnet/core/rid-catalog

**The application is optimised. Only the files of /dist and /daemon (daemon folder is present if StratisD is published) folders are included in the executable. Distributable packages can be found in the StratisCore.UI/app-builds/ folder**

## CI Build
-----------

Every time someone pushes to the master branch or create a pull request on it, a build is triggered and a new unstable app release is created.

If you want the :sparkles: latest :sparkles: (unstable :bomb:) version of the Breeze app, you can get it here: 

https://github.com/stratisproject/StratisCore/releases/tag/Continuous-Delivery

