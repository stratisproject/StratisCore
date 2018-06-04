import { NetworkSettings } from './network-settings';


export interface SidechainDetails {
  chainName: string;
  coinName: string;
  coinType: number;
  mainNet: NetworkSettings;
  testNet: NetworkSettings;
  regTest: NetworkSettings;
}
