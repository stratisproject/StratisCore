import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { WalletInfo } from '../../../../shared/models/wallet-info';
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
          this.genericModalService.openModal("Resyncing", "Your wallet is now resyncing. The time remaining depends on the size and creation time of your wallet. The wallet dashboards shows your progress.");
        }
      );
  }

  private getGeneralWalletInfo() {
    let walletInfo = new WalletInfo(this.walletName);
    this.generalWalletInfoSubscription = this.apiService.getGeneralInfo(walletInfo)
      .subscribe(
        response =>  {
          let generalWalletInfoResponse = response;
          this.lastBlockSyncedHeight = generalWalletInfoResponse.lastBlockSyncedHeight;
          this.chainTip = generalWalletInfoResponse.chainTip;
          this.isChainSynced = generalWalletInfoResponse.isChainSynced;

          if (this.isChainSynced && this.lastBlockSyncedHeight == this.chainTip) {
            this.isSyncing = false;
          } else {
            this.isSyncing = true;
          }
        },
        error => {
          this.cancelSubscriptions();
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
