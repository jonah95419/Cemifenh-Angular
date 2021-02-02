import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { RepresentantesResponse } from '../cementerio/representante/model/representante';
import { catchError } from 'rxjs/operators';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class CallbackService {

  constructor(private httpClient: HttpClient) { }

  listarRepresentantesNombre = (nombre: string): Observable<any> => {
    return this.httpClient
      .get<RepresentantesResponse>(`${AUTH_SERVER}/api/public/representantes/nombre/${nombre}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  listarRepresentantesCI = (ci: string): Observable<any> => {
    return this.httpClient
      .get<RepresentantesResponse>(`${AUTH_SERVER}/api/public/representantes/ci/${ci}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };
}
