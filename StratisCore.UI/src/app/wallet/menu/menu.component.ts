import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { GlobalService } from '../../shared/services/global.service';
import { FeaturesService } from '../../shared/services/features.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

type Option = { 'displayName': string, 'routerLink': string, 'isEnabled': boolean, 'featureName': string, 'icon': string }

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit, OnDestroy {
    private featureSubscription: Subscription;

    constructor(private modalService: NgbModal, private globalService: GlobalService, private featuresService: FeaturesService, private router: Router) {

        this.tabOptions = [
            { 'displayName': 'Dashboard', 'routerLink': '/wallet', 'isEnabled': true, 'featureName': '', icon: '' },
            { 'displayName': 'Cold Staking', 'routerLink': '/wallet/staking', 'isEnabled': this.coldStakingEnabled, 'featureName': 'coldstakingfeature', icon: '' },
            { 'displayName': 'History', 'routerLink': '/wallet/history', 'isEnabled': true, 'featureName': '', icon: '' },
            //{ 'displayName': 'Smart Contracts', 'routerLink': '/wallet/smart-contracts', 'isEnabled': true, 'featureName': '', icon: '' }
        ];

        this.dropdownOptions = [
            { 'displayName': 'Advanced', 'routerLink': '/wallet/advanced', 'isEnabled': true, 'featureName': '', icon: 'lnr-cog'},
            { 'displayName': 'Address Book', 'routerLink': '/wallet/address-book', 'isEnabled': true, 'featureName': '', icon: 'lnr-book' }
        ];

        this.walletName = this.globalService.getWalletName();

        this.featureSubscription =
            this.featuresService.getEnabledFeatures().subscribe(features => this.processEnabledFeatures(features));
    }

    walletName: string;
    coldStakingEnabled = false;
    tabOptions: Option[];
    dropdownOptions: Option[];

    logoutClicked() {
        this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
    }

    optionClicked(option: Option) {
        if (option.routerLink) {
            this.router.navigate([option.routerLink]);
        }
    }

    ngOnInit() {
      if (this.globalService.getNetwork() === "StratisMain") {
        this.coldStakingEnabled = false;
      } else {
        this.coldStakingEnabled = true;
      }
    }

    ngOnDestroy() {
        this.featureSubscription.unsubscribe();
    }

    private processEnabledFeatures(features: string[]) {
        // features.forEach(feature => {
        //     const featureName = feature.toLowerCase();
        //     const option = this.tabOptions.filter(o => o.featureName).find(o => o.displayName === featureName);
        //     if (option) {
        //         option.isEnabled = true;
        //     }
        // });
    }
}
