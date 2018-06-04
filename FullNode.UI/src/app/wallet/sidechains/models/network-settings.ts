export interface NetworkSettings {
  time: number;
  nonce: number;
  messageStart: number;
  addressPrefix: number;
  port: number;
  rpcPort: number;
  apiPort: number;
  coinSymbol: string;
  genesisHashHex: string;
}
