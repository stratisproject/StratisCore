import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardService } from 'ngx-clipboard';

import { ColdStakingServiceBase } from '../../../cold-staking.service';
import { GlobalService } from '@shared/services/global.service';

@Component({
    selector: 'app-create-address',
    templateUrl: './create-address.component.html',
    styleUrls: ['./create-address.component.css']
})
export class ColdStakingCreateAddressComponent implements OnInit {

    constructor(private globalService: GlobalService, private stakingService: ColdStakingServiceBase,
        private activeModal: NgbActiveModal, private clipboardService: ClipboardService) { }

    address = '';
    addressCopied = false;

    ngOnInit() {
        this.stakingService.GetAddress(this.globalService.getWalletName()).subscribe(x => this.address = x);
    }

    closeClicked() {
        this.activeModal.close();
    }

    copyClicked() {
        if (this.address) {
            this.addressCopied = this.clipboardService.copyFromContent(this.address);
        }
    }
}
