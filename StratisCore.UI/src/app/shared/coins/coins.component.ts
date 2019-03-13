import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { BaseUnit } from "../BaseUnit";
import { Subject } from 'rxjs';

@Component({
  selector: 'coins',
  template: `
    <span>{{ amount | coinNotation:baseUnit.multiple | number:format }}</span><span *ngIf="showUnit"> {{ this.coinUnit | prefixCoinUnit:baseUnit.name }}</span>
  `
})
export class CoinsComponent implements OnInit {

  @Input()
  amount: number = 0;

  @Input()
  showUnit: boolean = true;

  @Input()
  format: string = undefined;

  baseUnit: BaseUnit;
  coinUnit: string;
  baseUnitSubscription: any;

  constructor(private globalService: GlobalService) {
    this.baseUnitSubscription = this.globalService.baseUnit.subscribe(b => {
      this.baseUnit = b;
      this.format = this.format != undefined ? this.format : b.defaultFormat;
    });

    this.coinUnit = this.globalService.getCoinUnit();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.baseUnitSubscription.unsubscribe();
  }

}
