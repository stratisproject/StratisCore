import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prefixCoinUnit'
})
export class PrefixCoinUnitPipe implements PipeTransform {

  transform(value: string, baseUnit: string): any {
    if (baseUnit === 'sats') {
      return baseUnit;      
    }

    return baseUnit + value;
  }
}
