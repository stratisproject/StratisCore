import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '@shared/services/global.service';
import { ColdStakingServiceBase, ColdStakingInfo } from '../../cold-staking.service';
import { ColdStakingCreateAddressComponent } from '../modals/create-address/create-address.component';
import { ColdStakingWithdrawComponent } from '../modals/withdraw/withdraw.component';
import { ColdStakingCreateComponent } from '../modals/create/create.component';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'app-staking-scene',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: Animations.fadeIn
})
export class ColdStakingOverviewComponent implements OnInit {

  constructor(private globalService: GlobalService, private stakingService: ColdStakingServiceBase, private modalService: NgbModal) {
  }

  stakingInfo: ColdStakingInfo;

  ngOnInit(): void {
    this.stakingService.GetInfo(this.globalService.getWalletName()).subscribe(x => this.stakingInfo = x);
  }

  onWalletGetFirstUnusedAddress(walletComponent): void {
    this.modalService.open(ColdStakingCreateAddressComponent);
  }

  onWalletWithdraw(walletComponent): void {
    this.modalService.open(ColdStakingWithdrawComponent);
  }

  onSetup(): void {
    this.modalService.open(ColdStakingCreateComponent);
  }
}
