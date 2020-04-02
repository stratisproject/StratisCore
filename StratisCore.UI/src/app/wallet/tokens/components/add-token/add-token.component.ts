import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';
import { ReplaySubject, Subscription } from 'rxjs';
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
  private subscriptions: Subscription[] = [];
  @Input() tokens: Token[] = [];
  addTokenForm: FormGroup;
  balance = 0;
  token: FormControl;
  address: FormControl;
  ticker: FormControl;
  decimals: FormControl;
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
    this.subscriptions.push(this.token.valueChanges.subscribe(value => {
      if (value) {
        const token = this.tokens.find(t => t.address === this.token.value);
        if (token) {
          this.ticker.setValue(token.ticker);
          this.address.setValue(token.address);
          this.name.setValue(token.name);
          this.decimals.setValue(token.decimals);
        }
      }
    }));
  }

  get customTokenSelected() {
    return !!this.addTokenForm && !!this.addTokenForm.get('token').value && this.addTokenForm.get('token').value.toLowerCase() === 'custom';
  }

  ngOnInit() {
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.dispose();
  }

  closeClicked() {
    this.activeModal.close();
  }

  onSubmit() {
    // Check that this token isn't already in the list
    const addedTokens = this.tokenService.GetSavedTokens().find(token => token.address === this.address.value);
    if (addedTokens) {
      this.showApiError(`Token ${this.ticker.value} is already added`);
      return;
    }

    // Sender doesn't matter here, just reuse an easily available address
    const tickerCall = new LocalCallRequest(this.address.value, this.address.value, 'Symbol');
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

        if (typeof (methodCallResult) === 'string' && methodCallResult !== this.ticker.value) {
          this.showApiError(`Token contract symbol ${methodCallResult} does not match given symbol ${this.ticker.value}.`);
          return;
        }

        const savedToken = new SavedToken(this.ticker.value, this.address.value, '0', name, this.decimals.value);
        const result = this.tokenService.AddToken(savedToken);

        if (result.failure) {
          this.apiError = result.message;
          return;
        }

        this.activeModal.close(savedToken);
      });
  }

  showApiError(error: string) {
    this.genericModalService.openModal('Error', error);
  }

  private registerControls() {
    const integerValidator = Validators.pattern('^[0-9][0-9]*$');

    this.token = new FormControl(0, [Validators.required]);
    this.address = new FormControl('', [Validators.required]);
    this.ticker = new FormControl('', [Validators.required]);
    this.name = new FormControl('', [Validators.required]);
    this.decimals = new FormControl(0, [Validators.min(0), integerValidator, Validators.max(8)]);

    this.addTokenForm = new FormGroup({
      token: this.token,
      address: this.address,
      ticker: this.ticker,
      name: this.name,
      decimals: this.decimals
    });
  }
}
