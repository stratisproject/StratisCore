import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';
import { ClipboardService } from 'ngx-clipboard';
import { ReplaySubject, Subject, of, forkJoin, Observable, combineLatest } from 'rxjs';
import { takeUntil, take, catchError, map, withLatestFrom, switchMap } from 'rxjs/operators';

import { Disposable } from '../models/disposable';
import { Mixin } from '../models/mixin';
import { Log } from '../services/logger.service';
import { TokensService } from '../services/tokens.service';
import { TokenBalanceRequest } from '../models/token-balance-request';
import { GlobalService } from '@shared/services/global.service';
import { SavedToken } from '../models/token';

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
  tokens$: Observable<SavedToken[]>;

  constructor(private tokenService: TokensService,
    private clipboardService: ClipboardService,
    private genericModalService: ModalService,
    private globalService: GlobalService) {
      this.addressChanged$ = new Subject();
      this.walletName = this.globalService.getWalletName();
      this.tokens$ = this.getBalances();
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
            this.addressChanged$.next(addresses[0]);
            this.addresses = addresses;
            this.selectedAddress = addresses[0];
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

  getBalances(): Observable<SavedToken[]> {
    // TODO make these observables
    var allTokens = [...this.tokenService.GetAvailableTokens(), ...this.tokenService.GetSavedTokens()];
    
    return this.addressChanged$
        .pipe(
          switchMap(address => {
            return forkJoin(
              allTokens.map(token => {
                return this.tokenService.GetTokenBalance(new TokenBalanceRequest(token.hash, address))
                .pipe(
                  catchError(error => {
                    // TODO handle errors
                    console.log("error getting token balance for token hash " + token.hash);
                    return of(0)
                  }),
                  map(balance => {
                    return new SavedToken(
                      token.ticker,
                      token.hash,
                      balance
                    )
                  })
                );
              })
            )
          }
        )
      )
  }

  send(item: any) {

  }

}
