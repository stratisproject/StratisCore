import { Component, Input } from '@angular/core';

@Component({
  selector: 'sc-balance',
  template: `
    <strong data-toggle="tooltip" data-placement="right" [title]="(balance | coinNotation) + ' ' + coinUnit">{{ (balance | coinNotation) | number : '1.2' }}</strong><small> {{ coinUnit }}</small>
  `
})

export class ScBalanceComponent {
    @Input() balance: number = 0;
    @Input() coinUnit: string;
 }