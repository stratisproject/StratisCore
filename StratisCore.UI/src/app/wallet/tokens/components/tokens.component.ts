import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';
import { ClipboardService } from 'ngx-clipboard';
import { ReplaySubject, Subject, of } from 'rxjs';
import { takeUntil, take, catchError } from 'rxjs/operators';

import { Disposable } from '../models/disposable';
import { Mixin } from '../models/mixin';
import { Log } from '../services/logger.service';
import { TokensService } from '../services/tokens.service';
import { TokenBalanceRequest } from '../models/token-balance-request';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.css']
})
@Mixin([Disposable])
export class TokensComponent implements OnInit, OnDestroy, Disposable {
  addressChanged$: Subject<string>;
  disposed$ = new ReplaySubject<boolean>();
  addresses: string[];
  dispose: () => void;
  selectedAddress: string;
  history = [];
  walletName: string;
  addressChangedSubject: Subject<unknown>;

  constructor(private tokenService: TokensService,
    private clipboardService: ClipboardService,
    private genericModalService: ModalService,
    private globalService: GlobalService) {
      this.addressChangedSubject = new Subject();

      this.walletName = this.globalService.getWalletName();
  }

  ngOnInit() {

    this.tokenService
    .GetAddresses(this.walletName)
    .pipe(
      catchError(error => {
        this.showApiError("Error retrieving addressses. " + error);
        return of([]);
      }),
      takeUntil(this.disposed$))
    .subscribe(addresses => {
        if (addresses && addresses.length > 0) {
            this.addressChangedSubject.next(addresses[0]);
            this.addresses = addresses;
            this.selectedAddress = addresses[0];

            this.getBalances();
        }
    });

  }

  ngOnDestroy() {
    this.dispose();
  }

  showApiError(error: string) {
    this.genericModalService.openModal('Error', error);
  }

  addressChanged(address: string) {
    this.addressChanged$.next(address);
  }

  clipboardAddressClicked() {
    if (this.selectedAddress && this.clipboardService.copyFromContent(this.selectedAddress)) {
      console.log(`Copied ${this.selectedAddress} to clipboard`);
    }
  }

  addToken() {
    // this.showModal(Mode.Call);
  }

  issueToken() {
    // this.showModal(Mode.Create);
  }

  getBalances() {
    var allTokens = [...this.tokenService.GetAvailableTokens(), ...this.tokenService.GetSavedTokens()];
    
    var token = allTokens[0];

    var request = new TokenBalanceRequest(token.hash, this.selectedAddress);

    this.tokenService.GetTokenBalance(request)
      .pipe(take(1))
      .subscribe(
        balance => {
          let result = {
            tokenAddress: request.contractAddress,
            balance
          }

          console.log(result);

          return result;
        }
      );
  }

  send(item: any) {

  }

}
