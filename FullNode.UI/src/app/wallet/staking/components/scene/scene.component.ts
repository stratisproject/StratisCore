import { Component, OnInit } from '@angular/core';

import { GlobalService } from '../../../../shared/services/global.service';
import { StakingServiceBase, StakingInfo } from '../../staking.service';

@Component({
  selector: 'app-staking-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class StakingSceneComponent implements OnInit {

    constructor(private globalService: GlobalService, private stakingService: StakingServiceBase) { }

    stakingInfo: StakingInfo;

    ngOnInit() {
        this.stakingService.GetInfo(this.globalService.getWalletName()).subscribe(x => this.stakingInfo = x);
    }

    onSetup() {
    }
}
