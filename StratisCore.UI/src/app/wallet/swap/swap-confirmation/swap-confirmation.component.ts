import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { CoinNotationPipe } from '@shared/pipes/coin-notation.pipe';
import { Transaction } from '@shared/models/transaction';
import { WalletService } from '@shared/services/wallet.service';
import { timeStamp } from 'console';

@Component({
  selector: 'app-swap-confirmation',
  templateUrl: './swap-confirmation.component.html',
  styleUrls: ['./swap-confirmation.component.scss']
})
export class SwapConfirmationComponent implements OnInit {

  @Input() transaction: Transaction;
  @Output() closeClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private globalService: GlobalService, private walletService: WalletService) {
  }

  public coinUnit: string;
  public confirmedSwap = false;
  public isConfirming = false;
  public apiError: string;
  public hasOpReturn = false;
  public totalAmount: number;

  ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();
    this.totalAmount = +this.transaction.amount + this.transaction.feeAmount;
  }

  public swap(): void {
    this.isConfirming = true;
    this.walletService.sendTransaction(this.transaction)
      .then(transactionResponse => {
        this.isConfirming = false;
        this.confirmedSwap = true;
      }).catch(error => {
        this.isConfirming = false;
        this.confirmedSwap = false;
        this.apiError = error.error.errors[0].message;
    })
  }
}
