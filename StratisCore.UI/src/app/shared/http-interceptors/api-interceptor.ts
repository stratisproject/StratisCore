import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const finalReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json')
    });

    return next.handle(finalReq);
  }
}
