import { timer, interval, race, Observable } from 'rxjs';
import { map, mergeMap, startWith } from 'rxjs/operators';

export const pollWithTimeOut = (pollingInterval: number, maxTimeout: number, poll: Observable<any>): Observable<any> => {
    const timeOut = timer(maxTimeout).pipe(map(() => null));

    // Polls for a receipt on an interval and only emits when a receipt is found
    const pollReceipt = interval(pollingInterval)
      .pipe(
          startWith(0),
          mergeMap(() => poll)
      );

    return race(timeOut, pollReceipt);
};
