import { Component, OnInit, Input } from '@angular/core';

import { StakingType } from '../../enums';
import { StakingService } from '../../staking.service';

@Component({
  selector: 'app-staking-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class StakingWalletComponent implements OnInit {

    private _stakingType = StakingType.None;

    constructor(private service: StakingService) { }

    balance = '';
    description = '';

    @Input() 
    set stakingType(value: StakingType) {
        if (value !== this._stakingType) {
            this._stakingType = value;
            this.description = value === StakingType.Hot ? 'Coins that you can only stake but other wallets can spend.' : 'Coins blah to be defined';
        }
    }
    get stakingType(): StakingType {
        return this._stakingType;
    }

    ngOnInit() {
    }

    onGenerateNewAddress() {
    }
}
