import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { delay, map, tap, catchError } from 'rxjs/operators';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  private timer: Subscription;
  private _user = new BehaviorSubject<any>(null);
  user$: Observable<any> = this._user.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    window.addEventListener('storage', this.storageEventListener.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageEventListener.bind(this));
  }

  login(mail: string, password: string) {
    return this.http
      .post<any>(`${AUTH_SERVER}/account/ingreso`, { mail, password }, this.httpOptions)
      .pipe(
        catchError(this.handleError),
        map((x) => {
          this.setLocalStorage(x);
          this.startTokenTimer();
          this._user.next(x.usuario);
          return x;
        })
      );
  }

  logout() {
    this.clearLocalStorage();
    this._user.next(null);
    this.stopTokenTimer();
    this.router.navigate(['sicdmin']);
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('access_token');
    if (!refreshToken) {
      this.clearLocalStorage();
      return of(null);
    }

    return this.http
      .post<any>(`${AUTH_SERVER}/account/refresh-token`, { refreshToken })
      .pipe(
        map((x) => {
          this._user.next(x.usuario);
          this.setLocalStorage(x);
          this.startTokenTimer();
          return x;
        })
      );
  }

  clearLocalStorage() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.setItem('logout-event', 'logout' + Math.random());
  }

  private setLocalStorage(x: any) {
    localStorage.setItem('access_token', x.accessToken);
    localStorage.setItem('refresh_token', x.refreshToken);
    localStorage.setItem('login-event', 'login' + Math.random());
  }

  private storageEventListener(event: StorageEvent) {
    if (event.storageArea === localStorage) {
      if (event.key === 'logout-event') {
        this.stopTokenTimer();
        this._user.next(null);
      }
      if (event.key === 'login-event') {
        this.stopTokenTimer();

      }
    }
  }

  private startTokenTimer() {
    const timeout = this.getTokenRemainingTime();
    this.timer = of(true)
      .pipe(
        delay(timeout),
        tap(() => this.refreshToken().subscribe())
      )
      .subscribe();
  }

  private getTokenRemainingTime() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return 0;
    }
    const jwtToken = JSON.parse(atob(accessToken.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    return expires.getTime() - Date.now();
  }

  private stopTokenTimer() {
    this.timer?.unsubscribe();
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.message);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

}
