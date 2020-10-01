import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { WalletBalance } from '@shared/services/interfaces/api.i';
import { WalletService } from '@shared/services/wallet.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: Animations.fadeIn
})
export class DashboardComponent implements OnInit {

  public wallet: Observable<WalletBalance>;
  public transactionCount: Observable<number>;

  constructor(
    public walletService: WalletService,
    public globalService: GlobalService) {
  }

  public ngOnInit(): void {
    this.wallet = this.walletService.wallet();
    this.transactionCount = this.walletService.walletHistory().pipe(map(items => items ? items.length : 0));
  }
}
