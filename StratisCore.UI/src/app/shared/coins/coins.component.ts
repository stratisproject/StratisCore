import { Component, OnInit, Input } from '@angular/core';
import { GlobalService, BaseUnit } from '../services/global.service';

@Component({
  selector: 'coins',
  template: `
    <span>{{ (amount | coinNotation:baseUnit.multiplier) | number : '1.2' }} {{ baseUnit.name }}</span>
  `
})
export class CoinsComponent implements OnInit {

  @Input()
  amount: number = 0;
  baseUnit: BaseUnit;

  constructor(private globalService: GlobalService) {
    this.baseUnit = globalService.getBaseUnit();
    console.log(this.baseUnit);
  }

  ngOnInit() {
  }

}
