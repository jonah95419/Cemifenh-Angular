import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ResponseSitioI } from '../../sitio/model/sitio';
import { EstadoCuentaH } from '../model/estadoCuentaR';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';

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
export class EstadoCuentaComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumnsEC: string[] = ['select', 'fecha', 'sector', 'descripcion', 'cargos', 'abonos', 'acciones'];

  dataSourceEC: MatTableDataSource<EstadoCuentaH>;
  selection = new SelectionModel<EstadoCuentaH>(true, []);

  listaEstadoCuenta: EstadoCuentaH[] = [];
  representante: RepresentanteI;

  id: string;
  locale: string;
  fecha: Date = new Date();

  private _translate;

  constructor(
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private apiRepresentante: RepresentanteService,
    private apiSitio: SitioService,
    private notsitio: ServiceC,
    private dialog: MatDialog,
    private route: ActivatedRoute) {
    route.parent.params.pipe( tap((data: Params) => {
      if(data.id) {
        const representante = data.id;
        this.id = representante;
        this.obtenerHistorial();
      }
    })).toPromise();
    notsitio.actualizarHistorial$.pipe(
      tap((x: any) => this.obtenerHistorial())
    ).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.pipe(
      tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
    ).toPromise();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceEC.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourceEC.data.forEach(row => this.selection.select(row));
  }

  imprimirLista = (): void => {

  }

  imprimir = (): void => {

  }

  editar = (row: any) => {
    row.pago = String(row.pago).toLowerCase();
    const dialogRef = this.dialog.open(DialogEstadoCuenta,{ width: '350px', panelClass: "my-class", data: row });
    dialogRef.afterClosed().subscribe();
  }

  eliminarLista = (): void => this.eliminar(this.selection.selected);

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
      width: '500px',
      panelClass: "my-class",
      data: { id: this.id }
    });

    dialogRef.afterClosed().subscribe();
  }

  getDeudas = (): number => this.listaEstadoCuenta
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'deuda' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.cantidad), 0);

  getPagos = (): number => this.listaEstadoCuenta
    .filter(t =>
      t.estado_cuenta.toLowerCase() !== 'deuda' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.cantidad), 0);


  private eliminar(data): void {
    this.apiSitio.eliminarEstadoCuenta(data).pipe(
      tap((x: any) => {
        if (x.ok) {
          this.obtenerHistorial();
          this.openSnackBar("Registros eliminados correctamente", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  private obtenerHistorial(): void {
    if (!this.id) return;
    this.notsitio.emitIdSitioDetalleChange(null);
    this.selection.clear();
    this.cargarHistorial(this.id);
    this.cargarRepresentante(this.id);
  }

  private cargarRepresentante(id: string): void {
    this.apiRepresentante.obtenerRepresentante(id).pipe(
      tap((data: RepresentantesResponse) => {
        if (data.ok) { this.representante = data.data[0]; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarHistorial(id: string): void {
    this.apiRepresentante.obtenerEstadoCuentaRepresentante(id).pipe(
      tap((data: any) => {
        if (data.ok) { this.cargarValoresEstadoCuenta(data.data); }
        else { console.log(data.message); }
      })
    ).toPromise();
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

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}

