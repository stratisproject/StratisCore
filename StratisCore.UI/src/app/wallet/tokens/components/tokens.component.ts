import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
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
  disposed$ = new ReplaySubject<boolean>();
  dispose: () => void;

  constructor(private tokenService: TokensService) { }

  ngOnInit() {
    this.tokenService
      .GetAddresses('')
      .pipe(takeUntil(this.disposed$))
      .subscribe(data => Log.info(data));
  }

  ngOnDestroy() {
    this.dispose();
  }

}
