import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Result, ResultStatus } from '../models/result';
import { SavedToken, Token } from '../models/token';
import { TokenBalanceRequest } from '../models/token-balance-request';
import { StorageService } from './storage.service';

@Injectable()
export class TokensService {
  private savedTokens = 'savedTokens';

  constructor(private apiService: ApiService, private storage: StorageService) { }

  GetSavedTokens(): SavedToken[] {
    return this.storage.getItem<SavedToken[]>(this.savedTokens) || [];
  }

  GetAvailableTokens(): Token[] {
    return [
      new Token('MYTK', 'tCJgD1PEcUJBBBn9B6fbdkcQ9bzPBBW6A8')
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

  GetTokenBalance(request: TokenBalanceRequest): Observable<number> {
    return this.apiService.localCall(request).pipe(
      map(localExecutionresult => localExecutionresult.return ? localExecutionresult.return : 0)
    );
  }
}
