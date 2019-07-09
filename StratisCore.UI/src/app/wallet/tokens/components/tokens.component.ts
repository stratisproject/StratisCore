import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';
import { ClipboardService } from 'ngx-clipboard';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Disposable } from '../models/disposable';
import { Mixin } from '../models/mixin';
import { Log } from '../services/logger.service';
import { TokensService } from '../services/tokens.service';

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

  constructor(private tokenService: TokensService,
    private clipboardService: ClipboardService,
    private genericModalService: ModalService) {

  }

  ngOnInit() {
    this.tokenService
      .GetAddresses('')
      .pipe(takeUntil(this.disposed$))
      .subscribe(data => Log.info(data));
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

  send(item: any) {

  }

}
