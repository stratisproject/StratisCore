export interface SignalREvent {
  nodeEventType: string;
}

export interface BlockConnectedSignalREvent extends SignalREvent{
  hash: string;
  height: number;
}

export enum SignalREvents {
  BlockConnected = "BlockConnected",
  TransactionReceived = "TransactionReceived"
}
