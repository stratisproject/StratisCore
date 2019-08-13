import { BehaviorSubject, interval, Observable, Subject, Subscription } from "rxjs";
import { Injectable } from "@angular/core";
import { SignalRService } from "@shared/services/signalr-service";
import { NodeStatus } from "@shared/models/node-status";
import { ApiService } from "@shared/services/api.service";
import { WalletInfo } from "@shared/models/wallet-info";
import { TransactionsHistoryItem, WalletBalance } from "@shared/services/interfaces/api.i";

@Injectable({
  providedIn : "root"
})
export class NodeService {
  // Fallback to polling when SignalR is not available on older nodes.
  private pollingInterval: Observable<any>;
  private subscriptions: Subscription[] = [];
  private blockCreatedSubject = new Subject<any>();
  private transactionReceivedSubject = new Subject<any>();
  private pollingSubscriptions: Subscription[] = [];

  private walletUpdatedSubjects: { [walletName: string]: BehaviorSubject<WalletBalance> } = {};
  private walletHistorySubjects: { [walletName: string]: BehaviorSubject<TransactionsHistoryItem[]> } = {};

  private nodeStatusUpdatedSubject = new BehaviorSubject<NodeStatus>(null);

  constructor(
    private apiService: ApiService,
    private signalRService: SignalRService) {

    this.signalRService.connect("events", (message) => {
      this.useSignalR();
      console.log(message);
      // TODO: convert to appropriate subject next call
    });

    this.signalRService.onConnectionFailed.subscribe(e => {
      this.revertToPolling();
    });

    this.subscriptions.push(this.transactionReceived().subscribe(txReceived => {
      //this.apiService.getWalletBalance()
      //this.walletUpdatedSubject.next()
    }));
  }

  public blockCreated(): Observable<any> {
    return this.blockCreatedSubject.asObservable();
  }

  public transactionReceived(): Observable<any> {
    return this.transactionReceivedSubject.asObservable();
  }

  public wallet(walletInfo: WalletInfo): Observable<WalletBalance> {
    return this.getWalletSubject(walletInfo).asObservable();
  }

  public walletHistory(walletInfo: WalletInfo): Observable<TransactionsHistoryItem[]> {
    return this.getWalletHistorySubject(walletInfo).asObservable();
  }

  private getWalletSubject(walletInfo: WalletInfo): BehaviorSubject<WalletBalance> {
    if (!this.walletUpdatedSubjects[walletInfo.walletName]) {
      this.walletUpdatedSubjects[walletInfo.walletName] = new BehaviorSubject<WalletBalance>(null);

      // Initialise the wallet
      this.apiService.getWalletBalance(walletInfo).toPromise().then(data => {
        if (data.balances.length > 0 && data.balances[walletInfo.account]) {
          this.walletUpdatedSubjects[walletInfo.walletName].next(new WalletBalance(data.balances[walletInfo.account]));
        }
      });
    }

    return this.walletUpdatedSubjects[walletInfo.walletName];
  }

  private getWalletHistorySubject(walletInfo : WalletInfo) : BehaviorSubject<TransactionsHistoryItem[]>
  {
    if (!this.walletHistorySubjects[walletInfo.walletName]) {
      this.walletHistorySubjects[walletInfo.walletName] = new BehaviorSubject<TransactionsHistoryItem[]>(null);

      // Get initial Wallet History
      this.apiService.getWalletHistory(walletInfo).toPromise().then(history => {
          this.walletHistorySubjects[walletInfo.walletName].next(history[walletInfo.account]);
      });
    }

    return this.walletHistorySubjects[walletInfo.walletName];
  }

  private revertToPolling(): void {
    this.pollingInterval = interval(5000);
    // TODO: Needs some thought.
  }

  private useSignalR(): void {
    this.pollingSubscriptions.forEach(pollingSubscription => {
      pollingSubscription.unsubscribe()
    });
    this.pollingSubscriptions = [];
  }
}
