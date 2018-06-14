import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { GlobalService } from '../shared/services/global.service';
import { ApiService } from '../shared/services/api.service';
import { ModalService } from '../shared/services/modal.service';
import { Log } from '../shared/services/logger.service';

import { WalletLoad } from '../shared/classes/wallet-load';
import { WalletInfo } from '../shared/classes/wallet-info';
import { BaseForm } from '../shared/components/base-form';
import { SidechainsService } from '../wallet/sidechains/services/sidechains.service';

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
    private fb: FormBuilder,
    private sidechainsService: SidechainsService,
    private log: Log) {
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
    this.tryToLoadSidechain();
  }

  get sidechainsAvailable() {
    return this.globalService.sidechainsEnabled;
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
            this.globalService.walletPath = responseMessage.walletsPath;
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
    this.globalService.walletName = this.openWalletForm.get('selectWallet').value;
    if (!this.globalService.sidechainsEnabled) {
      this.globalService.coinName = 'TestStratis';
      this.globalService.coinUnit = 'TSTRAT';
    }
    this.getCurrentNetwork();
    const walletLoad = new WalletLoad(
      this.openWalletForm.get('selectWallet').value,
      this.openWalletForm.get('password').value
    );
    this.loadWallet(walletLoad);
  }

  private tryToLoadSidechain() {
    this.log.log('Check if sidechain API is available');
    this.globalService.sidechainsEnabled = false;
    this.sidechainsService.getNodeStatus().subscribe(
      response => {
        if (response.status >= 200 && response.status < 400) {
          const nodeStasus = response.json();
          this.globalService.sidechainsEnabled =
                  nodeStasus.network.toUpperCase().indexOf('STRATIS') < 0 &&
                  nodeStasus.network.toUpperCase() !== 'MAIN';
          this.globalService.coinName = 'TAPEX'; // TODO: change to nodeStasus.coinName once available;
          this.globalService.coinUnit = 'TAPEX'; // TODO: change to nodeStasus.coinSymbol once available;
        }
      },
      error => {
        if (error.status === 404) {
          this.globalService.sidechainsEnabled = false;
        } else {
          console.log(error);
        }
      }
    );
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
    const walletInfo = new WalletInfo(this.globalService.walletName);
    this.apiService.getGeneralInfoOnce(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            const responseMessage = response.json();
            this.globalService.network = responseMessage.network;
            if (responseMessage.network === 'StratisMain') {
              this.globalService.coinName = 'Stratis';
              this.globalService.coinUnit = 'STRAT';
            } else if (responseMessage.network === 'StratisTest') {
              this.globalService.coinName = 'TestStratis';
              this.globalService.coinUnit = 'TSTRAT';
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
