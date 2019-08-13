import { Component, OnInit } from '@angular/core';
import { SecondsToStringPipe } from "@shared/pipes/seconds-to-string.pipe";
import { GlobalService } from "@shared/services/global.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiService } from "@shared/services/api.service";
import { StratisNodeService } from "@shared/services/real-time/stratis-node.service";

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.css']
})
export class StakingComponent implements OnInit {
  private stakingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService : ApiService,
    private nodeService : StratisNodeService,
    private globalService: GlobalService) {
  }

  public spendableBalance: number;
  public stakingEnabled: boolean;
  public stakingActive: boolean;
  public stakingWeight: number;
  public awaitingMaturity: number = 0;
  public netStakingWeight: number;
  public expectedTime: number;
  public dateTime: string;
  public isStarting: boolean;
  public isStopping: boolean;

  public ngOnInit() {
    this.buildStakingForm();
  }

  private buildStakingForm(): void {
    this.stakingForm = this.fb.group({
      "walletPassword": ["", Validators.required]
    });
  }

  private startStaking() {
    this.isStarting = true;
    this.isStopping = false;
    const walletData = {
      name: this.globalService.getWalletName(),
      password: this.stakingForm.get('walletPassword').value
    };
    this.apiService.startStaking(walletData)
      .subscribe(
        response => {
          this.stakingEnabled = true;
          this.stakingForm.patchValue({walletPassword: ""});
          this.getStakingInfo();
        },
        error => {
          this.isStarting = false;
          this.stakingEnabled = false;
          this.stakingForm.patchValue({walletPassword: ""});
        }
      )
    ;
  }

  private stopStaking() {
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

  private getStakingInfo() {
    this.stakingInfoSubscription = this.apiService.getStakingInfo()
      .subscribe(
        response => {
          const stakingResponse = response;
          this.stakingEnabled = stakingResponse.enabled;
          this.stakingActive = stakingResponse.staking;
          this.stakingWeight = stakingResponse.weight;
          this.netStakingWeight = stakingResponse.netStakeWeight;
          this.awaitingMaturity = (this.unconfirmedBalance + this.confirmedBalance) - this.spendableBalance;
          this.expectedTime = stakingResponse.expectedTime;
          this.dateTime = new SecondsToStringPipe().transform(this.expectedTime);
          if (this.stakingActive) {
            this.isStarting = false;
          } else {
            this.isStopping = false;
          }
        }, error => {
          if (error.status === 0) {
          //  this.cancelSubscriptions();
          } else if (error.status >= 400) {
            if (!error.error.errors[0].message) {
            //  this.cancelSubscriptions();
            //  this.startSubscriptions();
            }
          }
        }
      )
    ;
  }


}
