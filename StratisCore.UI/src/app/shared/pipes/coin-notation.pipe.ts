import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../services/global.service';

@Pipe({
  name: 'coinNotation'
})
export class CoinNotationPipe implements PipeTransform {
  constructor(private globalService: GlobalService) { }

  private decimalLimit = 8;

  transform(value: number, multiple: number = 100000000): number {
    let temp;    
    if (typeof value === 'number') {
      temp = value / this.globalService.getBaseUnit().multiple;
      return temp.toFixed(this.decimalLimit);
    }
  }
}
