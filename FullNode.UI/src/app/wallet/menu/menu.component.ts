import { Component } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';

import { ModalService } from '../../shared/services/modal.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  constructor(private modalService: NgbModal) {}

  public logOut() {
    const modalRef = this.modalService.open(LogoutConfirmationComponent);
  }
}
