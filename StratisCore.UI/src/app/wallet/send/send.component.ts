import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { CoinNotationPipe } from '@shared/pipes/coin-notation.pipe';
import { NumberToStringPipe } from '@shared/pipes/number-to-string.pipe';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FeeEstimation } from '@shared/models/fee-estimation';
<<<<<<< HEAD
import { Transaction } from '@shared/models/transaction';
import { WalletInfoRequest } from '@shared/models/wallet-info';
=======
import { SidechainFeeEstimation } from '@shared/models/sidechain-fee-estimation';
import { TransactionBuilding } from '@shared/models/transaction-building';
import { TransactionSending } from '@shared/models/transaction-sending';
import { WalletInfo } from '@shared/models/wallet-info';

>>>>>>> origin/master
import { SendConfirmationComponent } from './send-confirmation/send-confirmation.component';
import { Subscription } from 'rxjs';
<<<<<<< HEAD
import { debounceTime, tap } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SendComponentFormResources } from './send-component-form-resources';
import { FormHelper } from '@shared/forms/form-helper';
import { TransactionResponse } from '@shared/models/transaction-response';
=======
import { debounceTime } from 'rxjs/operators';
>>>>>>> origin/master

@Component({
  selector: 'send-component',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css'],
})

export class SendComponent implements OnInit, OnDestroy {
<<<<<<< HEAD
  constructor(
    private apiService: ApiService,
    private walletService: WalletService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private genericModalService: ModalService,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder) {

    this.sendForm = SendComponentFormResources.buildSendForm(fb,
      () => (this.spendableBalance - this.estimatedFee) / 100000000);

    this.sendToSidechainForm = SendComponentFormResources.buildSendToSidechainForm(fb,
      () => (this.spendableBalance - this.estimatedSidechainFee) / 100000000);

    this.subscriptions.push(this.sendForm.valueChanges.pipe(debounceTime(300))
      .subscribe(data => this.onSendValueChanged(data, false)));

    this.subscriptions.push(this.sendToSidechainForm.valueChanges.pipe(debounceTime(300))
      .subscribe(data => this.onSendValueChanged(data, true)));

=======
  @Input() address: string;
  constructor(private apiService: ApiService, private globalService: GlobalService, private modalService: NgbModal, private genericModalService: ModalService, public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.buildSendForm();
    this.buildSendToSidechainForm();
>>>>>>> origin/master
  }

  @Input() address: string;

  public sendForm: FormGroup;
  public sendToSidechainForm: FormGroup;
  public sidechainEnabled: boolean;
  public coinUnit: string;
  public isSending = false;
  public estimatedFee = 0;
  public estimatedSidechainFee = 0;
  public totalBalance = 0;
  public spendableBalance = 0;
  public apiError: string;
  public firstTitle: string;
  public secondTitle: string;

  // The opReturnAmount is for compatibility with StratisX, opReturnAmount needs to be greater than 0 to pass the MemPool
  // Validation rules.
  public opReturnAmount = 1;
  public confirmationText: string;
  private subscriptions: Subscription[] = [];
  private sendFormErrors: any = {};
  private sendToSidechainFormErrors: any = {};

  public ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    if (this.sidechainEnabled) {
      this.firstTitle = 'Sidechain';
      this.secondTitle = 'Mainchain';
    } else {
      this.firstTitle = 'Mainchain';
      this.secondTitle = 'Sidechain';
    }
    this.getWalletBalance();
    this.coinUnit = this.globalService.getCoinUnit();
    if (this.address) {
      this.sendForm.patchValue({'address': this.address});
    }

    this.confirmationText = this.sidechainEnabled
      ? 'Please note that sending from a sidechain to the mainchain requires 240 confirmations.'
      : 'Please note that sending from the mainchain to a sidechain requires 500 confirmations.';
  }

<<<<<<< HEAD
  public ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private onSendValueChanged(data: any, isSideChain: boolean): void {
    const form = isSideChain ? this.sendToSidechainForm : this.sendForm;
    if (!form) {
      return;
    }

    FormHelper.ValidateForm(form,
      isSideChain
        ? this.sendToSidechainFormErrors
        : this.sendFormErrors,
      isSideChain
        ? SendComponentFormResources.sendToSidechainValidationMessages
        : SendComponentFormResources.sendValidationMessages
    );

    this.apiError = '';
=======
  ngOnDestroy() {
    this.cancelSubscriptions();
  };

  private buildSendForm(): void {
    this.sendForm = this.fb.group({
      "address": ["", Validators.compose([Validators.required, Validators.minLength(26)])],
      "amount": ["", Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(0.00001), (control: AbstractControl) => Validators.max((this.spendableBalance - this.estimatedFee)/100000000)(control)])],
      "fee": ["medium", Validators.required],
      "password": ["", Validators.required]
    });

