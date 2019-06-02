import { Component, OnInit } from '@angular/core';

import { GlobalService } from '@shared/services/global.service';
import { ColdStakingServiceBase } from '../../../cold-staking.service';

export class HistoryItem {
    constructor(public status: string, public side: string, public amount: string, public dateTime: string, public wallet: string) { }
}

@Component({
    selector: 'app-staking-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class ColdStakingHistoryComponent implements OnInit {

    constructor(private globalService: GlobalService, private stakingService: ColdStakingServiceBase) { }

    items: HistoryItem[] = [];

    ngOnInit() {
        this.stakingService.GetHistory(this.globalService.getWalletName()).subscribe(x => {
            this.items = x.map(i => new HistoryItem(i.status, i.side, i.amount, i.dateTime, i.wallet));
        });
    }

}
