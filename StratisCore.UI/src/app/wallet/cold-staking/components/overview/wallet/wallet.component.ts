import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-staking-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.css']
})
export class ColdStakingWalletComponent {

    private _hotWallet = false;
    private _balance = 0;
    private _amount = 0;
    balanceFormatted = '';
    amountFormatted = '';
    description = '';
    @Output() onGetFirstUnusedAddress = new EventEmitter<ColdStakingWalletComponent>();
    @Output() onWithdraw = new EventEmitter<ColdStakingWalletComponent>();

    @Input()
    set hotWallet(value: boolean) {
        this._hotWallet = value;
        this.description = value ? 'Coins that you can only stake but other wallets can spend' : 'Coins blah to be defined';
    }
    get hotWallet(): boolean {
        return this._hotWallet;
    }

    @Input()
    set balance(value: number) {
        this._balance = value;
        this.balanceFormatted = this._balance.toLocaleString();
    }

    @Input()
    set amount(value: number) {
        this._amount = value;
        this.amountFormatted = this._amount.toLocaleString();
    }

    unusedAddressClicked = () => this.onGetFirstUnusedAddress.emit(this);
    withdrawClicked = () => this.onWithdraw.emit(this);
}
