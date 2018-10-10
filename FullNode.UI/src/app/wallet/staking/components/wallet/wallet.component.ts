import { Component, OnInit, Input } from '@angular/core';

import { StakingServiceBase } from '../../staking.service';

@Component({
  selector: 'app-staking-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class StakingWalletComponent implements OnInit {

    private _hotWallet = false;
    private _balance = '0';
    private _amount = '0';
    description = '';

    constructor(private service: StakingServiceBase) { 
    }

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

    ngOnInit() {
    }

    onGetFirstUnusedAddress() {
    }

    onWithdraw() {
        
    }
}
