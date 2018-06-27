# Getting started with sidechain-compatible wallets

If you want to fund the sidechain, you must have each of the following running before you can begin depositing and withdrawing funds: 

1. A standard Stratis Full Node daemon to support a Stratis Core wallet.
2. A special version of the Stratis Core wallet with built-in sidechains functionality.
3. A Stratis Sidechain Node daemon to support an APEX Core wallet.
4. An APEX Core wallet.

The following sections expand on the steps to take to get each item from the above table up and running. If you only want to make transactions on the sidechain, you only need to set up items 3 and 4.

## First steps

Download a copy of [Microsoft Visual Studio](https://www.visualstudio.com/downloads/) if you don't have a copy already.

Next, make sure you have the latest .NET SDK installed. You can verify this by running ``dotnet --version`` on the command line. If you do not have the .NET SDK installed, download and install it from: https://www.microsoft.com/net/learn/get-started/windows#install.

## Running a Stratis Full Node daemon

1. Download or clone the master of this repository: https://github.com/stratisproject/StratisBitcoinFullNode.
2. Create a folder for your mainchain data.
3. Open a command-line prompt.
4. Navigate to the ``src/Stratis.StratisD`` subdirectory in your copy of the Full Node source directory.
5. Enter ``dotnet run -testnet -datadir=[FULL_PATH_TO_MAINCHAIN_DATA_FOLDER]`` to run the Full Node daemon.

More information on running a Full Node daemon is available [here](https://github.com/stratisproject/StratisBitcoinFullNode/blob/master/Documentation/getting-started.md).

## Running a Stratis Core wallet with built-in sidechains functionality

1. Download and install the latest Long-Term Support (LTS) version of NodeJS at: https://nodejs.org/.
2. Download or clone the *sidechains-ui* branch of this repository: http://github.com/stratisproject/fullnodeui.
3. Open a command-line prompt.
4. Navigate to the ``FullNodeUI\FullNode.UI`` subdirectory in your copy of the Full Node UI source directory.
5. Enter ``npm install`` to install the dependencies.
6. Make sure an instance of the Full Node daemon is running.
7. Enter ``npm run testnet`` to run the Stratis Core wallet.  

## Running a Stratis Sidechain Node daemon

1. Download or clone the master of this repository: https://github.com/stratisproject/FederatedSidechains.
2. Create a folder for your sidechain data.
3. Open a command-line prompt.
4. Navigate to the ``src/Stratis.SidechainD`` subdirectory in your copy of the Sidechain Node source directory.
5. Enter ``dotnet run -testnet -datadir=[FULL_PATH_TO_SIDECHAIN_DATA_FOLDER]`` to run the Sidechain Node aemon.

## Running an Apex Core wallet

` note `
    If you have just installed the sidechain-enabled Stratis Core, you can omit steps 1, 2, and 5.

1. Download and install the latest Long-Term Support (LTS) version of NodeJS at: https://nodejs.org/.
2. Download or clone the *sidechains-ui* branch of this repository: http://github.com/stratisproject/fullnodeui.
3. Open a command-line prompt.
4. Navigate to the ``FullNodeUI\FullNode.UI`` subdirectory in your copy of the Full Node UI source directory.
5. Enter ``npm install`` to install the dependencies.
6. Make sure an instance of the Sidechain Node daemon is running.
7. Enter ``npm run testnet:sidechain`` to run the Apex Core wallet.  
 



## More information on Stratis Sidechain Project available on the [Stratis Academy](https://academy.stratisplatform.com/Sidechains/sidechains-introduction.html) website



