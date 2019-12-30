import { Component, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewAddressComponent } from './modals/add-new-address/add-new-address.component';
import { AddressLabel } from '@shared/models/address-label';
import { Observable } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { SnackbarService } from 'ngx-snackbar';
import { AddressBookService } from '@shared/services/address-book-service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { Router } from '@angular/router';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css'],
  animations : Animations.fadeIn
})
export class AddressBookComponent implements OnInit {
  constructor(
    private router: Router,
    private globalService: GlobalService,
    private snackbarService: SnackbarService,
    private addressBookService: AddressBookService,
    private clipboardService: ClipboardService,
    private modalService: NgbModal) {
  }

  public addresses: Observable<AddressLabel[]>;

  public ngOnInit(): void {
    this.getAddressBookAddresses();
  }

  private getAddressBookAddresses(): void {
    this.addresses = this.addressBookService.contacts;
  }

  public sendClicked(address: AddressLabel): void {
    this.router.navigateByUrl(`wallet/send/${address.address}`);
  }

  public removeClicked(address: AddressLabel): void {
    const modal = this.modalService.open(ConfirmationModalComponent, {
      backdrop: 'static',
    });

    const instance = modal.componentInstance as ConfirmationModalComponent;
    instance.title = 'Remove Contact';
    instance.body = `Are you sure you want to remove the contact ${address.label}`;

    modal.result.then(confirmed => {
      if (confirmed) {
        this.addressBookService.removeAddressBookAddress(address).then(() => {
            this.snackbarService.add({
              msg: `Contact ${address.label} was removed`,
              customClass: 'notify-snack-bar',
              action: {
                text: null
              }
            });
          }
        );
      }
    });
  }



  public addNewAddressClicked(): void {
    this.modalService.open(AddNewAddressComponent, {backdrop: 'static'});
  }
}
