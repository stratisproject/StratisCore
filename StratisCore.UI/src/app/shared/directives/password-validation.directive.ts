import { Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidation]'
})
export class PasswordValidationDirective {
  constructor() { }

  static MatchPassword(AC: AbstractControl) {
    let password = AC.get('walletPassword').value;
    let confirmPassword = AC.get('walletPasswordConfirmation').value;

    if(confirmPassword !== password) {
      AC.get('walletPasswordConfirmation').setErrors({ walletPasswordConfirmation: true });
    } else {
      AC.get('walletPasswordConfirmation').setErrors(null);
      return null;
    }
  }

  static MatchPassphrase(AC: AbstractControl) {
    let passphrase = AC.get('walletPassphrase').value;
    let confirmPassphrase = AC.get('walletPassphraseConfirmation').value;

    if(passphrase !== confirmPassphrase) {
      AC.get('walletPassphraseConfirmation').setErrors({ walletPassphraseConfirmation: true });
    } else {
      AC.get('walletPassphraseConfirmation').setErrors(null);
      return null;
    }
  }
}
