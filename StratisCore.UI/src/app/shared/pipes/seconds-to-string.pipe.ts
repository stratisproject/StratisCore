import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToString'
})
export class SecondsToStringPipe implements PipeTransform {
  constructor() {
  }

  public transform(seconds: number): string {
    const numDays = Math.floor(seconds / 86400);
    const numHours = Math.floor((seconds % 86400) / 3600);
    const numMinutes = Math.floor(((seconds % 86400) % 3600) / 60);
    let dateString = '';

    if (numDays > 0) {
      if (numDays > 1) {
        dateString += numDays + ' days ';
      } else {
        dateString += numDays + ' day ';
      }
    }

    if (numHours > 0) {
      if (numHours > 1) {
        dateString += numHours + ' hours ';
      } else {
        dateString += numHours + ' hour ';
      }
    }

    if (numMinutes > 0) {
      if (numMinutes > 1) {
        dateString += numMinutes + ' minutes ';
      } else {
        dateString += numMinutes + ' minute ';
      }
    }

    if (dateString === '') {
      dateString = 'Unknown';
    }

    return dateString;
  }

}
