import {Injectable} from '@angular/core';

@Injectable()
export class GlobalService {
  constructor() {}

  private _walletPath: string;
  private _currentWalletName: string;
  private _coinType: number;
  private _coinName: string;
  private _coinUnit: string;
  private _network: string;
  private _sidechainsEnabled = false;

  get walletPath() {
    return this._walletPath;
  }

  set walletPath(walletPath: string) {
    this._walletPath = walletPath;
  }

  get network() {
    return this._network;
  }

  set network(network: string) {
    this._network = network;
  }

  get walletName() {
    return this._currentWalletName;
  }

  set walletName(currentWalletName: string) {
    this._currentWalletName = currentWalletName;
  }

  get coinType() {
    return this._coinType;
  }

  set coinType (coinType: number) {
    this._coinType = coinType;
  }

  get coinName() {
    return this._coinName;
  }

  set coinName(coinName: string) {
    this._coinName = coinName;
  }

  get coinUnit() {
    return this._coinUnit;
  }

  set coinUnit(coinUnit: string) {
    this._coinUnit = coinUnit;
  }

  get sidechainsEnabled() {
    return this._sidechainsEnabled;
  }

  set sidechainsEnabled(sidechainsEnabled: boolean) {
    this._sidechainsEnabled = sidechainsEnabled;
  }

  get crossChainTransactionsEnabled() {
    const enabledValue = localStorage.getItem('crossChainTransactionsEnabled');
    return !!enabledValue && enabledValue === 'true';
  }

  set crossChainTransactionsEnabled(value: boolean) {
    localStorage.setItem('crossChainTransactionsEnabled', value.toString());
  }

  get federationAddressAutoPopulationEnabled() {
    const enabledValue = localStorage.getItem('federationAddressAutoPopulationEnabled');
    return !!enabledValue && enabledValue === 'true';
  }

  set federationAddressAutoPopulationEnabled(value: boolean) {
    localStorage.setItem('federationAddressAutoPopulationEnabled', value.toString());
  }

  get federationAddress() {
    return localStorage.getItem('federationAddress');
  }

  set federationAddress(value: string) {
    localStorage.setItem('federationAddressAutoPopulationEnabled', value);
  }
}
