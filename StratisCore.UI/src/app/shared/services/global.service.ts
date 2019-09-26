import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { WalletInfo } from '@shared/models/wallet-info';
import { BehaviorSubject, Observable } from 'rxjs';

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

  private applicationVersion = '1.3.0';
  private testnet = false;
  private sidechain = false;
  private mainApiPort = 37221;
  private testApiPort = 38221;
  private mainSideChainApiPort = 37223;
  private testSideChainApiPort = 38223;
  private apiPort: number;
  private walletPath: string;
  private currentWalletName: string;
  private network: string;
  private daemonIP: string;

  public coinUnit: string;

  public currentWallet: Observable<WalletInfo> = new BehaviorSubject<WalletInfo>(null);


  public getApplicationVersion() {
    return this.applicationVersion;
  }

  public setApplicationVersion() {
    if (this.electronService.isElectronApp) {
      this.applicationVersion = this.electronService.remote.app.getVersion();
    }
  }

  public getTestnetEnabled() {
    return this.testnet;
  }

  public setTestnetEnabled() {
    if (this.electronService.isElectronApp) {
      this.testnet = this.electronService.ipcRenderer.sendSync('get-testnet');
    }
  }

  public getSidechainEnabled() {
    return this.sidechain;
  }

  public get networkName() {
    return this.sidechain ? 'cirrus' : 'stratis';
  }

  public setSidechainEnabled() {
    if (this.electronService.isElectronApp) {
      this.sidechain = this.electronService.ipcRenderer.sendSync('get-sidechain');
    }
  }

  public getApiPort() {
    return this.apiPort;
  }

  public setApiPort() {
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

  public getWalletPath() {
    return this.walletPath;
  }

  public setWalletPath(walletPath: string) {
    this.walletPath = walletPath;
  }

  public getNetwork() {
    return this.network;
  }

  public setNetwork(network: string) {
    this.network = network;
  }

  public getWalletName() {
    return this.currentWalletName;
  }

  public setWalletName(currentWalletName: string) {
    this.currentWalletName = currentWalletName;
    (<BehaviorSubject<WalletInfo>>this.currentWallet).next(new WalletInfo(currentWalletName));
  }

  public getCoinUnit() {
    return this.coinUnit;
  }

  public setCoinUnit(coinUnit: string) {
    this.coinUnit = coinUnit;
  }

  public getDaemonIP() {
    return this.daemonIP;
  }

  public setDaemonIP() {
    if (this.electronService.isElectronApp) {
      this.daemonIP = this.electronService.ipcRenderer.sendSync('get-daemonip');
    } else {
      this.daemonIP = 'localhost';
    }
  }
}
