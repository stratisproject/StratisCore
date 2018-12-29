import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { ApiService } from '../../../../shared/services/api.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {

  constructor(private electronService: ElectronService, private apiService: ApiService, private genericModalService: ModalService) { }

  private nodeStatusSubscription: Subscription;
  public clientName: string;
  public applicationVersion: string;
  public fullNodeVersion: string;
  public network: string;
  public protocolVersion: number;
  public blockHeight: number;
  public dataDirectory: string;

  ngOnInit() {
    this.applicationVersion = this.electronService.remote.app.getVersion();
    this.startSubscriptions();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private startSubscriptions() {
    this.nodeStatusSubscription = this.apiService.getNodeStatusInterval()
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
            let statusResponse = response.json()
            this.clientName = statusResponse.agent;
            this.fullNodeVersion = statusResponse.version;
            this.network = statusResponse.network;
            this.protocolVersion = statusResponse.protocolVersion;
            this.blockHeight = statusResponse.blockStoreHeight;
            this.dataDirectory = statusResponse.dataDirectoryPath;
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

  private cancelSubscriptions() {
    if(this.nodeStatusSubscription) {
      this.nodeStatusSubscription.unsubscribe();
    }
  }
}
