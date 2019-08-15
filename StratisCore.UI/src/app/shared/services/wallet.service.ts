import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { SignalRService } from "@shared/services/signalr-service";
import { WalletInfo } from "@shared/models/wallet-info";
import { Balances, TransactionsHistoryItem, WalletBalance, WalletHistory } from "@shared/services/interfaces/api.i";
import { BlockConnectedSignalREvent, SignalREvent, SignalREvents } from "@shared/services/interfaces/signalr-events.i";
import { catchError } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { RestApi } from "@shared/services/rest-api";
import { GlobalService } from "@shared/services/global.service";
import { ErrorService } from "@shared/services/error-service";

@Injectable({
  providedIn: "root"
})
export class WalletService extends RestApi {
  private transactionReceivedSubject = new Subject<SignalREvent>();
  private walletUpdatedSubjects: { [walletName: string]: BehaviorSubject<WalletBalance> } = {};
  private walletHistorySubjects: { [walletName: string]: BehaviorSubject<TransactionsHistoryItem[]> } = {};
  private currentWallet: WalletInfo;

  constructor(
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService,
    signalRService: SignalRService) {
    super(globalService, http, errorService);

    globalService.currentWallet.subscribe(wallet => {
      this.currentWallet = wallet;
    });

    // When we get a TransactionReceived event get the WalletBalance and History using the RestApi
    signalRService.registerOnMessageEventHandler<SignalREvent>(SignalREvents.TransactionReceived,
      (message) => {
        this.transactionReceivedSubject.next(message);
        this.refreshWallet();
      });

    // If we have unconfirmed amount refresh the wallet when a new block is connected.
    signalRService.registerOnMessageEventHandler<BlockConnectedSignalREvent>(SignalREvents.BlockConnected,
      (message) => {
        const walletSubject = this.getWalletSubject(this.currentWallet);
        if (walletSubject.value.amountUnconfirmed > 0) {
          this.refreshWallet();
        }
      });
  }

  public transactionReceived(): Observable<any> {
    return this.transactionReceivedSubject.asObservable();
  }

  public wallet(): Observable<WalletBalance> {
    return this.getWalletSubject(this.currentWallet).asObservable();
  }

  public walletHistory(): Observable<TransactionsHistoryItem[]> {
    return this.getWalletHistorySubject(this.currentWallet).asObservable();
  }

  private getWalletSubject(walletInfo: WalletInfo): BehaviorSubject<WalletBalance> {
    if (!this.walletUpdatedSubjects[walletInfo.walletName]) {
      this.walletUpdatedSubjects[walletInfo.walletName] = new BehaviorSubject<WalletBalance>(null);

      // Initialise the wallet
      this.getWalletBalance(walletInfo).toPromise().then(data => {
        if (data.balances.length > 0 && data.balances[walletInfo.account]) {
          this.walletUpdatedSubjects[walletInfo.walletName].next(new WalletBalance(data.balances[walletInfo.account]));
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
    )
  }

  public getWalletHistory(data: WalletInfo): Observable<WalletHistory> {
    return this.get<WalletHistory>('wallet/history', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err)))
  }

  private getWalletParams(walletInfo: WalletInfo, extra?: { [key: string]: string }): HttpParams {
    const params = new HttpParams()
      .set('walletName', walletInfo.walletName)
      .set('accountName', `account ${walletInfo.account || 0}`);

    if (extra) {
      Object.keys(extra).forEach(key => params.set(key, extra[key]));
    }

    return params;
  }

  private refreshWallet() : void
  {
    const walletSubject = this.getWalletSubject(this.currentWallet);
    const walletHistorySubject = this.getWalletHistorySubject(this.currentWallet);

    this.getWalletBalance(this.currentWallet).toPromise().then(
      wallet => walletSubject.next(new WalletBalance(wallet.balances[this.currentWallet.account])));

    this.getWalletHistory(this.currentWallet).toPromise().then(
      response => walletHistorySubject.next(response.history[this.currentWallet.account].transactionsHistory));
  }
}
