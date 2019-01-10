import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { SendComponent } from '../send/send.component';
import { AddNewAddressComponent } from '../address-book/modals/add-new-address/add-new-address.component';
import { AddressLabel } from '../../shared/models/address-label';

import { Subscription } from 'rxjs';

@Component({
    selector: 'app-address-book',
    templateUrl: './address-book.component.html',
    styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit, OnDestroy {
    constructor(private apiService: ApiService, private clipboardService: ClipboardService, private modalService: NgbModal, private genericModalService: ModalService) { }

    private addressBookSubcription: Subscription;
    addresses: AddressLabel[];

    ngOnInit() {
      this.startSubscriptions();
    }

    ngOnDestroy() {
      this.cancelSubscriptions();
    }

    private startSubscriptions() {
      this.getAddressBookAddresses();
    }

    private cancelSubscriptions() {
      if (this.addressBookSubcription) {
        this.addressBookSubcription.unsubscribe();
      }
    }

    private getAddressBookAddresses() {
      this.addressBookSubcription = this.apiService.getAddressBookAddresses()
        .subscribe(
          response => {
            this.addresses = null;
            if (response.addresses[0]) {
              this.addresses = [];
              let addressResponse = response.addresses;
              for (let address of addressResponse) {
                this.addresses.push(new AddressLabel(address.label, address.address));
              }
            }
          },
          error => {
            if (error.status === 0) {
              this.cancelSubscriptions();
            } else if (error.status >= 400) {
              if (!error.error.errors[0].message) {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        )
      ;
    }

    copyToClipboardClicked(address: AddressLabel) {
        if (this.clipboardService.copyFromContent(address.address)) {
        }
    }

    sendClicked(address: AddressLabel) {
      const modalRef = this.modalService.open(SendComponent, { backdrop: "static" });
      modalRef.componentInstance.address = address.address;
    }

    removeClicked(address: AddressLabel) {
      this.apiService.removeAddressBookAddress(address.label)
        .subscribe(
          response =>  {
            this.cancelSubscriptions();
            this.startSubscriptions();
          }
        );
    }

    addNewAddressClicked() {
        this.modalService.open(AddNewAddressComponent, { backdrop: "static" });
    }
}
