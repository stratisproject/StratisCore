import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { GlobalService } from '../../shared/services/global.service';
import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';

import { WalletRecovery } from '../../shared/models/wallet-recovery';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})
export class RecoverComponent implements OnInit {

  constructor(private globalService: GlobalService, private apiService: ApiService, private genericModalService: ModalService, private router: Router, private fb: FormBuilder) {
    this.buildRecoverForm();
  }

  public recoverWalletForm: FormGroup;
  public creationDate: Date;
  public isRecovering: boolean = false;
  public minDate = new Date("2009-08-09");
  public maxDate = new Date();
  public bsConfig: Partial<BsDatepickerConfig>;
  private walletRecovery: WalletRecovery;

  ngOnInit() {
    this.bsConfig = Object.assign({}, {showWeekNumbers: false, containerClass: 'theme-dark-blue'});
  }

  private buildRecoverForm(): void {
    this.recoverWalletForm = this.fb.group({
      "walletName": ["", [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z0-9]*$/)
        ]
      ],
      "walletMnemonic": ["", Validators.required],
      "walletDate": ["", Validators.required],
      "walletPassphrase": [""],
      "walletPassword": ["", Validators.required],
      "selectNetwork": ["test", Validators.required]
    });

    this.recoverWalletForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
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
    'walletName': '',
    'walletMnemonic': '',
    'walletDate': '',
    'walletPassword': '',
    'walletPassphrase': '',

  };

  validationMessages = {
    'walletName': {
      'required': 'A wallet name is required.',
      'minlength': 'A wallet name must be at least one character long.',
      'maxlength': 'A wallet name cannot be more than 24 characters long.',
      'pattern': 'Please enter a valid wallet name. [a-Z] and [0-9] are the only characters allowed.'
    },
    'walletMnemonic': {
      'required': 'Please enter your 12 word phrase.'
    },
    'walletDate': {
      'required': 'Please choose the date the wallet should sync from.'
    },
    'walletPassword': {
      'required': 'A password is required.'
    },

  };

  public onBackClicked() {
    this.router.navigate(["/setup"]);
  }

  public onRecoverClicked(){
    this.isRecovering = true;

    let recoveryDate = new Date(this.recoverWalletForm.get("walletDate").value);
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

  private recoverWallet(recoverWallet: WalletRecovery) {
    this.apiService.recoverStratisWallet(recoverWallet)
      .subscribe(
        response => {
          let body = "Your wallet has been recovered. \nYou will be redirected to the decryption page.";
          this.genericModalService.openModal("Wallet Recovered", body);
          this.router.navigate([''])
        },
        error => {
          this.isRecovering = false;
        }
      );
  }
}
