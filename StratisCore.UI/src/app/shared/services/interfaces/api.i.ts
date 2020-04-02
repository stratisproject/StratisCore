import { Log } from "../../../wallet/tokens/services/logger.service";

export interface WalletNamesData {
  walletNames: Array<string>;
}

export interface Money {
  satoshi: number;
}

export interface Address {
  address: string;
  isUsed: boolean;
  isChange: boolean;
  amountConfirmed: number;
  amountUnconfirmed: number;
}

export class WalletBalance {
  private _amountConfirmed: number;
  private _amountUnconfirmed: number;
  private _spendableAmount: number;
  private _useAddress: boolean;

  constructor(balance?: WalletBalance, currentAddress?: Address) {
    if (balance) {
      Object.assign(this, balance);
    }

    if (currentAddress) {
      this.setCurrentAccountAddress(currentAddress.address);
    }
  }

  public accountName: string;
  public accountHdPath: string;
  public coinType: number;

  public get amountConfirmed(): number {
    return this._useAddress ? this.currentAddress.amountConfirmed : this._amountConfirmed;
  }

  public set amountConfirmed(value: number) {
    this._amountConfirmed = value;
  }

  public get amountUnconfirmed(): number {
    return this._useAddress ? this.currentAddress.amountUnconfirmed : this._amountUnconfirmed;
  }

  public set amountUnconfirmed(value: number) {
    this._amountUnconfirmed = value;
  }

  public get spendableAmount(): number {
    if (this._useAddress) {
      return this.currentAddress.amountConfirmed - this.currentAddress.amountUnconfirmed;
    }
    return this._spendableAmount;
  }

  public set spendableAmount(value: number) {
    this._spendableAmount = value;
  }

  public addresses: Address[];

  public currentAddress: Address;

  public setCurrentAccountAddress(address: string): WalletBalance {

    if (this.addresses) {
      this.currentAddress = this.addresses.find(a => a.address === address);
    }

    if (this.currentAddress) {
      this._useAddress = true;
    } else {
      Log.error({
        name: 'Address not found',
        message: `The address ${address} was not found.`
      });
    }
    return this;
  }

  public get hasBalance(): boolean {
    return (this.amountConfirmed + this.amountUnconfirmed) > 0;
  }

  public get awaitingMaturityIfStaking(): number {
    return (this.amountUnconfirmed + this.amountConfirmed) - this.spendableAmount;
  }
}

export interface Balances {
  balances: WalletBalance[];
}

export interface TransactionsHistoryItem {
  type: string;
  toAddress: string;
  id: string;
  amount: number;
  payments: any[];
  confirmedInBlock: number;
  timestamp: number;
  txOutputIndex: number;
  blockIndex: number;
  fee: number;
}

export interface WalletHistoryAccount {
  accountName: string;
  accountHdPath: string;
  coinType: number;
  transactionsHistory: TransactionsHistoryItem[];
}

export interface WalletHistory {
  history: WalletHistoryAccount[];
}

export interface StakingInfo {
  enabled: boolean;
  staking: boolean;
  errors?: any;
  currentBlockSize: number;
  currentBlockTx: number;
  pooledTx: number;
  difficulty: number;
  searchInterval: number;
  weight: number;
  netStakeWeight: number;
  immature: number;
  expectedTime: number;
}

export interface GeneralInfo {
  walletName: string;
  walletFilePath: string;
  network: string;
  creationTime: string;
  isDecrypted: boolean;
  lastBlockSyncedHeight: number;
  chainTip: number;
  isChainSynced: boolean;
  connectedNodes: number;
  accountsBalances?: WalletBalance[];
  percentSynced? : number;
}

