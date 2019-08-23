import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { CoinNotationPipe } from '@shared/pipes/coin-notation.pipe';
import { NumberToStringPipe } from '@shared/pipes/number-to-string.pipe';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FeeEstimation } from '@shared/models/fee-estimation';
import { SidechainFeeEstimation } from '@shared/models/sidechain-fee-estimation';
import { TransactionBuilding } from '@shared/models/transaction-building';
import { TransactionSending } from '@shared/models/transaction-sending';
import { WalletInfo, WalletInfoRequest } from '@shared/models/wallet-info';

import { SendConfirmationComponent } from './send-confirmation/send-confirmation.component';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';

@Component({
  selector: 'send-component',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css'],
})

export class SendComponent implements OnInit, OnDestroy {

  constructor(
    private apiService: ApiService,
    private walletService: WalletService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private genericModalService: ModalService,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder) {
    this.buildSendForm();
    this.buildSendToSidechainForm();
  }

  @Input() address: string;

  public sendForm: FormGroup;
  public sendToSidechainForm: FormGroup;
  public sidechainEnabled: boolean;
  public hasOpReturn: boolean;
  public coinUnit: string;
  public isSending = false;
  public estimatedFee = 0;
  public estimatedSidechainFee = 0;
  public totalBalance = 0;
  public spendableBalance = 0;
  public apiError: string;
  public firstTitle: string;
  public secondTitle: string;
  public opReturnAmount = 1;
  public confirmationText: string;
  private transactionHex: string;
  private responseMessage: any;
  private transaction: TransactionBuilding;
  private walletBalanceSubscription: Subscription;

  sendFormErrors = {
    'address': '',
    'amount': '',
    'fee': '',
    'password': ''
  };

  sendValidationMessages = {
    'address': {
      'required': 'An address is required.',
      'minlength': 'An address is at least 26 characters long.'
    },
    'amount': {
      'required': 'An amount is required.',
      'pattern': 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      'min': 'The amount has to be more or equal to 0.00001.',
      'max': 'The total transaction amount exceeds your spendable balance.'
    },
    'fee': {
      'required': 'A fee is required.'
    },
    'password': {
      'required': 'Your password is required.'
    }
  };

  sendToSidechainFormErrors = {
    'destionationAddress': '',
    'federationAddress': '',
    'amount': '',
    'fee': '',
    'password': ''
  };

  sendToSidechainValidationMessages = {
    'destinationAddress': {
      'required': 'An address is required.',
      'minlength': 'An address is at least 26 characters long.'
    },
    'federationAddress': {
      'required': 'An address is required.',
      'minlength': 'An address is at least 26 characters long.'
    },
    'amount': {
      'required': 'An amount is required.',
      'pattern': 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      'min': 'The amount has to be more or equal to 1.',
      'max': 'The total transaction amount exceeds your spendable balance.'
    },
    'fee': {
      'required': 'A fee is required.'
    },
    'password': {
      'required': 'Your password is required.'
    }
  };

  ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    if (this.sidechainEnabled) {
      this.firstTitle = 'Sidechain';
      this.secondTitle = 'Mainchain';
    } else {
      this.firstTitle = 'Mainchain';
      this.secondTitle = 'Sidechain';
    }
    this.startSubscriptions();
    this.coinUnit = this.globalService.getCoinUnit();
    if (this.address) {
      this.sendForm.patchValue({'address': this.address});
    }

