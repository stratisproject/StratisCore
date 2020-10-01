import { FormGroup } from '@angular/forms';

export class FormHelper {
  public static ValidateForm(form: FormGroup, errorObject: any, errorResources: any): void {
    if (form.dirty) {
      Object.keys(form.controls).forEach(field => {
        errorObject[field] = undefined;
        const control = form.controls[field];
        if (control && control.dirty && !control.valid) {
          const messages = errorResources[field];
          Object.keys(control.errors).forEach(key => errorObject[field] = (errorObject[field] || '') + messages[key] + ' ');
        }
      });
    }
  }
}
