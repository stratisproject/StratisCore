import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

import { ModalService } from '../../shared/services/modal.service';
import { GlobalService } from '../../shared/services/global.service';
import { SettingsComponent } from '../sidechains/settings/settings.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  constructor(private modalService: NgbModal, private globalService: GlobalService, private router: Router) {}
  public walletName: string;

  ngOnInit() {
    this.walletName = this.globalService.walletName;
  }

  get sidechainsAvailable() {
    return this.globalService.sidechainsEnabled;
  }

  public logOut() {
    const modalRef = this.modalService.open(LogoutConfirmationComponent, { backdrop: 'static' });
  }

  public openSettings() {
    const modalRef = this.modalService.open(SettingsComponent, { backdrop: 'static' });
  }

  public goToDashboard() {
    this.router.navigate(['/wallet/']);
  }
}
