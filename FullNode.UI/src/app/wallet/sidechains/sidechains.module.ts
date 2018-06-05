import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { SettingsComponent } from './settings/settings.component';
import { SidechainsService } from './services/sidechains.service';

const COMPONENTS = [
  DepositComponent,
  WithdrawComponent,
  SettingsComponent
];

@NgModule({
    imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      NgbModule,
      ClipboardModule,
      ReactiveFormsModule,
      SharedModule.forRoot()
    ],
    declarations: [
      COMPONENTS
    ],
    exports: [
      COMPONENTS
    ],
    entryComponents: [
      COMPONENTS
    ],
    providers: [SidechainsService]
})
export class SidechainsModule {
  static forRoot(): ModuleWithProviders {
    return {
        ngModule: SidechainsModule,
        providers: [SidechainsService]
    };
}
}

