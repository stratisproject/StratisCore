import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { BehaviorSubject, interval, of, ReplaySubject, timer, race, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil, takeWhile, skipUntil, skipWhile, switchMapTo, mergeMap, first, map } from 'rxjs/operators';
import { SmartContractsServiceBase } from 'src/app/wallet/smart-contracts/smart-contracts.service';

import { Disposable } from '../../models/disposable';
import { Mixin } from '../../models/mixin';
import { SavedToken } from '../../models/token';
import { Log } from '../../services/logger.service';
import { TokensService } from '../../services/tokens.service';

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

  constructor(
    private activeModal: NgbActiveModal,
    private smartContractsService: SmartContractsServiceBase,
    private tokenService: TokensService,
    private genericModalService: ModalService) { }

  ngOnInit() {

    let timeOut = timer(this.maxTimeout)
      .pipe(
        switchMapTo(throwError(`It seems to be taking longer to issue a token. Please go to "Smart Contracts" tab
        to monitor transactions and check the progress of the token issuance. Once successful, add token manually.`))
      );

    // Polls for a receipt on an interval and only emits when a receipt is found
    let pollReceipt = interval(this.pollingInterval)
      .pipe(
        mergeMap(_ => this.smartContractsService.GetReceiptSilent(this.transactionHash)
          .pipe(
            catchError(error => {
              // Receipt API returns a 400 if the receipt is not found. 
              Log.log(`Receipt not found yet`);
              return of(undefined);
            })
          )        
        ), // Don't care about errors here, they will be handled in the subscribe
        first(r => {
          // Ignore the response until it has a value
          return !!r;
        })
      );

    race(timeOut, pollReceipt)
      .pipe(
        takeUntil(this.disposed$)
      )
      .subscribe(receipt => {

        if (!!receipt['error']) {
          this.showError(receipt['error']);
          this.activeModal.close('ok');
          return;
        }

        const newTokenAddress = receipt['newContractAddress'];
        const token = new SavedToken(this.symbol, newTokenAddress, 0);
        this.tokenService.AddToken(token);
        this.activeModal.close('ok');
      },
      error => {
        this.showError(error);
        Log.error(error);
        this.activeModal.close('ok');
      });
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
