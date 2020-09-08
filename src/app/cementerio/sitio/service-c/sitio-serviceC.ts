import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceC {

  constructor() { }

  private idSitioDetalle$ = new Subject<number>();
  sitioDetalle$ = this.idSitioDetalle$.asObservable();
  emitIdSitioDetalleChange(id_sitio: number) {this.idSitioDetalle$.next(id_sitio);}

  private historialActualizar$ = new Subject<number>();
  actualizarHistorial$ = this.historialActualizar$.asObservable();
  emitActualizarHistorialChange() {this.historialActualizar$.next();}

}
