import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { GlobalService } from '../../shared/services/global.service';
import { FeaturesService } from '../../shared/services/features.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  constructor(private modalService: NgbModal, private globalService: GlobalService, private featuresService: FeaturesService, private router: Router) {
      this.walletName = this.globalService.getWalletName();
  }

  public walletName: string;

  openAddressBook() {
    this.router.navigate(['/wallet/address-book']);
  }

  openAdvanced() {
    this.router.navigate(['/wallet/advanced']);
  }

  logoutClicked() {
      this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
  }
}
