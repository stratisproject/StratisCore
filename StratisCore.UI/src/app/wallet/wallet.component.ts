import { Component } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LogoutConfirmationComponent } from "./logout-confirmation/logout-confirmation.component";

@Component({
  selector: 'wallet-component',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
})
export class WalletComponent {
  constructor(private modalService: NgbModal) {
  }

  public logout(): void {
    const modal = this.modalService.open(LogoutConfirmationComponent, {
      backdrop: 'static',
    });
  }
}
