import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';

import { SharedModule } from '../shared/shared.module';
import { WalletRoutingModule } from './wallet-routing.module';
import { ColdStakingModule } from './cold-staking/cold-staking.module';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';

import { WalletComponent } from './wallet.component';
import { MenuComponent } from './menu/menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AddressBookComponent } from './address-book/address-book.component';
import { AddNewAddressComponent } from './address-book/modals/add-new-address/add-new-address.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    SharedModule.forRoot(),
    NgbModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    WalletRoutingModule,
    ColdStakingModule,
    SmartContractsModule,
    HttpClientModule,
  ],
  declarations: [
    WalletComponent,
    MenuComponent,
    DashboardComponent,
    HistoryComponent,
    StatusBarComponent,
    AdvancedComponent,
    AddressBookComponent,
    AddNewAddressComponent,
    ExtPubkeyComponent,
    AboutComponent,
    GenerateAddressesComponent,
    ResyncComponent
  ],
  providers: [],
  exports: []
})

export class WalletModule { }
