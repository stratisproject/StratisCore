import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';

import { ApiService } from './shared/services/api.service';
import { GlobalService } from './shared/services/global.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private apiService: ApiService, private globalService: GlobalService, private titleService: Title, private electronService: ElectronService) { }

    private subscription: Subscription;
    private readonly MaxRetryCount = 20;
    private readonly TryDelayMilliseconds = 3000;

    loading = true;
    loadingFailed = false;

    ngOnInit() {
        this.setTitle();
        this.tryStart();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    //Attempts to initialise the wallet by contacting the daemon.  Will try to do this MaxRetryCount times.
    private tryStart() {
        let retry = 0;
        const stream$ = this.apiService.getWalletFiles().
            retryWhen(errors =>
                errors.delay(this.TryDelayMilliseconds)
                    .do(errorStatus => {
                        if (retry++ === this.MaxRetryCount) {
                            throw errorStatus;
                        }
                        console.log(`Retrying ${retry}...`);
                    })
            );

        this.subscription = stream$.subscribe(_ =>
            this.router.navigate(['/login']),
            _ => {
                console.log('Failed to start wallet');
                this.loading = false;
                this.loadingFailed = true;
            },
            () => this.loading = false);
    }

    private setTitle() {
        let applicationName = "Stratis Core";
        let applicationVersion = this.electronService.remote.app.getVersion();
        let releaseCycle = "beta";
        let newTitle = applicationName + " v" + applicationVersion + " " + releaseCycle;
        this.titleService.setTitle(newTitle);
    }
}