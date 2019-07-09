import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { Observable, of } from 'rxjs';

import { ContractTransactionItem, SmartContractsContractItem } from '../../smart-contracts/smart-contracts.service';
import { Result, ResultStatus } from '../models/Result';
import { SavedToken, Token } from '../models/token';
import { StorageService } from './storage.service';

export abstract class TokensServiceBase {
  GetReceipt(hash: string): Observable<string> { return of(); }
  GetAddresses(walletName: string): Observable<string[]> { return of(); }
  GetBalance(walletName: string): Observable<number> { return of(); }
  GetAddressBalance(address: string): Observable<number> { return of(); }
  GetAddress(walletName: string): Observable<string> { return of(); }
  GetContracts(walletName: string): Observable<SmartContractsContractItem[]> { return of(); }
  GetSenderAddresses(walletName: string): Observable<string[]> { return of(); }
  GetParameterTypes(walletName: string): Observable<string[]> { return of(); }
  GetHistory(walletName: string, address: string): Observable<ContractTransactionItem[]> { return of(); }
  PostCreate(createTransaction: any): Observable<any> { return of(); }
  PostCall(createTransaction: any): Observable<any> { return of(); }
  GetSavedTokens(): SavedToken[] { return []; }
  GetAvailableTokens(): Token[] { return []; }
  UpdateTokens(tokens: SavedToken[]): Result<SavedToken[]> { return Result.ok(tokens); }
  AddToken(token: SavedToken): Result<SavedToken> { return Result.ok(token); }
  RemoveToken(token: SavedToken): Result<SavedToken> { return Result.ok(token); }
}

@Injectable()
export class TokensService implements TokensServiceBase {
  private savedTokens = 'savedTokens';

  constructor(private apiService: ApiService, private storage: StorageService) { }

  GetSavedTokens(): SavedToken[] {
    return this.storage.getItem<SavedToken[]>(this.savedTokens) || [];
  }

  GetAvailableTokens(): Token[] {
    return [
      new Token('MYTK', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
      new Token('CIRR', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    ];
  }

  UpdateTokens(tokens: SavedToken[]): Result<SavedToken[]> {
    this.storage.setItem(this.savedTokens, tokens);
    return Result.ok(tokens);
  }

  AddToken(token: SavedToken): Result<SavedToken> {
    if (!token) { return new Result(ResultStatus.Error, 'Invalid token'); }
    const tokens = this.GetSavedTokens();

    const index = tokens.map(t => t.hash).indexOf(token.hash);
    if (index >= 0) { return new Result(ResultStatus.Error, 'Specified token is already saved'); }

    tokens.push(token);
    this.storage.setItem(this.savedTokens, tokens);
    return Result.ok(token);
  }

  RemoveToken(token: SavedToken): Result<SavedToken> {
    if (!token) { return new Result(ResultStatus.Error, 'Invalid token'); }
    const tokens = this.GetSavedTokens();
    const index = tokens.map(t => t.hash).indexOf(token.hash);
    if (index < 0) { return new Result(ResultStatus.Error, 'Specified token was not found'); }
    tokens.splice(index, 1);
    this.storage.setItem(this.savedTokens, tokens);
    return Result.ok(token);
  }

  GetReceipt(hash: string): Observable<string> {
    return this.apiService.getReceipt(hash);
  }

  PostCall(createTransaction: any): Observable<any> {
    return this.apiService.postCallTransaction(createTransaction);
  }

  PostCreate(createTransaction: any): Observable<any> {
    return this.apiService.postCreateTransaction(createTransaction);
  }

  GetHistory(walletName: string, address: string): Observable<any> {
    return this.apiService.getAccountHistory(walletName, address);
  }

  GetBalance(walletName: string): Observable<any> {
    return this.apiService.getAccountBalance(walletName);
  }

  GetAddressBalance(address: string): Observable<any> {
    return this.apiService.getAddressBalance(address);
  }

  GetAddress(walletName: string): Observable<any> {
    return this.apiService.getAccountAddress(walletName);
  }

  GetAddresses(walletName: string): Observable<any> {
    return this.apiService.getAccountAddresses(walletName);
  }

  GetContracts(walletName: string): Observable<SmartContractsContractItem[]> {
    return of([
      new SmartContractsContractItem('7809', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 10898025),
      new SmartContractsContractItem('7810', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 11898025),
      new SmartContractsContractItem('7811', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 12898025),
      new SmartContractsContractItem('7812', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 13898025),
      new SmartContractsContractItem('7813', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 14898025),
      new SmartContractsContractItem('7814', 'Transfert', 'bbdbcae72f1085710', 'SdrP9wvxZmaG7t3UAjxxyB6RNT9FV1Z2Sn', 15898025),
    ]);
  }

  GetSenderAddresses(walletName: string): Observable<string[]> {
    return of([
      'SarP7wvxZmaG7t1UAjaxyB6RNT9FV1Z2Sn',
      'SbrP8wvxZmaG7t2UAjbxyB7RNT9FV1Z2Sn',
      'ScrP9wvxZmaG7t3UAjcxyB8RNT9FV1Z2Sn'
    ]);
  }

  GetParameterTypes(walletName: string): Observable<string[]> {
    return of([
      'Type 1',
      'Type 2',
      'Type 3'
    ]);
  }
}
