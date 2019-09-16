import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { ClipboardService } from 'ngx-clipboard';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  interval,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import { catchError, first, map, switchMap, takeUntil, distinctUntilChanged, tap, take, startWith } from 'rxjs/operators';

import { Mode, TransactionComponent } from '../../smart-contracts/components/modals/transaction/transaction.component';
import { SmartContractsServiceBase } from '../../smart-contracts/smart-contracts.service';
import { Disposable } from '../models/disposable';
import { Mixin } from '../models/mixin';
import { SavedToken, Token } from '../models/token';
import { TokenBalanceRequest } from '../models/token-balance-request';
import { Log } from '../services/logger.service';
import { pollWithTimeOut } from '../services/polling';
import { TokensService } from '../services/tokens.service';
import { AddTokenComponent } from './add-token/add-token.component';
import { ProgressComponent } from './progress/progress.component';
import { SendTokenComponent } from './send-token/send-token.component';
import { CurrentAccountService } from '@shared/services/current-account.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.css']
})
@Mixin([Disposable])
export class TokensComponent implements OnInit, OnDestroy, Disposable {
  balance: number;
  coinUnit: string;
  tokenBalanceRefreshRequested$ = new Subject<SavedToken[]>();
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
  tokens: SavedToken[] = [];
  tokenLoading: { [address: string]: string; } = {};

