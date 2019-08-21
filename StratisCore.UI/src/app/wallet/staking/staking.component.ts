import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StakingService } from '@shared/services/staking-service';
import { Observable } from 'rxjs';
import { StakingInfo, WalletBalance } from '@shared/services/interfaces/api.i';
import { WalletService } from '@shared/services/wallet.service';

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.css']
})
export class StakingComponent implements OnInit {
  private stakingForm: FormGroup;
  public wallet: Observable<WalletBalance>;
  public stakingInfo: Observable<StakingInfo>;

  constructor(
    private fb: FormBuilder,
    private stakingService: StakingService,
    private walletService: WalletService,
    private globalService: GlobalService) {
  }

  public ngOnInit() {
    this.buildStakingForm();
    this.wallet = this.walletService.wallet();
    this.stakingInfo = this.stakingService.stakingInfo();
  }

  private buildStakingForm(): void {
    this.stakingForm = this.fb.group({
      'walletPassword': ['', Validators.required]
    });
  }

  public startStaking(): void {
    const walletData = {
      name: this.globalService.getWalletName(),
      password: this.stakingForm.get('walletPassword').value
    };

    this.stakingForm.patchValue({walletPassword: ''});

    this.stakingService.startStaking(walletData);
  }

  public stopStaking(): void {
    this.stakingService.stopStaking();
  }
}
