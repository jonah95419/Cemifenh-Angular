import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Params } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';
import { tap } from 'rxjs/operators';
import { ServiceC } from '../../sitio/service-c/sitio-serviceC';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { DialogEstadoCuenta } from '../../sitio/dialog/editar-estado-cuenta/editar-estado-cuenta';
import { DialogRegistroDeuda } from '../dialog/registro-deuda/dialog-registro-deuda';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitioService } from '../../sitio/service/sitio.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogPagoExtra } from '../dialog/registro-pago-extra/dialog-pago-extra';
import { RepresentantesResponse, RepresentanteI } from '../model/representante';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { PDFClass } from '../../../utilidades/pdf';
import { EstadoCuentaH } from '../model/deuda';

@Component({
  selector: 'app-estado-cuenta',
  templateUrl: './estado-cuenta.component.html',
  styleUrls: ['./estado-cuenta.component.css'],
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
export class EstadoCuentaComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumnsEC: string[] = ['fecha', 'sector', 'descripcion', 'cargos', 'abonos', 'pendientes', 'acciones'];

  dataSourceEC: MatTableDataSource<EstadoCuentaH>;

  listaEstadoCuenta: EstadoCuentaH[] = [];
  representante: RepresentanteI;

  id: string;
  locale: string;
  fecha: Date = new Date();

  pdf: PDFClass;

  private _translate: any;
  private _params: any;
  private _estado_cuenta: any;
  private _representante: any;
  private _eliminar_estado_cuenta: any;

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
    this._params = route.parent.params.subscribe((data: Params) => {
      if (data.id) {
        const representante = data.id;
        this.id = representante;
        this.obtenerHistorial();
      }
    });
    notsitio.actualizarHistorial$.pipe(
      tap((x: any) => this.obtenerHistorial())
    ).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang);
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
      this._params.unsubscribe();
      this._estado_cuenta.unsubscribe();
      this._representante.unsubscribe();
      this._eliminar_estado_cuenta.unsubscribe();
    } catch (error) {
    }
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

  editar = (row: any) => {
    row.pago = String(row.pago).toLowerCase();
    const dialogRef = this.dialog.open(DialogEstadoCuenta, { width: '350px', panelClass: "my-class", data: row });
    dialogRef.afterClosed().subscribe();
  }

  eliminarEstadoCuenta = (row: any): void => this.eliminar([row]);

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
      panelClass: "my-class",
      data: { id: this.id }
    });

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
    this._eliminar_estado_cuenta = this.apiSitio.eliminarEstadoCuenta(data)
      .subscribe((x: any) => {
        if (x.ok) {
          this.obtenerHistorial();
          this.openSnackBar("Registros eliminados correctamente", "ok");
        }
        else { this.openSnackBar(x.message, "ok"); }
      });
  }

  private obtenerHistorial(): void {
    if (!this.id) return;
    this.notsitio.emitIdSitioDetalleChange(null);
    this.cargarHistorial(this.id);
    this.cargarRepresentante(this.id);
  }

  private cargarRepresentante(id: string): void {
    this._representante = this.apiRepresentante.obtenerRepresentante(id)
      .subscribe((data: RepresentantesResponse) => {
        if (data.ok) { this.representante = data.data[0]; }
        else { this.openSnackBar(data.message, "ok"); }
      });
  }

  private cargarHistorial(id: string): void {
    this._estado_cuenta = this.apiRepresentante.obtenerEstadoCuentaRepresentante(id)
      .subscribe((data: any) => {
        if (data.ok) { this.cargarValoresEstadoCuenta(data.data); }
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

