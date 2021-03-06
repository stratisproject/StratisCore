import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { CoinNotationPipe } from '@shared/pipes/coin-notation.pipe';
import { NumberToStringPipe } from '@shared/pipes/number-to-string.pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { Transaction } from '@shared/models/transaction';
import { WalletInfoRequest } from '@shared/models/wallet-info';
import { SendConfirmationComponent } from './send-confirmation/send-confirmation.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SendComponentFormResources } from './send-component-form-resources';
import { FormHelper } from '@shared/forms/form-helper';
import { TransactionResponse } from '@shared/models/transaction-response';
import { CurrentAccountService } from '@shared/services/current-account.service';
import { ActivatedRoute } from '@angular/router';
import { Animations } from '@shared/animations/animations';
import { AddressBookService } from '@shared/services/address-book-service';
import { AddressLabel } from '@shared/models/address-label';
import { Network } from '@shared/models/network';
import { TaskBarService } from '@shared/services/task-bar-service';


export interface FeeStatus {
  estimating: boolean;
}

@Component({
  selector: 'send-component',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss'],
  animations: Animations.fadeIn
})
export class SendComponent implements OnInit, OnDestroy {
  private accountsEnabled: boolean;
  public status: BehaviorSubject<FeeStatus> = new BehaviorSubject<FeeStatus>({estimating: false});
  public sideChain: boolean;
  private last: FeeEstimation = null;
  public contact: AddressLabel;
  public testnetEnabled: boolean;
  public networks: Network[];

