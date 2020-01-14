import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { SignalRService } from '@shared/services/signalr-service';
import { WalletInfo } from '@shared/models/wallet-info';
import {
  Balances,
  TransactionsHistoryItem,
  WalletBalance,
  WalletHistory, WalletNamesData
} from '@shared/services/interfaces/api.i';
import {
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
import { WalletLoad } from '@shared/models/wallet-load';
import { WalletResync } from '@shared/models/wallet-rescan';
import { AddressBalance } from '@shared/models/address-balance';
import { SnackbarService } from 'ngx-snackbar';
import { NodeService } from '@shared/services/node-service';

@Injectable({
  providedIn: 'root'
})
export class WalletService extends RestApi {
  private rescanInProgress: boolean;
  private transactionReceivedSubject = new Subject<SignalREvent>();
  private walletUpdatedSubjects: { [walletName: string]: BehaviorSubject<WalletBalance> } = {};
  private walletHistorySubjects: { [walletName: string]: BehaviorSubject<TransactionsHistoryItem[]> } = {};
  private loadingSubject = new Subject<boolean>();
  private walletActivitySubject = new Subject<boolean>();
  private currentWallet: WalletInfo;
  private historyPageSize = 40;
  public accountsEnabled: boolean;
  public isSyncing: boolean;
  public ibdMode: boolean;

  public get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public get walletActivityFlag(): Observable<boolean> {
    return this.walletActivitySubject.asObservable();
  }

  public clearWalletActivityFlag(): void {
    this.walletActivitySubject.next(false);
  }

  constructor(
    private snackbarService: SnackbarService,
    private currentAccountService: CurrentAccountService,
    private nodeService: NodeService,
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService,
    signalRService: SignalRService) {
    super(globalService, http, errorService);

    globalService.currentWallet.subscribe(wallet => {
      this.currentWallet = wallet;

    });

    currentAccountService.currentAddress.subscribe((address) => {
      this.accountsEnabled = globalService.getSidechainEnabled();
      if (null != address) {
        this.updateWalletForCurrentAddress();
      }
    });

    // When we get a TransactionReceived event get the WalletBalance and History using the RestApi
    signalRService.registerOnMessageEventHandler<SignalREvent>(SignalREvents.TransactionReceived,
      (message) => {
        this.transactionReceivedSubject.next(message);
        this.refreshWallet();
      });

    nodeService.generalInfo().subscribe(generalInfo => {
      if (generalInfo.percentSynced === 100 && this.rescanInProgress) {
        this.rescanInProgress = false;
        this.snackbarService.add({
          msg: `Wallet rescan completed.`,
          customClass: 'notify-snack-bar',
          action: {
            text: null
          }
        });
      }
    });

    signalRService.registerOnMessageEventHandler<WalletInfoSignalREvent>(SignalREvents.WalletGeneralInfo,
      (message) => {
        // Update wallet history after chain is synced or IBD mode completed
        const syncCompleted = (this.isSyncing && message.lastBlockSyncedHeight === message.chainTip);
        let historyRefreshed = false;
        this.isSyncing = message.lastBlockSyncedHeight !== message.chainTip;
        this.ibdMode = !message.isChainSynced;

        if (syncCompleted) {
          historyRefreshed = true;
        }

        if (this.currentWallet && message.walletName === this.currentWallet.walletName) {
          const walletBalance = message.accountsBalances.find(acc => acc.accountName === `account ${this.currentWallet.account}`);
          this.updateWalletForCurrentAddress(walletBalance, historyRefreshed);
        }
      });
  }

  public getWalletNames(): Observable<WalletNamesData> {
    return this.get<WalletNamesData>('wallet/list-wallets').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public loadStratisWallet(data: WalletLoad): Observable<any> {
    return this.post('wallet/load/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public transactionReceived(): Observable<any> {
    return this.transactionReceivedSubject.asObservable();
  }

  public getAllAddressesForWallet(data: WalletInfo): Observable<AddressBalance> {
    return this.get<AddressBalance>('wallet/addresses', this.getWalletParams(data)).pipe(
      map((response => {
        response.addresses = response.addresses.sort((a, b) => b.amountConfirmed - a.amountConfirmed);
        return response;
      })),
      catchError(err => this.handleHttpError(err))
    );
  }

  public getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
    return this.get('wallet/unusedaddress', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public rescanWallet(data: WalletResync): Observable<any> {
    return this.post('wallet/sync-from-date/', data).pipe(
      tap(() => {
        this.rescanInProgress = true;
        this.clearWalletHistory(data.date.getTime());
        this.paginateHistory();
      }),
      catchError(err => this.handleHttpError(err))
    );
  }

  public wallet(): Observable<WalletBalance> {
    return this.getWalletSubject().asObservable();
  }

  public walletHistory(): Observable<TransactionsHistoryItem[]> {
    return this.getWalletHistorySubject().asObservable();
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

  public paginateHistory(take?: number, prevOutputTxTime?: number, prevOutputIndex?: number): void {

    let extra = Object.assign({}, {
      prevOutputTxTime: prevOutputTxTime,
      prevOutputIndex: prevOutputIndex,
      take: take || this.historyPageSize
    }) as { [key: string]: any };

    if (this.accountsEnabled) {
      extra = Object.assign(extra, {
        address: this.currentAccountService.address
      });
    }

    this.loadingSubject.next(true);
    this.get<WalletHistory>('wallet/history', this.getWalletParams(this.currentWallet, extra))
      .pipe(map((response) => {
          return response.history[this.currentWallet.account].transactionsHistory;
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          return this.handleHttpError(err);
        })).toPromise().then(history => {
      this.applyHistory(history);
      this.loadingSubject.next(false);
    });
  }

  private applyHistory(history: TransactionsHistoryItem[]): void {
    const subject = this.getWalletHistorySubject();
    const existingItems = subject.value;
    const newItems = [];
    history.forEach(item => {
      const index = existingItems.findIndex(existing => existing.id === item.id);
      if (index === -1) {
        newItems.push(item);
      } else {
        existingItems[index] = item;
      }
    });
    const set = existingItems.concat(newItems);
    subject.next(set.sort((a, b) => b.timestamp - a.timestamp));
  }

  public sendTransaction(transaction: Transaction): Promise<TransactionResponse> {
    return this.buildAndSendTransaction(transaction).toPromise();
  }

  public getTransactionCount(): Observable<number> {
    return this.get<any>('wallet/transactionCount', this.getWalletParams(this.currentWallet))
      .pipe(map(result => {
        return result.transactionCount as number;
      }), catchError(err => this.handleHttpError(err)));
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
            //  this.refreshWalletHistory();
          })
        );
      }),
      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletSubject(): BehaviorSubject<WalletBalance> {
    if (!this.walletUpdatedSubjects[this.currentWallet.walletName]) {
      this.walletUpdatedSubjects[this.currentWallet.walletName] = new BehaviorSubject<WalletBalance>(null);

      // Initialise the wallet
      this.getWalletBalance(this.currentWallet).toPromise().then(data => {
        if (data.balances.length > 0 && data.balances[this.currentWallet.account]) {
          this.updateWalletForCurrentAddress(data.balances[this.currentWallet.account]);
        }
      });
    }
    return this.walletUpdatedSubjects[this.currentWallet.walletName];
  }

  private getWalletHistorySubject(): BehaviorSubject<TransactionsHistoryItem[]> {
    if (!this.walletHistorySubjects[this.currentWallet.walletName]) {
      this.walletHistorySubjects[this.currentWallet.walletName] = new BehaviorSubject<TransactionsHistoryItem[]>([]);

      // Get initial Wallet History
      this.paginateHistory(40);
    }
    return this.walletHistorySubjects[this.currentWallet.walletName];
  }

  private getWalletBalance(data: WalletInfo): Observable<Balances> {
    return this.get<Balances>('wallet/balance', this.getWalletParams(data, {
      'includeBalanceByAddress': `${this.accountsEnabled}`
    })).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletParams(walletInfo: WalletInfo, extra?: { [key: string]: any }): HttpParams {
    let params = new HttpParams()
      .set('walletName', walletInfo.walletName)
      .set('accountName', `account ${walletInfo.account || 0}`);

    if (extra) {
      Object.keys(extra).forEach(key => {
        if (extra[key] != null) {
          params = params.set(key, extra[key]);
        }
      });
    }
    return params;
  }

  private updateWalletForCurrentAddress(walletBalance?: WalletBalance, historyRefreshed?: boolean): void {
    if (!this.currentWallet) {
      return;
    }

    const walletSubject = this.getWalletSubject();
    const newBalance = new WalletBalance(
      walletBalance || walletSubject.value,
      walletSubject.value ? walletSubject.value.currentAddress : null);

    if (this.accountsEnabled) {
      if (null != this.currentAccountService.address
        && (null == newBalance.currentAddress || newBalance.currentAddress.address !== this.currentAccountService.address)) {
        newBalance.setCurrentAccountAddress(this.currentAccountService.address);
        this.clearWalletHistory(0);
        this.paginateHistory();
        if (!this.rescanInProgress && !this.isSyncing) {
          this.walletActivitySubject.next(true);
        }
        historyRefreshed = true;
      }
    }

    if (!historyRefreshed && (walletSubject.value
      && (walletSubject.value.amountConfirmed !== newBalance.amountConfirmed
        || walletSubject.value.amountUnconfirmed !== newBalance.amountUnconfirmed))) {
      if (!this.rescanInProgress && !this.isSyncing) {
        this.walletActivitySubject.next(true);
      }
      this.paginateHistory();
    }

    walletSubject.next(newBalance);
  }

  private refreshWallet(): void {
    this.getWalletBalance(this.currentWallet).toPromise().then(
      wallet => {
        this.updateWalletForCurrentAddress(wallet.balances[this.currentWallet.account]);
      });
  }

  private clearWalletHistory(fromDate: number): void {
    if (this.currentWallet) {
      const walletHistorySubject = this.getWalletHistorySubject();
      walletHistorySubject.next(Array.from((walletHistorySubject.value || []).filter(item => item.timestamp < fromDate)));
    }
  }
}
