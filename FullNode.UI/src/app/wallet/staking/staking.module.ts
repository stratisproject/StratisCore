import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StakingService } from './staking.service';

import { StakingSceneComponent } from './components/scene/scene.component';
import { StakingHistoryComponent } from './components/history/history.component';
import { StakingWalletComponent } from './components/wallet/wallet.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [ StakingService ],
  declarations: [ StakingSceneComponent, StakingHistoryComponent, StakingWalletComponent ]
})
export class StakingModule { }
