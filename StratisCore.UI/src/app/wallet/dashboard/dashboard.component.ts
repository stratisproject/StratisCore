import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { SendComponent } from '../send/send.component';
import { ReceiveComponent } from '../receive/receive.component';
import { StratisNodeService } from "@shared/services/real-time/stratis-node.service";
import { Observable } from "rxjs";
import { WalletBalance } from "@shared/services/api-dtos";

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  public wallet : Observable<WalletBalance>;

  constructor(
    private nodeService: StratisNodeService,
    private apiService: ApiService,
    private globalService: GlobalService,
    private modalService: NgbModal) {
  }

  public ngOnInit() {
    this.wallet = this.nodeService.wallet(this.globalService.currentWallet);
  };

  public openSendDialog() {
    this.modalService.open(SendComponent, {backdrop: "static", keyboard: false});
  }

  public openReceiveDialog() {
    this.modalService.open(ReceiveComponent, {backdrop: "static", keyboard: false});
  };
}
