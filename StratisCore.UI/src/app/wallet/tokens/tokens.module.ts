import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { ClipboardModule } from 'ngx-clipboard';

import { SmartContractsModule } from '../smart-contracts/smart-contracts.module';
import { TokensComponent } from './components/tokens.component';
import { Log } from './services/logger.service';
import { StorageService } from './services/storage.service';
import { TokensService, TokensServiceBase } from './services/tokens.service';

@NgModule({
  imports: [
    CommonModule, NgbModalModule, ClipboardModule, FormsModule, ReactiveFormsModule, SharedModule, SmartContractsModule
  ],

  providers: [{ provide: TokensServiceBase, useClass: TokensService }, StorageService, Log],

  declarations: [
    TokensComponent
  ],

  entryComponents: [
  ]
})
export class TokensModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TokensModule,
      providers: [
        { provide: TokensServiceBase, useClass: TokensService },
        { provide: Log, useClass: Log },
        { provide: StorageService, useClass: StorageService }
      ]
    };
  }
}