  constructor(
    private tokenService: TokensService,
    private smartContractsService: SmartContractsServiceBase,
    private clipboardService: ClipboardService,
    private genericModalService: ModalService,
    private modalService: NgbModal,
    private globalService: GlobalService,
    private currentAccountService: CurrentAccountService) {

    this.walletName = this.globalService.getWalletName();

    this.availableTokens = this.tokenService.GetAvailableTokens();
    this.availableTokens.push(new Token('Custom', 'custom', 'custom'));
    this.coinUnit = this.globalService.getCoinUnit();
    this.selectedAddress = this.currentAccountService.address;

    this.smartContractsService.GetHistory(this.walletName, this.selectedAddress)
      .pipe(catchError(error => {
          this.showApiError(`Error retrieving transactions. ${error}`);
          return of([]);
        }),
        take(1)
      )
    .subscribe(history => this.history = history);

    this.smartContractsService.GetAddressBalance(this.selectedAddress)
      .pipe(
        catchError(error => {
          this.showApiError(`Error retrieving balance. ${error}`);
          return of(0);
        }),
        take(1)
      )
      .subscribe(balance => this.balance = balance);

    // Update requested token balances
    this.tokenBalanceRefreshRequested$
      .pipe(
        tap(tokensToReload => tokensToReload.forEach(t => t.balance = null)),
        switchMap(tokensToReload => this.updateTokenBalances(tokensToReload)),
        takeUntil(this.disposed$)
      )
      .subscribe();

    interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.updateTokenBalances(this.tokens)),
        takeUntil(this.disposed$)
      )
      .subscribe();
  }

  private updateTokenBalances(tokens: SavedToken[]) {
    const tokensWithAddresses = tokens.filter(token => !!token.address);
    tokensWithAddresses.forEach(token => this.tokenLoading[token.address] = 'loading');
    return forkJoin(tokensWithAddresses.map(token => {
      return this.tokenService
        .GetTokenBalance(new TokenBalanceRequest(token.address, this.selectedAddress))
        .pipe(catchError(error => {
          Log.error(error);
          Log.log(`Error getting token balance for token address ${token.address}`);
          return of(null);
        }),
        tap(balance => {
          if (balance === null) {
            token.balance = null;
            this.tokenLoading[token.address] = 'error';
            return;
          }

          this.tokenLoading[token.address] = 'loaded';
          if (balance !== token.balance) {
            token.balance = balance;
          }
        }));
    }));
  }

  ngOnInit() {
    // Clear all the balances to start with
    const tokens = this.tokenService.GetSavedTokens();
    tokens.forEach(t => t.balance = null);
    this.tokens = tokens;

    // Refresh them all
    this.tokenBalanceRefreshRequested$.next(this.tokens);
  }

  ngOnDestroy() {
    this.dispose();
  }

  showApiError(error: string) {
    this.genericModalService.openModal('Error', error);
  }

  clipboardAddressClicked() {
    if (this.selectedAddress && this.clipboardService.copyFromContent(this.selectedAddress)) {
      Log.info(`Copied ${this.selectedAddress} to clipboard`);
    }
  }

  copyTokenAddress(address: string) {
    if (this.clipboardService.copyFromContent(address)) {
      Log.info(`Copied ${this.selectedAddress} to clipboard`);
    }
  }

  addToken() {
    const modal = this.modalService.open(AddTokenComponent, { backdrop: 'static', keyboard: false });
    (<AddTokenComponent>modal.componentInstance).tokens = this.availableTokens;
    modal.result.then(value => {
      if (value) {

        Log.info('Refresh token list');

        this.tokens.push(value);
        this.tokenBalanceRefreshRequested$.next([value]);
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
      if (!value || !value.symbol || !value.transactionHash || !value.name) {
        return;
      }

      // start monitoring token progress
      const progressModal = this.modalService.open(ProgressComponent, { backdrop: 'static', keyboard: false });
      (<ProgressComponent>progressModal.componentInstance).loading = true;
      (<ProgressComponent>progressModal.componentInstance).title = 'Waiting for Confirmation';
      (<ProgressComponent>progressModal.componentInstance).message = 'Your token creation transaction has been broadcast and is waiting to be mined. This window will close once the transaction receives one confirmation.';
      (<ProgressComponent>progressModal.componentInstance).close.subscribe(() => progressModal.close());

      const receiptQuery = this.smartContractsService.GetReceiptSilent(value.transactionHash)
        .pipe(
          catchError(error => {
            // Receipt API returns a 400 if the receipt is not found.
            Log.log(`Receipt not found yet`);
            return of(undefined);
          })
        );

      pollWithTimeOut(this.pollingInterval, this.maxTimeout, receiptQuery)
        .pipe(
          first(r => !!r),
          switchMap(result => {
            // Timeout returns null after completion, use this to throw an error to be handled by the subscriber.
            if (result == null) {
              return throwError(`It seems to be taking longer to issue a token. Please go to "Smart Contracts" tab
                to monitor transactions and check the progress of the token issuance. Once successful, add token manually.`);
            }

            return of(result);
          }),
          switchMap(receipt => !!receipt.error ? throwError(receipt.error) : of(receipt)),
          takeUntil(this.disposed$)
        )
        .subscribe(
          receipt => {
            const newTokenAddress = receipt['newContractAddress'];
            const token = new SavedToken(value.symbol, newTokenAddress, 0, value.name);
            this.tokenService.AddToken(token);
            progressModal.close('ok');
            this.tokens.push(token);
            this.tokenBalanceRefreshRequested$.next([token]);
          },
          error => {
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

  delete(item: SavedToken) {
    const modal = this.modalService.open(ConfirmationModalComponent, { backdrop: 'static', keyboard: false });
    (<ConfirmationModalComponent>modal.componentInstance).body = `Are you sure you want to remove "${item.ticker}" token`;
    modal.result.then(value => {
      if (!value) { return; }
      const removeResult = this.tokenService.RemoveToken(item);
      if (removeResult.failure) {
        this.showApiError(removeResult.message);
        return;
      }

      this.tokens.splice(this.tokens.indexOf(item), 1);
    });
  }

  send(item: SavedToken) {

    const modal = this.modalService.open(SendTokenComponent, { backdrop: 'static', keyboard: false });
    (<SendTokenComponent>modal.componentInstance).walletName = this.walletName;
    (<SendTokenComponent>modal.componentInstance).selectedSenderAddress = this.selectedAddress;
    (<SendTokenComponent>modal.componentInstance).balance = this.balance;
    (<SendTokenComponent>modal.componentInstance).coinUnit = this.coinUnit;
    (<SendTokenComponent>modal.componentInstance).token = item;
    modal.result.then(value => {

      if (!value || !value.callResponse) {
        return;
      }

      // start monitoring token progress
      const progressModal = this.modalService.open(ProgressComponent, { backdrop: 'static', keyboard: false });
      (<ProgressComponent>progressModal.componentInstance).loading = true;
      (<ProgressComponent>progressModal.componentInstance).close.subscribe(() => progressModal.close());
      (<ProgressComponent>progressModal.componentInstance).title = 'Waiting For Confirmation';
      // tslint:disable-next-line:max-line-length
      (<ProgressComponent>progressModal.componentInstance).message = 'Your token transfer transaction has been broadcast and is waiting to be mined. This window will close once the transaction receives one confirmation.';
      (<ProgressComponent>progressModal.componentInstance).summary = `Send ${value.amount} ${item.name} to ${value.recipientAddress}`;

      const receiptQuery = this.smartContractsService.GetReceiptSilent(value.callResponse.transactionId)
        .pipe(
          catchError(error => {
            // Receipt API returns a 400 if the receipt is not found.
            Log.log(`Receipt not found yet`);
            return of(undefined);
          })
        );

      pollWithTimeOut(this.pollingInterval, this.maxTimeout, receiptQuery)
        .pipe(
          first(r => !!r),
          switchMap(result => {
            // Timeout returns null after completion, use this to throw an error to be handled by the subscriber.
            if (result === null) {
              return throwError(`It seems to be taking longer to transfer tokens. Please go to "Smart Contracts" tab
                to monitor transactions and check the progress of the token transfer.`);
            }

            return of(result);
          }),
          takeUntil(this.disposed$)
        )
        .subscribe(
          receipt => {

            if (!!receipt.error) {
              this.showError(receipt.error);
              Log.error(new Error(receipt.error));
            }

            if (receipt.returnValue === 'False') {
              const sendFailedError = 'Sending tokens failed! Check the amount you are trying to send is correct.';
              this.showError(sendFailedError);
              Log.error(new Error(sendFailedError));
            }

            progressModal.close('ok');
            this.tokenBalanceRefreshRequested$.next([item]);
          },
          error => {
            this.showError(error);
            Log.error(error);
            progressModal.close('ok');
          }
        );
    });
  }
}
