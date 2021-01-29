import { Injectable } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { environment } from '../../../environments/environment';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = localStorage.getItem('access_token');
    const isApiUrl = request.url.startsWith(environment.baseUrl);
    if (accessToken && isApiUrl) {
      request = request.clone({
        setHeaders: { authorization: `Bearer ${accessToken}` },
      });
    }

    return next.handle(request);
  }
}
