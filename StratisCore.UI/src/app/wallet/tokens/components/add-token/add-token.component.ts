import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SavedToken, Token } from '../../models/token';
import { TokensService } from '../../services/tokens.service';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.css']
})
export class AddTokenComponent implements OnInit {

  @Input() tokens: Token[] = [];
  addTokenForm: FormGroup;
  balance = 0;
  token: FormControl;
  hash: FormControl;
  ticker: FormControl;
  loading: boolean;
  apiError: string;

  constructor(
    private tokenService: TokensService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder) {
      this.registerControls();
    }

  get customTokenSelected() {
    return !!this.addTokenForm && !!this.addTokenForm.get('token').value && this.addTokenForm.get('token').value.toLowerCase() === 'custom';
  }

  ngOnInit() {
  }

  closeClicked() {
    this.activeModal.close();
  }

  onSubmit() {
    this.loading = true;

    const ticker = this.customTokenSelected ? this.ticker.value + '' : this.tokens.find(t => t.hash === this.token.value).ticker;
    const hash = this.customTokenSelected ? this.hash.value + '' : this.tokens.find(t => t.hash === this.token.value).hash;
    const savedToken = new SavedToken(ticker, hash, 0);
    const result = this.tokenService.AddToken(savedToken);
    this.loading = false;

    if (result.failure) {
      this.apiError = result.message;
      return;
    }

    this.activeModal.close();
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
