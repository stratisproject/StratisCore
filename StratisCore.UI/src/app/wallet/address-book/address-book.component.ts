import { Component, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api.service';
import { SendComponent } from '../send/send.component';
import { AddNewAddressComponent } from './modals/add-new-address/add-new-address.component';
import { AddressLabel } from '@shared/models/address-label';
import { BehaviorSubject } from 'rxjs';
import { GlobalService } from "@shared/services/global.service";
import { SnackbarService } from "ngx-snackbar";

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit {
  constructor(
    private globalService: GlobalService,
    private snackbarService: SnackbarService,
    private apiService: ApiService,
    private clipboardService: ClipboardService,
    private modalService: NgbModal) {
  }

  public addresses: BehaviorSubject<AddressLabel[]> = new BehaviorSubject<AddressLabel[]>(null);

  public ngOnInit(): void {
    this.getAddressBookAddresses();
  }

  private getAddressBookAddresses(): void {
    this.apiService.getAddressBookAddresses()
      .toPromise()
      .then(
        response => {
          if (response.addresses[0]) {
            this.addresses.next(response.addresses.map(address => new AddressLabel(address.label, address.address, "")));
          }
        });
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
    this.apiService.removeAddressBookAddress(address.label)
      .toPromise()
      .then(() => {
        const index = this.addresses.value.findIndex(i => i.address === address.address);
        if (index > -1) {
          this.addresses.next(Array.from(this.addresses.value.splice(index, 1)));
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
