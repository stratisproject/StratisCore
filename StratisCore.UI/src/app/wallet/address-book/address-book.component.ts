import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SendComponent } from '../send/send.component';
import { AddNewAddressComponent } from './modals/add-new-address/add-new-address.component';
import { AddressLabel } from '@shared/models/address-label';
import { Observable, Subscription } from 'rxjs';
import { GlobalService } from "@shared/services/global.service";
import { SnackbarService } from "ngx-snackbar";
import { AddressBookService } from "@shared/services/address-book-service";

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
        msg: "Address Copied to Clipboard",
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
    this.addressBookService.removeAddressBookAddress(address);

  }

  public getQrCodeAddress(address: string): string {
    return `${this.globalService.networkName}:${address}`
  }

  public addNewAddressClicked(): void {
    this.modalService.open(AddNewAddressComponent, {backdrop: 'static'});
  }
}
