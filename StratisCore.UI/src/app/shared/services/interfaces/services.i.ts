import { Observable } from 'rxjs';
import { NodeStatus } from '@shared/models/node-status';
import { AddressLabel } from '@shared/models/address-label';
import { WalletInfo } from '@shared/models/wallet-info';
import { WalletCreation } from '@shared/models/wallet-creation';
import { WalletRecovery } from '@shared/models/wallet-recovery';
import { WalletLoad } from '@shared/models/wallet-load';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { SidechainFeeEstimation } from '@shared/models/sidechain-fee-estimation';
import { Transaction } from '@shared/models/transaction';
import { TransactionSending } from '@shared/models/transaction-sending';
import { WalletRescan } from '@shared/models/wallet-rescan';
import { LocalExecutionResult } from '@shared/models/local-execution-result';
import { TokenBalanceRequest } from '../../../wallet/tokens/models/token-balance-request';

export interface ISignalRService {
  connect(hubName: string): void;
}

export interface IApiService {

  getNodeStatus(silent?: boolean): Observable<NodeStatus>;

  getNodeStatusInterval(silent?: boolean): Observable<NodeStatus>;

  // getAddressBookAddresses(): Observable<any>;

  addAddressBookAddress(data: AddressLabel): Observable<any>;

  removeAddressBookAddress(label: string): Observable<any>;

  /**
   * Gets available wallets at the default path
   */
  getWalletFiles(): Observable<any>;

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
   * Load a Stratis wallet
   */
  loadStratisWallet(data: WalletLoad): Observable<any>;

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

  /** Rescan wallet from a certain date using remove-transactions */
  rescanWallet(data: WalletRescan): Observable<any>;

  /**
   * Send shutdown signal to the daemon
   */
  shutdownNode(): Observable<any>;

  getAccountAddress(walletName: string): Observable<any>;

  getAccountAddresses(walletName: string): any;

  getAccountBalance(walletName: string): Observable<any>;

  getAddressBalance(address: string): Observable<any>;

  getAccountHistory(walletName: string, address: string): Observable<any>;

  postCreateTransaction(transaction: any): Observable<any>;

  postCallTransaction(transaction: any): Observable<any>;

  getReceipt(hash: string, silent: boolean): any;

  getReceiptSilent(hash: string): any;

  localCall(localCall: TokenBalanceRequest): Observable<LocalExecutionResult>;

}

