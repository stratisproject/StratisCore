import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SmartContractsServiceBase, FakeSmartContractsService } from './smart-contracts.service';
import { SmartContractsComponent } from './components/smart-contracts.component';
import { CallTransactionComponent } from './components/modals/call-transaction/call-transaction.component';
import { CreateNewTransactionComponent } from './components/modals/create-new-transaction/create-new-transaction.component';

@NgModule({
    imports: [
        CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule
    ],

    providers: [{ provide: SmartContractsServiceBase, useClass: FakeSmartContractsService }],

    declarations: [
        SmartContractsComponent,
        CallTransactionComponent,
        CreateNewTransactionComponent
    ],

    entryComponents: [
        CallTransactionComponent, CreateNewTransactionComponent
    ]
})
export class SmartContractsModule { }
