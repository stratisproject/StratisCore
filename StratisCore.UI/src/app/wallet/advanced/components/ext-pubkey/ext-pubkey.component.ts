import { Component, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { WalletInfo } from '@shared/models/wallet-info';
import { SnackbarService } from "ngx-snackbar";

@Component({
  selector: 'app-ext-pubkey',
  templateUrl: './ext-pubkey.component.html',
  styleUrls: ['./ext-pubkey.component.css']
})
export class ExtPubkeyComponent implements OnInit {
  constructor(
    private apiService: ApiService, private globalService: GlobalService, private  snackbarService: SnackbarService) {
  }

  public extPubKey: string;
  public copied: boolean = false;

  ngOnInit() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.getExtPubKey(walletInfo);
  }

  private getExtPubKey(walletInfo: WalletInfo) {
    this.apiService.getExtPubkey(walletInfo)
      .toPromise().then(
      response => {
        this.extPubKey = response;
      }
    );
  }

  public onCopiedClick() {
    this.copied = true;
    this.snackbarService.add({
      msg: 'The Extended Public Key has been copied to your clipboard.',
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }
}
