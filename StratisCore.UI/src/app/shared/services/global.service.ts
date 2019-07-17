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
    this.setDaemonIP();
  }

  private applicationVersion: string = "1.2.1";
  private testnet: boolean = false;
  private sidechain: boolean = false;
  private mainApiPort: number = 37221;
  private testApiPort: number = 38221;
  private mainSideChainApiPort: number = 37223;
  private testSideChainApiPort: number = 38223;
  private apiPort: number;
  private walletPath: string;
  private currentWalletName: string;
  private coinUnit: string;
  private network: string;
  private daemonIP: string;


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

  getDaemonIP() {
    return this.daemonIP;
  }

  setDaemonIP() {
    if (this.electronService.isElectronApp) {
      this.daemonIP = this.electronService.ipcRenderer.sendSync('get-daemonip');
    } else {
      this.daemonIP = 'localhost';
    }
  }
}
