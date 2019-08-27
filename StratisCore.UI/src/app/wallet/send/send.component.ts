import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { CoinNotationPipe } from '@shared/pipes/coin-notation.pipe';
import { NumberToStringPipe } from '@shared/pipes/number-to-string.pipe';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { Transaction } from '@shared/models/transaction';
import { WalletInfoRequest } from '@shared/models/wallet-info';
import { SendConfirmationComponent } from './send-confirmation/send-confirmation.component';
import { Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SendComponentResources } from './send-component-resources';

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
  public coinUnit: string;
  public isSending = false;
  public estimatedFee = 0;
  public estimatedSidechainFee = 0;
  public totalBalance = 0;
  public spendableBalance = 0;
  public apiError: string;
  public firstTitle: string;
  public secondTitle: string;

  // The opReturnAmount is for compatibilty with StratisX, opReturnAmount needs to be greater than 0 to pass the MemPool
  // Validation rules.
  public opReturnAmount = 1;
  public confirmationText: string;
  private transaction: Transaction;
  private walletBalanceSubscription: Subscription;
  private sendFormErrors = {
    'address': '',
    'amount': '',
    'fee': '',
    'password': ''
  };

  private sendToSidechainFormErrors = {
    'destinationAddress': '',
    'federationAddress': '',
    'amount': '',
    'fee': '',
    'password': ''
  };

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

  public ngOnDestroy() {
    this.walletBalanceSubscription.unsubscribe();
  }

  private buildSendForm(): void {
    this.sendForm = this.fb.group({
      'address': ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      'amount': ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(0.00001),
        (control: AbstractControl) => Validators.max((this.spendableBalance - this.estimatedFee) / 100000000)(control)])],
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
      'amount': ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(1),
        (control: AbstractControl) => Validators.max((this.spendableBalance - this.estimatedFee) / 100000000)(control)])],
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
        const messages = SendComponentResources.sendValidationMessages[field];
        for (const key in control.errors) {
          this.sendFormErrors[field] += messages[key] + ' ';
        }
      }
    }

    this.apiError = '';

    if (this.sendForm.get('address').valid && this.sendForm.get('amount').valid) {
      this.estimateFee(false);
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
        const messages = SendComponentResources.sendToSidechainValidationMessages[field];
        for (const key in control.errors) {
          this.sendToSidechainFormErrors[field] += messages[key] + ' ';
        }
      }
    }

    this.apiError = '';

    if (this.sendToSidechainForm.get('destinationAddress').valid
      && this.sendToSidechainForm.get('federationAddress').valid
      && this.sendToSidechainForm.get('amount').valid) {
      this.estimateFee(true);
    }
  }

  // NB: This is not currently used
  public getMaxBalance() {
    let balanceResponse;
    const walletRequest = new WalletInfoRequest(this.globalService.getWalletName(), 0, this.sendForm.get('fee').value);
    this.apiService.getMaximumBalance(walletRequest)
      .pipe(tap(
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

  public estimateFee(isSideChain: boolean) {
    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      'account 0',
      this.sendForm.get(isSideChain ? 'federationAddress' : 'address').value.trim(),
      this.sendForm.get('amount').value,
      this.sendForm.get('fee').value,
      true
    );

    this.walletService.estimateFee(transaction).toPromise()
      .then(response => {
          this.estimatedFee = response;
        },
        error => {
          this.apiError = error.error.errors[0].message;
        }
      );
  }

  public send(sendToSideChain?: boolean) {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction(sendToSideChain))
      .then(transactionResponse => {
        this.estimatedFee = transactionResponse.transactionFee;
        this.activeModal.close('Close clicked');
        this.openConfirmationModal(transactionResponse.isSideChain);
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
    this.walletBalanceSubscription = this.walletService.wallet()
      .subscribe(
        response => {
          this.totalBalance = response.amountConfirmed + response.amountUnconfirmed;
          this.spendableBalance = response.spendableAmount;
        },
      );
  }

  private openConfirmationModal(isSideChainTransaction: boolean) {
    const component = this.modalService
      .open(SendConfirmationComponent, {backdrop: 'static'})
      .componentInstance as SendConfirmationComponent;

    component.transaction = this.transaction;
    component.transactionFee = this.estimatedFee ? this.estimatedFee : this.estimatedSidechainFee;
    component.sidechainEnabled = this.sidechainEnabled;
    component.opReturnAmount = this.opReturnAmount;
    component.hasOpReturn = isSideChainTransaction;
  }
}
