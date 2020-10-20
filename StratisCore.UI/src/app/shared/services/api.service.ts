import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval, Observable } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { WalletCreation } from '../models/wallet-creation';
import { WalletRecovery } from '../models/wallet-recovery';
import { WalletInfo, WalletInfoRequest } from '../models/wallet-info';
import { NodeStatus } from '../models/node-status';
import { RestApi } from '@shared/services/rest-api';
import { IApiService } from '@shared/services/interfaces/services.i';
import { ErrorService } from '@shared/services/error-service';
import { MaxBalanceRequest } from '@shared/models/max-balance';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends RestApi implements IApiService {
  private pollingInterval = interval(5000);

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    errorService: ErrorService) {
    super(globalService, http, errorService);
  }

  public getNodeStatus(silent?: boolean): Observable<NodeStatus> {
    return this.get<NodeStatus>('node/status').pipe(
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  public getNodeStatusInterval(silent?: boolean): Observable<NodeStatus> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<NodeStatus>('node/status')),
      catchError(err => this.handleHttpError(err, silent)));
  }

  /** Gets the extended public key from a certain wallet */
  public getExtPubkey(data: WalletInfo): Observable<any> {
    return this.get('wallet/extpubkey', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get a new mnemonic
   */
  public getNewMnemonic(): Observable<any> {
    const params = new HttpParams()
      .set('language', 'English')
      .set('wordCount', '12');

    return this.get('wallet/mnemonic', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Create a new Stratis wallet.
   */
  public createStratisWallet(data: WalletCreation): Observable<any> {
    return this.post('wallet/create/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Recover a Stratis wallet.
   */
  public recoverStratisWallet(data: WalletRecovery): Observable<any> {
    return this.post('wallet/recover/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get wallet status info from the API.
   */
  public getWalletStatus(): Observable<any> {
    return this.get('wallet/status').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get general wallet info from the API once.
   */
  public getGeneralInfoOnce(data: WalletInfo): Observable<any> {
    const params = new HttpParams().set('Name', data.walletName);
    return this.get('wallet/general-info', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get the maximum sendable amount for a given fee from the API
   */
  public getMaximumBalance(data: MaxBalanceRequest): Observable<any> {
    return this.get('wallet/maxbalance',
      this.getWalletParams(data, {
        feeType: data.feeType,
        allowUnconfirmed: 'true',
        opReturnData: data.opReturnData,
        opReturnAmount: data.opReturnAmount,
        burnFullBalance: data.burnFullBalance
      })).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get multiple unused receive addresses for a certain wallet from the API.
   */
  public getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
    return this.get('wallet/unusedaddresses', this.getWalletParams(data, {count})).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Remove transaction */
  public removeTransaction(walletName: string): Observable<any> {
    const params = new HttpParams()
      .set('walletName', walletName)
      .set('all', 'true')
      .set('resync', 'true');
    return this.delete('wallet/remove-transactions', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Send shutdown signal to the daemon
   */
  public shutdownNode(): Observable<any> {
    return this.post('node/shutdown', 'corsProtection:true').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }


  private getWalletParams(walletInfo: WalletInfo, extra?: { [key: string]: string }): HttpParams {
    let params = new HttpParams()
      .set('walletName', walletInfo.walletName)
      .set('accountName', `account ${walletInfo.account || 0}`);

    if (extra) {
      Object.keys(extra).forEach(key => params = params.set(key, extra[key]));
    }

    return params;
  }
}
