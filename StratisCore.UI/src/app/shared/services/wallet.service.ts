import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { SignalRService } from '@shared/services/signalr-service';
import { WalletInfo } from '@shared/models/wallet-info';
import { Balances, TransactionsHistoryItem, WalletBalance, WalletHistory } from '@shared/services/interfaces/api.i';
import {
  BlockConnectedSignalREvent,
  SignalREvent,
  SignalREvents,
  WalletInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';
import { catchError, map, flatMap, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { ErrorService } from '@shared/services/error-service';
import { Transaction } from '@shared/models/transaction';
import { TransactionSending } from '@shared/models/transaction-sending';
import { BuildTransactionResponse, TransactionResponse } from '@shared/models/transaction-response';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { CurrentAccountService } from '@shared/services/current-account.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService extends RestApi {
  private transactionReceivedSubject = new Subject<SignalREvent>();
  private walletUpdatedSubjects: { [walletName: string]: BehaviorSubject<WalletBalance> } = {};
  private walletHistorySubjects: { [walletName: string]: BehaviorSubject<TransactionsHistoryItem[]> } = {};
  private currentWallet: WalletInfo;
  private ibdMode: boolean;
  public accountsEnabled: boolean;

  constructor(
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService,
    private currentAccountService: CurrentAccountService,
    signalRService: SignalRService) {
    super(globalService, http, errorService);

    globalService.currentWallet.subscribe(wallet => {
      this.currentWallet = wallet;
    });

    currentAccountService.currentAddress.subscribe(() => {
      this.accountsEnabled = globalService.getSidechainEnabled() && this.currentAccountService.hasActiveAddress();
      this.updateWalletForCurrentAddress();
    });

    // When we get a TransactionReceived event get the WalletBalance and History using the RestApi
    signalRService.registerOnMessageEventHandler<SignalREvent>(SignalREvents.TransactionReceived,
      (message) => {
        this.transactionReceivedSubject.next(message);
        this.refreshWallet();
        this.refreshWalletHistory();
      });

    signalRService.registerOnMessageEventHandler<WalletInfoSignalREvent>(SignalREvents.WalletGeneralInfo,
      (message) => {
        this.ibdMode = !message.isChainSynced;
        if (message.walletName === this.currentWallet.walletName) {
          const walletBalance = message.accountsBalances.find(acc => acc.accountName === `account ${this.currentWallet.account}`);
          this.updateWalletForCurrentAddress(walletBalance);
        }
      });

    // If we have unconfirmed amount refresh the wallet when a new block is connected.
    // Currently we also refreshWalletHistory on all BlockConnected events on mainnet
    // to show Staking Rewards, TODO : this needs a SignalR Event also
    signalRService.registerOnMessageEventHandler<BlockConnectedSignalREvent>(SignalREvents.BlockConnected,
      (message) => {
        if (this.ibdMode) {
          return;
        }

        const walletSubject = this.getWalletSubject(this.currentWallet);
        if ((!this.globalService.getSidechainEnabled()) || walletSubject.value.amountUnconfirmed > 0) {
          this.refreshWalletHistory();
        }
      });
  }

  public transactionReceived(): Observable<any> {
    return this.transactionReceivedSubject.asObservable();
  }

  public getAllAddressesForWallet(data: WalletInfo): Observable<any> {
    return this.get('wallet/addresses', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
    return this.get('wallet/unusedaddress', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public wallet(): Observable<WalletBalance> {
    return this.getWalletSubject(this.currentWallet).asObservable();
  }

  public walletHistory(): Observable<TransactionsHistoryItem[]> {
    return this.getWalletHistorySubject(this.currentWallet).asObservable();
  }

  public estimateFee(feeEstimation: FeeEstimation): Observable<any> {
    // TODO: What is the intrinsic link between Smart Contacts and Accounts Enabled?
    if (this.accountsEnabled) {

      feeEstimation.sender = this.currentAccountService.address;
      feeEstimation.shuffleOutputs = false;

      return this.post('smartcontracts/estimate-fee', feeEstimation).pipe(
        catchError(err => this.handleHttpError(err))
      );
    } else {

      feeEstimation.shuffleOutputs = true;

      return this.post('wallet/estimate-txfee', feeEstimation).pipe(
        catchError(err => this.handleHttpError(err))
      );
    }
  }

  private getWalletHistory(data: WalletInfo): Observable<WalletHistory> {
    let extra = null;
    if (this.accountsEnabled) {
      extra = {
        address: this.currentAccountService.address
      };
    }

    return this.get<WalletHistory>('wallet/history', this.getWalletParams(data, extra)).pipe(
      catchError(err => this.handleHttpError(err)));
  }

  public sendTransaction(transaction: Transaction): Promise<TransactionResponse> {
    return this.buildAndSendTransaction(transaction).toPromise();
  }

  private buildAndSendTransaction(transaction: Transaction): Observable<TransactionResponse> {

    if (this.accountsEnabled) {
      transaction.shuffleOutputs = !this.accountsEnabled;
      if (this.globalService.getSidechainEnabled() && this.currentAccountService.hasActiveAddress()) {
        // Only set a change address if we're on a sidechain and there's a current account selected
        transaction.sender = this.currentAccountService.address;
      }
    }

    const observable = this.accountsEnabled
      ? this.post<BuildTransactionResponse>('smartcontracts/build-transaction', transaction)
      : this.post<BuildTransactionResponse>('wallet/build-transaction', transaction);

    return observable.pipe(
      map(response => {
        response.isSideChain = transaction.isSideChainTransaction;
        return response;
      }),
      flatMap((buildTransactionResponse) => {
        return this.post('wallet/send-transaction', new TransactionSending(buildTransactionResponse.hex)).pipe(
          map(() => {
            return new TransactionResponse(transaction, buildTransactionResponse.fee, buildTransactionResponse.isSideChain);
          }),
          tap(() => {
            this.refreshWallet();
            this.refreshWalletHistory();
          })
        );
      }),
      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletSubject(walletInfo: WalletInfo): BehaviorSubject<WalletBalance> {
    if (!this.walletUpdatedSubjects[walletInfo.walletName]) {
      this.walletUpdatedSubjects[walletInfo.walletName] = new BehaviorSubject<WalletBalance>(null);

      // Initialise the wallet
      this.getWalletBalance(walletInfo).toPromise().then(data => {
        if (data.balances.length > 0 && data.balances[walletInfo.account]) {
          this.updateWalletForCurrentAddress(data.balances[walletInfo.account]);
        }
      });
    }
    return this.walletUpdatedSubjects[walletInfo.walletName];
  }

  private getWalletHistorySubject(walletInfo: WalletInfo): BehaviorSubject<TransactionsHistoryItem[]> {
    if (!this.walletHistorySubjects[walletInfo.walletName]) {
      this.walletHistorySubjects[walletInfo.walletName] = new BehaviorSubject<TransactionsHistoryItem[]>(null);

      // Get initial Wallet History
      this.getWalletHistory(walletInfo).toPromise().then(response => {
        this.walletHistorySubjects[walletInfo.walletName].next(response.history[walletInfo.account].transactionsHistory);
      });
    }
    return this.walletHistorySubjects[walletInfo.walletName];
  }

  private getWalletBalance(data: WalletInfo): Observable<Balances> {
    return this.get<Balances>('wallet/balance', this.getWalletParams(data)).pipe(
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

  private updateWalletForCurrentAddress(walletBalance?: WalletBalance): void {
    const walletSubject = this.getWalletSubject(this.currentWallet);

    const newBalance = new WalletBalance(
      walletBalance || walletSubject.value,
      walletSubject.value ? walletSubject.value.currentAddress : null);

    if (this.accountsEnabled) {
      if (null == newBalance.currentAddress || newBalance.currentAddress.address !== this.currentAccountService.address) {
        newBalance.setCurrentAccountAddress(this.currentAccountService.address);
        this.refreshWalletHistory();
      }
    }

    walletSubject.next(newBalance);
  }

  private refreshWallet(): void {
    this.getWalletBalance(this.currentWallet).toPromise().then(
      wallet => {
        this.updateWalletForCurrentAddress(wallet.balances[this.currentWallet.account]);
      });
  }

  private refreshWalletHistory(): void {
    const walletHistorySubject = this.getWalletHistorySubject(this.currentWallet);
    this.getWalletHistory(this.currentWallet).toPromise().then(
      response => walletHistorySubject.next(response.history[this.currentWallet.account].transactionsHistory));
  }
}
