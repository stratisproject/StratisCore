import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { GlobalService } from "@shared/services/global.service";
import { ModalService } from "@shared/services/modal.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class RestApi {
  protected API_URL;

  constructor(
    globalService: GlobalService,
    private httpClient: HttpClient,
    private modalService: ModalService,
    private router: Router) {
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
        "Accept": accept,
        "Content-Type": contentType,

      }),
      params: httpParams
    }
  }

  public get<TResult>(path: string, params?: HttpParams, accept: string = "application/json", contentType: string = "application/json"): Observable<TResult> {
    let options = this.getHttpOptions(accept, contentType, params);
    return <Observable<TResult>>this.httpClient.get(`${this.API_URL}/${path}`, options)
  }

  public post<TResult>(path: string, body: any, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>("post", path, body, contentType);
  }

  public put<TResult>(path: string, body: any, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>("put", path, body, contentType);
  }

  public delete<TResult>(path: string, params?: HttpParams, contentType?: string): Observable<TResult> {
    return this.executeHttp<TResult>("delete", path, null, contentType, params);
  }

  protected executeHttp<TResult>(method: string, path: string, body: any, contentType?: string, params?: HttpParams): Observable<TResult> {
    return <Observable<TResult>>this.httpClient[method]
    (`${this.API_URL}/${path}`, body, this.getHttpOptions("application/json", contentType || "application/json", params));
  }

  protected handleHttpError(error: HttpErrorResponse, silent?: boolean) {
    console.log(error);
    if (error.status === 0) {
      if (!silent) {
        this.modalService.openModal(null, null);
        this.router.navigate(['app']);
      }
    } else if (error.status >= 400) {
      if (!error.error.errors[0].message) {
        console.log(error);
      } else {
        this.modalService.openModal(null, error.error.errors[0].message);
      }
    }
    return throwError(error);
  }
}

