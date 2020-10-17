import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SitioService } from '../../service/sitio.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SitioI } from '../../model/sitio';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceC } from '../../service-c/sitio-serviceC';
import { SelectionModel } from '@angular/cdk/collections';
import { CargoSitioI, ResponseCargosSitioI } from '../../../representante/model/deuda';

@Component({
  selector: 'dialog-registro-abono',
  templateUrl: 'dialog-registro-abono.html',
  styleUrls: ['./dialog-registro-abono.css'],
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
export class DialogRegistroAbono implements OnInit, OnDestroy {

  @ViewChild('table', { static: false }) table: MatTable<any>;

  sitios: SitioI[] = [];

  columnsToDisplayCargos: string[] = ['select', 'fecha', 'descripcion', 'deuda', 'pendiente'];
  columnsToDisplayCargosPagar: string[] = ['sitio', 'fecha', 'descripcion', 'deuda', 'pendiente', 'accion'];
  dataSourceCargos = new MatTableDataSource<CargoSitioI>([]);

  selection = new SelectionModel<CargoSitioI>(true, []);
  seleccion: CargoSitioI[] = [];

  locale: string;
  sitio: number;
  fecha: Date = new Date();

  pagoForm = this.fb.group({
    deuda: new FormControl(''),
    descripcion: new FormControl(''),
    cantidad: new FormControl('', [Validators.required, Validators.min(0)]),
  })

  private _cargosSitio: any;
  private _transate: any;
  private _abonos: any;

  constructor(
    private translate: TranslateService,
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogRegistroAbono>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.cargarCargos(data.id);
  }

  onNoClick = (): void => this.dialogRef.close();

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._transate = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang);
  }

  ngOnDestroy(): void {
    try {
      this._cargosSitio.unsubscribe();
      this._transate.unsubscribe();
      this._abonos.unsubscribe();
    } catch (error) { }
  }

  get getTotalCost(): number { return this.seleccion.map((data: CargoSitioI) => Number(data.abono)).reduce((a, b) => a + b, 0) }

  seleccionToggle = (row: CargoSitioI): any => {
    if (this.rowSelected(row)) {
      this.seleccion = this.seleccion.filter((value: CargoSitioI) => value.id !== row.id)
    } else {
      let aux: any = row;
      aux.abono = row.pendiente;
      this.seleccion.push(aux);
    }
    this.table.renderRows();
  }

  rowSelected = (row: CargoSitioI): boolean => this.seleccion.filter((value: CargoSitioI) => value.id === row.id).length !== 0;

  enviarPago(): void {
    if (this.fecha !== undefined && this.seleccion.length !== 0) {
      this._abonos = this.apiSitio.agregarPago({fecha: this.fecha, data: this.seleccion})
        .subscribe((data) => {
          if (data.ok) {
            this.notSitio.emitActualizarHistorialChange();
            this.openSnackBar("Abono registrado!! ", "ok");
          } else {
            this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente ", "ok");
          }
          this.dialogRef.close();
        });
    } else {
      this.openSnackBar("Faltan campos por llenar", "ok");
    }
  }

  private cargarCargos(id: number): void {
    this.sitio = id;
    this._cargosSitio = this.apiSitio.obtenerCargosCuenta(this.sitio)
      .subscribe((result: ResponseCargosSitioI) => {
        if (result.ok) {
          this.dataSourceCargos.data = result.data;
        } else {
          this.openSnackBar(result.message, "ok");
        }
      })
  }

  private openSnackBar = (m: string, a: string) => this._snackBar.open(m, a, { duration: 5000 });


}
