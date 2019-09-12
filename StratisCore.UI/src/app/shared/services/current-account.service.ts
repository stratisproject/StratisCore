import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

/*
 * Used to maintain the state of the currently selected address in CirrusCore.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentAccountService {

  private _currentAddress: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor() {
  }

  public get currentAddress(): Observable<string> {
    return this._currentAddress.asObservable();
  }

  public getAddress(): string {
    return this._currentAddress.value;
  }

  public setAddress(value: string): void {
    this._currentAddress.next(value);
  }

  public hasActiveAddress(): boolean {
    return !!this._currentAddress.value
  }

  public clearAddress(): void {
    this._currentAddress.next(null);
  }
}
