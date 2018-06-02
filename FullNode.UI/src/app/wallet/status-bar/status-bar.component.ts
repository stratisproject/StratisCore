import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';

import { WalletInfo } from '../../shared/classes/wallet-info';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.css']
})
export class StatusBarComponent implements OnInit, OnDestroy {

  private generalWalletInfoSubscription: Subscription;
  private stakingInfoSubscription: Subscription;
  public lastBlockSyncedHeight: number;
  public chainTip: number;
  private isChainSynced: boolean;
  public connectedNodes = 0;
  private percentSyncedNumber = 0;
  public percentSynced: string;
  public stakingEnabled: boolean;

  constructor(private apiService: ApiService, private globalService: GlobalService, private genericModalService: ModalService) { }

  ngOnInit() {
    this.startSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private getGeneralWalletInfo() {
    const walletInfo = new WalletInfo(this.globalService.WalletName);
    this.generalWalletInfoSubscription = this.apiService.getGeneralInfo(walletInfo)
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
            const generalWalletInfoResponse = response.json();
            this.lastBlockSyncedHeight = generalWalletInfoResponse.lastBlockSyncedHeight;
            this.chainTip = generalWalletInfoResponse.chainTip;
            this.isChainSynced = generalWalletInfoResponse.isChainSynced;
            this.connectedNodes = generalWalletInfoResponse.connectedNodes;

            if (!this.isChainSynced) {
              this.percentSynced = 'syncing...';
            } else {
              this.percentSyncedNumber = ((this.lastBlockSyncedHeight / this.chainTip) * 100);
              if (this.percentSyncedNumber.toFixed(0) === '100' && this.lastBlockSyncedHeight !== this.chainTip) {
                this.percentSyncedNumber = 99;
              }

              this.percentSynced = this.percentSyncedNumber.toFixed(0) + '%';
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
            } else {
              if (error.json().errors[0].description) {
                this.genericModalService.openModal(null, error.json().errors[0].message);
              } else {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        }
      );
  }

  private getStakingInfo() {
    this.apiService.getStakingInfo()
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
            const stakingResponse = response.json();
            this.stakingEnabled = stakingResponse.enabled;
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

  private cancelSubscriptions() {
    if (this.generalWalletInfoSubscription) {
      this.generalWalletInfoSubscription.unsubscribe();
    }

    if (this.stakingInfoSubscription) {
      this.stakingInfoSubscription.unsubscribe();
    }
  }

  private startSubscriptions() {
    this.getGeneralWalletInfo();
    this.getStakingInfo();
  }
}
