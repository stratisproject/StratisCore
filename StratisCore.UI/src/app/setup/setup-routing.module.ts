import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupComponent } from './setup.component';
import { CreateComponent } from './create/create.component';
import { ShowMnemonicComponent } from './create/show-mnemonic/show-mnemonic.component';
import { ConfirmMnemonicComponent } from './create/confirm-mnemonic/confirm-mnemonic.component';
import { RecoverComponent } from './recover/recover.component';

const routes: Routes = [
  { path: 'setup', component: SetupComponent },
  { path: 'setup/create', component: CreateComponent },
  { path: 'setup/create/show-mnemonic', component: ShowMnemonicComponent },
  { path: 'setup/create/confirm-mnemonic', component: ConfirmMnemonicComponent },
  { path: 'setup/recover', component: RecoverComponent }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ]
})

export class SetupRoutingModule { }
