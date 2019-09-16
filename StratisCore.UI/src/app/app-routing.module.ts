import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { AddressSelectionComponent } from './wallet/smart-contracts/components/address-selection/address-selection.component';

const routes: Routes = [
  { path: 'app', component: AppComponent},
  { path: 'login', component: LoginComponent },
  { path: 'address-selection', component: AddressSelectionComponent },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'app', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
