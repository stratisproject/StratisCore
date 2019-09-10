import { GeneralInfo, StakingInfo } from '@shared/services/interfaces/api.i';

export interface SignalREvent {
  nodeEventType: string;
}

export interface BlockConnectedSignalREvent extends SignalREvent {
  hash: string;
  height: number;
}

export interface WalletInfoSignalREvent extends SignalREvent, GeneralInfo {
}

export interface StakingInfoSignalREvent extends SignalREvent, StakingInfo {
}

export enum SignalREvents {
  BlockConnected = 'BlockConnected',
  TransactionReceived = 'TransactionReceived',
  WalletGeneralInfo = 'WalletGeneralInfo',
  StakingInfo = 'StakingInfo'
}
