import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { SendComponent } from '../send/send.component';
import { ReceiveComponent } from '../receive/receive.component';
import { Observable } from "rxjs";
import { NodeService } from "@shared/services/node.service";
import { WalletBalance } from "@shared/services/interfaces/api.i";

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  public wallet : Observable<WalletBalance>;

  constructor(
    private nodeService: NodeService,
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
