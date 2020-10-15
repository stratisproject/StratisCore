import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { WalletInfoRequest } from '@shared/models/wallet-info';
import { GlobalService } from '@shared/services/global.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Animations } from '@shared/animations/animations';
import { ElectronService } from 'ngx-electron';
import { WalletService } from '@shared/services/wallet.service';
import { TaskBarService } from '@shared/services/task-bar-service';
import { SwapConfirmationComponent } from './swap-confirmation/swap-confirmation.component';
import { OpreturnTransaction } from '@shared/models/opreturn-transaction';


@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
  animations: Animations.fadeIn
})
export class SwapComponent implements OnInit, OnDestroy {

  constructor(private apiService: ApiService, public globalService: GlobalService, private fb: FormBuilder, private electronService: ElectronService, private walletService: WalletService, private taskBarService: TaskBarService) {
    this.testnetEnabled = globalService.getTestnetEnabled();
    this.addressRegExp = this.testnetEnabled ? '^q[1-9A-HJ-NP-Za-km-z]+$' : '^X[1-9A-HJ-NP-Za-km-z]+$';
    this.buildSwapForm();
  }

  private walletInfoRequest: WalletInfoRequest;
  public maxAmount: number;
  public noBalance: boolean;
  public fee: number;
  public swapForm: FormGroup;
  private formValueChanges$: Subscription;
  private maximumBalanceSubscription: Subscription;
  public isSwapping = false;
  public apiError: string;
  public testnetEnabled: boolean;
  public addressRegExp: string;

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
          if (this.maxAmount <= 0) {
            this.noBalance = true;
          } else {
            this.noBalance = false;
          }
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
    this.electronService.shell.openExternal('https://www.stratisplatform.com/wp-content/uploads/2020/10/Strax-Token-Swap-Terms-and-Conditions.pdf');
  }

  private getTransaction(): OpreturnTransaction {
    return new OpreturnTransaction(
      this.globalService.getWalletName(),
      'account 0',
      this.swapForm.get('walletPassword').value,
      this.fee / 100000000,
      true, // Allow unconfirmed
      false, // Shuffle Outputs
      this.swapForm.get('swapAddress').value.trim(), // OP_RETURN data
      (this.maxAmount / 100000000).toString(),// OP_RETURN value
    );
  }

  private resetForm() {
    this.swapForm.reset();
    this.isSwapping = false;
  }

  public openSwapModal(): void {
    this.isSwapping = true;
    this.taskBarService.open(SwapConfirmationComponent, {
      transaction: this.getTransaction()
    }, {taskBarWidth: '550px'}).then(ref => {
      ref.closeWhen(ref.instance.closeClicked);
      this.resetForm();
    });
  }

  private buildSwapForm(): void {
    this.swapForm = this.fb.group({
      swapAddress: ['', Validators.compose([Validators.required, Validators.minLength(26), Validators.maxLength(40), Validators.pattern(this.addressRegExp)])],
      walletPassword: ['', Validators.required],
      tacAgreed: ['', Validators.requiredTrue],
      burnAgreed: ['', Validators.requiredTrue],
      exchangeAgreed: ['', Validators.requiredTrue]
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
    tacAgreed: '',
    burnAgreed: '',
    exchangeAgreed: ''
  };

  swapValidationMessages = {
    swapAddress: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.',
      maxlength: 'An address is not longer than 40 characters.',
      pattern: 'This is not a valid address.'
    },
    walletPassword: {
      required: 'Your password is required.'
    },
    tacAgreed: {
      required: 'You must agree to the terms and conditions.'
    },
    burnAgreed: {
      required: 'You must confirm that your STRATIS Legacy Tokens will be irreversibly destroyed.'
    },
    exchangeAgreed: {
      required: 'You must confirm your consent for us to exchange your STRATIS Legacy Tokens and acknowledge your right to cancel will be lost.'
    }
  };

  private cancelSubscriptions(): void {
    if (this.maximumBalanceSubscription) {
      this.maximumBalanceSubscription.unsubscribe();
    }
  }
}
