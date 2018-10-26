import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WalletComponent }   from './wallet.component';
import { HistoryComponent } from './history/history.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ColdStakingOverviewComponent } from './cold-staking/components/overview/overview.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { SmartContractsComponent } from './smart-contracts/smart-contracts.component';
import { AddressBookComponent } from './address-book/address-book.component';

const routes: Routes = [
  { path: '', component: WalletComponent,
        children: [
        { path: '', redirectTo:'dashboard', pathMatch:'full' },
        { path: 'dashboard', component: DashboardComponent},
        { path: 'history', component: HistoryComponent},
        { path: 'staking', component: ColdStakingOverviewComponent },
        { path: 'advanced', component: AdvancedComponent },
        { path: 'smart-contracts', component: SmartContractsComponent },
        { path: 'address-book', component: AddressBookComponent }
    ]
  },
  { path: 'stratis-wallet', component: WalletComponent,
        children: [
        { path: '', redirectTo:'dashboard', pathMatch:'full' },
        { path: 'dashboard', component: DashboardComponent},
        { path: 'history', component: HistoryComponent},
        { path: 'staking', component: ColdStakingOverviewComponent },
        { path: 'advanced', component: AdvancedComponent },
        { path: 'smart-contracts', component: SmartContractsComponent },
        { path: 'address-book', component: AddressBookComponent }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class WalletRoutingModule {}
