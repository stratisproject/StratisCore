export interface WalletFileData {
  walletsPath: string;
  walletsFiles: [string];
}

export class Balance {
  constructor(balance?: Balance) {
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
}

export interface Balances {
  balances: Balance[];
}

export interface TransactionsHistory {
  type: string;
  toAddress: string;
  id: string;
  amount: number;
  payments: any[];
  confirmedInBlock: number;
  timestamp: string;
  blockIndex: number;
}

export interface WalletHistoryItem {
  accountName: string;
  accountHdPath: string;
  coinType: number;
  transactionsHistory: TransactionsHistory[];
}

export interface WalletHistory {
  history: WalletHistoryItem[];
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

