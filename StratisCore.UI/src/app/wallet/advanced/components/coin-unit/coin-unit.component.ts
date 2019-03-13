import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GlobalService, BaseUnit } from '../../../../shared/services/global.service';

@Component({
  selector: 'app-coin-unit',
  templateUrl: './coin-unit.component.html',
  styleUrls: ['./coin-unit.component.css']
})
export class CoinUnitComponent implements OnInit {
  coinUnit: string;
  baseUnits: BaseUnit[];
  units: BaseUnit[];

  constructor(private globalService: GlobalService) {
    this.coinUnit = this.globalService.getCoinUnit();
    this.selectedCoinUnit = this.globalService.getBaseUnit();
    this.baseUnits = this.globalService.getBaseUnits();

    // Map to our own baseunit + coinunit suffix eg. mSTRAT
    this.units = this.baseUnits.map(b => b.addCoinUnit(this.coinUnit));
    console.log(this.units);
  }

  private selectCoinUnitForm: FormGroup;

  selectedCoinUnit: BaseUnit;

  ngOnInit() {
  }

  onBaseUnitChanged()
  {
    this.globalService.setBaseUnit(this.selectedCoinUnit);
  }

}
