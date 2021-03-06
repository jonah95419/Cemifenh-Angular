import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SitioService } from '../../service/sitio.service';
import { MatSelectChange } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceC } from '../../service-c/sitio-serviceC';
import { FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'dialog-registro-cargo',
  templateUrl: 'dialog-registro-cargo.html',
  styleUrls: ['./dialog-registro-cargo.css'],
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
export class DialogRegistroCargo implements OnInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<any>;

  listaDeudas: deudaComprobante[] = [];
  columnsToDisplay: string[] = ['sitio', 'descripcion', 'cantidad', 'accion'];

  locale: string;
  otros: boolean = false;
  sitio_id: number = -1;
  fecha: Date = new Date();

  pagoForm = this.fb.group({
    deuda: new FormControl(''),
    descripcion: new FormControl(''),
    cantidad: new FormControl('', [Validators.required, Validators.min(0)]),
  })

  private _translate: any;
  private _cargo: any;

  constructor(
    private _snackBar: MatSnackBar,
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<DialogRegistroCargo>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.sitio_id = data.id;
  }

  onNoClick = (): void => this.dialogRef.close();

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang);
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
      this._cargo.unsubscribe();
    } catch (error) {

    }
  }

  submit = (): void => {
    if (!this.pagoForm.valid) {
      this.openSnackBar("Faltan campos por llenar", "ok");
      return;
    }
    const value = this.pagoForm.value;
    let descripcion: string = value.deuda;
    if (this.otros) {
      if (value.descripcion === "" || value.cantidad === '') {
        this.openSnackBar("Faltan campos por llenar", "ok");
        return;
      } else {
        descripcion = value.descripcion;
      }
    }

    this.listaDeudas.push({
      descripcion,
      cantidad: value.cantidad,
      sitio: this.sitio_id
    });

    this.table.renderRows();
    this.pagoForm.reset();
  }

  motivoAbono = (event: MatSelectChange): void => {
    this.otros = event.value == 'otro' ? true : false;
  }

  eliminarDeuda = (deuda: deudaComprobante): void => {
    this.listaDeudas = this.listaDeudas.filter((d: deudaComprobante) => d !== deuda);
    this.table.renderRows();
  }

  get obtenerTotalDeudas(): number { return this.listaDeudas?.map((d: deudaComprobante) => d.cantidad).reduce((a, b) => a + b, 0); }

  guardarDeudas = (): void => {
    if (this.fecha !== undefined && this.listaDeudas.length !== 0) {
      let registros = this.listaDeudas.map((value: deudaComprobante) => {
        let nuevo: any = value;
        nuevo.desde = this.fecha;
        nuevo.renovacion = 1
        return nuevo;
      })

      this._cargo = this.apiSitio.agregarDeuda(registros)
        .subscribe((x: any) => {
          if (x.ok) {
            this.notSitio.emitActualizarHistorialChange();
            this.openSnackBar("Cargo registrado!!", "ok");
          } else {
            this.openSnackBar(x.message, "ok");
          }
          this.dialogRef.close();
        });
    }
  }

  private openSnackBar = (m: string, a: string) => this._snackBar.open(m, a, { duration: 5000 });

}

interface deudaComprobante {
  descripcion: string;
  cantidad: number;
  sitio: number;
}
