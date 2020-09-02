import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { WalletInfoRequest } from '@shared/models/wallet-info';
import { GlobalService } from '@shared/services/global.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Animations } from '@shared/animations/animations';
import { ElectronService } from 'ngx-electron';
import { WalletService } from '@shared/services/wallet.service';
import { Transaction } from '@shared/models/transaction';
import { TaskBarService } from '@shared/services/task-bar-service';
import { TransactionResponse } from '@shared/models/transaction-response';
import { SendConfirmationComponent } from '../send/send-confirmation/send-confirmation.component';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
  animations: Animations.fadeIn
})
export class SwapComponent implements OnInit, OnDestroy {

  constructor(private apiService: ApiService, public globalService: GlobalService, private fb: FormBuilder, private electronService: ElectronService, private walletService: WalletService, private taskBarService: TaskBarService) { 
    this.buildSwapForm()
  }

  private walletInfoRequest: WalletInfoRequest;
  private maximumBalanceResponse;
  public maxAmount: number;
  public fee: number;
  public swapForm: FormGroup;
  private formValueChanges$: Subscription;
  private maximumBalanceSubscription: Subscription;
  public isSending = false;
  public apiError: string;

  ngOnInit() {
    this.getMaximumAmount();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private getMaximumAmount(): void {
    this.walletInfoRequest = new WalletInfoRequest(this.globalService.getWalletName(), 0, "low");
    this.maximumBalanceSubscription = this.apiService.getMaximumBalance(this.walletInfoRequest)
      .subscribe(
        response => {
          this.maxAmount = response.maxSpendableAmount;
          this.fee = this.getFee(response.fee);
        },
        () => {
          this.cancelSubscriptions();
        }
      )
    ;
  }

  private getFee(fee: number) {
    const minFee: number = 10000;
    if (fee > minFee) {
      return fee;
    } else {
      this.maxAmount = this.maxAmount + fee - minFee;
      return minFee;
    }
  }

  public openTerms(): void {
    this.electronService.shell.openExternal('https://github.com/stratisproject/StratisCore/');
  }

  public swap(): void {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction())
      .then(transactionResponse => {
        this.resetForm();
        this.openConfirmationModal(transactionResponse);
        this.isSending = false;
      }).catch(error => {
      this.isSending = false;
      this.apiError = error.error.errors[0].message;
    })
  }

  private getTransaction(): Transaction {
    return new Transaction(
      this.globalService.getWalletName(),
      'account 0',
      this.swapForm.get('walletPassword').value,
      this.swapForm.get('swapAddress').value.trim(),
      (this.maxAmount / 100000000).toString(),
      this.fee / 100000000,
      true, // Allow unconfirmed
      false, // Shuffle Outputs
      //add op return data here
      //add op return value here
    );
  }

  private resetForm() {
    this.swapForm.reset();
  }

  private openConfirmationModal(transactionResponse: TransactionResponse): void {
    this.taskBarService.open(SendConfirmationComponent, {
      transaction: transactionResponse.transaction,
      transactionFee: this.fee,
      sidechainEnabled: false,
      opReturnAmount: 0,
      hasOpReturn: false
    }, {taskBarWidth: '550px'}).then(ref => {
      ref.closeWhen(ref.instance.closeClicked);
    });
  }

  private buildSwapForm(): void {
    this.swapForm = this.fb.group({
      swapAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      // amount: ['', Validators.compose([Validators.required,
      //   Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
      //   Validators.min(0.00001),
      //   (control: AbstractControl) => Validators.max(balanceCalculator())(control)])],
      // fee: ['medium', Validators.required],
      walletPassword: ['', Validators.required],
      tacAgreed: ['', Validators.required]
    });

    this.formValueChanges$ = this.swapForm.valueChanges
      .subscribe(() => this.onValueChanged());
  }

  onValueChanged(): void {
    if (!this.swapForm) { return; }
    const form = this.swapForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.swapValidationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    swapAddress: '',
    walletPassword: '',
    tacAgreed: ''
  };

  swapValidationMessages = {
    swapAddress: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.'
    },
    // amount: {
    //   required: 'An amount is required.',
    //   pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
    //   min: 'The amount has to be more or equal to 0.00001.',
    //   max: 'The total transaction amount exceeds your spendable balance.'
    // },
    // fee: {
    //   required: 'A fee is required.'
    // },
    walletPassword: {
      required: 'Your password is required.'
    },
    tacAgreed: {
      required: 'You need to accept our terms and conditions'
    }
  };

  private cancelSubscriptions(): void {
    if (this.maximumBalanceSubscription) {
      this.maximumBalanceSubscription.unsubscribe();
    }
  }
}
