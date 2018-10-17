import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ColdStakingServiceBase, FakeColdStakingService } from './cold-staking.service';

import { ColdStakingOverviewComponent } from './components/overview/overview.component';
import { ColdStakingHistoryComponent } from './components/overview/history/history.component';
import { ColdStakingWalletComponent } from './components/overview/wallet/wallet.component';
import { ColdStakingCreateAddressComponent } from './components/modals/create-address/create-address.component';
import { ColdStakingWithdrawComponent } from './components/modals/withdraw/withdraw.component';
import { ColdStakingCreateComponent } from './components/modals/create/create.component';
import { ColdStakingCreateSuccessComponent } from './components/modals/create-success/create-success.component';

@NgModule({
    imports: [
        CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule
    ],
    providers: [{ provide: ColdStakingServiceBase, useClass: FakeColdStakingService }],

    declarations: [ColdStakingOverviewComponent,
        ColdStakingHistoryComponent,
        ColdStakingWalletComponent,
        ColdStakingCreateAddressComponent,
        ColdStakingWithdrawComponent,
        ColdStakingCreateComponent,
        ColdStakingCreateSuccessComponent],

    entryComponents: [ColdStakingCreateAddressComponent,
        ColdStakingWithdrawComponent,
        ColdStakingCreateComponent,
        ColdStakingCreateSuccessComponent]
})
export class ColdStakingModule { }
