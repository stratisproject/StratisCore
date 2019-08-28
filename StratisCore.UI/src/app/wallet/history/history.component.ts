<<<<<<< HEAD
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
=======
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
>>>>>>> origin/master
import { Router } from '@angular/router';

import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';

import { WalletInfo } from '@shared/models/wallet-info';
import { TransactionInfo } from '@shared/models/transaction-info';
<<<<<<< HEAD
import { Observable } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { map, tap } from 'rxjs/operators';
=======

import { Subscription } from 'rxjs';

import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
>>>>>>> origin/master

@Component({
  selector: 'history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

<<<<<<< HEAD
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
=======
export class HistoryComponent {
  constructor(private apiService: ApiService, private globalService: GlobalService, private modalService: NgbModal, private genericModalService: ModalService, private router: Router) {}
>>>>>>> origin/master

  public transactions: TransactionInfo[];
  public transactionCount: number;
  public coinUnit: string;
<<<<<<< HEAD
  public pageNumber = 1;
=======
  public pageNumber: number = 1;
  private errorMessage: string;
  private walletHistorySubscription: Subscription;
>>>>>>> origin/master

  public ngOnInit(): void {
    this.walletHistory = this.walletService.walletHistory()
      .pipe(
        tap((historyItems) => {
          this.transactionCount = historyItems ? historyItems.length : 0;
        }),
        map(historyItems => {
          return historyItems ? TransactionInfo.mapFromTransactionsHistoryItems(historyItems) : [];
        }));
    this.coinUnit = this.globalService.getCoinUnit();
  }

  public onDashboardClicked(): void {
    this.router.navigate(['/wallet']);
  }
<<<<<<< HEAD
=======

  private openTransactionDetailDialog(transaction: any) {
    const modalRef = this.modalService.open(TransactionDetailsComponent, { backdrop: "static" });
    modalRef.componentInstance.transaction = transaction;
  }

    // todo: add history in seperate service to make it reusable
  private getHistory() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName())
    let historyResponse;
    this.walletHistorySubscription = this.apiService.getWalletHistory(walletInfo)
      .subscribe(
        response => {
          //TO DO - add account feature instead of using first entry in array
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
    this.transactions = [];

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
      let transactionConfirmed;

      this.transactions.push(new TransactionInfo(transactionType, transactionId, transactionAmount, transactionFee, transactionConfirmedInBlock, transactionTimestamp));
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
>>>>>>> origin/master
}
