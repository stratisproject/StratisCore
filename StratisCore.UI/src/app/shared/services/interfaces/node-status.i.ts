export interface OutboundPeer {
  version: string;
  remoteSocketEndpoint: string;
  tipHeight: number;
}

export interface FeaturesData {
  namespace: string;
  state: string;
}

export interface NodeStatus {
  agent: string;
  version: string;
  externalAddress: string;
  network: string;
  coinTicker: string;
  processId: number;
  consensusHeight: number;
  blockStoreHeight: number;
  inboundPeers: any[];
  outboundPeers: OutboundPeer[];
  featuresData: FeaturesData[];
  dataDirectoryPath: string;
  runningTime: string;
  difficulty: number;
  protocolVersion: number;
  testnet: boolean;
  relayFee: number;
  state: string;
}



