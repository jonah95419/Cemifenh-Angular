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
  deudas: DeudaSitioI[] = [];
  deudasAuxiliar: DeudaSitioI[] = [];
  listaPagos: deudaComprobante[] = [];
  columnsToDisplay: string[] = ['descripcion', 'cantidad', 'accion'];

  locale: string;
  otros: boolean = false;
  id_valor_extra: number = -1;
  sitio: SitioI;

  pagoForm = this.fb.group({
    deuda: new FormControl(''),
    descripcion: new FormControl(''),
    cantidad: new FormControl('', Validators.min(0)),
  })

  nombre: string = "";
  fecha: Date = new Date();

  constructor(
    private translate: TranslateService,
    private apiSitio: SitioService,
    private apiValores: ValoresService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogPagoExtra>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
      this.cargarSitios(data.id);
      apiValores.valorExtra.pipe( tap( d => this.id_valor_extra = d)).toPromise();
  }

  onNoClick(): void { this.dialogRef.close(); }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe(
      tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
    ).toPromise();
  }

  submit (): void {
    const value = this.pagoForm.value;
    if(this.otros) {
      if(value.descripcion !== "" && value.cantidad) {
        this.listaPagos.push({
          id:this.id_valor_extra,
          descripcion: value.descripcion,
          cantidad: value.cantidad,
          extra: true
        });
        this.table.renderRows();
        this.pagoForm.reset();
      }
    } else {
      if(value.deuda !== null && value.cantidad) {
        this.listaPagos.push({
          id: value.deuda.id,
          descripcion: value.deuda.descripcion + ", " + new Date(value.deuda.desde).getFullYear(),
          cantidad: value.cantidad,
          extra: false
        });
        this.deudasAuxiliar = this.deudasAuxiliar.filter( d => d.id !== value.deuda.id);
        this.table.renderRows();
        this.pagoForm.reset();
      }
    }
  }

  eliminarPago(row: deudaComprobante): void {
    this.listaPagos = this.listaPagos.filter( d => d !== row);
    let nuevo = this.deudas.find( d => d.id === row.id);
    if(nuevo) {
      this.deudasAuxiliar.push(nuevo);
    }
    this.table.renderRows();
  }

  getTotalCost(): number {
    return this.listaPagos?.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);
  }

  sitioSeleccionado(event: MatSelectChange): void {
    const value = event.source.value;
    if(value !== null) {
      this.deudas = [];
      this.deudasAuxiliar = [];
      this.cargarDeudasSitio(value);
    }
  }

  otroPago(event: MatCheckboxChange): void {
    const value = event.checked;
    this.otros = value;
  }

  enviarPago(): void {
    if(this.nombre !== "" && this.fecha !== undefined && this.listaPagos.length !== 0) {
      let registro: any = {};
      registro.nombre = this.nombre;
      registro.fecha = this.fecha;
      registro.total = this.getTotalCost();
      registro.pagos = this.listaPagos;
      registro.sitio = this.sitio.id;
      this.apiSitio.agregarPago(registro)
      .subscribe( data => {
        if(data.ok) {
          this.openSnackBar("Abono registrado!! ", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente ", "ok");
        }
        this.dialogRef.close();
      })
    } else {
      this.openSnackBar("Faltan campos por llenar", "ok");
    }

  }

  private cargarSitios(id: string): void {
    this.apiSitio.listarSitios(id).pipe(
      tap( (data: ResponseSitioI) => {
        if(data.ok) { this.sitios = data.data; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarDeudasSitio(sitio: SitioI): void {
    this.sitio = sitio;
    this.apiSitio.obtenerDeudas(sitio.id).pipe(
      tap((data: ResponseDeudaSitioI) => {
        if(data.ok) {
          this.deudas = data.data;
          this.deudasAuxiliar = this.deudas;
        } else { console.log(data.message);}
      })
    ).toPromise();
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}

interface deudaComprobante {
  id: number;
  descripcion: string;
  cantidad: number;
  extra: boolean;
}
