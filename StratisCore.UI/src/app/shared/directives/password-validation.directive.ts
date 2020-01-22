import { Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidation]'
})
export class PasswordValidationDirective {
  constructor() { }

  static MatchPassword(AC: AbstractControl): any {
    const password = AC.get('walletPassword').value;
    const confirmPassword = AC.get('walletPasswordConfirmation').value;

    if(confirmPassword !== password) {
      AC.get('walletPasswordConfirmation').setErrors({ walletPasswordConfirmation: true });
    } else {
      AC.get('walletPasswordConfirmation').setErrors(null);
      return null;
    }
  }

  static MatchPassphrase(AC: AbstractControl): any {
    const passphrase = AC.get('walletPassphrase').value;
    const confirmPassphrase = AC.get('walletPassphraseConfirmation').value;

    if(passphrase !== confirmPassphrase) {
      AC.get('walletPassphraseConfirmation').setErrors({ walletPassphraseConfirmation: true });
    } else {
      AC.get('walletPassphraseConfirmation').setErrors(null);
      return null;
    }
  }
}
