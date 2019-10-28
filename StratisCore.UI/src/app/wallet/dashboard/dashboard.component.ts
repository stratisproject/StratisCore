import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { WalletBalance } from '@shared/services/interfaces/api.i';
import { StakingService } from '@shared/services/staking-service';
import { WalletService } from '@shared/services/wallet.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReceiveComponent } from '../receive/receive.component';
import { SendComponent } from '../send/send.component';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  public wallet: Observable<WalletBalance>;
  public transactionCount: Observable<number>;

  constructor(
    public walletService: WalletService,
    private apiService: ApiService,
    public globalService: GlobalService,
    private stakingService: StakingService,
    private modalService: NgbModal) {
  }

  public ngOnInit() {
    this.wallet = this.walletService.wallet();
    this.transactionCount = this.walletService.walletHistory().pipe(map(items => items ? items.length : 0));
  }

  public openSendDialog() {
    this.modalService.open(SendComponent, {backdrop: 'static', keyboard: false});
  }

  public openReceiveDialog() {
    this.modalService.open(ReceiveComponent, {backdrop: 'static', keyboard: false});
  }

  get showStaking() {
    return !this.globalService.getSidechainEnabled() &&
           ((!this.walletService.ibdMode && !this.walletService.isSyncing) || this.stakingService.stakingEnabled);
  }
}
