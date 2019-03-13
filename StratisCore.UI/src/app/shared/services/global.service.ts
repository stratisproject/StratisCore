import {Injectable} from "@angular/core";
import { ElectronService } from 'ngx-electron';
import { BehaviorSubject, Observable } from "rxjs";
import { take, map } from "rxjs/operators";
import { BaseUnit } from "../BaseUnit";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  constructor(private electronService: ElectronService) {
    this.setApplicationVersion();
    this.setSidechainEnabled();
    this.setTestnetEnabled();
    this.setApiPort();

    // Store by name so we can match the object and populate the settings list correctly.
    let storedBaseUnitName = localStorage.getItem('baseUnit');

    if (storedBaseUnitName) {
      let baseUnit = this.baseUnits.find(b => b.name === storedBaseUnitName);
      if (baseUnit)
        this.baseUnit.next(baseUnit);
    }
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
    new BaseUnit('', 100000000, '1.8-8'), // BTC = 100,000,000 sats
    new BaseUnit('m', 100000, '1.5-8'), // mBTC = 100,000 sats
    new BaseUnit('μ', 100, '1.2-8'), // μBTC = 100 sats
    new BaseUnit('sats', 1, '1.0-0') // Defaults are in sats, no decimal places
  ];

  public baseUnit: BehaviorSubject<BaseUnit> = new BehaviorSubject<BaseUnit>(this.baseUnits[0]);

  public formattedBaseUnit: Observable<string> = this.baseUnit.pipe(map(baseUnit => {
    if (baseUnit.name === 'sats') {
      return baseUnit.name;      
    }

    return baseUnit.name + this.coinUnit;
  }));

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

  setBaseUnit(baseUnit: BaseUnit) {
    localStorage.setItem('baseUnit', baseUnit.name);
    this.baseUnit.next(baseUnit);
  }

  getBaseUnits() {
    return this.baseUnits;
  }
}
