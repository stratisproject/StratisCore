import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { DepositConfirmationComponent } from './deposit/confirmation/deposit-confirmation.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawConfirmationComponent } from './withdraw/confirmation/withdraw-confirmation.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
    imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      NgbModule,
      ClipboardModule,
      ReactiveFormsModule,
      SharedModule.forRoot(),
    ],
    declarations: [
      DepositConfirmationComponent,
      DepositComponent,
      WithdrawConfirmationComponent,
      WithdrawComponent
    ],
    exports: [
      DepositConfirmationComponent,
      DepositComponent,
      WithdrawConfirmationComponent,
      WithdrawComponent
    ],
    entryComponents: [
      DepositConfirmationComponent,
      DepositComponent,
      WithdrawConfirmationComponent,
      WithdrawComponent
    ]
})
export class SidechainsModule {}
