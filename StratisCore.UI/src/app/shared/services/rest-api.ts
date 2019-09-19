import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { ErrorService } from '@shared/services/error-service';

@Injectable({
  providedIn: 'root'
})
export class RestApi {
  protected API_URL;

  constructor(
    protected globalService: GlobalService,
    protected httpClient: HttpClient,
    protected errorService: ErrorService
  ) {
    this.API_URL = `http://${globalService.getDaemonIP()}:${globalService.getApiPort()}/api`;
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

  public get<TResult>(path: string, params?: HttpParams, accept: string = 'application/json', contentType: string = 'application/json'): Observable<TResult> {
    const options = this.getHttpOptions(accept, contentType, params);
    return <Observable<TResult>>this.httpClient.get(`${this.API_URL}/${path}`, options);
  }

  public delete<TResult>(path: string, params?: HttpParams, accept: string = 'application/json', contentType: string = 'application/json'): Observable<TResult> {
    const options = this.getHttpOptions(accept, contentType, params);
    return <Observable<TResult>>this.httpClient.delete(`${this.API_URL}/${path}`, options);
  }

  public post<TResult>(path: string, body: any, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>('post', path, body, contentType);
  }

  public put<TResult>(path: string, body: any, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>('put', path, body, contentType);
  }

  protected executeHttp<TResult>(method: string, path: string, body: any, contentType?: string, params?: HttpParams): Observable<TResult> {
    return <Observable<TResult>>this.httpClient[method]
    (`${this.API_URL}/${path}`, body, this.getHttpOptions('application/json', contentType || 'application/json', params));
  }

  protected handleHttpError(error: HttpErrorResponse, silent?: boolean) {
    return this.errorService.handleHttpError(error, silent);
  }
}

