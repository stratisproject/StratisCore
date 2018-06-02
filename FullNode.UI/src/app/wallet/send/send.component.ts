import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';
import { CoinNotationPipe } from '../../shared/pipes/coin-notation.pipe';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FeeEstimation } from '../../shared/classes/fee-estimation';
import { TransactionBuilding } from '../../shared/classes/transaction-building';
import { TransactionSending } from '../../shared/classes/transaction-sending';
import { WalletInfo } from '../../shared/classes/wallet-info';

import { SendConfirmationComponent } from './send-confirmation/send-confirmation.component';

import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { BaseForm } from '../../shared/components/base-form';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'send-component',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css'],
})

export class SendComponent extends BaseForm implements OnInit, OnDestroy {
  public sendForm: FormGroup;
  public coinUnit: string;
  public isSending = false;
  public estimatedFee = 0;
  public totalBalance = 0;
  public apiError: string;
  private transactionHex: string;
  private responseMessage: any;
  private errorMessage: string;
  private transaction: TransactionBuilding;
  private walletBalanceSubscription: Subscription;

  formErrors = {
    'address': '',
    'amount': '',
    'fee': '',
    'password': ''
  };

  validationMessages = {
    'address': {
      'required': 'An address is required.',
      'minlength': 'An address is at least 26 characters long.'
    },
    'amount': {
      'required': 'An amount is required.',
      'pattern': 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      'min': 'The amount has to be more or equal to 0.00001 Stratis.',
      'max': 'The total transaction amount exceeds your available balance.'
    },
    'fee': {
      'required': 'A fee is required.'
    },
    'password': {
      'required': 'Your password is required.'
    }
  };

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private genericModalService: ModalService,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder) {
      super();
      this.buildSendForm();
  }

  ngOnInit() {
    this.startSubscriptions();
    this.coinUnit = this.globalService.CoinUnit;
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private buildSendForm(): void {
    this.sendForm = this.fb.group({
      'address': ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      'amount': ['', Validators.compose([
        Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(0.00001),
        (control: AbstractControl) => Validators.max((this.totalBalance - this.estimatedFee) / 100000000)(control)])
      ],
      'fee': ['medium', Validators.required],
      'password': ['', Validators.required]
    });

    this.sendForm.valueChanges
      .debounceTime(300)
      .subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.sendForm) { return; }
    const form = this.sendForm;
    this.validateControls(form, this.formErrors, this.validationMessages);

    this.apiError = '';

    if (this.sendForm.get('address').valid && this.sendForm.get('amount').valid) {
      this.estimateFee();
    }
  }

  public getMaxBalance() {
    const data = {
      walletName: this.globalService.WalletName,
      feeType: this.sendForm.get('fee').value
    };

    let balanceResponse;

    this.apiService
      .getMaximumBalance(data)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            balanceResponse = response.json();
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            // this.genericModalService.openModal(null, null);
            this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              // this.genericModalService.openModal(null, error.json().errors[0].message);
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.sendForm.patchValue({amount: +new CoinNotationPipe(this.globalService).transform(balanceResponse.maxSpendableAmount)});
          this.estimatedFee = balanceResponse.fee;
        }
      );
  }

  public estimateFee() {
    const transaction = new FeeEstimation(
      this.globalService.WalletName,
      'account 0',
      this.sendForm.get('address').value.trim(),
      this.sendForm.get('amount').value,
      this.sendForm.get('fee').value,
      true
    );

    this.apiService.estimateFee(transaction)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.responseMessage = response.json();
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              // this.genericModalService.openModal(null, error.json().errors[0].message);
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.estimatedFee = this.responseMessage;
        }
      )
    ;
  }

  public buildTransaction() {
    this.transaction = new TransactionBuilding(
      this.globalService.WalletName,
      'account 0',
      this.sendForm.get('password').value,
      this.sendForm.get('address').value.trim(),
      this.sendForm.get('amount').value,
      this.sendForm.get('fee').value,
      // TODO: use coin notation
      this.estimatedFee / 100000000,
      true,
      false
    );

    this.apiService
      .buildTransaction(this.transaction)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            console.log(response);
            this.responseMessage = response.json();
          }
        },
        error => {
          console.log(error);
          this.isSending = false;
          if (error.status === 0) {
            // this.genericModalService.openModal(null, null);
            this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              // this.genericModalService.openModal(null, error.json().errors[0].message);
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.estimatedFee = this.responseMessage.fee;
          this.transactionHex = this.responseMessage.hex;
          if (this.isSending) {
            this.sendTransaction(this.transactionHex);
          }
        }
      )
    ;
  }

  public send() {
    this.isSending = true;
    this.buildTransaction();
  }

  private sendTransaction(hex: string) {
    const transaction = new TransactionSending(hex);
    this.apiService
      .sendTransaction(transaction)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.activeModal.close('Close clicked');
          }
        },
        error => {
          console.log(error);
          this.isSending = false;
          if (error.status === 0) {
            // this.genericModalService.openModal(null, null);
            this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              // this.genericModalService.openModal(null, error.json().errors[0].message);
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => this.openConfirmationModal()
      )
    ;
  }

  private getWalletBalance() {
    const walletInfo = new WalletInfo(this.globalService.WalletName);
    this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
              const balanceResponse = response.json();
              // TO DO - add account feature instead of using first entry in array
              this.totalBalance = balanceResponse.balances[0].amountConfirmed + balanceResponse.balances[0].amountUnconfirmed;
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.cancelSubscriptions();
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              if (error.json().errors[0].description) {
                this.genericModalService.openModal(null, error.json().errors[0].message);
              } else {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        }
      );
  }

  private openConfirmationModal() {
    const modalRef = this.modalService.open(SendConfirmationComponent, { backdrop: 'static' });
    modalRef.componentInstance.transaction = this.transaction;
    modalRef.componentInstance.transactionFee = this.estimatedFee;
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
