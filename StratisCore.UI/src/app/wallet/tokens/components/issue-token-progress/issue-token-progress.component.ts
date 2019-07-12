import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { BehaviorSubject, interval, of, ReplaySubject } from 'rxjs';
import { catchError, switchMap, takeUntil, takeWhile } from 'rxjs/operators';
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

  @Input() hash = '';
  @Input() symbol = '';

  apiError: string;
  disposed$ = new ReplaySubject<boolean>();
  dispose: () => void;
  maxTimeout = 1.5 * 60 * 1000; // wait for about 1.5 minutes
  pollingInterval = 5 * 1000;
  cancel = false;
  completed$ = new BehaviorSubject<boolean>(false);

  constructor(
    private activeModal: NgbActiveModal,
    private smartContractsService: SmartContractsServiceBase,
    private tokenService: TokensService,
    private genericModalService: ModalService) { }

  ngOnInit() {
    interval(this.pollingInterval)
      .pipe(
        takeWhile((elapsed) => {
          const completed = this.cancel || elapsed > this.maxTimeout;
          if (elapsed > this.maxTimeout) {
            this.completed$.next(true);
          }
          return !completed;
        }),
        switchMap(_ => this.smartContractsService.GetReceipt(this.hash)),
        catchError(error => {
          Log.log(`Error getting receipt  for ${this.hash}`);
          return of(undefined);
        }),
        takeUntil(this.disposed$)
      )
      .subscribe(receipt => {
        if (!receipt) { return; }

        try {
          const receiptModel = JSON.parse(receipt);
          if (!!receiptModel['error']) {
            this.showError(receipt['error']);
            this.activeModal.close('ok');
            return;
          }
        } catch (e) {
          Log.error(e);
          return;
        }
        const token = new SavedToken(this.symbol, this.hash, 0);
        this.tokenService.AddToken(token);
        this.cancel = true;
        this.activeModal.close('ok');
      });

    this.completed$.pipe(takeUntil(this.disposed$)).subscribe(completed => {
      if (!completed) { return; }

      this.showError(
        `It seems to be taking longer to issue a token. Please go to "Smart Contracts" tab
         to monitor transactions and check the progress of the token issuance. Once successful, add token manually.`);
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
