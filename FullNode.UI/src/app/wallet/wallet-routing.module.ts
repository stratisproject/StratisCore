import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WalletComponent }   from './wallet.component';
import { HistoryComponent } from './history/history.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StakingOverviewComponent } from './staking/components/overview/overview.component';

const routes: Routes = [
  { path: '', component: WalletComponent,
        children: [
        { path: '', redirectTo:'dashboard', pathMatch:'full' },
        { path: 'dashboard', component: DashboardComponent},
        { path: 'history', component: HistoryComponent},
        { path: 'staking', component: StakingOverviewComponent }
        ]
  },
  { path: 'stratis-wallet', component: WalletComponent,
        children: [
        { path: '', redirectTo:'dashboard', pathMatch:'full' },
        { path: 'dashboard', component: DashboardComponent},
        { path: 'history', component: HistoryComponent},
        { path: 'staking', component: StakingOverviewComponent }
        ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class WalletRoutingModule {}
