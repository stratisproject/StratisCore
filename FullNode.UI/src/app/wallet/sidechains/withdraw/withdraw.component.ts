import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { ApiService } from '../../../shared/services/api.service';
import { GlobalService } from '../../../shared/services/global.service';
import { ModalService } from '../../../shared/services/modal.service';
import { CoinNotationPipe } from '../../../shared/pipes/coin-notation.pipe';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FeeEstimation } from '../../../shared/classes/fee-estimation';
import { TransactionBuilding } from '../../../shared/classes/transaction-building';
import { WalletInfo } from '../../../shared/classes/wallet-info';

import { TransactionSending } from '../../../shared/classes/transaction-sending';

import { Log } from '../../../shared/services/logger.service';

import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { SideChainTransferForm } from '../models/transfer-form';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'withdraw-component',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css'],
})

export class WithdrawComponent extends SideChainTransferForm implements OnInit, OnDestroy {

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private genericModalService: ModalService,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private log: Log) {
      super(apiService, globalService, modalService, genericModalService, activeModal, fb, log, 'sidechainAddress');
      this.buildForm();
  }

  ngOnInit() {
    this.startSubscriptions();
    this.coinUnit = this.globalService.coinUnit;
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }
}
