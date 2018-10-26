import { Component, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { GlobalService } from '../../shared/services/global.service';
import { FeaturesService } from '../../shared/services/features.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

type Option = { 'displayName': string, 'routerLink': string, 'isEnabled': boolean, 'featureName': string }

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnDestroy {
    private featureSubscription: Subscription;

    constructor(private modalService: NgbModal, private globalService: GlobalService, private featuresService: FeaturesService, private router: Router) {

        this.options = [
            { 'displayName': 'Address Book', 'routerLink': '/wallet/address-book', 'isEnabled': true, 'featureName': '' },
            { 'displayName': 'Advanced', 'routerLink': '/wallet/advanced', 'isEnabled': true, 'featureName': '' },
            { 'displayName': 'Cold Staking', 'routerLink': '/wallet/staking', 'isEnabled': false, 'featureName': 'coldstakingfeature' },
            { 'displayName': 'Dashboard', 'routerLink': '/wallet', 'isEnabled': true, 'featureName': '' },
            { 'displayName': 'History', 'routerLink': '/wallet/history', 'isEnabled': true, 'featureName': '' }
        ];

        this.walletName = this.globalService.getWalletName();

        this.featureSubscription =
            this.featuresService.getEnabledFeatures().subscribe(features => this.processEnabledFeatures(features));
    }

    walletName: string;
    coldStakingEnabled = false;
    options: Option[];
    enabledOptions: Option[];

    logOut() {
        this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
    }

    optionClicked(option: Option) {
        if (option.routerLink) {
            this.router.navigate([option.routerLink]).then(x =>
                console.log(`Navigation to ${option.routerLink} succeeded: ${x}`));
        }
    }

    ngOnDestroy() {
        this.featureSubscription.unsubscribe();
    }

    private processEnabledFeatures(features: string[]) {
        features.forEach(feature => {
            const featureName = feature.toLowerCase();
            const option = this.options.filter(o => o.featureName).find(o => o.displayName === featureName);
            if (option) {
                option.isEnabled = true;
            }
        });

        this.enabledOptions = this.options.filter(x => x.isEnabled);
    }
}
