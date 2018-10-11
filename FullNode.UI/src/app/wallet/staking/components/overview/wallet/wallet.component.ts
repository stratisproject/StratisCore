import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-staking-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.css']
})
export class StakingWalletComponent {

    private _hotWallet = false;
    private _balance = '0';
    private _amount = '0';
    description = '';
    @Output() onGetFirstUnusedAddress = new EventEmitter<StakingWalletComponent>();
    @Output() onWithdraw = new EventEmitter<StakingWalletComponent>();

    @Input()
    set hotWallet(value: boolean) {
        this._hotWallet = value;
        this.description = value ? 'Coins that you can only stake but other wallets can spend' : 'Coins blah to be defined';
    }
    get hotWallet(): boolean {
        return this._hotWallet;
    }

    @Input()
    set balance(value: string) {
        this._balance = Number(value).toLocaleString();
    }
    get balance(): string {
        return this._balance;
    }

    @Input()
    set amount(value: string) {
        this._amount = Number(value).toLocaleString();
    }
    get amount(): string {
        return this._amount;
    }

    unusedAddressClicked = () => this.onGetFirstUnusedAddress.emit(this);
    withdrawClicked = () => this.onWithdraw.emit(this);
}
