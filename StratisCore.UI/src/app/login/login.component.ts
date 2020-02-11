import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { ApiService } from '@shared/services/api.service';
import { WalletLoad } from '@shared/models/wallet-load';
import { Subscription } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { SideBarItemsProvider } from '@shared/components/side-bar/side-bar-items-provider.service';
import { AccountSidebarItem } from '../wallet/side-bar-items/account-sidebar-item';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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
    private router: Router,
    private fb: FormBuilder,
    private sidebarItems: SideBarItemsProvider,
    private accountSidebarItem: AccountSidebarItem,) {

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
      .subscribe(() => this.onValueChanged()));

    this.onValueChanged();
  }

  private onValueChanged(): void {
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
          this.wallets = response.walletNames.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
          if (this.wallets.length > 0) {
            this.hasWallet = true;
          } else {
            this.hasWallet = false;
          }
        }
      ));
  }

  public onCreateClicked(): void {
    this.openWalletForm.patchValue({password: "", selectWallet: ""});
    this.router.navigate(['setup']);
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
        () => {
          this.sidechainEnabled
            ? this.router.navigate(['address-selection'])
            : this.router.navigate(['wallet/dashboard']);
            this.sidebarItems.setSelected(this.accountSidebarItem)
        },
        () => {
          this.openWalletForm.patchValue({password: ""});
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
