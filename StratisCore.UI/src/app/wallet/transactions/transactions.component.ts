import { Component, Input, OnInit } from '@angular/core';
import { TransactionInfo } from "@shared/models/transaction-info";
import { TransactionDetailsComponent } from "../transaction-details/transaction-details.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GlobalService } from "@shared/services/global.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  @Input() transactions: TransactionInfo[];
  public sidechainEnabled: boolean;
  public coinUnit: string;

  public constructor(
    private globalService: GlobalService,
    private router: Router,
    private modalService: NgbModal) {

    this.coinUnit = this.globalService.getCoinUnit();
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
}
