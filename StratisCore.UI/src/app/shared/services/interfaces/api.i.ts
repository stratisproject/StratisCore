export interface WalletFileData {
  walletsPath: string;
  walletsFiles: [string];
}

export class WalletBalance {
  constructor(balance?: WalletBalance) {
    if (balance) {
      Object.assign(this, balance);
    }
  }

  public accountName: string;
  public accountHdPath: string;
  public coinType: number;
  public amountConfirmed: number;
  public amountUnconfirmed: number;
  public spendableAmount: number;

  public get hasBalance(): boolean {
    return (this.amountConfirmed + this.amountUnconfirmed) > 0
  }

  public get awaitingMaturityIfStaking() {
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
  walletFilePath: string;
  network: string;
  creationTime: string;
  isDecrypted: boolean;
  lastBlockSyncedHeight: number;
  chainTip: number;
  isChainSynced: boolean;
  connectedNodes: number;
}

