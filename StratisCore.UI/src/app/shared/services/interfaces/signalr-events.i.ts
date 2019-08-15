export interface SignalREvent {
  type: number;
  target: string;
  arguments: any[];
}

export interface BlockConnectedSignalREvent extends SignalREvent {
  type: number;
  target: string;
  arguments: BlockConnectedArgument[];
}

export interface BlockConnectedArgument {
  hash: string;
  height: number;
  nodeEventType: string;
}

export enum SignalREvents {
  BlockConnected = "BlockConnected",
  TransactionReceived = "TransactionReceived"
}
