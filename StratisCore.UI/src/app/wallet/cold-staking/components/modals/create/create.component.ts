import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '@shared/services/global.service';

import { ColdStakingServiceBase } from '../../../cold-staking.service';
import { ColdStakingCreateSuccessComponent } from '../create-success/create-success.component';
import { Router } from '@angular/router';

type FeeType = { id: number, display: string };
enum HotColdWallet { Hot = 1, Cold };

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css']
})
export class ColdStakingCreateComponent {
    private _amount;
    private _amountFormatted = '';
    private _destinationAddress = '';
    private _password = '';
    passwordValid = false;
    canCreate = false;
    opacity = 1;
    feeTypes: FeeType[] = [
        { id: 0, display: 'Low - 0.0001 STRAT' },
        { id: 1, display: 'Medium - 0.001 STRAT' },
        { id: 2, display: 'High - 0.01 STRAT' },
    ];
    selectedFeeType: FeeType;
    HotColdWalletEnum = HotColdWallet;
    hotColdWalletSelection = HotColdWallet.Hot;

    constructor(private globalService: GlobalService, private stakingService: ColdStakingServiceBase,
        private activeModal: NgbActiveModal, private modalService: NgbModal, private routerService: Router) {
        this.selectedFeeType = this.feeTypes[1];
        this.setCanCreate();
    }

    @Input()
    set amount(value: number) {
        this._amount = value;
        this._amountFormatted = this._amount.toString();
        this.setCanCreate();
    }
    get amount(): number {
        return this._amount;
    }

    @Input()
    set destinationAddress(value: string) {
        this._destinationAddress = value;
        this.setCanCreate();
    }
    get destinationAddress(): string {
        return this._destinationAddress;
    }

    @Input()
    set password(value: string) {
        this._password = value;
        this.passwordValid = this._password.length > 0;
        this.setCanCreate();
    }
    get password(): string {
        return this._password;
    }

    private setCanCreate() {
        this.canCreate = this._amountFormatted.length && this._destinationAddress.length && this.passwordValid;
    }

    createClicked() {
        this.stakingService.CreateColdstaking(this.globalService.getWalletName())
            .subscribe(success => {
                if (success) {
                    this.opacity = .5;
                    this.modalService.open(ColdStakingCreateSuccessComponent, { backdrop: 'static' }).result
                        .then(_ => this.activeModal.close());
                }
            });
    }

    closeClicked = () => this.activeModal.close();
}
