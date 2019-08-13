import { Component, Input, OnInit } from '@angular/core';
import { TransactionInfo } from "@shared/models/transaction-info";
import { TransactionDetailsComponent } from "../transaction-details/transaction-details.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GlobalService } from "@shared/services/global.service";
import { Router } from "@angular/router";
import { WalletInfo } from "@shared/models/wallet-info";
import { StratisNodeService } from "@shared/services/real-time/stratis-node.service";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  @Input() transactions: TransactionInfo[];

  public constructor(
    private globalService: GlobalService,
    private stratisNodeService : StratisNodeService,
    private router: Router,
    private modalService: NgbModal) {
  }

  public ngOnInit() {
  }

  public openTransactionDetailDialog(transaction: TransactionInfo) {
    const modalRef = this.modalService.open(TransactionDetailsComponent, {backdrop: "static", keyboard: false});
    modalRef.componentInstance.transaction = transaction;
  }

  public goToHistory() {
    this.router.navigate(['/wallet/history']);
  }

  // todo: add history in separate service to make it reusable
  private getHistory() {
    const walletInfo = new WalletInfo(this.globalService.getWalletName());
    let historyResponse;
    this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
      .subscribe(
        response => {
          // TO DO - add account feature instead of using first entry in array
          if (!!response.history && response.history[0].transactionsHistory.length > 0) {
            historyResponse = response.history[0].transactionsHistory;
            this.getTransactionInfo(historyResponse);
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
  };

  private getTransactionInfo(transactions: any) {
    this.transactionArray = [];

    for (let transaction of transactions) {
      let transactionType;
      if (transaction.type === "send") {
        transactionType = "sent";
      } else if (transaction.type === "received") {
        transactionType = "received";
      } else if (transaction.type === "staked") {
        transactionType = "staked";
      }
      let transactionId = transaction.id;
      let transactionAmount = transaction.amount;
      let transactionFee;
      if (transaction.fee) {
        transactionFee = transaction.fee;
      } else {
        transactionFee = 0;
      }
      let transactionConfirmedInBlock = transaction.confirmedInBlock;
      let transactionTimestamp = transaction.timestamp;

      this.transactionArray.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
    }
  }

}
