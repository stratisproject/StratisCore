import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contractType'
})
export class ContractTypePipe implements PipeTransform {

  transform(value: number): string {
    if (typeof value === 'number') {
      switch (value) {
        case 0:
          return "Received";
        case 1:
          return "Sent";
        case 2:
          return "Staked";
        case 3:
          return "Call";
        case 4:
          return "Create";
        case 5:
          return "Gas Refund";
        default:
            return "";                  
      }
    }

    return "";
  }
}


