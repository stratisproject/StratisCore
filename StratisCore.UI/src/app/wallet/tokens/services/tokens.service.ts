import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { Observable, of } from 'rxjs';

import { ContractTransactionItem, SmartContractsContractItem } from '../../smart-contracts/smart-contracts.service';
import { Result, ResultStatus } from '../models/Result';
import { SavedToken, Token } from '../models/token';
import { StorageService } from './storage.service';
import { TokenBalanceRequest } from '../models/token-balance-request';
import { map } from 'rxjs/operators';

@Injectable()
export class TokensService {
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

  GetTokenBalance(request: TokenBalanceRequest): Observable<number> {
    return this.apiService.localCall(request).pipe(
      map(localExecutionresult => localExecutionresult.return ? localExecutionresult.return : 0)
    );
  }
}
