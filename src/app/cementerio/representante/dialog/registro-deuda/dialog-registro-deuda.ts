import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SitioService } from '../../../sitio/service/sitio.service';
import { ResponseSitioI, SitioI } from '../../../sitio/model/sitio';
import { tap } from 'rxjs/operators';
import { ValoresService } from '../../../../admin/service/valores.service';
import { ValorI } from '../../../../admin/model/valor';
import { MatSelectChange } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceC } from '../../../sitio/service-c/sitio-serviceC';
import { FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'dialog-registro-deuda',
  templateUrl: 'dialog-registro-deuda.html',
  styleUrls: ['./dialog-registro-deuda.css'],
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
export class DialogRegistroDeuda implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  sitios: SitioI[] = [];
  listaDeudas: deudaComprobante[] = [];
  columnsToDisplay: string[] = ['sitio', 'descripcion', 'cantidad', 'accion'];

  locale: string;
  otros: boolean = false;
  sitio: SitioI;
  fecha: Date = new Date();

  pagoForm = this.fb.group({
    deuda: new FormControl(''),
    descripcion: new FormControl(''),
    cantidad: new FormControl('', Validators.min(0)),
  })

  constructor(
    private _snackBar: MatSnackBar,
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<DialogRegistroDeuda>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.cargarSitios(data.id);
  }

  onNoClick = (): void => this.dialogRef.close();

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe(tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })).toPromise();
  }

  submit = (): void => {
    const value = this.pagoForm.value;
    let descripcion: string = value.deuda;
    if (this.otros) {
      if (value.descripcion === "") {
        this.openSnackBar("Faltan campos por llenar", "ok");
        return;
      } else {
        descripcion = value.descripcion;
      }
    }

    this.listaDeudas.push({
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

  eliminarDeuda = (deuda: deudaComprobante): void => {
    this.listaDeudas = this.listaDeudas.filter((d: deudaComprobante) => d !== deuda);
    this.table.renderRows();
  }

  obtenerTotalDeudas = (): number => this.listaDeudas?.map((d: deudaComprobante) => d.cantidad).reduce((a, b) => a + b, 0);

  sitioSeleccionado(event: MatSelectChange): void {
    const sitio = event.source.value;
    if (sitio !== null) {
      this.sitio = sitio;
    }
  }

  guardarDeudas = (): void => {
    if (this.fecha !== undefined && this.listaDeudas.length !== 0) {
      let registros = this.listaDeudas.map((value: deudaComprobante) => {
        let nuevo: any = value;
        nuevo.desde = this.fecha;
        nuevo.renovacion = value.descripcion.toLowerCase() === 'servicio' || value.descripcion.toLowerCase() === 'mantenimiento' ? 1 : 0
        return nuevo;
      })

      this.apiSitio.agregarDeuda(registros).pipe(
        tap((x: any) => {
          if (x.ok) {
            this.notSitio.emitActualizarHistorialChange();
            this.openSnackBar("Cargo registrado!!", "ok");
          } else {
            this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
          }
          this.dialogRef.close();
        })
      ).toPromise();
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
