import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletComponent }   from './wallet.component';
import { HistoryComponent } from './history/history.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ColdStakingOverviewComponent } from './cold-staking/components/overview/overview.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { SmartContractsComponent } from './smart-contracts/components/smart-contracts.component';
import { AddressBookComponent } from './address-book/address-book.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';

const routes: Routes = [
  { path: 'wallet', component: WalletComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'history', component: HistoryComponent},
    { path: 'staking', component: ColdStakingOverviewComponent },
    { path: 'advanced', component: AdvancedComponent,
      children: [
        { path: '', redirectTo: 'about', pathMatch: 'full'},
        { path: 'about', component: AboutComponent},
        { path: 'extpubkey', component: ExtPubkeyComponent},
        { path: 'generate-addresses', component: GenerateAddressesComponent},
        { path: 'resync', component: ResyncComponent}
      ]
    },
    { path: 'smart-contracts', component: SmartContractsComponent },
    { path: 'address-book', component: AddressBookComponent }
  ]},
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class WalletRoutingModule {}
