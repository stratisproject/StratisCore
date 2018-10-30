import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SmartContractsComponent } from './components/smart-contracts.component';

@NgModule({
    imports: [
        CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule
    ],
    //providers: [{ provide: ColdStakingServiceBase, useClass: FakeColdStakingService }],

    declarations: [
        SmartContractsComponent
    ]

    // entryComponents: [ColdStakingCreateAddressComponent,
    //     ColdStakingWithdrawComponent,
    //     ColdStakingCreateComponent,
    //     ColdStakingCreateSuccessComponent]
})
export class SmartContractsModule { }
