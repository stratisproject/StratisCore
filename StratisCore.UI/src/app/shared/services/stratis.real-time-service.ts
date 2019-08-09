import { Injectable } from "@angular/core";
import { SignalRService } from "@shared/services/signalr-service";
import { interval, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StratisRealTimeService {

  // Fallback to polling when SignalR is not available on older nodes.
  private pollingInterval: Observable<any>;

  private onBlockCreatedSubject = new Subject<any>();
  private onTransactionReceivedSubject = new Subject<any>();

  constructor(private signalRService: SignalRService) {

    this.signalRService.connect("events", () => {

    });

    this.signalRService.onConnectionFailed.subscribe(e => {
      this.revertToPolling();
    })
  }

  public blockCreated(): Observable<any> {
    return this.onBlockCreatedSubject.asObservable();
  }

  public transactionReceived(): Observable<any> {
    return this.onTransactionReceivedSubject.asObservable();
  }

  private revertToPolling(): void {
    this.pollingInterval = interval(5000);
    // TODO: Needs some thought.
  }

}
