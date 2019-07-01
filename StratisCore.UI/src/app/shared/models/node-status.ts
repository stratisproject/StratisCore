export class NodeStatus {
  constructor(agent: string, version: string, network: string, coinTicker: string, processId: number, consensusHeight: number, blockStoreHeight: number, inboundPeers: [Peer],
      outbountPeers: [Peer], featuresData: [featureData], dataDirectoryPath: string, runningtime: string, difficulty: number, protocolVersion: number, testnet: boolean, relayFee: number, state: string) {
    this.agent = agent;
    this.version = version;
    this.network = network;
    this.coinTicker = coinTicker;
    this.processId = processId;
    this.consensusHeight = consensusHeight;
    this.blockStoreHeight = blockStoreHeight;
    this.inboundPeers = inboundPeers;
    this.outbountPeers = outbountPeers;
    this.featuresData = featuresData;
    this.dataDirectoryPath = dataDirectoryPath;
    this.runningTime = runningtime;
    this.difficulty = difficulty;
    this.protocolVersion = protocolVersion;
    this.testnet = testnet;
    this.relayFee = relayFee;
    this.state = state;
  }

  public agent: string;
  public version: string;
  public network: string;
  public coinTicker: string;
  public processId: number;
  public consensusHeight: number;
  public blockStoreHeight: number;
  public inboundPeers: [Peer];
  public outbountPeers: [Peer];
  public featuresData: [featureData];
  public dataDirectoryPath: string;
  public runningTime: string;
  public difficulty: number;
  public protocolVersion: number;
  public testnet: boolean;
  public relayFee: number;
  public state: string;
}

class Peer {
  constructor(version, remoteSocketEndpoint, tipHeight) {
    this.version = version;
    this.remoteSocketEndpoint = remoteSocketEndpoint;
    this.tipHeight = tipHeight;
  }

  public version: string;
  public remoteSocketEndpoint: string;
  public tipHeight: number;
}

class featureData {
  constructor(namespace: string, state: string) {
    this.namespace = namespace;
    this.state = state;
  }

  public namespace: string;
  public state: string;
}
