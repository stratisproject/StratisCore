import { Component, OnInit } from '@angular/core';
import { SecondsToStringPipe } from "@shared/pipes/seconds-to-string.pipe";
import { GlobalService } from "@shared/services/global.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StratisNodeService } from "@shared/services/real-time/stratis-node.service";
import { StakingService } from "@shared/services/staking-service";

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.css']
})
export class StakingComponent implements OnInit {
  private stakingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private stakingService: StakingService,
    private nodeService: StratisNodeService,
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

  public startStaking(): void {
    const walletData = {
      name: this.globalService.getWalletName(),
      password: this.stakingForm.get('walletPassword').value
    };

    this.stakingService.startStaking(walletData);
  }

  public stopStaking(): void {
    this.stakingService.stopStaking();
  }


}
