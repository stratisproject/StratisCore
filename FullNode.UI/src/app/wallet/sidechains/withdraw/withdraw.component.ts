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

import { WithdrawConfirmationComponent } from './confirmation/withdraw-confirmation.component';
import { TransactionSending } from '../../../shared/classes/transaction-sending';

import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'withdraw-component',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css'],
})

export class WithdrawComponent implements OnInit, OnDestroy {
  public withdrawForm: FormGroup;
  public coinUnit: string;
  public isWithdrawing = false;
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
    this.buildWithdrawForm();
  }

  ngOnInit() {
    this.startSubscriptions();
    this.coinUnit = this.globalService.getCoinUnit();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private buildWithdrawForm(): void {
    this.withdrawForm = this.fb.group({
      'address': ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      'amount': [
        '',
        Validators.compose([
          Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
          Validators.min(0.00001),
          (control: AbstractControl) => Validators.max((this.totalBalance - this.estimatedFee) / 100000000)(control)])
      ],
      'fee': ['medium', Validators.required],
      'password': ['', Validators.required]
    });

    this.withdrawForm.valueChanges
      .debounceTime(300)
      .subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.withdrawForm) { return; }
    const form = this.withdrawForm;
    for (const field in this.formErrors) {
      if (!this.formErrors.hasOwnProperty(field)) {
        continue;
      }

      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          if (!control.errors.hasOwnProperty(key)) {
            continue;
          }

          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }

    this.apiError = '';

    if (this.withdrawForm.get('address').valid && this.withdrawForm.get('amount').valid) {
      this.estimateFee();
    }
  }

  public getMaxBalance() {
    const data = {
      walletName: this.globalService.getWalletName(),
      feeType: this.withdrawForm.get('fee').value
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
            this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.withdrawForm.patchValue({amount: +new CoinNotationPipe(this.globalService).transform(balanceResponse.maxSpendableAmount)});
          this.estimatedFee = balanceResponse.fee;
        }
      );
  }

  public estimateFee() {
    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      'account 0',
      this.withdrawForm.get('address').value.trim(),
      this.withdrawForm.get('amount').value,
      this.withdrawForm.get('fee').value,
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
      this.globalService.getWalletName(),
      'account 0',
      this.withdrawForm.get('password').value,
      this.withdrawForm.get('address').value.trim(),
      this.withdrawForm.get('amount').value,
      this.withdrawForm.get('fee').value,
      // TO DO: use coin notation
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
          this.isWithdrawing = false;
          if (error.status === 0) {
            this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.estimatedFee = this.responseMessage.fee;
          this.transactionHex = this.responseMessage.hex;
          if (this.isWithdrawing) {
            this.withdrawTransaction(this.transactionHex);
          }
        }
      )
    ;
  }

  public withdraw() {
    this.isWithdrawing = true;
    this.buildTransaction();
  }

  private withdrawTransaction(hex: string) {
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
          this.isWithdrawing = false;
          if (error.status === 0) {
            this.apiError = 'Something went wrong while connecting to the API. Please restart the application.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => this.openConfirmationModal()
      )
    ;
  }

  private getWalletBalance() {
    const walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
              const balanceResponse = response.json();
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
    const modalRef = this.modalService.open(WithdrawConfirmationComponent, { backdrop: 'static' });
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
