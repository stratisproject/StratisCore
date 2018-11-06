import { Component, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';

import { AddressBookService } from './address-book-service';
import { GlobalService } from '../../shared/services/global.service';

export class Address {
    constructor(public name: string, public address: string) { }
}

@Component({
    selector: 'app-address-book',
    templateUrl: './address-book.component.html',
    styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit {

    constructor(private globalService: GlobalService, private addressBookService: AddressBookService, private clipboardService: ClipboardService) { }

    addresses: Address[];

    ngOnInit() {
        this.addressBookService.GetAddresses(0,0)
            .subscribe(x => this.addresses = x.map(a => new Address(a.name, a.address)));
    }

    copyToClipboardClicked(address: Address) {
        if (this.clipboardService.copyFromContent(address.address)) {
            console.log(address.name + ' ' + address.address);
        }
    }

    sendClicked(address: Address) {
        console.log(address.name);
    }
}
