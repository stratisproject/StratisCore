import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppConfig } from './app.config';

import { ApiService } from './shared/services/api.service';
import { GlobalService } from './shared/services/global.service';
import { ElectronService } from 'ngx-electron';

import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  constructor(private router: Router, private apiService: ApiService, private globalService: GlobalService, private titleService: Title, private electronService: ElectronService) {}
  private errorMessage: any;
  private responseMessage: any;
  public loading: boolean = true;

  ngOnInit() {
    this.setTitle();
    this.apiService.getWalletFiles().delay(5000).retryWhen(errors => errors.delay(2000)).subscribe(() => this.startApp());
  }

  private startApp() {
    this.loading = false;
    this.router.navigate(['/login']);
  }

  private setTitle() {
    let applicationName = "Stratis Core";
    let applicationVersion = this.electronService.remote.app.getVersion();
    let releaseCycle = "beta";
    let newTitle = applicationName + " v" + applicationVersion + " " + releaseCycle;
    this.titleService.setTitle(newTitle);
  }
}
