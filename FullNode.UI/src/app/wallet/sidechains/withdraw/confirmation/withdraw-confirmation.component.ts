import { Component, OnInit, Input } from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '../../../../shared/services/global.service';

import { CoinNotationPipe } from '../../../../shared/pipes/coin-notation.pipe';

@Component({
  selector: 'app-withdraw-confirmation',
  templateUrl: './withdraw-confirmation.component.html',
  styleUrls: ['./withdraw-confirmation.component.css']
})
export class WithdrawConfirmationComponent implements OnInit {

  @Input() transaction: any;
  @Input() transactionFee: any;
  constructor(private globalService: GlobalService, public activeModal: NgbActiveModal) { }

  public showDetails = false;
  public coinUnit: string;

  ngOnInit() {
    this.coinUnit = this.globalService.getCoinUnit();
    this.transactionFee = new CoinNotationPipe(this.globalService).transform(this.transactionFee);
    this.transaction.amount = +this.transaction.amount + +this.transactionFee;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
