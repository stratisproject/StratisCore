import { Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidation]'
})
export class PasswordValidationDirective {
  constructor() { }

  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('walletPassword').value;
    const confirmPassword = AC.get('walletPasswordConfirmation').value;

    if (confirmPassword !== password) {
      AC.get('walletPasswordConfirmation').setErrors({ walletPasswordConfirmation: true });
    } else {
      AC.get('walletPasswordConfirmation').setErrors(null);
      return null;
    }
  }
}
