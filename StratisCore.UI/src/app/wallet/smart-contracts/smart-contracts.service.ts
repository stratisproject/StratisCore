import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class SmartContractsContractItem {
    constructor(public blockId: string, public type: string, public hash: string, public destinationAddress: string, public amount: number) { }
}

export abstract class SmartContractsServiceBase {
    GetBalance(walletName: string): Observable<number> { return Observable.of(); }
    GetAddress(walletName: string): Observable<string> { return Observable.of(); }
    GetContracts(walletName: string): Observable<SmartContractsContractItem[]> { return Observable.of(); }
}

@Injectable()
export class FakeSmartContractsService {
    GetBalance(walletName: string): Observable<number> { return Observable.of(10898026); }

    GetAddress(walletName: string): Observable<string> { return Observable.of('SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn'); }

    GetContracts(walletName: string): Observable<SmartContractsContractItem[]> {
        return Observable.of([
            new SmartContractsContractItem('7809', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 10898025),
            new SmartContractsContractItem('7810', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 11898025),
            new SmartContractsContractItem('7811', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 12898025),
            new SmartContractsContractItem('7812', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 13898025),
            new SmartContractsContractItem('7813', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 14898025),
            new SmartContractsContractItem('7814', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 15898025),
        ]);
    }
}
