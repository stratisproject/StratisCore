import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

export class AddressBookItem {
    constructor(public name: string, public address: string) { }
}

@Injectable()
export class AddressBookService {

    GetAddresses(walletName: string): Observable<AddressBookItem[]> {
        return Observable.of([
            new AddressBookItem("Bertrand D", "SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn"),
            new AddressBookItem("Paul H", "SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn"),
            new AddressBookItem("Ferdeen M", "SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn")
        ]);
    }

};
