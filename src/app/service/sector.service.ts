import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SectorService {

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      // 'authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken}`
    })
  };

  constructor(private httpClient: HttpClient) { }

  listarSectores(): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/listar-sectores`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!');
  }
}
