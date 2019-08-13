import { Component, OnInit } from '@angular/core';
import { TransactionInfo } from "@shared/models/transaction-info";
import { TransactionDetailsComponent } from "../transaction-details/transaction-details.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GlobalService } from "@shared/services/global.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { NodeService } from "@shared/services/node.service";
import { TransactionsHistoryItem } from "@shared/services/interfaces/api.i";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  public transactions: Observable<TransactionInfo[]>;

  public constructor(
    private globalService: GlobalService,
    private nodeService: NodeService,
    private router: Router,
    private modalService: NgbModal) {
  }

  public ngOnInit(): void {
    this.transactions = this.nodeService.walletHistory(this.globalService.currentWallet)
      .pipe(map((history => {
        return (null != history && history.length > 0) ? this.mapToTransactionInfo(history) : null;
      })));
  }

  public openTransactionDetailDialog(transaction: TransactionInfo): void {
    const modalRef = this.modalService.open(TransactionDetailsComponent, {backdrop: "static", keyboard: false});
    modalRef.componentInstance.transaction = transaction;
  }

  public goToHistory(): Promise<boolean> {
    return this.router.navigate(['/wallet/history']);
  }

  private mapToTransactionInfo(transactions: TransactionsHistoryItem[]): TransactionInfo[] {

    return transactions.map(transaction => {
      return new TransactionInfo(
        transaction.type == "send" ? "sent" : transaction.type,
        transaction.id,
        transaction.amount,
        transaction.fee || 0,
        transaction.confirmedInBlock,
        transaction.timestamp);
    });
  }
}
