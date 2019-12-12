import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { ApiService } from '@shared/services/api.service';
import { ModalService } from '@shared/services/modal.service';
import { WalletLoad } from '@shared/models/wallet-load';
import { Subscription } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  private openWalletForm: FormGroup;
  private wallets: string[];
  private subscriptions: Subscription[] = [];

  private formErrors = {
    'password': ''
  };

  private validationMessages = {
    'password': {
      'required': 'Please enter your password.'
    }
  };

  constructor(
    private globalService: GlobalService,
    private apiService: ApiService,
    private walletService: WalletService,
    private genericModalService: ModalService,
    private router: Router,
    private fb: FormBuilder) {

    this.buildDecryptForm();
  }

  public sidechainEnabled: boolean;
  public hasWallet = false;
  public isDecrypting = false;


  public ngOnInit(): void {
    this.getWalletNames();
    this.getCurrentNetwork();
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
  }

  private buildDecryptForm(): void {
    this.openWalletForm = this.fb.group({
      'selectWallet': [{value: '', disabled: this.isDecrypting}, Validators.required],
      'password': [{value: '', disabled: this.isDecrypting}, Validators.required]
    });

    this.subscriptions.push(this.openWalletForm.valueChanges
      .subscribe(data => this.onValueChanged(data)));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {
    if (!this.openWalletForm) {
      return;
    }
    const form = this.openWalletForm;
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

  private getWalletNames(): void {
    this.subscriptions.push(this.walletService.getWalletNames()
      .subscribe(
        response => {
          this.wallets = response.walletNames;
          if (this.wallets.length > 0) {
            this.hasWallet = true;
          } else {
            this.hasWallet = false;
          }
        }
      ));
  }

  public onCreateClicked() {
    this.router.navigate(['setup']);
  }

  public onEnter(): void {
    if (this.openWalletForm.valid) {
      this.onDecryptClicked();
    }
  }

  public onDecryptClicked(): void {
    this.isDecrypting = true;
    this.globalService.setWalletName(this.openWalletForm.get('selectWallet').value);
    const walletLoad = new WalletLoad(
      this.openWalletForm.get('selectWallet').value,
      this.openWalletForm.get('password').value
    );
    this.loadWallet(walletLoad);
  }

  private loadWallet(walletLoad: WalletLoad): void {
    this.walletService.loadStratisWallet(walletLoad)
      .subscribe(
        response => {
          this.sidechainEnabled
            ? this.router.navigate(['address-selection'])
            : this.router.navigate(['wallet/dashboard']);
        },
        error => {
          this.isDecrypting = false;
        }
      )
    ;
  }

  private getCurrentNetwork(): void {
    this.apiService.getNodeStatus()
      .subscribe(
        response => {
          this.globalService.setCoinUnit(response.coinTicker);
          this.globalService.setNetwork(response.network);
        }
      )
    ;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
