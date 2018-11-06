import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SmartContractsServiceBase, SmartContractsService, FakeSmartContractsService } from './smart-contracts.service';
import { SmartContractsComponent } from './components/smart-contracts.component';
import { TransactionComponent } from './components/modals/transaction/transaction.component';

@NgModule({
    imports: [
        CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule
    ],

    providers: [{ provide: SmartContractsServiceBase, useClass: SmartContractsService }],

    declarations: [
        SmartContractsComponent,
        TransactionComponent
    ],

    entryComponents: [
        TransactionComponent
    ]
})
export class SmartContractsModule { }
