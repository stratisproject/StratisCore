import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { ReplaySubject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { SmartContractsServiceBase } from 'src/app/wallet/smart-contracts/smart-contracts.service';

import { Disposable } from '../../models/disposable';
import { LocalCallRequest } from '../../models/LocalCallRequest';
import { Mixin } from '../../models/mixin';
import { SavedToken, Token } from '../../models/token';
import { TokensService } from '../../services/tokens.service';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.css']
})
@Mixin([Disposable])
export class AddTokenComponent implements OnInit, OnDestroy, Disposable {

  @Input() tokens: Token[] = [];
  addTokenForm: FormGroup;
  balance = 0;
  token: FormControl;
  hash: FormControl;
  ticker: FormControl;
  loading: boolean;
  apiError: string;
  disposed$ = new ReplaySubject<boolean>();
  dispose: () => void;

  constructor(
    private tokenService: TokensService,
    private activeModal: NgbActiveModal,
    private genericModalService: ModalService,
    private smartContractsService: SmartContractsServiceBase) {
    this.registerControls();
  }

  get customTokenSelected() {
    return !!this.addTokenForm && !!this.addTokenForm.get('token').value && this.addTokenForm.get('token').value.toLowerCase() === 'custom';
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.dispose();
  }

  closeClicked() {
    this.activeModal.close();
  }

  onSubmit() {

    const ticker = this.customTokenSelected ? this.ticker.value + '' : this.tokens.find(t => t.hash === this.token.value).ticker;
    const hash = this.customTokenSelected ? this.hash.value + '' : this.tokens.find(t => t.hash === this.token.value).hash;

    // Check that this token isn't already in the list
    const addedTokens = this.tokenService.GetSavedTokens().find(token => token.hash === hash);

    if (addedTokens) {
      this.showApiError(`Token ${addedTokens.ticker} is already added`);

      return;
    }

    // Sender doesn't matter here, just reuse an easily available address
    const tickerCall = new LocalCallRequest(hash, hash, 'Symbol');

    this.loading = true;

    // Add the token if valid token contract exists
    this.tokenService
      .LocalCall(tickerCall)
      .pipe(
        take(1),
        takeUntil(this.disposed$),
        finalize(() => this.loading = false)
      )
      .subscribe(localExecutionResult => {
        const methodCallResult = (<any>localExecutionResult).Return; // fix once PR for casing is in

        if (!methodCallResult) {
          this.showApiError(`Address is not a valid token contract.`);
          return;
        }

        if (typeof (methodCallResult) === 'string' && methodCallResult !== ticker) {
          this.showApiError(`Token contract symbol ${methodCallResult} does not match given symbol ${ticker}.`);
          return;
        }

        const savedToken = new SavedToken(ticker, hash, 0);
        const result = this.tokenService.AddToken(savedToken);

        if (result.failure) {
          this.apiError = result.message;
          return;
        }

        this.activeModal.close('ok');
      });
  }

  showApiError(error: string) {
    this.genericModalService.openModal('Error', error);
  }

  private registerControls() {
    const customTokenDetailsValidator = control => !control.value && this.customTokenSelected ? { required: true } : null;

    this.token = new FormControl(0, [Validators.required]);
    this.hash = new FormControl('', [customTokenDetailsValidator]);
    this.ticker = new FormControl('', [customTokenDetailsValidator]);

    this.addTokenForm = new FormGroup({
      token: this.token,
      hash: this.hash,
      ticker: this.ticker
    });
  }
}
