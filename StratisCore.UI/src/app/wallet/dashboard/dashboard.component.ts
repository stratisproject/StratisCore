import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { SendComponent } from '../send/send.component';
import { ReceiveComponent } from '../receive/receive.component';
import { Observable } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { WalletBalance } from '@shared/services/interfaces/api.i';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  public wallet: Observable<WalletBalance>;
  public transactionCount: Observable<number>;

  constructor(
    private walletService: WalletService,
    private apiService: ApiService,
    public globalService: GlobalService,
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
}
