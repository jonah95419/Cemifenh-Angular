import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, publish, refCount, shareReplay, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ImportarService {

  constructor(private httpClient: HttpClient) { }

  agregarImportacion(registros: any): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/importar/`, JSON.stringify(registros), this.httpOptions)
      //.timeout(3000, new Error('timeout exceeded'))
      .pipe(
        timeout(3000000),
        catchError(this.handleError),
        shareReplay(1),
        publish(),
        refCount()
      );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(
      'Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json', 'Keep-Alive': 'timeout=560',
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };
}
