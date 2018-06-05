import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';

import { WalletInfo } from '../../shared/classes/wallet-info';
import { TransactionInfo } from '../../shared/classes/transaction-info';

import { Subscription } from 'rxjs/Subscription';

import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

export class HistoryComponent implements OnInit, OnDestroy {

  public transactions: TransactionInfo[];
  public coinUnit: string;
  private errorMessage: string;
  private walletHistorySubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private genericModalService: ModalService,
    private router: Router) {}

  ngOnInit() {
    this.startSubscriptions();
    this.coinUnit = this.globalService.coinUnit;
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onDashboardClicked() {
    this.router.navigate(['/wallet']);
  }

  private openTransactionDetailDialog(transaction: any) {
    const modalRef = this.modalService.open(TransactionDetailsComponent, { backdrop: 'static' });
    modalRef.componentInstance.transaction = transaction;
  }

  // TODO: add history in seperate service to make it reusable
  private getHistory() {
    const walletInfo = new WalletInfo(this.globalService.walletName);
    let historyResponse;
    this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            // TODO - add account feature instead of using first entry in array
            if (response.json().history[0].transactionsHistory.length > 0) {
              historyResponse = response.json().history[0].transactionsHistory;
              this.getTransactionInfo(historyResponse);
            }
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.cancelSubscriptions();
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              if (error.json().errors[0].description) {
                this.genericModalService.openModal(null, error.json().errors[0].message);
              } else {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        }
      );
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

      this.transactions.push(
        new TransactionInfo(
          transactionType,
          transactionId,
          transactionAmount,
          transactionFee,
          transactionConfirmedInBlock,
          transactionTimestamp
        )
      );
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
