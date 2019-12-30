import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { GlobalService } from '@shared/services/global.service';
import { ApiService } from '@shared/services/api.service';
import { ModalService } from '@shared/services/modal.service';

import { WalletRecovery } from '@shared/models/wallet-recovery';

import { PasswordValidationDirective } from '@shared/directives/password-validation.directive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})
export class RecoverComponent implements OnInit, OnDestroy {

  constructor(private globalService: GlobalService, private apiService: ApiService, private genericModalService: ModalService, private router: Router, private fb: FormBuilder) {
    this.buildRecoverForm();
  }

  public recoverWalletForm: FormGroup;
  public creationDate: Date;
  public isRecovering = false;
  public minDate = new Date("2009-08-09");
  public maxDate = new Date();
  public bsConfig: Partial<BsDatepickerConfig>;
  public sidechainEnabled: boolean;
  private walletRecovery: WalletRecovery;
  private formValueChanges$: Subscription;
  private passphrase$: Subscription;

  ngOnInit(): void {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.bsConfig = Object.assign({}, {showWeekNumbers: false, containerClass: 'theme-dark-blue'});
  }

  private buildRecoverForm(): void {
    this.recoverWalletForm = this.fb.group({
      walletName: ["", [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z0-9]*$/)
        ]
      ],
      walletMnemonic: ["", Validators.required],
      walletDate: ["", Validators.required],
      walletPassword: ["", Validators.required],
      walletPasswordConfirmation: ["", Validators.required],
      walletPassphrase: [""],
      walletPassphraseConfirmation: [""],
      selectNetwork: ["test", Validators.required]
    }, {
      validator: PasswordValidationDirective.MatchPassword
    });

    this.formValueChanges$ = this.recoverWalletForm.valueChanges
      .subscribe(() => this.onValueChanged());

    const passphrase = this.recoverWalletForm.get('walletPassphrase');
    const passphraseConfirmation = this.recoverWalletForm.get('walletPassphraseConfirmation');

    this.passphrase$ = passphrase.valueChanges.subscribe(rsp => {
      this.setDynamicPassphraseValidators(rsp, { passphrase, passphraseConfirmation });
    });

    this.onValueChanged();
  }

  onValueChanged(): void {
    if (!this.recoverWalletForm) { return; }
    const form = this.recoverWalletForm;
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

  formErrors = {
    walletName: '',
    walletMnemonic: '',
    walletDate: '',
    walletPassword: '',
    walletPasswordConfirmation: '',
    walletPassphrase: '',
    walletPassphraseConfirmation: '',

  };

  validationMessages = {
    walletName: {
      'required': 'A wallet name is required.',
      'minlength': 'A wallet name must be at least one character long.',
      'maxlength': 'A wallet name cannot be more than 24 characters long.',
      'pattern': 'Please enter a valid wallet name. [a-Z] and [0-9] are the only characters allowed.'
    },
    walletMnemonic: {
      'required': 'Please enter your 12 word phrase.'
    },
    walletDate: {
      'required': 'Please choose the date the wallet should sync from.'
    },
    walletPassword: {
      'required': 'A password is required.'
    },
    walletPasswordConfirmation: {
      required: 'Confirm your password.',
      walletPasswordConfirmation: 'Passwords do not match.'
    },
    walletPassphraseConfirmation: {
      required: 'Confirm your passphrase.',
      walletPassphraseConfirmation: 'Passphrases do not match.'
    }
  };

  public onBackClicked(): void {
    this.router.navigate(["/setup"]);
  }

  public onRecoverClicked(): void {
    this.isRecovering = true;

    const recoveryDate = new Date(this.recoverWalletForm.get("walletDate").value);
    recoveryDate.setDate(recoveryDate.getDate() - 1);

    this.walletRecovery = new WalletRecovery(
      this.recoverWalletForm.get("walletName").value,
      this.recoverWalletForm.get("walletMnemonic").value,
      this.recoverWalletForm.get("walletPassword").value,
      this.recoverWalletForm.get("walletPassphrase").value,
      recoveryDate
    );
    this.recoverWallet(this.walletRecovery);
  }

  private recoverWallet(recoverWallet: WalletRecovery): void {
    this.apiService.recoverStratisWallet(recoverWallet)
      .subscribe(
        () => {
          const body = "Your wallet has been recovered. \nYou will be redirected to the decryption page.";
          this.genericModalService.openModal("Wallet Recovered", body);
          this.router.navigate([''])
        },
        () => {
          this.isRecovering = false;
        }
      );
  }

  private setDynamicPassphraseValidators(passphraseValue: string, controls: { passphrase: AbstractControl; passphraseConfirmation: AbstractControl }): void {
    const { passphrase, passphraseConfirmation } = controls;

    if (passphraseValue.length) {
      // passphrase and confirmation should be required if passphrase is not null
      passphrase.setValidators(Validators.required);
      passphraseConfirmation.setValidators(Validators.required);

      // Update form group validators to include MatachPassword and MatchPassphrase
      this.recoverWalletForm.setValidators([

        PasswordValidationDirective.MatchPassword,
        PasswordValidationDirective.MatchPassphrase
      ]);
    } else { // Else, passphrase field is null, clear validators
      // clear passphrase validators, errors, mark pristine
      passphrase.clearValidators();
      passphrase.setErrors(null);
      passphrase.markAsPristine();

      // clear confirmation validators, errors, mark pristine
      passphraseConfirmation.setValue(null);
      passphraseConfirmation.clearValidators();
      passphraseConfirmation.setErrors(null);
      passphraseConfirmation.markAsPristine();

      // clear then set MatchPassword validator on form
      this.recoverWalletForm.clearValidators();
      this.recoverWalletForm.setValidators(PasswordValidationDirective.MatchPassword);
    }

    this.recoverWalletForm.updateValueAndValidity();
  }

  public ngOnDestroy(): void {
    this.formValueChanges$.unsubscribe();
    this.passphrase$.unsubscribe();
  }
}
