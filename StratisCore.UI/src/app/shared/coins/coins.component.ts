import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { BaseUnit } from "../BaseUnit";
import { Subject } from 'rxjs';

@Component({
  selector: 'coins',
  template: `
    <span>{{ amount | coinNotation:(baseUnit | async)?.multiple }}</span><span *ngIf="showUnit"> {{ this.coinUnit|prefixCoinUnit:(baseUnit | async)?.name }}</span>
  `
})
export class CoinsComponent implements OnInit {

  @Input()
  amount: number = 0;

  @Input()
  showUnit: boolean = true;

  baseUnit: Subject<BaseUnit>;
  coinUnit: string;

  constructor(private globalService: GlobalService) {
    this.baseUnit = this.globalService.baseUnit;
    this.coinUnit = this.globalService.getCoinUnit();
  }

  ngOnInit() {
  }

}
