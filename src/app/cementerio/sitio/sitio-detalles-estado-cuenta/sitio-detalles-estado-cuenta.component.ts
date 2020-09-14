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
import { SelectionModel } from '@angular/cdk/collections';
import { MatAccordion } from '@angular/material/expansion';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sitio-detalles-estado-cuenta',
  templateUrl: './sitio-detalles-estado-cuenta.component.html',
  styleUrls: ['./sitio-detalles-estado-cuenta.component.css']
})
export class SitioDetallesEstadoCuentaComponent implements OnInit {

  @ViewChild('accordion_abono') accordion: MatAccordion;
  @ViewChild('accordion_cargo') accordion_cargo: MatAccordion;
  @ViewChild('accordion_editar') accordion_editar: MatAccordion;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumnsEC: string[] = ['fecha', 'descripcion', 'cargos', 'abonos', 'acciones']; //'select',
  dataSource: MatTableDataSource<EstadoCuentaI>;
  selection = new SelectionModel<EstadoCuentaI>(true, []);

  id_sitio: string = "";
  locale: string;

  listaEstadoCuenta: EstadoCuentaI[] = [];

  agregarAbonoForm: FormGroup = this.fb.group({
    sitio: '',
    fecha: [new Date(), Validators.required],
    descripcion: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0)]]
  })

  agregarCargoForm: FormGroup = this.fb.group({
    sitio: '',
    renocacion: 0,
    desde: [new Date(), Validators.required],
    descripcion: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0)]]
  })

  editarForm: FormGroup = this.fb.group({
    id: '',
    sitio: '',
    renocacion: 0,
    transaccion: '',
    tipo: '',
    fecha: [new Date(), Validators.required],
    descripcion: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0)]]
  })

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private sc: ServiceC,
    private _snackBar: MatSnackBar,
    private apiSitio: SitioService,
    private fb: FormBuilder,) {
    route.queryParamMap.pipe(
      tap((data: ParamMap) => {
        if (data.get("id")) {
          const sitio = data.get("id");
          this.obtenerValores(sitio);
        }
      })).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe(
      tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
    ).toPromise();
  }

  get agregarAbonoFormControl() {
    return this.agregarAbonoForm.controls;
  }

  get agregarCargoFormControl() {
    return this.agregarCargoForm.controls;
  }

  get editarFormControl() {
    return this.editarForm.controls;
  }

  submitAbono = (): void => {
    if (this.agregarAbonoForm.valid) {
      this.apiSitio.agregarPago([this.agregarAbonoForm.value])
        .pipe(tap(data => {
          if (data.ok) {
            this.openSnackBar("Abono registrado!! ", "ok");
            this.obtenerValores(this.id_sitio);
          } else {
            this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente ", "ok");
          }
          this.cancelarSubmitAbono();
        })).toPromise();
    }
  }

  submitCargo = (): void => {
    if (this.agregarCargoForm.valid) {
      this.apiSitio.agregarDeuda([this.agregarCargoForm.value])
        .pipe(tap(data => {
          if (data.ok) {
            this.openSnackBar("Cargo registrado!! ", "ok");
            this.obtenerValores(this.id_sitio);
          } else {
            this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente ", "ok");
          }
          this.cancelarSubmitCargo();
        })).toPromise();
    }
  }


  eliminarLista = (): void => this.eliminar(this.selection.selected);

  eliminarEstadoCuenta = (row: any): void => this.eliminar([row]);

  editar = (row: EstadoCuentaI) => {
    this.editarForm.patchValue(row);
    this.editarForm.controls.tipo.setValue(row.estado_cuenta);
    this.editarForm.controls.sitio.setValue(this.id_sitio);
    this.accordion_editar.openAll();
  }

  submitEditar = (): void => {
    if (this.editarForm.valid) {
      this.apiSitio.actualizarSitioEstadoCuenta(this.editarForm.value)
        .pipe(tap(data => {
          if (data.ok) {
            this.openSnackBar("Registro actualizado!! ", "ok");
            this.obtenerValores(this.id_sitio);
          } else {
            this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente ", "ok");
          }
          this.cancelarSubmitEditar();
        })).toPromise();
    }
  }

  cancelarSubmitAbono(): void {
    this.accordion.closeAll();
    this.agregarAbonoForm.reset();
    this.agregarAbonoForm.controls.fecha.setValue(new Date());
    this.agregarAbonoForm.controls.sitio.setValue(this.id_sitio);
  }

  cancelarSubmitCargo(): void {
    this.accordion_cargo.closeAll();
    this.agregarCargoForm.reset();
    this.agregarCargoForm.controls.desde.setValue(new Date());
    this.agregarCargoForm.controls.sitio.setValue(this.id_sitio);
  }

  cancelarSubmitEditar(): void {
    this.accordion_editar.closeAll();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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
          this.obtenerValores(this.id_sitio);
          this.openSnackBar("Registros eliminados correctamente", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  private obtenerValores(id_sitio: string) {
    this.id_sitio = id_sitio;
    this.selection.clear();
    this.agregarAbonoForm.controls.sitio.setValue(this.id_sitio);
    this.agregarCargoForm.controls.sitio.setValue(this.id_sitio);
    this.sc.emitIdSitioDetalleChange(Number(this.id_sitio));
    this.apiSitio.obtenerEstadoCuenta(this.id_sitio).pipe(
      tap((data: ResponseEstadoCuentaSitioI) => {
        if (data.ok) {
          this.cargarValoresEstadoCuenta(data.data);
        } else {
          console.log(data.message);
        }
      })).toPromise();
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

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
