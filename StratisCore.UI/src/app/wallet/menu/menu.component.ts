import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { GlobalService } from '../../shared/services/global.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
import { ThemeService } from '../../shared/services/theme.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  public testnet: boolean;
  public sidechainEnabled: boolean;
  public walletName: string;
  public theme$: Observable<string>;

  constructor(
    private modalService: NgbModal,
    private globalService: GlobalService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.walletName = this.globalService.getWalletName();
    this.theme$ = this.themeService.theme;
  }

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

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
