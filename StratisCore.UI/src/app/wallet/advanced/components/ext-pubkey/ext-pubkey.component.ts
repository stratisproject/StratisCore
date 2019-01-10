import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { GlobalService } from '../../../../shared/services/global.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WalletInfo } from '../../../../shared/models/wallet-info';

@Component({
  selector: 'app-ext-pubkey',
  templateUrl: './ext-pubkey.component.html',
  styleUrls: ['./ext-pubkey.component.css']
})
export class ExtPubkeyComponent implements OnInit {
  constructor(private apiService: ApiService, private globalService: GlobalService, private genericModalService: ModalService) { }

  public extPubKey: string;
  public copied: Boolean = false;

  ngOnInit() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.getExtPubKey(walletInfo);
  }

  private getExtPubKey(walletInfo: WalletInfo) {
    this.apiService.getExtPubkey(walletInfo)
      .subscribe(
        response => {
          let responseMessage = response;
          this.extPubKey = responseMessage;
        }
      );
  }

  public onCopiedClick() {
    this.copied=true;
  }
}
