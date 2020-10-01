import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import { retryWhen, delay, tap } from 'rxjs/operators';

import { ApiService } from '@shared/services/api.service';
import { ElectronService } from 'ngx-electron';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private apiService: ApiService, private globalService: GlobalService, private titleService: Title, private electronService: ElectronService) {
  }

  private subscription: Subscription;
  private statusIntervalSubscription: Subscription;
  private readonly MaxRetryCount = 50;
  private readonly TryDelayMilliseconds = 3000;
  public sidechainEnabled;
  public apiConnected = false;
  private walletFeatureNamespace = null;
  loading = true;
  loadingFailed = false;

  ngOnInit(): void {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.walletFeatureNamespace = this.sidechainEnabled
      ? 'Stratis.Bitcoin.Features.SmartContracts.Wallet.SmartContractWalletFeature'
      : 'Stratis.Bitcoin.Features.Wallet.WalletFeature';

    this.setTitle();
    this.tryStart();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.statusIntervalSubscription.unsubscribe();
  }

  // Attempts to initialise the wallet by contacting the daemon.  Will try to do this MaxRetryCount times.
  private tryStart(): void {
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
      () => {
        this.apiConnected = true;
        this.statusIntervalSubscription = this.apiService.getNodeStatusInterval(true)
          .subscribe(
            response => {
              const statusResponse = response.featuresData.filter(x => x.namespace === 'Stratis.Bitcoin.Base.BaseFeature');
              const walletFeatureResponse = response.featuresData.find(x => x.namespace === this.walletFeatureNamespace);
              if (statusResponse.length > 0 && statusResponse[0].state === 'Initialized'
                && walletFeatureResponse && walletFeatureResponse.state === 'Initialized') {
                this.loading = false;
                this.statusIntervalSubscription.unsubscribe();
                this.router.navigate(['login']);
              }
            }
          );
      }, () => {
        console.log('Failed to start wallet');
        this.loading = false;
        this.loadingFailed = true;
      }
    );
  }

  private setTitle(): void {
    const applicationName = this.sidechainEnabled ? 'Cirrus Core' : 'Stratis Core';
    const testnetSuffix = this.globalService.getTestnetEnabled() ? ' (testnet)' : '';
    const title = `${applicationName} ${this.globalService.getApplicationVersion()}${testnetSuffix}`;
    this.titleService.setTitle(title);
  }

  public openSupport(): void {
    this.electronService.shell.openExternal('https://github.com/stratisproject/StratisCore/');
  }
}
