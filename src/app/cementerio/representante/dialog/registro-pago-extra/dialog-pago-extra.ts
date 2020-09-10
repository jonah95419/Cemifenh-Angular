import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SitioService } from '../../../sitio/service/sitio.service';
import { tap } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ResponseSitioI, SitioI, DeudaSitioI, ResponseDeudaSitioI } from '../../../sitio/model/sitio';
import { MatSelectChange } from '@angular/material/select';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { ValoresService } from '../../../../admin/service/valores.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceC } from '../../../sitio/service-c/sitio-serviceC';
import { SelectionChange } from '@angular/cdk/collections';

@Component({
  selector: 'dialog-pago-extra',
  templateUrl: 'dialog-pago-extra.html',
  styleUrls: ['./dialog-pago-extra.css'],
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
export class DialogPagoExtra implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  sitios: SitioI[] = [];
  listaPagos: deudaComprobante[] = [];
  columnsToDisplay: string[] = ['sitio','descripcion', 'cantidad', 'accion'];

  locale: string;
  otros: boolean = false;
  sitio: SitioI;
  fecha: Date = new Date();

  pagoForm = this.fb.group({
    deuda: new FormControl(''),
    descripcion: new FormControl(''),
    cantidad: new FormControl('', [Validators.required, Validators.min(0)]),
  })

  constructor(
    private translate: TranslateService,
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogPagoExtra>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.cargarSitios(data.id);
  }

  onNoClick(): void { this.dialogRef.close(); }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe( tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })).toPromise();
  }

  submit(): void {
    if(!this.pagoForm.valid) {
      return
    }
    const value = this.pagoForm.value;
    let descripcion: string = value.deuda;
    if(this.otros) {
      if(value.descripcion === "" || value.cantidad === "") {
        this.openSnackBar("Faltan campos por llenar", "ok");
        return;
      } else {
        descripcion = value.descripcion;
      }
    }

    this.listaPagos.push({
      descripcion,
      cantidad: value.cantidad,
      sitio: this.sitio.id
    });

    this.table.renderRows();
    this.pagoForm.reset();
  }

  motivoAbono = (event: MatSelectChange): void => {
    this.otros = event.value == 'otro' ? true : false;
  }

  eliminarPago(row: deudaComprobante): void {
    this.listaPagos = this.listaPagos.filter((d: deudaComprobante) => d !== row);
    this.table.renderRows();
  }

  getTotalCost = (): number => this.listaPagos?.map((t: deudaComprobante) => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);

  sitioSeleccionado(event: MatSelectChange): void {
    const value = event.source.value;
    if (value !== null) {
      this.sitio = value;
    }
  }

  enviarPago(): void {
    if (this.fecha !== undefined && this.listaPagos.length !== 0) {
      let registros = this.listaPagos.map((v: deudaComprobante) => {
        let nuevo: any = v;
        nuevo.fecha = this.fecha;
        return nuevo;
      });

      this.apiSitio.agregarPago(registros)
        .pipe( tap(data => {
            if (data.ok) {
              this.notSitio.emitActualizarHistorialChange();
              this.openSnackBar("Abono registrado!! ", "ok");
            } else {
              this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente ", "ok");
            }
            this.dialogRef.close();
          })).toPromise();
    } else {
      this.openSnackBar("Faltan campos por llenar", "ok");
    }

  }

  private cargarSitios(id: string): void {
    this.apiSitio.listarSitios(id).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) { this.sitios = data.data; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}

interface deudaComprobante {
  descripcion: string;
  cantidad: number;
  sitio: number;
}
