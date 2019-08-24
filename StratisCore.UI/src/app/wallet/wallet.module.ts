import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap';

import { AddressBookComponent } from './address-book/address-book.component';
import { AddNewAddressComponent } from './address-book/modals/add-new-address/add-new-address.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';
import { ColdStakingModule } from './cold-staking/cold-staking.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component';
import { MenuComponent } from './menu/menu.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendConfirmationComponent } from './send/send-confirmation/send-confirmation.component';
import { SendComponent } from './send/send.component';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { TokensModule } from './tokens/tokens.module';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';

@NgModule({
  imports: [
    SharedModule,
    WalletRoutingModule,
    ColdStakingModule,
    SmartContractsModule.forRoot(),
    TokensModule,
    BsDatepickerModule.forRoot()
  ],
  declarations: [
    WalletComponent,
    MenuComponent,
    DashboardComponent,
    SendComponent,
    ReceiveComponent,
    SendConfirmationComponent,
    TransactionDetailsComponent,
    LogoutConfirmationComponent,
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
  entryComponents: [
    SendComponent,
    SendConfirmationComponent,
    ReceiveComponent,
    TransactionDetailsComponent,
    LogoutConfirmationComponent
  ]
})

export class WalletModule { }
