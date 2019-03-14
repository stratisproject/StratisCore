import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared/services/global.service';
import { BaseUnit } from '../../../../shared/BaseUnit';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-base-unit',
  templateUrl: './base-unit.component.html',
  styleUrls: ['./base-unit.component.css']
})
export class BaseUnitComponent implements OnInit {
  coinUnit: string;
  baseUnits: BaseUnit[];

  constructor(private globalService: GlobalService) {
    // Set the initial value  
    this.globalService.baseUnit.pipe(take(1)).subscribe(b => {
      this.selectedBaseUnit = b;
    });

    this.coinUnit = this.globalService.getCoinUnit();
    this.baseUnits = this.globalService.getBaseUnits();
  }

  selectedBaseUnit: BaseUnit;

  ngOnInit() {
  }

  onBaseUnitChanged() {
    this.globalService.setBaseUnit(this.selectedBaseUnit);
  }

}
