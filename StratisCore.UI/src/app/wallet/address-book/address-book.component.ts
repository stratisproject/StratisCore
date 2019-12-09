import { Component, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SendComponent } from '../send/send.component';
import { AddNewAddressComponent } from './modals/add-new-address/add-new-address.component';
import { AddressLabel } from '@shared/models/address-label';
import { Observable } from 'rxjs';
import { GlobalService } from "@shared/services/global.service";
import { SnackbarService } from "ngx-snackbar";
import { AddressBookService } from "@shared/services/address-book-service";
import { ConfirmationModalComponent } from "@shared/components/confirmation-modal/confirmation-modal.component";

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit {
  constructor(
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

  public copyToClipboardClicked(address: AddressLabel): void {
    if (this.clipboardService.copyFromContent(address.address)) {
      this.snackbarService.add({
        msg: `Address ${address.address} copied to clipboard`,
        customClass: 'notify-snack-bar',
        action: {
          text: null
        }
      });
    }
  }

  public sendClicked(address: AddressLabel): void {
    const modalRef = this.modalService.open(SendComponent, {backdrop: 'static'});
    modalRef.componentInstance.address = address.address;
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
            })
          }
        );
      }
    });
  }

  public getQrCodeAddress(address: string): string {
    return `${this.globalService.networkName}:${address}`
  }

  public addNewAddressClicked(): void {
    this.modalService.open(AddNewAddressComponent, {backdrop: 'static'});
  }
}
