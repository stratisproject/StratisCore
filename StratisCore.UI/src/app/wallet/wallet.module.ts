import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { WalletRoutingModule } from './wallet-routing.module';
import { ColdStakingModule } from './cold-staking/cold-staking.module';

import { WalletComponent } from './wallet.component';
import { MenuComponent } from './menu/menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AdvancedService } from '../wallet/advanced/advanced.service';
import { FeedbackComponent } from './advanced/feedback/feedback.component';
import { SmartContractsComponent } from './smart-contracts/smart-contracts.component';
import { AddressBookComponent } from './address-book/address-book.component';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    SharedModule.forRoot(),
    NgbModule,
    ReactiveFormsModule,
    WalletRoutingModule,
    ColdStakingModule,
    HttpClientModule,
  ],
  declarations: [
    WalletComponent,
    MenuComponent,
    DashboardComponent,
    HistoryComponent,
    StatusBarComponent,
    AdvancedComponent,
    FeedbackComponent,
    SmartContractsComponent,
    AddressBookComponent
  ],
  providers: [
    AdvancedService
  ],
  exports: []
})

export class WalletModule { }
