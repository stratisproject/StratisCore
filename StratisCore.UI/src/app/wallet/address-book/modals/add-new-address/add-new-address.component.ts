import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AddressBookService } from '../../address-book-service';

@Component({
    selector: 'app-add-new-address',
    templateUrl: './add-new-address.component.html',
    styleUrls: ['./add-new-address.component.css']
})
export class AddNewAddressComponent {
    constructor(private activeModel: NgbActiveModal, private addressBookService: AddressBookService) { }

    label = '';
    address = '';

    get isValid(): boolean { 
        return this.label && this.address && (this.label.length>=2 && this.label.length<=40) ? true : false 
    }

    createClicked() {
        //this.addressBookService.AddAddress(this.label, this.address);
    }

    closeClicked() {
        this.activeModel.close();
    }
}
