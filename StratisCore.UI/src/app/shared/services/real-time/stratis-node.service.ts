import { interval, Observable, Subject, Subscription } from "rxjs";
import { Injectable } from "@angular/core";
import { SignalRService } from "@shared/services/signalr-service";
import { NodeStatus } from "@shared/models/node-status";
import { ApiService } from "@shared/services/api.service";
import { WalletInfo } from "@shared/models/wallet-info";
import { Balance, StakingInfo } from "@shared/services/api-dtos";

@Injectable()
export class StratisNodeService {

  // Fallback to polling when SignalR is not available on older nodes.
  private pollingInterval: Observable<any>;
  private subscriptions: Subscription[] = [];
  private blockCreatedSubject = new Subject<any>();
  private transactionReceivedSubject = new Subject<any>();
  private pollingSubscriptions: Subscription[] = [];

  private walletUpdatedSubjects: { [walletName: string]: Subject<Balance> } = {};
  private nodeStatusUpdatedSubject = new Subject<NodeStatus>();
  private stakingInfoUpdatedSubject = new Subject<StakingInfo>();

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

  public stakingInfo(): Observable<StakingInfo> {
    return this.stakingInfoUpdatedSubject.asObservable();
  }

  public wallet(walletInfo: WalletInfo): Observable<Balance> {
    return this.getWalletSubject(walletInfo).asObservable();
  }

  private getWalletSubject(walletInfo: WalletInfo): Subject<Balance> {
    if (!this.walletUpdatedSubjects[walletInfo.walletName]) {
      this.walletUpdatedSubjects[walletInfo.walletName] = new Subject<Balance>();

      // Initialise the wallet
      this.apiService.getWalletBalance(walletInfo).toPromise().then(data => {
        if (data.balances.length > 0 && data.balances[walletInfo.account]) {
          this.walletUpdatedSubjects[walletInfo.walletName].next(new Balance(data.balances[walletInfo.account]));
        }
      });
    }

    return this.walletUpdatedSubjects[walletInfo.walletName];
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
