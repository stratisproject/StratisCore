import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { GlobalService } from '../../../../shared/services/global.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WalletInfo } from '../../../../shared/classes/wallet-info';

@Component({
  selector: 'app-ext-pubkey',
  templateUrl: './ext-pubkey.component.html',
  styleUrls: ['./ext-pubkey.component.css']
})
export class ExtPubkeyComponent implements OnInit {

  constructor(private apiService: ApiService, private globalService: GlobalService, private genericModalService: ModalService) { }

  public extPubKey: string;

  ngOnInit() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.getExtPubKey(walletInfo);
  }

  private getExtPubKey(walletInfo: WalletInfo) {
    this.apiService.getExtPubkey(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            let responseMessage = response.json();
            this.extPubKey = responseMessage;
          }
        },
        error => {
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
}
