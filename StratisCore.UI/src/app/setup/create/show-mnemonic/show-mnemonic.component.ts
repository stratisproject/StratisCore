import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { WalletCreation } from '@shared/models/wallet-creation';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'app-show-mnemonic',
  templateUrl: './show-mnemonic.component.html',
  styleUrls: ['./show-mnemonic.component.css']
})
export class ShowMnemonicComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private router: Router, private globalService: GlobalService) { }
  private mnemonic: string;
  private subscription: Subscription;
  private newWallet: WalletCreation;
  public mnemonicArray: string[];
  public sidechainEnabled: boolean;

  ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.subscription = this.route.queryParams.subscribe(params => {
      this.newWallet = new WalletCreation(
        params["name"],
        params["mnemonic"],
        params["password"],
        params["passphrase"]
      )
    });

    this.showMnemonic();
  }

  private showMnemonic() {
    this.mnemonic = this.newWallet.mnemonic;
    this.mnemonicArray = this.mnemonic.split(" ");
  }

  public onContinueClicked() {
    this.router.navigate(['/setup/create/confirm-mnemonic'], { queryParams : { name: this.newWallet.name, mnemonic: this.newWallet.mnemonic, password: this.newWallet.password, passphrase: this.newWallet.passphrase }});
  }

  public onCancelClicked() {
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
