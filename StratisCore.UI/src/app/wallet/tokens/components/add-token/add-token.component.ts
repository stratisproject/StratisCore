import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { ReplaySubject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';

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
  address: FormControl;
  ticker: FormControl;
  name: FormControl;
  loading: boolean;
  apiError: string;
  disposed$ = new ReplaySubject<boolean>();
  dispose: () => void;

  constructor(
    private tokenService: TokensService,
    private activeModal: NgbActiveModal,
    private genericModalService: ModalService) {
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

    const ticker = this.customTokenSelected ? this.ticker.value + '' : this.tokens.find(t => t.address === this.token.value).ticker;
    const address = this.customTokenSelected ? this.address.value + '' : this.tokens.find(t => t.address === this.token.value).address;
    const name = this.customTokenSelected ? this.name.value + '' : this.tokens.find(t => t.address === this.token.value).name;

    // Check that this token isn't already in the list
    const addedTokens = this.tokenService.GetSavedTokens().find(token => token.address === address);

    if (addedTokens) {
      this.showApiError(`Token ${ticker} is already added`);

      return;
    }

    // Sender doesn't matter here, just reuse an easily available address
    const tickerCall = new LocalCallRequest(address, address, 'Symbol');

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
        const methodCallResult = localExecutionResult.return;

        if (!methodCallResult) {
          this.showApiError(`Address is not a valid token contract.`);
          return;
        }

        if (typeof (methodCallResult) === 'string' && methodCallResult !== ticker) {
          this.showApiError(`Token contract symbol ${methodCallResult} does not match given symbol ${ticker}.`);
          return;
        }

        const savedToken = new SavedToken(ticker, address, 0, name);
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
    this.address = new FormControl('', [customTokenDetailsValidator]);
    this.ticker = new FormControl('', [customTokenDetailsValidator]);
    this.name = new FormControl('', [customTokenDetailsValidator]);

    this.addTokenForm = new FormGroup({
      token: this.token,
      address: this.address,
      ticker: this.ticker,
      name: this.name
    });
  }
}
