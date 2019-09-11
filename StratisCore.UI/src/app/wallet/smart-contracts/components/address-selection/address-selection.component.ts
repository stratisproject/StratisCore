import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { SmartContractsServiceBase } from '../../smart-contracts.service';
import { ClipboardService } from 'ngx-clipboard';
import { catchError, takeUntil, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CurrentAccountService } from '@shared/services/current-account.service';
import { Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { WalletInfo } from '@shared/models/wallet-info';
import { WalletService } from "@shared/services/wallet.service";

@Component({
  selector: 'app-address-selection',
  templateUrl: './address-selection.component.html',
  styleUrls: ['./address-selection.component.css']
})
export class AddressSelectionComponent implements OnInit {

  private walletName = '';
  addresses: any[];
  addressChangedSubject: Subject<string>;
  selectedAddress: any;
  coinUnit: string;
  unsubscribe: Subject<void> = new Subject();

  constructor(private globalService: GlobalService,
              private walletService: WalletService,
              private currentAccountService: CurrentAccountService,
              private router: Router,
              private clipboardService: ClipboardService) {

    this.coinUnit = this.globalService.getCoinUnit();
    this.walletName = this.globalService.getWalletName();
    this.addressChangedSubject = new Subject();

    this.walletService
      .getAllAddressesForWallet(new WalletInfo(this.walletName))
      .pipe(
        catchError(error => {
          console.log('Error retrieving addressses. ' + error);
          return of([]);
        }),
        takeUntil(this.unsubscribe))
      .subscribe(addresses => {
        if (addresses && addresses.hasOwnProperty("addresses")) {
          if (addresses.addresses.length > 0) {
            this.addressChangedSubject.next(addresses.addresses[0].address);
            this.addresses = addresses.addresses.filter(a => a.isChange === false || (a.amountConfirmed > 0 || a.amountUnconfirmed > 0));
            this.selectedAddress = this.addresses[0].address;
          }
        }
      });
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

  clipboardAddressClicked() {
    if (this.selectedAddress && this.clipboardService.copyFromContent(this.selectedAddress)) {
      console.log(`Copied ${this.selectedAddress} to clipboard`);
    }
  }
}
