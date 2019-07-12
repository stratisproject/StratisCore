import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, combineLatest, forkJoin, interval, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, map, switchMap, takeUntil, tap, mapTo, first, take } from 'rxjs/operators';

import { Mode, TransactionComponent } from '../../smart-contracts/components/modals/transaction/transaction.component';
import { SmartContractsServiceBase } from '../../smart-contracts/smart-contracts.service';
import { Disposable } from '../models/disposable';
import { Mixin } from '../models/mixin';
import { SavedToken, Token } from '../models/token';
import { TokenBalanceRequest } from '../models/token-balance-request';
import { Log } from '../services/logger.service';
import { TokensService } from '../services/tokens.service';
import { AddTokenComponent } from './add-token/add-token.component';
import { IssueTokenProgressComponent } from './issue-token-progress/issue-token-progress.component';
import { SendTokenComponent } from './send-token/send-token.component';
import * as tokenService from '../services/index';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.css']
})
@Mixin([Disposable])
export class TokensComponent implements OnInit, OnDestroy, Disposable {
  balance: number;
  coinUnit: string;
  addressChanged$: Subject<string>;
  tokensRefreshRequested$ = new BehaviorSubject<boolean>(true);
  addresses: string[];
  disposed$ = new ReplaySubject<boolean>();
  dispose: () => void;
  selectedAddress: string;
  history = [];
  walletName: string;
  tokens$: Observable<SavedToken[]>;
  availableTokens: Token[] = [];
  private pollingInterval = 5 * 1000; // polling milliseconds
  maxTimeout = 1.5 * 60 * 1000; // wait for about 1.5 minutes

  constructor(
    private tokenService: TokensService,
    private smartContractsService: SmartContractsServiceBase,
    private clipboardService: ClipboardService,
    private genericModalService: ModalService,
    private modalService: NgbModal,
    private globalService: GlobalService) {

    this.addressChanged$ = new Subject();
    this.walletName = this.globalService.getWalletName();
    this.tokens$ = this.getBalances();
    this.availableTokens = this.tokenService.GetAvailableTokens();
    this.availableTokens.push(new Token('Custom', 'custom'));
    this.coinUnit = this.globalService.getCoinUnit();

    this.smartContractsService
      .GetAddresses(this.walletName)
      .pipe(
        catchError(error => {
          Log.error(error);
          this.showApiError(`Error retrieving addressses. ${error}`);
          return of([]);
        }),
        takeUntil(this.disposed$)
      )
      .subscribe(addresses => {
        if (addresses && addresses.length > 0) {
          this.addressChanged$.next(addresses[0]);
          this.addresses = addresses;
          this.selectedAddress = addresses[0];
        }
      });

    this.addressChanged$
      .pipe(
        switchMap(address => this.smartContractsService.GetHistory(this.walletName, address)
          .pipe(catchError(error => {
            this.showApiError(`Error retrieving transactions. ${error}`);
            return of([]);
          })
          )
        ),
        takeUntil(this.disposed$)
      )
      .subscribe(history => this.history = history);

    this.addressChanged$
      .pipe(
        switchMap(x => this.smartContractsService.GetAddressBalance(x)
          .pipe(
            catchError(error => {
              this.showApiError(`Error retrieving balance. ${error}`);
              return of(0);
            })
          )
        ),
        takeUntil(this.disposed$)
      )
      .subscribe(balance => this.balance = balance);


    this.addressChanged$
      .pipe(takeUntil(this.disposed$))
      .subscribe(address => this.selectedAddress = address);

    // poll tokens list periodically
    interval(this.pollingInterval).pipe(takeUntil(this.disposed$)).subscribe(() => this.tokensRefreshRequested$.next(true));
  }

