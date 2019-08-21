import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { TransactionInfo } from '@shared/models/transaction-info';
import { Subscription } from 'rxjs';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
import { WalletService } from '@shared/services/wallet.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

export class HistoryComponent implements OnInit, OnDestroy {
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
  private walletHistorySubscription: Subscription;

  ngOnInit() {
    this.startSubscriptions();
    this.coinUnit = this.globalService.getCoinUnit();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onDashboardClicked() {
    this.router.navigate(['/wallet']);
  }

  private openTransactionDetailDialog(transaction: any) {
    const modalRef = this.modalService.open(TransactionDetailsComponent, {backdrop: 'static'});
    modalRef.componentInstance.transaction = transaction;
  }

  // todo: add history in seperate service to make it reusable
  private getHistory() {
    this.walletHistorySubscription = this.walletService.walletHistory()
      .subscribe(
        response => {

          if (response.length > 0) {
            this.getTransactionInfo(response);
          }
        },
        error => {
          if (error.status === 0) {
            this.cancelSubscriptions();
          } else if (error.status >= 400) {
            if (!error.error.errors[0].message) {
              this.cancelSubscriptions();
              this.startSubscriptions();
            }
          }
        }
      )
    ;
  }

  private getTransactionInfo(transactions: any) {
    this.transactions = [];

    for (const transaction of transactions) {
      let transactionType;
      if (transaction.type === 'send') {
        transactionType = 'sent';
      } else if (transaction.type === 'received') {
        transactionType = 'received';
      } else if (transaction.type === 'staked') {
        transactionType = 'staked';
      }
      const transactionId = transaction.id;
      const transactionAmount = transaction.amount;
      let transactionFee;
      if (transaction.fee) {
        transactionFee = transaction.fee;
      } else {
        transactionFee = 0;
      }
      const transactionConfirmedInBlock = transaction.confirmedInBlock;
      const transactionTimestamp = transaction.timestamp;
      this.transactions.push(new TransactionInfo(
        transactionType,
        transactionId,
        transactionAmount,
        transactionFee,
        transactionConfirmedInBlock,
        transactionTimestamp));
    }
  }

  private cancelSubscriptions() {
    if (this.walletHistorySubscription) {
      this.walletHistorySubscription.unsubscribe();
    }
  }

  private startSubscriptions() {
    this.getHistory();
  }
}
