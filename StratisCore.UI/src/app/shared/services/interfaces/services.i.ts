import { Observable } from 'rxjs';
import { NodeStatus } from '@shared/models/node-status';
import { WalletInfo } from '@shared/models/wallet-info';
import { WalletCreation } from '@shared/models/wallet-creation';
import { WalletRecovery } from '@shared/models/wallet-recovery';

export interface ISignalRService {
  connect(hubName: string): void;
}

export interface IApiService {

  getNodeStatus(silent?: boolean): Observable<NodeStatus>;

  getNodeStatusInterval(silent?: boolean): Observable<NodeStatus>;

  /** Gets the extended public key from a certain wallet */
  getExtPubkey(data: WalletInfo): Observable<any>;

  /**
   * Get a new mnemonic
   */
  getNewMnemonic(): Observable<any>;

  /**
   * Create a new Stratis wallet.
   */
  createStratisWallet(data: WalletCreation): Observable<any>;

  /**
   * Recover a Stratis wallet.
   */
  recoverStratisWallet(data: WalletRecovery): Observable<any>;

  /**
   * Get wallet status info from the API.
   */
  getWalletStatus(): Observable<any>;

  /**
   * Get general wallet info from the API once.
   */
  getGeneralInfoOnce(data: WalletInfo): Observable<any>;

  /**
   * Get the maximum sendable amount for a given fee from the API
   */
  getMaximumBalance(data): Observable<any>;

  /**
   * Get multiple unused receive addresses for a certain wallet from the API.
   */
  getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any>;

  /** Remove transaction */
  removeTransaction(walletName: string): Observable<any>;

  /**
   * Send shutdown signal to the daemon
   */
  shutdownNode(): Observable<any>;
}

