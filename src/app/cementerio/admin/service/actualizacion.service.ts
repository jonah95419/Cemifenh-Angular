import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ActualizacionService {

  constructor(private httpClient: HttpClient) { }

  listarActualizacion = (): Observable<any> => {
    return this.httpClient
    .get<any>(`${AUTH_SERVER}/api/sync`)
    .pipe( catchError(this.handleError) )
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };

}
