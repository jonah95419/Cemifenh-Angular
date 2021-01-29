import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private httpClient: HttpClient) { }

  reporteTransacciones(tipo: string, desde: string, hasta: string, sort: number, page: number): Observable<any> {
    return this.httpClient
      .get<any>(`${AUTH_SERVER}/reportes/${tipo}/${desde}&${hasta}&${sort}&${page}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!' + error.message);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };
}
