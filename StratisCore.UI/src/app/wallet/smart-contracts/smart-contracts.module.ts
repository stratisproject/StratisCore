import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SmartContractsServiceBase, FakeSmartContractsService } from './smart-contracts.service';
import { SmartContractsComponent } from './components/smart-contracts.component';

@NgModule({
    imports: [
        CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule
    ],

    providers: [{ provide: SmartContractsServiceBase, useClass: FakeSmartContractsService }],

    declarations: [
        SmartContractsComponent
    ]
})
export class SmartContractsModule { }
