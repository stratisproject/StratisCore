import { Injectable } from '@angular/core';
import { LocalExecutionResult } from '@shared/models/local-execution-result';
import { ApiService } from '@shared/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LocalCallRequest } from '../models/LocalCallRequest';
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
      new Token('SDT', 'tCJgD1PEcUJBBBn9B6fbdkcQ9bzPBBW6A8', 'SRC-20 Standard Token')
    ];
  }

  UpdateTokens(tokens: SavedToken[]): Result<SavedToken[]> {
    this.storage.setItem(this.savedTokens, tokens);
    return Result.ok(tokens);
  }

  AddToken(token: SavedToken): Result<SavedToken> {
    if (!token) { return new Result(ResultStatus.Error, 'Invalid token'); }
    const tokens = this.GetSavedTokens();

    const index = tokens.map(t => t.address).indexOf(token.address);
    if (index >= 0) { return new Result(ResultStatus.Error, 'Specified token is already saved'); }

    tokens.push(token);
    this.storage.setItem(this.savedTokens, tokens);
    return Result.ok(token);
  }

  RemoveToken(token: SavedToken): Result<SavedToken> {
    if (!token) { return new Result(ResultStatus.Error, 'Invalid token'); }
    const tokens = this.GetSavedTokens();
    const index = tokens.map(t => t.address).indexOf(token.address);
    if (index < 0) { return new Result(ResultStatus.Error, 'Specified token was not found'); }
    tokens.splice(index, 1);
    this.storage.setItem(this.savedTokens, tokens);
    return Result.ok(token);
  }

  GetTokenBalance(request: TokenBalanceRequest): Observable<number> {
    return this.LocalCall(request).pipe(
      map(localExecutionresult => localExecutionresult.return ? localExecutionresult.return : 0)
    );
  }

  LocalCall(request: LocalCallRequest): Observable<LocalExecutionResult> {
    return this.apiService.localCall(request)
      .pipe(
        map(response => {
          // Temporary workaround for non-camel-cased API response          
          let anyResponse = (<any>response);
          let result = new LocalExecutionResult();
          result.gasConsumed = anyResponse.hasOwnProperty('GasConsumed') ? anyResponse.GasConsumed : anyResponse.gasConsumed;          
          result.return = anyResponse.hasOwnProperty('Return') ? anyResponse.Return : anyResponse.return;
          result.revert = anyResponse.hasOwnProperty('Revert') ? anyResponse.Revert : anyResponse.revert;
          result.logs = anyResponse.hasOwnProperty('Logs') ? anyResponse.Revert : anyResponse.logs;
          result.internalTransfers = anyResponse.hasOwnProperty('InternalTransfers') ? anyResponse.Revert : anyResponse.internalTransfers;
          return result;
        })
      );
  }
}
