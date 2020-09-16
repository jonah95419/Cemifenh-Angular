import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FechasI, FechasResponse } from '../model/fechas';
import { ResponseSitioI, ResponseDeudaSitioI, SitioI, ResponseEstadoCuentaSitioI } from '../model/sitio';

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
      .post<any>(`${AUTH_SERVER}/sitio/`, JSON.stringify(sitio), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  agregarPago(pago: any): Observable<any> {
    return this.httpClient
      .post<any>(`${AUTH_SERVER}/sitio/pago`, JSON.stringify(pago), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  agregarDeuda(deuda: any): Observable<any> {
    return this.httpClient
      .post<any>(`${AUTH_SERVER}/sitio/deuda/`, JSON.stringify(deuda), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  actualizarSitio(sitio: any): Observable<any> {
    return this.httpClient
      .put<any>(`${AUTH_SERVER}/sitio/`, JSON.stringify(sitio), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  actualizarSitioEstadoCuenta(sitio: any): Observable<any> {
    return this.httpClient
      .put<any>(`${AUTH_SERVER}/sitio/estado-cuenta`, JSON.stringify(sitio), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  listarFechasSitios = () => {
    this.httpClient
      .get<FechasResponse>(`${AUTH_SERVER}/sitio/fechas/`, this.httpOptions)
      .subscribe((data: FechasResponse) => {
        if (data.ok) {
          this.dataStore.fechas = data.data;
          this._fechas.next(Object.assign({}, this.dataStore).fechas);
        } else {
          console.log("mostar mensaje de error");
        }
      })
  }

  listarSitios(representanteId: any): Observable<ResponseSitioI> {
    return this.httpClient
      .get<ResponseSitioI>(`${AUTH_SERVER}/sitio/representante/${representanteId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerSitio(sitioId: string): Observable<ResponseSitioI> {
    return this.httpClient
      .get<ResponseSitioI>(`${AUTH_SERVER}/sitio/${sitioId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerEstadoCuenta(sitioId: string): Observable<ResponseEstadoCuentaSitioI> {
    return this.httpClient
      .get<ResponseEstadoCuentaSitioI>(`${AUTH_SERVER}/sitio/estado-cuenta/${sitioId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  eliminarEstadoCuenta(data: any): Observable<any> {
    return this.httpClient
      .patch<any>(`${AUTH_SERVER}/sitio/`, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  eliminarSitio(sitio: any): Observable<any> {
    return this.httpClient
    .delete<any>(`${AUTH_SERVER}/sitio/${sitio}`, this.httpOptions)
    .pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };
}
