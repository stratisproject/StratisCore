import { Form, FormGroup } from '@angular/forms';

export class BaseForm {
  public validateControls(form: FormGroup, formErrors: any, validationMessages: any) {
    for (const field in formErrors) {
      if (!formErrors.hasOwnProperty(field)) {
        continue;
      }

      formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = validationMessages[field];
        for (const key in control.errors) {
          if (!control.errors.hasOwnProperty(key)) {
            continue;
          }

          formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }
}
