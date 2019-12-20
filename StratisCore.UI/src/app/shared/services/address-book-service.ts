import { Injectable } from '@angular/core';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AddressLabel } from '@shared/models/address-label';

@Injectable({
  providedIn: 'root'
})
export class AddressBookService extends RestApi {
  private contactsSubject = new BehaviorSubject<AddressLabel[]>([]);
  public loading = new BehaviorSubject<boolean>(false);

  constructor(globalService: GlobalService,
              httpClient: HttpClient,
              errorService: ErrorService) {
    super(globalService, httpClient, errorService);
    this.getContacts();
  }

  public findContactByAddress(address: string): AddressLabel {
    return this.contactsSubject.value.find(addressLabel => addressLabel.address === address);
  }

  public get contacts(): Observable<AddressLabel[]> {
    return this.contactsSubject.asObservable();
  }

  public get currentContacts(): AddressLabel[] {
    return this.contactsSubject.value;
  }

  private getContacts(): void {
    this.loading.next(true);
    this.get<any>('addressBook').toPromise().then(result => {
      this.contactsSubject.next(result.addresses);
      this.loading.next(false);
    });
  }

  public addAddressBookAddress(item: AddressLabel): Promise<any> {
    return this.post('addressBook/address', item).pipe(
      catchError(err => this.handleHttpError(err))
    ).toPromise().then(() => {
      this.contactsSubject.next(Array.from(this.contactsSubject.value).concat([item]));
    });
  }

  public removeAddressBookAddress(item: AddressLabel): Promise<any> {
    const params = new HttpParams().set('label', item.label);
    return this.delete('addressBook/address', params).pipe(
      catchError(err => this.handleHttpError(err))
    ).toPromise().then(() => {
      const index = this.contactsSubject.value.findIndex(i => i.label === item.label);
      if (index > -1) {
        const value = Array.from(this.contactsSubject.value);
        value.splice(index, 1);
        this.contactsSubject.next(value);
      }
    });
  }
}
