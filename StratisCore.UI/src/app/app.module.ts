import 'reflect-metadata';
import '../polyfills';
import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxElectronModule } from 'ngx-electron';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { GenericModalComponent } from './shared/components/generic-modal/generic-modal.component';

import { SendComponent } from './wallet/send/send.component';
import { SendConfirmationComponent } from './wallet/send/send-confirmation/send-confirmation.component';
import { ReceiveComponent } from './wallet/receive/receive.component';
import { TransactionDetailsComponent } from './wallet/transaction-details/transaction-details.component';
import { LogoutConfirmationComponent } from './wallet/logout-confirmation/logout-confirmation.component';
import { ApiInterceptor } from './shared/http-interceptors/api-interceptor';

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ClipboardModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgxElectronModule,
    NgxQRCodeModule,
    NgxPaginationModule,
    SharedModule
  ],
  declarations: [
    AppComponent,
    GenericModalComponent,
    LoginComponent,
    LogoutConfirmationComponent,
    SendComponent,
    SendConfirmationComponent,
    ReceiveComponent,
    TransactionDetailsComponent
  ],
  entryComponents: [
    GenericModalComponent,
    SendComponent,
    SendConfirmationComponent,
    ReceiveComponent,
    TransactionDetailsComponent,
    LogoutConfirmationComponent
  ],
  providers: [ Title, { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true} ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
