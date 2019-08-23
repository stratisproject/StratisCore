import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { TransactionInfo } from '@shared/models/transaction-info';
import { Observable } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

export class HistoryComponent implements OnInit {
  private walletHistory: Observable<TransactionInfo[]>;
  @Input() public enablePagination: boolean;
  @Input() public enableShowHistoryButton: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;

  constructor(
    private walletService: WalletService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private genericModalService: ModalService,
    private router: Router) {
  }

  public transactions: TransactionInfo[];
  public coinUnit: string;
  public pageNumber = 1;

  public ngOnInit(): void {
    this.walletHistory = this.walletService.walletHistory()
      .pipe(map(historyItems => {
        return TransactionInfo.mapFromTransactionsHistoryItems(historyItems);
      }));
    this.coinUnit = this.globalService.getCoinUnit();
  }

  public onDashboardClicked(): void {
    this.router.navigate(['/wallet']);
  }
}
