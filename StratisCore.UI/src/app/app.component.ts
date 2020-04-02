import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { BehaviorSubject, Subscription } from 'rxjs';
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
  constructor(
    private zone: NgZone,
    private router: Router, private apiService: ApiService, private globalService: GlobalService, private titleService: Title, private electronService: ElectronService) {
  }

  public statusSubject = new BehaviorSubject<string>('');
  private subscription: Subscription;
  private startupSubscription: Subscription;
  private statusIntervalSubscription: Subscription;
  private readonly MaxRetryCount = 50;
  private readonly TryDelayMilliseconds = 3000;
  public sidechainEnabled;
  public apiConnected = false;
  public downloadingImage = false;
  public loadingError: string;
  loading = true;
  loadingFailed = false;

  ngOnInit() {
    this.startupSubscription = this.globalService.startupStatus.subscribe((e) => {
      if (e[0] === 'DockerInfo') {
        this.downloadingImage = true;
        this.zone.run(() => {
          this.statusSubject.next(e[1]);
        });
      }
      if (e[0] === 'DockerError') {
        this.downloadingImage = true;
        this.zone.run(() => {
          this.loadingError = `Unable to start docker. Please make sure docker is installed on your system.\n${e[1]}`;
          this.loading = false;
          this.loadingFailed = true;
        });
      }
    });
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.setTitle();
    this.tryStart();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.statusIntervalSubscription.unsubscribe();
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
        this.apiConnected = true;
        this.statusIntervalSubscription = this.apiService.getNodeStatusInterval(true)
          .subscribe(
            response => {
              const statusResponse = response.featuresData.filter(x => x.namespace === 'Stratis.Bitcoin.Base.BaseFeature');
              if (statusResponse.length > 0 && statusResponse[0].state === 'Initialized') {
                this.loading = false;
                this.statusIntervalSubscription.unsubscribe();
                this.router.navigate(['login']);
              }
            }
          );
      }, (error: any) => {
        console.log('Failed to start wallet');
        this.loading = false;
        this.loadingFailed = true;
      }
    );
  }

  private setTitle() {
    const applicationName = GlobalService.applicationName;
    const testnetSuffix = this.globalService.getTestnetEnabled() ? ' (testnet)' : '';
    const title = `${applicationName} ${this.globalService.getApplicationVersion()}${testnetSuffix}`;

    this.titleService.setTitle(title);
  }

  public openSupport() {
    this.electronService.shell.openExternal('https://github.com/stratisproject/StratisCore/');
  }
}
