import {Injectable} from "@angular/core";
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  constructor(private electronService: ElectronService) {
    this.setApplicationVersion();
    this.setSidechainEnabled();
    this.setTestnetEnabled();
    this.setApiPort();
  }

  private applicationVersion: string = "1.0.0";
  private testnet: boolean = false;
  private sidechain: boolean = false;
  private mainApiPort: number = 37221;
  private testApiPort: number = 38221;
  private mainSideChainApiPort: number = 38225;
  private testSideChainApiPort: number = 38225;
  private apiPort: number;
  private walletPath: string;
  private currentWalletName: string;
  private coinUnit: string;
  private network: string;

  // Base units relative to sats
  private baseUnits = [
    new BaseUnit('', 100000000), // BTC = 100,000,000 sats
    new BaseUnit('m', 100000), // mBTC = 100,000 sats
    new BaseUnit('μ', 100), // μBTC = 100 sats
    new BaseUnit('sats', 1) // Defaults are in sats
  ];

  private baseUnit: BaseUnit = this.baseUnits[0]; // Default to COIN

  getApplicationVersion() {
    return this.applicationVersion;
  }

  setApplicationVersion() {
    if (this.electronService.isElectronApp) {
      this.applicationVersion = this.electronService.remote.app.getVersion();
    }
  }

  getTestnetEnabled() {
    return this.testnet;
  }

  setTestnetEnabled() {
    if (this.electronService.isElectronApp) {
      this.testnet = this.electronService.ipcRenderer.sendSync('get-testnet');
    }
  }

  getSidechainEnabled() {
    return this.sidechain;
  }

  setSidechainEnabled() {
    if (this.electronService.isElectronApp) {
      this.sidechain = this.electronService.ipcRenderer.sendSync('get-sidechain');
    }
  }

  getApiPort() {
    return this.apiPort;
  }

  setApiPort() {
    if (this.electronService.isElectronApp) {
      this.apiPort = this.electronService.ipcRenderer.sendSync('get-port');
    } else if (this.testnet && !this.sidechain) {
      this.apiPort = this.testApiPort;
    } else if (!this.testnet && !this.sidechain) {
      this.apiPort = this.mainApiPort;
    } else if (this.testnet && this.sidechain) {
      this.apiPort = this.testSideChainApiPort;
    } else if (!this.testnet && this.sidechain) {
      this.apiPort = this.mainSideChainApiPort;
    }
  }

  getWalletPath() {
    return this.walletPath;
  }

  setWalletPath(walletPath: string) {
    this.walletPath = walletPath;
  }

  getNetwork() {
    return this.network;
  }

  setNetwork(network: string) {
    this.network = network;
  }

  getWalletName() {
    return this.currentWalletName;
  }

  setWalletName(currentWalletName: string) {
    this.currentWalletName = currentWalletName;
  }

  getCoinUnit() {
    return this.coinUnit;
  }

  setCoinUnit(coinUnit: string) {
    this.coinUnit = coinUnit;
  }

  getBaseUnit() {
    return this.baseUnit;
  }

  setBaseUnit(baseUnit: BaseUnit) {
    console.log("Set baseunit");
    console.log(baseUnit);
    //localStorage.setItem('baseUnit', JSON.stringify(baseUnit));
    this.baseUnit = baseUnit;
  }

  getBaseUnits() {
    return this.baseUnits;
  }
}

export class BaseUnit {
  constructor(public name: string, public multiple: number) {}

  addCoinUnit(unit: string): BaseUnit {

    // Some base units look funny with a prefix
    if (this.name === 'sats') {
      return this;
    }

    let newName = this.name + unit;

    return new BaseUnit(newName, this.multiple);
  }
}
