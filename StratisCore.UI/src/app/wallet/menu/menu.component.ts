import { Component, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { GlobalService } from '../../shared/services/global.service';
import { FeaturesService } from '../../shared/services/features.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnDestroy {
    private featureSubscription: Subscription;

    constructor(private modalService: NgbModal, private globalService: GlobalService, private featuresService: FeaturesService) {
        this.walletName = this.globalService.getWalletName();

        this.featureSubscription =
            this.featuresService.getEnabledFeatures().subscribe(x => {
                const feature = 'coldstakingfeature';
                this.coldStakingEnabled = x.map(f => f.toLowerCase().trim()).includes(feature);
                console.log(`Feature '${feature}' is enabled: ${this.coldStakingEnabled}`);
            });
    }

    walletName: string;
    coldStakingEnabled = false;

    logOut() {
        this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
    }

    ngOnDestroy() {
        this.featureSubscription.unsubscribe();
    }
}
