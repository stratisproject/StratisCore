import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { WalletInfo } from '../../../../shared/classes/wallet-info';
import { ApiService } from '../../../../shared/services/api.service';
import { GlobalService } from '../../../../shared/services/global.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-resync',
  templateUrl: './resync.component.html',
  styleUrls: ['./resync.component.css']
})
export class ResyncComponent implements OnInit, OnDestroy {

  constructor(private globalService: GlobalService, private apiService: ApiService, private genericModalService: ModalService) { }
  private walletName: string;
  private lastBlockSyncedHeight: number;
  private chainTip: number;
  private isChainSynced: Boolean;
  public isSyncing: Boolean = true;
  private generalWalletInfoSubscription: Subscription;


  ngOnInit() {
    this.walletName = this.globalService.getWalletName();
    this.startSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  public onResyncClicked() {
    this.apiService
      .removeTransaction(this.walletName)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.genericModalService.openModal("Resyncing", "Your wallet is now resyncing. The time remaining depends on the size and creation time of your wallet. The wallet dashboards shows your progress.");
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

  private getGeneralWalletInfo() {
    let walletInfo = new WalletInfo(this.walletName);
    this.generalWalletInfoSubscription = this.apiService.getGeneralInfo(walletInfo)
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
            let generalWalletInfoResponse = response.json();
            this.lastBlockSyncedHeight = generalWalletInfoResponse.lastBlockSyncedHeight;
            this.chainTip = generalWalletInfoResponse.chainTip;
            this.isChainSynced = generalWalletInfoResponse.isChainSynced;

            if (this.isChainSynced && this.lastBlockSyncedHeight == this.chainTip) {
              this.isSyncing = false;
            } else {
              this.isSyncing = true;
            }
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.cancelSubscriptions();
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            }
            else {
              if (error.json().errors[0].description) {
                this.genericModalService.openModal(null, error.json().errors[0].message);
              } else {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        }
      )
    ;
  };

  private cancelSubscriptions() {
    if(this.generalWalletInfoSubscription) {
      this.generalWalletInfoSubscription.unsubscribe();
    }
  };

  private startSubscriptions() {
    this.getGeneralWalletInfo();
  }

}