  ngOnInit() {
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
      Log.info(`Copied ${this.selectedAddress} to clipboard`);
    }
  }

  addToken() {
    const modal = this.modalService.open(AddTokenComponent, { backdrop: 'static', keyboard: false });
    (<AddTokenComponent>modal.componentInstance).tokens = this.availableTokens;
    modal.result.then(value => {
      if (value === 'ok') {
        Log.info('Refresh token list');
        this.tokensRefreshRequested$.next(true);
      }
    });
  }

  issueToken() {
    const modal = this.modalService.open(TransactionComponent, { backdrop: 'static', keyboard: false });
    (<TransactionComponent>modal.componentInstance).mode = Mode.IssueToken;
    (<TransactionComponent>modal.componentInstance).selectedSenderAddress = this.selectedAddress;
    (<TransactionComponent>modal.componentInstance).balance = this.balance;
    (<TransactionComponent>modal.componentInstance).coinUnit = this.coinUnit;
    modal.result.then(value => {
      if (!value && !value.symbol && !value.transactionHash) {
        return;
      }

      let loading = false;
      // start monitoring token progress
      const progressModal = this.modalService.open(IssueTokenProgressComponent, { backdrop: 'static', keyboard: false });
      (<IssueTokenProgressComponent>progressModal.componentInstance).loading = loading;
      (<IssueTokenProgressComponent>progressModal.componentInstance).close.subscribe(() => progressModal.close());

      let receiptQuery = this.smartContractsService.GetReceiptSilent(value.transactionHash)
        .pipe(
          catchError(error => {
            // Receipt API returns a 400 if the receipt is not found.
            Log.log(`Receipt not found yet`);
            return of(undefined);
          })
        );
  
      tokenService.pollWithTimeOut(this.pollingInterval, this.maxTimeout, receiptQuery)
        .pipe(
          first(r => {
            // Ignore the response until it has a value
            return !!r;
          }),          
          switchMap(result => {
            // Timeout returns null after completion, use this to throw an error to be handled by the subscriber.
            if (result == null) {
              return throwError(`It seems to be taking longer to issue a token. Please go to "Smart Contracts" tab
              to monitor transactions and check the progress of the token issuance. Once successful, add token manually.`);
            }

            return of(result);
          })          
        )
        .subscribe(receipt => {
            loading = false;
            const newTokenAddress = receipt['newContractAddress'];
            const token = new SavedToken(value.symbol, newTokenAddress, 0);
            this.tokenService.AddToken(token);
            progressModal.close('ok');
            this.tokensRefreshRequested$.next(true);
          },
          error => {
            loading = false;
            this.showError(error);
            Log.error(error);
            progressModal.close('ok');
          }
        );
    });
  }

  showError(error: string) {
    this.genericModalService.openModal('Error', error);
  }

  get allTokens() {
    return [...this.tokenService.GetAvailableTokens(), ...this.tokenService.GetSavedTokens()];
  }

  getBalances(): Observable<SavedToken[]> {
    return combineLatest(this.addressChanged$, this.tokensRefreshRequested$)
      .pipe(
        switchMap(([address, _]) =>
          forkJoin(
            this.tokenService.GetSavedTokens().map(token =>
              this.tokenService
                .GetTokenBalance(new TokenBalanceRequest(token.hash, address))
                .pipe(
                  catchError(error => {
                    Log.error(error);
                    Log.log(`Error getting token balance for token hash ${token.hash}`);
                    return of(0);
                  }),
                  map(balance => {
                    return new SavedToken(
                      token.ticker,
                      token.hash,
                      balance
                    );
                  })
                )
            )
          )
        ));
  }

  send(item: SavedToken) {

    const modal = this.modalService.open(SendTokenComponent, { backdrop: 'static', keyboard: false });
    (<SendTokenComponent>modal.componentInstance).walletName = this.walletName;
    (<SendTokenComponent>modal.componentInstance).selectedSenderAddress = this.selectedAddress;
    (<SendTokenComponent>modal.componentInstance).balance = this.balance;
    (<SendTokenComponent>modal.componentInstance).coinUnit = this.coinUnit;
    (<SendTokenComponent>modal.componentInstance).token = item;
    modal.result.then(value => {
      if (value === 'ok') {
        Log.info('Refresh token list');
        this.tokensRefreshRequested$.next(true);
      }
    });
  }
}
