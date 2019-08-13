import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { GlobalService } from "@shared/services/global.service";
import { ApiService } from "@shared/services/api.service";
import { SecondsToStringPipe } from "@shared/pipes/seconds-to-string.pipe";
import { StakingInfo } from "@shared/services/interfaces/api.i";

@Injectable({
  providedIn: "root"
})
export class StakingService {
  private stakingInfoUpdatedSubject = new Subject<StakingInfo>();
  private isStopping: boolean;
  private isStarting: boolean;
  private isStaking : boolean;

  private unconfirmedBalance: number;
  private confirmedBalance: number;

  public stakingEnabled: boolean;

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService) {
  }

  public startStaking(walletData: any): void {

    this.isStarting = true;
    this.isStopping = false;

    this.apiService.startStaking(walletData)
      .subscribe(
        response => {
          this.stakingEnabled = true;
          //this.stakingForm.patchValue({walletPassword: ""});
          //this.getStakingInfo();
        },
        error => {
          this.isStarting = false;
          this.stakingEnabled = false;
          //this.stakingForm.patchValue({walletPassword: ""});
        }
      )
    ;
  }

  public stopStaking(): void {
    this.isStopping = true;
    this.isStarting = false;
    this.apiService.stopStaking()
      .subscribe(
        response => {
          this.stakingEnabled = false;
        }
      )
    ;
  }

  public stakingInfo(): Observable<StakingInfo> {
    return this.stakingInfoUpdatedSubject.asObservable();
  }

  private getStakingInfo(): void {
    this.apiService.getStakingInfo()
      .subscribe(
        response => {
          this.stakingInfoUpdatedSubject.next(response);

          // TODO: this.awaitingMaturity = (this.unconfirmedBalance + this.confirmedBalance) - this.spendableBalance;

          // if (this.stakingActive) {
          //   this.isStarting = false;
          // } else {
          //   this.isStopping = false;
          // }
          // this.dateTime = new SecondsToStringPipe().transform(this.expectedTime);

          // const stakingResponse = response;
          // this.stakingEnabled = stakingResponse.enabled;
          // this.stakingActive = stakingResponse.staking;
          // this.stakingWeight = stakingResponse.weight;
          // this.netStakingWeight = stakingResponse.netStakeWeight;

          // this.expectedTime = stakingResponse.expectedTime;
        }
      );
  }
}
