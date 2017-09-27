import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';

import { WalletInfo } from '../../shared/classes/wallet-info';
import { TransactionInfo } from '../../shared/classes/transaction-info';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';

@Component({
  selector: 'history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

export class HistoryComponent {
  constructor(private apiService: ApiService, private globalService: GlobalService, private modalService: NgbModal) {}

  public transactions: TransactionInfo[];
  private errorMessage: string;
  private walletHistorySubscription: Subscription;

  ngOnInit() {
    this.startSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private openTransactionDetailDialog(transaction: any) {
    const modalRef = this.modalService.open(TransactionDetailsComponent);
    modalRef.componentInstance.transaction = transaction;
  }

    // todo: add history in seperate service to make it reusable
  private getHistory() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName())
    let historyResponse;
    this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            if (response.json().transactionsHistory.length > 0) {
              historyResponse = response.json().transactionsHistory;
              this.getTransactionInfo(historyResponse);
            }
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            alert("Something went wrong while connecting to the API. Please restart the application.");
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            }
            else {
              if (error.json().errors[0].description) {
                alert(error.json().errors[0].description);
              } else {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        }
      )
    ;
  };

  private getTransactionInfo(transactions: any) {
    this.transactions = [];

    for (let transaction of transactions) {
      let transactionType;
      if (transaction.type === "send") {
        transactionType = "sent";
      } else if (transaction.type === "received") {
        transactionType = "received";
      }
      let transactionId = transaction.id;
      let transactionAmount = transaction.amount;
      let transactionAddress;
      if (transaction.payments[0]) {
        transactionAddress = transaction.payments[0].destinationAddress;
      } else if (transaction.toAddress) {
        transactionAddress = transaction.toAddress;
      }
      let transactionFee = transaction.fee;
      let transactionConfirmedInBlock = transaction.confirmedInBlock;
      let transactionTimestamp = transaction.timestamp;
      let transactionConfirmed;

      this.transactions.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionAddress, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
    }
  }

  private cancelSubscriptions() {
    if(this.walletHistorySubscription) {
      this.walletHistorySubscription.unsubscribe();
    }
  };

  private startSubscriptions() {
    this.getHistory();
  }
}
