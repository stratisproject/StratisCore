import { ModalService } from '@shared/services/modal.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private modalService: ModalService,
              private router: Router) {
  }

  public handleHttpError(error: HttpErrorResponse, silent?: boolean): Observable<never> {
    console.log(error);
    if (error.status === 0) {
      if (!silent) {
        this.modalService.openModal(null, null);
        this.router.navigate(['app']);
      }
    } else if (error.status >= 400) {
      if (!error.error.errors[0].message) {
      } else {
        this.modalService.openModal(null, error.error.errors[0].message);
      }
    }
    return throwError(error);
  }

  public handleError(error: Error, silent?: boolean): Observable<never> {
    console.log(error);
    if (!silent) {
      this.modalService.openModal(null, null);
      this.router.navigate(['app']);
    }

    return throwError(error);
  }

}
