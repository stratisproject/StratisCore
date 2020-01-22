import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { ErrorService } from '@shared/services/error-service';

export class RestApi {
  protected API_URL;

  constructor(
    protected globalService: GlobalService,
    protected httpClient: HttpClient,
    protected errorService: ErrorService,
    apiUrl?: string) {
    this.API_URL =  apiUrl || `http://${globalService.getDaemonIP()}:${globalService.getApiPort()}/api`;
  }

  protected getHttpOptions(
    accept: string,
    contentType: string,
    httpParams?: HttpParams,
  ): {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    params?: HttpParams | {
      [param: string]: string | string[];
    };
  } {
    return {
      headers: new HttpHeaders({
        'Accept': accept,
        'Content-Type': contentType,

      }),
      params: httpParams
    };
  }

  public get<TResult>(path: string, params?: HttpParams, accept = 'application/json', contentType = 'application/json'): Observable<TResult> {
    const options = this.getHttpOptions(accept, contentType, params);
    return this.httpClient.get(`${this.API_URL}/${path}`, options) as Observable<TResult>;
  }

  public delete<TResult>(path: string, params?: HttpParams, accept = 'application/json', contentType = 'application/json'): Observable<TResult> {
    const options = this.getHttpOptions(accept, contentType, params);
    return this.httpClient.delete(`${this.API_URL}/${path}`, options) as Observable<TResult>;
  }

  public post<TResult>(path: string, body: any, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>('post', path, body, contentType);
  }

  public put<TResult>(path: string, body: any, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>('put', path, body, contentType);
  }

  protected executeHttp<TResult>(method: string, path: string, body: any, contentType?: string, params?: HttpParams): Observable<TResult> {
    return this.httpClient[method](`${this.API_URL}/${path}`, body, this.getHttpOptions('application/json', contentType || 'application/json', params)) as Observable<TResult>;
  }

  protected handleHttpError(error: HttpErrorResponse, silent?: boolean): Observable<any> {
    return this.errorService.handleHttpError(error, silent);
  }
}

