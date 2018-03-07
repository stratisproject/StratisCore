# Stratis Wallet (codename 'Storm')

__Warning: We're still in alpha, so use at your own risk.__
This is the repository of the Stratis Wallet, a full node staking wallet using Angular and Electron at the front-end and C# with .NET Core in the back-end.

## Daemon Build

The StratisD daemon is the backend REST service, hosting a Stratis node upon which FullNode UI depends:

```
# Clone and go in the directory
git clone https://github.com/stratisproject/FullNodeUI
cd FullNodeUI

# Initialize dependencies
git submodule update --init --recursive

#Navigate to the src folder and build the stratisD daemon
cd StratisBitcoinFullNode/src
dotnet restore
dotnet build

# Run the StratisD daemon from within the src folder:
cd Stratis.StratisD
dotnet run -testnet
```

## UI Build

[Read more...](https://github.com/stratisproject/FullNodeUI/tree/master/FullNode.UI/README.md)


