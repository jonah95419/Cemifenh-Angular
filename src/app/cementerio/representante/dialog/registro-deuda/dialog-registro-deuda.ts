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

  columnsToDisplay: string[] = ['sitio', 'motivo', 'descripcion', 'cantidad', 'accion'];
  listaDeudas: deudaComprobante[] = [];
  sitios: SitioI[] = [];
  valores: ValorI[] = [];
  motivos: ValorI[] = [];
  anios: string[] = [];

  sitio: SitioI;
  locale: string;
  descripcion: string = "";
  motivo: ValorI;

  cantidad: number;

  constructor(
    private _snackBar: MatSnackBar,
    private apiSitio: SitioService,
    private apiValores: ValoresService,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<DialogRegistroDeuda>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.cargarValores(data.id);
  }

  onNoClick = (): void => this.dialogRef.close();

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe(tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })).toPromise();
  }

  sitioSeleccionado(event: MatSelectChange): void {
    const sitio = event.source.value;
    this.sitio = sitio;
    this.aniosDeudas();
  }

  anioSeleccionado(event: MatSelectChange): void {
    const value = event.source.value;
    if (value) {
      this.cargarMotivos(value);
    }
  }

  agregarDeuda = (): void => {
    let descripcion = "";
    if (this.motivo.motivo === "Otros") {
      if (this.descripcion === "") {
        this.openSnackBar("Faltan campos de llenar", "ok");
        return;
      } else {
        descripcion = this.descripcion;
      }
    } else {
      descripcion = this.motivo.motivo;
    }
    this.listaDeudas.push({
      valor_id: this.motivo.id,
      sitio_id: this.sitio.id,
      cantidad: this.cantidad,
      descripcion,
      motivo: this.sitio.descripcion,
      anio: this.motivo.anio,
    });
    this.cantidad = undefined;
    this.descripcion = "";
    this.table.renderRows();
  }

  eliminarDeuda = (deuda: deudaComprobante): void => {
    this.listaDeudas = this.listaDeudas.filter((d: deudaComprobante) => d !== deuda);
    this.table.renderRows();
  }

  obtenerTotalDeudas = (): number => this.listaDeudas.map((d: deudaComprobante) => d.cantidad).reduce((a, b) => a + b, 0);

  guardarDeudas = (): void => {
    let registros = this.listaDeudas.map((value: deudaComprobante) => {
      let fecha = new Date(this.sitio.adquisicion);
      let desde = value.anio + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate();
      return {
        sitio: value.sitio_id,
        cantidad: value.cantidad,
        descripcion: value.descripcion,
        desde,
        observaciones: ''
      };
    })
    this.apiSitio.agregarDeuda(registros).pipe(
      tap((x: any) => {
        if (x.ok) {
          this.openSnackBar("Cargo registrado!!", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
        }
        this.dialogRef.close();
      })
    ).toPromise();
  }

  private aniosDeudas(): void {
    const anio = new Date(this.sitio.adquisicion).getUTCFullYear();
    this.valores.forEach(v => { if (!this.anios.includes(v.anio) && v.anio && anio <= Number(v.anio)) this.anios.push(v.anio) });
  }

  private cargarMotivos(anio: string): void {
    this.motivos = [];
    this.valores.forEach(v => {
      if (
        v.motivo &&
        v.anio === anio && (
          v.lugar.toLowerCase() === this.sitio.descripcion.toLowerCase() ||
          v.lugar === 'Cementerio')
      ) this.motivos.push(v)
    });
    this.motivos = this.motivos.map((value: ValorI) => {
      if (value.motivo.toLowerCase() === "arriendo" || value.motivo.toLowerCase() === "propio") {
        value.motivo = "Servicio";
      }
      return value;
    })
    this.motivos.push({
      anio: anio,
      estado: true,
      id: 1,
      lugar: '',
      motivo: 'Otros',
      periodo: '',
      valor: ''
    });
  }

  private cargarValores(id: string): void {
    this.cargarSitios(id);
    this.cargarListaValores(id);
  }

  private cargarSitios(id: string): void {
    this.apiSitio.listarSitios(id).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) { this.sitios = data.data; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarListaValores(id: string): void {
    this.apiValores.valores.pipe(
      tap((data: ValorI[]) => this.valores = data)
    ).toPromise();
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}

interface deudaComprobante {
  sitio_id: number;
  valor_id: number;
  motivo: string;
  descripcion: string;
  cantidad: number;
  anio: string;
}
