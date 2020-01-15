import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from '@shared/services/global.service';
import { StakingInfo, WalletBalance } from '@shared/services/interfaces/api.i';
import { StakingService } from '@shared/services/staking-service';
import { WalletService } from '@shared/services/wallet.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.scss']
})
export class StakingComponent implements OnInit {
  @Input() public wallet: WalletBalance;
  public stakingForm: FormGroup;
  public stakingInfo: Observable<StakingInfo>;
  public coinUnit = '';

  constructor(
    private fb: FormBuilder,
    public stakingService: StakingService,
    public walletService: WalletService,
    public globalService: GlobalService) {
      this.coinUnit = globalService.coinUnit;
  }

  public ngOnInit(): void {
    this.buildStakingForm();
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
