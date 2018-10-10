import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StakingServiceBase, FakeStakingService } from './staking.service';

import { StakingSceneComponent } from './components/scene/scene.component';
import { StakingHistoryComponent } from './components/history/history.component';
import { StakingWalletComponent } from './components/wallet/wallet.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [ { provide: StakingServiceBase, useClass: FakeStakingService } ],
  declarations: [ StakingSceneComponent, StakingHistoryComponent, StakingWalletComponent ]
})
export class StakingModule { }
