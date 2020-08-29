import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RepresentanteService } from '../../cementerio/representante/service/representante.service';
import { EstadoCuentaH } from '../../cementerio/representante/model/estadoCuentaR';
import { tap } from 'rxjs/operators';
import { SitioService } from '../../cementerio/sitio/service/sitio.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogPagoExtra } from '../../cementerio/representante/dialog/registro-pago-extra/dialog-pago-extra';
import { ResponseSitioI } from '../../cementerio/sitio/model/sitio';
import { RepresentanteI, RepresentantesResponse } from '../../cementerio/representante/model/representante';
import { DialogRegistroDeuda } from '../../cementerio/representante/dialog/registro-deuda/dialog-registro-deuda';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumnsEC: string[] = ['fecha', 'sector', 'descripcion', 'desde', 'cargos', 'abonos', 'accion', 'eliminar'];

  dataSourceEC: MatTableDataSource<EstadoCuentaH>;

  listaEstadoCuenta: EstadoCuentaH[] = [];
  representante: RepresentanteI;

  sitios: number = 0;

  id: string;
  locale: string;
  fecha: Date = new Date();

  private _translate;

  constructor(
    private translate: TranslateService,
    private apiRepresentante: RepresentanteService,
    private apiSitio: SitioService,
    private dialog: MatDialog,
    private route: ActivatedRoute) {
    route.paramMap.subscribe((data: ParamMap) => {
      const representante = data.get("id");
      this.obtenerHistorial(representante);
    })
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })

  }

  ngOnDestroy(): void {
    if (this._translate !== undefined) {
      this._translate.unsubscribe();
    }
  }

  agregarDeuda(): void {
    const dialogRef = this.dialog.open(DialogRegistroDeuda, {
      width: '500px',
      panelClass: "my-class",
      data: { id: this.id }
    });

    dialogRef.afterClosed().subscribe();
  }

  agregarPago(): void {
    const dialogRef = this.dialog.open(DialogPagoExtra, {
      width: '500px',
      panelClass: "my-class",
      data: { id: this.id }
    });

    dialogRef.afterClosed().subscribe();
  }

  getTotalEstadoCuenta(): number {
    let suma: number = 0;
    this.listaEstadoCuenta.forEach(t => {
      if (new Date(t.fecha) > new Date('2001/01/01')) {
        if (t.estado_cuenta === 'deuda') {
          suma += Number(t.cantidad);
        } else {
          if(t.pago === "Servicio" || t.pago === "Mantenimiento") {
            suma -= Number(t.cantidad);
          }
        }
      }
    });
    return suma;
  }

  getDeudasEstadoCuenta(): number {
    let suma: number = 0;
    this.listaEstadoCuenta.forEach(t => { if (t.estado_cuenta === 'deuda' && (new Date(t.fecha) > new Date('2001/01/01'))) { suma += Number(t.cantidad); } });
    return suma;
  }

  getPagos(): number {
    let suma: number = 0;
    this.listaEstadoCuenta.forEach(t => { if (t.estado_cuenta !== 'deuda' && (new Date(t.fecha) > new Date('2001/01/01')) ) { suma += Number(t.cantidad); } });
    return suma;
  }

  getPagosServicios(): number {
    let suma: number = 0;
    this.listaEstadoCuenta.forEach(t => { if (t.estado_cuenta !== 'deuda' && (new Date(t.fecha) > new Date('2001/01/01')) && t.desde !== null ) { suma += Number(t.cantidad); } });
    return suma;
  }

  getPagosExtras(): number {
    let suma: number = 0;
    this.listaEstadoCuenta.forEach(t => { if (t.estado_cuenta !== 'deuda' && t.desde === null) { suma += Number(t.cantidad); } });
    return suma;
  }

  private obtenerHistorial(id: string) {
    this.id = id;
    this.sitios = 0;
    this.cargarHistorial(id);
    this.cargarSitios(id);
    this.cargarRepresentante(id);
  }

  private cargarRepresentante(id: string) {
    this.apiRepresentante.obtenerRepresentante(id).pipe(
      tap((data: RepresentantesResponse) => {
        if (data.ok) { this.representante = data.data[0]; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarHistorial(id: string) {
    this.apiRepresentante.obtenerEstadoCuentaRepresentante(id).pipe(
      tap((data: any) => {
        if (data.ok) { this.cargarValoresEstadoCuenta(data.data); }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarSitios(id: string) {
    this.apiSitio.listarSitios(id).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) { this.sitios = data.cant; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarValoresEstadoCuenta(data: EstadoCuentaH[]) {
    this.listaEstadoCuenta = data;
    this.dataSourceEC = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSourceEC.paginator = this.paginator;
    this.dataSourceEC.sort = this.sort;
  }

}
