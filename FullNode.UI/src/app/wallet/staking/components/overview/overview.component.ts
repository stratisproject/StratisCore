import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '../../../../shared/services/global.service';
import { StakingServiceBase, StakingInfo } from '../../staking.service';
import { StakingCreateAddressComponent } from '../create-address/create-address.component';
import { StakingWithdrawComponent } from '../withdraw/withdraw.component';

@Component({
  selector: 'app-staking-scene',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class StakingOverviewComponent implements OnInit {

    constructor(private globalService: GlobalService, private stakingService: StakingServiceBase, private modalService: NgbModal) { }

    stakingInfo: StakingInfo;

    ngOnInit() {
        this.stakingService.GetInfo(this.globalService.getWalletName()).subscribe(x => this.stakingInfo = x);
    }

    onWalletGetFirstUnusedAddress(walletComponent) {
        this.modalService.open(StakingCreateAddressComponent);
    }

    onWalletWithdraw(walletComponent) {
        this.modalService.open(StakingWithdrawComponent);
    }

    onSetup() {
    }
}
