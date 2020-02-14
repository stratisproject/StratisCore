import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from 'ngx-snackbar';
import { WalletService } from '@shared/services/wallet.service';

@Component({
  selector: 'app-broadcast-transaction',
  templateUrl: './broadcast-transaction.component.html',
  styleUrls: ['./broadcast-transaction.component.scss']
})
export class BroadcastTransactionComponent implements OnInit {
  @Output() transactionBroadcasted = new EventEmitter<boolean>();
  constructor(
    private walletService: WalletService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) { }

  public broadcastTransactionForm: FormGroup;

  ngOnInit(): void {
    this.buildBroadcastTransactionForm();
  }

  formErrors = {
    transactionHex: ''
  };

  validationMessages = {
    transactionHex: {
      required: 'Add a transaction hex is required.',
      pattern: 'This is not a valid transaction hex.'
    }
  };

  private buildBroadcastTransactionForm(): void {
    this.broadcastTransactionForm = this.fb.group({
      transactionHex: ['', Validators.compose([
        Validators.required,
        Validators.minLength(20)
      ])
    ]});

    this.broadcastTransactionForm.valueChanges
      .subscribe(() => this.onValueChanged());

    this.onValueChanged();
  }

  onValueChanged(): void {
    if (!this.broadcastTransactionForm) {
      return;
    }
    const form = this.broadcastTransactionForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public onBroadcastTransactionClicked(): void {
    this.walletService
      .broadcastTransaction(this.broadcastTransactionForm.get('transactionHex').value)
      .toPromise().then(
        () => {
          this.transactionBroadcasted.emit(true);
          this.snackbarService.add({
            msg: 'Transaction broadcasted succesfully',
            customClass: 'notify-snack-bar',
            action: {
              text: null
            }
          });

          this.broadcastTransactionForm.patchValue({transactionHex: ''});
          this.formErrors.transactionHex = '';
        }
      );
  }
}
