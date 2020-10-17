import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ServiceC } from '../service-c/sitio-serviceC';
import { ResponseEstadoCuentaSitioI, EstadoCuentaI } from '../model/sitio';
import { SitioService } from '../service/sitio.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogEstadoCuenta } from '../dialog/editar-estado-cuenta/editar-estado-cuenta';
import { DialogRegistroCargo } from '../dialog/registro-cargo/dialog-registro-cargo';
import { DialogRegistroAbono } from '../dialog/registro-abono/dialog-registro-abono';

@Component({
  selector: 'app-sitio-detalles-estado-cuenta',
  templateUrl: './sitio-detalles-estado-cuenta.component.html',
  styleUrls: ['./sitio-detalles-estado-cuenta.component.css']
})
export class SitioDetallesEstadoCuentaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumnsEC: string[] = ['fecha', 'descripcion', 'cargos', 'abonos', 'pendientes', 'acciones'];
  dataSource: MatTableDataSource<EstadoCuentaI>;

  id_sitio: string = "";
  locale: string;

  listaEstadoCuenta: EstadoCuentaI[] = [];

  private _translate: any;
  private _pagos: any;
  private _deudas: any;
  private _eliminar: any;
  private _estado_cuenta: any;
  private _obtener_estado_cuenta: any;

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private apiSitio: SitioService,
    private notsitio: ServiceC) {
    route.queryParamMap.pipe(
      tap((data: ParamMap) => {
        if (data.get("id")) {
          const sitio = data.get("id");
          this.obtenerValores(sitio);
        }
      })).toPromise();
    notsitio.actualizarHistorial$.pipe(
      tap((x: any) => this.obtenerValores(this.id_sitio))
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
      this._pagos.unsubscribe();
      this._deudas.unsubscribe();
      this._eliminar.unsubscribe();
      this._estado_cuenta.unsubscribe();
      this._obtener_estado_cuenta.unsubscribe();
    } catch (error) { }
  }

  eliminarEstadoCuenta = (row: any): void => this.eliminar([row]);

  editar = (row: EstadoCuentaI) => {
    row.pago = String(row.pago).toLowerCase();
    const dialogRef = this.dialog.open(DialogEstadoCuenta, { width: '350px', panelClass: "my-class", data: row });
    dialogRef.afterClosed().subscribe();
  }

  agregarDeuda(): void {
    const dialogRef = this.dialog.open(DialogRegistroCargo, { width: '500px', panelClass: "my-class", data: { id: this.id_sitio } });
    dialogRef.afterClosed().subscribe();
  }

  agregarPago(): void {
    const dialogRef = this.dialog.open(DialogRegistroAbono, { panelClass: "my-class", data: { id: this.id_sitio } });
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

  private eliminar(data): void {
    this._eliminar = this.apiSitio.eliminarEstadoCuenta(data)
      .subscribe((x: any) => {
        if (x.ok) {
          this.obtenerValores(this.id_sitio);
          this.openSnackBar("Registros eliminados correctamente", "ok");
        } else {
          this.openSnackBar(x.message, "ok");
        }
      });
  }

  private obtenerValores(id_sitio: string) {
    this.id_sitio = id_sitio;
    this.notsitio.emitIdSitioDetalleChange(Number(this.id_sitio));
    this._obtener_estado_cuenta = this.apiSitio.obtenerEstadoCuenta(this.id_sitio)
      .subscribe((data: ResponseEstadoCuentaSitioI) => {
        if (data.ok) {
          this.cargarValoresEstadoCuenta(data.data);
        } else {
          this.openSnackBar(data.message, "ok");
        }
      });
  }

  private cargarValoresEstadoCuenta(data: EstadoCuentaI[]) {
    this.listaEstadoCuenta = data.map((d: EstadoCuentaI) => {
      let nuevo: any = {};
      nuevo = d;
      nuevo.hovered = false;
      return nuevo;
    });
    this.dataSource = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private openSnackBar = (m: string, a: string) => this._snackBar.open(m, a, { duration: 5000 })

}
