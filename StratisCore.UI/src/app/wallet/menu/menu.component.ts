import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
import { CurrentAccountService } from '@shared/services/current-account.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  accountsEnabled: boolean;
  constructor(private modalService: NgbModal, private globalService: GlobalService, private router: Router, private currentAccountService: CurrentAccountService) {
      this.walletName = this.globalService.getWalletName();
  }

  public testnet: boolean;
  public sidechainEnabled: boolean;
  public walletName: string;

  ngOnInit(): void {
    this.testnet = this.globalService.getTestnetEnabled();
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.accountsEnabled = this.sidechainEnabled && this.currentAccountService.hasActiveAddress();
  }

  openAddressBook(): void {
    this.router.navigate(['/wallet/address-book']);
  }

  openAdvanced(): void {
    this.router.navigate(['/wallet/advanced']);
  }

  switchAddress(): void {
    this.currentAccountService.clearAddress();
    this.router.navigate(['/address-selection']);
  }

  logoutClicked(): void {
      this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
  }
}
