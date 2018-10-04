import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

import { ModalService } from '../../shared/services/modal.service';
import { GlobalService } from '../../shared/services/global.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  constructor(private modalService: NgbModal, private globalService: GlobalService, private router: Router) {}
  walletName: string;

  ngOnInit() {
    this.walletName = this.globalService.getWalletName();
  }

  logOut() {
    const modalRef = this.modalService.open(LogoutConfirmationComponent, { backdrop: "static" });
  }

  goToDashboard() {
    this.router.navigate(['/wallet/']);
  }

  goToStaking() {
      this.router.navigate(['/wallet/staking/']);
  }
}
