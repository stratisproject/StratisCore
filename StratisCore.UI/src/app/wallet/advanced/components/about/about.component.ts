import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@shared/services/api.service';
import { NodeStatus } from '@shared/models/node-status';
import { GlobalService } from '@shared/services/global.service';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  nodeStatusSubscription$: Observable<NodeStatus>;
  applicationVersion: string;
  isElectron: boolean;

  constructor(
    private globalService: GlobalService,
    private apiService: ApiService,
    private electron: ElectronService
  ) { }

  ngOnInit() {
    this.isElectron = this.electron.isElectronApp;
    this.applicationVersion = this.globalService.getApplicationVersion();
    this.nodeStatusSubscription$ = this.apiService.getNodeStatusInterval();
  }

  openWalletDirectory(directory: string): void {
    if (!this.isElectron) return;

    this.electron.shell.showItemInFolder(directory);
  }
}
