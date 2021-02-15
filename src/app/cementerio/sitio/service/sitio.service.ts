import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FechasI, FechasResponse } from '../model/fechas';
import { ResponseSitioI, SitioI, ResponseEstadoCuentaSitioI } from '../model/sitio';
import { ResponseCargosSitioI } from '../../representante/model/deuda';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SitioService {

  constructor(private httpClient: HttpClient) { }

  private _fechas = new BehaviorSubject<FechasI[]>([]);
  private dataStore: { fechas: FechasI[] } = { fechas: [] };
  readonly fechas = this._fechas.asObservable();

  agregarSitio(sitio: SitioI): Observable<any> {
    return this.httpClient
      .post<any>(`${AUTH_SERVER}/api/sitio/`, JSON.stringify(sitio), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  agregarPago(pago: any): Observable<any> {
    return this.httpClient
      .post<any>(`${AUTH_SERVER}/api/sitio/pago`, JSON.stringify(pago), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  agregarDeuda(deuda: any): Observable<any> {
    return this.httpClient
      .post<any>(`${AUTH_SERVER}/api/sitio/deuda/`, JSON.stringify(deuda), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  actualizarSitio(sitio: any): Observable<any> {
    return this.httpClient
      .put<any>(`${AUTH_SERVER}/api/sitio/`, JSON.stringify(sitio), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  actualizarSitioEstadoCuenta(sitio: any): Observable<any> {
    return this.httpClient
      .put<any>(`${AUTH_SERVER}/api/sitio/estado-cuenta`, JSON.stringify(sitio), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  listarSitios(representanteId: any): Observable<ResponseSitioI> {
    return this.httpClient
      .get<ResponseSitioI>(`${AUTH_SERVER}/api/sitio/representante/${representanteId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerSitio(sitioId: string): Observable<ResponseSitioI> {
    return this.httpClient
      .get<ResponseSitioI>(`${AUTH_SERVER}/api/sitio/${sitioId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerEstadoCuenta(sitioId: number): Observable<ResponseEstadoCuentaSitioI> {
    return this.httpClient
      .get<ResponseEstadoCuentaSitioI>(`${AUTH_SERVER}/api/sitio/estado-cuenta/${sitioId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerCargosCuenta(sitioId: any): Observable<ResponseCargosSitioI> {
    return this.httpClient
      .get<ResponseCargosSitioI>(`${AUTH_SERVER}/api/sitio/cargos/${sitioId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  eliminarEstadoCuenta(data: any): Observable<any> {
    return this.httpClient
      .patch<any>(`${AUTH_SERVER}/api/sitio/`, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  eliminarSitio(sitio: any): Observable<any> {
    return this.httpClient
      .delete<any>(`${AUTH_SERVER}/api/sitio/${sitio}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };
}
