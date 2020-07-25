import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ValoresService {

  constructor(private httpClient: HttpClient) { }

  listarValores(): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/listar-valores/`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      // 'authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken}`
    })
  };
}
