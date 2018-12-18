import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { GlobalService } from '../../shared/services/global.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  constructor(private modalService: NgbModal, private globalService: GlobalService, private router: Router) {
      this.walletName = this.globalService.getWalletName();
  }

  public testnet: boolean;
  public sidechainEnabled: boolean;
  public walletName: string;

  ngOnInit() {
    this.testnet = this.globalService.getTestnetEnabled();
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
  }

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
