import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { SmartContractsServiceBase } from '../../smart-contracts.service';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { catchError, takeUntil, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CurrentAccountService } from '@shared/services/current-account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address-selection',
  templateUrl: './address-selection.component.html',
  styleUrls: ['./address-selection.component.css']
})
export class AddressSelectionComponent implements OnInit {

  private walletName = '';
  addresses: string[];
  addressChangedSubject: Subject<string>;
  balance: number;
  selectedAddress: string;
  coinUnit: string;
  unsubscribe: Subject<void> = new Subject();

  constructor(private globalService: GlobalService,
    private smartContractsService: SmartContractsServiceBase,
    private currentAccountService: CurrentAccountService,
    private router: Router) { 
      
      this.coinUnit = this.globalService.getCoinUnit();
      this.walletName = this.globalService.getWalletName();
      this.addressChangedSubject = new Subject();

    this.smartContractsService
      .GetAddresses(this.walletName)
      .pipe(
        catchError(error => {
          console.log('Error retrieving addressses. ' + error);
          return of([]);
        }),
        takeUntil(this.unsubscribe))
      .subscribe(addresses => {
          if (addresses && addresses.length > 0) {
              this.addressChangedSubject.next(addresses[0]);
              this.addresses = addresses;
              this.selectedAddress = addresses[0];
          }
      });

      this.addressChangedSubject
      .pipe(
        switchMap(x => this.smartContractsService.GetAddressBalance(x)
          .pipe(
            catchError(error => {
                console.log('Error retrieving balance. ' + error);
                return of(0);
            })
          )
        ),
        takeUntil(this.unsubscribe)
      )
      .subscribe(balance => this.balance = balance);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getAddress() {
    return this.currentAccountService.getAddress();
  }

  addressChanged(address: string) {
    this.addressChangedSubject.next(address);
  }

  next() {
    if (this.selectedAddress) {
      this.currentAccountService.setAddress(this.selectedAddress);
      this.router.navigate(['wallet/dashboard']);
    }
  }

}
