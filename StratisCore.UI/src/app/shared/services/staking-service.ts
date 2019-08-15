import { Injectable } from "@angular/core";
import { BehaviorSubject, interval, Observable, Subject, Subscription } from "rxjs";
import { StakingInfo } from "@shared/services/interfaces/api.i";
import { catchError, startWith, switchMap } from "rxjs/operators";
import { RestApi } from "@shared/services/rest-api";
import { GlobalService } from "@shared/services/global.service";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "@shared/services/error-service";

@Injectable({
  providedIn: "root"
})
export class StakingService extends RestApi {
  private stakingInfoUpdatedSubject = new BehaviorSubject<StakingInfo>(null);
  public isStopping: boolean;
  public isStarting: boolean;
  public stakingEnabled: boolean;

  private stakingSubscription: Subscription;
  private pollingInterval = interval(5000);

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    errorService: ErrorService) {
    super(globalService, http, errorService)
  }

  public startStaking(walletData: any): void {
    this.isStarting = true;
    this.isStopping = false;

    this.invokeStartStakingApiCall(walletData)
      .toPromise().then(
      () => {
        this.stakingEnabled = true;
        this.isStarting = false;
        this.stakingSubscription = this.getStakingHotObservable()
          .subscribe(
            response => {
              this.stakingInfoUpdatedSubject.next(response);
            });

        return true;
      },
      error => {
        console.log(error);
        this.stakingEnabled = false;
        this.isStarting = false;
        if (this.stakingSubscription) {
          this.stakingSubscription.unsubscribe();
        }
        return false;
      });
  }

  public stopStaking(): Promise<boolean> {
    this.isStopping = true;
    this.isStarting = false;
    return this.invokeStopStakingApiCall()
      .toPromise().then(
        () => {
          this.stakingEnabled = false;
          this.isStopping = false;
          return true
        }, () => {
          this.stakingEnabled = false;
          this.isStopping = false;
          return false;
        });
  }

  public stakingInfo(): Observable<StakingInfo> {
    return this.stakingInfoUpdatedSubject.asObservable();
  }

  private invokeStartStakingApiCall(data: any): Observable<any> {
    return this.post('staking/startstaking', data).pipe(
      catchError(err => {
        this.stakingEnabled = false;
        return this.handleHttpError(err)
      })
    );
  }

  public invokeStopStakingApiCall(): Observable<any> {
    return this.post('staking/stopstaking', 'true').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  // TODO : Remove when SignalR Event exists;
  public getStakingHotObservable(): Observable<StakingInfo> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<StakingInfo>('staking/getstakinginfo')),
      catchError(err => this.handleHttpError(err))
    )
  }
}
