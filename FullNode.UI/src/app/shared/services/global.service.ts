import {Injectable} from '@angular/core';

@Injectable()
export class GlobalService {
  constructor() {}

  private walletPath: string;
  private currentWalletName: string;
  private coinType: number;
  private coinName: string;
  private coinUnit: string;
  private network: string;
  private sidechainsEnabled = false;

  get WalletPath() {
    return this.walletPath;
  }

  set WalletPath(walletPath: string) {
    this.walletPath = walletPath;
  }

  get Network() {
    return this.network;
  }

  set Network(network: string) {
    this.network = network;
  }

  get WalletName() {
    return this.currentWalletName;
  }

  set WalletName(currentWalletName: string) {
    this.currentWalletName = currentWalletName;
  }

  get CoinType() {
    return this.coinType;
  }

  set CoinType (coinType: number) {
    this.coinType = coinType;
  }

  get CoinName() {
    return this.coinName;
  }

  set CoinName(coinName: string) {
    this.coinName = coinName;
  }

  get CoinUnit() {
    return this.coinUnit;
  }

  set CoinUnit(coinUnit: string) {
    this.coinUnit = coinUnit;
  }

  get SidechainsEnabled() {
    return this.sidechainsEnabled;
  }

  set SidechainsEnabled(sidechainsEnabled: boolean) {
    this.sidechainsEnabled = sidechainsEnabled;
  }
}
