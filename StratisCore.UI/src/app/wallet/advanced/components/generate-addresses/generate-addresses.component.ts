import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { ApiService } from '../../../../shared/services/api.service';
import { GlobalService } from '../../../../shared/services/global.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WalletInfo } from '../../../../shared/classes/wallet-info';

@Component({
  selector: 'app-generate-addresses',
  templateUrl: './generate-addresses.component.html',
  styleUrls: ['./generate-addresses.component.css']
})
export class GenerateAddressesComponent implements OnInit {

  constructor(private apiService: ApiService, private globalService: GlobalService, private genericModalService: ModalService, private fb: FormBuilder) {
    this.buildGenerateAddressesForm();
  }

  private generateAddressesForm: FormGroup;
  public addresses: string[] = [''];

  ngOnInit() {
  }

  private buildGenerateAddressesForm() {
    this.generateAddressesForm= this.fb.group({
      "generateAddresses": ["", Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(10)])]
    });

    this.generateAddressesForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.generateAddressesForm) { return; }
    const form = this.generateAddressesForm;
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
    'generateAddresses': ''
  };

  validationMessages = {
    'generateAddresses': {
      'required': 'Please enter an amount to generate.',
      'pattern': 'Please enter a number between 1 and 10.',
      'min': 'Please generate at least one address.',
      'max': 'You can only generate 10 addresses at once.'
    }
  };

  public onGenerateClicked() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.apiService.getUnusedReceiveAddresses(walletInfo, this.generateAddressesForm.get("generateAddresses").value)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.addresses = response.json();
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            }
            else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
  }

  public onBackClicked() {
    this.addresses = [''];
  }
}
