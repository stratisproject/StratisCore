import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';

import { WalletInfo } from '../../shared/models/wallet-info';

@Component({
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
  public connectedNodes: number = 0;
  private percentSyncedNumber: number = 0;
  public percentSynced: string;
  public stakingEnabled: boolean;
  public sidechainsEnabled: boolean;
  toolTip = '';
  connectedNodesTooltip = '';

  constructor(private apiService: ApiService, private globalService: GlobalService, private genericModalService: ModalService) { }

  ngOnInit() {
    this.sidechainsEnabled = this.globalService.getSidechainEnabled();
    this.startSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private getGeneralWalletInfo() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName())
    this.generalWalletInfoSubscription = this.apiService.getGeneralInfo(walletInfo)
      .subscribe(
        response =>  {
          let generalWalletInfoResponse = response;
          this.lastBlockSyncedHeight = generalWalletInfoResponse.lastBlockSyncedHeight;
          this.chainTip = generalWalletInfoResponse.chainTip;
          this.isChainSynced = generalWalletInfoResponse.isChainSynced;
          this.connectedNodes = generalWalletInfoResponse.connectedNodes;

          const processedText = `Processed ${this.lastBlockSyncedHeight} out of ${this.chainTip} blocks.`;
          this.toolTip = `Synchronizing.  ${processedText}`;

          if (this.connectedNodes == 1) {
              this.connectedNodesTooltip = "1 connection";
          } else if (this.connectedNodes >= 0) {
              this.connectedNodesTooltip = `${this.connectedNodes} connections`;
          }

          if(!this.isChainSynced) {
            this.percentSynced = "syncing...";
          }
          else {
            this.percentSyncedNumber = ((this.lastBlockSyncedHeight / this.chainTip) * 100);
            if (this.percentSyncedNumber.toFixed(0) === "100" && this.lastBlockSyncedHeight != this.chainTip) {
              this.percentSyncedNumber = 99;
            }

            this.percentSynced = this.percentSyncedNumber.toFixed(0) + '%';

            if (this.percentSynced === '100%') {
              this.toolTip = `Up to date.  ${processedText}`;
            }
          }
        },
        error => {
          if (error.status === 0) {
            this.cancelSubscriptions();
          } else if (error.status >= 400) {
            if (!error.error.errors[0].message) {
              this.cancelSubscriptions();
              this.startSubscriptions();
            }
          }
        }
      )
    ;
  };

  private getStakingInfo() {
    this.stakingInfoSubscription = this.apiService.getStakingInfo()
      .subscribe(
        response =>  {
          let stakingResponse = response
          this.stakingEnabled = stakingResponse.enabled;
        }, error => {
          if (error.status === 0) {
            this.cancelSubscriptions();
          } else if (error.status >= 400) {
            if (!error.error.errors[0].message) {
              this.cancelSubscriptions();
              this.startSubscriptions();
            }
          }
        }
      )
    ;
  }

  private cancelSubscriptions() {
    if(this.generalWalletInfoSubscription) {
      this.generalWalletInfoSubscription.unsubscribe();
    }

    if (this.stakingInfoSubscription) {
      this.stakingInfoSubscription.unsubscribe();
    }
  };

  private startSubscriptions() {
    this.getGeneralWalletInfo();
    if (!this.sidechainsEnabled) {
      this.getStakingInfo();
    }
  }
}
