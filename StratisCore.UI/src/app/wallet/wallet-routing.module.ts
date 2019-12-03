import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddressBookComponent } from './address-book/address-book.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';
import { ColdStakingOverviewComponent } from './cold-staking/components/overview/overview.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { SmartContractsComponent } from './smart-contracts/components/smart-contracts.component';
import { TokensComponent } from './tokens/components/tokens.component';
import { WalletComponent } from './wallet.component';
import { AccountSelectedGuard } from '@shared/guards/account-selected.guard';
import { ReceiveComponent } from "./receive/receive.component";
import { SendComponent } from "./send/send.component";
import { BlockExplorerComponent } from "./block-explorer/block-explorer.component";

const routes: Routes = [
  {
    path: 'wallet', component: WalletComponent, children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'send', component: SendComponent},
      {path: 'receive', component: ReceiveComponent},
      {path: 'history', component: HistoryComponent},
      {path: 'staking', component: ColdStakingOverviewComponent},
      {
        path: 'advanced', component: AdvancedComponent,
        children: [
          {path: '', redirectTo: 'about', pathMatch: 'full'},
          {path: 'about', component: AboutComponent},
          {path: 'extpubkey', component: ExtPubkeyComponent},
          {path: 'generate-addresses', component: GenerateAddressesComponent},
          {path: 'resync', component: ResyncComponent}
        ]
      },
      {path: 'smart-contracts', component: SmartContractsComponent, canActivate: [AccountSelectedGuard]},
      {path: 'tokens', component: TokensComponent, canActivate: [AccountSelectedGuard]},
      {path: 'address-book', component: AddressBookComponent},
      {path: 'explorer', component: BlockExplorerComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class WalletRoutingModule {
}
