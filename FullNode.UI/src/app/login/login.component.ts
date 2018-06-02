import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { GlobalService } from '../shared/services/global.service';
import { ApiService } from '../shared/services/api.service';
import { ModalService } from '../shared/services/modal.service';

import { WalletLoad } from '../shared/classes/wallet-load';
import { WalletInfo } from '../shared/classes/wallet-info';
import { BaseForm } from '../shared/components/base-form';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent extends BaseForm implements OnInit {
  constructor(
    private globalService: GlobalService,
    private apiService: ApiService,
    private genericModalService: ModalService,
    private router: Router,
    private fb: FormBuilder) {
      super();
      this.buildDecryptForm();
  }

  public hasWallet = false;
  public isDecrypting = false;
  public openWalletForm: FormGroup;
  public wallets: [string];

  formErrors = {
    'password': ''
  };

  validationMessages = {
    'password': {
      'required': 'Please enter your password.'
    }
  };

  ngOnInit() {
    this.getWalletFiles();
  }

  private buildDecryptForm(): void {
    this.openWalletForm = this.fb.group({
      'selectWallet': ['', Validators.required],
      'password': ['', Validators.required]
    });

    this.openWalletForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.openWalletForm) { return; }
    const form = this.openWalletForm;
    this.validateControls(form, this.formErrors, this.validationMessages);
  }

  private getWalletFiles() {
    this.apiService.getWalletFiles()
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            const responseMessage = response.json();
            this.wallets = responseMessage.walletsFiles;
            this.globalService.WalletPath = responseMessage.walletsPath;
            if (this.wallets.length > 0) {
              this.hasWallet = true;
              for (const wallet in this.wallets) {
                if (!this.wallets.hasOwnProperty(wallet)) {
                  continue;
                }
                this.wallets[wallet] = this.wallets[wallet].slice(0, -12);
              }
            } else {
              this.hasWallet = false;
            }
          }
        },
        error => {
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
  }

  public onCreateClicked() {
    this.router.navigate(['/setup']);
  }

  public onEnter() {
    if (this.openWalletForm.valid) {
      this.onDecryptClicked();
    }
  }

  public onDecryptClicked() {
    this.isDecrypting = true;
    this.globalService.WalletName = this.openWalletForm.get('selectWallet').value;
    this.globalService.CoinName = 'TestStratis';
    this.globalService.CoinUnit = 'TSTRAT';
    this.getCurrentNetwork();
    const walletLoad = new WalletLoad(
      this.openWalletForm.get('selectWallet').value,
      this.openWalletForm.get('password').value
    );
    this.loadWallet(walletLoad);
  }

  private loadWallet(walletLoad: WalletLoad) {
    this.apiService.loadStratisWallet(walletLoad)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            // Navigate to the wallet section
            this.router.navigate(['/wallet']);
          }
        },
        error => {
          this.isDecrypting = false;
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
  }

  private getCurrentNetwork() {
    const walletInfo = new WalletInfo(this.globalService.WalletName);
    this.apiService.getGeneralInfoOnce(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            const responseMessage = response.json();
            this.globalService.Network = responseMessage.network;
            if (responseMessage.network === 'StratisMain') {
              this.globalService.CoinName = 'Stratis';
              this.globalService.CoinUnit = 'STRAT';
            } else if (responseMessage.network === 'StratisTest') {
              this.globalService.CoinName = 'TestStratis';
              this.globalService.CoinUnit = 'TSTRAT';
            }
          }
        },
        error => {
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
  }
}
