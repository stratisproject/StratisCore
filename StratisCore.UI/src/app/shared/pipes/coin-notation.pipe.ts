import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'coinNotation'
})
export class CoinNotationPipe implements PipeTransform {
  constructor() { }

  private decimalLimit = 8;

  transform(value: number): number {
    let temp;
    if (typeof value === 'number') {
      temp = value / 100000000;
      return temp.toFixed(this.decimalLimit);
    }
  }
}
