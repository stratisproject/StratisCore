import { Component, OnInit, Input } from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '../../../../shared/services/global.service';

import { CoinNotationPipe } from '../../../../shared/pipes/coin-notation.pipe';

@Component({
  selector: 'app-deposit-confirmation',
  templateUrl: './deposit-confirmation.component.html',
  styleUrls: ['./deposit-confirmation.component.css']
})
export class DepositConfirmationComponent implements OnInit {

  @Input() transaction: any;
  @Input() transactionFee: any;
  constructor(private globalService: GlobalService, public activeModal: NgbActiveModal) { }

  public showDetails = false;
  public coinUnit: string;

  ngOnInit() {
    this.coinUnit = this.globalService.coinUnit;
    this.transactionFee = new CoinNotationPipe(this.globalService).transform(this.transactionFee);
    this.transaction.amount = +this.transaction.amount + +this.transactionFee;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