    this.sendForm.valueChanges.pipe(debounceTime(300))
      .subscribe(data => this.onSendValueChanged(data));
  }

  private buildSendToSidechainForm(): void {
    this.sendToSidechainForm = this.fb.group({
      "federationAddress": ["", Validators.compose([Validators.required, Validators.minLength(26)])],
      "destinationAddress": ["", Validators.compose([Validators.required, Validators.minLength(26)])],
      "amount": ["", Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(1), (control: AbstractControl) => Validators.max((this.spendableBalance - this.estimatedFee)/100000000)(control)])],
      "fee": ["medium", Validators.required],
      "password": ["", Validators.required]
    });

    this.sendToSidechainForm.valueChanges.pipe(debounceTime(300))
      .subscribe(data => this.onSendToSidechainValueChanged(data));
  }

  onSendValueChanged(data?: any) {
    if (!this.sendForm) { return; }
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

    this.apiError = "";

    if(this.sendForm.get("address").valid && this.sendForm.get("amount").valid) {
      this.estimateFee();
    }
  }

  onSendToSidechainValueChanged(data?: any) {
    if (!this.sendToSidechainForm) { return; }
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
>>>>>>> origin/master

    const isValidForFeeEstimate = (isSideChain
      ? form.get('destinationAddress').valid && form.get('federationAddress').valid
      : form.get('address').valid) && form.get('amount').valid;

<<<<<<< HEAD
    if (isValidForFeeEstimate) {
      this.estimateFee(form, isSideChain);
    }
  }

  // NB: This is not currently used
  public getMaxBalance(): void {
    let balanceResponse;
    const walletRequest = new WalletInfoRequest(this.globalService.getWalletName(), 0, this.sendForm.get('fee').value);
    this.apiService.getMaximumBalance(walletRequest)
      .pipe(tap(
=======
    if(this.sendToSidechainForm.get("destinationAddress").valid && this.sendToSidechainForm.get("federationAddress").valid && this.sendToSidechainForm.get("amount").valid) {
      this.estimateSidechainFee();
    }
  }

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
      'min': "The amount has to be more or equal to 0.00001.",
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
      'min': "The amount has to be more or equal to 1.",
      'max': 'The total transaction amount exceeds your spendable balance.'
    },
    'fee': {
      'required': 'A fee is required.'
    },
    'password': {
      'required': 'Your password is required.'
    }
  };

  public getMaxBalance() {
    let data = {
      walletName: this.globalService.getWalletName(),
      feeType: this.sendForm.get("fee").value
    }

    let balanceResponse;

    this.apiService.getMaximumBalance(data)
      .subscribe(
>>>>>>> origin/master
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
      )).toPromise();
  }

  public estimateFee(form: FormGroup, isSideChain: boolean): void {
    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      'account 0',
      form.get(isSideChain ? 'federationAddress' : 'address').value.trim(),
      form.get('amount').value,
      form.get('fee').value,
      true
    );

    this.walletService.estimateFee(transaction).toPromise()
      .then(response => {
          if (isSideChain) {
            this.estimatedSidechainFee = response;
          } else {
            this.estimatedFee = response;
          }
        },
        error => {
          this.apiError = error.error.errors[0].message;
        }
      );
  }

  public send(sendToSideChain?: boolean): void {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction(sendToSideChain))
      .then(transactionResponse => {
        this.estimatedFee = transactionResponse.transactionFee;
        this.activeModal.close('Close clicked');
        this.openConfirmationModal(transactionResponse);
        this.isSending = false;
      }).catch(error => {
      this.isSending = false;
      this.apiError = error.error.errors[0].message;
    });
  }

  private getTransaction(isSideChain?: boolean): Transaction {
    const form = isSideChain ? this.sendToSidechainForm : this.sendForm;
    return new Transaction(
      this.globalService.getWalletName(),
      'account 0',
      form.get('password').value,
      form.get(isSideChain ? 'federationAddress' : 'address').value.trim(),
      form.get('amount').value,
      // TO DO: use coin notation
      (isSideChain ? this.estimatedSidechainFee : this.estimatedFee) / 100000000,
      true,
      false,
      isSideChain ? this.sendToSidechainForm.get('destinationAddress').value.trim() : null,
      isSideChain ? new NumberToStringPipe().transform((this.opReturnAmount / 100000000)) : null
    );
  }

  private getWalletBalance() {
<<<<<<< HEAD
    this.subscriptions.push(this.walletService.wallet()
=======
    let walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
>>>>>>> origin/master
      .subscribe(
        response =>  {
            let balanceResponse = response;
            //TO DO - add account feature instead of using first entry in array
            this.totalBalance = balanceResponse.balances[0].amountConfirmed + balanceResponse.balances[0].amountUnconfirmed;
            this.spendableBalance = balanceResponse.balances[0].spendableAmount;
        },
<<<<<<< HEAD
      ));
=======
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
  };

  private openConfirmationModal() {
    const modalRef = this.modalService.open(SendConfirmationComponent, { backdrop: "static" });
    modalRef.componentInstance.transaction = this.transaction;
    modalRef.componentInstance.transactionFee = this.estimatedFee ? this.estimatedFee : this.estimatedSidechainFee;
    modalRef.componentInstance.sidechainEnabled = this.sidechainEnabled;
    modalRef.componentInstance.opReturnAmount = this.opReturnAmount;
    modalRef.componentInstance.hasOpReturn = this.hasOpReturn;
>>>>>>> origin/master
  }

  private openConfirmationModal(transactionResponse: TransactionResponse) {
    const component = this.modalService
      .open(SendConfirmationComponent, {backdrop: 'static'})
      .componentInstance as SendConfirmationComponent;

    component.transaction = transactionResponse.transaction;
    component.transactionFee = this.estimatedFee ? this.estimatedFee : this.estimatedSidechainFee;
    component.sidechainEnabled = this.sidechainEnabled;
    component.opReturnAmount = this.opReturnAmount;
    component.hasOpReturn = transactionResponse.isSideChain;
  }
}
