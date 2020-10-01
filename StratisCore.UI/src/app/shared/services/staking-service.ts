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
  public stakingEnabled = new BehaviorSubject<boolean>(false);
  public isStopping: boolean;
  public isStarting: boolean;
  public canStake: boolean;

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    signalRService: SignalRService,
    errorService: ErrorService) {
    super(globalService, http, errorService);

    this.canStake = !globalService.getSidechainEnabled();

    signalRService.registerOnMessageEventHandler<StakingInfoSignalREvent>(
      SignalREvents.StakingInfo, (stakingInfo) => {
        if (stakingInfo.enabled !== this.stakingEnabled.value) {
          this.stakingEnabled.next(stakingInfo.enabled);
        }
        this.stakingInfoUpdatedSubject.next(stakingInfo);
      });
  }

  public startStaking(walletData: any): Promise<boolean> {
    this.isStarting = true;
    this.isStopping = false;

    return this.invokeStartStakingApiCall(walletData)
      .toPromise().then(
      () => {
        this.stakingEnabled.next(true);
        this.isStarting = false;
        return true;
      },
      error => {
        Log.error(error);
        this.stakingEnabled.next(false);
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
          this.stakingEnabled.next(false);
          this.isStopping = false;
          return true;
        }, () => {
          this.stakingEnabled.next(false);
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
        this.stakingEnabled.next(false);
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
