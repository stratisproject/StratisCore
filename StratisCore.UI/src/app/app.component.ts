import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import { retryWhen, delay, tap } from 'rxjs/operators';

import { ApiService } from '@shared/services/api.service';
import { ElectronService } from 'ngx-electron';
import { GlobalService } from '@shared/services/global.service';

import { NodeStatus } from '@shared/models/node-status';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private apiService: ApiService, private globalService: GlobalService, private titleService: Title, private electronService: ElectronService) { }

  private subscription: Subscription;
  private readonly MaxRetryCount = 50;
  private readonly TryDelayMilliseconds = 3000;
  public sidechainEnabled;

  loading = true;
  loadingFailed = false;

  ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.setTitle();
    this.tryStart();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Attempts to initialise the wallet by contacting the daemon.  Will try to do this MaxRetryCount times.
  private tryStart() {
    let retry = 0;
    const stream$ = this.apiService.getNodeStatus(true).pipe(
      retryWhen(errors =>
        errors.pipe(delay(this.TryDelayMilliseconds)).pipe(
          tap(errorStatus => {
            if (retry++ === this.MaxRetryCount) {
              throw errorStatus;
            }
            console.log(`Retrying ${retry}...`);
          })
        )
      )
    );

    this.subscription = stream$.subscribe(
      (data: NodeStatus) => {
        this.loading = false;
        this.router.navigate(['login'])
      }, (error: any) => {
        console.log('Failed to start wallet');
        this.loading = false;
        this.loadingFailed = true;
      }
    )
  }

  private setTitle() {
    let applicationName = "Stratis Core";
    if (this.sidechainEnabled) {
      applicationName = "Cirrus Core";
    }
    let applicationVersion = this.globalService.getApplicationVersion();
    let newTitle = applicationName + " " + applicationVersion;
    this.titleService.setTitle(newTitle);
  }

  public openSupport() {
    this.electronService.shell.openExternal("https://github.com/stratisproject/StratisCore/");
  }
}
