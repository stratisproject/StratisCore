import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TransactionInfo } from '@shared/models/transaction-info';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  public transactions: Observable<TransactionInfo[]>;
  @Input() public enablePagination: boolean;
  @Input() public enableShowHistoryButton: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;
  @Output() public rowClicked: EventEmitter<TransactionInfo> = new EventEmitter();
  public pageNumber = 1;

  public constructor(
    private globalService: GlobalService,
    private walletService: WalletService,
    private router: Router,
    private modalService: NgbModal) {
  }

  public ngOnInit(): void {
    this.transactions = this.walletService.walletHistory()
      .pipe(map((historyItems => {
        return (null != historyItems && historyItems.length > 0)
          ? TransactionInfo.mapFromTransactionsHistoryItems(historyItems, this.maxTransactionCount)
          : null;
      })));
  }

  public openTransactionDetailDialog(transaction: TransactionInfo): void {
    this.rowClicked.emit(transaction);
    const modalRef = this.modalService.open(TransactionDetailsComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.transaction = transaction;
  }

  public goToHistory(): Promise<boolean> {
    return this.router.navigate(['/wallet/history']);
  }
}
