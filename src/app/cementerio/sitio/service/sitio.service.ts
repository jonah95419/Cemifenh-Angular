import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SitioService {

  constructor(private httpClient: HttpClient) { }

  agregarIngreso(ingreso: IngresoI): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/api/agregar-ingreso/`, JSON.stringify(ingreso), this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  agregarDeuda(deuda: DeudaI): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/api/agregar-deuda/`, JSON.stringify(deuda), this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  agregarComprobante(comprobante: ComprobanteI): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/api/agregar-comprobante/`, JSON.stringify(comprobante), this.httpOptions)
    .pipe(catchError(this.handleError));
  }



  agregarSitio(sitio: SitioI): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/sitio/`, JSON.stringify(sitio), this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  listarSitios(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/sitio/representante/${representanteId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerEstadoCuenta(sitioId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/sitio/estado-cuenta/${sitioId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerPagoDetalles(codigoId: number, sitioId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/sitio/pago-detalles/${codigoId}&${sitioId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerPagos(sitioId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/sitio/pagos/${sitioId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerDeudas(sitioId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/sitio/deudas/${sitioId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  obtenerSitio(sitioId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/sitio/${sitioId}`, this.httpOptions)
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

interface SitioI {
  representante: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  sector: number;
  fecha: Date;
  observaciones: string;
}

interface ComprobanteI {
  nombre: string;
  total: string;
  fecha: Date;
  observaciones: string;
}

interface DeudaI {
  sitio: number;
  valor: string;
  descripcion: string;
  desde: Date;
  hasta: Date;
  observaciones: string;
}

interface IngresoI {
  deuda: number;
  comprobante: number;
  cantidad: string;
}
