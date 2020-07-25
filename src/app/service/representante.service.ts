import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class RepresentanteService {

  constructor(private httpClient: HttpClient) { }

  agregarRepresentante(representante: RepresentanteI): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/api/agregar-representante/`, JSON.stringify(representante), this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  obtenerEstadoCuentaRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/obtener-estado-cuenta-representante/${representanteId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerDeudasRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/obtener-deudas-representante/${representanteId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerPagoDetallesRepresentante(comprobanteID: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/obtener-pago-detalles-representante/${comprobanteID}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerPagosRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/obtener-pagos-representante/${representanteId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  listarRepresentantes(): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/listar-representante/`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/api/obtener-representante/${representanteId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
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

interface RepresentanteI {
  representante: string;
  cedula: string;
}
