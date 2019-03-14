import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'coinNotation'
})
export class CoinNotationPipe implements PipeTransform {
  constructor() { }

  private decimalLimit = 8;

  transform(value: number, multiple: number = 100000000): number {
    let temp;    
    if (typeof value === 'number') {
      temp = value / multiple;
      return temp.toFixed(this.decimalLimit);
    }
  }
}
