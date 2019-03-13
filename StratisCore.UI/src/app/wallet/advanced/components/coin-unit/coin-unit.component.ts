import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared/services/global.service';
import { BaseUnit } from '../../../../shared/BaseUnit';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-coin-unit',
  templateUrl: './coin-unit.component.html',
  styleUrls: ['./coin-unit.component.css']
})
export class CoinUnitComponent implements OnInit {
  coinUnit: string;
  baseUnits: BaseUnit[];

  constructor(private globalService: GlobalService) {
    // Set the initial value  
    this.globalService.baseUnit.pipe(take(1)).subscribe(b => {
      this.selectedCoinUnit = b;
    });

    this.coinUnit = this.globalService.getCoinUnit();
    this.baseUnits = this.globalService.getBaseUnits();
  }

  selectedCoinUnit: BaseUnit;

  ngOnInit() {
  }

  onBaseUnitChanged() {
    this.globalService.setBaseUnit(this.selectedCoinUnit);
  }

}
