import {Injectable} from "@angular/core";
import { ElectronService } from 'ngx-electron';

@Injectable()
export class GlobalService {
  constructor(private electronService: ElectronService) {
    this.setSidechainEnabled()
  }

  private testnet: boolean;
  private sidechain: boolean;
  private walletPath: string;
  private currentWalletName: string;
  private coinName: string;
  private coinUnit: string;
  private network: string;

  getTestnetEnabled() {
    return this.testnet;
  }

  setTestnetEnabled() {
    this.testnet = this.electronService.ipcRenderer.sendSync('get-testnet');
  }

  getSidechainEnabled() {
    return this.sidechain;
  }

  setSidechainEnabled() {
    this.sidechain = this.electronService.ipcRenderer.sendSync('get-sidechain');
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

  getCoinName() {
    return this.coinName;
  }

  setCoinName(coinName: string) {
    this.coinName = coinName;
  }

  getCoinUnit() {
    return this.coinUnit;
  }

  setCoinUnit(coinUnit: string) {
    this.coinUnit = coinUnit;
  }
}