  constructor(
    private addressBookService: AddressBookService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private walletService: WalletService,
    private globalService: GlobalService,
    private modalService: NgbModal,
    private taskBarService: TaskBarService,
    private currentAccountService: CurrentAccountService,
    private fb: FormBuilder) {

    this.sendForm = SendComponentFormResources.buildSendForm(fb,
      () => (this.spendableBalance - this.estimatedFee) / 100000000);

    this.sendToSidechainForm = SendComponentFormResources.buildSendToSidechainForm(fb,
      () => (this.spendableBalance - this.estimatedSidechainFee) / 100000000);

    this.subscriptions.push(this.sendForm.valueChanges.pipe(debounceTime(500))
      .subscribe(data => this.validateForm(data, false)));

    this.subscriptions.push(this.sendToSidechainForm.valueChanges.pipe(debounceTime(500))
      .subscribe(data => this.validateForm(data, true)));

    this.subscriptions.push(this.sendToSidechainForm.get('networkSelect').valueChanges.subscribe(data => this.networkSelectChanged(data)));
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
  public sendingTo: string;

  // The opReturnAmount is for compatibility with StratisX, opReturnAmount needs to be greater than 0 to pass the MemPool
  // Validation rules.
  public opReturnAmount = 1;
  public confirmationText: string;
  private subscriptions: Subscription[] = [];
  private sendFormErrors: any = {};
  private sendToSidechainFormErrors: any = {};

  public ngOnInit(): void {

    if (this.activatedRoute.snapshot.params['address']) {
      this.address = this.activatedRoute.snapshot.params['address'];
      this.getAddressBookContact();
    }

    this.testnetEnabled = this.globalService.getTestnetEnabled();
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.accountsEnabled = this.sidechainEnabled && this.currentAccountService.hasActiveAddress();

    if (this.sidechainEnabled) {
      if (this.testnetEnabled) {
        this.networks = SendComponentFormResources.cirrusTestNetworks;
      } else {
        this.networks = SendComponentFormResources.cirrusNetworks;
      }
    } else {
      if (this.testnetEnabled) {
        this.networks = SendComponentFormResources.stratisTestNetworks;
      } else {
        this.networks = SendComponentFormResources.stratisNetworks;
      }
    }

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

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private validateForm(data: any, isSideChain: boolean): void {

    try {
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

      const isValidForFeeEstimate = (isSideChain
        ? form.get('amount').valid && form.get('destinationAddress').valid && form.get('federationAddress').valid && form.get('fee').valid
        : form.get('address').valid && form.get('amount').valid && form.get('fee').valid);

      if (isValidForFeeEstimate) {
        this.estimateFee(form, isSideChain);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private networkSelectChanged(data: any): void {
    if (this.sendToSidechainForm.get('networkSelect').value && this.sendToSidechainForm.get('networkSelect').value !== 'customNetwork') {
      this.sendToSidechainForm.patchValue({'federationAddress': this.sendToSidechainForm.get('networkSelect').value})
    } else if (this.sendToSidechainForm.get('networkSelect').value && this.sendToSidechainForm.get('networkSelect').value === 'customNetwork') {
      this.sendToSidechainForm.patchValue({'federationAddress': ''})
    }
  }

  // NB: This is not currently used
  public getMaxBalance(): void {
    let balanceResponse;
    const walletRequest = new WalletInfoRequest(this.globalService.getWalletName(), 0, this.sendForm.get('fee').value);
    this.apiService.getMaximumBalance(walletRequest)
      .pipe(tap(
        response => {
          balanceResponse = response;
        },
        error => {
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
      isSideChain ? form.get('destinationAddress').value.trim() : '',
      form.get('amount').value,
      form.get('fee').value,
      true,
    );


    if (!transaction.equals(this.last)) {
      this.last = transaction;
      const progressDelay = setTimeout(() =>
        this.status.next({estimating: true}), 100);

      this.walletService.estimateFee(transaction).toPromise()
        .then(response => {
            if (isSideChain) {
              this.estimatedSidechainFee = response;
            } else {
              this.estimatedFee = response;
            }
            this.last.response = response;
            clearTimeout(progressDelay);
            this.status.next({estimating: false});
          },
          error => {
            clearTimeout(progressDelay);
            this.status.next({estimating: false});
            this.apiError = error.error.errors[0].message;
            if (this.apiError == 'Invalid address') {
              if (isSideChain) {
                this.sendToSidechainFormErrors.destinationAddress = this.apiError
              } else {
                this.sendFormErrors.address = this.apiError;
              }
              this.last.error = this.apiError;
            }
          }
        );
    } else if (transaction.equals(this.last) && !this.status.value.estimating) {
      // Use the cached value
      if (isSideChain) {
        this.estimatedSidechainFee = this.last.response;
        this.sendToSidechainFormErrors.destinationAddress = this.last.error;
      } else {
        this.estimatedFee = this.last.response;
        this.sendFormErrors.address = this.last.error
      }
    }
  }

  public send(sendToSideChain?: boolean): void {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction(sendToSideChain))
      .then(transactionResponse => {
        this.resetSendForms();
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
      !this.accountsEnabled, // Shuffle Outputs
      isSideChain ? this.sendToSidechainForm.get('destinationAddress').value.trim() : null,
      isSideChain ? new NumberToStringPipe().transform((this.opReturnAmount / 100000000)) : null,
    );
  }

  public switchForms(isSideChain: boolean): void {
    this.sideChain = isSideChain;
    this.resetSendForms();
  }

  private resetSendForms(): void {
    this.sendToSidechainForm.reset();
    this.sendToSidechainForm.get('networkSelect').patchValue('');
    this.sendToSidechainForm.get('fee').patchValue('medium');
    this.sendForm.reset();
    this.sendForm.get('fee').patchValue('medium');
    this.estimatedSidechainFee = 0;
    this.estimatedFee = 0;
  }

  private getAddressBookContact(): void {
    this.contact = this.addressBookService.findContactByAddress(this.address);
  }

  private getWalletBalance(): void {
    this.subscriptions.push(this.walletService.wallet()
      .subscribe(
        response => {
          this.totalBalance = response.amountConfirmed + response.amountUnconfirmed;
          this.spendableBalance = response.spendableAmount;
        },
      ));
  }

  private openConfirmationModal(transactionResponse: TransactionResponse): void {
    this.taskBarService.open(SendConfirmationComponent, {
      transaction: transactionResponse.transaction,
      transactionFee: this.estimatedFee ? this.estimatedFee : this.estimatedSidechainFee,
      sidechainEnabled: this.sidechainEnabled,
      opReturnAmount: this.opReturnAmount,
      hasOpReturn: transactionResponse.isSideChain
    }, {taskBarWidth: '550px'}).then(ref => {
      ref.closeWhen(ref.instance.closeClicked);
    });
  }

  public clearContact(): void {
    this.contact = null;
    this.sendForm.controls.address.setValue('');
  }
}
