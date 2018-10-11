import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { StakingServiceBase, FakeStakingService } from './staking.service';

import { StakingOverviewComponent } from './components/overview/overview.component';
import { StakingHistoryComponent } from './components/overview/history/history.component';
import { StakingWalletComponent } from './components/overview/wallet/wallet.component';
import { StakingCreateAddressComponent } from './components/modals/create-address/create-address.component';
import { StakingWithdrawComponent } from './components/modals/withdraw/withdraw.component';

@NgModule({
  imports: [
    CommonModule, NgbModalModule
  ],
  providers: [ { provide: StakingServiceBase, useClass: FakeStakingService } ],
  declarations: [ StakingOverviewComponent, StakingHistoryComponent, StakingWalletComponent, StakingCreateAddressComponent, StakingWithdrawComponent ],
  entryComponents: [ StakingCreateAddressComponent, StakingWithdrawComponent ]
})
export class StakingModule { }
