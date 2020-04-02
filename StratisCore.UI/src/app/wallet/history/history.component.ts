import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { TransactionInfo } from '@shared/models/transaction-info';
import { Observable } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

export class HistoryComponent implements OnInit {
  public walletHistory: Observable<TransactionInfo[]>;
  @Input() public enablePagination: boolean;
  @Input() public enableShowHistoryButton: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;
  private last: TransactionInfo;

  constructor(
    private globalService: GlobalService,
    private router: Router,
    private walletService: WalletService) {
  }

  public transactions: TransactionInfo[];
  public transactionCount: number;
  public coinUnit: string;

  public ngOnInit(): void {
    this.walletHistory = this.walletService.walletHistory()
      .pipe(
        tap((historyItems) => {
          this.transactionCount = historyItems ? historyItems.length : 0;
        }));
    this.coinUnit = this.globalService.getCoinUnit();
  }

  public onDashboardClicked(): void {
    this.router.navigate(['/wallet']);
  }
}
