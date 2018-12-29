import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export class ColdStakingInfo {
    constructor(public hotWalletBalance: number,
        public coldWalletBalance: number,
        public hotWalletAmount: number,
        public coldWalletAmount: number) { }
}

export class ColdStakingHistoryItem {
    constructor(public status: string, public side: string, public amount: string, public dateTime: string, public wallet: string) { }
}

export abstract class ColdStakingServiceBase {
    GetInfo(walletName: string): Observable<ColdStakingInfo> { return of(); }
    GetHistory(walletName: string): Observable<ColdStakingHistoryItem[]> { return of(); }
    GetAddress(walletName: string): Observable<string> { return of(); }
    CreateColdstaking(...params): Observable<boolean> { return of(); }
}

@Injectable()
export class FakeColdStakingService implements ColdStakingServiceBase {

    GetInfo(walletName: string): Observable<ColdStakingInfo> {
        return of<ColdStakingInfo>(new ColdStakingInfo(88025, 91223, 4000, 28765));
    }

    GetHistory(walletName: string): Observable<ColdStakingHistoryItem[]> {
        return of<ColdStakingHistoryItem[]>([
            new ColdStakingHistoryItem('warning', 'hot', '+1.0000000', '26/11/2017 15:31', 'Breeze2'),
            new ColdStakingHistoryItem('success', 'hot', '+1.0000000', '26/11/2017 15:31', 'Breeze2'),
            new ColdStakingHistoryItem('success', 'cold', '-1.0037993', '26/11/2017 15:31', 'Breeze2')
        ]);
    }

    GetAddress(walletName: string): Observable<string> {
        return of('ScCHt2Mug856o1E6gck6VFriXYnRYBD8NE');
    }

    CreateColdstaking(...params): Observable<boolean> {
        return of(true);
    }
}
