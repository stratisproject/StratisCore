import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
import { CurrentAccountService } from '@shared/services/current-account.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  accountsEnabled: boolean;
  constructor(private modalService: NgbModal, private globalService: GlobalService, private router: Router, private currentAccountService: CurrentAccountService) {
      this.walletName = this.globalService.getWalletName();
  }

  public testnet: boolean;
  public sidechainEnabled: boolean;
  public walletName: string;

  ngOnInit() {
    this.testnet = this.globalService.getTestnetEnabled();
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.accountsEnabled = this.sidechainEnabled && this.currentAccountService.hasActiveAddress();
  }

  openAddressBook() {
    this.router.navigate(['/wallet/address-book']);
  }

  openAdvanced() {
    this.router.navigate(['/wallet/advanced']);
  }

  switchAddress() {
    this.currentAccountService.clearAddress();
    this.router.navigate(['/address-selection']);
  }

  logoutClicked() {
      this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
  }
}
