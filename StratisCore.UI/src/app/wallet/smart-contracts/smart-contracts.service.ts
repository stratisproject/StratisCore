import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { inherits } from 'util';
import { ApiService } from '../../shared/services/api.service';

export class SmartContractsContractItem {
    constructor(public blockId: string, public type: string, public hash: string, public destinationAddress: string, public amount: number) { }
}

export class ContractTransactionItem
{
    blockHeight: number;
    type: number;
    hash: string;
    to: string;
    amount: number;
}

export abstract class SmartContractsServiceBase {
    GetAddresses(walletName: string): Observable<string[]> { return Observable.of(); }
    GetBalance(walletName: string): Observable<number> { return Observable.of(); }
    GetAddressBalance(address: string): Observable<number> { return Observable.of(); }
    GetAddress(walletName: string): Observable<string> { return Observable.of(); }
    GetContracts(walletName: string): Observable<SmartContractsContractItem[]> { return Observable.of(); }
    GetSenderAddresses(walletName: string): Observable<string[]> { return Observable.of(); }
    GetParameterTypes(walletName: string): Observable<string[]> { return Observable.of(); }
    GetHistory(walletName: string, address: string): Observable<ContractTransactionItem[]> { return Observable.of(); }
}

@Injectable()
export class SmartContractsService implements SmartContractsServiceBase
{
    constructor(private apiService: ApiService) { }

    GetHistory(walletName: string, address: string): Observable<ContractTransactionItem[]> {
        return this.apiService.getAccountHistory(walletName, address)
            .map(response => response.json());
    }

    GetBalance(walletName: string): Observable<number> {
        return this.apiService.getAccountBalance(walletName)
            .map(response => response.json());
    }

    GetAddressBalance(address: string): Observable<number> {
        return this.apiService.getAddressBalance(address)
            .map(response => response.json());
    }
    
    GetAddress(walletName: string): Observable<string> {
        return this.apiService.getAccountAddress(walletName)
            .map(response => response.json());
    }

    GetAddresses(walletName: string): Observable<string[]> {
        return this.apiService.getAccountAddresses(walletName)
            .map(response => response.json());
    }

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

    GetSenderAddresses(walletName: string): Observable<string[]> {
        return Observable.of([
            'SarP7wvxZmaG7t1UAjaxyB6RNT9FV1Z2Sn',
            'SbrP8wvxZmaG7t2UAjbxyB7RNT9FV1Z2Sn',
            'ScrP9wvxZmaG7t3UAjcxyB8RNT9FV1Z2Sn'
        ]);
    }

    GetParameterTypes(walletName: string): Observable<string[]> {
        return Observable.of([
            'Type 1',
            'Type 2',
            'Type 3'
        ]);
    }
}

@Injectable()
export class FakeSmartContractsService implements SmartContractsServiceBase {
    GetHistory(walletName: string, address: string): Observable<any> {
        throw new Error("Method not implemented.");
    }
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

    GetSenderAddresses(walletName: string): Observable<string[]> {
        return Observable.of([
            'SarP7wvxZmaG7t1UAjaxyB6RNT9FV1Z2Sn',
            'SbrP8wvxZmaG7t2UAjbxyB7RNT9FV1Z2Sn',
            'ScrP9wvxZmaG7t3UAjcxyB8RNT9FV1Z2Sn'
        ]);
    }

    GetParameterTypes(walletName: string): Observable<string[]> {
        return Observable.of([
            'Type 1',
            'Type 2',
            'Type 3'
        ]);
    }

    GetAddresses(walletName: string): Observable<string[]> { 
        return Observable.of([
            'SarP7wvxZmaG7t1UAjaxyB6RNT9FV1Z2Sn',
            'SbrP8wvxZmaG7t2UAjbxyB7RNT9FV1Z2Sn',
            'ScrP9wvxZmaG7t3UAjcxyB8RNT9FV1Z2Sn'
        ]); 
    }

    GetAddressBalance(address: string): Observable<number> { 
        return Observable.of(10898026);
    }
}
