import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { EstadoCuentaH } from '../../representante/model/deuda';
import { RepresentanteI, RepresentantesResponse } from '../../representante/model/representante';
import { PDFClass } from '../../../utilidades/pdf';
import { RepresentanteService } from '../../representante/service/representante.service';
import { SitioService } from '../../sitio/service/sitio.service';
import { ServiceC } from '../../sitio/service-c/sitio-serviceC';
import { DialogEstadoCuenta } from '../../sitio/dialog/editar-estado-cuenta/editar-estado-cuenta';
import { DialogRegistrarSitio } from '../../sitio/dialog/registrar-sitio/registrar-sitio';
import { DialogRegistroDeuda } from '../../representante/dialog/registro-deuda/dialog-registro-deuda';
import { DialogPagoExtra } from '../../representante/dialog/registro-pago-extra/dialog-pago-extra';
import { ResponseSitioI } from '../../sitio/model/sitio';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-EC' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class HistorialComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumnsEC: string[] = ['fecha', 'sector', 'descripcion', 'cargos', 'abonos', 'pendientes', 'acciones'];

  dataSourceEC: MatTableDataSource<EstadoCuentaH>;

  listaEstadoCuenta: EstadoCuentaH[] = [];
  representante: RepresentanteI;

  sitios: number = 0;

  id: string;
  locale: string;
  fecha: Date = new Date();

  pdf: PDFClass;

  private _translate: any;
  private _cargarHistorial: any;
  private _cargarRepresentante: any;
  private _cargosSitio: any;
  private _eliminar: any;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private apiRepresentante: RepresentanteService,
    private apiSitio: SitioService,
    private notsitio: ServiceC,
    private dialog: MatDialog,
    private route: ActivatedRoute) {
    this.pdf = new PDFClass(http);
    route.paramMap.pipe(
      tap((data: ParamMap) => {
        const representante = data.get("id");
        this.id = atob(representante);
        this.obtenerHistorial();
      })
    ).toPromise();
    notsitio.actualizarHistorial$.pipe(
      tap((x: any) => this.obtenerHistorial())
    ).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang)
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
      this._cargarHistorial.unsubscribe();
      this._cargarRepresentante.unsubscribe();
      this._cargosSitio.unsubscribe();
    } catch (error) { }
  }

  imprimirLista = (): void =>
    this.pdf.jojo(this.procesarDatosImprimir(this.listaEstadoCuenta), 'print', {
      nombre: 'Jhonatan Stalin Salazar Hurtado',
      representante: this.representante?.nombre,
      cedula: this.representante?.cedula,
      tipo: 'Comprobante',
      descripcion: 'Estado de cuenta',
      codigo: ''
    }, 'abonos_y_cargos')


  imprimir = (row: EstadoCuentaH): void =>
    this.pdf.jojo(this.procesarDatosImprimir([row]), 'print', {
      nombre: 'Jhonatan Stalin Salazar Hurtado',
      representante: this.representante?.nombre,
      cedula: this.representante?.cedula,
      tipo: 'Comprobante',
      descripcion: row.estado_cuenta,
      codigo: ''
    }, row.estado_cuenta)


  editar = (row: any): void => {
    row.pago = String(row.pago).toLowerCase();
    const dialogRef = this.dialog.open(DialogEstadoCuenta, { width: '350px', panelClass: "my-class", data: row });
    dialogRef.afterClosed().subscribe();
  }

  eliminarEstadoCuenta = (row: any): void => this.eliminar([row]);

  agregarSitio = (): void => {
    const dialogRef = this.dialog.open(DialogRegistrarSitio, { width: '500px', panelClass: "my-class", data: this.id });
    dialogRef.afterClosed().subscribe();
  }

  agregarDeuda(): void {
    const dialogRef = this.dialog.open(DialogRegistroDeuda, { width: '500px', panelClass: "my-class", data: { id: this.id } });
    dialogRef.afterClosed().subscribe();
  }

  agregarPago(): void {
    const dialogRef = this.dialog.open(DialogPagoExtra, { panelClass: "my-class", data: { id: this.id } });
    dialogRef.afterClosed().subscribe();
  }

  getDeudas = (): number => this.listaEstadoCuenta
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'cargo' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.cantidad), 0);

  getPagos = (): number => this.listaEstadoCuenta
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'abono' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.cantidad), 0);

  getPendiente = (): number => this.listaEstadoCuenta
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'cargo' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.pendiente), 0);

  private procesarDatosImprimir = (data: EstadoCuentaH[]) =>
    data.map((x: EstadoCuentaH) => {
      return {
        fecha: x.fecha,
        lugar: x.tipo,
        motivo: x.descripcion,
        sector: x.sector,
        descripcion: x.pago,
        estado_cuenta: x.estado_cuenta,
        cantidad: x.cantidad,
        pendiente: x.estado_cuenta == 'abono' ? '' : x.pendiente
      }
    })

  private eliminar(data): void {
    this._eliminar = this.apiSitio.eliminarEstadoCuenta(data)
      .subscribe((x: any) => {
        if (x.ok) {
          this.obtenerHistorial();
          this.openSnackBar("Registros eliminados correctamente", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
        }
      });
  }

  private obtenerHistorial(): void {
    if (!this.id) return;
    this.sitios = 0;
    this.cargarHistorial(this.id);
    this.cargarSitios(this.id);
    this.cargarRepresentante(this.id);
  }

  private cargarRepresentante(id: string): void {
    this._cargarRepresentante = this.apiRepresentante.obtenerRepresentante(id)
      .subscribe((data: RepresentantesResponse) => {
        if (data.ok) { this.representante = data.data[0]; }
        else { this.openSnackBar(data.message, "ok"); }
      });
  }

  private cargarHistorial(id: string): void {
    this._cargarHistorial = this.apiRepresentante.obtenerEstadoCuentaRepresentante(id)
      .subscribe((data: any) => {
        if (data.ok) { this.cargarValoresEstadoCuenta(data.data); }
        else { this.openSnackBar(data.message, "ok"); }
      });
  }

  private cargarSitios(id: string): void {
    this._cargosSitio = this.apiSitio.listarSitios(id)
      .subscribe((data: ResponseSitioI) => {
        if (data.ok) { this.sitios = data.cant; }
        else { this.openSnackBar(data.message, "ok"); }
      });
  }

  private cargarValoresEstadoCuenta(data: EstadoCuentaH[]): void {
    this.listaEstadoCuenta = data.map((value: EstadoCuentaH) => {
      let nuevo: any = value;
      nuevo.hovered = false;
      nuevo.editar = false;
      return nuevo;
    });
    this.dataSourceEC = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSourceEC.paginator = this.paginator;
    this.dataSourceEC.sort = this.sort;
  }

  private openSnackBar = (m: string, a: string) => this._snackBar.open(m, a, { duration: 5000 });


}
