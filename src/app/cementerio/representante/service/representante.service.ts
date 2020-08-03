import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RepresentanteResponse, RepresentanteI } from '../model/representante';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResponseDeudaRepresentanteI } from '../model/deuda';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class RepresentanteService {

  constructor(private httpClient: HttpClient, private _snackBar: MatSnackBar) { }

  private _representantes = new BehaviorSubject<RepresentanteI[]>([]);
  private dataStore: { representantes: RepresentanteI[] } = { representantes: [] };
  readonly representantes = this._representantes.asObservable();

  listarRepresentantes = (): void => {
    this.httpClient
      .get<RepresentanteResponse>(`${AUTH_SERVER}/representante/`, this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((data: RepresentanteResponse) => {
        if (data.ok) {
          this.dataStore.representantes = data.data;
          this._representantes.next(Object.assign({}, this.dataStore).representantes);
        } else {
          console.log("mostar mensaje de error");
        }
      });
  }

  listarRepresentantesPeriodo = (desde: string, hasta: string): void => {
    this.httpClient
      .get<RepresentanteResponse>(`${AUTH_SERVER}/representante/periodo/${desde}&${hasta}`, this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((data: RepresentanteResponse) => {
        if (data.ok) {
          this.dataStore.representantes = data.data;
          this._representantes.next(Object.assign({}, this.dataStore).representantes);
        } else {
          console.log("mostar mensaje de error");
        }
      });
  }

  listarRepresentantesSinSitio = (): Observable<RepresentanteResponse> => {
    return this.httpClient
      .get<RepresentanteResponse>(`${AUTH_SERVER}/representante/sin-sitio/`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerEstadoCuentaRepresentante(id: string): Observable<any> {
    return this.httpClient
      .get<any>(`${AUTH_SERVER}/representante/estado-cuenta/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerDeudasRepresentante(id: string): Observable<ResponseDeudaRepresentanteI> {
    return this.httpClient
    .get<ResponseDeudaRepresentanteI>(`${AUTH_SERVER}/representante/deudas/${id}`, this.httpOptions)
    .pipe(catchError(this.handleError));
  }







  obtenerPagoDetallesRepresentante(comprobanteID: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/representante/pago-detalles/${comprobanteID}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerPagosRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/representante/pagos/${representanteId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerRepresentante(representanteId: number): Observable<any> {
    return this.httpClient.get<any>(`${AUTH_SERVER}/representante/${representanteId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }





  agregarRepresentante(representante: any) {
    this.httpClient
      .post<any>(`${AUTH_SERVER}/representante/`, JSON.stringify(representante), this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe(data => {
        console.log(data);
        this.dataStore.representantes.push(this.cargarRegistro(representante, data));
        this.openSnackBar('Registro creado', 'ok');
        this._representantes.next(Object.assign({}, this.dataStore).representantes);
      })
  }

  private cargarRegistro(registro, result) {
    return {
      id: result.data.r,
      nombre: registro.representante.nombre,
      cedula: registro.representante.cedula,
      observaciones: "",
      fecha: registro.sitio ? registro.sitio.fechaAdquisicion : "",
      estado: true,
    }
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(
      'Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // 'authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken}`
    })
  };
}
