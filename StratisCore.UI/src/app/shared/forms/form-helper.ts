import { FormGroup } from '@angular/forms';

export class FormHelper {
  public static ValidateForm(form: FormGroup, errorObject: any, errorResources: any) {
    if (!form.valid && form.dirty) {
      Object.keys(form.controls).forEach(field => {
        errorObject[field] = '';
        const control = form.controls[field];
        if (control && control.dirty && !control.valid) {
          const messages = errorResources[field];
          Object.keys(control.errors).forEach(key => errorObject[field] += messages[key] + ' ');
        }
      });
    }
  }
}
