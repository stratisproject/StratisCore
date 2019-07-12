import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { interval, of, ReplaySubject, timer, race, throwError } from 'rxjs';
import { catchError, takeUntil, switchMapTo, mergeMap, first, map, timeout, tap } from 'rxjs/operators';
import { SmartContractsServiceBase } from 'src/app/wallet/smart-contracts/smart-contracts.service';

import { Disposable } from '../../models/disposable';
import { Mixin } from '../../models/mixin';
import { SavedToken } from '../../models/token';
import { Log } from '../../services/logger.service';
import { TokensService } from '../../services/tokens.service';
import * as tokenService from '../../services/index';

@Component({
  selector: 'app-issue-token-progress',
  templateUrl: './issue-token-progress.component.html',
  styleUrls: ['./issue-token-progress.component.css']
})
@Mixin([Disposable])
export class IssueTokenProgressComponent implements OnInit, OnDestroy, Disposable {

  @Input() transactionHash = '';
  @Input() symbol = '';

  apiError: string;
  disposed$ = new ReplaySubject<boolean>();
  dispose: () => void;
  maxTimeout = 1.5 * 60 * 1000; // wait for about 1.5 minutes
  pollingInterval = 5 * 1000;
  loading = false;

  constructor(
    private activeModal: NgbActiveModal,
    private smartContractsService: SmartContractsServiceBase,
    private tokenService: TokensService,
    private genericModalService: ModalService) { }

  ngOnInit() {
    this.loading = true;

    let receiptQuery = this.smartContractsService.GetReceiptSilent(this.transactionHash)
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
        map(result => {
          // Timeout returns null after completion, use this to throw an error to be handled by the subscriber.
          if (result == null) {
            return throwError(`It seems to be taking longer to issue a token. Please go to "Smart Contracts" tab
            to monitor transactions and check the progress of the token issuance. Once successful, add token manually.`);
          }

          return of(result);
        })
      )
      .subscribe(receipt => {
          this.loading = false;
          const newTokenAddress = receipt['newContractAddress'];
          const token = new SavedToken(this.symbol, newTokenAddress, 0);
          this.tokenService.AddToken(token);
          this.activeModal.close('ok');
        },
        error => {
          this.loading = false;
          this.showError(error);
          Log.error(error);
          this.activeModal.close('ok');
        }
      );
  }

  ngOnDestroy() {
    this.dispose();
  }

  closeClicked() {
    this.activeModal.close();
  }

  showError(error: string) {
    this.genericModalService.openModal('Error', error);
  }

}
