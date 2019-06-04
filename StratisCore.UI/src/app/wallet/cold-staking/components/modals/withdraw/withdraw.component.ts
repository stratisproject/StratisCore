import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';

import { ColdStakingServiceBase } from '../../../cold-staking.service';

type FeeType = { id: number, display: string };

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.css']
})
export class ColdStakingWithdrawComponent implements OnInit {
    private _amount;
    private _amountFormatted = '';
    private _amountSpendable = 0;
    private _destinationAddress = '';
    private _password = '';
    amountSpendableFormatted = '';
    passwordValid = false;
    canWithdraw = false;
    feeTypes: FeeType[] = [
        { id: 0, display: 'Low - 0.0001 STRAT' },
        { id: 1, display: 'Medium - 0.001 STRAT' },
        { id: 2, display: 'High - 0.01 STRAT' },
    ];
    selectedFeeType: FeeType;

    constructor(private globalService: GlobalService, private stakingService: ColdStakingServiceBase, private activeModal: NgbActiveModal) {
        this.selectedFeeType = this.feeTypes[1];
    }

    @Input()
    set amount(value: number) {
        this._amount = value;
        this._amountFormatted = this._amount.toString();
        this.setCanWithdraw();
    }
    get amount(): number {
        return this._amount;
    }

    @Input()
    set destinationAddress(value: string) {
        this._destinationAddress = value;
        this.setCanWithdraw();
    }
    get destinationAddress(): string {
        return this._destinationAddress;
    }

    @Input()
    set password(value: string) {
        this._password = value;
        this.passwordValid = this._password.length > 0;
        this.setCanWithdraw();
    }
    get password(): string {
        return this._password;
    }

    private setCanWithdraw() {
        this.canWithdraw = this._amountFormatted.length && this._destinationAddress.length && this.passwordValid;
    }

    ngOnInit() {
        this.setCanWithdraw();

        this.stakingService.GetInfo(this.globalService.getWalletName()).subscribe(x => {
            this._amountSpendable = x.coldWalletAmount;
            this.amountSpendableFormatted = this._amountSpendable.toLocaleString();
        });
    }

    withdrawClicked() {
    }

    closeClicked = () => this.activeModal.close();
}
