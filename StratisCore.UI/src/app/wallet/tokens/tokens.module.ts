import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { ClipboardModule } from 'ngx-clipboard';

import { TokensComponent } from './components/tokens.component';
import { Log } from './services/logger.service';
import { StorageService } from './services/storage.service';
import { TokensService } from './services/tokens.service';
import { AddTokenComponent } from './components/add-token/add-token.component';
import { SmartContractsModule } from '../smart-contracts/smart-contracts.module';
import { TransactionComponent } from '../smart-contracts/components/modals/transaction/transaction.component';
import { IssueTokenComponent } from './components/issue-token/issue-token.component';

@NgModule({
  imports: [
    CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule, SharedModule, SmartContractsModule.forRoot()
  ],

  providers: [TokensService, StorageService, Log],

  declarations: [
    TokensComponent,
    AddTokenComponent,
    IssueTokenComponent
  ],

  entryComponents: [
    AddTokenComponent,
    TransactionComponent
  ]
})
export class TokensModule { }
