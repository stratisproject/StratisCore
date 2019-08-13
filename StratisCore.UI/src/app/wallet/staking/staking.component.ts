import { Component, OnInit } from '@angular/core';
import { GlobalService } from "@shared/services/global.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StakingService } from "@shared/services/staking-service";
import { Observable } from "rxjs";
import { WalletBalance } from "@shared/services/interfaces/api.i";
import { NodeService } from "@shared/services/node.service";

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.css']
})
export class StakingComponent implements OnInit {
  private stakingForm: FormGroup;
  public wallet : Observable<WalletBalance>;
  constructor(
    private fb: FormBuilder,
    private stakingService: StakingService,
    private nodeService: NodeService,
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
    this.wallet = this.nodeService.wallet(this.globalService.currentWallet);
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
