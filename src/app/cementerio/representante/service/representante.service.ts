import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RepresentantesResponse, RepresentanteI } from '../model/representante';
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

  listarRepresentantesTodo = (): void => {
    this.httpClient
      .get<RepresentantesResponse>(`${AUTH_SERVER}/representante/`, this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((data: RepresentantesResponse) => {
        if (data.ok) {
          this.dataStore.representantes = data.data;
          this._representantes.next(Object.assign({}, this.dataStore).representantes);
        } else {
          this.openSnackBar('A ocurrido un error, puedes intentarlo nuevamente en unos instantes.', 'ok');
        }
      });
  }

  listarRepresentantesPeriodo = (desde: string, hasta: string): void => {
    this.httpClient
      .get<RepresentantesResponse>(`${AUTH_SERVER}/representante/periodo/${desde}&${hasta}`, this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((data: RepresentantesResponse) => {
        if (data.ok) {
          this.dataStore.representantes = data.data;
          this._representantes.next(Object.assign({}, this.dataStore).representantes);
        } else {
          this.openSnackBar('A ocurrido un error, puedes intentarlo nuevamente en unos instantes.', 'ok');
        }
      });
  }

  obtenerEstadoCuentaRepresentante(id: string): Observable<ResponseDeudaRepresentanteI> {
    return this.httpClient
      .get<ResponseDeudaRepresentanteI>(`${AUTH_SERVER}/representante/estado-cuenta/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  obtenerRepresentante(representanteId: string): Observable<RepresentantesResponse> {
    return this.httpClient
      .get<RepresentantesResponse>(`${AUTH_SERVER}/representante/${representanteId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  agregarRepresentante(representante: any) {
    this.httpClient
      .post<any>(`${AUTH_SERVER}/representante/`, JSON.stringify(representante), this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe(data => {
        if(data.ok) {
          this.dataStore.representantes.push(this.cargarRegistro(representante, data));
        this.openSnackBar('Reprentante registrado', 'ok');
        this._representantes.next(Object.assign({}, this.dataStore).representantes);
        }
        else {
          this.openSnackBar('A ocurrido un error, puedes intentarlo nuevamente en unos instantes.', 'ok');
        }
      })
  }

  actualizarRepresentante(id, datos) {
    this.httpClient
    .put<any>(`${AUTH_SERVER}/representante/${id}`, JSON.stringify(datos), this.httpOptions)
    .pipe(catchError(this.handleError))
    .subscribe((data: RepresentantesResponse) => {
      if (data.ok) {
        this.dataStore.representantes.forEach((t, i) => {
          if (t.id === id) {
            this.dataStore.representantes[i].nombre = datos.nombre;
            this.dataStore.representantes[i].cedula = datos.cedula;
          }
        });
        this.openSnackBar('Registro actualizado', 'ok');
        this._representantes.next(Object.assign({}, this.dataStore).representantes);
      } else {
        this.openSnackBar('A ocurrido un error, puedes intentarlo nuevamente en unos instantes.', 'ok');
      }
    });
  }

  eliminarRepresentante(representante: any): Observable<any> {
    return this.httpClient
    .delete<any>(`${AUTH_SERVER}/representante/${representante}`, this.httpOptions)
    .pipe(catchError(this.handleError));
  }

  private cargarRegistro(registro, result) {
    return {
      id: result.id,
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
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };
}
