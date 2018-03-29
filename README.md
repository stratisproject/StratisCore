# Stratis Core

__Warning: we're currently in beta, so use at your own risk.__  
This is the repository of the Stratis Core Wallet, a full node staking wallet using Electron and Angular at the front-end and .NET Core with C# in the back-end.

# Building and running the Stratis Core daemon

The Stratis Core daemon is the backend REST service, hosting a Stratis node upon which FullNode UI depends.  
The Stratis Core daemon is hosted in another repository. All information on building and running the daemon can be found [here](https://github.com/stratisproject/StratisBitcoinFullNode/blob/master/Documentation/getting-started.md).

# Building and running the Stratis Core user interface

## Install NodeJS

Download and install the latest Long Term Support (LTS) version of NodeJS at: https://nodejs.org/. 

## Getting Started

Clone this repository locally:

``` bash
git clone https://www.github.com/stratisproject/FullNodeUI
```

Navigate to the FullNodeUI folder in a terminal:
``` bash
cd ./FullNodeUI/FullNodeUI.UI
```

## Install dependencies with npm:

From within the FullNodeUI.UI directory run:

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
|`npm run package:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run package:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

**The application is optimised. Only the files of /dist folder are included in the executable.**
