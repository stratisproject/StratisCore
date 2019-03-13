import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-coin-unit',
  templateUrl: './coin-unit.component.html',
  styleUrls: ['./coin-unit.component.css']
})
export class CoinUnitComponent implements OnInit {

  constructor() { }

  private selectCoinUnitForm: FormGroup;

  units = [
    'STRAT',
    'mSTRAT',
    'uSTRAT',
  ]

  unit: string;

  ngOnInit() {
  }

}
