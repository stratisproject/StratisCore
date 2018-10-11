import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { StakingServiceBase, FakeStakingService } from './staking.service';

import { StakingOverviewComponent } from './components/overview/overview.component';
import { StakingHistoryComponent } from './components/history/history.component';
import { StakingWalletComponent } from './components/wallet/wallet.component';
import { StakingCreateAddressComponent } from './components/create-address/create-address.component';
import { StakingWithdrawComponent } from './components/withdraw/withdraw.component';

@NgModule({
  imports: [
    CommonModule, NgbModalModule
  ],
  providers: [ { provide: StakingServiceBase, useClass: FakeStakingService } ],
  declarations: [ StakingOverviewComponent, StakingHistoryComponent, StakingWalletComponent, StakingCreateAddressComponent, StakingWithdrawComponent ],
  entryComponents: [ StakingCreateAddressComponent, StakingWithdrawComponent ]
})
export class StakingModule { }
