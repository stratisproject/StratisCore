import { Injectable } from '@angular/core';

/*
 * Used to maintain the state of the currently selected address in CirrusCore.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentAccountService {

  address: string;

  constructor() { }

  getAddress() {
    return this.address;
  }

  setAddress(value: string) {
    this.address = value;
  }

  hasActiveAddress() {
    return !!this.address;
  }

}
