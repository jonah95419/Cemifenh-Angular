import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService, private router: Router) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request)
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.authService.logout();
            this.router.navigate(['/sicdmin']);
          }

          if (!environment.production) {
            console.error(err);
          }
          const error = (err && err.error && err.error.message) || err.statusText;
          return throwError(error);
        })
      );
  }
}
