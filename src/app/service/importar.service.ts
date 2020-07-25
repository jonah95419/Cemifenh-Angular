import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ImportarService {

  constructor(private httpClient: HttpClient) { }

  agregarImportacion(registros: any): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/api/importar-registros/`, JSON.stringify(registros), this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(
      'Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      // 'authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken}`
    })
  };
}
