import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../../shared/services/api.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { NodeStatus } from '../../../../shared/models/node-status';
import { GlobalService } from '../../../../shared/services/global.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {

  constructor(private globalService: GlobalService, private apiService: ApiService, private genericModalService: ModalService) { }

  private nodeStatusSubscription: Subscription;
  public clientName: string;
  public applicationVersion: string;
  public fullNodeVersion: string;
  public network: string;
  public protocolVersion: number;
  public blockHeight: number;
  public dataDirectory: string;

  ngOnInit() {
    this.applicationVersion = this.globalService.getApplicationVersion();
    this.startSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private startSubscriptions() {
    this.nodeStatusSubscription = this.apiService.getNodeStatusInterval()
      .subscribe(
        (data: NodeStatus) =>  {
          let statusResponse = data
          this.clientName = statusResponse.agent;
          this.fullNodeVersion = statusResponse.version;
          this.network = statusResponse.network;
          this.protocolVersion = statusResponse.protocolVersion;
          this.blockHeight = statusResponse.blockStoreHeight;
          this.dataDirectory = statusResponse.dataDirectoryPath;
        }
      );
  }

  private cancelSubscriptions() {
    if(this.nodeStatusSubscription) {
      this.nodeStatusSubscription.unsubscribe();
    }
  }
}
