import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class FallecidoService {

  constructor(private httpClient: HttpClient) { }

  agregarFallecido(fallecido: FallecidoI): Observable<any> {
    return this.httpClient.post<any>(`${AUTH_SERVER}/fallecido/`, JSON.stringify(fallecido), this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  listarFallecidosRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/representante/listar-fallecidos/${representanteId}`, this.httpOptions)
    .pipe(
      catchError(this.handleError)
    );
  }

  listarFallecidos(sitioId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/fallecido/${sitioId}`, this.httpOptions)
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

interface FallecidoI {
  sitio: number;
  nombre: string;
  cedula: string;
  fecha: Date;
  observaciones: string;
}
