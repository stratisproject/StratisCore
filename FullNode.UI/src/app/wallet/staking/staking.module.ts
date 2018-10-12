import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

import { StakingServiceBase, FakeStakingService } from './staking.service';

import { StakingOverviewComponent } from './components/overview/overview.component';
import { StakingHistoryComponent } from './components/overview/history/history.component';
import { StakingWalletComponent } from './components/overview/wallet/wallet.component';
import { StakingCreateAddressComponent } from './components/modals/create-address/create-address.component';
import { StakingWithdrawComponent } from './components/modals/withdraw/withdraw.component';
import { StakingCreateComponent } from './components/modals/create/create.component';

@NgModule({
  imports: [
    CommonModule, NgbModalModule, ClipboardModule
  ],
  providers: [ { provide: StakingServiceBase, useClass: FakeStakingService } ],

  declarations: [ StakingOverviewComponent, 
                  StakingHistoryComponent, 
                  StakingWalletComponent, 
                  StakingCreateAddressComponent, 
                  StakingWithdrawComponent, 
                  StakingCreateComponent ],
                  
  entryComponents: [ StakingCreateAddressComponent, 
                     StakingWithdrawComponent, 
                     StakingCreateComponent ]
})
export class StakingModule { }
