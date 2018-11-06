import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

import { ApiService } from '../../shared/services/api.service';

export class AddressBookItem {
    constructor(public name: string, public address: string) { }
}

export abstract class AddressBookServiceBase {
    GetAddresses(skip: number, take: number): Observable<AddressBookItem[]> {
        return Observable.of();
    }
};

@Injectable()
export class FakeAddressBookService implements AddressBookServiceBase {
    GetAddresses(skip: number, take: number): Observable<AddressBookItem[]> {
        return Observable.of([
            new AddressBookItem("Bertrand D", "SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn"),
            new AddressBookItem("Paul H", "SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn"),
            new AddressBookItem("Ferdeen M", "SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn")
        ]);
    }
};

@Injectable()
export class AddressBookService implements AddressBookServiceBase {
    constructor(private apiService: ApiService) {}
    GetAddresses(skip: number, take: number): Observable<AddressBookItem[]> {
        return this.apiService.getAddressBookAddresses(skip, take)
                              .map(x => x.addresses.map(a => new AddressBookItem(a.address, a.label)));
    }
};
