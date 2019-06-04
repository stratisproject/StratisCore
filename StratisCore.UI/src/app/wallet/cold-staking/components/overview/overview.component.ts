import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '@shared/services/global.service';
import { ColdStakingServiceBase, ColdStakingInfo } from '../../cold-staking.service';
import { ColdStakingCreateAddressComponent } from '../modals/create-address/create-address.component';
import { ColdStakingWithdrawComponent } from '../modals/withdraw/withdraw.component';
import { ColdStakingCreateComponent } from '../modals/create/create.component';

@Component({
    selector: 'app-staking-scene',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class ColdStakingOverviewComponent implements OnInit {

    constructor(private globalService: GlobalService, private stakingService: ColdStakingServiceBase, private modalService: NgbModal) { }

    stakingInfo: ColdStakingInfo;

    ngOnInit() {
        this.stakingService.GetInfo(this.globalService.getWalletName()).subscribe(x => this.stakingInfo = x);
    }

    onWalletGetFirstUnusedAddress(walletComponent) {
        this.modalService.open(ColdStakingCreateAddressComponent);
    }

    onWalletWithdraw(walletComponent) {
        this.modalService.open(ColdStakingWithdrawComponent);
    }

    onSetup() {
        this.modalService.open(ColdStakingCreateComponent);
    }
}