    this.confirmationText = this.sidechainEnabled ? 'Please note that sending from a sidechain to the mainchain requires 240 confirmations.' : 'Please note that sending from the mainchain to a sidechain requires 500 confirmations.';
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }
  private buildSendForm(): void {
    this.sendForm = this.fb.group({
      'address': ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      'amount': ['', Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(0.00001), (control: AbstractControl) => Validators.max((this.spendableBalance - this.estimatedFee) / 100000000)(control)])],
      'fee': ['medium', Validators.required],
      'password': ['', Validators.required]
    });

    this.sendForm.valueChanges.pipe(debounceTime(300))
      .subscribe(data => this.onSendValueChanged(data));
  }

  private buildSendToSidechainForm(): void {
    this.sendToSidechainForm = this.fb.group({
      'federationAddress': ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      'destinationAddress': ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      'amount': ['', Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(1), (control: AbstractControl) => Validators.max((this.spendableBalance - this.estimatedFee) / 100000000)(control)])],
      'fee': ['medium', Validators.required],
      'password': ['', Validators.required]
    });

    this.sendToSidechainForm.valueChanges.pipe(debounceTime(300))
      .subscribe(data => this.onSendToSidechainValueChanged(data));
  }

  onSendValueChanged(data?: any) {
    if (!this.sendForm) {
      return;
    }
    const form = this.sendForm;
    for (const field in this.sendFormErrors) {
      this.sendFormErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.sendValidationMessages[field];
        for (const key in control.errors) {
          this.sendFormErrors[field] += messages[key] + ' ';
        }
      }
    }

    this.apiError = '';

    if (this.sendForm.get('address').valid && this.sendForm.get('amount').valid) {
      this.estimateFee();
    }
  }

  onSendToSidechainValueChanged(data?: any) {
    if (!this.sendToSidechainForm) {
      return;
    }
    const form = this.sendToSidechainForm;
    for (const field in this.sendToSidechainFormErrors) {
      this.sendToSidechainFormErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.sendToSidechainValidationMessages[field];
        for (const key in control.errors) {
          this.sendToSidechainFormErrors[field] += messages[key] + ' ';
        }
      }
    }

    this.apiError = '';

    if (this.sendToSidechainForm.get('destinationAddress').valid && this.sendToSidechainForm.get('federationAddress').valid && this.sendToSidechainForm.get('amount').valid) {
      this.estimateSidechainFee();
    }
  }

  public getMaxBalance() {
    let balanceResponse;
    const walletRequest = new WalletInfoRequest(this.globalService.getWalletName(), 0, this.sendForm.get('fee').value);

    this.apiService.getMaximumBalance(walletRequest)
      .subscribe(
        response => {
          balanceResponse = response;
        },
        error => {
          this.apiError = error.error.errors[0].message;
        },
        () => {
          this.sendForm.patchValue({amount: +new CoinNotationPipe().transform(balanceResponse.maxSpendableAmount)});
          this.estimatedFee = balanceResponse.fee;
        }
      );
  }
  public estimateFee() {
    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      'account 0',
      this.sendForm.get('address').value.trim(),
      this.sendForm.get('amount').value,
      this.sendForm.get('fee').value,
      true
    );

    this.apiService.estimateFee(transaction)
      .subscribe(
        response => {
          this.estimatedFee = response;
        },
        error => {
          this.apiError = error.error.errors[0].message;
        }
      );
  }

  public estimateSidechainFee() {
    const sidechainTransaction = new SidechainFeeEstimation(
      this.globalService.getWalletName(),
      'account 0',
      this.sendToSidechainForm.get('federationAddress').value.trim(),
      this.sendToSidechainForm.get('destinationAddress').value.trim(),
      this.sendToSidechainForm.get('amount').value,
      this.sendToSidechainForm.get('fee').value,
      true
    );

    this.apiService.estimateSidechainFee(sidechainTransaction)
      .subscribe(
        response => {
          this.estimatedSidechainFee = response;
        },
        error => {
          this.apiError = error.error.errors[0].message;
        }
      );
  }

  public buildTransaction() {
    this.transaction = new TransactionBuilding(
      this.globalService.getWalletName(),
      'account 0',
      this.sendForm.get('password').value,
      this.sendForm.get('address').value.trim(),
      this.sendForm.get('amount').value,
      // this.sendForm.get("fee").value,
      // TO DO: use coin notation
      this.estimatedFee / 100000000,
      true,
      false
    );

    this.apiService
      .buildTransaction(this.transaction)
      .subscribe(
        response => {
          this.estimatedFee = response.fee;
          this.transactionHex = response.hex;
          if (this.isSending) {
            this.hasOpReturn = false;
            this.sendTransaction(this.transactionHex);
          }
        },
        error => {
          this.isSending = false;
          this.apiError = error.error.errors[0].message;
        }
      );
  }
  public buildSidechainTransaction() {
    this.transaction = new TransactionBuilding(
      this.globalService.getWalletName(),
      'account 0',
      this.sendToSidechainForm.get('password').value,
      this.sendToSidechainForm.get('federationAddress').value.trim(),
      this.sendToSidechainForm.get('amount').value,
      // this.sendToSidechainForm.get("fee").value,
      // TO DO: use coin notation
      this.estimatedSidechainFee / 100000000,
      true,
      false,
      this.sendToSidechainForm.get('destinationAddress').value.trim(),
      new NumberToStringPipe().transform((this.opReturnAmount / 100000000))
    );

    this.apiService.buildTransaction(this.transaction)
      .subscribe(
        response => {
          this.estimatedSidechainFee = response.fee;
          this.transactionHex = response.hex;
          if (this.isSending) {
            this.hasOpReturn = true;
            this.sendTransaction(this.transactionHex);
          }
        },
        error => {
          this.isSending = false;
          this.apiError = error.error.errors[0].message;
        }
      );
  }
  public send() {
    this.isSending = true;
    this.buildTransaction();
  }
  public sendToSidechain() {
    this.isSending = true;
    this.buildSidechainTransaction();
  }

  private sendTransaction(hex: string) {
    const transaction = new TransactionSending(hex);
    this.apiService
      .sendTransaction(transaction)
      .subscribe(
        response => {
          this.activeModal.close('Close clicked');
          this.openConfirmationModal();
        },
        error => {
          this.isSending = false;
          this.apiError = error.error.errors[0].message;
        }
      );
  }

  private getWalletBalance() {
    this.walletBalanceSubscription = this.walletService.wallet()
      .subscribe(
        response => {
          this.totalBalance = response.amountConfirmed + response.amountUnconfirmed;
          this.spendableBalance = response.spendableAmount;
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
      );
  }
  private openConfirmationModal() {
    const modalRef = this.modalService.open(SendConfirmationComponent, {backdrop: 'static'});
    modalRef.componentInstance.transaction = this.transaction;
    modalRef.componentInstance.transactionFee = this.estimatedFee ? this.estimatedFee : this.estimatedSidechainFee;
    modalRef.componentInstance.sidechainEnabled = this.sidechainEnabled;
    modalRef.componentInstance.opReturnAmount = this.opReturnAmount;
    modalRef.componentInstance.hasOpReturn = this.hasOpReturn;
  }

  private cancelSubscriptions() {
    if (this.walletBalanceSubscription) {
      this.walletBalanceSubscription.unsubscribe();
    }
  }
  private startSubscriptions() {
    this.getWalletBalance();
  }
}
