import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinNotationPipe } from './pipes/coin-notation.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { PasswordValidationDirective } from './directives/password-validation.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxElectronModule } from 'ngx-electron';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ClipboardModule } from 'ngx-clipboard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GenericModalComponent } from './components/generic-modal/generic-modal.component';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ CoinNotationPipe, AutoFocusDirective, PasswordValidationDirective, GenericModalComponent ],
  exports: [ CommonModule, ReactiveFormsModule, FormsModule, NgbModule, NgxElectronModule, NgxQRCodeModule, NgxPaginationModule, ClipboardModule, GenericModalComponent, CoinNotationPipe, AutoFocusDirective, PasswordValidationDirective ],
  entryComponents: [ GenericModalComponent ]
})

export class SharedModule { }
