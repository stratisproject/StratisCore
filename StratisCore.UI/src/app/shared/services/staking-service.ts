import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StakingInfo } from '@shared/services/interfaces/api.i';
import { catchError } from 'rxjs/operators';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { SignalRService } from '@shared/services/signalr-service';
import {
  SignalREvents,
  StakingInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';
import { Log } from '../../wallet/tokens/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class StakingService extends RestApi {
  private stakingInfoUpdatedSubject = new BehaviorSubject<StakingInfo>(null);
  public isStopping: boolean;
  public isStarting: boolean;
  public stakingEnabled: boolean;

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    signalRService: SignalRService,
    errorService: ErrorService) {
    super(globalService, http, errorService);
    signalRService.registerOnMessageEventHandler<StakingInfoSignalREvent>(
      SignalREvents.StakingInfo, (stakingInfo) => {
        if (stakingInfo.enabled !== this.stakingEnabled) {
          this.stakingEnabled = stakingInfo.enabled;
        }
        this.stakingInfoUpdatedSubject.next(stakingInfo);
      });
  }

  public startStaking(walletData: any): void {
    this.isStarting = true;
    this.isStopping = false;

    this.invokeStartStakingApiCall(walletData)
      .toPromise().then(
      () => {
        this.stakingEnabled = true;
        this.isStarting = false;
        return true;
      },
      error => {
        Log.error(error);
        this.stakingEnabled = false;
        this.isStarting = false;
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
          return true;
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
        return this.handleHttpError(err);
      })
    );
  }

  public invokeStopStakingApiCall(): Observable<any> {
    return this.post('staking/stopstaking', 'true').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }
}
