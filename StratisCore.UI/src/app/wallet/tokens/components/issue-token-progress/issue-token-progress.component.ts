import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
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

@Component({
  selector: 'app-issue-token-progress',
  templateUrl: './issue-token-progress.component.html',
  styleUrls: ['./issue-token-progress.component.css']
})
@Mixin([Disposable])
export class IssueTokenProgressComponent implements OnInit, OnDestroy {

  @Input()
  loading = false;

  @Output()
  close = new EventEmitter();

  constructor(
    private activeModal: NgbActiveModal,
    private genericModalService: ModalService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeClicked() {
    this.close.emit();
  }
}
